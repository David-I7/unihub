import type { Comment } from "@/types/domain";

export interface CreateCommentPayload {
  content: string;
}

export interface UpdateCommentPayload {
  content: string;
}

export type { Comment };
