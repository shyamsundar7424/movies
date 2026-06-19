import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, Edit3, Trash2, ShieldAlert, BarChart3, Film, Users, 
  Settings, CheckCircle, HelpCircle, TrendingUp, X, Sparkles, Download, Clock, DollarSign
} from 'lucide-react';
import { Movie, User, DashboardStats } from '../types';

interface AdminPanelProps {
  authToken: string;
  onRefreshCatalog: () => void;
  moviesList: Movie[];
}

export default function AdminPanel({ authToken, onRefreshCatalog, moviesList }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'movies' | 'users'>('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bannerAlert, setBannerAlert] = useState('');

  // Movie form states (Add/Edit)
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formReleaseDate, setFormReleaseDate] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formGenre, setFormGenre] = useState('');
  const [formCategory, setFormCategory] = useState<'movies' | 'anime' | 'series'>('movies');
  const [formRating, setFormRating] = useState('8.0');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formBanner, setFormBanner] = useState('');
  const [formTrailer, setFormTrailer] = useState('');
  const [formStreaming, setFormStreaming] = useState('');
  const [formDownload, setFormDownload] = useState('');
  const [formLanguage, setFormLanguage] = useState('');
  const [formCast, setFormCast] = useState('');
  const [formDirector, setFormDirector] = useState('');

  // Episodes management states
  const [formEpisodes, setFormEpisodes] = useState<any[]>([]);
  const [newEpTitle, setNewEpTitle] = useState('');
  const [newEpNumber, setNewEpNumber] = useState('');
  const [newEpSeason, setNewEpSeason] = useState('1');
  const [newEpDuration, setNewEpDuration] = useState('24m');
  const [newEpStreaming, setNewEpStreaming] = useState('');

  // Load stats and users list
  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [authToken]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Stats retrieve error:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Users list error:", err);
    }
  };

  // User control room actions
  const toggleSuspend = async (uid: string) => {
    try {
      const res = await (await fetch(`/api/users/${uid}/suspend`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      })).json();
      if (res.id) {
        fetchUsers();
        setBannerAlert(`User status updated successfully!`);
        setTimeout(() => setBannerAlert(''), 3000);
      }
    } catch (err) { console.error(err); }
  };

  const toggleBan = async (uid: string) => {
    try {
      const res = await (await fetch(`/api/users/${uid}/ban`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      })).json();
      if (res.id) {
        fetchUsers();
        setBannerAlert(`Security protocol registered!`);
        setTimeout(() => setBannerAlert(''), 3000);
      }
    } catch (err) { console.error(err); }
  };

  const togglePremium = async (uid: string) => {
    try {
      const res = await (await fetch(`/api/users/${uid}/premium`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      })).json();
      if (res.id) {
        fetchUsers();
        fetchStats(); // refresh revenue
        setBannerAlert(`User's Premium level toggled!`);
        setTimeout(() => setBannerAlert(''), 3000);
      }
    } catch (err) { console.error(err); }
  };

  // Movie CRUD actions
  const handleDeleteMovie = async (mid: string) => {
    if (!window.confirm("Senpai, are you sure you want to delete this title? This action is permanent!")) return;
    try {
      const res = await fetch(`/api/movies/${mid}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        onRefreshCatalog();
        fetchStats();
        setBannerAlert(`Movie deleted from servers success!`);
        setTimeout(() => setBannerAlert(''), 3000);
      }
    } catch (err) { console.error(err); }
  };

  const openAddForm = () => {
    setEditingMovieId(null);
    setFormTitle('');
    setFormDescription('');
    setFormReleaseDate('2026-06-19');
    setFormDuration('1h 30m');
    setFormGenre('Anime, Action, Comedy');
    setFormCategory('anime');
    setFormRating('8.5');
    setFormThumbnail('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600');
    setFormBanner('https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200');
    setFormTrailer('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4');
    setFormStreaming('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4');
    setFormDownload('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4');
    setFormLanguage('Japanese (Dual Audio)');
    setFormCast('Voice Actors, Koko-Chan');
    setFormDirector('Momo-Sensei');
    setFormEpisodes([]);
    setNewEpTitle('');
    setNewEpNumber('');
    setNewEpSeason('1');
    setNewEpDuration('24m');
    setNewEpStreaming('');
    setShowFormModal(true);
  };

  const openEditForm = (movie: Movie) => {
    setEditingMovieId(movie.id);
    setFormTitle(movie.title);
    setFormDescription(movie.description);
    setFormReleaseDate(movie.releaseDate);
    setFormDuration(movie.duration);
    setFormGenre(movie.genre.join(', '));
    setFormCategory(movie.category);
    setFormRating(movie.rating.toString());
    setFormThumbnail(movie.thumbnail);
    setFormBanner(movie.bannerImage);
    setFormTrailer(movie.trailerUrl);
    setFormStreaming(movie.streamingUrl);
    setFormDownload(movie.downloadUrl);
    setFormLanguage(movie.language);
    setFormCast(movie.cast.join(', '));
    setFormDirector(movie.director);
    setFormEpisodes(movie.episodes || []);
    setNewEpTitle('');
    setNewEpNumber('');
    setNewEpSeason('1');
    setNewEpDuration('24m');
    setNewEpStreaming('');
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      title: formTitle,
      description: formDescription,
      releaseDate: formReleaseDate,
      duration: formDuration,
      genre: formGenre.split(',').map(s => s.trim()),
      category: formCategory,
      rating: parseFloat(formRating) || 8.0,
      thumbnail: formThumbnail,
      bannerImage: formBanner,
      trailerUrl: formTrailer,
      streamingUrl: formStreaming,
      downloadUrl: formDownload,
      language: formLanguage,
      cast: formCast.split(',').map(s => s.trim()),
      director: formDirector,
      episodes: formEpisodes
    };

    try {
      const url = editingMovieId ? `/api/movies/${editingMovieId}` : `/api/movies`;
      const method = editingMovieId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowFormModal(false);
        onRefreshCatalog();
        fetchStats();
        setBannerAlert(editingMovieId ? `CineVerse title edited successfully!` : `New release cataloged successfully!`);
        setTimeout(() => setBannerAlert(''), 3000);
      } else {
        const er = await res.json();
        alert(er.error || "Save movie failure");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="frosted-glass backdrop-blur-xl text-white rounded-3xl p-6 border border-white/10 shadow-2xl relative">
      
      {/* Decorative neon top rail header */}
      <div className="py-2.5 px-4 mb-6 rounded-xl bg-gradient-to-r from-red-600/15 via-amber-500/15 to-[#00E5FF]/20 border border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <span className="text-xs font-mono font-black tracking-wider text-red-500 uppercase">
            CineVerse Multi-System Administrator Area
          </span>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">AUTHORIZED PERSONNEL ONLY</span>
      </div>

      {bannerAlert && (
        <div className="mb-4 bg-[#00E5FF]/10 border border-[#00E5FF] text-[#00E5FF] rounded-lg p-3 text-center text-xs font-semibold animate-bounce tracking-wide uppercase">
          {bannerAlert}
        </div>
      )}

      {/* Main layout container with tabs side */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar navigation tab */}
        <div className="flex flex-row md:flex-col gap-2 shrink-0 border-b md:border-b-0 md:border-r border-white/8 pb-4 md:pb-0 md:pr-6 md:w-56 overflow-x-auto">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2.5 rounded-lg text-left text-xs font-bold uppercase transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'stats' 
                ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_rgba(0,229,255,0.3)]' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-2.5 rounded-lg text-left text-xs font-bold uppercase transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'movies' 
                ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_rgba(0,229,255,0.3)]' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Manage Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-lg text-left text-xs font-bold uppercase transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'users' 
                ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_rgba(0,229,255,0.3)]' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users Control</span>
          </button>
        </div>

        {/* Tab content panel display area */}
        <div className="flex-1 min-w-0">
          
          {/* TAB 1: ANALYTICS STATS VIEW */}
          {activeTab === 'stats' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-black text-white uppercase tracking-wider">CineVerse General Analytics</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white/4 border border-white/8 rounded-xl relative overflow-hidden backdrop-blur-md">
                  <TrendingUp className="absolute top-2 right-2 w-10 h-10 text-[#00E5FF]/10" />
                  <p className="text-[10px] text-gray-400 uppercase font-mono font-bold">Total Users</p>
                  <p className="text-2xl font-black mt-2 text-[#00E5FF]">{stats?.totalUsers || '---'}</p>
                  <span className="text-[9px] text-[#00E5FF]/80 font-mono font-semibold">+18% this month</span>
                </div>

                <div className="p-4 bg-white/4 border border-white/8 rounded-xl relative overflow-hidden backdrop-blur-md">
                  <Users className="absolute top-2 right-2 w-10 h-10 text-[#00E5FF]/10" />
                  <p className="text-[10px] text-gray-400 uppercase font-mono font-bold">Active Streamers</p>
                  <p className="text-2xl font-black mt-2 text-white">{stats?.activeUsers || '---'}</p>
                  <span className="text-[9px] text-green-400 font-mono font-semibold">● 42 streaming now</span>
                </div>

                <div className="p-4 bg-white/4 border border-white/8 rounded-xl relative overflow-hidden backdrop-blur-md">
                  <Download className="absolute top-2 right-2 w-10 h-10 text-[#00E5FF]/10" />
                  <p className="text-[10px] text-gray-400 uppercase font-mono font-bold">Downloads registered</p>
                  <p className="text-2xl font-black mt-2 text-white">{stats?.downloadsCount || '---'}</p>
                  <span className="text-[9px] text-gray-500 font-mono">Offline-mode saves</span>
                </div>

                <div className="p-4 bg-white/4 border border-white/8 rounded-xl relative overflow-hidden backdrop-blur-md">
                  <DollarSign className="absolute top-2 right-2 w-10 h-10 text-emerald-500/10" />
                  <p className="text-[10px] text-gray-400 uppercase font-mono font-bold">Monthly Revenue</p>
                  <p className="text-2xl font-black mt-2 text-emerald-400">${stats?.monthlyRevenue || '---'}</p>
                  <span className="text-[9px] text-emerald-400 font-mono">+$240 this week</span>
                </div>
              </div>

              {/* Graphical representation lists in analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                
                {/* Most Viewed list */}
                <div className="p-4 bg-white/4 border border-white/8 rounded-xl backdrop-blur-md">
                  <h3 className="text-xs font-bold uppercase text-[#00E5FF] tracking-wider mb-4 border-b border-white/5 pb-2">
                    Most Viewed Titles
                  </h3>
                  <div className="space-y-3.5">
                    {stats?.mostViewed.map((mv, idx) => (
                      <div key={mv.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 truncate">
                          <span className="font-mono text-[#00E5FF] font-black">#{idx+1}</span>
                          <span className="text-white font-medium truncate">{mv.title}</span>
                        </div>
                        <span className="text-gray-400 font-mono">{mv.views.toLocaleString()} plays</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated Watch Time Metrics */}
                <div className="p-4 bg-white/4 border border-white/8 rounded-xl backdrop-blur-md">
                  <h3 className="text-xs font-bold uppercase text-[#00E5FF] tracking-wider mb-4 border-b border-white/5 pb-2">
                    Hourly Watch Time Distribution
                  </h3>
                  <p className="text-[11px] text-gray-400 mb-3">Total watch hours register across platforms: <strong className="text-white">{stats?.watchTimeHours} Hours</strong></p>
                  
                  {/* progress bars representing categories */}
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-300">Anime Streams</span>
                        <span className="text-yellow-400 font-bold">62%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '62%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-300">Feature Movies</span>
                        <span className="text-red-500 font-bold">28%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '28%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-300">TV Series</span>
                        <span className="text-[#00E5FF] font-bold">10%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="bg-[#00E5FF] h-1.5 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MOVIE CATALOG CRUD */}
          {activeTab === 'movies' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h2 className="text-lg font-black text-white uppercase tracking-wider">CineVerse Video Library</h2>
                <button
                  onClick={openAddForm}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold uppercase transition-all flex items-center space-x-1 hover:shadow-[0_0_12px_#E50914] cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add New Title</span>
                </button>
              </div>

              {/* Movies active database table */}
              <div className="overflow-x-auto border border-white/8 rounded-2xl bg-white/3 backdrop-blur-md">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/4 border-b border-white/8 text-gray-400 font-mono uppercase text-[10px]">
                      <th className="p-3">Video Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Genre</th>
                      <th className="p-3 text-center">Plays</th>
                      <th className="p-3 text-center animate-pulse">Rating</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {moviesList.map((movie) => (
                      <tr key={movie.id} className="hover:bg-white/5 transition-all">
                        <td className="p-3 font-semibold text-white max-w-xs truncate">
                          <p className="truncate font-sans font-black">{movie.title}</p>
                          <span className="text-[9px] text-gray-500 font-mono font-medium block italic">{movie.director}</span>
                        </td>
                        <td className="p-3 capitalize text-gray-300 font-mono font-medium">{movie.category}</td>
                        <td className="p-3 max-w-[150px] truncate text-gray-400 font-sans">{movie.genre.join(', ')}</td>
                        <td className="p-3 text-center font-mono text-[#00E5FF] font-medium">{movie.views.toLocaleString()}</td>
                        <td className="p-3 text-center font-mono text-yellow-400 font-bold">★ {movie.rating.toFixed(1)}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditForm(movie)}
                              className="p-1 px-2.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-[#00E5FF] transition-colors border border-gray-700 cursor-pointer"
                              title="Edit Movie details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMovie(movie.id)}
                              className="p-1 px-2.5 rounded bg-red-600/10 hover:bg-red-600 hover:text-white text-red-500 transition-all border border-red-500/20 cursor-pointer"
                              title="Delete Movie catalog"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: USER SUSPENSION & CONTROL ROOM */}
          {activeTab === 'users' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-black text-white uppercase tracking-wider border-b border-gray-800 pb-3">
                Security Control Room
              </h2>

              <div className="overflow-x-auto border border-white/8 rounded-2xl bg-white/3 backdrop-blur-md">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/4 border-b border-white/8 text-gray-400 font-mono uppercase text-[10px]">
                      <th className="p-3">User Email</th>
                      <th className="p-3">Username</th>
                      <th className="p-3 text-center">Status Levels</th>
                      <th className="p-3 text-center">Type Access</th>
                      <th className="p-3 text-right">Restrict / Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-all">
                        <td className="p-3 font-semibold text-white font-mono">{u.email}</td>
                        <td className="p-3 font-medium text-gray-300">{u.username}</td>
                        <td className="p-3 text-center">
                          {u.isBanned ? (
                            <span className="px-2 py-0.5 rounded text-[8px] font-mono font-black border border-red-500/40 text-red-500 bg-red-500/10 uppercase">
                              BANNED
                            </span>
                          ) : u.isSuspended ? (
                            <span className="px-2 py-0.5 rounded text-[8px] font-mono font-black border border-yellow-500/40 text-yellow-500 bg-yellow-500/10 uppercase">
                              SUSPENDED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[8px] font-mono font-black border border-green-500/40 text-green-500 bg-green-500/10 uppercase">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono">
                          {u.role === 'admin' ? (
                            <span className="px-2 py-0.5 text-[8px] rounded border border-red-500 text-red-400 font-bold">Admin</span>
                          ) : u.isPremium ? (
                            <span className="px-2 py-0.5 text-[8px] rounded border border-yellow-500 text-yellow-500 bg-yellow-500/5 font-black uppercase tracking-wider">PREMIUM</span>
                          ) : (
                            <span className="px-2 py-0.5 text-[8px] rounded border border-gray-700 text-gray-500">Standard</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {u.role === 'admin' ? (
                            <span className="text-[10px] text-gray-500 font-mono">Root protected</span>
                          ) : (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => togglePremium(u.id)}
                                className={`text-[10px] uppercase font-mono font-black px-2.5 py-1 rounded transition-colors cursor-pointer ${
                                  u.isPremium 
                                    ? 'bg-amber-500 text-black font-extrabold' 
                                    : 'bg-gray-800 text-gray-300 hover:text-white border border-gray-700'
                                }`}
                                title="Toggle Premium plan status"
                              >
                                Premium
                              </button>
                              <button
                                onClick={() => toggleSuspend(u.id)}
                                className={`text-[10px] uppercase font-mono px-2.5 py-1 rounded transition-colors cursor-pointer ${
                                  u.isSuspended 
                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' 
                                    : 'bg-gray-800 text-gray-300 hover:bg-yellow-600/10 hover:text-yellow-400'
                                }`}
                              >
                                {u.isSuspended ? 'Suspended' : 'Suspend'}
                              </button>
                              <button
                                onClick={() => toggleBan(u.id)}
                                className={`text-[10px] uppercase font-mono px-2.5 py-1 rounded transition-all cursor-pointer ${
                                  u.isBanned 
                                    ? 'bg-red-600 text-white font-bold' 
                                    : 'bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white border border-red-500/15'
                                }`}
                              >
                                {u.isBanned ? 'Unban' : 'Ban'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* MODAL FORM OVERLAY FOR MOVIE SAVE/EDIT */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto scrollbar-thin">
          <div className="frosted-glass-premium border border-white/12 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative my-8 text-xs font-sans max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-1.5 mb-5 border-b border-white/10 pb-3">
              <Sparkles className="w-4 h-4 text-[#00E5FF]" />
              <h3 className="text-sm font-black uppercase text-[#00E5FF] tracking-wider">
                {editingMovieId ? `Edit Film: ${formTitle}` : 'Create New Movie Listing'}
              </h3>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1 font-bold">Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#00E5FF]/45 backdrop-blur-sm focus:ring-1 focus:ring-[#00E5FF]/20"
                    placeholder="Sintel - Chronicles"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1 font-bold">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#00E5FF]/45 backdrop-blur-sm focus:ring-1 focus:ring-[#00E5FF]/20"
                  >
                    <option value="movies">Feature Movie</option>
                    <option value="anime">Anime Choice</option>
                    <option value="series">TV Episode Series</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1 font-bold">Release Date</label>
                  <input
                    type="date"
                    value={formReleaseDate}
                    onChange={(e) => setFormReleaseDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1 font-bold">Duration String</label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none"
                    placeholder="2h 15m or 24m"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1 font-bold">Rating Value</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={formRating}
                    onChange={(e) => setFormRating(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1 font-bold">Language Spec</label>
                  <input
                    type="text"
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none"
                    placeholder="Japanese (Dual Dub - English Subs)"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1 font-bold">Genres (Comma separated)</label>
                  <input
                    type="text"
                    value={formGenre}
                    onChange={(e) => setFormGenre(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none"
                    placeholder="Anime, Fantasy, Sci-Fi"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1 font-bold">Director Name</label>
                  <input
                    type="text"
                    value={formDirector}
                    onChange={(e) => setFormDirector(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none"
                    placeholder="Christopher Nolan"
                  />
                </div>

              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1 font-bold">Detailed Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
                  rows={2.5}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#00E5FF]/45 backdrop-blur-sm focus:ring-1 focus:ring-[#00E5FF]/20"
                  placeholder="Enter dynamic movie overview details..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1 font-bold">Thumbnail artwork URL</label>
                  <input
                    type="text"
                    value={formThumbnail}
                    onChange={(e) => setFormThumbnail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1 font-bold">Wide Banner Image URL</label>
                  <input
                    type="text"
                    value={formBanner}
                    onChange={(e) => setFormBanner(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1 font-bold">Movie Stream Link (Video Track)</label>
                  <input
                    type="text"
                    value={formStreaming}
                    onChange={(e) => setFormStreaming(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1 font-bold">Direct Offline Download URL</label>
                  <input
                    type="text"
                    value={formDownload}
                    onChange={(e) => setFormDownload(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1 font-bold">Trailer preview URL</label>
                  <input
                    type="text"
                    value={formTrailer}
                    onChange={(e) => setFormTrailer(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1 font-bold">Main cast (Comma separated)</label>
                  <input
                    type="text"
                    value={formCast}
                    onChange={(e) => setFormCast(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none"
                    placeholder="Keanu Reeves, Laurence Fishburne"
                  />
                </div>

              </div>

              {/* Episodes & Seasons Section */}
              <div className="border-t border-white/10 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#00E5FF] uppercase font-mono font-black tracking-wider">
                    🎬 Episodes & Seasons Manager ({formEpisodes.length} Episodes)
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">Set season-wise / episode-wise stream parts</span>
                </div>

                {/* Sub-list of currently drafted episodes */}
                {formEpisodes.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto border border-white/5 bg-black/20 rounded-xl p-2.5 scrollbar-thin">
                    {formEpisodes.map((ep, idx) => (
                      <div key={ep.id || idx} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-3 py-1.5 gap-2">
                        <div className="flex items-center space-x-2 truncate min-w-0">
                          <span className="text-[9px] font-mono bg-[#00E5FF]/20 text-[#00E5FF] px-1.5 py-0.5 rounded shrink-0">
                            S{ep.seasonNumber || 1} Ep{ep.episodeNumber}
                          </span>
                          <span className="text-white font-bold text-xs truncate">{ep.title}</span>
                          <span className="text-[9px] text-gray-500 font-mono shrink-0">({ep.duration})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormEpisodes(formEpisodes.filter((_, i) => i !== idx));
                          }}
                          className="text-[9px] text-red-500 hover:text-white hover:bg-red-600/40 px-2 py-0.5 rounded transition-all cursor-pointer font-black font-mono uppercase shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-500 italic">No custom episodes added. This item will stream as a single unit or we will generate default episodes when saved.</p>
                )}

                {/* Quick Add Episode Box Form */}
                <div className="bg-white/5 border border-white/8 rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] uppercase font-mono font-bold text-gray-300 block">
                    ⚡ Quick-Add Episode Panel
                  </span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[9px] text-gray-400 font-mono mb-1 font-semibold">Season Number</label>
                      <input
                        type="number"
                        min="1"
                        value={newEpSeason}
                        onChange={(e) => setNewEpSeason(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1 text-white text-[11px] focus:outline-none"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-400 font-mono mb-1 font-semibold">Episode Number</label>
                      <input
                        type="number"
                        min="1"
                        value={newEpNumber}
                        onChange={(e) => setNewEpNumber(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1 text-white text-[11px] focus:outline-none"
                        placeholder="e.g. 1"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] text-gray-400 font-mono mb-1 font-semibold">Episode Title</label>
                      <input
                        type="text"
                        value={newEpTitle}
                        onChange={(e) => setNewEpTitle(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1 text-white text-[11px] focus:outline-none"
                        placeholder="e.g. The Battle of Tokyo Dome"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] text-gray-400 font-mono mb-1 font-semibold">Duration (String)</label>
                      <input
                        type="text"
                        value={newEpDuration}
                        onChange={(e) => setNewEpDuration(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1 text-white text-[11px] focus:outline-none"
                        placeholder="e.g. 24m"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] text-gray-400 font-mono mb-1 font-semibold flex items-center justify-between">
                        <span>Streaming Player URL</span>
                        <button
                          type="button"
                          onClick={() => setNewEpStreaming(formStreaming)}
                          className="text-[8px] text-[#00E5FF] hover:underline cursor-pointer"
                        >
                          Use Main Stream URL
                        </button>
                      </label>
                      <input
                        type="text"
                        value={newEpStreaming}
                        onChange={(e) => setNewEpStreaming(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1 text-white text-[11px] focus:outline-none"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!newEpTitle || !newEpNumber) {
                        alert("Senpai, please enter at least an Episode Title and Episode Number!");
                        return;
                      }
                      const epNum = parseInt(newEpNumber) || 1;
                      const sNum = parseInt(newEpSeason) || 1;
                      const streamUrl = newEpStreaming.trim() || formStreaming || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4";
                      const thumb = formThumbnail || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300";
                      
                      const newEp = {
                        id: `ep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        title: newEpTitle,
                        episodeNumber: epNum,
                        seasonNumber: sNum,
                        duration: newEpDuration,
                        streamingUrl: streamUrl,
                        thumbnail: thumb
                      };

                      setFormEpisodes([...formEpisodes, newEp].sort((a, b) => {
                        const diffS = (a.seasonNumber || 1) - (b.seasonNumber || 1);
                        if (diffS !== 0) return diffS;
                        return a.episodeNumber - b.episodeNumber;
                      }));

                      // reset episode fields
                      setNewEpTitle('');
                      setNewEpNumber((epNum + 1).toString());
                      setNewEpStreaming('');
                    }}
                    className="w-full py-1.5 bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black font-bold uppercase tracking-wide text-[10px] rounded border border-[#00E5FF]/40 transition-all cursor-pointer text-center"
                  >
                    ➕ Register Episode inside Catalog
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 text-xs font-semibold uppercase text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#00E5FF] text-black font-black uppercase text-xs tracking-wider rounded-full hover:shadow-[0_0_15px_#00E5FF] transition-all cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving Movie...' : (editingMovieId ? 'Apply Changes' : 'Publish Title')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
