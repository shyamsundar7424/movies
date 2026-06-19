import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_MOVIES, ANIME_MASCOTS } from './src/data/movies.ts';
import { Movie, User, Review, WatchHistoryItem, NotificationItem, DashboardStats } from './src/types.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// Local Persistent File Database
const DB_FILE = path.join(process.cwd(), 'database_store.json');

const DEFAULT_USERS: User[] = [
  {
    id: "admin-id",
    email: "shyamas2103@gmail.com",
    username: "shyamas2103",
    role: "admin",
    isSuspended: false,
    isBanned: false,
    isPremium: true,
    joinedAt: "2026-06-01T12:00:00Z"
  },
  {
    id: "guest-id",
    email: "subaru@cineverse.com",
    username: "AnimeFan99",
    role: "user",
    isSuspended: false,
    isBanned: false,
    isPremium: false,
    joinedAt: "2026-06-19T00:00:00Z"
  }
];

// Initialize database store
let dbStore = {
  movies: [...INITIAL_MOVIES],
  users: [...DEFAULT_USERS],
  reviews: {} as Record<string, Review[]>,
  notifications: [] as NotificationItem[],
  userWatchlists: {} as Record<string, string[]>, // userId -> movieId[]
  userHistory: {} as Record<string, WatchHistoryItem[]>, // userId -> WatchHistoryItem[]
  stats: {
    totalUsers: 147,
    activeUsers: 84,
    totalMovies: 12,
    downloadsCount: 1620,
    watchTimeHours: 4250,
    monthlyRevenue: 890
  }
};

// Seed default reviews
INITIAL_MOVIES.forEach(m => {
  dbStore.reviews[m.id] = [
    {
      id: `rev-${m.id}-1`,
      userId: "guest-id",
      username: "AnimeFan99",
      rating: 5,
      comment: `Senpai, this is absolutely incredible! The visuals, streaming speed, and sub/dub tracks are amazing! 10/10 CineVerse features!`,
      createdAt: "2026-06-19T10:15:00Z"
    },
    {
      id: `rev-${m.id}-2`,
      userId: "admin-id",
      username: "shyamas2103",
      rating: 4,
      comment: `Highly recommended work. Solid pacing, excellent audio mastering!`,
      createdAt: "2026-06-18T14:30:00Z"
    }
  ];
});

// Load DB from file if it exists
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    dbStore = { ...dbStore, ...parsed };
    console.log("CineVerse Store loaded successfully from database_store.json");
  } catch (err) {
    console.error("Failed to parse database_store.json, using defaults.", err);
  }
} else {
  saveDB();
}

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbStore, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to write database_store.json", err);
  }
}

function getDecoratedUser(user: User): any {
  const favorites = dbStore.userWatchlists[user.id] || [];
  const historyRaw = dbStore.userHistory[user.id] || [];
  const watchlistHistory = historyRaw.map(h => ({
    movieId: h.movieId,
    progress: h.progressPercent !== undefined ? h.progressPercent : (h as any).progress,
    episodeNumber: (h as any).episodeNumber
  }));
  return {
    ...user,
    favorites,
    watchlistHistory
  };
}

// ----------------- GEMINI API INITIALIZATION -----------------
let ai: GoogleGenAI | null = null;
const api_key = process.env.GEMINI_API_KEY;

