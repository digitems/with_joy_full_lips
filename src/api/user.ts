import api from './client';
import type { Song } from '../types/song';
import type { User, UserStats } from '../types/user';
import type { PaginatedResponse } from '../types/api';
import { mapSong } from './songs';

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Keep only the first occurrence of each song by id */
function dedup(songs: Song[]): Song[] {
  const seen = new Set<string>();
  return songs.filter((s) => {
    if (!s.id || seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

/** Dedup songs and count occurrences, storing the count in the given field */
function dedupWithCount(songs: Song[], countField: 'userPlayCount' | 'userDownloadCount'): Song[] {
  const counts = new Map<string, number>();
  for (const s of songs) {
    if (s.id) counts.set(s.id, (counts.get(s.id) ?? 0) + 1);
  }
  const seen = new Set<string>();
  return songs.filter((s) => {
    if (!s.id || seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  }).map((s) => ({ ...s, [countField]: counts.get(s.id) ?? 1 }));
}

export const userApi = {
  getProfile() {
    return api.get<{ success: boolean; data: User }>('/user/profile');
  },

  updateProfile(data: { name?: string; profileImage?: string }) {
    return api.put('/user/profile', data);
  },

  changePassword(currentPassword: string, newPassword: string) {
    return api.put('/user/password', { currentPassword, newPassword });
  },

  async getFavorites(params?: { page?: number; limit?: number }) {
    const res = await api.get('/user/favorites', { params });
    const payload = res.data?.data;
    const songs: Song[] = dedup(
      Array.isArray(payload)
        ? payload.map((s: any) => mapSong(s))
        : Array.isArray(payload?.songs)
          ? payload.songs.map((s: any) => mapSong(s))
          : [],
    );
    return { ...res, data: { ...res.data, data: songs } } as { data: PaginatedResponse<Song> };
  },

  addFavorite(songId: string) {
    return api.post(`/user/favorites/${songId}`);
  },

  removeFavorite(songId: string) {
    return api.delete(`/user/favorites/${songId}`);
  },

  async getHistory(params?: { page?: number; limit?: number }) {
    const res = await api.get('/user/history', { params });
    const payload = res.data?.data;
    const mapped: Song[] = Array.isArray(payload)
      ? payload.map((s: any) => mapSong(s))
      : Array.isArray(payload?.songs)
        ? payload.songs.map((s: any) => mapSong(s))
        : [];
    const songs = dedupWithCount(mapped, 'userPlayCount');
    return { ...res, data: { ...res.data, data: songs } } as { data: PaginatedResponse<Song> };
  },

  clearHistory() {
    return api.delete('/user/history');
  },

  async getRatings(params?: { page?: number; limit?: number }) {
    const res = await api.get('/user/ratings', { params });
    const payload = res.data?.data;
    const songs: Song[] = dedup(
      Array.isArray(payload)
        ? payload.map((s: any) => mapSong(s))
        : Array.isArray(payload?.ratings)
          ? payload.ratings.map((s: any) => mapSong(s))
          : [],
    );
    return { ...res, data: { ...res.data, data: songs } } as { data: PaginatedResponse<Song> };
  },

  async getDownloads(params?: { page?: number; limit?: number }) {
    const res = await api.get('/user/downloads', { params });
    const payload = res.data?.data;
    const mapped: Song[] = Array.isArray(payload)
      ? payload.map((s: any) => mapSong(s))
      : Array.isArray(payload?.history)
        ? payload.history.map((s: any) => mapSong(s))
        : [];
    const songs = dedupWithCount(mapped, 'userDownloadCount');
    return { ...res, data: { ...res.data, data: songs } } as { data: PaginatedResponse<Song> };
  },

  getStats() {
    return api.get<{ success: boolean; data: UserStats }>('/user/stats');
  },
};
