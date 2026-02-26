import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'With Joyful Lips';
const DEFAULT_DESCRIPTION = 'Stream and enjoy your favorite hymns — worship, praise, and gospel music for every moment.';
const DEFAULT_OG_IMAGE = '/icons/og-image.png';
const SITE_URL = 'https://withjoyfullips.com';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noIndex = false,
  jsonLd,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Hymns for Every Moment`;
  const canonicalUrl = canonicalPath ? `${SITE_URL}${canonicalPath}` : undefined;
  const absoluteOgImage = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteOgImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteOgImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

/** Organization schema — include once globally (e.g., in AppShell or App). */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icons/icon.svg`,
  description: DEFAULT_DESCRIPTION,
  sameAs: [],
};

/** WebSite schema with SearchAction — include once globally. */
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
};

/** Build a BreadcrumbList schema from path segments. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** Build a MusicRecording schema for a song. */
export function songSchema(song: {
  title: string;
  artist: string;
  duration: number;
  coverImageUrl: string;
  averageRating?: number;
  totalRatings?: number;
  id: string;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: song.title,
    byArtist: {
      '@type': 'MusicGroup',
      name: song.artist,
    },
    duration: `PT${Math.floor(song.duration / 60)}M${song.duration % 60}S`,
    image: song.coverImageUrl,
    url: `${SITE_URL}/category/${song.id}`,
  };

  if (song.averageRating && song.totalRatings && song.totalRatings > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: song.averageRating.toFixed(1),
      ratingCount: song.totalRatings,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}
