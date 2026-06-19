import React from 'react';
import { Play, Sparkles, Star, Info, ListPlus } from 'lucide-react';
import { Movie } from '../types';

interface HeroBannerProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onToggleWatchlist?: () => void;
  isInWatchlist?: boolean;
}

export default function HeroBanner({ movie, onPlay, onToggleWatchlist, isInWatchlist }: HeroBannerProps) {
  return (
    <div className="relative w-full overflow-hidden bg-[#0A0A0A] rounded-3xl border border-white/10 shadow-[0_12px_45px_rgba(0,0,0,0.85)]">
      
      {/* Background Banner Image with bottom & side fades */}
      <div className="absolute inset-0">
        <img
          src={movie.bannerImage}
          alt={movie.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-65 md:opacity-50"
        />
        {/* Gradients to blend content */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/75 to-transparent"></div>
      </div>

      <div className="relative px-6 py-12 md:py-20 md:px-12 max-w-4xl z-10 flex flex-col justify-end min-h-[400px] md:min-h-[500px]">
        {/* Genre Tags / Mascot recommendation flag */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          {movie.category === 'anime' && (
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-mono tracking-widest bg-[#00E5FF] text-black font-black uppercase">
              <Sparkles className="w-3 h-3 fill-black animate-spin-slow" />
              <span>MUST WATCH ANIME</span>
            </span>
          )}
          <span className="flex items-center space-x-1 bg-white/5 border border-yellow-500/20 px-2 py-0.5 rounded text-xs font-bold text-yellow-400 backdrop-blur-md">
            <Star className="w-3.5 h-3.5 fill-yellow-400" />
            <span>{movie.rating.toFixed(1)} IMDB</span>
          </span>
          {movie.genre.map((g, i) => (
            <span key={i} className="bg-white/5 border border-white/8 backdrop-blur-md px-2.5 py-0.5 rounded text-xs text-gray-300 font-mono">
              {g}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md text-glow-neon">
          {movie.title}
        </h1>

        {/* Synopsis */}
        <p className="mt-3 text-sm md:text-base text-gray-300 leading-relaxed max-w-2xl line-clamp-3 font-sans">
          {movie.description}
        </p>

        {/* Casting Highlight details */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-xs text-gray-400 font-mono">
          <p>
            <span className="text-gray-500">Language:</span>{' '}
            <span className="text-gray-300">{movie.language}</span>
          </p>
          <p className="hidden md:block">
            <span className="text-gray-500">Release:</span>{' '}
            <span className="text-[#00E5FF]">{movie.releaseDate}</span>
          </p>
          <p className="max-w-xs truncate">
            <span className="text-gray-500">Starring:</span>{' '}
            <span className="text-gray-300">{movie.cast.slice(0, 3).join(', ')}</span>
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mt-6 flex flex-wrap gap-4 items-center">
          <button
            onClick={() => onPlay(movie)}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-full font-bold bg-[#E50914] hover:bg-red-700 text-white shadow-lg shadow-red-600/30 active:scale-95 transition-all uppercase text-xs tracking-wider cursor-pointer"
          >
            <Play className="w-4.5 h-4.5 fill-white" />
            <span>Stream Now</span>
          </button>

          {onToggleWatchlist && (
            <button
              onClick={onToggleWatchlist}
              className={`flex items-center space-x-1.5 px-5 py-2.5 rounded-full border text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer ${
                isInWatchlist 
                  ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.2)]' 
                  : 'bg-white/5 border-white/15 text-gray-200 hover:text-white hover:border-white'
              }`}
            >
              <ListPlus className="w-4 h-4" />
              <span>{isInWatchlist ? 'In My List' : 'Add Watchlist'}</span>
            </button>
          )}

          <div className="text-[10px] text-gray-500 font-mono uppercase bg-white/5 p-2 rounded border border-white/10 hidden sm:block">
            <span>Directing by: {movie.director}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
