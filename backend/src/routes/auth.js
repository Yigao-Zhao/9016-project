const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 初始化 Firebase Admin SDK（如果未初始化）
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../config/firebaseServiceAccountKey.json'))
  });
}

// 注册
router.post('/register', async (req, res) => {
  try {
    console.log(req.body);
    const { username, email, password, fullName, firebaseToken } = req.body;
    const db = req.db;

    // 检查必填字段是否为空
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 检查是否已有用户
    const [userCheck] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (userCheck.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    let passwordHash = null;
    let firebaseUid = null;

    // 如果提供了 Firebase Token，则验证 Firebase 用户
    if (firebaseToken) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
        firebaseUid = decodedToken.uid;
        console.log("firebaseUid:", firebaseUid);
        // 更新 Firebase 用户的 displayName
        await admin.auth().updateUser(firebaseUid, {
          displayName: username, // 将用户名存到 displayName 字段
        });

      } catch (error) {
        console.error("Error verifying Firebase token:", error);
        return res.status(401).json({ error: 'Invalid Firebase Token' });
      }
    } else {
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(password, saltRounds);
    }

    // 创建用户
    // 创建用户
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, full_name, user_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [
        username,
        email,
        firebaseToken ? null : passwordHash,  // 如果有 Firebase Token，就传入 null，否则使用 passwordHash
        fullName,
        firebaseUid
      ]
    );

    // 生成 JWT
    const token = jwt.sign({ userId: firebaseUid, username, email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ user: { userId: firebaseUid, username, email, fullName }, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password, firebaseToken } = req.body;
    const db = req.db;

    let user;

    if (firebaseToken) {
      // Firebase 登录
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      const [users] = await db.query('SELECT * FROM users WHERE firebase_uid = ?', [decodedToken.uid]);

      if (users.length === 0) {
        return res.status(401).json({ error: 'No account linked to Firebase' });
      }
      user = users[0];
    } else {
      // 传统登录
      const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0 || !(await bcrypt.compare(password, users[0].password_hash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      user = users[0];
    }

    // 生成 JWT
    const token = jwt.sign({ userId: user.user_id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ user: { userId: user.user_id, username: user.username, email: user.email, fullName: user.full_name }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 获取当前用户
// 获取当前用户信息
router.get('/me', authenticate, async (req, res) => {
  console.log("GET /api/auth/me 被调用了");
  try {
    const db = req.db;

    console.log('Authenticated User:', req.user); // 调试用

    const [users] = await db.query(
      'SELECT user_id, username, email, full_name, created_at FROM users WHERE user_id = ?',
      [req.user.uid]  // Firebase Token 里的 uid
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
