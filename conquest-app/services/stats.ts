import { api } from "../lib/api";
import { AchievementCategory } from "./achievements";

export interface LastAchievementSummary {
  id: string;
  title: string;
  category: AchievementCategory;
  achievedAt: string;
}

export interface StatsResponse {
  totalAchievements: number;
  totalEvidences: number;
  averageDifficulty: number;
  favoriteCategory: AchievementCategory;
  mostProductiveMonth: string;
  achievementsByCategory: Record<string, number>;
  achievementsByMonth: Record<string, number>;
  lastAchievement: LastAchievementSummary | null;
}

export async function getStats(): Promise<StatsResponse> {
  const { data } = await api.get<StatsResponse>("/stats");
  return data;
}
