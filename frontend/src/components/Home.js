import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PostList from './Posts/PostList';

function Home() {
  const { currentUser } = useAuth();
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>最新动态</h3>
        {currentUser && (
          <Link to="/create-post" className="btn btn-primary">
            发布帖子
          </Link>
        )}
      </div>
      
      <PostList />
    </div>
  );
}

export default Home;