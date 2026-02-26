import { useEffect, useRef, useState, memo } from 'react';
import { Box } from '@mui/material';
import { AD_CONSENT_KEY, AD_CONSENT_EVENT } from './constants';
import SelfServedAd from './SelfServedAd';
import { useAdExperiment } from '../../hooks/useAdExperiment';

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

// Re-export for backward-compat (AdConsentBanner imports from here)
export { AD_CONSENT_KEY };

// --- AdSense script loader (shared singleton) ---
let scriptState: 'idle' | 'loading' | 'loaded' | 'error' = 'idle';
const pendingCallbacks: Array<(ok: boolean) => void> = [];

function ensureAdScript(clientId: string): Promise<boolean> {
  if (scriptState === 'loaded') return Promise.resolve(true);
  if (scriptState === 'error') return Promise.resolve(false);

  return new Promise((resolve) => {
    pendingCallbacks.push(resolve);
    if (scriptState === 'loading') return;

    scriptState = 'loading';
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      scriptState = 'loaded';
      pendingCallbacks.forEach((cb) => cb(true));
      pendingCallbacks.length = 0;
    };
    script.onerror = () => {
      scriptState = 'error';
      pendingCallbacks.forEach((cb) => cb(false));
      pendingCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

// --- Component ---
interface AdSlotProps {
  /** AdSense ad unit slot ID (from your AdSense dashboard) */
  slotId: string;
  /** Backend placement key for self-served fallback: 'leaderboard','infeed','sidebar','mobile_banner' */
  placement?: string;
  /** Ad layout format */
  format?: 'horizontal' | 'vertical' | 'rectangle' | 'auto';
  /** Let AdSense pick the best responsive size */
  responsive?: boolean;
  /** MUI sx overrides for the wrapper */
  sx?: object;
}

export default memo(function AdSlot({
  slotId,
  placement,
  format = 'auto',
  responsive = true,
  sx,
}: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const [adSenseFailed, setAdSenseFailed] = useState(false);
  const { showAds } = useAdExperiment();

  // Consent: reactive via custom event dispatched by AdConsentBanner
  const [consented, setConsented] = useState(
    () => localStorage.getItem(AD_CONSENT_KEY) === 'granted',
  );

  useEffect(() => {
    const handler = () =>
      setConsented(localStorage.getItem(AD_CONSENT_KEY) === 'granted');
    window.addEventListener(AD_CONSENT_EVENT, handler);
    return () => window.removeEventListener(AD_CONSENT_EVENT, handler);
  }, []);

  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID as string;
  const hasAdSense = !!clientId && !!slotId;

  // Load AdSense script + push ad request
  useEffect(() => {
    if (!hasAdSense || !consented || pushed.current) return;

    ensureAdScript(clientId).then((ok) => {
      if (ok && !pushed.current) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushed.current = true;
        } catch {
          setAdSenseFailed(true);
        }
      } else if (!ok) {
        setAdSenseFailed(true);
      }
    });
  }, [clientId, hasAdSense, consented]);

  // Detect unfilled / blocked AdSense slot (after 4 s)
  useEffect(() => {
    if (!hasAdSense || !consented) return;
    const timer = setTimeout(() => {
      const ins = containerRef.current?.querySelector<HTMLElement>('ins.adsbygoogle');
      if (ins && (ins.dataset.adStatus === 'unfilled' || ins.offsetHeight === 0)) {
        setAdSenseFailed(true);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [hasAdSense, consented]);

  // Gate on consent and A/B experiment
  if (!consented || !showAds) return null;

  // --- Fallback: self-served ad from backend ---
  if (!hasAdSense || adSenseFailed) {
    if (!placement) return null;
    return <SelfServedAd placement={placement} format={format} sx={sx} />;
  }

  // --- Primary: AdSense ---
  const minHeight =
    format === 'rectangle' ? 250 : format === 'vertical' ? 600 : 50;

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
        minHeight,
        ...sx,
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </Box>
  );
});
