export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  audioUrl: string;
  coverImageUrl: string;
  category?: string;
  categoryName?: string;
  playCount: number;
  downloadCount: number;
  likes: number;
  averageRating: number;
  totalRatings: number;
  ratingDistribution?: Record<number, number>;
  isFavorite: boolean;
  isLiked: boolean;
  userRating?: number;
  userPlayCount?: number;
  userDownloadCount?: number;
  createdAt: string;
}
