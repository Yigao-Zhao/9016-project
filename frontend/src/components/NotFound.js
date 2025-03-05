import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="text-center py-5">
      <h1 className="display-1">404</h1>
      <h2 className="mb-4">Page Not Found</h2>
      <p className="lead mb-4">The page you are looking for does not exist or has been moved</p>
      <Link to="/" className="btn btn-primary">
        Back to Home Page
      </Link>
    </div>
  );
}

export default NotFound;