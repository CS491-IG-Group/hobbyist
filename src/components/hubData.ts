/* ------------------------------------------------------------------ */
/*  Central hub data used by CategoryPage and HubPage                 */
/* ------------------------------------------------------------------ */

export interface HubItem {
    name: string;
    year: string;
    rating: string;
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
                    { name: "Resident Evil 4 Remake", year: "2023", rating: "9.4" },
                    { name: "Resident Evil Village", year: "2021", rating: "8.9" },
                    { name: "Resident Evil 2 Remake", year: "2019", rating: "9.2" },
                    { name: "Resident Evil 5", year: "2009", rating: "7.8" },
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
                    { name: "Final Fantasy VII Rebirth", year: "2024", rating: "9.3" },
                    { name: "Final Fantasy XVI", year: "2023", rating: "8.7" },
                    { name: "Final Fantasy XIV", year: "2013", rating: "9.5" },
                    { name: "Final Fantasy X", year: "2001", rating: "9.1" },
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
                    { name: "Season 1", year: "2020", rating: "8.7" },
                    { name: "Jujutsu Kaisen 0 (Film)", year: "2021", rating: "8.5" },
                    { name: "Season 2 – Hidden Inventory", year: "2023", rating: "9.1" },
                    { name: "Season 2 – Shibuya Incident", year: "2023", rating: "9.4" },
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
                    { name: "Season 1", year: "2013", rating: "8.9" },
                    { name: "Season 2", year: "2017", rating: "8.5" },
                    { name: "Season 3 Part 2", year: "2019", rating: "9.6" },
                    { name: "The Final Season Part 3", year: "2023", rating: "9.0" },
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
                    { name: "ANTI", year: "2016", rating: "9.0" },
                    { name: "Unapologetic", year: "2012", rating: "8.3" },
                    { name: "Loud", year: "2010", rating: "8.6" },
                    { name: "Good Girl Gone Bad", year: "2007", rating: "8.8" },
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
                    { name: "Un Verano Sin Ti", year: "2022", rating: "9.2" },
                    { name: "YHLQMDLG", year: "2020", rating: "8.9" },
                    { name: "El Último Tour Del Mundo", year: "2020", rating: "8.5" },
                    { name: "nadie sabe lo que va a pasar mañana", year: "2023", rating: "8.1" },
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
                    { name: "The CrossFit Open", year: "2024", rating: "9.0" },
                    { name: "CrossFit Games", year: "2023", rating: "9.3" },
                    { name: "Murph Challenge", year: "Annual", rating: "9.5" },
                    { name: "Fran (Benchmark WOD)", year: "Classic", rating: "8.7" },
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
                    { name: "Vinyasa Flow", year: "Style", rating: "9.1" },
                    { name: "Ashtanga Primary Series", year: "Style", rating: "8.8" },
                    { name: "Yin Yoga", year: "Style", rating: "9.0" },
                    { name: "Hot Yoga (Bikram)", year: "Style", rating: "8.3" },
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
                    { name: "The Shining", year: "1977", rating: "9.3" },
                    { name: "IT", year: "1986", rating: "9.0" },
                    { name: "The Stand", year: "1978", rating: "9.4" },
                    { name: "11/22/63", year: "2011", rating: "9.2" },
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
                    { name: "Norwegian Wood", year: "1987", rating: "8.8" },
                    { name: "Kafka on the Shore", year: "2002", rating: "9.1" },
                    { name: "1Q84", year: "2009", rating: "8.6" },
                    { name: "The Wind-Up Bird Chronicle", year: "1994", rating: "9.3" },
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
                    { name: "Aseprite", year: "Tool", rating: "9.5" },
                    { name: "Piskel", year: "Tool", rating: "8.4" },
                    { name: "Lospec Palette List", year: "Resource", rating: "9.0" },
                    { name: "Pixel Dailies Challenge", year: "Community", rating: "8.9" },
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
                    { name: "Helvetica (Documentary)", year: "2007", rating: "8.5" },
                    { name: "Google Fonts", year: "Resource", rating: "9.2" },
                    { name: "Type@Cooper Program", year: "Education", rating: "9.0" },
                    { name: "Fonts In Use", year: "Resource", rating: "8.8" },
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