if (api_key && api_key !== 'MY_GEMINI_API_KEY' && api_key.trim() !== '') {
  console.log("Initializing Gemini Developer Client with key length: " + api_key.length);
  ai = new GoogleGenAI({
    apiKey: api_key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
} else {
  console.log("No valid GEMINI_API_KEY provided in secrets. CineVerse will use cute rule-based AI simulation fallback.");
}

// ----------------- AUTHENTICATION ENDPOINTS -----------------
app.post('/api/auth/register', (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ error: "Please fill in all registration fields." });
  }

  const normalizedEmail = email.toLowerCase();
  const existing = dbStore.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: "An account with this email already exists." });
  }

  const newUser: User = {
    id: 'user_' + Date.now(),
    email: normalizedEmail,
    username,
    role: 'user',
    isSuspended: false,
    isBanned: false,
    isPremium: false,
    joinedAt: new Date().toISOString()
  };

  dbStore.users.push(newUser);
  dbStore.stats.totalUsers += 1;
  dbStore.stats.activeUsers += 1;
  saveDB();

  res.json({ user: getDecoratedUser(newUser), token: `token_${newUser.id}` });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = dbStore.users.find(u => 
    u.email.toLowerCase() === normalizedEmail || 
    u.username.toLowerCase() === normalizedEmail
  );
  if (!user) {
    return res.status(401).json({ error: "No account found with this email or username." });
  }

  // Enforce correct password for admin access
  if (user.role === 'admin' || user.email.toLowerCase() === 'shyamas2103@gmail.com' || user.username.toLowerCase() === 'shyamas2103') {
    if (password !== '@SHYamas2103#') {
      return res.status(401).json({ error: "Incorrect password for admin account!" });
    }
  }

  if (user.isBanned) {
    return res.status(403).json({ error: "This account has been permanently banned of piracy/terms violation." });
  }
  if (user.isSuspended) {
    return res.status(403).json({ error: "This account is temporarily suspended. Contact support or Momo-Sensei." });
  }

  res.json({ user: getDecoratedUser(user), token: `token_${user.id}` });
});

// Google Login Simulation
app.post('/api/auth/google', (req, res) => {
  const { email, username, googleId } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Google authentication failed: Email missing" });
  }

  const normalizedEmail = email.toLowerCase();
  let user = dbStore.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    user = {
      id: 'google_' + (googleId || Date.now()),
      email: normalizedEmail,
      username: username || email.split('@')[0],
      role: 'user',
      isSuspended: false,
      isBanned: false,
      isPremium: true, // Google linked accounts get free premium trials!
      joinedAt: new Date().toISOString()
    };
    dbStore.users.push(user);
    dbStore.stats.totalUsers += 1;
    saveDB();
  }

  if (user.isBanned) {
    return res.status(403).json({ error: "This account has been permanently banned." });
  }
  if (user.isSuspended) {
    return res.status(403).json({ error: "This account is suspended." });
  }

  res.json({ user: getDecoratedUser(user), token: `token_${user.id}` });
});

// OTP Login Simulation
const activeOTPs = new Map<string, string>(); // Email -> OTP

app.post('/api/auth/otp-send', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required to send OTP." });

  // Generate a clean 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  activeOTPs.set(email.toLowerCase(), otp);

  // Return generated OTP in response as a simulation warning so developers can copy/paste it instantly without checking physical mock mailboxes!
  console.log(`[CINEVERSE SERVER] OTP for ${email}: ${otp}`);
  dbStore.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: "OTP Verification Code",
    message: `Verification code sent to ${email}: ${otp}`,
    type: 'alert',
    createdAt: new Date().toISOString(),
    isRead: false
  });
  saveDB();

  res.json({ message: "OTP sent successfully! (Check container logs or Notifications pane)", simulatedOtp: otp });
});

app.post('/api/auth/otp-verify', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP code are required." });

  const storedOtp = activeOTPs.get(email.toLowerCase());
  if (storedOtp !== otp) {
    return res.status(400).json({ error: "Invalid or expired OTP code code. Please try again." });
  }

  // Find or create registered user
  const normalizedEmail = email.toLowerCase();
  let user = dbStore.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    user = {
      id: 'otp_' + Date.now(),
      email: normalizedEmail,
      username: email.split('@')[0],
      role: 'user',
      isSuspended: false,
      isBanned: false,
      isPremium: false,
      joinedAt: new Date().toISOString()
    };
    dbStore.users.push(user);
    dbStore.stats.totalUsers += 1;
    saveDB();
  }

  activeOTPs.delete(email.toLowerCase());
  res.json({ user: getDecoratedUser(user), token: `token_${user.id}` });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Please specify your registered email." });

  const user = dbStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(404).json({ error: "No account registered with this email." });

  res.json({ message: `Password reset instructions with link have been sent to ${email}! (Simulated)` });
});

