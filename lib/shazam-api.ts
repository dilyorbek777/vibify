interface ShazamArtwork {
  bgColor: string;
  hasP3: boolean;
  height: number;
  textColor1: string;
  textColor2: string;
  textColor3: string;
  textColor4: string;
  url: string;
  width: number;
}

interface ShazamSongAttributes {
  albumName: string;
  artistName: string;
  artwork: ShazamArtwork;
  audioLocale: string;
  audioTraits: string[];
  composerName: string;
  contentRating: string;
  discNumber: number;
  durationInMillis: number;
  genreNames: string[];
  name: string;
  playParams: {
    id: string;
    kind: string;
  };
  previewUrl?: string;
  previews?: Array<{ url: string }>;
  releaseDate: string;
  url: string;
}

interface ShazamSong {
  id: string;
  type: string;
  attributes: ShazamSongAttributes;
}

interface ShazamArtistAttributes {
  artwork: ShazamArtwork;
  genreNames: string[];
  name: string;
  url: string;
}

interface ShazamArtist {
  id: string;
  type: string;
  attributes: ShazamArtistAttributes;
}

interface ShazamResponse {
  results: {
    artists?: {
      data: ShazamArtist[];
    };
    songs: {
      data: ShazamSong[];
    };
  };
}

export interface SearchResult {
  type: 'song' | 'artist';
  data: ShazamSong | ShazamArtist;
}

const SHAZAM_API_HOST = 'shazam.p.rapidapi.com';

const CACHE_PREFIX = 'vibify_api_cache_';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(url: string, params?: Record<string, any>): string {
  const paramString = params ? JSON.stringify(params) : '';
  return `${CACHE_PREFIX}${btoa(url + paramString)}`;
}

