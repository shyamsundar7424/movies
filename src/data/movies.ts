import { Movie, AnimeMascot } from '../types';

export const INITIAL_MOVIES: Movie[] = [
  {
    id: "sintel-saga",
    title: "Sintel - Chronicles of Fantasy",
    description: "A lonely young woman named Sintel searches for her companion, a baby dragon named Scales. She faces numerous perils on her quest through deserts, snowscapes, and dangerous caverns, leading up to a heart-wrenching confrontation.",
    releaseDate: "2010-09-27",
    duration: "15m",
    genre: ["Anime", "Fantasy", "Action", "Adventure"],
    category: "anime",
    rating: 8.8,
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80", // Anime artwork
    bannerImage: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    language: "Japanese (Dual Audio - English Subs)",
    cast: ["Sintel (Voice)", "Mao (Voice)", "Shaman (Voice)"],
    director: "Colin Levy",
    views: 45000,
    downloads: 12400,
    isTrending: true,
    isTopRated: true,
    episodes: [
      { id: "sintel-ep-1", title: "Scale's Flight", duration: "15m", thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300", streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", episodeNumber: 1 }
    ]
  },
  {
    id: "tears-of-steel",
    title: "Tears of Steel - Cyberpunk Neo",
    description: "Set in a sci-fi dystopian Tokyo, a group of scientists try to save the city from giant destructive robots by using technology to communicate and reconnect with a cybernetic woman's lingering memories of her lost love.",
    releaseDate: "2012-09-12",
    duration: "12m",
    genre: ["Sci-Fi", "Cyberpunk", "Action", "Visual Effects"],
    category: "movies",
    rating: 8.2,
    thumbnail: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80", // Cyberpunk neon art
    bannerImage: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    language: "English (Stereo 5.1)",
    cast: ["Derek de Lint", "Rogier Schippers", "Denise Rebergen"],
    director: "Ian Hubert",
    views: 32000,
    downloads: 8900,
    isTrending: true,
    isLatest: true
  },
  {
    id: "big-buck-bunny",
    title: "Big Buck Bunny: Neko mischief",
    description: "A colossal, friendly rabbit (Bunny-Sama) decides to take humorous but strategic revenge against three mischievous forest rodents who continuously torment him, squish his beloved butterflies, and ruin his sunny afternoon.",
    releaseDate: "2008-05-30",
    duration: "10m",
    genre: ["Animation", "Comedy", "Family", "Chibi"],
    category: "anime",
    rating: 8.5,
    thumbnail: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80", // Animated art
    bannerImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    language: "Japanese (Dolby Atmos)",
    cast: ["Bunny", "Frank the Squirrel", "Rinky", "Gamera"],
    director: "Sacha Goedegebure",
    views: 58000,
    downloads: 14200,
    isTrending: true,
    isTopRated: true,
    episodes: [
      { id: "bbb-ep-1", title: "A Peaceful Garden", duration: "5m", thumbnail: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300", streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", episodeNumber: 1 },
      { id: "bbb-ep-2", title: "The Squirrel's Revenge", duration: "5m", thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300", streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", episodeNumber: 2 }
    ]
  },
  {
    id: "subaru-drift",
    title: "Subaru Legacy: Tokyo Street Racer",
    description: "An underground neon racer strives to conquer the winding mountain passes of Tokyo. Backed by his cute co-pilot fox mascot, he tests the limits of speed, machine, and courage in an race for street dominance.",
    releaseDate: "2024-03-10",
    duration: "1h 48m",
    genre: ["Action", "Thriller", "Sports", "Racing"],
    category: "movies",
    rating: 7.9,
    thumbnail: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80", // Sports car
    bannerImage: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&auto=format&fit=crop&q=80",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    language: "Japanese (English Subtitles)",
    cast: ["Kenjiro", "Yuki-chan", "Akira-Sama"],
    director: "Takeshi Shioda",
    views: 18400,
    downloads: 3600,
    isLatest: true
  },
  {
    id: "dreams-of-eternity",
    title: "Dreams of Eternity - Shaman Chronicles",
    description: "In a world where dreams materialize as physical realms, a high-schooler discovers a hidden portal and journeys to the stars with a mechanical kitty and an ancient sorceress to undo a curse that freezes time.",
    releaseDate: "2023-11-20",
    duration: "15m",
    genre: ["Anime", "Fantasy", "Mystery", "Drama"],
    category: "anime",
    rating: 8.9,
    thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80", // Anime star landscape
    bannerImage: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&auto=format&fit=crop&q=80",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    language: "Japanese (Japanese Audio / English Subs)",
    cast: ["Ayano (Voice)", "Hiroshi (Voice)", "Momo (Voice)"],
    director: "Koji Kusanagi",
    views: 29500,
    downloads: 6500,
    isTopRated: true,
    isLatest: true
  },
  {
    id: "cyber-neon-escape",
    title: "Cyber Neon: Escape Project",
    description: "An edge-of-your-seat thriller about a rogue android who flees a corporate testing lab in search of humanity, with the aid of an eccentric system analyst and a rogue hacker crew in Neo-Seoul.",
    releaseDate: "2025-01-15",
    duration: "1h 35m",
    genre: ["Sci-Fi", "Cyberpunk", "Action", "Thriller"],
    category: "movies",
    rating: 8.1,
    thumbnail: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=600&auto=format&fit=crop&q=80", // Cyber/Neon
    bannerImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    language: "English (Stereo)",
    cast: ["Zoe Saldana", "Aaron Paul", "Simu Liu"],
    director: "Denis Villeneuve",
    views: 24700,
    downloads: 4100,
    isLatest: true
  },
  {
    id: "neon-guardian-shinobi",
    title: "Neon Guardian: Shinobi-Five",
    description: "Five shinobi masters from different eras are summoned to a cyber-neon future to block an inter-dimensional warlord from deleting earth's historical records. Fast, stylized combat, and gorgeous hand-drawn action.",
    releaseDate: "2024-05-18",
    duration: "24m",
    genre: ["Anime", "Action", "Martial Arts", "Cyberpunk"],
    category: "series",
    rating: 8.6,
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80", // Cyber punk/Shinobi gaming feel
    bannerImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    language: "Japanese (Dual Audio)",
    cast: ["Ryu (Voice)", "Ken (Voice)", "Chun-Li (Voice)"],
    director: "Yoshiaki Kawajiri",
    views: 39000,
    downloads: 9800,
    isTrending: true,
    episodes: [
      { id: "shinobi-ep-1", title: "The Cyber Summoning", duration: "12m", thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300", streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", episodeNumber: 1 },
      { id: "shinobi-ep-2", title: "Shinobi vs Cyber-Dragon", duration: "12m", thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300", streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", episodeNumber: 2 }
    ]
  },
  {
    id: "chibi-kitchen",
    title: "Chibi Koko's Kitchen Chronicles",
    description: "Follow Koko-chan (CineVerse's resident cat mascot) and her food-loving friends on a series of culinary adventures, where recipes come to life and every hot-pot comes packed with a magical story and high stakes laughing fits.",
    releaseDate: "2023-08-01",
    duration: "24m",
    genre: ["Anime", "Slice of Life", "Comedy", "Chibi"],
    category: "series",
    rating: 8.4,
    thumbnail: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=600&auto=format&fit=crop&q=80", // Pop Banana/Fruit
    bannerImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    language: "Japanese Audio / Dual Track",
    cast: ["Koko (Voice)", "Momo (Voice)", "Yoki (Voice)"],
    director: "Naoko Yamada",
    views: 42100,
    downloads: 11200,
    isTrending: true,
    episodes: [
      { id: "kitchen-ep-1", title: "Fluffy Souffle Panic", duration: "12m", thumbnail: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=300", streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", episodeNumber: 1 },
      { id: "kitchen-ep-2", title: "The Sovereign Curry Clash", duration: "12m", thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300", streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", episodeNumber: 2 }
    ]
  }
];

