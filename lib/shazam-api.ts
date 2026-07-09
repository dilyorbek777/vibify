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
  releaseDate: string;
  url: string;
}

interface ShazamSong {
  id: string;
  type: string;
  attributes: ShazamSongAttributes;
}

interface ShazamResponse {
  results: {
    artists?: {
      data: any[];
    };
    songs: {
      data: ShazamSong[];
    };
  };
}

const SHAZAM_API_HOST = 'shazam.p.rapidapi.com';

function getApiKey(): string {
  return process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '4f8712d382mshfaa3517bffdad81p136abfjsn293bbff5b12b';
}

function getFallbackApiKey(): string {
  return process.env.NEXT_PUBLIC_RAPIDAPI_KEY2 || '';
}

async function fetchWithFallback(url: string, options: RequestInit): Promise<Response> {
  const firstKey = getApiKey();
  const fallbackKey = getFallbackApiKey();

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

  return response;
}

export async function searchSongs(query: string, limit: number = 10): Promise<ShazamSong[]> {
  const url = `https://${SHAZAM_API_HOST}/v2/search?term=${encodeURIComponent(query)}&locale=en-US&offset=0&limit=${limit}`;
  
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
    
    // Handle different possible response structures
    let tracks: ShazamSong[] = [];
    
    if (result.results?.songs?.data) {
      // New Apple Music API structure: { results: { songs: { data: [...] } } }
      tracks = result.results.songs.data;
    } else if (result.tracks?.hits) {
      // Standard structure: { tracks: { hits: [{ track }] } }
      tracks = result.tracks.hits.map((hit: any) => hit.track);
    } else if (result.tracks) {
      // Alternative structure: { tracks: [...] }
      tracks = result.tracks;
    } else if (Array.isArray(result)) {
      // Direct array response
      tracks = result;
    } else if (result.list) {
      // Another possible structure: { list: [...] }
      tracks = result.list;
    } else {
      console.error('Unknown response structure, returning empty array');
      return [];
    }
    
    return tracks;
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
  
  return {
    id: track.id,
    name: attrs.name || 'Unknown',
    artist: attrs.artistName || 'Unknown',
    album: attrs.albumName || 'Unknown',
    duration,
    image: '🎵',
    url: attrs.url || '',
    coverArt,
  };
}

export async function getSongDetails(id: string) {
  const url = `https://${SHAZAM_API_HOST}/songs/v2/get-details?id=${id}&l=en-US`;
  
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
    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      return result.data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching artist details:', error);
    throw error;
  }
}

export async function getArtistAlbums(artistId: string): Promise<AppleMusicAlbumData[]> {
  const url = `https://${SHAZAM_API_HOST}/artists/get-details?id=${artistId}&l=en-US`;
  
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
    if (result.data && result.data[0] && result.data[0].relationships && result.data[0].relationships.albums) {
      // Return the album IDs - we'll need to fetch details separately if needed
      return result.data[0].relationships.albums.data || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching artist albums:', error);
    throw error;
  }
}

export async function getArtistTopSongs(artistId: string): Promise<ShazamSong[]> {
  const url = `https://${SHAZAM_API_HOST}/artists/get-top-songs?id=${artistId}&l=en-US`;
  
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
    if (result.data && Array.isArray(result.data)) {
      return result.data;
    }
    
    return [];
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