function getCachedData<T>(cacheKey: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > CACHE_EXPIRY_MS;

    if (isExpired) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    console.log('Cache hit for:', cacheKey);
    return data as T;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

function setCachedData<T>(cacheKey: string, data: T): void {
  if (typeof window === 'undefined') return;

  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    console.log('Cached data for:', cacheKey);
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
}

function getApiKey(): string {
  return process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '4f8712d382mshfaa3517bffdad81p136abfjsn293bbff5b12b';
}

function getFallbackApiKey(): string {
  return process.env.NEXT_PUBLIC_RAPIDAPI_KEY2 || '';
}

function getThirdApiKey(): string {
  return process.env.NEXT_PUBLIC_RAPIDAPI_KEY3 || '';
}

function getFourthApiKey(): string {
  return process.env.NEXT_PUBLIC_RAPIDAPI_KEY4 || '';
}

async function fetchWithFallback(url: string, options: RequestInit): Promise<Response> {
  const firstKey = getApiKey();
  const fallbackKey = getFallbackApiKey();
  const thirdKey = getThirdApiKey();
  const fourthKey = getFourthApiKey();

  console.log('API Keys available:', {
    first: firstKey ? '✓' : '✗',
    fallback: fallbackKey ? '✓' : '✗',
    third: thirdKey ? '✓' : '✗',
    fourth: fourthKey ? '✓' : '✗',
  });

  const makeRequest = async (apiKey: string) => {
    const requestOptions = {
      ...options,
      headers: {
        ...options.headers,
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': SHAZAM_API_HOST,
      },
    };
    return fetch(url, requestOptions);
  };

  let response = await makeRequest(firstKey);

  if (!response.ok && response.status === 429 && fallbackKey) {
    console.log('Primary API key quota exceeded, trying fallback key');
    response = await makeRequest(fallbackKey);
  }

  if (!response.ok && response.status === 429 && thirdKey) {
    console.log('Fallback API key quota exceeded, trying third key');
    response = await makeRequest(thirdKey);
  }

  if (!response.ok && response.status === 429 && fourthKey) {
    console.log('Third API key quota exceeded, trying fourth key');
    response = await makeRequest(fourthKey);
  }

  return response;
}

export async function searchSongs(query: string, limit: number = 10, offset: number = 0): Promise<SearchResult[]> {
  const url = `https://${SHAZAM_API_HOST}/v2/search?term=${encodeURIComponent(query)}&locale=en-US&offset=${offset}&limit=${limit}`;
  const cacheKey = getCacheKey(url, { limit, offset });

  // Try to get cached data first
  const cachedData = getCachedData<SearchResult[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetchWithFallback(url, options);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait a moment before searching again.');
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result: any = await response.json();

    const results: SearchResult[] = [];

    // Handle artists from the new Apple Music API structure
    if (result.results?.artists?.data && Array.isArray(result.results.artists.data)) {
      result.results.artists.data.forEach((artist: ShazamArtist) => {
        results.push({ type: 'artist', data: artist });
      });
    }

    // Handle songs from the new Apple Music API structure
    if (result.results?.songs?.data && Array.isArray(result.results.songs.data)) {
      result.results.songs.data.forEach((song: ShazamSong) => {
        results.push({ type: 'song', data: song });
      });
    }

    // Fallback for older API structures
    if (results.length === 0) {
      if (result.tracks?.hits) {
        // Standard structure: { tracks: { hits: [{ track }] } }
        const tracks = result.tracks.hits.map((hit: any) => hit.track);
        tracks.forEach((track: ShazamSong) => {
          results.push({ type: 'song', data: track });
        });
      } else if (result.tracks) {
        // Alternative structure: { tracks: [...] }
        result.tracks.forEach((track: ShazamSong) => {
          results.push({ type: 'song', data: track });
        });
      } else if (Array.isArray(result)) {
        // Direct array response
        result.forEach((track: ShazamSong) => {
          results.push({ type: 'song', data: track });
        });
      } else if (result.list) {
        // Another possible structure: { list: [...] }
        result.list.forEach((track: ShazamSong) => {
          results.push({ type: 'song', data: track });
        });
      }
    }

    // Cache the results
    setCachedData(cacheKey, results);

    return results;
  } catch (error) {
    console.error('Error searching songs:', error);
    throw error;
  }
}

export function formatShazamTrack(track: ShazamSong) {
  const attrs = track.attributes;
  const durationMs = attrs.durationInMillis || 0;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Replace {w}x{h}bb with actual dimensions for cover art
  const coverArt = attrs.artwork?.url?.replace('{w}x{h}bb', '400x400bb') || '';

  // Extract preview URL from previews array
  const previewUrl = attrs.previews?.[0]?.url || '';

  return {
    id: track.id,
    name: attrs.name || 'Unknown',
    artist: attrs.artistName || 'Unknown',
    album: attrs.albumName || 'Unknown',
    duration,
    image: '🎵',
    url: attrs.url || '',
    coverArt,
    musicUrl: previewUrl, // Add musicUrl for audio playback
  };
}

export function formatShazamArtist(artist: ShazamArtist) {
  const attrs = artist.attributes;
  const coverArt = attrs.artwork?.url?.replace('{w}x{h}bb', '400x400bb') || '';

  return {
    id: artist.id,
    name: attrs.name || 'Unknown Artist',
    genres: attrs.genreNames || [],
    image: coverArt || '🎤',
    url: attrs.url || '',
  };
}

interface ArtistSummaryResponse {
  data: Array<{ id: string; type: string }>;
  resources: {
    albums: Record<string, { id: string; type: string; attributes: any }>;
    artists: Record<string, { id: string; type: string; attributes: any; relationships: any; views: any }>;
    songs: Record<string, { id: string; type: string; attributes: any }>;
  };
}

export async function getArtistSummary(artistId: string): Promise<ArtistSummaryResponse> {
  const url = `https://${SHAZAM_API_HOST}/artists/get-summary?id=${artistId}&l=en-US`;
  const cacheKey = getCacheKey(url);

  // Try to get cached data first
  const cachedData = getCachedData<ArtistSummaryResponse>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetchWithFallback(url, options);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait a moment before searching again.');
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result: ArtistSummaryResponse = await response.json();

    // Cache the results
    setCachedData(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error fetching artist summary:', error);
    throw error;
  }
}

export async function getSongDetails(id: string) {
  const url = `https://${SHAZAM_API_HOST}/songs/v2/get-details?id=${id}&l=en-US`;
  const cacheKey = getCacheKey(url);

  // Try to get cached data first
  const cachedData = getCachedData<any>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetchWithFallback(url, options);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait a moment before trying again.');
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result: any = await response.json();

    // Cache the results
    setCachedData(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error fetching song details:', error);
    throw error;
  }
}

// Apple Music API interfaces
interface AppleMusicArtwork {
  bgColor: string;
  defaultCropCode: string;
  hasP3: boolean;
  height: number;
  textColor1: string;
  textColor2: string;
  textColor3: string;
  textColor4: string;
  url: string;
  width: number;
}

interface AppleMusicArtistAttributes {
  artwork: AppleMusicArtwork;
  genreNames: string[];
  name: string;
  url: string;
}

interface AppleMusicRelationship {
  data: Array<{ id: string; type: string }>;
}

interface AppleMusicArtistRelationships {
  albums: AppleMusicRelationship;
}

interface AppleMusicArtistData {
  id: string;
  type: string;
  attributes: AppleMusicArtistAttributes;
  relationships: AppleMusicArtistRelationships;
}

interface AppleMusicArtistResponse {
  data: AppleMusicArtistData[];
}

interface AppleMusicAlbumAttributes {
  artwork: AppleMusicArtwork;
  artistName: string;
  genreNames: string[];
  isComplete: boolean;
  isSingle: boolean;
  name: string;
  releaseDate: string;
  url: string;
}

interface AppleMusicAlbumData {
  id: string;
  type: string;
  attributes: AppleMusicAlbumAttributes;
}

interface AppleMusicAlbumsResponse {
  data: AppleMusicAlbumData[];
}

const APPLE_MUSIC_API_HOST = 'apple-music-api.p.rapidapi.com';

export async function getArtistDetails(artistId: string): Promise<AppleMusicArtistData | null> {
  const url = `https://${SHAZAM_API_HOST}/artists/get-details?id=${artistId}&l=en-US`;
  const cacheKey = getCacheKey(url);

  // Try to get cached data first
  const cachedData = getCachedData<AppleMusicArtistData | null>(cacheKey);
  if (cachedData !== null) {
    return cachedData;
  }

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetchWithFallback(url, options);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait a moment before trying again.');
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result: any = await response.json();
    console.log('Artist details API response:', JSON.stringify(result, null, 2));

    // Handle different response structures
    let finalResult = null;
    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      finalResult = result.data[0];
    }

    // Cache the results
    setCachedData(cacheKey, finalResult);

    return finalResult;
  } catch (error) {
    console.error('Error fetching artist details:', error);
    throw error;
  }
}

