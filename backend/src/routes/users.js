const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取用户列表
router.get('/', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const db = req.db;
    
    const [users] = await db.query(
      'SELECT user_id, username, full_name, bio, profile_image_url FROM users LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 获取特定用户
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const db = req.db;
    
    const [users] = await db.query(
      'SELECT user_id, username, full_name, bio, profile_image_url, created_at FROM users WHERE user_id = ?',
      [userId]
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

// 更新用户信息
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.params.id;
    const { fullName, bio, profileImageUrl } = req.body;
    
    const db = req.db;
    
    // 确保用户只能更新自己的个人资料
    if (parseInt(userId) !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const [result] = await db.query(
      'UPDATE users SET full_name = ?, bio = ?, profile_image_url = ? WHERE user_id = ?',
      [fullName, bio, profileImageUrl, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const [updatedUser] = await db.query(
      'SELECT user_id, username, full_name, bio, profile_image_url, updated_at FROM users WHERE user_id = ?',
      [userId]
    );
    
    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;