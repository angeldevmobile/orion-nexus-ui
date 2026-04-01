export interface Attachment {
  type: 'image' | 'code' | 'file';
  url: string;
  name: string;
}

export interface CommunityPost {
  id: number;
  title: string;
  content: string;
  author_id: number;
  category: 'question' | 'showcase' | 'tutorial' | 'discussion';
  tags: string[];
  is_resolved: boolean;
  is_pinned: boolean;
  attachments: Attachment[];
  likes_count: number;
  comments_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CommunityPostWithAuthor extends CommunityPost {
  author: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
  };
  comments?: PostComment[];
  likes?: PostLike[];
}

export interface PostComment {
  id: number;
  post_id: number;
  author_id: number;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface PostCommentWithAuthor extends PostComment {
  author: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
  };
}

export interface PostLike {
  id: number;
  post_id: number;
  user_id: number;
  type: string; // 'like', 'love', 'laugh', etc.
  created_at: Date;
}

export interface PostLikeWithUser extends PostLike {
  user: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
  };
}

export interface CreatePostData {
  title: string;
  content: string;
  category: CommunityPost['category'];
  tags?: string[];
  attachments?: Attachment[];
}

export interface UpdatePostData extends Partial<CreatePostData> {
  is_resolved?: boolean;
  is_pinned?: boolean;
}