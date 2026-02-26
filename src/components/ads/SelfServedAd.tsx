import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { fetchAd, trackImpression, trackClick } from '../../api/ads';
import type { SelfServedAd as SelfServedAdType } from '../../api/ads';
import { AD_CONSENT_KEY } from './constants';

interface SelfServedAdProps {
  /** Placement key matching backend: 'leaderboard','infeed','sidebar','mobile_banner' */
  placement: string;
  /** Ad format hint for backend filtering */
  format?: string;
  /** MUI sx overrides */
  sx?: object;
}

export default function SelfServedAd({ placement, format, sx }: SelfServedAdProps) {
  const [ad, setAd] = useState<SelfServedAdType | null>(null);
  const impressionSent = useRef(false);
  const adRef = useRef<HTMLDivElement>(null);

  const consented = localStorage.getItem(AD_CONSENT_KEY) === 'granted';

  // Fetch ad on mount
  useEffect(() => {
    if (!consented) return;
    let cancelled = false;

    fetchAd(placement, format).then((result) => {
      if (!cancelled) setAd(result);
    });

    return () => { cancelled = true; };
  }, [placement, format, consented]);

  // IAB viewability: track impression when ≥50% visible for ≥1 second
  useEffect(() => {
    if (!ad || impressionSent.current || !adRef.current) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Start 1-second timer when ≥50% visible
          timer = setTimeout(() => {
            if (!impressionSent.current) {
              trackImpression(ad.id);
              impressionSent.current = true;
              observer.disconnect();
            }
          }, 1000);
        } else if (timer) {
          // Cancel if scrolled away before 1 second
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(adRef.current);

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [ad]);

  if (!consented || !ad) return null;

  const handleClick = () => {
    trackClick(ad.id);
  };

  return (
    <Box
      ref={adRef}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
        ...sx,
      }}
    >
      <a
        href={ad.targetUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        style={{ display: 'block', textDecoration: 'none' }}
      >
        <img
          src={ad.imageUrl}
          alt={ad.altText || ad.title}
          loading="lazy"
          style={{
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 8,
          }}
        />
      </a>
      {ad.sponsor && (
        <Typography
          variant="caption"
          sx={{
            color: 'text.disabled',
            mt: 0.5,
            fontSize: '0.7rem',
          }}
        >
          Sponsored by {ad.sponsor}
        </Typography>
      )}
    </Box>
  );
}
