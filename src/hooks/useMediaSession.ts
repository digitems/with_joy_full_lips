import { useEffect } from 'react';
import type { Song } from '../types/song';

export function useMediaSession(
  song: Song | null,
  isPlaying: boolean,
  position: number,
  duration: number,
  handlers: {
    onPlay: () => void;
    onPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    onSeek: (time: number) => void;
  }
) {
  // Update metadata
  useEffect(() => {
    if (!('mediaSession' in navigator) || !song) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artist,
      album: song.album || 'With Joyful Lips',
      artwork: song.coverImageUrl
        ? [{ src: song.coverImageUrl, sizes: '512x512', type: 'image/jpeg' }]
        : [],
    });
  }, [song]);

  // Update playback state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  // Update position
  useEffect(() => {
    if (!('mediaSession' in navigator) || !song || !duration) return;
    try {
      navigator.mediaSession.setPositionState({
        duration: duration || 0,
        playbackRate: 1,
        position: Math.min(position, duration || 0),
      });
    } catch {
      // Some browsers don't support setPositionState
    }
  }, [position, duration, song]);

  // Action handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play', handlers.onPlay);
    navigator.mediaSession.setActionHandler('pause', handlers.onPause);
    navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext);
    navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrev);
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) handlers.onSeek(details.seekTime);
    });

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('seekto', null);
    };
  }, [handlers]);
}