export async function getArtistAlbums(artistId: string): Promise<AppleMusicAlbumData[]> {
  const url = `https://${SHAZAM_API_HOST}/artists/get-details?id=${artistId}&l=en-US`;
  const cacheKey = getCacheKey(url);

  // Try to get cached data first
  const cachedData = getCachedData<AppleMusicAlbumData[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetchWithFallback(url, options);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait a moment before trying again.');
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result: any = await response.json();
    console.log('Albums API response:', JSON.stringify(result, null, 2));

    // The artist details response includes album IDs in relationships
    let finalResult: AppleMusicAlbumData[] = [];
    if (result.data && result.data[0] && result.data[0].relationships && result.data[0].relationships.albums) {
      // Return the album IDs - we'll need to fetch details separately if needed
      finalResult = result.data[0].relationships.albums.data || [];
    }

    // Cache the results
    setCachedData(cacheKey, finalResult);

    return finalResult;
  } catch (error) {
    console.error('Error fetching artist albums:', error);
    throw error;
  }
}

export async function getArtistTopSongs(artistId: string): Promise<ShazamSong[]> {
  const url = `https://${SHAZAM_API_HOST}/artists/get-top-songs?id=${artistId}&l=en-US`;
  const cacheKey = getCacheKey(url);

  // Try to get cached data first
  const cachedData = getCachedData<ShazamSong[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetchWithFallback(url, options);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait a moment before trying again.');
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result: any = await response.json();
    console.log('Top songs API response:', JSON.stringify(result, null, 2));

    // Handle different response structures
    let finalResult: ShazamSong[] = [];
    if (result.data && Array.isArray(result.data)) {
      finalResult = result.data;
    }

    // Cache the results
    setCachedData(cacheKey, finalResult);

    return finalResult;
  } catch (error) {
    console.error('Error fetching artist top songs:', error);
    throw error;
  }
}

