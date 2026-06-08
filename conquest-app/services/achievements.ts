import { api } from "../lib/api";
import { IdResponse, Pagination, PaginationRequest } from "./types";

  export type AchievementCategory = 'career' | 'personal' | 'learning' | 'fitness';

  export interface TagSummary {
      id: string;
      name: string;
      colorHex: string;
  }

  export interface EvidenceSummary {
      id: string;
      storagePath: string;
      fileType: string | null;
      caption: string | null;
      uploadedAt: string;
  }

  export interface AchievementResponse {
      groupId: string;
      id: string;
      title: string;
      description: string | null;
      achievementCategory: AchievementCategory;
      difficultyLevel: number;
      achievedAt: string;
      createdAt: string;
      tags: TagSummary[];
      evidences: EvidenceSummary[];
  }

  export interface CreateAchievementRequest {
      title: string;
      description?: string;
      category: AchievementCategory;
      difficultyLevel: number;
      achievedAt: string;
  }

  export interface UpdateAchievementRequest {
      title?: string;
      description?: string;
      category?: AchievementCategory;
      difficultyLevel?: number;
      achievedAt?: string;
  }
  
  export interface CreateEvidenceRequest {
      storagePath: string;
      fileType?: string;
      caption?: string;
  }

  const PREFIX = "/achievements";

  export async function getAchievements(groupId: string, pag: PaginationRequest) {
      const { data } = await api.get<Pagination<AchievementResponse>>(`${PREFIX}/${groupId}`, { params:
  pag });
      return data;
  }
  
  export async function createAchievement(groupId: string, request: CreateAchievementRequest) {
      const { data } = await api.post<IdResponse>(`${PREFIX}/${groupId}`, request);
      return data;
  }

  export async function updateAchievement(groupId: string, achievementId: string, request: 
  UpdateAchievementRequest) {
      const { data } = await api.patch<IdResponse>(`${PREFIX}/${groupId}/${achievementId}`, request);
      return data;
  }

  export async function deleteAchievement(groupId: string, achievementId: string) {
      const { data } = await api.delete<void>(`${PREFIX}/${groupId}/${achievementId}`);
      return data;
  }

  export async function addTag(groupId: string, achievementId: string, tagId: string) {
      const { data } = await api.post<void>(`${PREFIX}/${groupId}/${achievementId}/tags/${tagId}`);
      return data;
  }

  export async function removeTag(groupId: string, achievementId: string, tagId: string) {
      const { data } = await api.delete<void>(`${PREFIX}/${groupId}/${achievementId}/tags/${tagId}`);
      return data;
  }

  export async function addEvidence(groupId: string, achievementId: string, request: 
  CreateEvidenceRequest) {
      const { data } = await api.post<IdResponse>(`${PREFIX}/${groupId}/${achievementId}/evidences`,
  request);
      return data;
  }
  
  export async function removeEvidence(groupId: string, achievementId: string, evidenceId: string) {
      const { data } = await
  api.delete<void>(`${PREFIX}/${groupId}/${achievementId}/evidences/${evidenceId}`);
      return data;
  }