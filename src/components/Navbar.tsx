import React, { useState } from 'react';
import { Search, Bell, Heart, Settings, LogOut, Sparkles, Crown, Mic, MicOff, User } from 'lucide-react';
import { User as UserType, NotificationItem } from '../types';

interface NavbarProps {
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSearchChange: (q: string) => void;
  searchQuery: string;
  onNavigate: (view: 'home' | 'watchlist' | 'admin' | 'ai') => void;
  currentView: string;
  notifications: NotificationItem[];
  onMarkNotificationsRead: () => void;
  onTriggerVoiceSearch: () => void;
  isVoiceListening: boolean;
}

export default function Navbar({
  currentUser,
  onOpenAuth,
  onLogout,
  onSearchChange,
  searchQuery,
  onNavigate,
  currentView,
  notifications,
  onMarkNotificationsRead,
  onTriggerVoiceSearch,
  isVoiceListening
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="sticky top-0 z-50 w-full transition-all duration-300 bg-white/3 border-b border-white/8 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <span className="text-2xl font-black tracking-wider text-[#E50914] bg-gradient-to-r from-[#E50914] to-[#00E5FF] bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-200">
              CINEVERSE
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 select-none">
              NEO v2.5
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => onNavigate('home')}
              className={`text-sm font-medium tracking-wide transition-all ${
                currentView === 'home' || currentView === 'movie-detail' 
                  ? 'text-[#00E5FF] font-semibold drop-shadow-[0_0_8px_#00E5FF]' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Browse
            </button>
            <button 
              onClick={() => {
                if (currentUser) {
                  onNavigate('watchlist');
                } else {
                  onOpenAuth();
                }
              }}
              className={`text-sm font-medium tracking-wide transition-all ${
                currentView === 'watchlist' 
                  ? 'text-[#00E5FF] font-semibold drop-shadow-[0_0_8px_#00E5FF]' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              My List
            </button>
            <button 
              onClick={() => onNavigate('ai')}
              className={`flex items-center space-x-1.5 text-sm font-medium tracking-wide transition-all ${
                currentView === 'ai' 
                  ? 'text-[#00E5FF] font-semibold drop-shadow-[0_0_8px_#00E5FF]' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-4.5 h-4.5 animate-pulse text-[#00E5FF]" />
              <span>AI Gen Picks</span>
            </button>

            {currentUser?.role === 'admin' && (
              <button 
                onClick={() => onNavigate('admin')}
                className={`flex items-center space-x-1 text-sm font-semibold tracking-wide transition-all ${
                  currentView === 'admin' 
                    ? 'text-red-500 font-semibold drop-shadow-[0_0_8px_rgb(220,38,38)]' 
                    : 'text-red-400 hover:text-red-300'
                }`}
              >
                <Settings className="w-4 h-4 animate-spin-slow" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>

          {/* Search bar & Buttons */}
          <div className="flex items-center space-x-4 flex-1 justify-end md:flex-initial">
            
            {/* Search Input */}
            <div className="relative flex items-center w-full max-w-xs group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search movies, genres, anime..."
                className="w-full h-9 pl-10 pr-8 text-xs font-sans text-white bg-white/5 border border-white/10 rounded-full focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/30 backdrop-blur-md transition-all placeholder-gray-500"
              />
              <Search className="absolute left-3.5 w-4 h-4 text-gray-400 group-focus-within:text-[#00E5FF] transition-colors" />
              
              {/* Voice input button */}
              <button
                onClick={onTriggerVoiceSearch}
                className={`absolute right-3 p-1 rounded-full text-gray-400 hover:text-[#00E5FF] transition-all cursor-pointer ${
                  isVoiceListening ? 'animate-ping text-[#00E5FF]' : ''
                }`}
                title="Voice / Smart Search Assistant"
              >
                {isVoiceListening ? <Mic className="w-3.5 h-3.5 text-red-500" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Watchlist Quick Button (icon on small screens) */}
            <button 
              onClick={() => currentUser ? onNavigate('watchlist') : onOpenAuth()}
              className="p-1.5 rounded-full text-gray-400 hover:text-[#00E5FF] transition-all relative block md:hidden"
              title="My Favorites Watchlist"
            >
              <Heart className="w-5 h-5" />
            </button>

            {/* AI Assistant Quick Tab */}
            <button 
              onClick={() => onNavigate('ai')}
              className="p-1.5 rounded-full text-gray-400 hover:text-[#00E5FF] transition-all relative block md:hidden"
              title="AI Recommend Assistant"
            >
              <Sparkles className="w-5 h-5 text-[#00E5FF]" />
            </button>

            {/* Notifications Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) {
                    onMarkNotificationsRead();
                  }
                }}
                className="p-1.5 rounded-full text-gray-400 hover:text-[#00E5FF] hover:bg-[#1A1A1A] transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E50914] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E50914]"></span>
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 frosted-glass border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
                  <div className="px-4 py-3 bg-white/4 border-b border-white/8 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#00E5FF] uppercase tracking-wider">System Alerts</span>
                    <button onClick={onMarkNotificationsRead} className="text-[10px] text-gray-400 hover:text-white underline">Clear All</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-white/5 scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-500">
                        No active CineVerse system notifications right now.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-3.5 hover:bg-white/8 transition-colors">
                          <div className="flex items-start justify-between">
                            <h4 className="text-xs font-semibold text-white">{notif.title}</h4>
                            <span className="text-[9px] text-gray-500">
                              {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Trigger */}
            <div className="relative">
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-1.5 focus:outline-none p-1 rounded-full hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E50914] to-[#00E5FF] p-[1.5px]">
                      <div className="w-full h-full bg-[#1A1A1A] rounded-full flex items-center justify-center text-xs text-white font-black uppercase">
                        {currentUser.username.substring(0, 2)}
                      </div>
                    </div>
                    {currentUser.isPremium && (
                      <Crown className="w-3.5 h-3.5 text-[#00E5FF] fill-[#00E5FF]/10 drop-shadow-[0_0_4px_#00E5FF]" />
                    )}
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-3 w-52 frosted-glass-premium border border-white/12 rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-white/8">
                        <p className="text-xs font-semibold text-white truncate">{currentUser.username}</p>
                        <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
                        {currentUser.isPremium ? (
                          <div className="flex items-center space-x-1 mt-1.5">
                            <span className="inline-block px-1.5 py-0.5 text-[8px] tracking-widest font-mono font-black rounded bg-gradient-to-r from-yellow-500 to-amber-400 text-black uppercase">
                              PREMIUM MEMBER
                            </span>
                          </div>
                        ) : (
                          <span className="inline-block mt-1 bg-gray-800 text-gray-400 text-[9px] px-1 py-0.5 rounded">Standard Access</span>
                        )}
                      </div>
                      
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => { onNavigate('admin'); setShowProfileMenu(false); }}
                          className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-white/8 flex items-center space-x-2"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Admin Console</span>
                        </button>
                      )}

                      <button
                        onClick={() => { onNavigate('watchlist'); setShowProfileMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-white/8 flex items-center space-x-2"
                      >
                        <Heart className="w-3.5 h-3.5 text-[#00E5FF]" />
                        <span>My Stream Watchlist</span>
                      </button>

                      <button
                        onClick={() => { onLogout(); setShowProfileMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-white/8 border-t border-white/8 flex items-center space-x-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold border border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black hover:shadow-[0_0_15px_rgba(0,229,255,0.7)] active:scale-95 transition-all text-center tracking-wide uppercase cursor-pointer"
                >
                  Join / login
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </nav>
  );
}