export const ANIME_MASCOTS: AnimeMascot[] = [
  {
    id: "koko-chan",
    name: "Koko-Chan (Neko Mascot)",
    avatar: "🐱",
    personality: "Enthusiastic, cute, and slightly clumsy sweet cat girl who absolutely adores buttered popcorn and epic action movies.",
    greetingQuotes: [
      "Nyaa~! Welcome to CineVerse, Senpai! Ready for a magnificent movie night?",
      "Purrr! Popcorn is fresh, the neon are glowing, and I've warmed up the best couch cushion for you!",
      "H-Heii! Did you forget your snacks? Worry not, Koko-Chan has spare cat-treats! Let's watch together!"
    ],
    recommendationQuotes: [
      "Kyaa! For you, Koko recommends this spectacular title. It has dragons and action, just like my favorite dreams!",
      "Based on what you enjoy, Koko feels this next choice is absolutely 'SUGOI'! Nya~",
      "I consulted the cosmos (and my popcorn bag) and they voted for this cinematic masterpiece!"
    ],
    restrictedQuotes: [
      "Unyuu~! Senpai, guest time is over! To keep watching with Koko-Chan, please log in or sign up! It's super fast, I promise!",
      "N-No-no! Guests aren't allowed to download films! Please register a CineVerse account so I can package this safely for you!"
    ]
  },
  {
    id: "momo-sensei",
    name: "Momo-Sensei (Mochi Rabbit)",
    avatar: "🐰",
    personality: "Wise, philosophical, sleepy rabbit guru who wears a monocle, drinks matcha, and writes elaborate movie critiques.",
    greetingQuotes: [
      "Ah. Welcome, scholar of cinema. Let us immerse ourselves in works of depth and neon brilliance.",
      "*Yawn* Welcome to CineVerse. Remember, a movie isn't just frames; it is active emotional philosophy.",
      "Aha! The light of neon stimulates my intellect. Come, let us select a title together."
    ],
    recommendationQuotes: [
      "The cinematic pacing of this work satisfies my strict criteria. I highly recommend it for your elevated tastes.",
      "A profound selection. My ears twitch in intense anticipation. Watch this immediately.",
      "Looking at your record, this matches your intellectual trajectory perfectly. Excellent choice."
    ],
    restrictedQuotes: [
      "A boundary has been reached. Guest screening is limited to five minutes. Please authenticate to access the archives.",
      "Downloads require a permanent CineVerse registration. It helps keep our server bunnies fed and happy."
    ]
  },
  {
    id: "neon-kitsune",
    name: "Neon-Kitsune (Retro Fox)",
    avatar: "🦊",
    personality: "Energetic, cyber-ninjutsu fox who loves fast drift racing, hyper-pop music, and dual-audio anime series.",
    greetingQuotes: [
      "Yo-yo! Kit here! Are we ready to rev up some high-fps cinematic action, friend?",
      "Vroom! The neon street races are about to start on screen! Grab your candy, let's drift!",
      "Hey! Let's get these streams fired up. Zero buffering, max excitement. Let's go!"
    ],
    recommendationQuotes: [
      "This movie has max power, high-octane chases, and superb sound design! It's an absolute must-watch!",
      "If you hate boring stuff, Kit suggests this hyper-active legendary selection! Pure aesthetic fire!",
      "I calculated the speed coordinates, and this matches your high-velocity style perfectly! Play it!"
    ],
    restrictedQuotes: [
      "Whoa! Red light, buddy! Your 5-minute guest license has expired! Sign up or log in to keep drifting with us!",
      "Access Denied! Offline downloads are premium corporate tech. Register a CineVerse account to unlock!"
    ]
  }
];
