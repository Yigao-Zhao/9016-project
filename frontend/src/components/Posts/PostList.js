import React, { useState, useEffect } from 'react';
import { postApi } from '../../services/api';
import PostItem from './PostItem';

function PostList({ userId = null }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postApi.getPosts(limit, page * limit, userId);
      
      if (response.data.length < limit) {
        setHasMore(false);
      }
      
      if (page === 0) {
        setPosts(response.data);
      } else {
        setPosts(prev => [...prev, ...response.data]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('加载帖子失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, userId]);
  
  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post.post_id !== postId));
  };
  
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }
  
  return (
    <div>
      {posts.length === 0 && !loading ? (
        <div className="text-center py-5">
          <p className="text-muted">还没有帖子，快来分享第一条动态吧！</p>
        </div>
      ) : (
        <>
          <div className="d-flex flex-column gap-4">
            {posts.map(post => (
              <PostItem 
                key={post.post_id} 
                post={post} 
                onDelete={handleDeletePost} 
              />
            ))}
          </div>
          
          {loading && (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">加载中...</span>
              </div>
            </div>
          )}
          
          {hasMore && !loading && (
            <div className="text-center mt-4 mb-4">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => setPage(prev => prev + 1)}
              >
                加载更多
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PostList;