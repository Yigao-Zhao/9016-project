import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="text-center py-5">
      <h1 className="display-1">404</h1>
      <h2 className="mb-4">页面未找到</h2>
      <p className="lead mb-4">您访问的页面不存在或已被移除</p>
      <Link to="/" className="btn btn-primary">
        返回首页
      </Link>
    </div>
  );
}

export default NotFound;