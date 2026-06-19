import React from 'react';
import { Play, Star, Sparkles, DownloadCloud } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onQuickToggleWatchlist?: (movieId: string, e: React.MouseEvent) => void;
  isInWatchlist?: boolean;
  key?: React.Key;
}

export default function MovieCard({ movie, onSelect, onQuickToggleWatchlist, isInWatchlist }: MovieCardProps) {
  return (
    <div 
      className="group relative flex flex-col frosted-glass hover:bg-white/8 hover:border-[#00E5FF]/40 rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] cursor-pointer"
      onClick={() => onSelect(movie)}
    >
      {/* Movie Thumbnail */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
        <img
          src={movie.thumbnail}
          alt={movie.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badge Alerts */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
          {movie.category === 'anime' && (
            <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00E5FF]/80 text-black shadow-[0_0_8px_rgba(0,229,255,0.4)] backdrop-blur-md">
              <Sparkles className="w-2.5 h-2.5 fill-black" />
              <span>ANIME</span>
            </span>
          )}
          {movie.isTrending && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#E50914] text-white">
              HOT
            </span>
          )}
          {movie.isTopRated && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-yellow-500 text-black">
              Top 100
            </span>
          )}
        </div>

        {/* Quick actions top-right */}
          {onQuickToggleWatchlist && (
          <button
            onClick={(e) => onQuickToggleWatchlist(movie.id, e)}
            className={`absolute top-2.5 right-2.5 p-1.5 rounded-full transition-all duration-200 z-10 backdrop-blur-md border ${
              isInWatchlist 
                ? 'bg-[#E50914]/80 text-white border-red-400/50 shadow-[0_0_8px_rgba(229,9,20,0.4)]' 
                : 'bg-black/50 text-gray-300 hover:text-white border-white/10 hover:border-[#00E5FF]/50'
            }`}
            title="Toggle Stream List"
          >
            <Star className={`w-3.5 h-3.5 ${isInWatchlist ? 'fill-white' : ''}`} />
          </button>
        )}

        {/* Video Hover Glassmorphic Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[1px]">
          <div className="p-3 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF] text-[#00E5FF] shadow-[0_0_15px_#00E5FF] transform scale-75 group-hover:scale-100 transition-all duration-300">
            <Play className="w-6 h-6 fill-[#00E5FF]" />
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between space-x-2">
            <h3 className="text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors truncate">
              {movie.title}
            </h3>
            <div className="flex items-center space-x-0.5 shrink-0 bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-semibold text-yellow-400 border border-white/8 backdrop-blur-md">
              <Star className="w-2.5 h-2.5 fill-yellow-400" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
            {movie.description}
          </p>
        </div>

        <div className="mt-3.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
          <div className="flex flex-wrap items-center gap-1.5 truncate max-w-[70%]">
            {movie.genre.slice(0, 2).map((g, idx) => (
              <span key={idx} className="bg-white/5 px-1.5 py-0.5 rounded text-gray-300 text-[9px] hover:text-[#00E5FF] transition-colors border border-white/8">
                {g}
              </span>
            ))}
          </div>
          <span className="shrink-0">{movie.duration}</span>
        </div>
      </div>
    </div>
  );
}
