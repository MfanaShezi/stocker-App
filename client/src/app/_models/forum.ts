export interface ForumThread {
  id: number;
  title: string;
  description?: string;
  creatorUserId: number;
  creatorUsername: string;
  createdAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  isActive: boolean;
}

export interface ForumMessage {
  id: number;
  threadId: number;
  userId: number;
  username: string;
  content: string;
  createdAt: Date;
}

export interface CreateThread {
  title: string;
  description?: string;
}

export interface CreateMessage {
  content: string;
}