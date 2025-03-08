import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { currentUser, logout, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  // Add scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  return (
    <nav className={`navbar navbar-expand-lg navbar-dark ${scrolled ? 'shadow-sm py-2' : 'py-3'}`} 
         style={{transition: 'all 0.3s ease'}}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-people-fill me-2"></i>
          <span>SocialApp</span>
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">
                <i className="bi bi-house-door me-1"></i> Home
              </Link>
            </li>
            
            {currentUser ? (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/create-post')}`} to="/create-post">
                    <i className="bi bi-plus-square me-1"></i> Post
                  </Link>
                </li>
                
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {userProfile?.profile_image_url ? (
                      <img 
                        src={userProfile.profile_image_url} 
                        alt="Profile"
                        className="avatar me-2"
                        style={{width: '30px', height: '30px'}}
                      />
                    ) : (
                      <i className="bi bi-person-circle me-1"></i>
                    )}
                    <span>{currentUser.displayName || 'Account'}</span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link
                        className="dropdown-item"
                        to={`/profile/${currentUser.displayName}`}
                      >
                        <i className="bi bi-person me-2"></i>
                        Profile
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="dropdown-item text-danger"
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/login')}`} to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i> Login
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/register')}`} to="/register">
                    <i className="bi bi-person-plus me-1"></i> Register
                  </Link>
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