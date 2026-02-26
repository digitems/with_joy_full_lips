import api from './client';
import type { Song } from '../types/song';
import type { PaginatedResponse } from '../types/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Parse duration — handles both seconds (number) and "MM:SS" strings */
function parseDuration(raw: any): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string' && raw.includes(':')) {
    const parts = raw.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
  }
  return Number(raw) || 0;
}

/** Map raw API song object to frontend Song type */
export function mapSong(raw: any): Song {
  return {
    id: raw.id || raw.songId || '',
    title: raw.title || '',
    artist: raw.artist || 'Unknown Artist',
    album: raw.album || undefined,
    duration: parseDuration(raw.duration),
    audioUrl: raw.fileUrl || raw.audioUrl || '',
    coverImageUrl: raw.coverImage || raw.coverImageUrl || '',
    category: raw.category || undefined,
    categoryName: raw.categoryName || undefined,
    playCount: raw.playCount || 0,
    downloadCount: raw.downloadCount || 0,
    likes: raw.likes || 0,
    averageRating: raw.averageRating || 0,
    totalRatings: raw.totalRatings || 0,
    ratingDistribution: raw.ratingDistribution,
    isFavorite: raw.isFavorite ?? raw.userFavorited ?? false,
    isLiked: raw.isLiked ?? raw.userLiked ?? false,
    userRating: raw.userRating,
    createdAt: raw.createdAt || '',
  };
}

/** Map an array of raw songs */
function mapSongs(data: any): Song[] {
  if (Array.isArray(data)) return data.map(mapSong);
  return [];
}

/** Extract song array from API response (handles both flat array and nested .songs) */
function extractSongs(responseData: any): Song[] {
  if (!responseData) return [];
  const payload = responseData.data;
  if (Array.isArray(payload)) return mapSongs(payload);
  if (payload && Array.isArray(payload.songs)) return mapSongs(payload.songs);
  return [];
}

export const songsApi = {
  async getAll(params?: { page?: number; limit?: number; category?: string; sort?: string }) {
    const res = await api.get('/songs', { params });
    return { ...res, data: { ...res.data, data: extractSongs(res.data) } } as { data: PaginatedResponse<Song> };
  },

  async search(query: string, params?: { page?: number; limit?: number }) {
    const res = await api.get('/songs/search', { params: { q: query, ...params } });
    return { ...res, data: { ...res.data, data: extractSongs(res.data) } } as { data: PaginatedResponse<Song> };
  },

  async getTrending(params?: { limit?: number }) {
    const res = await api.get('/songs/trending', { params });
    return { ...res, data: { ...res.data, data: extractSongs(res.data) } } as { data: PaginatedResponse<Song> };
  },

  async getMostLiked(params?: { limit?: number }) {
    const res = await api.get('/songs/most-liked', { params });
    return { ...res, data: { ...res.data, data: extractSongs(res.data) } } as { data: PaginatedResponse<Song> };
  },

  async getTopRated(params?: { limit?: number }) {
    const res = await api.get('/songs/top-rated', { params });
    return { ...res, data: { ...res.data, data: extractSongs(res.data) } } as { data: PaginatedResponse<Song> };
  },

  async getNewReleases(params?: { limit?: number }) {
    const res = await api.get('/songs/new-releases', { params });
    return { ...res, data: { ...res.data, data: extractSongs(res.data) } } as { data: PaginatedResponse<Song> };
  },

  async getDetails(id: string) {
    const res = await api.get(`/songs/${id}`);
    const raw = res.data?.data;
    return { ...res, data: { success: true, data: mapSong(raw) } } as { data: { success: boolean; data: Song } };
  },

  recordPlay(id: string) {
    return api.post(`/songs/${id}/play`);
  },

  toggleLike(id: string) {
    return api.post(`/songs/${id}/like`);
  },

  rateSong(id: string, rating: number) {
    return api.post(`/songs/${id}/rate`, { rating });
  },

  recordDownload(id: string) {
    return api.post(`/songs/${id}/download`);
  },

  downloadFile(id: string) {
    return api.get(`/songs/${id}/download-file`, {
      responseType: 'blob',
      timeout: 120000,
      headers: { 'Content-Type': undefined as unknown as string },
    });
  },
};
