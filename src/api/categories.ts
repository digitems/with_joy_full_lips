import api from './client';
import type { Category } from '../types/category';
import type { Song } from '../types/song';
import type { PaginatedResponse } from '../types/api';
import { mapSong } from './songs';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const categoriesApi = {
  getAll() {
    return api.get<{ success: boolean; data: Category[] }>('/categories');
  },

  async getDetails(id: string) {
    const res = await api.get(`/categories/${id}`);
    const raw = res.data?.data;
    const songs: Song[] = Array.isArray(raw?.songs) ? raw.songs.map((s: any) => mapSong(s)) : [];
    return { ...res, data: { success: true, data: { ...raw, songs } } } as {
      data: { success: boolean; data: Category & { songs: Song[] } };
    };
  },

  async getSongs(id: string, params?: { page?: number; limit?: number; sort?: string }) {
    const res = await api.get(`/categories/${id}/songs`, { params });
    const payload = res.data?.data;
    const songs: Song[] = Array.isArray(payload)
      ? payload.map((s: any) => mapSong(s))
      : Array.isArray(payload?.songs)
        ? payload.songs.map((s: any) => mapSong(s))
        : [];
    return { ...res, data: { ...res.data, data: songs } } as { data: PaginatedResponse<Song> };
  },
};