export function formatAppleMusicArtist(artist: AppleMusicArtistData) {
  const attrs = artist.attributes;
  const coverArt = attrs.artwork?.url?.replace('{w}x{h}bb', '400x400bb') || '';
  
  return {
    id: artist.id,
    name: attrs.name || 'Unknown Artist',
    image: coverArt || '🎤',
    genres: attrs.genreNames || [],
    url: attrs.url || '',
    verified: true,
  };
}

export function formatAppleMusicAlbum(album: AppleMusicAlbumData) {
  const attrs = album.attributes;
  
  // Handle case where we only have album ID (from relationships)
  if (!attrs) {
    return {
      id: album.id,
      name: 'Album',
      year: 0,
      image: '💿',
      artist: 'Unknown',
    };
  }
  
  const coverArt = attrs.artwork?.url?.replace('{w}x{h}bb', '400x400bb') || '';
  const year = attrs.releaseDate ? new Date(attrs.releaseDate).getFullYear() : 0;
  
  return {
    id: album.id,
    name: attrs.name || 'Unknown Album',
    year,
    image: coverArt || '💿',
    artist: attrs.artistName || 'Unknown',
  };
}

// Album API interfaces
interface AlbumArtwork {
  bgColor: string;
  hasP3: boolean;
  height: number;
  textColor1: string;
  textColor2: string;
  textColor3: string;
  textColor4: string;
  url: string;
  width: number;
}

interface EditorialNotes {
  short: string;
  standard: string;
}

interface AlbumAttributes {
  artistName: string;
  artwork: AlbumArtwork;
  audioTraits: string[];
  contentRating: string;
  copyright: string;
  editorialNotes: EditorialNotes;
  genreNames: string[];
  isCompilation: boolean;
  isComplete: boolean;
  isMasteredForItunes: boolean;
  isPrerelease: boolean;
  isSingle: boolean;
  name: string;
  playParams: {
    id: string;
    kind: string;
  };
  recordLabel: string;
  releaseDate: string;
  trackCount: number;
  upc: string;
  url: string;
}

interface TrackAttributes {
  albumArtistName: string;
  albumName: string;
  artistName: string;
  artwork: AlbumArtwork;
  audioLocale: string;
  audioTraits: string[];
  composerName: string;
  contentRating: string;
  discNumber: number;
  durationInMillis: number;
  genreNames: string[];
  hasLyrics: boolean;
  hasTimeSyncedLyrics: boolean;
  isAppleDigitalMaster: boolean;
  isMasteredForItunes: boolean;
  isVocalAttenuationAllowed: boolean;
  isrc: string;
  name: string;
  playParams: {
    id: string;
    kind: string;
  };
  previews: Array<{ url: string }>;
  releaseDate: string;
  trackNumber: number;
  url: string;
}

interface TrackData {
  id: string;
  type: string;
  attributes: TrackAttributes;
}

