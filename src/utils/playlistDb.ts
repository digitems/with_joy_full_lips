import { openDB, type DBSchema } from 'idb';
import type { Song } from '../types/song';

export interface Playlist {
  id: string;
  name: string;
  description: string;
  colorIndex: number;
  songs: Song[];
  createdAt: string;
  updatedAt: string;
}

interface PlaylistDB extends DBSchema {
  playlists: {
    key: string;
    value: Playlist;
  };
}

function getDb() {
  return openDB<PlaylistDB>('wjl-playlists', 1, {
    upgrade(db) {
      db.createObjectStore('playlists', { keyPath: 'id' });
    },
  });
}

export async function getAllPlaylists(): Promise<Playlist[]> {
  const db = await getDb();
  return db.getAll('playlists');
}

export async function getPlaylist(id: string): Promise<Playlist | undefined> {
  const db = await getDb();
  return db.get('playlists', id);
}

export async function savePlaylist(playlist: Playlist): Promise<void> {
  const db = await getDb();
  await db.put('playlists', playlist);
}

export async function deletePlaylist(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('playlists', id);
}
