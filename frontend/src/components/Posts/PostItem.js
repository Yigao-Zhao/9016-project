import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { postApi } from '../../services/api';
import Comments from './Comments';

function PostItem({ post, onDelete }) {
  const { currentUser, userProfile } = useAuth();
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [isLiked, setIsLiked] = useState(post.user_has_liked || false);
  const [showComments, setShowComments] = useState(false);
  const [error, setError] = useState('');
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleLike = async () => {
    if (!currentUser) return;
    
    try {
      if (isLiked) {
        await postApi.unlikePost(post.post_id);
        setLikeCount(prev => prev - 1);
      } else {
        await postApi.likePost(post.post_id);
        setLikeCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      setError('点赞操作失败，请重试');
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('确定要删除这篇帖子吗？')) {
      return;
    }
    
    try {
      await postApi.deletePost(post.post_id);
      if (onDelete) {
        onDelete(post.post_id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('删除帖子失败，请重试');
    }
  };
  
  const isOwner = userProfile && userProfile.user_id === post.user_id;
  
  return (
    <div className="card mb-3">
      {error && <div className="alert alert-danger m-2">{error}</div>}
      
      <div className="card-header d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <img 
            src={post.profile_image_url || '/default-avatar.png'} 
            alt={`${post.username}的头像`} 
            className="rounded-circle me-2" 
            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
          />
          <div>
            <Link to={`/profile/${post.username}`} className="fw-bold text-decoration-none">
              {post.username}
            </Link>
            <div className="text-muted small">{formatDate(post.created_at)}</div>
          </div>
        </div>
        
        {isOwner && (
          <button 
            className="btn btn-sm btn-outline-danger" 
            onClick={handleDelete}
          >
            删除
          </button>
        )}
      </div>
      
      <div className="card-body">
        <p className="card-text">{post.content}</p>
        {post.image_url && (
          <div className="text-center mb-3">
            <img 
              src={post.image_url} 
              alt="帖子图片" 
              className="img-fluid rounded" 
              style={{ maxHeight: '400px' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/image-placeholder.png';
                e.target.classList.add('img-thumbnail');
                e.target.style.opacity = '0.6';
              }}
            />
          </div>
        )}
        
        <div className="d-flex mt-3">
          <button 
            className={`btn btn-sm ${isLiked ? 'btn-primary' : 'btn-outline-primary'} me-2`}
            onClick={handleLike}
          >
            <i className="bi bi-heart-fill me-1"></i> {likeCount}
          </button>
          
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowComments(!showComments)}
          >
            <i className="bi bi-chat me-1"></i> {post.comment_count || 0}
          </button>
        </div>
      </div>
      
      {showComments && (
        <div className="card-footer bg-light">
          <Comments postId={post.post_id} />
        </div>
      )}
    </div>
  );
}

export default PostItem;