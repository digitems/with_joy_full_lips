import { Box, Skeleton } from '@mui/material';

export function SongCardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, overflow: 'hidden' }}>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ flexShrink: 0, width: 160 }}>
          <Skeleton variant="rounded" width={160} height={160} sx={{ borderRadius: 2, mb: 1 }} />
          <Skeleton width="80%" height={20} />
          <Skeleton width="50%" height={16} />
        </Box>
      ))}
    </Box>
  );
}

export function SongListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center', px: 2, py: 1 }}>
          <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 1.5, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="70%" height={20} />
            <Skeleton width="40%" height={16} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2, p: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 3 }} />
      ))}
    </Box>
  );
}
