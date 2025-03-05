import axios from 'axios';
import { auth } from '../firebase';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create the base axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add Request Interceptor & Add token
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// User related API
export const userApi = {
  // Get user list
  getUsers: (limit = 20, offset = 0) => api.get(`/users?limit=${limit}&offset=${offset}`),
  
  // Get specific user
  getUser: (userId) => api.get(`/users/${userId}`),
  
  // Update user profile
  updateUser: (userId, data) => api.put(`/users/${userId}`, data),
  
  // Get user's posts
  getUserPosts: (userId) => api.get(`/posts?userId=${userId}`)
};

// Post related API
export const postApi = {
  // Get post list
  getPosts: (limit = 10, offset = 0, userId = null) => {
    const params = { limit, offset };
    if (userId) params.userId = userId;
    return api.get('/posts', { params });
  },
  
  // Get specific post
  getPost: (postId) => api.get(`/posts/${postId}`),
  
  // Create post
  createPost: (data) => api.post('/posts', data),
  
  // Delete post
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  
  // Like post
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  
  // Unlike post
  unlikePost: (postId) => api.delete(`/posts/${postId}/like`)
};

// Comment related API
export const commentApi = {
  // Get post comments
  getPostComments: (postId) => api.get(`/comments/post/${postId}`),
  
  // Add comment
  createComment: (postId, content) => api.post(`/comments/post/${postId}`, { content }),
  
  // Delete comment
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
  
  // Like comment
  likeComment: (commentId) => api.post(`/comments/${commentId}/like`),
  
  // Unlike comment
  unlikeComment: (commentId) => api.delete(`/comments/${commentId}/like`)
};

export default {
  user: userApi,
  post: postApi,
  comment: commentApi
};