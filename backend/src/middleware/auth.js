const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

// 初始化 Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../config/firebaseServiceAccountKey.json'))
  });
}

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    // 先尝试验证 Firebase Token
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log('Decoded Firebase Token:', decodedToken); // 打印 token 内容
      req.user = decodedToken;

      // 验证 token 中的 userId 是否与数据库中的 user_id 匹配
      if (!req.user.uid) {
        return res.status(401).json({ error: 'Unauthorized: Invalid user ID from Firebase' });
      }

      console.log('User ID from Firebase:', req.user.uid); // 调试用，输出 userId

      // 在这里检查数据库中的 `user_id` 和 Firebase 的 `uid` 是否匹配
      const db = req.db;
      const [users] = await db.query(
        'SELECT user_id FROM users WHERE user_id = ?',
        [req.user.uid]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Unauthorized: User ID not found in database' });
      }

      return next();  // Firebase token 验证成功并且用户存在于数据库中，进入下一步
    } catch (firebaseError) {
      console.error('Firebase token validation error:', firebaseError);
      // 如果 Firebase 验证失败，则进行自定义 JWT 验证
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        console.log('Decoded JWT Token:', decodedToken); // 打印 token 内容
        req.user = decodedToken;

        // 验证 token 中的 userId 是否正确
        if (!req.user.userId) {
          return res.status(401).json({ error: 'Unauthorized: Invalid user ID' });
        }

        console.log('User ID from JWT:', req.user.userId); // 调试用，输出 userId
        return next();  // 自定义 JWT 验证成功，进入下一步
      } catch (jwtError) {
        console.error('JWT validation error:', jwtError);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });  // 如果都验证失败，返回 401 错误
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized: Authentication error' });
  }
};

module.exports = {
  authenticate
};
