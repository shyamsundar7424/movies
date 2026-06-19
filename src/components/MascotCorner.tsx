import React, { useState, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Heart, RefreshCw, HelpCircle, X } from 'lucide-react';
import { ANIME_MASCOTS } from '../data/movies';
import { AnimeMascot, Movie } from '../types';

interface MascotCornerProps {
  onMascotRecommendMovies: (ids: string[], comment: string) => void;
  moviesCatalog: Movie[];
}

export default function MascotCorner({ onMascotRecommendMovies, moviesCatalog }: MascotCornerProps) {
  const [selectedMascot, setSelectedMascot] = useState<AnimeMascot>(ANIME_MASCOTS[0]);
  const [bubbleText, setBubbleText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'mascot'; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showChatBox, setShowChatBox] = useState(false);

  // Set random quote on mascot swap
  useEffect(() => {
    const quotes = selectedMascot.greetingQuotes;
    const randomIdx = Math.floor(Math.random() * quotes.length);
    setBubbleText(quotes[randomIdx]);
    setChatHistory([
      { sender: 'mascot', text: quotes[randomIdx] }
    ]);
  }, [selectedMascot]);

  // Handle message sending to Gemini
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userText = userInput.trim();
    setUserInput('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userText,
          mascotId: selectedMascot.id
        })
      });

      const data = await response.json();
      if (response.ok && data.reply) {
        setChatHistory(prev => [...prev, { sender: 'mascot', text: data.reply }]);
        setBubbleText(data.reply);
      } else {
        throw new Error(data.error || "Gemini chat error");
      }
    } catch (err) {
      console.warn("Failed to reach Gemini chatbot, falling back.", err);
      // Fallback
      setTimeout(() => {
        setChatHistory(prev => [
          ...prev, 
          { sender: 'mascot', text: `Nyaa~! Koko is temporarily offline, but I still love talking to you! Try checking out "Big Buck Bunny" or "Sintel" today! 🌸` }
        ]);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  // Perform a full AI Movie recommendation
  const triggerAIMovieRecommendation = async () => {
    setIsLoading(true);
    setBubbleText(`*Calculating stars and popcorn ratios...* Let Koko fetch you a premium recommendation now, Senpai!`);
    
    try {
      const p = chatHistory.length > 1 ? chatHistory.map(c => c.text).join(', ') : "Recommend the cutest anime movies and cyberpunk actions";
      
      const res = await fetch('/api/gemini/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: p,
          mascotId: selectedMascot.id
        })
      });

      const data = await res.json();
      if (res.ok && data.recommendedMovieIds) {
        onMascotRecommendMovies(data.recommendedMovieIds, data.curatorComment);
        setBubbleText(data.curatorComment);
        setChatHistory(prev => [...prev, { sender: 'mascot', text: data.curatorComment }]);
      } else {
        throw new Error("Invalid recommendation payload");
      }
    } catch (err) {
      console.error(err);
      const defaultComm = `Koko suggestions are ready! I combed through our anime and action movies, and here is a tailored set specifically for your beautiful taste. Let's watch! 🍿🌸`;
      onMascotRecommendMovies(['sintel-saga', 'dreams-of-eternity'], defaultComm);
      setBubbleText(defaultComm);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="frosted-glass backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-5 shadow-2xl relative overflow-hidden">
      {/* Decorative neon corner glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-5">
        
        {/* Mascot Avatar and Mascot swap tabs */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-20 h-20 rounded-full border-2 border-[#00E5FF]/50 bg-white/5 flex items-center justify-center text-5xl shadow-[0_0_15px_rgba(0,229,255,0.15)] select-none animate-bounce-slow">
            <span className="transform hover:scale-110 transition-transform cursor-pointer">
              {selectedMascot.avatar}
            </span>
            <span className="absolute bottom-0 right-0 px-1.5 py-0.5 rounded-full bg-[#00E5FF] text-black border border-black text-[8px] font-black uppercase tracking-wider scale-90 shadow-md">
              LIVE
            </span>
          </div>
          
          <h3 className="text-xs font-black text-white mt-1.5 text-center uppercase tracking-wide">
            {selectedMascot.name}
          </h3>

          <div className="flex items-center space-x-1.5 mt-2">
            {ANIME_MASCOTS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMascot(m)}
                className={`w-7 h-7 rounded-full text-sm flex items-center justify-center border transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                  selectedMascot.id === m.id 
                    ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_6px_rgba(0,229,255,0.4)]' 
                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30'
                }`}
                title={m.name}
              >
                {m.avatar}
              </button>
            ))}
          </div>
        </div>

        {/* Bubble Speech block and smart button actions */}
        <div className="flex-1 w-full flex flex-col justify-between">
          <div className="relative bg-white/4 border border-white/8 p-3 rounded-xl flex-1 backdrop-blur-md">
            {/* Arrow on left side */}
            <div className="hidden lg:block absolute -left-1.5 top-6 w-3 h-3 bg-white/4 border-l border-b border-white/8 transform rotate-45"></div>

            <div className="flex items-center space-x-1.5 mb-1.5 text-[#00E5FF] font-semibold text-[11px] font-mono uppercase tracking-wide">
              <Sparkles className="w-3 h-3 animate-spin-slow" />
              <span>CineVerse Co-Pilot Chatbox</span>
            </div>

            <p className="text-xs text-gray-200 leading-relaxed font-sans min-h-[36px]">
              {bubbleText}
            </p>

            <span className="text-[9px] text-gray-500 block mt-1 text-right font-mono italic">
              Personality Mode: {selectedMascot.personality}
            </span>
          </div>

          {/* Action pills & chatbox trigger */}
          <div className="mt-3 flex flex-wrap gap-2.5 items-center">
            <button
              onClick={() => setShowChatBox(!showChatBox)}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 hover:text-[#00E5FF] border border-white/10 hover:border-white/20 rounded-full text-[11px] text-white font-semibold transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <MessageSquare className="w-3 h-3" />
              <span>{showChatBox ? 'Hide Chat Engine' : 'Chat / Voice Smart Help'}</span>
            </button>

            <button
              onClick={triggerAIMovieRecommendation}
              className="px-3.5 py-1.5 bg-gradient-to-r from-[#E50914] to-red-700 hover:shadow-[0_0_10px_rgba(229,9,20,0.3)] border border-red-500/10 rounded-full text-[11px] text-white font-bold tracking-wide transition-all cursor-pointer flex items-center space-x-1"
              disabled={isLoading}
            >
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>Get AI Recommendation</span>
            </button>
          </div>
        </div>

      </div>

      {/* Chat Conversational Drawer popup */}
      {showChatBox && (
        <div className="mt-4 border-t border-white/10 pt-3 animate-slide-up">
          <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-1.5">
            <h4 className="text-xs font-bold text-[#00E5FF] uppercase tracking-wider flex items-center space-x-1">
              <span>Chat history with {selectedMascot.name}</span>
            </h4>
            <button onClick={() => setShowChatBox(false)} className="text-gray-500 hover:text-white cursor-pointer">
              <span className="sr-only">Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-2.5 p-3 bg-black/35 rounded-xl border border-white/5 mb-4 scrollbar-thin">
            {chatHistory.map((ch, i) => (
              <div 
                key={i} 
                className={`flex flex-col max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  ch.sender === 'user' 
                    ? 'ml-auto bg-[#00E5FF]/10 text-white border border-[#00E5FF]/20 backdrop-blur-sm' 
                    : 'mr-auto bg-white/4 text-gray-200 border border-white/8 backdrop-blur-sm'
                }`}
              >
                <span className="text-[9px] text-gray-500 font-mono mb-0.5 uppercase">
                  {ch.sender === 'user' ? 'Me' : selectedMascot.name.split(' ')[0]}
                </span>
                <p>{ch.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto bg-white/4 text-gray-400 text-[11px] rounded-xl px-3 py-2 border border-white/5 animate-pulse font-mono backdrop-blur-sm">
                {selectedMascot.name.split(' ')[0]} is reading the stars... Please wait...
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={`Ask ${selectedMascot.name.split(' ')[0]} / "recommend action movies"`}
              className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 rounded-full py-1.5 px-4 text-xs text-white focus:outline-none focus:border-[#00E5FF]/45 backdrop-blur-md transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="p-2 rounded-full bg-[#00E5FF] text-black hover:bg-[#00E5FF]/80 focus:ring-2 focus:ring-[#00E5FF]/30 active:scale-95 transition-all cursor-pointer shadow-md"
              disabled={isLoading || !userInput.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
