
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  followers: string[];
  following: string[];
  postsCount: number;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: string[]; // array of userIds
  comments: Comment[];
  tags: string[];
  timestamp: number;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow';
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  postId?: string;
  timestamp: number;
  read: boolean;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  notifications: Notification[];
}
