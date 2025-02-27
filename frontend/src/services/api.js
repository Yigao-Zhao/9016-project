import axios from 'axios';
import { auth } from '../firebase';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// 创建基础axios实例
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器添加token
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

// 用户相关API
export const userApi = {
  // 获取用户列表
  getUsers: (limit = 20, offset = 0) => api.get(`/users?limit=${limit}&offset=${offset}`),
  
  // 获取特定用户
  getUser: (userId) => api.get(`/users/${userId}`),
  
  // 更新用户资料
  updateUser: (userId, data) => api.put(`/users/${userId}`, data),
  
  // 获取用户的帖子
  getUserPosts: (userId) => api.get(`/posts?userId=${userId}`)
};

// 帖子相关API
export const postApi = {
  // 获取帖子列表
  getPosts: (limit = 10, offset = 0, userId = null) => {
    const params = { limit, offset };
    if (userId) params.userId = userId;
    return api.get('/posts', { params });
  },
  
  // 获取特定帖子
  getPost: (postId) => api.get(`/posts/${postId}`),
  
  // 创建帖子
  createPost: (data) => api.post('/posts', data),
  
  // 删除帖子
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  
  // 点赞帖子
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  
  // 取消点赞
  unlikePost: (postId) => api.delete(`/posts/${postId}/like`)
};

// 评论相关API
export const commentApi = {
  // 获取帖子的评论
  getPostComments: (postId) => api.get(`/comments/post/${postId}`),
  
  // 添加评论
  createComment: (postId, content) => api.post(`/comments/post/${postId}`, { content }),
  
  // 删除评论
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
  
  // 点赞评论
  likeComment: (commentId) => api.post(`/comments/${commentId}/like`),
  
  // 取消点赞评论
  unlikeComment: (commentId) => api.delete(`/comments/${commentId}/like`)
};

export default {
  user: userApi,
  post: postApi,
  comment: commentApi
};