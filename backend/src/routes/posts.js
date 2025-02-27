const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取帖子列表
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0, userId } = req.query;
    const db = req.db;
    
    let query = `
      SELECT p.post_id, p.content, p.image_url, p.created_at, 
             u.user_id, u.username, u.profile_image_url,
             COUNT(DISTINCT l.like_id) as like_count,
             COUNT(DISTINCT c.comment_id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN likes l ON p.post_id = l.post_id
      LEFT JOIN comments c ON p.post_id = c.post_id
    `;
    
    const queryParams = [];
    
    if (userId) {
      query += ' WHERE p.user_id = ?';
      queryParams.push(userId);
    }
    
    query += `
      GROUP BY p.post_id, u.user_id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [posts] = await db.query(query, queryParams);
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 获取特定帖子
router.get('/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const db = req.db;
    
    const [posts] = await db.query(
      `SELECT p.post_id, p.content, p.image_url, p.created_at, 
              u.user_id, u.username, u.profile_image_url,
              COUNT(DISTINCT l.like_id) as like_count,
              COUNT(DISTINCT c.comment_id) as comment_count
       FROM posts p
       JOIN users u ON p.user_id = u.user_id
       LEFT JOIN likes l ON p.post_id = l.post_id
       LEFT JOIN comments c ON p.post_id = c.post_id
       WHERE p.post_id = ?
       GROUP BY p.post_id, u.user_id`,
      [postId]
    );
    
    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(posts[0]);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 创建帖子
router.post('/', authenticate, async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const db = req.db;
    
    // 创建帖子
    const [result] = await db.query(
      'INSERT INTO posts (user_id, content, image_url, created_at) VALUES (?, ?, ?, NOW())',
      [req.user.userId, content, imageUrl]
    );
    
    // 获取用户信息
    const [userInfo] = await db.query(
      'SELECT username, profile_image_url FROM users WHERE user_id = ?',
      [req.user.userId]
    );
    
    // 获取创建的帖子
    const [newPost] = await db.query(
      'SELECT post_id, content, image_url, created_at FROM posts WHERE post_id = ?',
      [result.insertId]
    );
    
    const post = {
      ...newPost[0],
      user_id: req.user.userId,
      username: userInfo[0].username,
      profile_image_url: userInfo[0].profile_image_url,
      like_count: 0,
      comment_count: 0
    };
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 删除帖子
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const db = req.db;
    
    // 检查帖子是否存在
    const [postCheck] = await db.query('SELECT user_id FROM posts WHERE post_id = ?', [postId]);
    
    if (postCheck.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // 检查是否是帖子拥有者
    if (postCheck[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // 删除帖子
    await db.query('DELETE FROM posts WHERE post_id = ?', [postId]);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 点赞帖子
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const db = req.db;
    
    // 检查帖子是否存在
    const [postCheck] = await db.query('SELECT post_id FROM posts WHERE post_id = ?', [postId]);
    
    if (postCheck.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // 检查用户是否已经点赞
    const [likeCheck] = await db.query(
      'SELECT like_id FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, req.user.userId]
    );
    
    if (likeCheck.length > 0) {
      return res.status(400).json({ error: 'Post already liked' });
    }
    
    // 创建点赞
    await db.query(
      'INSERT INTO likes (post_id, user_id, created_at) VALUES (?, ?, NOW())',
      [postId, req.user.userId]
    );
    
    // 获取点赞数量
    const [likesCountResult] = await db.query(
      'SELECT COUNT(*) as like_count FROM likes WHERE post_id = ?',
      [postId]
    );
    
    res.json({ 
      message: 'Post liked successfully',
      like_count: parseInt(likesCountResult[0].like_count)
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 取消点赞
router.delete('/:id/like', authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const db = req.db;
    
    // 检查点赞是否存在
    const [likeCheck] = await db.query(
      'SELECT like_id FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, req.user.userId]
    );
    
    if (likeCheck.length === 0) {
      return res.status(400).json({ error: 'Post not liked' });
    }
    
    // 删除点赞
    await db.query(
      'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, req.user.userId]
    );
    
    // 获取点赞数量
    const [likesCountResult] = await db.query(
      'SELECT COUNT(*) as like_count FROM likes WHERE post_id = ?',
      [postId]
    );
    
    res.json({ 
      message: 'Post unliked successfully',
      like_count: parseInt(likesCountResult[0].like_count)
    });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;