import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getAllPlaylists, savePlaylist, deletePlaylist as dbDelete, type Playlist } from '../utils/playlistDb';
import type { Song } from '../types/song';

interface PlaylistContextType {
  playlists: Playlist[];
  loading: boolean;
  createPlaylist: (name: string, description: string, colorIndex: number) => Promise<Playlist>;
  removePlaylist: (id: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, song: Song) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextType | null>(null);

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const all = await getAllPlaylists();
    setPlaylists(all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const createPlaylist = useCallback(async (name: string, description: string, colorIndex: number) => {
    const pl: Playlist = {
      id: crypto.randomUUID(),
      name,
      description,
      colorIndex,
      songs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await savePlaylist(pl);
    await refresh();
    return pl;
  }, [refresh]);

  const removePlaylist = useCallback(async (id: string) => {
    await dbDelete(id);
    await refresh();
  }, [refresh]);

  const addSongToPlaylist = useCallback(async (playlistId: string, song: Song) => {
    const all = await getAllPlaylists();
    const pl = all.find((p) => p.id === playlistId);
    if (!pl) return;
    if (pl.songs.some((s) => s.id === song.id)) return;
    pl.songs.push(song);
    pl.updatedAt = new Date().toISOString();
    await savePlaylist(pl);
    await refresh();
  }, [refresh]);

  const removeSongFromPlaylist = useCallback(async (playlistId: string, songId: string) => {
    const all = await getAllPlaylists();
    const pl = all.find((p) => p.id === playlistId);
    if (!pl) return;
    pl.songs = pl.songs.filter((s) => s.id !== songId);
    pl.updatedAt = new Date().toISOString();
    await savePlaylist(pl);
    await refresh();
  }, [refresh]);

  return (
    <PlaylistContext.Provider value={{ playlists, loading, createPlaylist, removePlaylist, addSongToPlaylist, removeSongFromPlaylist, refresh }}>
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylists() {
  const ctx = useContext(PlaylistContext);
  if (!ctx) throw new Error('usePlaylists must be used within PlaylistProvider');
  return ctx;
}
