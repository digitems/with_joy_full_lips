import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardActionArea } from '@mui/material';
import { LibraryMusic } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { categoriesApi } from '../api/categories';
import { CategoryGridSkeleton } from '../components/common/SkeletonLoading';
import { playlistGradients } from '../theme/colors';
import SEOHead from '../components/common/SEOHead';
import type { Category } from '../types/category';

// Module-level cache — survives re-mounts, 5-minute TTL
const CACHE_TTL = 5 * 60 * 1000;
let browseCache: { categories: Category[]; fetchedAt: number } | null = null;

export default function BrowsePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (browseCache && Date.now() - browseCache.fetchedAt < CACHE_TTL) {
      setCategories(browseCache.categories);
      setLoading(false);
      return;
    }
    categoriesApi
      .getAll()
      .then(({ data }) => {
        const cats = data.data || [];
        browseCache = { categories: cats, fetchedAt: Date.now() };
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ pb: 2 }}>
      <SEOHead
        title="Browse Categories"
        description="Browse hymn categories — worship, praise, gospel, Christmas carols, and more. Find the perfect hymns for every occasion."
        canonicalPath="/browse"
      />
      {/* Hero section */}
      <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <LibraryMusic sx={{ fontSize: 64, color: 'primary.main', mb: 1 }} />
        </motion.div>
        <Typography variant="h5" fontWeight={700}>
          Browse Categories
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Explore hymns by category
        </Typography>
      </Box>

      {/* Category grid */}
      {loading ? (
        <CategoryGridSkeleton />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 2,
            px: 2,
          }}
        >
          {categories.map((cat, idx) => {
            const gradient = playlistGradients[idx % playlistGradients.length];
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <CardActionArea
                    onClick={() => navigate(`/category/${cat.id}`)}
                    sx={{
                      background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
                      p: 2.5,
                      minHeight: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <LibraryMusic sx={{ fontSize: 28, color: 'rgba(255,255,255,0.7)', mb: 0.5 }} />
                    <Typography variant="subtitle1" color="#fff" fontWeight={700}>
                      {cat.name}
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.7)">
                      {cat.songCount} hymn{cat.songCount !== 1 ? 's' : ''}
                    </Typography>
                  </CardActionArea>
                </Card>
              </motion.div>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
