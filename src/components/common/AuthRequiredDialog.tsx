import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface AuthRequiredDialogProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

export default function AuthRequiredDialog({ open, onClose, message }: AuthRequiredDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Lock color="primary" />
        Sign In Required
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {message || 'You need to sign in to use this feature.'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => { onClose(); navigate('/login'); }}
        >
          Sign In
        </Button>
      </DialogActions>
    </Dialog>
  );
}
