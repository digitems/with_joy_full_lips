import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff, Phone, Close } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLogo from '../components/common/AppLogo';
import { loginGradient, playButtonGradient } from '../theme/gradients';
import * as colors from '../theme/colors';
import SEOHead from '../components/common/SEOHead';

// --- Floating notes (same set as SplashScreen) ---
const FLOATING_NOTES = ['♩', '♪', '♫', '♬', '♩', '♪', '♫', '♬'];

// Hard-coded dark colors for the always-white form card (immune to dark mode)
const CARD_TEXT = '#1A1A1A';
const CARD_TEXT_SECONDARY = '#555';
const CARD_BORDER = '#999';
const CARD_LINK = '#7B5E2A';

// --- Validation helpers ---

/** Validates email format with detailed error messages. Returns error string or undefined if valid. */
function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) return 'Email is required';
  if (trimmed.length > 254) return 'Email address is too long';

  if (!trimmed.includes('@')) return 'Email must include an @ symbol';

  const atIndex = trimmed.indexOf('@');
  if (trimmed.indexOf('@', atIndex + 1) !== -1) return 'Email must contain only one @ symbol';

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);

  // Local part checks
  if (!local) return 'Enter the username before @ (e.g. name@example.com)';
  if (local.length > 64) return 'The part before @ is too long (max 64 characters)';
  if (!/^[a-zA-Z0-9._%+-]+$/.test(local)) return 'Email contains invalid characters before @';
  if (local.startsWith('.') || local.endsWith('.')) return 'Email cannot start or end with a dot before @';
  if (local.includes('..')) return 'Email cannot have consecutive dots before @';

  // Domain checks
  if (!domain) return 'Enter a domain after @ (e.g. name@example.com)';
  if (!domain.includes('.')) return 'Email domain must include a dot (e.g. example.com)';
  if (domain.startsWith('.') || domain.endsWith('.')) return 'Email domain cannot start or end with a dot';
  if (domain.includes('..')) return 'Email domain cannot have consecutive dots';

  const labels = domain.split('.');
  for (const label of labels) {
    if (!label) return 'Email domain is invalid';
    if (label.startsWith('-') || label.endsWith('-')) return 'Domain labels cannot start or end with a hyphen';
    if (!/^[a-zA-Z0-9-]+$/.test(label)) return 'Email domain contains invalid characters';
  }

  // TLD must be letters only, at least 2 chars
  const tld = labels[labels.length - 1];
  if (tld.length < 2) return 'Email must end with a valid domain extension (e.g. .com, .org)';
  if (!/^[a-zA-Z]+$/.test(tld)) return 'Email domain extension must contain only letters';

  return undefined;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validate(
  isRegister: boolean,
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): FieldErrors {
  const errs: FieldErrors = {};
  if (isRegister && name.trim().length < 2) errs.name = 'Name must be at least 2 characters';

  const emailErr = validateEmail(email);
  if (emailErr) errs.email = emailErr;

  if (!password) errs.password = 'Password is required';
  else if (password.length < 8) errs.password = 'Password must be at least 8 characters';

  if (isRegister) {
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
  }

  return errs;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { login, register, googleSignIn, skipLogin, error, isLoading, clearError } = useAuth();

  // Form state
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation state
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Social loading state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const googleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mobile Google Sign-In snackbar
  const [showGoogleSnackbar, setShowGoogleSnackbar] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Forgot password dialog
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);

  const anyLoading = isLoading || googleLoading || phoneLoading;

  // Cleanup google timeout on unmount
  useEffect(() => {
    return () => {
      if (googleTimeoutRef.current) clearTimeout(googleTimeoutRef.current);
    };
  }, []);

  // Render Google Sign-In button inside mobile snackbar
  useEffect(() => {
    if (showGoogleSnackbar && googleBtnRef.current && window.google?.accounts?.id) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: 300,
        text: 'continue_with',
      });
    }
  }, [showGoogleSnackbar]);

  // --- Validation on blur, then live while error showing ---
  const validateField = useCallback(
    (field: keyof FieldErrors) => {
      const errs = validate(isRegister, name, email, password, confirmPassword);
      setFieldErrors((prev) => ({
        ...prev,
        [field]: errs[field] || undefined,
      }));
    },
    [isRegister, name, email, password, confirmPassword],
  );

  const handleBlur = (field: keyof FieldErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  // Live-clear errors as user types (only if field was already touched)
  const handleChange = (field: keyof FieldErrors, value: string) => {
    if (field === 'name') setName(value);
    else if (field === 'email') setEmail(value);
    else if (field === 'password') {
      setPassword(value);
      // Re-validate confirmPassword when password changes (to catch mismatch live)
      if (touched.confirmPassword && fieldErrors.confirmPassword) {
        const errs = validate(isRegister, name, email, value, confirmPassword);
        setFieldErrors((prev) => ({ ...prev, confirmPassword: errs.confirmPassword || undefined }));
      }
    } else if (field === 'confirmPassword') setConfirmPassword(value);

    if (touched[field] && fieldErrors[field]) {
      const errs = validate(
        isRegister,
        field === 'name' ? value : name,
        field === 'email' ? value : email,
        field === 'password' ? value : password,
        field === 'confirmPassword' ? value : confirmPassword,
      );
      setFieldErrors((prev) => ({ ...prev, [field]: errs[field] || undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Full validation
    const errs = validate(isRegister, name, email, password, confirmPassword);
    setFieldErrors(errs);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (Object.keys(errs).length > 0) return;

    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      navigate('/');
    } catch {
      // Error handled in context
    }
  };

  const handleGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google?.accounts) return;

    setGoogleLoading(true);

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        if (googleTimeoutRef.current) clearTimeout(googleTimeoutRef.current);
        try {
          setShowGoogleSnackbar(false);
          await googleSignIn(response.credential);
          navigate('/');
        } catch {
          // Error handled in context
        } finally {
          setGoogleLoading(false);
        }
      },
    });

    if (isDesktop) {
      // Desktop: One Tap prompt renders in top-right corner
      window.google.accounts.id.prompt();

      // 30-second timeout fallback (Google doesn't fire cancel callback)
      googleTimeoutRef.current = setTimeout(() => {
        setGoogleLoading(false);
      }, 30_000);
    } else {
      // Mobile: One Tap silently fails — show snackbar with rendered button instead
      setShowGoogleSnackbar(true);
      setGoogleLoading(false);
    }
  };

  const handlePhoneSignIn = () => {
    setPhoneLoading(true);
    navigate('/phone-auth');
  };

  const handleForgotSubmit = () => {
    setForgotOpen(false);
    setForgotEmail('');
    setSnackOpen(true);
  };

  // Force dark colors on the always-white form card inputs (immune to dark mode)
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: loginGradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <SEOHead
        title="Sign In"
        description="Sign in to With Joyful Lips to access your favorite hymns, playlists, and personalized recommendations."
        canonicalPath="/login"
      />
      {/* Enhancement 8: Animated floating music notes */}
      {FLOATING_NOTES.map((note, i) => (
        <motion.div
          key={i}
          initial={{
            x: (i % 4) * 100 - 150 + Math.random() * 40,
            y: 300,
            opacity: 0,
          }}
          animate={{
            y: -300,
            x: (i % 4) * 100 - 150 + Math.sin(i) * 60,
            opacity: [0, 0.25, 0.25, 0],
          }}
          transition={{
            duration: 3.5,
            delay: i * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            fontSize: 28 + Math.random() * 16,
            color: 'rgba(255,255,255,0.25)',
            pointerEvents: 'none',
          }}
        >
          {note}
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: colors.playerDark1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              border: '3px solid #D4960A',
              mb: 2,
            }}
          >
            <AppLogo size={74} />
          </Box>
          <Typography variant="h5" color="#fff" fontWeight={700}>
            With Joyful Lips
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.7)">
            {isRegister ? 'Create your account' : 'Sign in to continue'}
          </Typography>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            bgcolor: 'rgba(255,255,255,0.95)',
            borderRadius: 3,
            p: 3,
            width: '100%',
            maxWidth: isDesktop ? 420 : 380,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {error && (
            <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isRegister && (
            <TextField
              label="Full Name"
              value={name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
              fullWidth
              margin="dense"
              autoComplete="name"
              sx={textFieldSx}
            />
          )}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
            fullWidth
            margin="dense"
            autoComplete="email"
            sx={textFieldSx}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            error={!!fieldErrors.password}
            helperText={
              fieldErrors.password ||
              (isRegister ? `${password.length}/8 characters` : undefined)
            }
            fullWidth
            margin="dense"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            sx={textFieldSx}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: CARD_TEXT_SECONDARY }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {isRegister && (
            <TextField
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword}
              fullWidth
              margin="dense"
              autoComplete="new-password"
              sx={textFieldSx}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: CARD_TEXT_SECONDARY }}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}

          {/* Forgot Password link (login mode only) */}
          {!isRegister && (
            <Box sx={{ textAlign: 'right', mt: 0.5 }}>
              <Button
                size="small"
                onClick={() => setForgotOpen(true)}
                sx={{ textTransform: 'none', fontSize: '0.8rem', color: CARD_LINK, fontWeight: 600 }}
              >
                Forgot Password?
              </Button>
            </Box>
          )}

          {/* Sign In / Create Account button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={anyLoading}
            sx={{
              mt: 2,
              py: 1.5,
              background: playButtonGradient,
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              transition: 'filter 0.2s, transform 0.2s',
              '&:hover': {
                background: playButtonGradient,
                filter: 'brightness(1.1)',
                transform: 'scale(1.02)',
              },
            }}
          >
            {isLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : isRegister ? 'Create Account' : 'Sign In'}
          </Button>

          <Divider sx={{ my: 2, '&::before, &::after': { borderColor: '#ccc' }, color: CARD_TEXT_SECONDARY }}>or</Divider>

          {/* Google Sign-In */}
          <Button
            variant="outlined"
            fullWidth
            onClick={handleGoogleSignIn}
            disabled={anyLoading}
            startIcon={
              googleLoading ? (
                <CircularProgress size={20} sx={{ color: CARD_TEXT_SECONDARY }} />
              ) : (
                <Box
                  component="img"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  sx={{ width: 20, height: 20 }}
                />
              )
            }
            sx={{
              mb: 1,
              borderColor: CARD_BORDER,
              color: CARD_TEXT,
              fontWeight: 600,
              '&:hover': { borderColor: '#666', bgcolor: 'rgba(0,0,0,0.04)' },
            }}
          >
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>

          {/* Phone Auth */}
          <Button
            variant="outlined"
            fullWidth
            onClick={handlePhoneSignIn}
            disabled={anyLoading}
            startIcon={phoneLoading ? <CircularProgress size={20} sx={{ color: CARD_TEXT_SECONDARY }} /> : <Phone sx={{ color: CARD_TEXT_SECONDARY }} />}
            sx={{
              borderColor: CARD_BORDER,
              color: CARD_TEXT,
              fontWeight: 600,
              '&:hover': { borderColor: '#666', bgcolor: 'rgba(0,0,0,0.04)' },
            }}
          >
            {phoneLoading ? 'Signing in...' : 'Sign in with Phone'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              size="small"
              onClick={() => {
                setIsRegister(!isRegister);
                clearError();
                setFieldErrors({});
                setTouched({});
                setConfirmPassword('');
              }}
              sx={{ color: CARD_LINK, fontWeight: 600 }}
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </Button>
          </Box>

          <Divider sx={{ my: 1.5, '&::before, &::after': { borderColor: '#ccc' }, color: CARD_TEXT_SECONDARY, fontSize: '0.75rem' }}>
            or
          </Divider>

          <Button
            fullWidth
            onClick={() => { skipLogin(); navigate('/'); }}
            sx={{
              color: CARD_TEXT_SECONDARY,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9rem',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', color: CARD_TEXT },
            }}
          >
            Skip, browse as guest
          </Button>
        </Box>
      </motion.div>

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#fff' } }}
      >
        <DialogTitle sx={{ color: CARD_TEXT, fontWeight: 700 }}>Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: CARD_TEXT_SECONDARY }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          <TextField
            label="Email"
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            fullWidth
            autoFocus
            margin="dense"
            sx={textFieldSx}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotOpen(false)} sx={{ color: CARD_TEXT_SECONDARY, fontWeight: 600 }}>Cancel</Button>
          <Button
            onClick={handleForgotSubmit}
            variant="contained"
            disabled={!forgotEmail.trim()}
            sx={{
              bgcolor: '#4E342E',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              py: 1,
              px: 2.5,
              '&:hover': { bgcolor: '#3E2723' },
              '&.Mui-disabled': { bgcolor: '#A1887F', color: '#fff' },
            }}
          >
            Send Reset Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset email snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        message="If an account exists, a reset link has been sent."
      />

      {/* Mobile Google Sign-In snackbar */}
      <Snackbar
        open={showGoogleSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setShowGoogleSnackbar(false)}
      >
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: 3,
            p: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            minWidth: 320,
            position: 'relative',
          }}
        >
          <IconButton
            aria-label="Close"
            onClick={() => setShowGoogleSnackbar(false)}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8, color: CARD_TEXT_SECONDARY }}
          >
            <Close fontSize="small" />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box
              component="img"
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              sx={{ width: 24, height: 24 }}
            />
            <Typography sx={{ fontWeight: 700, color: CARD_TEXT, fontSize: '1rem' }}>
              Sign in with Google
            </Typography>
          </Box>
          <Box ref={googleBtnRef} sx={{ display: 'flex', justifyContent: 'center' }} />
        </Box>
      </Snackbar>
    </Box>
  );
}

// Declare Google Identity Services global
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          prompt: () => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme?: string; size?: string; width?: number; text?: string },
          ) => void;
        };
      };
    };
  }
}
