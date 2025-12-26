
import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post, User } from '../types';
import { generateSmartComment } from '../services/gemini';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onLike, onComment }) => {
  const [commentText, setCommentText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const isLiked = post.likes.includes(currentUser.id);

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText('');
  };

  const handleMagicComment = async () => {
    setIsGenerating(true);
    const suggestion = await generateSmartComment(post.content);
    setCommentText(suggestion);
    setIsGenerating(false);
  };

  return (
    <article className="bg-white md:rounded-2xl border border-slate-200 mb-6 overflow-hidden shadow-sm">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={post.userAvatar} alt={post.username} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <p className="font-bold text-sm">@{post.username}</p>
            <p className="text-xs text-slate-500">
              {formatDistanceToNow(post.timestamp)} ago
            </p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="px-4 pb-3">
        <p className="text-slate-800 whitespace-pre-wrap">{post.content}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {post.tags.map(tag => (
            <span key={tag} className="text-indigo-600 text-xs font-medium hover:underline cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {post.mediaUrl && (
        <div className="relative aspect-square md:aspect-video bg-slate-100 flex items-center justify-center">
          {post.mediaType === 'image' ? (
            <img src={post.mediaUrl} alt="Post content" className="w-full h-full object-cover" />
          ) : (
            <video src={post.mediaUrl} controls className="w-full h-full object-cover" />
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-6 mb-4">
          <button 
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-rose-500' : 'text-slate-600 hover:text-rose-500'}`}
          >
            <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
            <span className="font-semibold text-sm">{post.likes.length}</span>
          </button>
          <div className="flex items-center gap-1.5 text-slate-600">
            <MessageCircle size={24} />
            <span className="font-semibold text-sm">{post.comments.length}</span>
          </div>
          <button className="text-slate-600 hover:text-indigo-600">
            <Share2 size={24} />
          </button>
        </div>

        {post.comments.length > 0 && (
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto hide-scrollbar border-t border-slate-50 pt-4">
            {post.comments.map(comment => (
              <div key={comment.id} className="text-sm">
                <span className="font-bold mr-2">@{comment.username}</span>
                <span className="text-slate-700">{comment.text}</span>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleComment} className="flex items-center gap-2 mt-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Add a comment..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-100"
            />
            <button 
              type="button"
              disabled={isGenerating}
              onClick={handleMagicComment}
              className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all ${isGenerating ? 'text-indigo-300 animate-pulse' : 'text-indigo-400 hover:text-indigo-600'}`}
              title="Generate AI comment"
            >
              <Sparkles size={16} />
            </button>
          </div>
          <button 
            type="submit" 
            disabled={!commentText.trim()}
            className="text-indigo-600 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:text-indigo-700"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </article>
  );
};

export default PostCard;
