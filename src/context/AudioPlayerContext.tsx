import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { Song } from '../types/song';
import { songsApi } from '../api/songs';
import { getAccessToken } from '../api/client';

type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  isBuffering: boolean;
  queue: Song[];
  queueIndex: number;
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
  showFullPlayer: boolean;
}

interface PositionState {
  currentPosition: number;
  duration: number;
}

interface PlayerContextType extends PlayerState {
  playSong: (song: Song, queue?: Song[], index?: number) => void;
  togglePlayPause: () => void;
  seekTo: (position: number) => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  setShowFullPlayer: (show: boolean) => void;
  setQueue: (songs: Song[], startIndex?: number) => void;
  addToQueue: (song: Song) => void;
  playNext: (song: Song) => void;
  updateCurrentSong: (updater: (song: Song) => Song) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const AudioPlayerContext = createContext<PlayerContextType | null>(null);

// --- Position store (ref-based, no React state) ---
let _positionState: PositionState = { currentPosition: 0, duration: 0 };
const _positionListeners = new Set<() => void>();

function getPositionSnapshot(): PositionState {
  return _positionState;
}

function subscribePosition(callback: () => void): () => void {
  _positionListeners.add(callback);
  return () => _positionListeners.delete(callback);
}

function setPositionState(next: PositionState) {
  if (next.currentPosition !== _positionState.currentPosition || next.duration !== _positionState.duration) {
    _positionState = next;
    for (const listener of _positionListeners) listener();
  }
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const shuffledIndicesRef = useRef<number[]>([]);

  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    isBuffering: false,
    queue: [],
    queueIndex: -1,
    shuffleEnabled: false,
    repeatMode: 'off',
    showFullPlayer: false,
  });

  // Position polling via rAF — updates ref store, NOT React state
  const startPositionPolling = useCallback(() => {
    const poll = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        setPositionState({
          currentPosition: audio.currentTime,
          duration: audio.duration || _positionState.duration,
        });
        animFrameRef.current = requestAnimationFrame(poll);
      }
    };
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(poll);
  }, []);

  // Generate shuffled indices
  const generateShuffledIndices = useCallback((length: number, currentIndex: number) => {
    const indices = Array.from({ length }, (_, i) => i).filter((i) => i !== currentIndex);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    shuffledIndicesRef.current = [currentIndex, ...indices];
  }, []);

  const getNextIndex = useCallback(
    (currentIdx: number, queueLength: number, repeat: RepeatMode, shuffle: boolean): number | null => {
      if (repeat === 'one') return currentIdx;
      if (shuffle) {
        const shuffled = shuffledIndicesRef.current;
        const posInShuffle = shuffled.indexOf(currentIdx);
        if (posInShuffle < shuffled.length - 1) return shuffled[posInShuffle + 1];
        if (repeat === 'all') {
          generateShuffledIndices(queueLength, shuffled[shuffled.length - 1]);
          return shuffledIndicesRef.current[0];
        }
        return null;
      }
      if (currentIdx < queueLength - 1) return currentIdx + 1;
      if (repeat === 'all') return 0;
      return null;
    },
    [generateShuffledIndices]
  );

  const getPrevIndex = useCallback(
    (currentIdx: number, queueLength: number, shuffle: boolean): number => {
      if (shuffle) {
        const shuffled = shuffledIndicesRef.current;
        const posInShuffle = shuffled.indexOf(currentIdx);
        if (posInShuffle > 0) return shuffled[posInShuffle - 1];
        return currentIdx;
      }
      return currentIdx > 0 ? currentIdx - 1 : queueLength - 1;
    },
    []
  );

  // Media Session API
  const updateMediaSession = useCallback((song: Song | null) => {
    if (!('mediaSession' in navigator) || !song) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artist,
      album: song.album || 'With Joyful Lips',
      artwork: song.coverImageUrl
        ? [{ src: song.coverImageUrl, sizes: '512x512', type: 'image/jpeg' }]
        : [],
    });
  }, []);

  const playSong = useCallback(
    (song: Song, queue?: Song[], index?: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      const newQueue = queue || [song];
      const newIndex = index ?? (queue ? queue.findIndex((s) => s.id === song.id) : 0);

      audio.src = song.audioUrl;
      audio.load();
      audio.play().catch(() => {});

      // Reset position store
      setPositionState({ currentPosition: 0, duration: 0 });

      setState((s) => ({
        ...s,
        currentSong: song,
        isPlaying: true,
        isBuffering: true,
        queue: newQueue,
        queueIndex: newIndex >= 0 ? newIndex : 0,
      }));

      updateMediaSession(song);
      startPositionPolling();

      // Record play if authenticated
      if (getAccessToken()) {
        songsApi.recordPlay(song.id).catch(() => {});
      }

      if (state.shuffleEnabled) {
        generateShuffledIndices(newQueue.length, newIndex >= 0 ? newIndex : 0);
      }
    },
    [updateMediaSession, startPositionPolling, state.shuffleEnabled, generateShuffledIndices]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentSong) return;
    if (audio.paused) {
      audio.play().catch(() => {});
      setState((s) => ({ ...s, isPlaying: true }));
      startPositionPolling();
    } else {
      audio.pause();
      setState((s) => ({ ...s, isPlaying: false }));
      cancelAnimationFrame(animFrameRef.current);
    }
  }, [state.currentSong, startPositionPolling]);

  const seekTo = useCallback((position: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = position;
      setPositionState({ ..._positionState, currentPosition: position });
    }
  }, []);

  const skipToNext = useCallback(() => {
    const { queue, queueIndex, repeatMode, shuffleEnabled } = state;
    if (queue.length === 0) return;
    const nextIdx = getNextIndex(queueIndex, queue.length, repeatMode, shuffleEnabled);
    if (nextIdx !== null) {
      playSong(queue[nextIdx], queue, nextIdx);
    }
  }, [state, getNextIndex, playSong]);

  const skipToPrevious = useCallback(() => {
    const audio = audioRef.current;
    const { queue, queueIndex, shuffleEnabled } = state;
    // If >3s in, restart current song
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setPositionState({ ..._positionState, currentPosition: 0 });
      return;
    }
    if (queue.length === 0) return;
    const prevIdx = getPrevIndex(queueIndex, queue.length, shuffleEnabled);
    playSong(queue[prevIdx], queue, prevIdx);
  }, [state, getPrevIndex, playSong]);

  const toggleShuffle = useCallback(() => {
    setState((s) => {
      const newShuffle = !s.shuffleEnabled;
      if (newShuffle && s.queue.length > 0) {
        generateShuffledIndices(s.queue.length, s.queueIndex);
      }
      return { ...s, shuffleEnabled: newShuffle };
    });
  }, [generateShuffledIndices]);

  const cycleRepeatMode = useCallback(() => {
    setState((s) => {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const next = modes[(modes.indexOf(s.repeatMode) + 1) % modes.length];
      return { ...s, repeatMode: next };
    });
  }, []);

  const setShowFullPlayer = useCallback((show: boolean) => {
    setState((s) => ({ ...s, showFullPlayer: show }));
  }, []);

  const setQueue = useCallback(
    (songs: Song[], startIndex = 0) => {
      if (songs.length === 0) return;
      playSong(songs[startIndex], songs, startIndex);
    },
    [playSong]
  );

  const addToQueue = useCallback((song: Song) => {
    setState((s) => ({ ...s, queue: [...s.queue, song] }));
  }, []);

  const playNext = useCallback((song: Song) => {
    setState((s) => {
      const newQueue = [...s.queue];
      newQueue.splice(s.queueIndex + 1, 0, song);
      return { ...s, queue: newQueue };
    });
  }, []);

  const updateCurrentSong = useCallback((updater: (song: Song) => Song) => {
    setState((s) => {
      if (!s.currentSong) return s;
      const updated = updater(s.currentSong);
      const newQueue = s.queue.map((song) => (song.id === updated.id ? updated : song));
      return { ...s, currentSong: updated, queue: newQueue };
    });
  }, []);

  // Audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onCanPlay = () => {
      setPositionState({ ..._positionState, duration: audio.duration });
      setState((s) => ({ ...s, isBuffering: false }));
    };
    const onWaiting = () => setState((s) => ({ ...s, isBuffering: true }));
    const onEnded = () => {
      cancelAnimationFrame(animFrameRef.current);
      // Auto-advance
      setState((prev) => {
        const nextIdx = getNextIndex(prev.queueIndex, prev.queue.length, prev.repeatMode, prev.shuffleEnabled);
        if (nextIdx !== null) {
          // Schedule next song play
          setTimeout(() => playSong(prev.queue[nextIdx], prev.queue, nextIdx), 0);
        }
        return { ...prev, isPlaying: false };
      });
    };
    const onError = () => setState((s) => ({ ...s, isBuffering: false, isPlaying: false }));

    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [getNextIndex, playSong]);

  // Media Session action handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play', togglePlayPause);
    navigator.mediaSession.setActionHandler('pause', togglePlayPause);
    navigator.mediaSession.setActionHandler('nexttrack', skipToNext);
    navigator.mediaSession.setActionHandler('previoustrack', skipToPrevious);
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) seekTo(details.seekTime);
    });
  }, [togglePlayPause, skipToNext, skipToPrevious, seekTo]);

  // Update media session position state (reads from position store)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !state.currentSong) return;
    // Poll media session position at a lower rate (every 1s)
    const interval = setInterval(() => {
      const pos = _positionState;
      try {
        navigator.mediaSession.setPositionState({
          duration: pos.duration || 0,
          playbackRate: 1,
          position: Math.min(pos.currentPosition, pos.duration || 0),
        });
      } catch {
        // Ignore — some browsers don't support this
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state.currentSong]);

  return (
    <AudioPlayerContext.Provider
      value={{
        ...state,
        playSong,
        togglePlayPause,
        seekTo,
        skipToNext,
        skipToPrevious,
        toggleShuffle,
        cycleRepeatMode,
        setShowFullPlayer,
        setQueue,
        addToQueue,
        playNext,
        updateCurrentSong,
        audioRef,
      }}
    >
      {/* Global audio element — never unmounted */}
      <audio ref={audioRef} preload="auto" />
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return ctx;
}

/** Subscribe to position/duration updates without causing re-renders in the main context */
export function usePlayerPosition(): PositionState {
  return useSyncExternalStore(subscribePosition, getPositionSnapshot);
}
