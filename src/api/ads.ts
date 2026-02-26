import api from './client';

export interface SelfServedAd {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  altText: string;
  sponsor: string;
  placement: string;
  format: string;
}

export interface AdMetric {
  id: string;
  title: string;
  placement: string;
  format: string;
  active: boolean;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface AdCampaign extends SelfServedAd {
  active: boolean;
  priority: number;
  impressions: number;
  clicks: number;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdCreatePayload {
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: string;
  altText?: string;
  sponsor?: string;
  format?: string;
  priority?: number;
  active?: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

// ── Public endpoints ──────────────────────────────────────────

/**
 * Fetch an active self-served ad for the given placement.
 * Returns `null` when no ad is available.
 */
export async function fetchAd(
  placement: string,
  format?: string,
): Promise<SelfServedAd | null> {
  try {
    const params: Record<string, string> = { placement };
    if (format) params.format = format;

    const { data } = await api.get('/ads', { params });
    return data.data ?? null;
  } catch {
    return null;
  }
}

/** Fire-and-forget impression tracking. */
export function trackImpression(adId: string): void {
  api.post(`/ads/${adId}/impression`).catch(() => {});
}

/** Fire-and-forget click tracking. */
export function trackClick(adId: string): void {
  api.post(`/ads/${adId}/click`).catch(() => {});
}

// ── Admin endpoints ───────────────────────────────────────────

/** Fetch ad performance metrics (admin). */
export async function fetchMetrics(placement?: string): Promise<AdMetric[]> {
  const params: Record<string, string> = {};
  if (placement) params.placement = placement;
  const { data } = await api.get('/ads/metrics', { params });
  return data.data ?? [];
}

/** List all ad campaigns (admin). */
export async function listAds(): Promise<AdCampaign[]> {
  const { data } = await api.get('/ads/all');
  return data.data ?? [];
}

/** Create a new ad campaign (admin). */
export async function createAd(payload: AdCreatePayload): Promise<AdCampaign> {
  const { data } = await api.post('/ads', payload);
  return data.data;
}

/** Update an existing ad campaign (admin). */
export async function updateAd(adId: string, payload: Partial<AdCreatePayload>): Promise<AdCampaign> {
  const { data } = await api.put(`/ads/${adId}`, payload);
  return data.data;
}

/** Delete an ad campaign (admin). */
export async function deleteAd(adId: string): Promise<void> {
  await api.delete(`/ads/${adId}`);
}
