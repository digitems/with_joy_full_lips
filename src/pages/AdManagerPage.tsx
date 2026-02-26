import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  TouchApp,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  fetchMetrics,
  listAds,
  createAd,
  updateAd,
  deleteAd,
} from '../api/ads';
import type { AdMetric, AdCampaign, AdCreatePayload } from '../api/ads';

const PLACEMENTS = ['leaderboard', 'infeed', 'sidebar', 'mobile_banner'] as const;
const FORMATS = ['horizontal', 'vertical', 'rectangle', 'auto'] as const;

const emptyForm: AdCreatePayload = {
  title: '',
  imageUrl: '',
  targetUrl: '',
  placement: 'infeed',
  altText: '',
  sponsor: '',
  format: 'auto',
  priority: 0,
  active: true,
  startDate: null,
  endDate: null,
};

export default function AdManagerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<AdMetric[]>([]);
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdCreatePayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<AdCampaign | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Gate: redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/', { replace: true });
  }, [user, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, a] = await Promise.all([fetchMetrics(), listAds()]);
      setMetrics(m);
      setAds(a);
    } catch {
      setSnackbar({ msg: 'Failed to load ads data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Aggregate totals
  const totalImpressions = metrics.reduce((s, m) => s + m.impressions, 0);
  const totalClicks = metrics.reduce((s, m) => s + m.clicks, 0);
  const avgCtr = totalImpressions > 0 ? +(totalClicks / totalImpressions * 100).toFixed(2) : 0;

  // Open create/edit dialog
  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (ad: AdCampaign) => {
    setEditingId(ad.id);
    setForm({
      title: ad.title,
      imageUrl: ad.imageUrl,
      targetUrl: ad.targetUrl,
      placement: ad.placement,
      altText: ad.altText || '',
      sponsor: ad.sponsor || '',
      format: ad.format || 'auto',
      priority: ad.priority || 0,
      active: ad.active,
      startDate: ad.startDate || null,
      endDate: ad.endDate || null,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.imageUrl || !form.targetUrl || !form.placement) {
      setSnackbar({ msg: 'Please fill in all required fields', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateAd(editingId, form);
        setSnackbar({ msg: 'Ad updated', severity: 'success' });
      } else {
        await createAd(form);
        setSnackbar({ msg: 'Ad created', severity: 'success' });
      }
      setDialogOpen(false);
      load();
    } catch {
      setSnackbar({ msg: 'Failed to save ad', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAd(deleteTarget.id);
      setSnackbar({ msg: 'Ad deleted', severity: 'success' });
      setDeleteTarget(null);
      load();
    } catch {
      setSnackbar({ msg: 'Failed to delete ad', severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Ad Manager</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} size="small">
          New Campaign
        </Button>
      </Box>

      {/* Metrics summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <MetricCard icon={<Visibility />} label="Impressions" value={totalImpressions.toLocaleString()} />
        <MetricCard icon={<TouchApp />} label="Clicks" value={totalClicks.toLocaleString()} />
        <MetricCard icon={<TrendingUp />} label="Avg CTR" value={`${avgCtr}%`} />
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Ad list */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
      ) : ads.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No ad campaigns yet. Create one to get started.
        </Typography>
      ) : (
        ads.map((ad) => {
          const metric = metrics.find((m) => m.id === ad.id);
          return (
            <Card key={ad.id} sx={{ mb: 1.5 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box
                  component="img"
                  src={ad.imageUrl}
                  alt={ad.title}
                  sx={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap>{ad.title}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                    <Chip label={ad.placement} size="small" variant="outlined" />
                    <Chip
                      label={ad.active ? 'Active' : 'Inactive'}
                      size="small"
                      color={ad.active ? 'success' : 'default'}
                    />
                    {metric && (
                      <Chip
                        label={`${metric.impressions} imp · ${metric.clicks} clk · ${metric.ctr}%`}
                        size="small"
                        variant="outlined"
                        color="info"
                      />
                    )}
                  </Box>
                </Box>
                <IconButton aria-label="Edit ad" size="small" onClick={() => openEdit(ad)}><Edit fontSize="small" /></IconButton>
                <IconButton aria-label="Delete ad" size="small" color="error" onClick={() => setDeleteTarget(ad)}><Delete fontSize="small" /></IconButton>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Campaign' : 'New Campaign'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} size="small" />
          <TextField label="Image URL *" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} size="small" />
          <TextField label="Target URL *" value={form.targetUrl} onChange={(e) => setForm({ ...form, targetUrl: e.target.value })} size="small" />
          <TextField label="Alt Text" value={form.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })} size="small" />
          <TextField label="Sponsor" value={form.sponsor} onChange={(e) => setForm({ ...form, sponsor: e.target.value })} size="small" />
          <TextField
            label="Placement *"
            select
            value={form.placement}
            onChange={(e) => setForm({ ...form, placement: e.target.value })}
            size="small"
          >
            {PLACEMENTS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
          <TextField
            label="Format"
            select
            value={form.format}
            onChange={(e) => setForm({ ...form, format: e.target.value })}
            size="small"
          >
            {FORMATS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
          </TextField>
          <TextField
            label="Priority"
            type="number"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
            size="small"
          />
          <FormControlLabel
            control={<Switch checked={form.active ?? true} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
            label="Active"
          />
          <TextField
            label="Start Date"
            type="date"
            value={form.startDate || ''}
            onChange={(e) => setForm({ ...form, startDate: e.target.value || null })}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="End Date"
            type="date"
            value={form.endDate || ''}
            onChange={(e) => setForm({ ...form, endDate: e.target.value || null })}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Campaign?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar?.severity} variant="filled" onClose={() => setSnackbar(null)}>
          {snackbar?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card sx={{ flex: '1 1 140px', minWidth: 140 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ color: 'primary.main' }}>{icon}</Box>
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1}>{value}</Typography>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
