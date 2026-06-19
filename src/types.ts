/**
 * CineVerse - Type Definitions
 */

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
  isSuspended: boolean;
  isBanned: boolean;
  isPremium: boolean;
  joinedAt: string;
  favorites?: string[];
  watchlistHistory?: any[];
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface Episode {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  streamingUrl: string;
  episodeNumber: number;
  seasonNumber?: number;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  releaseDate: string;
  duration: string;
  genre: string[];
  category: 'movies' | 'anime' | 'series';
  rating: number; // e.g., 8.7
  thumbnail: string;
  bannerImage: string;
  trailerUrl: string;
  streamingUrl: string;
  downloadUrl: string;
  language: string;
  cast: string[];
  director: string;
  views: number;
  downloads: number;
  isTrending?: boolean;
  isTopRated?: boolean;
  isLatest?: boolean;
  isAnime?: boolean;
  episodes?: Episode[];
}

export interface WatchHistoryItem {
  movieId: string;
  movieTitle: string;
  movieThumbnail: string;
  watchedAt: string;
  progressPercent: number; // 0 to 100
  pausedSeconds: number;
  durationString: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert' | 'download';
  createdAt: string;
  isRead: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalMovies: number;
  downloadsCount: number;
  watchTimeHours: number;
  monthlyRevenue: number;
  mostViewed: { title: string; views: number; id: string }[];
}

export interface AnimeMascot {
  id: string;
  name: string;
  avatar: string;
  personality: string;
  greetingQuotes: string[];
  recommendationQuotes: string[];
  restrictedQuotes: string[];
}
