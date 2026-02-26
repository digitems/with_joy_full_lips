import { useState, useRef, useEffect } from 'react';
import { Paper, InputBase, IconButton, Divider, Snackbar } from '@mui/material';
import { Search, Clear, Mic } from '@mui/icons-material';
import { keyframes } from '@mui/system';

// TypeScript declaration for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(227, 173, 67, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(227, 173, 67, 0); }
  100% { box-shadow: 0 0 0 0 rgba(227, 173, 67, 0); }
`;

const speechSupported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, onSearch, placeholder = 'Search hymns...' }: SearchBarProps) {
  const [isListening, setIsListening] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const startListening = () => {
    if (!speechSupported) return;

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        onChange(transcript);
        onSearch(transcript);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        setSnackMsg('No speech detected. Try again.');
      } else if (event.error !== 'aborted') {
        setSnackMsg('Voice recognition failed. Try again.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={1}
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: 6,
          px: 2,
          py: 0.5,
          bgcolor: 'background.paper',
        }}
      >
        <Search sx={{ color: 'text.secondary', mr: 1 }} />
        <InputBase
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          sx={{ flex: 1 }}
        />
        {value && (
          <IconButton aria-label="Clear search" size="small" onClick={() => { onChange(''); onSearch(''); }}>
            <Clear fontSize="small" />
          </IconButton>
        )}
        {speechSupported && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
            <IconButton
              aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
              size="small"
              onClick={isListening ? stopListening : startListening}
              sx={{
                color: isListening ? '#E3AD43' : 'text.secondary',
                animation: isListening ? `${pulse} 1.5s infinite` : 'none',
                borderRadius: '50%',
              }}
            >
              <Mic fontSize="small" />
            </IconButton>
          </>
        )}
      </Paper>
      <Snackbar
        open={!!snackMsg}
        autoHideDuration={3000}
        onClose={() => setSnackMsg('')}
        message={snackMsg}
      />
    </>
  );
}
