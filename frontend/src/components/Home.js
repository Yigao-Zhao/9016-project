import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PostList from './Posts/PostList';

function Home() {
  const { currentUser } = useAuth();
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Latest News</h3>
        {currentUser && (
          <Link to="/create-post" className="btn btn-primary">
            Create new post
          </Link>
        )}
      </div>
      
      <PostList />
    </div>
  );
}

export default Home;