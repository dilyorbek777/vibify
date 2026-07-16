export interface ThemeColors {
  primary: string;
  'primary-foreground': string;
  background: string;
  foreground: string;
  card: string;
  'card-foreground': string;
  muted: string;
  'muted-foreground': string;
  border: string;
  ring: string;
}

export interface Theme {
  name: string;
  id: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export const themes: Theme[] = [
  {
    name: "Neutral",
    id: "neutral",
    light: {
      primary: "240 5.9% 10%",
      "primary-foreground": "0 0% 98%",
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "240 4.8% 95.9%",
      "card-foreground": "240 10% 3.9%",
      muted: "240 4.8% 95.9%",
      "muted-foreground": "240 3.8% 46.1%",
      border: "240 5.9% 90%",
      ring: "240 5.9% 10%",
    },
    dark: {
      primary: "0 0% 98%",
      "primary-foreground": "240 5.9% 10%",
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      "card-foreground": "0 0% 98%",
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      border: "240 3.7% 15.9%",
      ring: "240 4.9% 83.9%",
    },
  },
  {
    name: "Lime",
    id: "lime",
    light: {
      primary: "142 76% 36%",
      "primary-foreground": "0 0% 100%",
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "142 76% 96%",
      "card-foreground": "240 10% 3.9%",
      muted: "142 76% 96%",
      "muted-foreground": "142 70% 50%",
      border: "142 76% 80%",
      ring: "142 76% 36%",
    },
    dark: {
      primary: "142 71% 45%",
      "primary-foreground": "0 0% 100%",
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      "card-foreground": "0 0% 98%",
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      border: "240 3.7% 15.9%",
      ring: "142 71% 45%",
    },
  },
  {
    name: "Sky",
    id: "sky",
    light: {
      primary: "199 89% 48%",
      "primary-foreground": "0 0% 100%",
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "199 89% 96%",
      "card-foreground": "240 10% 3.9%",
      muted: "199 89% 96%",
      "muted-foreground": "199 89% 50%",
      border: "199 89% 80%",
      ring: "199 89% 48%",
    },
    dark: {
      primary: "199 89% 48%",
      "primary-foreground": "0 0% 100%",
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      "card-foreground": "0 0% 98%",
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      border: "240 3.7% 15.9%",
      ring: "199 89% 48%",
    },
  },
  {
    name: "Yellow",
    id: "yellow",
    light: {
      primary: "48 96% 53%",
      "primary-foreground": "0 0% 100%",
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "48 96% 96%",
      "card-foreground": "240 10% 3.9%",
      muted: "48 96% 96%",
      "muted-foreground": "48 96% 50%",
      border: "48 96% 80%",
      ring: "48 96% 53%",
    },
    dark: {
      primary: "48 96% 53%",
      "primary-foreground": "0 0% 100%",
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      "card-foreground": "0 0% 98%",
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      border: "240 3.7% 15.9%",
      ring: "48 96% 53%",
    },
  },
  {
    name: "Orange",
    id: "orange",
    light: {
      primary: "25 95% 53%",
      "primary-foreground": "0 0% 100%",
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "25 95% 96%",
      "card-foreground": "240 10% 3.9%",
      muted: "25 95% 96%",
      "muted-foreground": "25 95% 50%",
      border: "25 95% 80%",
      ring: "25 95% 53%",
    },
    dark: {
      primary: "25 95% 53%",
      "primary-foreground": "0 0% 100%",
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      "card-foreground": "0 0% 98%",
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      border: "240 3.7% 15.9%",
      ring: "25 95% 53%",
    },
  },
  {
    name: "Crimson",
    id: "crimson",
    light: {
      primary: "346 77% 50%",
      "primary-foreground": "0 0% 100%",
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "346 77% 96%",
      "card-foreground": "240 10% 3.9%",
      muted: "346 77% 96%",
      "muted-foreground": "346 77% 50%",
      border: "346 77% 80%",
      ring: "346 77% 50%",
    },
    dark: {
      primary: "346 77% 50%",
      "primary-foreground": "0 0% 100%",
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      "card-foreground": "0 0% 98%",
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      border: "240 3.7% 15.9%",
      ring: "346 77% 50%",
    },
  },
];


export const topArtists = [
  {
    rank: 1,
    artist: "Bad Bunny",
    global_streams_2026: "11.5 Billion",
    primary_genre: "Latin / Reggaeton",
    notable_achievement: "Most streamed artist globally across all platforms in 2026.",
    image:"https://is1-ssl.mzstatic.com/image/thumb/Features211/v4/6c/92/d4/6c92d475-7be5-8b7a-a7d8-fdc3d937629e/mza_9478576998108878943.png/400x400bb.jpg"
  },
  {
    rank: 2,
    artist: "Taylor Swift",
    global_streams_2026: "8.4 Billion",
    primary_genre: "Pop / Country",
    notable_achievement: "First female artist to break past major streaming milestones on Spotify.",
    image:"https://is1-ssl.mzstatic.com/image/thumb/AMCArtistImages221/v4/70/30/3b/70303b1c-4744-57b7-27be-5cb94a8fc3cb/ami-identity-994af5c375f4c3aa96cd6ced4a700799-2025-09-26T18-27-12.403Z_cropped.png/400x400bb.jpg"
  },
  {
    rank: 3,
    artist: "Drake",
    global_streams_2026: "6.5 Billion",
    primary_genre: "Hip-Hop / Rap",
    notable_achievement: "Remains the most dominant overall cross-platform charting force.",
  },
  {
    rank: 4,
    artist: "Bruno Mars",
    global_streams_2026: "5.6 Billion",
    primary_genre: "Pop / R&B",
    notable_achievement: "Leads the year in total monthly active listeners globally.",
  },
  {
    rank: 5,
    artist: "The Weeknd",
    global_streams_2026: "5.4 Billion",
    primary_genre: "R&B / Pop",
    notable_achievement: "Holds the record for the first artist to ever pass 100 million monthly listeners.",
  },
  {
    rank: 6,
    artist: "BTS",
    global_streams_2026: "4.7 Billion",
    primary_genre: "K-Pop",
    notable_achievement: "Highest streaming group globally across all streaming platforms.",
  },
  {
    rank: 7,
    artist: "Justin Bieber",
    global_streams_2026: "3.8 Billion",
    primary_genre: "Pop",
    notable_achievement: "Maintains a top 10 position for most-followed artist accounts.",
  },
  {
    rank: 8,
    artist: "Rihanna",
    global_streams_2026: "3.7 Billion",
    primary_genre: "Pop / R&B",
    notable_achievement: "Stays in the top tier globally purely driven by a deep legacy catalog.",
  },
  {
    rank: 9,
    artist: "Ariana Grande",
    global_streams_2026: "3.6 Billion",
    primary_genre: "Pop",
    notable_achievement: "Scored massive hits with collaborative duets across the charts.",
  },
  {
    rank: 10,
    artist: "Billie Eilish",
    global_streams_2026: "3.5 Billion",
    primary_genre: "Alternative Pop",
    notable_achievement: "The youngest artist in history to cross 100 million monthly active listeners.",
  },
  {
    rank: 11,
    artist: "Michael Jackson",
    global_streams_2026: "3.2 Billion",
    primary_genre: "Pop / Rock",
    notable_achievement: "Oldest historical legacy artist to hit 100 million monthly listeners.",
  },
  {
    rank: 12,
    artist: "Arijit Singh",
    global_streams_2026: "3.1 Billion",
    primary_genre: "Bollywood / Indian Pop",
    notable_achievement: "The single most-followed artist platform-wide on Spotify globally.",
  },
  {
    rank: 13,
    artist: "Madonna",
    global_streams_2026: "2.9 Billion",
    primary_genre: "Pop / Dance",
    notable_achievement: "First living artist over the age of 60 to top the Billboard Artist 100 chart.",
  },
  {
    rank: 14,
    artist: "Ella Langley",
    global_streams_2026: "2.8 Billion",
    primary_genre: "Country",
    notable_achievement: "Spent 13 massive weeks holding down the No. 1 spot on the Hot 100.",
  },
  {
    rank: 15,
    artist: "Lady Gaga",
    global_streams_2026: "2.7 Billion",
    primary_genre: "Pop",
    notable_achievement: "Dominated charts via massive viral streaming collaborations.",
  },
  {
    rank: 16,
    artist: "Eminem",
    global_streams_2026: "2.6 Billion",
    primary_genre: "Hip-Hop",
    notable_achievement: "Remains the most-followed and most-streamed solo rapper of all time.",
  },
  {
    rank: 17,
    artist: "Ed Sheeran",
    global_streams_2026: "2.5 Billion",
    primary_genre: "Pop",
    notable_achievement: "Secures a permanent hold in the top 5 most-followed artists globally.",
  },
  {
    rank: 18,
    artist: "Tate McRae",
    global_streams_2026: "2.4 Billion",
    primary_genre: "Pop",
    notable_achievement: "Surpassed 20.8 billion cumulative career streams this year.",
  },
  {
    rank: 19,
    artist: "Olivia Rodrigo",
    global_streams_2026: "2.2 Billion",
    primary_genre: "Pop / Rock",
    notable_achievement: "Consistently logged multiple simultaneous tracks in the top 20 charts.",
  },
  {
    rank: 20,
    artist: "Cody Johnson",
    global_streams_2026: "2.1 Billion",
    primary_genre: "Country",
    notable_achievement: "Won ACM Entertainer of the Year and reached 8 billion career streams.",
  }
]
