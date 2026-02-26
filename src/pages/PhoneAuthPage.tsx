import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { ArrowBack, Phone } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { loginGradient, playButtonGradient } from '../theme/gradients';

// Hard-coded dark colors for the always-white form card (immune to dark mode)
const CARD_TEXT = '#1A1A1A';
const CARD_TEXT_SECONDARY = '#555';
const CARD_BORDER = '#999';
const CARD_LINK = '#7B5E2A';
const CARD_ACCENT = '#5D4037';

const textFieldSx = {
  '& .MuiInputLabel-root': { color: CARD_TEXT_SECONDARY },
  '& .MuiInputLabel-root.Mui-focused': { color: CARD_LINK },
  '& .MuiOutlinedInput-root': {
    color: CARD_TEXT,
    '& fieldset': { borderColor: CARD_BORDER },
    '&:hover fieldset': { borderColor: '#666' },
    '&.Mui-focused fieldset': { borderColor: CARD_LINK },
  },
  '& .MuiFormHelperText-root': { color: CARD_TEXT_SECONDARY },
};

const selectSx = {
  color: CARD_TEXT,
  '& .MuiOutlinedInput-notchedOutline': { borderColor: CARD_BORDER },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: CARD_LINK },
  '& .MuiSvgIcon-root': { color: CARD_TEXT_SECONDARY },
};

const countries = [
  { code: '+1', name: 'United States' },
  { code: '+44', name: 'United Kingdom' },
  { code: '+91', name: 'India' },
  { code: '+234', name: 'Nigeria' },
  { code: '+233', name: 'Ghana' },
  { code: '+254', name: 'Kenya' },
  { code: '+27', name: 'South Africa' },
  { code: '+61', name: 'Australia' },
  { code: '+49', name: 'Germany' },
  { code: '+33', name: 'France' },
  { code: '+81', name: 'Japan' },
  { code: '+82', name: 'South Korea' },
  { code: '+86', name: 'China' },
  { code: '+55', name: 'Brazil' },
  { code: '+52', name: 'Mexico' },
  { code: '+7', name: 'Russia' },
  { code: '+971', name: 'UAE' },
  { code: '+966', name: 'Saudi Arabia' },
  { code: '+20', name: 'Egypt' },
  { code: '+212', name: 'Morocco' },
  { code: '+39', name: 'Italy' },
  { code: '+34', name: 'Spain' },
  { code: '+31', name: 'Netherlands' },
  { code: '+46', name: 'Sweden' },
  { code: '+47', name: 'Norway' },
  { code: '+48', name: 'Poland' },
  { code: '+90', name: 'Turkey' },
  { code: '+62', name: 'Indonesia' },
  { code: '+60', name: 'Malaysia' },
  { code: '+63', name: 'Philippines' },
  { code: '+66', name: 'Thailand' },
  { code: '+84', name: 'Vietnam' },
  { code: '+880', name: 'Bangladesh' },
  { code: '+92', name: 'Pakistan' },
  { code: '+251', name: 'Ethiopia' },
  { code: '+255', name: 'Tanzania' },
];

function getFirebaseApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  });
}

export default function PhoneAuthPage() {
  const navigate = useNavigate();
  const { phoneSignIn, error: authError, clearError } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSendCode = async () => {
    const phone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
    if (phone.length < 8) {
      setLocalError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setLocalError('');
    try {
      const app = getFirebaseApp();
      const auth = getAuth(app);
      const verifier = new RecaptchaVerifier(auth, recaptchaRef.current!, { size: 'invisible' });
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      confirmationRef.current = result;
      setStep('otp');
      setCooldown(60);
    } catch (err: unknown) {
      setLocalError((err as Error).message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setLocalError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setLocalError('');
    try {
      const result = await confirmationRef.current!.confirm(otp);
      const idToken = await result.user.getIdToken();
      await phoneSignIn(idToken);
      navigate('/');
    } catch (err: unknown) {
      setLocalError((err as Error).message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: loginGradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 3,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => (step === 'otp' ? setStep('phone') : navigate('/login'))}
          sx={{ color: '#fff', mb: 3 }}
        >
          Back
        </Button>

        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.95)',
            borderRadius: 3,
            p: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Phone sx={{ fontSize: 48, color: CARD_ACCENT, mb: 1 }} />
            <Typography variant="h6" fontWeight={700} sx={{ color: CARD_TEXT }}>
              {step === 'phone' ? 'Phone Sign In' : 'Enter Verification Code'}
            </Typography>
            <Typography variant="body2" sx={{ color: CARD_TEXT_SECONDARY }}>
              {step === 'phone'
                ? 'We\'ll send you a verification code'
                : `Code sent to ${countryCode}${phoneNumber}`}
            </Typography>
          </Box>

          {displayError && (
            <Alert severity="error" onClose={() => { setLocalError(''); clearError(); }} sx={{ mb: 2 }}>
              {displayError}
            </Alert>
          )}

          {step === 'phone' ? (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel sx={{ color: CARD_TEXT_SECONDARY, '&.Mui-focused': { color: CARD_LINK } }}>Country</InputLabel>
                <Select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  label="Country"
                  sx={selectSx}
                >
                  {countries.map((c) => (
                    <MenuItem key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                fullWidth
                margin="dense"
                type="tel"
                placeholder="Enter phone number"
                sx={textFieldSx}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleSendCode}
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  background: playButtonGradient,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  '&:hover': { background: playButtonGradient, filter: 'brightness(1.1)', transform: 'scale(1.02)' },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Send Code'}
              </Button>
            </>
          ) : (
            <>
              <TextField
                label="Verification Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                fullWidth
                margin="dense"
                placeholder="000000"
                sx={textFieldSx}
                slotProps={{ htmlInput: { maxLength: 6, style: { letterSpacing: 8, textAlign: 'center', fontSize: 24, color: CARD_TEXT } } }}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                sx={{
                  mt: 2,
                  py: 1.5,
                  background: playButtonGradient,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  '&:hover': { background: playButtonGradient, filter: 'brightness(1.1)', transform: 'scale(1.02)' },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Verify'}
              </Button>

              <Button
                fullWidth
                disabled={cooldown > 0}
                onClick={handleSendCode}
                sx={{ mt: 1, color: CARD_LINK, fontWeight: 600 }}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Invisible reCAPTCHA container */}
      <div ref={recaptchaRef} />
    </Box>
  );
}
