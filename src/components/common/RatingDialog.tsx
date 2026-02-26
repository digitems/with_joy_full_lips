import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Rating, Typography, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import * as colors from '../../theme/colors';

const labels: Record<number, string> = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

interface RatingDialogProps {
  open: boolean;
  onClose: () => void;
  onRate: (rating: number) => void;
  currentRating?: number;
  songTitle: string;
}

export default function RatingDialog({ open, onClose, onRate, currentRating, songTitle }: RatingDialogProps) {
  const [value, setValue] = useState(currentRating || 0);

  useEffect(() => {
    if (open) setValue(currentRating || 0);
  }, [open, currentRating]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Rate this hymn</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {songTitle}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, gap: 1 }}>
          <Rating
            value={value}
            onChange={(_, newVal) => newVal && setValue(newVal)}
            size="large"
            sx={{
              '& .MuiRating-iconFilled': { color: colors.accentGold },
              '& .MuiRating-iconHover': { color: colors.playerAccent },
            }}
          />
          {value > 0 && (
            <Typography variant="body2" color="text.secondary">
              {labels[value]}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => value > 0 && onRate(value)} disabled={value === 0} variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