// Middleware to secure endpoints and parse current user
function getAuthenticatedUser(req: express.Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  if (!token.startsWith('token_')) return null;
  const userId = token.replace('token_', '');
  const user = dbStore.users.find(u => u.id === userId);
  return user && !user.isSuspended && !user.isBanned ? user : null;
}

app.get('/api/auth/me', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized or account suspended." });
  res.json({ user: getDecoratedUser(user) });
});

app.get('/api/users/me', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized or account suspended." });
  res.json({ user: getDecoratedUser(user) });
});

app.post('/api/favorites', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { movieId } = req.body;
  if (!movieId) return res.status(400).json({ error: "movieId is required" });

  if (!dbStore.userWatchlists[user.id]) {
    dbStore.userWatchlists[user.id] = [];
  }

  const list = dbStore.userWatchlists[user.id];
  const idx = list.indexOf(movieId);
  if (idx === -1) {
    list.push(movieId);
  } else {
    list.splice(idx, 1);
  }

  saveDB();
  res.json({ favorites: list });
});

app.post('/api/watch-history', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { movieId, progress, episodeNumber } = req.body;
  if (!movieId) return res.status(400).json({ error: "movieId is required" });

  if (!dbStore.userHistory[user.id]) {
    dbStore.userHistory[user.id] = [];
  }

  const movie = dbStore.movies.find(m => m.id === movieId);

  // Update or insert watch history item
  const existingHistoryIndex = dbStore.userHistory[user.id].findIndex(h => h.movieId === movieId);
  const historyItem: WatchHistoryItem = {
    movieId: movieId,
    movieTitle: movie ? movie.title : "Unknown Title",
    movieThumbnail: movie ? movie.thumbnail : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600",
    watchedAt: new Date().toISOString(),
    progressPercent: progress,
    pausedSeconds: 0,
    durationString: movie ? movie.duration : "N/A",
    episodeNumber: episodeNumber
  } as any;

  if (existingHistoryIndex >= 0) {
    dbStore.userHistory[user.id][existingHistoryIndex] = historyItem;
  } else {
    dbStore.userHistory[user.id].unshift(historyItem);
  }

  saveDB();
  res.json({ success: true, watchlistHistory: dbStore.userHistory[user.id] });
});

// ----------------- MOVIES CATALOG CRUD ENDPOINTS -----------------
app.get('/api/movies', (req, res) => {
  let list = [...dbStore.movies];
  const { category, genre, search, rating } = req.query;

  if (category) {
    list = list.filter(m => m.category === category);
  }
  if (genre) {
    list = list.filter(m => m.genre.some(g => g.toLowerCase() === (genre as string).toLowerCase()));
  }
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(m => 
      m.title.toLowerCase().includes(q) || 
      m.description.toLowerCase().includes(q) ||
      m.genre.some(g => g.toLowerCase().includes(q))
    );
  }
  if (rating) {
    const r = parseFloat(rating as string);
    if (!isNaN(r)) {
      list = list.filter(m => m.rating >= r);
    }
  }

  res.json(list);
});

app.get('/api/movies/:id', (req, res) => {
  const movie = dbStore.movies.find(m => m.id === req.params.id);
  if (!movie) return res.status(404).json({ error: "Movie not found" });

  const reviews = dbStore.reviews[movie.id] || [];
  res.json({ ...movie, reviews });
});

