import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, 
  Settings, Languages, HelpCircle, MonitorDot, Cast, Clock, SkipForward, ArrowLeft, Crown
} from 'lucide-react';
import { Movie, Episode } from '../types';

interface CustomPlayerProps {
  movie: Movie;
  activeEpisode?: Episode;
  isLoggedIn: boolean;
  onExit: () => void;
  onRegisterDownload: () => void;
  onFinished: (progress: number) => void;
  onNeedAuth: () => void;
  onNextEpisode?: () => void;
}

// Simulated Subtitle database
const SUBTITLE_TIMINGS = [
  { start: 2, end: 5, text: "[Sintel is searching for scales during twilight...]" },
  { start: 6, end: 10, text: "Sintel: \"Scales! Where did you crawl off to this time?\"" },
  { start: 11, end: 16, text: "[Soft mystical music swells as wind starts blowing]" },
  { start: 17, end: 22, text: "Sintel: \"Senshi-sama told me dragons always return home...\"" },
  { start: 23, end: 28, text: "Shaman: \"The seeker wishes to view the stars inside the fire.\"" },
  { start: 29, end: 35, text: "Sintel: \"Please help me! He's just a baby dragon!\"" },
  { start: 36, end: 41, text: "[A roar echoes from the top of the snowy pass...]" },
  { start: 42, end: 48, text: "[Sintel looks up with determination and ties her scarf]" },
  { start: 49, end: 55, text: "Sintel: \"No matter how long it takes, I will find you.\"" },
  { start: 56, end: 100, text: "[Triumphant anime theme plays - Directed by Colin Levy]" }
];

const SUBTITLE_LAN_MAP: Record<string, Record<number, string>> = {
  English: {},
  Japanese: {
    2: "[シンテルが夕暮れ時にスケールを探している...]",
    6: "シンテル：「スケール！今度はどこへ行ってしまったの？」",
    11: "[風が吹き始めると、ソフトで神秘的な音楽が高まる]",
    17: "シンテル：「センシ様は、ドラゴンは必ず家に帰ると言っていた...」",
    23: "シャーマン：「探求者は火の中に星を見たいと願っている。」",
    29: "シンテル：「助けてください！ 彼はまだ赤ちゃんの竜なんです！」",
    36: "[雪に覆われた峠から咆哮が響き渡る...]",
    42: "[シンテルは決意を胸に見上げ、スカーフを結ぶ]",
    49: "シンテル：「どんなに時間がかかっても、必ず君を見つけ出す。」",
    56: "[意気揚々としたアニメのテーマが流れる - 監督: コリン・レヴィ]"
  },
  Spanish: {
    2: "[Sintel está buscando a Scales durante el atardecer...]" ,
    6: "Sintel: \"¡Scales! ¿A dónde te has metido esta vez?\"",
    11: "[La música mística resuena intensamente con el viento]",
    17: "Sintel: \"Senshi-sama me dijo que los dragones siempre regresan...\"",
    23: "Chamán: \"La buscadora desea contemplar las estrellas del fuego.\"",
    29: "Sintel: \"¡Por favor, ayúdame! ¡Es solo un pequeño dragón bebé!\"",
    36: "[Un rugido salvaje retumba sobre la montaña helada...]",
    42: "[Sintel mira con valor y se amarra la bufanda protectora]",
    49: "Sintel: \"No importa cuántas dificultades enfrente, te encontraré.\"",
    56: "[Reproduciendo el himno épico de CineVerse - Colin Levy]"
  }
};

