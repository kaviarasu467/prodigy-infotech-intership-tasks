
import { User, Post } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_1',
    username: 'alex_vibes',
    displayName: 'Alex Rivers',
    avatar: 'https://picsum.photos/seed/alex/200',
    bio: 'Capturing moments and exploring the digital frontier. ✨',
    followers: ['user_2'],
    following: ['user_2', 'user_3'],
    postsCount: 2
  },
  {
    id: 'user_2',
    username: 'sara_designs',
    displayName: 'Sara Chen',
    avatar: 'https://picsum.photos/seed/sara/200',
    bio: 'Product Designer | Travel Enthusiast | Coffee Addict ☕',
    followers: ['user_1', 'user_3'],
    following: ['user_1'],
    postsCount: 1
  },
  {
    id: 'user_3',
    username: 'tech_guru',
    displayName: 'Jordan Smith',
    avatar: 'https://picsum.photos/seed/jordan/200',
    bio: 'Living in the future. AI and Web3 advocate.',
    followers: ['user_1'],
    following: ['user_2'],
    postsCount: 1
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    userId: 'user_1',
    username: 'alex_vibes',
    userAvatar: 'https://picsum.photos/seed/alex/200',
    content: 'Just watched the sunrise over the city. Incredible start to the day!',
    mediaUrl: 'https://picsum.photos/seed/city/800/600',
    mediaType: 'image',
    likes: ['user_2'],
    comments: [
      { id: 'c1', userId: 'user_2', username: 'sara_designs', text: 'Stunning view!', timestamp: Date.now() - 3600000 }
    ],
    tags: ['city', 'morning', 'vibes'],
    timestamp: Date.now() - 7200000
  },
  {
    id: 'post_2',
    userId: 'user_2',
    username: 'sara_designs',
    userAvatar: 'https://picsum.photos/seed/sara/200',
    content: 'Deep work session in my favorite corner.',
    mediaUrl: 'https://picsum.photos/seed/desk/800/600',
    mediaType: 'image',
    likes: ['user_1', 'user_3'],
    comments: [],
    tags: ['design', 'wfh'],
    timestamp: Date.now() - 14400000
  }
];
