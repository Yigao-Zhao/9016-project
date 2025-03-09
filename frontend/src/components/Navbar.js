import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  console.log('Current User', currentUser);  // 在这里打印 currentUser

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">SocialApp</Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">首页</Link>
            </li>
            
            {currentUser ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/create-post">发布帖子</Link>
                </li>
                
                <li className="nav-item">
                  <Link 
                    className="nav-link" 
                    to={`/profile/${currentUser.displayName}`}
                  >
                    个人资料
                  </Link>
                </li>
                
                <li className="nav-item">
                  <button 
                    onClick={handleLogout} 
                    className="nav-link btn btn-link"
                  >
                    退出登录
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">登录</Link>
                </li>
                
                <li className="nav-item">
                  <Link className="nav-link" to="/register">注册</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;