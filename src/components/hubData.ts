/* ------------------------------------------------------------------ */
/*  Central hub data used by CategoryPage and HubPage                 */
/* ------------------------------------------------------------------ */

export interface ItemReview {
    author: string;
    avatar: string;
    rating: number;
    text: string;
    date: string;
}

export interface HubItem {
    name: string;
    year: string;
    rating: string;
    genre?: string;
    description?: string;
    reviews?: ItemReview[];
}

export interface HubDetail {
    id: string;
    name: string;
    description: string;
    emoji: string;
    gradientFrom: string;
    gradientTo: string;
    posts: number;
    members: number;
    items: HubItem[];
}

export interface CategoryData {
    id: string;
    name: string;
    description: string;
    emoji: string;
    gradientFrom: string;
    gradientTo: string;
    hubs: HubDetail[];
}

const categories: CategoryData[] = [
    /* ── Gaming ───────────────────────────────────────────────────── */
    {
        id: "gaming",
        name: "Gaming",
        description:
            "Talk about your favorite games, share tips, and find co-op buddies.",
        emoji: "🎮",
        gradientFrom: "#4c1d95",
        gradientTo: "#7c3aed",
        hubs: [
            {
                id: "resident-evil",
                name: "Resident Evil",
                description:
                    "Survive the horror. Discuss lore, speedruns, and every terrifying encounter across the franchise.",
                emoji: "🧟",
                gradientFrom: "#1a1a2e",
                gradientTo: "#6b0f1a",
                posts: 1234,
                members: 1234,
                items: [
                    {
                        name: "Resident Evil 4 Remake",
                        year: "2023",
                        rating: "9.4",
                        genre: "Survival Horror",
                        description:
                            "A remake of the classic survival horror game featuring modernized gameplay mechanics while maintaining the essence of the original. Leon S. Kennedy's mission to rescue the President's daughter takes him to a mysterious village in Europe.",
                        reviews: [
                            {
                                author: "Alex Rivera",
                                avatar: "AR",
                                rating: 10,
                                text: "This remake is absolutely phenomenal! The updated graphics and gameplay mechanics breathe new life into a classic. The over-the-shoulder camera feels more refined, and the horror atmosphere is incredible.",
                                date: "2 days ago",
                            },
                            {
                                author: "Jordan Lee",
                                avatar: "JL",
                                rating: 9,
                                text: "Capcom nailed this. The pacing, the tension, the set pieces — everything feels carefully crafted. My only minor gripe is that some of the camp from the original is toned down.",
                                date: "1 week ago",
                            },
                            {
                                author: "Sam Chen",
                                avatar: "SC",
                                rating: 10,
                                text: "A masterclass in how to do a remake. Every area feels fresh yet familiar. The knife parry system adds a whole new layer of strategy.",
                                date: "2 weeks ago",
                            },
                            {
                                author: "Taylor Kim",
                                avatar: "TK",
                                rating: 9,
                                text: "The village section is one of the best opening sequences in gaming history. This remake does justice to the original while adding modern quality-of-life improvements.",
                                date: "3 weeks ago",
                            },
                            {
                                author: "Morgan Patel",
                                avatar: "MP",
                                rating: 9,
                                text: "Incredible game. The boss fights are reworked brilliantly and the new side quests add welcome depth to an already packed experience.",
                                date: "1 month ago",
                            },
                        ],
                    },
                    {
                        name: "Resident Evil Village",
                        year: "2021",
                        rating: "8.9",
                        genre: "Survival Horror",
                        description:
                            "Ethan Winters' story continues as he searches for his kidnapped daughter in a mysterious village filled with monstrous creatures and gothic horrors.",
                        reviews: [
                            {
                                author: "Casey Brooks",
                                avatar: "CB",
                                rating: 9,
                                text: "Lady Dimitrescu's castle alone is worth the price of admission. The variety of environments keeps things fresh throughout.",
                                date: "5 days ago",
                            },
                            {
                                author: "Riley Quinn",
                                avatar: "RQ",
                                rating: 8,
                                text: "Great atmosphere and enemy variety. The Beneviento house section is genuinely terrifying. Loses some steam in the factory area though.",
                                date: "2 weeks ago",
                            },
                        ],
                    },
                    {
                        name: "Resident Evil 2 Remake",
                        year: "2019",
                        rating: "9.2",
                        genre: "Survival Horror",
                        description:
                            "A faithful yet modernized reimagining of the 1998 classic. Play as Leon Kennedy or Claire Redfield in their harrowing escape from Raccoon City.",
                        reviews: [
                            {
                                author: "Avery Torres",
                                avatar: "AT",
                                rating: 10,
                                text: "Mr. X roaming the halls of the police station is peak survival horror. This set the gold standard for remakes.",
                                date: "1 week ago",
                            },
                            {
                                author: "Devon Park",
                                avatar: "DP",
                                rating: 9,
                                text: "Both campaigns feel distinct and rewarding. The licker encounters in the dark hallways are absolutely terrifying.",
                                date: "3 weeks ago",
                            },
                        ],
                    },
                    {
                        name: "Resident Evil 5",
                        year: "2009",
                        rating: "7.8",
                        genre: "Action Horror",
                        description:
                            "Chris Redfield and Sheva Alomar team up in Africa to investigate a bioterrorist threat. Features co-op gameplay throughout the campaign.",
                    },
                ],
            },
            {
                id: "final-fantasy",
                name: "Final Fantasy",
                description:
                    "From pixel art origins to cinematic RPGs — relive and discuss the legendary saga.",
                emoji: "⚔️",
                gradientFrom: "#0c1445",
                gradientTo: "#3b82f6",
                posts: 2891,
                members: 3420,
                items: [
                    {
                        name: "Final Fantasy VII Rebirth",
                        year: "2024",
                        rating: "9.3",
                        genre: "Action RPG",
                        description:
                            "The second part of the Final Fantasy VII remake trilogy. Cloud and his companions venture beyond Midgar in an expansive open-world adventure with stunning visuals and an evolved combat system.",
                        reviews: [
                            {
                                author: "Kai Nakamura",
                                avatar: "KN",
                                rating: 10,
                                text: "Square Enix outdid themselves. The open world is gorgeous and the story additions feel meaningful rather than padding.",
                                date: "3 days ago",
                            },
                            {
                                author: "Jamie Wong",
                                avatar: "JW",
                                rating: 9,
                                text: "The Gold Saucer section is a game within a game. So much content packed into this sequel. Combat is refined to near-perfection.",
                                date: "1 week ago",
                            },
                        ],
                    },
                    {
                        name: "Final Fantasy XVI",
                        year: "2023",
                        rating: "8.7",
                        genre: "Action RPG",
                        description:
                            "A darker, more mature entry in the series following Clive Rosfield's quest for vengeance. Features real-time action combat and spectacular Eikon battles.",
                    },
                    {
                        name: "Final Fantasy XIV",
                        year: "2013",
                        rating: "9.5",
                        genre: "MMORPG",
                        description:
                            "A massively multiplayer online RPG that rose from the ashes to become one of the most beloved MMOs ever made, with critically acclaimed expansions.",
                        reviews: [
                            {
                                author: "Luna Starling",
                                avatar: "LS",
                                rating: 10,
                                text: "Endwalker's story brought me to tears. This is the best narrative experience in any MMO, period.",
                                date: "4 days ago",
                            },
                        ],
                    },
                    {
                        name: "Final Fantasy X",
                        year: "2001",
                        rating: "9.1",
                        genre: "Turn-based RPG",
                        description:
                            "Follow Tidus and Yuna on their pilgrimage across Spira. A timeless story of love, sacrifice, and defying fate with a beloved turn-based combat system.",
                    },
                ],
            },
        ],
    },

    /* ── Anime & Manga ────────────────────────────────────────────── */
    {
        id: "anime",
        name: "Anime & Manga",
        description:
            "Discuss the latest seasons, share recommendations, and debate best arcs.",
        emoji: "🌸",
        gradientFrom: "#831843",
        gradientTo: "#be185d",
        hubs: [
            {
                id: "jujutsu-kaisen",
                name: "Jujutsu Kaisen",
                description:
                    "Cursed energy awaits. Break down fights, theories, and the latest manga chapters.",
                emoji: "👁️",
                gradientFrom: "#1e1b4b",
                gradientTo: "#4338ca",
                posts: 3150,
                members: 4210,
                items: [
                    {
                        name: "Season 1",
                        year: "2020",
                        rating: "8.7",
                        genre: "Shōnen",
                        description:
                            "Yuji Itadori swallows a cursed finger and enters the world of Jujutsu sorcerers. A brilliant introduction to the series with incredible animation by MAPPA.",
                        reviews: [
                            {
                                author: "Hiro Tanaka",
                                avatar: "HT",
                                rating: 9,
                                text: "MAPPA's animation is on another level. The fight choreography, especially Gojo vs Jogo, set the bar insanely high for the series.",
                                date: "1 week ago",
                            },
                        ],
                    },
                    {
                        name: "Jujutsu Kaisen 0 (Film)",
                        year: "2021",
                        rating: "8.5",
                        genre: "Shōnen Film",
                        description:
                            "A prequel film following Yuta Okkotsu as he enrolls at Tokyo Jujutsu High while haunted by the spirit of his childhood friend.",
                    },
                    {
                        name: "Season 2 – Hidden Inventory",
                        year: "2023",
                        rating: "9.1",
                        genre: "Shōnen",
                        description:
                            "A flashback arc exploring young Gojo and Geto's mission to protect the Star Plasma Vessel. Reveals the tragic origins of the series' greatest rivalry.",
                    },
                    {
                        name: "Season 2 – Shibuya Incident",
                        year: "2023",
                        rating: "9.4",
                        genre: "Shōnen",
                        description:
                            "The most devastating arc in the series. An all-out war erupts in Shibuya as cursed spirits execute their plan to seal Gojo Satoru.",
                        reviews: [
                            {
                                author: "Mika Aoi",
                                avatar: "MA",
                                rating: 10,
                                text: "Episode 17 broke the internet for a reason. This arc is a masterpiece of tension, stakes, and emotional devastation.",
                                date: "3 days ago",
                            },
                            {
                                author: "Ren Nakamura",
                                avatar: "RN",
                                rating: 9,
                                text: "The animation quality is unreal despite the controversy around production conditions. Every episode feels like a movie.",
                                date: "1 week ago",
                            },
                        ],
                    },
                ],
            },
            {
                id: "attack-on-titan",
                name: "Attack on Titan",
                description:
                    "Dedicate your hearts. Relive the journey from Wall Maria to the ending.",
                emoji: "⚡",
                gradientFrom: "#3f0d12",
                gradientTo: "#a71d31",
                posts: 5420,
                members: 7800,
                items: [
                    {
                        name: "Season 1",
                        year: "2013",
                        rating: "8.9",
                        genre: "Dark Fantasy",
                        description:
                            "Humanity lives within enormous walled cities to protect themselves from Titans. When a Colossal Titan breaches the outer wall, Eren Yeager vows to destroy every Titan.",
                    },
                    {
                        name: "Season 2",
                        year: "2017",
                        rating: "8.5",
                        genre: "Dark Fantasy",
                        description:
                            "Secrets about the Titans begin to unravel as the Survey Corps faces betrayals within their own ranks. A shorter but revelation-packed season.",
                    },
                    {
                        name: "Season 3 Part 2",
                        year: "2019",
                        rating: "9.6",
                        genre: "Dark Fantasy",
                        description:
                            "The battle for Wall Maria reaches its climax and the truth of the world beyond the walls is finally revealed. Widely considered the peak of the series.",
                        reviews: [
                            {
                                author: "Levi Fan",
                                avatar: "LF",
                                rating: 10,
                                text: "The basement reveal changed everything. This season turned an already great anime into a generational masterpiece.",
                                date: "2 days ago",
                            },
                            {
                                author: "Erwin Smith",
                                avatar: "ES",
                                rating: 10,
                                text: "The charge and Levi vs Beast Titan is the single greatest sequence in anime history. Perfect pacing, perfect stakes.",
                                date: "1 week ago",
                            },
                        ],
                    },
                    {
                        name: "The Final Season Part 3",
                        year: "2023",
                        rating: "9.0",
                        genre: "Dark Fantasy",
                        description:
                            "The conclusion of the epic saga. The Rumbling has begun and the remaining characters must decide the fate of humanity.",
                    },
                ],
            },
        ],
    },

    /* ── Music ─────────────────────────────────────────────────────── */
    {
        id: "music",
        name: "Music",
        description:
            "Share playlists, discover new artists, and chat about concerts.",
        emoji: "🎵",
        gradientFrom: "#1e3a5f",
        gradientTo: "#3b82f6",
        hubs: [
            {
                id: "rihanna",
                name: "Rihanna",
                description:
                    "From Pon de Replay to ANTI — celebrate the queen of reinvention.",
                emoji: "💎",
                gradientFrom: "#4a0e4e",
                gradientTo: "#c026d3",
                posts: 1870,
                members: 3250,
                items: [
                    {
                        name: "ANTI",
                        year: "2016",
                        rating: "9.0",
                        genre: "R&B / Pop",
                        description:
                            "Rihanna's eighth studio album marked a bold artistic departure, blending R&B, reggae, and punk influences into her most cohesive and critically acclaimed project.",
                        reviews: [
                            {
                                author: "Diamond Navy",
                                avatar: "DN",
                                rating: 10,
                                text: "Every track is a vibe. From 'Consideration' to 'Close to You,' this album proves Rihanna is more than pop hits — she's an artist.",
                                date: "4 days ago",
                            },
                        ],
                    },
                    {
                        name: "Unapologetic",
                        year: "2012",
                        rating: "8.3",
                        genre: "Pop / Dance",
                        description:
                            "Features the mega-hit 'Diamonds' and showcases Rihanna's boldest persona yet with an unapologetic blend of EDM, pop, and R&B.",
                    },
                    {
                        name: "Loud",
                        year: "2010",
                        rating: "8.6",
                        genre: "Pop / Dance-pop",
                        description:
                            "Home to iconic singles like 'Only Girl (In the World)' and 'S&M.' A high-energy pop album that dominated radio worldwide.",
                    },
                    {
                        name: "Good Girl Gone Bad",
                        year: "2007",
                        rating: "8.8",
                        genre: "Pop / R&B",
                        description:
                            "The album that transformed Rihanna into a global superstar. 'Umbrella' became a defining pop anthem of the 2000s.",
                    },
                ],
            },
            {
                id: "bad-bunny",
                name: "Bad Bunny",
                description:
                    "Reggaetón, trap, and beyond. Discuss the albums, tours, and cultural impact.",
                emoji: "🐰",
                gradientFrom: "#064e3b",
                gradientTo: "#10b981",
                posts: 2340,
                members: 4100,
                items: [
                    {
                        name: "Un Verano Sin Ti",
                        year: "2022",
                        rating: "9.2",
                        genre: "Reggaetón / Latin Pop",
                        description:
                            "A vibrant summer album blending reggaetón, dembow, indie pop, and mambo. It became the most-streamed album globally and earned a Grammy nomination for Album of the Year.",
                        reviews: [
                            {
                                author: "Carlos Vega",
                                avatar: "CV",
                                rating: 10,
                                text: "This isn't just an album, it's a cultural movement. Every track captures the essence of a perfect Caribbean summer.",
                                date: "5 days ago",
                            },
                        ],
                    },
                    {
                        name: "YHLQMDLG",
                        year: "2020",
                        rating: "8.9",
                        genre: "Reggaetón / Latin Trap",
                        description:
                            "Bad Bunny's sophomore effort showcases an impressive range of Latin urban sounds with features from Daddy Yankee, Anuel AA, and Sech.",
                    },
                    {
                        name: "El Último Tour Del Mundo",
                        year: "2020",
                        rating: "8.5",
                        genre: "Rock / Latin Alternative",
                        description:
                            "A genre-bending project leaning into rock, punk, and alternative influences. An experimental departure that showed Bad Bunny's artistic ambition.",
                    },
                    {
                        name: "nadie sabe lo que va a pasar mañana",
                        year: "2023",
                        rating: "8.1",
                        genre: "Reggaetón / Dembow",
                        description:
                            "A return to raw reggaetón roots with gritty production and streetwise lyricism. Features collaborations with established and emerging Latin artists.",
                    },
                ],
            },
        ],
    },

    /* ── Fitness ───────────────────────────────────────────────────── */
    {
        id: "fitness",
        name: "Fitness",
        description:
            "Track workouts, share routines, and motivate each other to stay active.",
        emoji: "💪",
        gradientFrom: "#14532d",
        gradientTo: "#22c55e",
        hubs: [
            {
                id: "crossfit",
                name: "CrossFit",
                description:
                    "WODs, PRs, and community. Share your progress and compete with fellow athletes.",
                emoji: "🏋️",
                gradientFrom: "#1c1917",
                gradientTo: "#b45309",
                posts: 980,
                members: 1640,
                items: [
                    { name: "The CrossFit Open", year: "2024", rating: "9.0", genre: "Competition", description: "The world's largest participatory sporting event in history. Athletes of all levels compete in weekly workouts to qualify for the next stage." },
                    { name: "CrossFit Games", year: "2023", rating: "9.3", genre: "Competition", description: "The ultimate test of fitness. Athletes compete across a variety of grueling events to determine the Fittest on Earth." },
                    { name: "Murph Challenge", year: "Annual", rating: "9.5", genre: "Hero WOD", description: "A tribute workout honoring Lt. Michael Murphy. Consists of a 1-mile run, 100 pull-ups, 200 push-ups, 300 squats, and another 1-mile run, all wearing a 20 lb vest." },
                    { name: "Fran (Benchmark WOD)", year: "Classic", rating: "8.7", genre: "Benchmark", description: "One of CrossFit's most iconic benchmark workouts: 21-15-9 thrusters and pull-ups. Simple, brutal, and a true test of fitness." },
                ],
            },
            {
                id: "yoga",
                name: "Yoga",
                description:
                    "Find your flow. Explore styles, share routines, and deepen your practice.",
                emoji: "🧘",
                gradientFrom: "#134e4a",
                gradientTo: "#2dd4bf",
                posts: 760,
                members: 1320,
                items: [
                    { name: "Vinyasa Flow", year: "Style", rating: "9.1", genre: "Dynamic", description: "A flowing style that links breath to movement. Known for its creative sequences and smooth transitions between poses." },
                    { name: "Ashtanga Primary Series", year: "Style", rating: "8.8", genre: "Traditional", description: "A demanding, set sequence of poses that builds internal heat and detoxifies the body. Follows a specific order every practice." },
                    { name: "Yin Yoga", year: "Style", rating: "9.0", genre: "Restorative", description: "A slow-paced practice where poses are held for 3–5 minutes to target deep connective tissues. Perfect for flexibility and meditation." },
                    { name: "Hot Yoga (Bikram)", year: "Style", rating: "8.3", genre: "Heated", description: "26 postures and 2 breathing exercises performed in a room heated to 105°F. Designed to systematically work every part of the body." },
                ],
            },
        ],
    },

    /* ── Reading ───────────────────────────────────────────────────── */
    {
        id: "reading",
        name: "Reading",
        description:
            "Book clubs, reviews, and reading challenges for every genre.",
        emoji: "📚",
        gradientFrom: "#78350f",
        gradientTo: "#d97706",
        hubs: [
            {
                id: "stephen-king",
                name: "Stephen King",
                description:
                    "Enter the world of the Master of Horror. Discuss novels, adaptations, and the Dark Tower universe.",
                emoji: "👻",
                gradientFrom: "#1a1a2e",
                gradientTo: "#7f1d1d",
                posts: 1420,
                members: 2890,
                items: [
                    {
                        name: "The Shining",
                        year: "1977",
                        rating: "9.3",
                        genre: "Horror",
                        description:
                            "Jack Torrance takes a job as the winter caretaker of the isolated Overlook Hotel, where supernatural forces drive him toward violence and madness.",
                        reviews: [
                            {
                                author: "Stephen R.",
                                avatar: "SR",
                                rating: 9,
                                text: "An absolute classic. King's portrayal of a family unraveling under isolation and supernatural influence is masterful. The hedge maze scenes still give me chills.",
                                date: "1 week ago",
                            },
                        ],
                    },
                    { name: "IT", year: "1986", rating: "9.0", genre: "Horror", description: "A group of childhood friends known as the Losers' Club must face their worst fears when an ancient evil terrorizes their hometown of Derry, Maine." },
                    { name: "The Stand", year: "1978", rating: "9.4", genre: "Post-Apocalyptic", description: "After a deadly plague wipes out most of humanity, survivors are drawn to two sides: the benevolent Mother Abagail or the sinister Randall Flagg." },
                    { name: "11/22/63", year: "2011", rating: "9.2", genre: "Sci-Fi / Historical", description: "A high school teacher discovers a portal to 1958 and attempts to prevent the assassination of JFK. King's masterful blend of time travel, romance, and suspense." },
                ],
            },
            {
                id: "haruki-murakami",
                name: "Haruki Murakami",
                description:
                    "Surreal, introspective, and unforgettable. Dive into discussions of novels, short stories, and themes.",
                emoji: "🌙",
                gradientFrom: "#0c0a20",
                gradientTo: "#4338ca",
                posts: 870,
                members: 1540,
                items: [
                    { name: "Norwegian Wood", year: "1987", rating: "8.8", genre: "Literary Fiction", description: "A nostalgic coming-of-age story set in 1960s Tokyo. Toru Watanabe navigates love, loss, and memory in Murakami's most realistic and emotionally direct novel." },
                    { name: "Kafka on the Shore", year: "2002", rating: "9.1", genre: "Magical Realism", description: "Two parallel storylines — a teenage runaway and an elderly man who talks to cats — converge in this dreamlike exploration of fate, identity, and the subconscious." },
                    { name: "1Q84", year: "2009", rating: "8.6", genre: "Speculative Fiction", description: "An epic three-book novel set in an alternate 1984. Aomame and Tengo's intertwined fates play out against a world with two moons and a mysterious cult." },
                    { name: "The Wind-Up Bird Chronicle", year: "1994", rating: "9.3", genre: "Surrealist Fiction", description: "Toru Okada's search for his missing cat leads him down a metaphysical rabbit hole involving a mysterious woman, wartime atrocities, and an underground world." },
                ],
            },
        ],
    },

    /* ── Art & Design ──────────────────────────────────────────────── */
    {
        id: "art",
        name: "Art & Design",
        description:
            "Showcase your creations, get feedback, and find creative inspiration.",
        emoji: "🎨",
        gradientFrom: "#701a75",
        gradientTo: "#c026d3",
        hubs: [
            {
                id: "pixel-art",
                name: "Pixel Art",
                description:
                    "Tiny pixels, big creativity. Share sprites, tilesets, and retro-inspired art.",
                emoji: "🕹️",
                gradientFrom: "#172554",
                gradientTo: "#2563eb",
                posts: 640,
                members: 1120,
                items: [
                    { name: "Aseprite", year: "Tool", rating: "9.5", genre: "Software", description: "The industry-standard pixel art editor. Features animation tools, layers, onion skinning, and a clean interface purpose-built for sprite work." },
                    { name: "Piskel", year: "Tool", rating: "8.4", genre: "Software", description: "A free online pixel art editor with real-time preview, animation support, and easy export options. Great for beginners and quick projects." },
                    { name: "Lospec Palette List", year: "Resource", rating: "9.0", genre: "Resource", description: "A comprehensive collection of curated color palettes specifically designed for pixel art. An essential reference for choosing harmonious limited palettes." },
                    { name: "Pixel Dailies Challenge", year: "Community", rating: "8.9", genre: "Community Event", description: "A daily Twitter/X challenge where pixel artists create art based on a theme. A fantastic way to practice consistently and connect with the community." },
                ],
            },
            {
                id: "typography",
                name: "Typography",
                description:
                    "Kerning, ligatures, and letterforms. Explore type design and font pairing.",
                emoji: "🔤",
                gradientFrom: "#1e1b4b",
                gradientTo: "#7c3aed",
                posts: 510,
                members: 890,
                items: [
                    { name: "Helvetica (Documentary)", year: "2007", rating: "8.5", genre: "Documentary", description: "An exploration of the world's most ubiquitous typeface. Interviews with designers reveal how one font became an inescapable part of modern visual culture." },
                    { name: "Google Fonts", year: "Resource", rating: "9.2", genre: "Resource", description: "A free library of over 1,500 open-source font families. An essential tool for web designers and developers seeking quality typography." },
                    { name: "Type@Cooper Program", year: "Education", rating: "9.0", genre: "Education", description: "A prestigious type design program at The Cooper Union in NYC. Offers workshops and extended studies in typeface design and lettering." },
                    { name: "Fonts In Use", year: "Resource", rating: "8.8", genre: "Inspiration", description: "An independent archive of typography in the wild. A curated collection of real-world type usage across print, web, and environmental design." },
                ],
            },
        ],
    },
];

export default categories;

/** Helper: find a category by its id */
export function getCategoryById(id: string): CategoryData | undefined {
    return categories.find((c) => c.id === id);
}

/** Helper: find a specific hub within a category */
export function getHubById(
    categoryId: string,
    hubId: string
): HubDetail | undefined {
    const cat = getCategoryById(categoryId);
    return cat?.hubs.find((h) => h.id === hubId);
}

/** Helper: find a specific item by index within a hub */
export function getItemByIndex(
    categoryId: string,
    hubId: string,
    itemIndex: number
): HubItem | undefined {
    const hub = getHubById(categoryId, hubId);
    return hub?.items[itemIndex];
}