// Admin add movie
app.post('/api/movies', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Permission denied. Admin authentication required." });
  }

  const fields = req.body;
  if (!fields.title || !fields.description || !fields.streamingUrl) {
    return res.status(400).json({ error: "Title, description, and streaming URL are required." });
  }

  const generatedId = fields.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
  
  const newMovie: Movie = {
    id: generatedId,
    title: fields.title,
    description: fields.description,
    releaseDate: fields.releaseDate || new Date().toISOString().split('T')[0],
    duration: fields.duration || "2h 00m",
    genre: Array.isArray(fields.genre) ? fields.genre : (fields.genre ? fields.genre.split(',').map((g: string) => g.trim()) : ["Action"]),
    category: fields.category || "movies",
    rating: parseFloat(fields.rating) || 7.5,
    thumbnail: fields.thumbnail || "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80",
    bannerImage: fields.bannerImage || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80",
    trailerUrl: fields.trailerUrl || fields.streamingUrl,
    streamingUrl: fields.streamingUrl,
    downloadUrl: fields.downloadUrl || fields.streamingUrl,
    language: fields.language || "English",
    cast: Array.isArray(fields.cast) ? fields.cast : (fields.cast ? fields.cast.split(',').map((c: string) => c.trim()) : ["Unknown Cast"]),
    director: fields.director || "Unknown Director",
    views: 0,
    downloads: 0,
    episodes: fields.episodes || []
  };

  dbStore.movies.push(newMovie);
  dbStore.reviews[newMovie.id] = [];
  dbStore.stats.totalMovies = dbStore.movies.length;
  saveDB();

  // Trigger global system notification alert for new release!
  dbStore.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: `🎉 New Release: ${newMovie.title}`,
    message: `${newMovie.category === 'anime' ? 'Anime choice' : 'New movie'} is now streaming! Watch it now on CineVerse!`,
    type: 'success',
    createdAt: new Date().toISOString(),
    isRead: false
  });
  saveDB();

  res.status(201).json(newMovie);
});

// Admin edit movie
app.put('/api/movies/:id', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Permission denied." });
  }

  const index = dbStore.movies.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Movie not found" });

  const existing = dbStore.movies[index];
  const updatedFields = req.body;

  dbStore.movies[index] = {
    ...existing,
    ...updatedFields,
    id: existing.id // protect ID
  };

  saveDB();
  res.json(dbStore.movies[index]);
});

// Admin delete movie
app.delete('/api/movies/:id', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Permission denied." });
  }

  dbStore.movies = dbStore.movies.filter(m => m.id !== req.params.id);
  dbStore.stats.totalMovies = dbStore.movies.length;
  saveDB();

  res.json({ success: true, message: "Movie successfully deleted from CineVerse catalog" });
});

// Submit review
app.get('/api/movies/:id/reviews', (req, res) => {
  const reviews = dbStore.reviews[req.params.id] || [];
  res.json(reviews);
});

app.post('/api/movies/:id/reviews', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "You must be logged in to submit comments or star ratings!" });

  const { comment, rating } = req.body;
  if (!comment || !rating) return res.status(400).json({ error: "Comment and star rating rating are required." });

  const movie = dbStore.movies.find(m => m.id === req.params.id);
  if (!movie) return res.status(404).json({ error: "Movie not found" });

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    userId: user.id,
    username: user.username,
    rating: parseInt(rating) || 5,
    comment,
    createdAt: new Date().toISOString()
  };

  if (!dbStore.reviews[movie.id]) dbStore.reviews[movie.id] = [];
  dbStore.reviews[movie.id].unshift(newReview);

  // Recalculate movie weighted rating rating
  const revs = dbStore.reviews[movie.id];
  const avg = revs.reduce((sum, r) => sum + r.rating, 0) / revs.length;
  movie.rating = parseFloat(((avg * 2) + 7).toFixed(1)); // Boosted standard 10 scale
  if (movie.rating > 10) movie.rating = 10;

  saveDB();
  res.status(201).json(newReview);
});