export default function CustomPlayer({
  movie,
  activeEpisode,
  isLoggedIn,
  onExit,
  onRegisterDownload,
  onFinished,
  onNeedAuth,
  onNextEpisode
}: CustomPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscr, setIsFullscr] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [selectedSpeed, setSelectedSpeed] = useState(1);
  const [selectedAudio, setSelectedAudio] = useState('Japanese (Dual Dub)');
  const [selectedSubtitle, setSelectedSubtitle] = useState('English');
  const [showSettings, setShowSettings] = useState(false);

  // Guest playback state (5 mins max = 300 seconds)
  const [guestTimeLeft, setGuestTimeLeft] = useState(300);
  const [showGuestBanner, setShowGuestBanner] = useState(false);
  const [isGuestLocked, setIsGuestLocked] = useState(false);

  // Chromecast simulation state
  const [showCastMenu, setShowCastMenu] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [castDevice, setCastDevice] = useState('');
  const [castMessage, setCastMessage] = useState('');

  // Auto next transition countdown state
  const [nextCountdown, setNextCountdown] = useState(-1);

  // Current Subtitle String
  const [currentSubText, setCurrentSubText] = useState('');

  const streamSrc = activeEpisode ? activeEpisode.streamingUrl : movie.streamingUrl;

  // Identify YouTube link
  const getYoutubeId = (url: string): string | null => {
    if (!url) return null;
    
    let target = url.trim();
    
    // 1. If it's a raw iframe markup block, extract the src URL
    if (target.includes('<iframe') && target.includes('src=')) {
      const matchSrc = target.match(/src="([^"]+)"/) || target.match(/src='([^']+)'/);
      if (matchSrc) {
        target = matchSrc[1];
      }
    }

    // 2. Regex for various standard patterns: watch?v=, Shorts, Embeds, Shared links
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = target.match(regExp);
    if (match && match[1]) {
      return match[1];
    }
    
    // 3. Fallback: if we just have a raw 11 character string as code
    if (target.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(target)) {
      return target;
    }
    
    return null;
  };

  const ytId = getYoutubeId(streamSrc);

  // Guest clock ticker
  useEffect(() => {
    if (isLoggedIn) {
      setIsGuestLocked(false);
      setShowGuestBanner(false);
      return;
    }

    if (isPlaying && !isGuestLocked) {
      const interval = setInterval(() => {
        setGuestTimeLeft(prev => {
          if (prev <= 1) {
            setIsGuestLocked(true);
            setIsPlaying(false);
            if (videoRef.current) videoRef.current.pause();
            return 0;
          }
          if (prev <= 30) {
            setShowGuestBanner(true);
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, isLoggedIn, isGuestLocked]);

  // Update current slide caption based on timing
  useEffect(() => {
    if (selectedSubtitle === 'Off') {
      setCurrentSubText('');
      return;
    }

    const t = Math.floor(currentTime);
    const textEntry = SUBTITLE_TIMINGS.find(entry => t >= entry.start && t <= entry.end);
    
    if (textEntry) {
      // Check if we have translated text for other languages
      if (selectedSubtitle !== 'English' && SUBTITLE_LAN_MAP[selectedSubtitle]?.[textEntry.start]) {
        setCurrentSubText(SUBTITLE_LAN_MAP[selectedSubtitle][textEntry.start]);
      } else {
        setCurrentSubText(textEntry.text);
      }
    } else {
      setCurrentSubText('');
    }
  }, [currentTime, selectedSubtitle]);

  // Handle Play / Pause
  const togglePlay = () => {
    if (isGuestLocked) {
      onNeedAuth();
      return;
    }

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.log("Player play promise issue:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Skip forward 10 seconds
  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
    }
  };

  // Rewind 10 seconds
  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  // Handle timeline slider change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Handle vol slider change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (videoRef.current) {
      const state = !isMuted;
      setIsMuted(state);
      videoRef.current.muted = state;
    }
  };

  // Speed controls
  const handleSpeed=(speed: number)=>{
    setSelectedSpeed(speed);
    if(videoRef.current){
      videoRef.current.playbackRate = speed;
    }
    setShowSettings(false);
  };

  // Double Click / Fullscreen controls
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscr) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscr(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscr(false);
    }
  };

  // Auto Next transition loader (Episode ending)
  const handleVideoEnded = () => {
    setIsPlaying(false);
    onFinished(100);

    // If series and has next episode callback
    if (onNextEpisode) {
      setNextCountdown(5);
    }
  };

  // Next countdown tick
  useEffect(() => {
    if (nextCountdown > 0) {
      const timer = setTimeout(() => {
        setNextCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (nextCountdown === 0) {
      // Trigger Play Next
      setNextCountdown(-1);
      if (onNextEpisode) onNextEpisode();
    }
  }, [nextCountdown, onNextEpisode]);

  // Picture in Picture
  const togglePictureInPicture = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn("PiP not supported or failed:", err);
    }
  };

  // Chromecast connecting simulation
  const triggerCast = (device: string) => {
    setCastDevice(device);
    setCastMessage('Connecting to ' + device + ' via CineVerse-Cast protocol...');
    setTimeout(() => {
      setIsCasting(true);
      setCastMessage('Casting successfully to ' + device);
      // alert styling
      setTimeout(() => {
        setCastMessage('');
        setShowCastMenu(false);
      }, 2500);
    }, 1500);
  };

  const formattedTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div 
      id="custom-cinema-player"
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_12px_44px_rgba(0,0,0,0.9)] select-none group"
    >
      
      {/* Video element or Youtube element */}
      {ytId ? (
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&controls=1&modestbranding=0&rel=0`}
          className="w-full h-full object-contain border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={movie.title}
        />
      ) : (
        <video
          ref={videoRef}
          src={streamSrc}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          onTimeUpdate={(e) => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onDurationChange={(e) => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
            }
          }}
          onEnded={handleVideoEnded}
          playsInline
        />
      )}

      {/* Head Back navigation bar */}
      <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between transition-opacity duration-300 z-20 ${
        ytId ? 'opacity-100' : 'opacity-100 md:opacity-0 group-hover:opacity-100'
      }`}>
        <button
          onClick={onExit}
          className="flex items-center space-x-2 text-white bg-white/5 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 hover:border-[#00E5FF]/40 hover:text-[#00E5FF] transition-all cursor-pointer text-xs uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Player</span>
        </button>

        <div className="flex items-center space-x-3 text-right">
          <p className="text-white text-xs font-bold drop-shadow-md">
            {movie.title} {activeEpisode ? ` - Episode ${activeEpisode.episodeNumber}: ${activeEpisode.title}` : ''}
          </p>
          <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40">
            {selectedQuality} • {selectedAudio}
          </span>
        </div>
      </div>

      {/* GUEST MODE LOCK CONTROLS */}
      {isGuestLocked && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6 z-40 animate-fade-in">
          <Crown className="w-16 h-16 text-[#00E5FF] drop-shadow-[0_0_15px_#00E5FF] animate-bounce" />
          <h2 className="text-xl md:text-2xl font-black mt-4 text-white uppercase tracking-wider">
            Continue watching with Koko-Chan?
          </h2>
          <p className="text-xs md:text-sm text-gray-300 max-w-md mt-2 leading-relaxed">
            Guests can preview playback for up to 5 minutes! Complete or log in to a CineVerse account now to unlock unlimited HD/4K streams, custom dubs, and download features!
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <button
              onClick={onNeedAuth}
              className="px-6 py-2.5 rounded-full text-xs font-black bg-gradient-to-r from-[#E50914] to-[#00E5FF] text-white hover:shadow-[0_0_20px_#00E5FF] transition-all uppercase tracking-wide cursor-pointer scale-105"
            >
              Log In / Register Now
            </button>
            <button
              onClick={onExit}
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-all uppercase"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      )}

      {/* Guest Ticker Warning Banner */}
      {showGuestBanner && !isGuestLocked && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-yellow-500/80 backdrop-blur-md border border-yellow-400/50 text-black px-4 py-1.5 rounded-full flex items-center space-x-2 text-xs font-semibold z-20 shadow-[0_4px_15px_rgba(0,0,0,0.5)] animate-pulse">
          <Clock className="w-4 h-4" />
          <span>Guest Limit Warning: {guestTimeLeft} seconds left of stream!</span>
        </div>
      )}

      {/* Auto Next episode countdown pop */}
      {nextCountdown > 0 && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-30">
          <p className="text-sm tracking-wider font-mono uppercase text-gray-400 mb-1">Coming Up Next</p>
          <h3 className="text-lg md:text-xl font-bold mb-4">{movie.title}</h3>
          
          <div className="w-16 h-16 rounded-full border-4 border-[#00E5FF]/20 border-t-[#00E5FF] animate-spin flex items-center justify-center">
            <span className="text-lg font-black font-mono text-[#00E5FF]">{nextCountdown}</span>
          </div>

          <button
            onClick={() => {
              setNextCountdown(-1);
              if (onNextEpisode) onNextEpisode();
            }}
            className="mt-6 px-4 py-1.5 bg-white text-black font-bold text-xs rounded-full uppercase hover:scale-105 active:scale-95 transition-all flex items-center space-x-1"
          >
            <SkipForward className="w-3.5 h-3.5 fill-black" />
            <span>Skip Timer</span>
          </button>
        </div>
      )}

      {/* Subtitle Overlays (Positioned near the bottom) */}
      {currentSubText && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-1.5 rounded-lg border border-white/8 backdrop-blur-md text-center max-w-[85%] z-20 pointer-events-none">
          <p className="text-sm md:text-base font-medium font-sans text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] tracking-wide">
            {currentSubText}
          </p>
        </div>
      )}

      {/* Chromecast simulation drawer */}
      {showCastMenu && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center text-center p-4 z-40">
          <Cast className="w-12 h-12 text-[#00E5FF] drop-shadow-[0_0_8px_#00E5FF] animate-pulse" />
          <h3 className="text-md font-bold mt-2 text-white">Chromecast Connection</h3>
          <p className="text-xs text-gray-400 max-w-xs mb-4">Choose a device stream to cast \"{movie.title}\"</p>
          
          <div className="flex flex-col space-y-2 w-64">
            {['Living Room TV (Neko-Cast)', 'Bedroom Box (Crunchy-Cast)', 'Cine-Pad Pro Max'].map((device) => (
              <button
                key={device}
                onClick={() => triggerCast(device)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-[#00E5FF]/40 rounded-lg text-xs text-left text-white font-medium transition-colors cursor-pointer"
              >
                {device}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCastMenu(false)}
            className="mt-4 text-xs text-gray-500 hover:text-white underline cursor-pointer"
          >
            Cancel Casting
          </button>
        </div>
      )}

      {/* Floating Casting alert overlay */}
      {castMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-indigo-900 border border-indigo-700 text-white px-4 py-1.5 rounded-full flex items-center space-x-2 text-xs font-mono z-35 shadow-xl animate-bounce">
          <Cast className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>{castMessage}</span>
        </div>
      )}

      {/* Custom Controls Bar (Bottom strip) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        {ytId ? (
          <div className="flex items-center justify-between text-xs font-mono select-none">
            <span className="text-[10px] bg-red-600/20 text-[#00E5FF] border border-red-500/30 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
              YouTube Source Node Active
            </span>
            <span className="text-[10px] text-gray-400 italic">
              Please use YouTube's native bottom corner player controls
            </span>
          </div>
        ) : (
          <>
            {/* Timeline Slider with numeric clocks */}
            <div className="flex items-center space-x-3 w-full mb-3">
              <span className="text-[10px] font-mono text-gray-400">{formattedTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleTimeChange}
                className="flex-1 accent-[#00E5FF] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-gray-400">{formattedTime(duration)}</span>
            </div>

            {/* Action controls flex layout */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              
              {/* Play, Rewind, Forward, Vol strip */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded-full text-white hover:text-[#00E5FF] hover:bg-white/10 active:scale-95 transition-all cursor-pointer bg-white/5 border border-white/8"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                </button>

                <button
                  onClick={skipBackward}
                  className="text-gray-400 hover:text-white cursor-pointer"
                  title="Rewind 10s"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Volume */}
                <div className="flex items-center space-x-2 bg-white/5 border border-white/8 rounded-full px-2.5 py-0.5">
                  <button onClick={toggleMute} className="text-gray-400 hover:text-white cursor-pointer">
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 accent-[#00E5FF] h-1 bg-gray-700 rounded-full cursor-pointer"
                  />
                </div>

                {/* Chromecast button trigger */}
                <button
                  onClick={() => setShowCastMenu(true)}
                  className="p-1 text-gray-400 hover:text-[#00E5FF] transition-colors cursor-pointer"
                  title="Cast to TV"
                >
                  <Cast className="w-4 h-4" />
                </button>

                {/* PiP button */}
                <button
                  onClick={togglePictureInPicture}
                  className="p-1 text-gray-400 hover:text-[#00E5FF] transition-colors cursor-pointer hidden sm:block"
                  title="Picture in Picture Mode"
                >
                  <MonitorDot className="w-4 h-4" />
                </button>
              </div>

              {/* Subtitles, Audio track speed toggler */}
              <div className="flex items-center space-x-4">
                
                {/* Audio Language button toggler selection */}
                <div className="flex items-center space-x-1 text-xs">
                  <Languages className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <select
                    value={selectedAudio}
                    onChange={(e) => setSelectedAudio(e.target.value)}
                    className="bg-black/60 text-gray-300 text-[10px] font-mono border border-white/8 rounded p-1 outline-none backdrop-blur-md cursor-pointer"
                  >
                    <option value="Japanese (Dual Dub)">JP (Org)</option>
                    <option value="English (Stereo HD)">EN Dub</option>
                    <option value="Spanish (Castilian)">ES Dub</option>
                  </select>
                </div>

                {/* Subtitle selection selector block */}
                <div className="flex items-center space-x-1 text-xs">
                  <span className="text-[10px] font-mono font-bold text-[#00E5FF] uppercase">CC:</span>
                  <select
                    value={selectedSubtitle}
                    onChange={(e) => setSelectedSubtitle(e.target.value)}
                    className="bg-black/60 text-gray-300 text-[10px] font-mono border border-white/8 rounded p-1 outline-none backdrop-blur-md cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Off">Subtitles Off</option>
                  </select>
                </div>

                {/* Speeds list */}
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Controls Speeds"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  {showSettings && (
                    <div className="absolute right-12 bottom-12 frosted-glass border border-white/10 p-2.5 rounded-lg flex flex-col space-y-1.5 z-40 text-[10px] font-mono">
                      <p className="text-gray-500 uppercase border-b border-white/5 pb-1 mb-1 font-bold">Speed rates</p>
                      {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSpeed(s)}
                          className={`text-left px-2 py-1 rounded hover:bg-[#00E5FF]/20 ${selectedSpeed === s ? 'text-[#00E5FF] font-bold' : 'text-gray-300'}`}
                        >
                          {s}x {s === 1 ? '(Normal)' : ''}
                        </button>
                      ))}
                      
                      <p className="text-gray-500 uppercase border-b border-white/5 pt-1.5 pb-1 mb-1 font-bold">Res Quality</p>
                      {['360p', '480p', '720p', '1080p', '4K'].map((q) => (
                        <button
                          key={q}
                          onClick={() => { setSelectedQuality(q); setShowSettings(false); }}
                          className={`text-left px-2 py-1 rounded hover:bg-[#00E5FF]/20 ${selectedQuality === q ? 'text-[#00E5FF] font-bold' : 'text-gray-300'}`}
                        >
                          {q} {q === '4K' ? '👑' : ''}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Maximize */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Fullscreen"
                >
                  {isFullscr ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>

            </div>
          </>
        )}
      </div>

    </div>
  );
}
