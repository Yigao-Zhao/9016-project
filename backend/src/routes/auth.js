const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    const db = req.db;
    
    // 检查用户名是否已存在
    const [userCheck] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (userCheck.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // 加密密码
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // 创建用户
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, full_name, created_at) VALUES (?, ?, ?, ?, NOW())', 
      [username, email, passwordHash, fullName]
    );
    
    const [newUser] = await db.query(
      'SELECT user_id, username, email, full_name, created_at FROM users WHERE user_id = ?',
      [result.insertId]
    );
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: newUser[0].user_id, username, email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      user: newUser[0],
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const db = req.db;
    
    // 查找用户
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // 将这行
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  // 临时替换为
    // const isPasswordValid = true; // 临时禁用密码验证，任何密码都可以登录
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.user_id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // 返回用户信息和令牌
    res.json({
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 获取当前用户信息
router.get('/me', authenticate, async (req, res) => {
  try {
    const db = req.db;
    
    const [users] = await db.query(
      'SELECT user_id, username, email, full_name, bio, profile_image_url, created_at, updated_at FROM users WHERE user_id = ?',
      [req.user.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;