interface AlbumRelationships {
  artists: {
    data: Array<{ id: string; type: string }>;
  };
  tracks: {
    data: TrackData[];
  };
}

export interface AlbumData {
  id: string;
  type: string;
  attributes: AlbumAttributes;
  relationships: AlbumRelationships;
}

interface AlbumResponse {
  data: AlbumData[];
}

export async function getAlbumDetails(albumId: string): Promise<AlbumData | null> {
  const url = `https://${SHAZAM_API_HOST}/albums/get-details?id=${albumId}&l=en-US`;
  
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetchWithFallback(url, options);
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait a moment before trying again.');
      }
      if (response.status === 404) {
        throw new Error('Album not found');
      }
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const result: any = await response.json();
    console.log('Album details API response:', JSON.stringify(result, null, 2));
    
    // Handle API error responses
    if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
      const error = result.errors[0];
      if (error.status === '404' || error.code === '40400') {
        throw new Error('Album not found');
      }
      throw new Error(error.detail || error.title || 'Unknown API error');
    }
    
    // Handle different response structures
    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      return result.data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching album details:', error);
    throw error;
  }
}

export function formatAlbumTrack(track: TrackData) {
  const attrs = track.attributes;
  const durationMs = attrs.durationInMillis || 0;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  const coverArt = attrs.artwork?.url?.replace('{w}x{h}bb', '400x400bb') || '';
  const previewUrl = attrs.previews?.[0]?.url || '';
  
  return {
    id: track.id,
    name: attrs.name || 'Unknown',
    artist: attrs.artistName || 'Unknown',
    album: attrs.albumName || 'Unknown',
    duration,
    trackNumber: attrs.trackNumber,
    coverArt,
    previewUrl,
    url: attrs.url || '',
  };
}

// Music Detection API
interface DetectResponse {
  results?: {
    matches?: Array<{
      id: string
      type: string
    }>
  }
  resources?: {
    'shazam-songs'?: {
      [key: string]: {
        id: string
        type: string
        attributes: {
          title: string
          artist: string
          primaryArtist: string
          label: string
          explicit: boolean
          isrc: string
          webUrl: string
          images: {
            coverArt: string
            coverArtHq: string
            artistAvatar: string
          }
          artwork: {
            url: string
            textColor1: string
            textColor2: string
            textColor3: string
            textColor4: string
            bgColor: string
          }
          share: {
            subject: string
            text: string
            image: string
            html: string
          }
          genres: {
            primary: string
          }
          streaming: {
            preview: string
          }
        }
        relationships: {
          artists: {
            data: Array<{ id: string; type: string }>
          }
          albums: {
            data: Array<{ id: string; type: string }>
          }
        }
      }
    }
    artists?: {
      [key: string]: {
        id: string
        attributes: {
          name: string
          artwork: {
            url: string
            textColor1: string
            textColor2: string
            textColor3: string
            textColor4: string
            bgColor: string
          }
        }
      }
    }
    albums?: {
      [key: string]: {
        id: string
        attributes: {
          name: string
          artistName: string
          releaseDate: string
        }
      }
    }
  }
  meta?: {
    timestamp: number
    timezone: string
    tagId: string
  }
}

export async function detectSong(audioData: string): Promise<DetectResponse | null> {
  const url = 'https://shazam.p.rapidapi.com/songs/v3/detect?timezone=America%2FChicago&locale=en-US';
  
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': getApiKey(),
      'x-rapidapi-host': SHAZAM_API_HOST,
      'Content-Type': 'text/plain'
    },
    body: audioData
  };

  try {
    const response = await fetchWithFallback(url, options);
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait a moment before trying again.');
      }
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const result: DetectResponse = await response.json();
    console.log('Detection API response:', JSON.stringify(result, null, 2));
    
    // Return the full response for localStorage
    return result;
  } catch (error) {
    console.error('Error detecting song:', error);
    throw error;
  }
}
