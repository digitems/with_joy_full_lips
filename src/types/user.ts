export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  profileImage?: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface UserStats {
  totalPlays: number;
  totalFavorites: number;
  totalRatings: number;
  totalDownloads: number;
}