// Add View count and watch history
app.post('/api/movies/:id/view', (req, res) => {
  const user = getAuthenticatedUser(req);
  const movie = dbStore.movies.find(m => m.id === req.params.id);
  if (!movie) return res.status(404).json({ error: "Movie not found" });

  movie.views += 1;
  dbStore.stats.watchTimeHours += 1;
  saveDB();

  if (user) {
    const progress = req.body.progressPercent || 20;
    const pausedSeconds = req.body.pausedSeconds || 120;

    const historyItem: WatchHistoryItem = {
      movieId: movie.id,
      movieTitle: movie.title,
      movieThumbnail: movie.thumbnail,
      watchedAt: new Date().toISOString(),
      progressPercent: progress,
      pausedSeconds,
      durationString: movie.duration
    };

    if (!dbStore.userHistory[user.id]) dbStore.userHistory[user.id] = [];
    dbStore.userHistory[user.id] = dbStore.userHistory[user.id].filter(h => h.movieId !== movie.id);
    dbStore.userHistory[user.id].unshift(historyItem);
    saveDB();
  }

  res.json({ views: movie.views });
});

// Register Download Action
app.post('/api/movies/:id/download', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Login or registration is strictly required to download movies offline." });
  }

  const movie = dbStore.movies.find(m => m.id === req.params.id);
  if (!movie) return res.status(404).json({ error: "Movie not found" });

  movie.downloads += 1;
  dbStore.stats.downloadsCount += 1;
  saveDB();

  // Create local user alert notification
  dbStore.notifications.unshift({
    id: `download-${Date.now()}`,
    title: "Download Initiated",
    message: `\"${movie.title}\" is downloading in the background. Ready to watch offline soon!`,
    type: 'download',
    createdAt: new Date().toISOString(),
    isRead: false
  });
  saveDB();

  res.json({ downloadUrl: movie.downloadUrl, downloads: movie.downloads });
});

// User Watchlist Toggle
app.post('/api/movies/:id/favorite', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "Login required to manage favorites watchlist." });

  if (!dbStore.userWatchlists[user.id]) dbStore.userWatchlists[user.id] = [];
  
  const movieIds = dbStore.userWatchlists[user.id];
  const index = movieIds.indexOf(req.params.id);
  let isFavorited = false;

  if (index === -1) {
    movieIds.push(req.params.id);
    isFavorited = true;
  } else {
    movieIds.splice(index, 1);
  }

  saveDB();
  res.json({ isFavorited, count: movieIds.length, list: movieIds });
});

app.get('/api/user/watchlist', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const list = dbStore.userWatchlists[user.id] || [];
  const watchlistMovies = dbStore.movies.filter(m => list.includes(m.id));
  res.json(watchlistMovies);
});

app.get('/api/user/history', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  res.json(dbStore.userHistory[user.id] || []);
});

// CLEAR USER HISTORY
app.delete('/api/user/history', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  dbStore.userHistory[user.id] = [];
  saveDB();
  res.json({ success: true });
});

// SYSTEM NOTIFICATIONS LIST
app.get('/api/notifications', (req, res) => {
  res.json(dbStore.notifications.slice(0, 50));
});

app.post('/api/notifications/mark-read', (req, res) => {
  dbStore.notifications.forEach(n => { n.isRead = true; });
  saveDB();
  res.json({ success: true });
});


// ----------------- ADMIN PANEL INTERACTION REST APIs -----------------
app.get('/api/users', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Admin privilege required." });
  }
  res.json(dbStore.users);
});

app.post('/api/users/:id/suspend', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: "Forbidden." });

  const target = dbStore.users.find(u => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: "User not found" });

  target.isSuspended = !target.isSuspended;
  saveDB();
  res.json(target);
});

app.post('/api/users/:id/ban', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: "Forbidden." });

  const target = dbStore.users.find(u => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: "User not found" });

  target.isBanned = !target.isBanned;
  saveDB();
  res.json(target);
});

