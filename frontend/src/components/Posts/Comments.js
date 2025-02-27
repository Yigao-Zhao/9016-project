import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { commentApi } from '../../services/api';

function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, userProfile } = useAuth();
  
  useEffect(() => {
    async function fetchComments() {
      try {
        setLoading(true);
        const response = await commentApi.getPostComments(postId);
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setError('加载评论失败');
      } finally {
        setLoading(false);
      }
    }
    
    fetchComments();
  }, [postId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      return;
    }
    
    if (!newComment.trim()) {
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await commentApi.createComment(postId, newComment);
      
      // 添加用户信息到评论以便显示
      const commentWithUser = {
        ...response.data,
        username: userProfile.username,
        profile_image_url: userProfile.profile_image_url,
        user_id: userProfile.user_id
      };
      
      setComments([commentWithUser, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('发表评论失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async (commentId) => {
    if (!window.confirm('确定要删除这条评论吗？')) {
      return;
    }
    
    try {
      await commentApi.deleteComment(commentId);
      setComments(comments.filter(comment => comment.comment_id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('删除评论失败，请重试');
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return <div className="text-center py-3">加载评论中...</div>;
  }
  
  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {currentUser && (
        <form onSubmit={handleSubmit} className="mb-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="写下你的评论..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting || !newComment.trim()}
            >
              发布
            </button>
          </div>
        </form>
      )}
      
      {comments.length === 0 ? (
        <p className="text-center text-muted">还没有评论，来发表第一条吧！</p>
      ) : (
        <div>
          {comments.map(comment => (
            <div key={comment.comment_id} className="d-flex mb-2">
              <img 
                src={comment.profile_image_url || '/default-avatar.png'} 
                alt={`${comment.username}的头像`} 
                className="rounded-circle me-2" 
                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
              />
              <div className="flex-grow-1">
                <div className="bg-light p-2 rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <Link to={`/profile/${comment.username}`} className="fw-bold text-decoration-none">
                      {comment.username}
                    </Link>
                    <small className="text-muted">{formatDate(comment.created_at)}</small>
                  </div>
                  <p className="mb-0">{comment.content}</p>
                </div>
                {userProfile && userProfile.user_id === comment.user_id && (
                  <button 
                    className="btn btn-sm text-danger bg-transparent border-0"
                    onClick={() => handleDelete(comment.comment_id)}
                  >
                    删除
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Comments;