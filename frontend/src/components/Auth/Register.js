import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; // Firebase认证库

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const auth = getAuth(); // 获取 Firebase 认证实例

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('两次输入的密码不匹配');
    }

    console.log("Registering with:", { email, password, username, fullName });

    try {
      setError('');
      setLoading(true);
      
      // 使用 Firebase 注册新用户
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;  // 获取当前用户信息

      // 获取 Firebase ID Token
      const firebaseToken = await user.getIdToken();  // 获取 Firebase Token

      // 发送到后端进行注册
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          fullName,
          firebaseToken,  // 将 Firebase Token 发送到后端
          password,       // 如果没有 Firebase Token，包含密码
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // 注册成功后跳转
        navigate('/');
      } else {
        setError(data.error || '注册失败，请重试');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-body">
            <h2 className="text-center mb-4">注册</h2>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">邮箱</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="username" className="form-label">用户名</label>
                <input
                  type="text"
                  id="username"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="fullName" className="form-label">全名</label>
                <input
                  type="text"
                  id="fullName"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label">密码</label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">确认密码</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100" 
                disabled={loading}
              >
                {loading ? '注册中...' : '注册'}
              </button>
            </form>
            
            <div className="text-center mt-3">
              已有账号？ <Link to="/login">登录</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