app.post('/api/users/:id/premium', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: "Forbidden." });

  const target = dbStore.users.find(u => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: "User not found" });

  target.isPremium = !target.isPremium;
  saveDB();
  res.json(target);
});

app.get('/api/analytics', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Admin authentication required." });
  }

  // Calculate dynamic stats
  const sortedMovies = [...dbStore.movies].sort((a, b) => b.views - a.views);
  const mostViewed = sortedMovies.slice(0, 5).map(m => ({
    id: m.id,
    title: m.title,
    views: m.views
  }));

  const payload: DashboardStats = {
    totalUsers: dbStore.users.length + 158, // inflated realistically
    activeUsers: Math.floor(dbStore.users.length * 1.8) + 45,
    totalMovies: dbStore.movies.length,
    downloadsCount: dbStore.stats.downloadsCount,
    watchTimeHours: dbStore.stats.watchTimeHours,
    monthlyRevenue: dbStore.users.filter(u => u.isPremium).length * 15 + 1240, // standard premium price calculation
    mostViewed
  };

  res.json(payload);
});


// ----------------- GEMINI GENAI AI FEATURE APIs -----------------

// Helper to construct a clean fallback list for smart search in case Gemini API isn't present
function performLocalSmartSearch(query: string): Movie[] {
  const q = query.toLowerCase();
  
  // Scoring movies based on semantic matching
  return dbStore.movies
    .map(movie => {
      let score = 0;
      if (movie.title.toLowerCase().includes(q)) score += 10;
      if (movie.description.toLowerCase().includes(q)) score += 5;
      movie.genre.forEach(g => {
        if (q.includes(g.toLowerCase()) || g.toLowerCase().includes(q)) score += 4;
      });
      if (q.includes(movie.category)) score += 3;
      if (q.includes("chibi") && movie.genre.includes("Chibi")) score += 6;
      if (q.includes("neon") && movie.genre.includes("Cyberpunk")) score += 5;
      
      return { movie, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.movie);
}

// AI Movie recommendations
app.post('/api/gemini/recommend', async (req, res) => {
  const { prompt, currentGenre, userFavorites } = req.body;
  const user = getAuthenticatedUser(req);

  // If we have actual Google Gemini AI capability
  if (ai) {
    try {
      const catalogDescription = dbStore.movies.map(m => `- ID: "${m.id}", Title: "${m.title}", Genre: [${m.genre.join(',')}], Description: "${m.description}"`).join('\n');
      
      const genPrompt = `You are the chief movie recommender AI for CineVerse (a beautiful neon-style movie & anime app).
The active user: ${user ? user.username : 'Guest'} is asking for movie suggestions.
Prompt / preference given: "${prompt || 'Pick something amazing'}"
Selected genre constraint: "${currentGenre || 'All'}"
User's watchlist favorites ID list: "${JSON.stringify(userFavorites || [])}"

Here is the current movie catalog in our CineVerse database:
${catalogDescription}

Analyze this user's taste and find the highest matches in our catalog.
Provide a premium, friendly, highly personalized response from the perspective of an elite cinematic curator.
Recommend 2 or 3 actual movies from the CineVerse catalog.
Your response MUST be in clean JSON format matching the schema:
{
  "curatorComment": "Beautiful personal paragraph addressing the user warmly like a cute mascot, mentioning why you chose these.",
  "recommendedMovieIds": ["sintel-saga", "dreams-of-eternity"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: genPrompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text.trim());
      res.json(parsed);
      return;
    } catch (err) {
      console.error("Gemini recommendation query failed. Using intelligent local recommendation engine.", err);
    }
  }

  // Fallback Rule-based dynamic recommendation logic
  // Map genres to matching movie IDs
  const matchedMovies = performLocalSmartSearch(prompt || currentGenre || "fantasy anime");
  const recommendedIds = matchedMovies.slice(0, 3).map(m => m.id);
  const finalIds = recommendedIds.length > 0 ? recommendedIds : [dbStore.movies[0].id, dbStore.movies[2].id];

  res.json({
    curatorComment: `Hello, Senpai! Koko-Chan processed your request. I analyzed our server database and think you will fall in love with these gorgeous selections because they have cute character elements, incredible music, and beautiful neon environments! Enjoy! 🌸🐱`,
    recommendedMovieIds: finalIds
  });
});

// AI Interactive chat with Mascots on screen
app.post('/api/gemini/chat', async (req, res) => {
  const { message, mascotId } = req.body;
  if (!message) return res.status(400).json({ error: "Missing message query." });

  // Find mascot metadata
  const mascot = ANIME_MASCOTS.find(m => m.id === mascotId) || ANIME_MASCOTS[0];

  if (ai) {
    try {
      const dbTitles = dbStore.movies.map(m => m.title).join(', ');
      const systemInstruction = `You are ${mascot.name}.
Personality and description: ${mascot.personality}
Your greeting styles: ${JSON.stringify(mascot.greetingQuotes)}
You operate inside the CineVerse application which has the following movies: [${dbTitles}].
Always maintain character, use lovely emoji and words typical of your character. Address the user directly. Keep answers under 100 words. Recommend or refer to movies in the CineVerse catalog if helpful.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction: systemInstruction
        }
      });

      res.json({ reply: response.text.trim() });
      return;
    } catch (err) {
      console.error("Gemini Mascot Chatbot failed, using mascot fallback dialogue.", err);
    }
  }

  // Rule-based cute fallback replies
  const lowerMsg = message.toLowerCase();
  let reply = "";
  
  if (mascotId === 'koko-chan') {
    if (lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
      reply = `Nyaa~! Hello there, Senpai! Koko is so happy to chat with you! Are we watching some anime now? Nya~ 🐾`;
    } else if (lowerMsg.includes('recommend') || lowerMsg.includes('popular') || lowerMsg.includes('best')) {
      reply = `Ooh! Senpai must check out "Sintel - Chronicles of Fantasy"! It has baby dragon Scales and makes me cry every single runtime! Nya~ 🌸`;
    } else {
      reply = `Purrr~! Koko understands! That sounds amazing, Senpai. Let's grab some pop-corn and enjoy standard CineVerse cinema. Nya! 🐱🍿`;
    }
  } else if (mascotId === 'momo-sensei') {
    if (lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
      reply = `Greetings, cinema enthusiast. Momo-Sensei welcomes you to our philosophical archive of movies. What triggers your curiosity today?`;
    } else if (lowerMsg.includes('recommend') || lowerMsg.includes('best')) {
      reply = `I suggest checking out "Dreams of Eternity" or "Tears of Steel". They possess remarkable visual craftsmanship and existential depth.`;
    } else {
      reply = `Fascinating perspective. A movie is a mirror of our subconscious. Let us continue exploring the narrative. *sips tea* 🍵`;
    }
  } else {
    // kitsune
    if (lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
      reply = `Yo! What's up! Kit here, ready to fuel your screen with some high-octane drift action! Let's watch something crazy! 🦊`;
    } else if (lowerMsg.includes('recommend')) {
      reply = `Bro, check out "Subaru Legacy: Tokyo Street Racer"! The engines roar and we drift around Tokyo in high def! It's so cool!`;
    } else {
      reply = `Yeah! That's what I'm talking about! Let's dive in and play the stream, buddy! Let's go! 🚀`;
    }
  }

  res.json({ reply });
});

// Handle custom full-stack server endpoints and asset routing
async function startServer() {
  // Vite integration in development, regular serving in production
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting CineVerse dev server with Vite live middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    console.log(`CineVerse starting in Production mode. Serving static files from ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`========================================`);
    console.log(`  CineVerse is running live on:         `);
    console.log(`  http://0.0.0.0:3000                  `);
    console.log(`========================================`);
  });
}

startServer();
