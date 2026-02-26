import { songsApi } from '../api/songs';
import type { Song } from '../types/song';

/**
 * Download a song's audio file via the backend proxy.
 * The backend records the download and streams the file from Firebase Storage,
 * avoiding CORS issues with direct Firebase requests.
 */
export async function downloadSong(song: Song): Promise<void> {
  const response = await songsApi.downloadFile(song.id);
  const blob: Blob = response.data;
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${song.title} - ${song.artist}.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Small delay before revoking to ensure download starts
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
