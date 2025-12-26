
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { X, Camera, Plus, LogIn, Search, TrendingUp, Users } from 'lucide-react';
import { User, Post, Notification, Comment } from './types';
import { INITIAL_USERS, INITIAL_POSTS } from './constants';
import Layout from './components/Layout';
import PostCard from './components/PostCard';
import CreatePost from './components/CreatePost';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Derived state
  const unreadNotificationsCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
  [notifications]);

  // Auth Actions
  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleCreateProfile = (data: { displayName: string, username: string, bio: string }) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: data.username.toLowerCase().replace(/\s/g, '_'),
      displayName: data.displayName,
      avatar: `https://picsum.photos/seed/${data.username}/200`,
      bio: data.bio,
      followers: [],
      following: [],
      postsCount: 0
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
  };

  const handleUpdateProfile = (data: { displayName: string, bio: string }) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...data };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    setPosts(prev => prev.map(p => p.userId === currentUser.id ? { 
      ...p, 
      username: updatedUser.username, 
      userAvatar: updatedUser.avatar 
    } : p));
    setIsEditModalOpen(false);
  };

  // Interaction Actions
  const handleFollow = (targetUserId: string) => {
    if (!currentUser || currentUser.id === targetUserId) return;
    
    const isFollowing = currentUser.following.includes(targetUserId);
    
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          following: isFollowing 
            ? u.following.filter(id => id !== targetUserId)
            : [...u.following, targetUserId]
        };
      }
      if (u.id === targetUserId) {
        return {
          ...u,
          followers: isFollowing
            ? u.followers.filter(id => id !== currentUser.id)
            : [...u.followers, currentUser.id]
        };
      }
      return u;
    }));

    // Update current user state as well
    setCurrentUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        following: isFollowing 
          ? prev.following.filter(id => id !== targetUserId)
          : [...prev.following, targetUserId]
      };
    });

    if (!isFollowing) {
      addNotification({
        type: 'follow',
        fromUserId: currentUser.id,
        fromUsername: currentUser.username,
        toUserId: targetUserId
      });
    }
  };

  const handleLike = (postId: string) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isLiked = post.likes.includes(currentUser.id);
        const newLikes = isLiked 
          ? post.likes.filter(id => id !== currentUser.id)
          : [...post.likes, currentUser.id];

        if (!isLiked && post.userId !== currentUser.id) {
          addNotification({
            type: 'like',
            fromUserId: currentUser.id,
            fromUsername: currentUser.username,
            toUserId: post.userId,
            postId: post.id
          });
        }
        return { ...post, likes: newLikes };
      }
      return post;
    }));
  };

  const handleComment = (postId: string, text: string) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newComment: Comment = {
          id: Math.random().toString(36).substr(2, 9),
          userId: currentUser.id,
          username: currentUser.username,
          text,
          timestamp: Date.now()
        };
        
        if (post.userId !== currentUser.id) {
          addNotification({
            type: 'comment',
            fromUserId: currentUser.id,
            fromUsername: currentUser.username,
            toUserId: post.userId,
            postId: post.id
          });
        }
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    }));
  };

  const handlePost = (content: string, media?: string, mediaType?: 'image' | 'video') => {
    if (!currentUser) return;
    const newPost: Post = {
      id: `post_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      content,
      mediaUrl: media,
      mediaType,
      likes: [],
      comments: [],
      tags: content.match(/#\w+/g)?.map(t => t.slice(1)) || [],
      timestamp: Date.now()
    };
    setPosts([newPost, ...posts]);
  };

  const addNotification = (data: Partial<Notification>) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type: data.type || 'like',
      fromUserId: data.fromUserId!,
      fromUsername: data.fromUsername!,
      toUserId: data.toUserId!,
      postId: data.postId,
      timestamp: Date.now(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Components
  const HomeFeed = () => (
    <div className="max-w-2xl mx-auto">
      <CreatePost currentUser={currentUser} onPost={handlePost} />
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUser={currentUser!} 
            onLike={handleLike} 
            onComment={handleComment} 
          />
        ))}
      </div>
    </div>
  );

  const ExplorePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    
    const trendingTags = useMemo(() => {
      const tagCounts: Record<string, number> = {};
      posts.forEach(p => p.tags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1));
      return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    }, [posts]);

    const suggestedUsers = useMemo(() => {
      return users.filter(u => u.id !== currentUser?.id && !currentUser?.following.includes(u.id)).slice(0, 4);
    }, [users, currentUser]);

    const filteredPosts = useMemo(() => {
      if (!searchQuery) return posts;
      const lowerQuery = searchQuery.toLowerCase();
      return posts.filter(p => 
        p.content.toLowerCase().includes(lowerQuery) || 
        p.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
        p.username.toLowerCase().includes(lowerQuery)
      );
    }, [posts, searchQuery]);

    return (
      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search people, tags, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4">
            {filteredPosts.map(post => (
              <Link to={`/profile/${post.username}`} key={post.id} className="aspect-square bg-slate-200 rounded-xl overflow-hidden group relative">
                {post.mediaUrl ? (
                  <img src={post.mediaUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="p-3 text-[10px] sm:text-xs text-slate-500 italic h-full flex items-center justify-center text-center">
                    "{post.content.substring(0, 60)}..."
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-sm">
                  <span className="flex items-center gap-1">❤️ {post.likes.length}</span>
                  <span className="flex items-center gap-1">💬 {post.comments.length}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="w-full lg:w-72 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-800">
              <TrendingUp size={20} className="text-indigo-600" />
              <h3 className="font-bold">Trending Tags</h3>
            </div>
            <div className="space-y-3">
              {trendingTags.length > 0 ? trendingTags.map(([tag, count]) => (
                <div key={tag} className="flex justify-between items-center group cursor-pointer" onClick={() => setSearchQuery(tag)}>
                  <p className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">#{tag}</p>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{count} posts</span>
                </div>
              )) : <p className="text-xs text-slate-400">No tags yet</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-800">
              <Users size={20} className="text-indigo-600" />
              <h3 className="font-bold">Suggested Users</h3>
            </div>
            <div className="space-y-4">
              {suggestedUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between">
                  <Link to={`/profile/${user.username}`} className="flex items-center gap-3 overflow-hidden">
                    <img src={user.avatar} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate">@{user.username}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.displayName}</p>
                    </div>
                  </Link>
                  <button 
                    onClick={() => handleFollow(user.id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    );
  };

  const NotificationsPage = () => (
    <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden min-h-[600px] shadow-sm">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-xl font-bold">Notifications</h2>
        <button 
          onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
          className="text-indigo-600 text-sm font-semibold"
        >
          Mark all as read
        </button>
      </div>
      <div className="divide-y divide-slate-50">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-lg">Nothing to see yet</p>
            <p className="text-sm">New likes and comments will show up here.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div key={notif.id} className={`p-4 flex items-center gap-4 ${notif.read ? 'opacity-60' : 'bg-indigo-50/30'}`}>
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                {notif.type === 'like' ? '❤️' : notif.type === 'comment' ? '💬' : '👤'}
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-bold">@{notif.fromUsername}</span>
                  {notif.type === 'like' && ' liked your post.'}
                  {notif.type === 'comment' && ' commented on your post.'}
                  {notif.type === 'follow' && ' started following you.'}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(notif.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const ProfilePage = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6 shadow-sm">
        <div className="h-40 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end -mt-10 mb-6">
            <div className="relative">
              <img 
                src={currentUser?.avatar} 
                alt="Me" 
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-white" 
              />
            </div>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="px-6 py-2 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-colors"
            >
              Edit Profile
            </button>
          </div>
          <div className="mb-4">
            <h1 className="text-2xl font-bold">{currentUser?.displayName}</h1>
            <p className="text-slate-500">@{currentUser?.username}</p>
          </div>
          <p className="text-slate-700 mb-6 leading-relaxed">{currentUser?.bio}</p>
          <div className="flex gap-8 text-sm pt-4 border-t border-slate-50">
            <span className="flex items-center gap-1.5 font-bold">{posts.filter(p => p.userId === currentUser?.id).length} <span className="font-normal text-slate-500 uppercase tracking-tight text-[10px]">Posts</span></span>
            <span className="flex items-center gap-1.5 font-bold">{currentUser?.followers.length || 0} <span className="font-normal text-slate-500 uppercase tracking-tight text-[10px]">Followers</span></span>
            <span className="flex items-center gap-1.5 font-bold">{currentUser?.following.length || 0} <span className="font-normal text-slate-500 uppercase tracking-tight text-[10px]">Following</span></span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {posts.filter(p => p.userId === currentUser?.id).map(post => (
          <div key={post.id} className="aspect-square bg-slate-200 overflow-hidden rounded-lg group relative cursor-pointer">
            {post.mediaUrl ? (
              <img src={post.mediaUrl} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="p-4 text-xs break-words text-slate-600 flex items-center justify-center h-full text-center italic">
                {post.content.substring(0, 50)}...
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
               <span className="flex items-center gap-1">❤️ {post.likes.length}</span>
               <span className="flex items-center gap-1">💬 {post.comments.length}</span>
            </div>
          </div>
        ))}
      </div>

      {isEditModalOpen && (
        <EditProfileModal 
          user={currentUser!} 
          onClose={() => setIsEditModalOpen(false)} 
          onSave={handleUpdateProfile} 
        />
      )}
    </div>
  );

  const AuthPage = () => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [formData, setFormData] = useState({ displayName: '', username: '', bio: '' });

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel border border-slate-200 rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">VibeStream</h1>
            <p className="text-slate-500 mt-2">Connect with your world.</p>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button 
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
            >
              Log In
            </button>
            <button 
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
            >
              Sign Up
            </button>
          </div>

          {mode === 'login' ? (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Select a profile to continue</p>
              {users.map(user => (
                <button 
                  key={user.id}
                  onClick={() => handleLogin(user)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left"
                >
                  <img src={user.avatar} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-slate-800">{user.displayName}</p>
                    <p className="text-xs text-slate-500">@{user.username}</p>
                  </div>
                  <LogIn className="ml-auto text-slate-300" size={20} />
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleCreateProfile(formData); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Display Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Username</label>
                <input 
                  required
                  type="text" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                  placeholder="johndoe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Bio</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all resize-none h-24"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
              >
                Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    );
  };

  if (!currentUser) return <AuthPage />;

  return (
    <HashRouter>
      <Layout 
        currentUser={currentUser} 
        notificationsCount={unreadNotificationsCount}
        onLogout={handleLogout}
      >
        <Routes>
          <Route path="/" element={<HomeFeed />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

const EditProfileModal = ({ user, onClose, onSave }: { user: User, onClose: () => void, onSave: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    displayName: user.displayName,
    bio: user.bio
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer">
              <img src={user.avatar} className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-50" />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera size={24} />
              </div>
            </div>
            <p className="mt-2 text-indigo-600 text-sm font-semibold">Change Photo</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Display Name</label>
              <input 
                type="text" 
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Bio</label>
              <textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-100 outline-none resize-none h-32"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(formData)}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
