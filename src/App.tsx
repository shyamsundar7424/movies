import React, { useState, useEffect } from 'react';
import { 
  Play, Star, Heart, Sparkles, Clock, ArrowLeft, Download, MessageSquare, 
  Share2, Crown, ChevronRight, Info, ShieldAlert, Film, X
} from 'lucide-react';
import Navbar from './components/Navbar';
import MovieCard from './components/MovieCard';
import HeroBanner from './components/HeroBanner';
import CustomPlayer from './components/CustomPlayer';
import MascotCorner from './components/MascotCorner';
import AdminPanel from './components/AdminPanel';
import AuthModals from './components/AuthModals';
import { AdsterraBanner } from './components/AdsterraBanner';
import { Movie, User, Review, NotificationItem, Episode } from './types';

export default function App() {
  // State definitions
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string>('');
  const [currentView, setCurrentView] = useState<'home' | 'watchlist' | 'admin' | 'ai'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Catalog active data
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [activePlayerMovie, setActivePlayerMovie] = useState<Movie | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<Episode | undefined>(undefined);
  
  // Users watchlists + history state
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [continueWatching, setContinueWatching] = useState<{ movieId: string; progress: number; episodeNumber?: number }[]>([]);

  // Reviews list for detail view
  const [movieReviews, setMovieReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  // Mascot AI picks state
  const [mascotAIComment, setMascotAIComment] = useState('');
  const [mascotAIMovieIds, setMascotAIMovieIds] = useState<string[]>([]);

  // Modals management
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Voice search helper state
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // System Notifications list
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n-1',
      title: '🍿 WELCOME TO CINEVERSE v2.5',
      message: 'Explore dual-audio anime, HD streaming, and customized suggestions by Koko-Chan!',
      type: 'info',
      createdAt: new Date().toISOString(),
      isRead: false
    },
    {
      id: 'n-2',
      title: '🎮 PRO EXCLUSIVE UNLOCKED',
      message: 'Go Premium today to experience 4K ultra quality and offline download permissions!',
      type: 'info',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isRead: false
    }
  ]);

  // Load movies on boot
  useEffect(() => {
    fetchMoviesCatalog();
    // Load local auth state if available
    const savedUser = localStorage.getItem('cineverse_user');
    const savedToken = localStorage.getItem('cineverse_token');
    if (savedUser && savedToken) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setAuthToken(savedToken);
        fetchUserDetails(savedToken);
      } catch (e) {
        localStorage.removeItem('cineverse_user');
        localStorage.removeItem('cineverse_token');
      }
    }
  }, []);

  const fetchMoviesCatalog = async () => {
    try {
      const res = await fetch('/api/movies');
      if (res.ok) {
        const data = await res.json();
        setMovies(data);
      }
    } catch (e) {
      console.error("Failed to load catalog, using local fallback is okay.");
    }
  };

  const fetchUserDetails = async (token: string) => {
    try {
      const res = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setWatchlistIds(data.user.favorites || []);
        setContinueWatching(data.user.watchlistHistory || []);
      }
    } catch (err) {
      console.warn("User fetch issue description:", err);
    }
  };

  // Auth Handling
  const handleAuthSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    setWatchlistIds(user.favorites || []);
    setContinueWatching(user.watchlistHistory || []);
    localStorage.setItem('cineverse_user', JSON.stringify(user));
    localStorage.setItem('cineverse_token', token);
    
    // Add custom welcome notification
    const hello: NotificationItem = {
      id: 'n-join-' + Date.now(),
      title: '🐱 SENPAI LOGGED IN',
      message: `Welcome back, ${user.username}! Your persistent stream profile is loaded successfully!`,
      type: 'success',
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [hello, ...prev]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken('');
    setWatchlistIds([]);
    setContinueWatching([]);
    localStorage.removeItem('cineverse_user');
    localStorage.removeItem('cineverse_token');
  };

  // Watchlist favorite controls
  const toggleWatchlist = async (movieId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    const isFav = watchlistIds.includes(movieId);
    let updated: string[];
    if (isFav) {
      updated = watchlistIds.filter(id => id !== movieId);
    } else {
      updated = [...watchlistIds, movieId];
    }
    
    setWatchlistIds(updated);

    // Save on backend
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ movieId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.favorites) {
          setWatchlistIds(data.favorites);
        }
      }
    } catch (err) {
      console.warn("Favorite API sync issue, local state is valid", err);
    }
  };

  // Movie Details loader + reviews
  const loadMovieDetails = async (movie: Movie) => {
    setSelectedMovie(movie);
    // Find the lowest season number or fallback to 1
    const movieEpisodes = movie.episodes || [];
    const firstSeason = movieEpisodes.length > 0 
      ? Math.min(...movieEpisodes.map(e => e.seasonNumber || 1)) 
      : 1;
    setSelectedSeason(firstSeason || 1);
    setShowDetailModal(true);
    setMovieReviews([]);
    try {
      const res = await fetch(`/api/movies/${movie.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setMovieReviews(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Write new film review posts
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (!selectedMovie || !newReviewText.trim()) return;

    try {
      const res = await fetch(`/api/movies/${selectedMovie.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          rating: newReviewRating,
          comment: newReviewText
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMovieReviews(prev => [data, ...prev]);
        setNewReviewText('');
        setNewReviewRating(5);
        
        // Refresh cinema rating
        fetchMoviesCatalog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Film streaming triggering
  const startStreaming = (movie: Movie, episode?: Episode) => {
    setShowDetailModal(false);
    setActivePlayerMovie(movie);
    setActiveEpisode(episode);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 80);
  };

  // Direct download files handler (premium rules check)
  const triggerOfflineDownload = (movie: Movie) => {
    if (!currentUser) {
      alert("Downloads Restricted: Guests cannot download CineVerse media offline. Log in or create a CineVerse account now to download unlimited cinematic pieces! 📥");
      setShowAuthModal(true);
      return;
    }

    if (!currentUser.isPremium) {
      alert("Upgrade Needed: Unlimited offline downloading is a Premium CineVerse perk! Activate a premium status to download immediately. ✨👑");
      return;
    }

    // Pro downloading mockup
    const link = document.createElement('a');
    link.href = movie.downloadUrl;
    link.download = movie.title + '.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Sync download analytics on backend
    fetch('/api/movies/' + movie.id + '/download', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    }).catch(() => {});

    alert(`Downloading "${movie.title}" in HD 1080p directly to your device! Enjoy your offline viewing, ${currentUser.username}! 🍿🍿`);
  };

  // Save stream watched statistics
  const updatePlayerProgress = async (prog: number) => {
    if (!activePlayerMovie) return;

    // Trigger local history update
    const alreadyHistory = continueWatching.find(item => item.movieId === activePlayerMovie.id);
    if (!alreadyHistory) {
      setContinueWatching(prev => [...prev, { movieId: activePlayerMovie.id, progress: prog, episodeNumber: activeEpisode?.episodeNumber }]);
    } else {
      setContinueWatching(prev => prev.map(item => item.movieId === activePlayerMovie.id ? { ...item, progress: prog, episodeNumber: activeEpisode?.episodeNumber } : item));
    }

    if (!currentUser) return;

    try {
      await fetch('/api/watch-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          movieId: activePlayerMovie.id,
          progress: prog,
          episodeNumber: activeEpisode?.episodeNumber
        })
      });
    } catch (e) {}
  };

  // Voice Search smart transcript helper mockup
  const handleTriggerVoiceSearch = () => {
    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }

    setIsVoiceListening(true);
    // Auto-generate some smart anime query phrase
    const smartPrompts = [
      "Cute anime movies with dragons",
      "Action blockbusters starring Colin",
      "Trending sci-fi series",
      "Sintel film sequence"
    ];
    const picked = smartPrompts[Math.floor(Math.random() * smartPrompts.length)];

    setTimeout(() => {
      setSearchQuery(picked);
      setIsVoiceListening(false);
      // alert bubble
      const searchAlert: NotificationItem = {
        id: 'n-v-' + Date.now(),
        title: '🎙️ VOICE SPEECH TRANSCRIPTION',
        message: `Recognized audio command: "${picked}"`,
        type: 'info',
        createdAt: new Date().toISOString(),
        isRead: false
      };
      setNotifications(prev => [searchAlert, ...prev]);
    }, 2000);
  };

  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Mascot recommendation loader hook callback
  const handleMascotRecommends = (ids: string[], comment: string) => {
    setMascotAIMovieIds(ids);
    setMascotAIComment(comment);
    setCurrentView('ai');
    
    // Auto scroll down to AI section
    setTimeout(() => {
      document.getElementById('ai-recs-shelf')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Filter Catalog logic
  const filteredCatalog = movies.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.director.toLowerCase().includes(q) ||
      m.genre.some(g => g.toLowerCase().includes(q)) ||
      m.category.toLowerCase().includes(q)
    );
  });

  // Hot Trend Slider (usually index 0)
  const trendingHeroMovie = movies.find(m => m.isTrending) || movies[0];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      
      {/* Visual background lights */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-[#E50914]/10 to-transparent rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-bl from-[#00E5FF]/8 to-transparent rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-purple-900/10 to-transparent rounded-full blur-[100px] pointer-events-none"></div>

      {/* Navigation Top Bar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        onNavigate={(v) => setCurrentView(v)}
        currentView={currentView}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onTriggerVoiceSearch={handleTriggerVoiceSearch}
        isVoiceListening={isVoiceListening}
      />

      {/* Primary Streaming Canvas (Widescreen or normal views) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* ACTIVE MOVIE THEATRE PLAYER MODE */}
        {activePlayerMovie && (
          <div className="space-y-4 animate-scale-up border-b border-gray-800 pb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono font-bold text-[#00E5FF] uppercase tracking-widest flex items-center space-x-1">
                <span>Now Playing inside CineVerse Live</span>
              </h2>
              <button
                onClick={() => { updatePlayerProgress(100); setActivePlayerMovie(null); }}
                className="text-xs text-red-500 hover:text-white underline font-mono cursor-pointer"
              >
                Close Theatre Mode
              </button>
            </div>
            
            <CustomPlayer
              movie={activePlayerMovie}
              activeEpisode={activeEpisode}
              isLoggedIn={!!currentUser}
              onExit={() => { updatePlayerProgress(45); setActivePlayerMovie(null); }}
              onRegisterDownload={() => triggerOfflineDownload(activePlayerMovie)}
              onNeedAuth={() => { setShowAuthModal(true); }}
              onFinished={(prog) => updatePlayerProgress(prog)}
              onNextEpisode={() => {
                if (activeEpisode && activePlayerMovie.episodes) {
                  const currIdx = activePlayerMovie.episodes.findIndex(e => e.id === activeEpisode.id);
                  if (currIdx !== -1 && currIdx + 1 < activePlayerMovie.episodes.length) {
                    setActiveEpisode(activePlayerMovie.episodes[currIdx + 1]);
                  } else {
                    alert("Finished ultimate episode of the stream!");
                  }
                }
              }}
            />

            <AdsterraBanner placement="player" />
          </div>
        )}

        {/* BROWSE VIEW SCREEN */}
        {currentView === 'home' && (
          <div className="space-y-10 animate-fade-in">
            {/* 1. Hero Promo Headline Banner */}
            {trendingHeroMovie && !searchQuery.trim() && (
              <HeroBanner
                movie={trendingHeroMovie}
                onPlay={(m) => startStreaming(m)}
                onToggleWatchlist={() => toggleWatchlist(trendingHeroMovie.id)}
                isInWatchlist={watchlistIds.includes(trendingHeroMovie.id)}
              />
            )}

            {/* 2. Interactive AI Mascot Corner panel */}
            <MascotCorner 
              onMascotRecommendMovies={handleMascotRecommends} 
              moviesCatalog={movies} 
            />

            {/* Premium Ad Placement */}
            <AdsterraBanner placement="home" />

            {/* 3. Continue watching state row */}
            {continueWatching.length > 0 && !searchQuery.trim() && (
              <div className="space-y-4">
                <h2 className="text-md font-black tracking-wide uppercase text-white flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span>Resume Streaming Activity</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {continueWatching.map((hist) => {
                    const movObj = movies.find(m => m.id === hist.movieId);
                    if (!movObj) return null;
                    return (
                      <div 
                        key={hist.movieId} 
                        className="frosted-glass rounded-2xl overflow-hidden hover:bg-white/10 hover:border-[#00E5FF]/40 transition-all p-3 flex space-x-3 items-center group cursor-pointer shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
                        onClick={() => startStreaming(movObj)}
                      >
                        <img 
                          src={movObj.thumbnail} 
                          alt="" 
                          className="w-16 h-10 object-cover rounded" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-yellow-400 transition-colors">{movObj.title}</h4>
                          <p className="text-[9px] text-gray-500 font-mono mt-0.5">Progress {hist.progress}%</p>
                          {/* visual progress bar */}
                          <div className="w-full bg-gray-800 h-1 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-yellow-400 h-1" style={{ width: `${hist.progress}%` }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Video Grid shelves */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h2 className="text-base font-black uppercase text-white tracking-wider flex items-center space-x-2">
                  <Film className="w-5 h-5 text-[#00E5FF]" />
                  <span>{searchQuery.trim() ? `Search Results: ${filteredCatalog.length} Matches` : 'Trending Spotlight Releases'}</span>
                </h2>
                <span className="text-[10px] text-gray-500 font-mono">Catalog Count: {filteredCatalog.length}</span>
              </div>

              {filteredCatalog.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs font-mono">
                  No direct CineVerse titles match "{searchQuery}". Ask Koko-Chan to help you search!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredCatalog.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onSelect={(m) => loadMovieDetails(m)}
                      onQuickToggleWatchlist={(mid, ev) => { toggleWatchlist(mid, ev); }}
                      isInWatchlist={watchlistIds.includes(movie.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 4. Dedicated Anime Segment */}
            {!searchQuery.trim() && (
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h2 className="text-base font-black uppercase text-white tracking-wider flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-450/10 animate-pulse" />
                    <span>Crunchy Anime Choice Vault</span>
                  </h2>
                  <span className="text-xs text-[#00E5FF] font-semibold tracking-wider font-mono uppercase">Otaku-Exclusive</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {movies.filter(m => m.category === 'anime').map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onSelect={(m) => loadMovieDetails(m)}
                      onQuickToggleWatchlist={(mid, ev) => { toggleWatchlist(mid, ev); }}
                      isInWatchlist={watchlistIds.includes(movie.id)}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* PERSISTENT WATCHLIST FAVORITES VIEW */}
        {currentView === 'watchlist' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="text-base font-black uppercase text-white tracking-wider flex items-center space-x-2">
                <Heart className="w-5 h-5 text-[#E50914] fill-[#E50914]" />
                <span>My Stream Watchlist ({watchlistIds.length} titles)</span>
              </h2>
              <button 
                onClick={() => setCurrentView('home')} 
                className="text-xs text-gray-400 hover:text-white underline font-mono"
              >
                Back to catalog
              </button>
            </div>

            {watchlistIds.length === 0 ? (
              <div className="py-20 text-center text-gray-500 text-xs font-mono bg-gray-900/45 rounded-2xl border border-gray-800/80">
                <p>Your CineVerse watchlist is empty right now, Senpai.</p>
                <button
                  onClick={() => setCurrentView('home')}
                  className="mt-4 px-4 py-1.5 rounded-full bg-[#00E5FF] text-black font-extrabold uppercase text-[10px] tracking-wide cursor-pointer"
                >
                  Browse Movies
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {movies.filter(m => watchlistIds.includes(m.id)).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelect={(m) => loadMovieDetails(m)}
                    onQuickToggleWatchlist={(mid, ev) => { toggleWatchlist(mid, ev); }}
                    isInWatchlist={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI GEN PICKS SHELF TAB */}
        {currentView === 'ai' && (
          <div id="ai-recs-shelf" className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="text-base font-black uppercase text-white tracking-wider flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#00E5FF]" />
                <span>AI Personalized Recommend Hub</span>
              </h2>
              <button 
                onClick={() => setCurrentView('home')} 
                className="text-xs text-gray-400 hover:text-white underline font-mono"
              >
                Back to catalogue
              </button>
            </div>

            <MascotCorner 
              onMascotRecommendMovies={handleMascotRecommends} 
              moviesCatalog={movies} 
            />

            {mascotAIMovieIds.length > 0 && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121212] via-cyan-950/10 to-transparent border border-cyan-500/20 space-y-4">
                <div className="p-3 bg-cyan-900/10 rounded-xl border border-cyan-500/10 text-xs text-[#00E5FF] leading-relaxed">
                  <p className="font-semibold uppercase tracking-wider font-mono mb-1">Mascot Curator Commentary:</p>
                  <p>"{mascotAIComment}"</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
                  {movies.filter(m => mascotAIMovieIds.includes(m.id)).map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onSelect={(m) => loadMovieDetails(m)}
                      onQuickToggleWatchlist={(mid, ev) => { toggleWatchlist(mid, ev); }}
                      isInWatchlist={watchlistIds.includes(movie.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {mascotAIMovieIds.length === 0 && (
              <div className="py-12 text-center text-gray-500 text-xs font-mono bg-gray-900/40 rounded-2xl border border-gray-800">
                Choose a mascot and click "Get AI Recommendation" inside the Copilot above!
              </div>
            )}
          </div>
        )}

        {/* ADMIN SECURITY TAB VIEW */}
        {currentView === 'admin' && currentUser?.role === 'admin' && (
          <div className="animate-fade-in">
            <AdminPanel
              authToken={authToken}
              onRefreshCatalog={fetchMoviesCatalog}
              moviesList={movies}
            />
          </div>
        )}

        {/* Bottom Page Ad Area */}
        <AdsterraBanner placement="footer" />

      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-transparent border-t border-white/5 py-10 mt-16 text-center text-xs text-gray-500 font-mono select-none">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <p className="font-bold tracking-widest text-[#E50914] bg-gradient-to-r from-[#E50914] to-[#00E5FF] bg-clip-text text-transparent uppercase">CINEVERSE STREAM ENGINE</p>
          <p className="max-w-md mx-auto text-gray-600 leading-relaxed font-sans text-[11px]">
            Sleek anime visuals, custom integrated video player tracks, secure authorization nodes, and AI-powered popcorn curators. Modeled perfectly for entertainment senpais in 2026.
          </p>
          <div className="flex justify-center space-x-4 text-[10px] text-gray-500">
            <span>Client v2.5</span>
            <span>•</span>
            <span>Server CJS</span>
            <span>•</span>
            <span>React App</span>
          </div>
        </div>
      </footer>

      {/* DETAIL MODAL OVERLAY SHEET */}
      {showDetailModal && selectedMovie && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto scrollbar-thin">
          <div className="frosted-glass-premium border border-white/10 rounded-3xl max-w-2xl w-full overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.85)] relative animate-scale-up my-8 text-xs font-sans">
            
            {/* Close */}
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-black/60 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner Wide Backdrop */}
            <div className="relative aspect-[16/7] w-full overflow-hidden bg-black">
              <img
                src={selectedMovie.bannerImage}
                alt=""
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/95 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                <div>
                  <span className="bg-[#00E5FF] text-black text-[9px] px-2 py-0.5 rounded font-mono font-black uppercase tracking-wider mb-1 inline-block">
                    {selectedMovie.category}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                    {selectedMovie.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Detail Layout */}
            <div className="p-5 md:p-6 space-y-6">
              
              {/* Action grid (Play, Download) */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => startStreaming(selectedMovie)}
                  className="px-5 py-2 rounded-full bg-[#E50914] hover:bg-red-700 text-white font-bold uppercase tracking-wide flex items-center space-x-1.5 cursor-pointer scale-102 hover:scale-105 active:scale-95 transition-all text-[11px]"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Main Stream</span>
                </button>

                {selectedMovie.trailerUrl && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      const trailerMovie: Movie = {
                        ...selectedMovie,
                        title: `${selectedMovie.title} (Official Trailer Preview)`,
                        streamingUrl: selectedMovie.trailerUrl,
                        episodes: []
                      };
                      setActivePlayerMovie(trailerMovie);
                      setActiveEpisode(undefined);
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 80);
                    }}
                    className="px-4 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 font-bold uppercase tracking-wide flex items-center space-x-1.5 cursor-pointer text-[10px] transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>Watch Trailer Preview</span>
                  </button>
                )}

                <button
                  onClick={() => triggerOfflineDownload(selectedMovie)}
                  className="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold uppercase tracking-wide flex items-center space-x-1 cursor-pointer text-[10px]"
                >
                  <Download className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Download Offline MP4</span>
                </button>

                <button
                  onClick={() => toggleWatchlist(selectedMovie.id)}
                  className={`px-4 py-2 rounded-full border text-[10px] font-semibold uppercase tracking-wide cursor-pointer transition-colors ${
                    watchlistIds.includes(selectedMovie.id) 
                      ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]' 
                      : 'bg-black/40 border-gray-700 hover:border-white text-gray-300'
                  }`}
                >
                  {watchlistIds.includes(selectedMovie.id) ? '★ Watchlist Member' : '+ Add List'}
                </button>
              </div>

              {/* Grid content specs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Specs Col left */}
                <div className="md:col-span-2 space-y-4">
                  <p className="text-gray-300 leading-relaxed text-xs">
                    {selectedMovie.description}
                  </p>

                  {/* Episodes block (if any exists) */}
                  {selectedMovie.episodes && selectedMovie.episodes.length > 0 && (() => {
                    const uniqueSeasons = Array.from(new Set<number>(selectedMovie.episodes.map(ep => ep.seasonNumber || 1))).sort((a, b) => a - b);
                    const filteredEpisodes = selectedMovie.episodes.filter(ep => (ep.seasonNumber || 1) === selectedSeason);
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-2">
                          <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Episodes Sequence</h4>
                          
                          {/* Season Quick Tabs Selector */}
                          {uniqueSeasons.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {uniqueSeasons.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => setSelectedSeason(s)}
                                  className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase transition-all tracking-wider ${
                                    selectedSeason === s
                                      ? 'bg-[#00E5FF] text-black shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                                      : 'bg-white/5 text-gray-400 hover:text-white border border-white/5 hover:bg-white/10'
                                  }`}
                                >
                                  Season {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {filteredEpisodes.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto scrollbar-thin">
                            {filteredEpisodes.map((ep) => (
                              <div 
                                key={ep.id}
                                className="bg-white/5 hover:bg-white/12 border border-white/8 rounded-lg p-2.5 flex items-center justify-between group cursor-pointer transition-all hover:scale-[1.01]"
                                onClick={() => startStreaming(selectedMovie, ep)}
                              >
                                <div className="truncate pr-2">
                                  <p className="truncate font-semibold text-gray-200 group-hover:text-[#00E5FF] transition-colors text-xs">
                                    Ep {ep.episodeNumber}. {ep.title}
                                  </p>
                                  {ep.seasonNumber && (
                                    <span className="text-[9px] text-[#00E5FF]/60 font-mono">Season {ep.seasonNumber}</span>
                                  )}
                                </div>
                                <span className="shrink-0 text-[9px] text-gray-500 font-mono bg-black/30 px-1.5 py-0.5 rounded">{ep.duration}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">No episodes uploaded for Season {selectedSeason} yet.</p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Specs metadata Col right */}
                <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10 font-mono text-[10px] backdrop-blur-md">
                  <div>
                    <span className="text-gray-500">Director:</span>{' '}
                    <span className="text-gray-300 leading-tight">{selectedMovie.director}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>{' '}
                    <span className="text-gray-300 font-bold">{selectedMovie.duration}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Audio Track:</span>{' '}
                    <span className="text-[#00E5FF]">{selectedMovie.language}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Released:</span>{' '}
                    <span className="text-gray-300">{selectedMovie.releaseDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Rating Index:</span>{' '}
                    <span className="text-yellow-400 font-semibold font-sans text-xs">★ {selectedMovie.rating.toFixed(1)} IMDB</span>
                  </div>
                  <div className="max-w-xs truncate">
                    <span className="text-gray-500">Cast details:</span>{' '}
                    <p className="text-gray-350 truncate mt-0.5 font-sans leading-tight">{selectedMovie.cast.join(', ')}</p>
                  </div>
                </div>

              </div>

              {/* REVIEWS DISPATCH AREA */}
              <div className="space-y-4 border-t border-white/10 pt-5">
                <h4 className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                  Watcher Reviews ({movieReviews.length})
                </h4>

                {/* Write Reviews Form */}
                <form onSubmit={handleAddReview} className="flex flex-col space-y-2.5">
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-gray-400 font-mono text-[10px] uppercase">My rating score:</span>
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(parseInt(e.target.value))}
                      className="bg-white/5 border border-white/10 text-yellow-500 font-bold rounded px-2.5 py-1 focus:outline-none"
                    >
                      {[5,4,3,2,1].map(sc => (
                        <option key={sc} value={sc}>★ {sc} Stars</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder={currentUser ? "Write a review (e.g. CineVerse is amazing!)" : "Log in to post reviews!"}
                      disabled={!currentUser}
                      required
                      className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]/40 backdrop-blur-md"
                    />
                    <button
                      type="submit"
                      disabled={!currentUser}
                      className="px-4 py-1.5 bg-[#00E5FF] text-black font-extrabold uppercase text-[10px] rounded-full hover:shadow-[0_0_8px_#00E5FF] transition-all cursor-pointer"
                    >
                      Post Score
                    </button>
                  </div>
                </form>

                {/* Reviews List */}
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin divide-y divide-white/5">
                  {movieReviews.length === 0 ? (
                    <p className="text-[10px] text-gray-500 font-sans italic py-1">No reviews cataloged yet. Be the first watcher to rank this stream, Senpai!</p>
                  ) : (
                    movieReviews.map((rev) => (
                      <div key={rev.id} className="pt-2 pb-1.5 text-xs">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-gray-300 font-mono">{rev.username}</span>
                          <span className="text-yellow-400 font-bold">★ {rev.rating}</span>
                        </div>
                        <p className="text-gray-400 font-sans mt-0.5 leading-tight">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* SECURE REGISTER/LOGIN PORTAL MODALS */}
      {showAuthModal && (
        <AuthModals
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

    </div>
  );
}

// Global Custom Simple Icons (since Lucide can differ)
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
