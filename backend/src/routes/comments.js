const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取帖子的评论
router.get('/post/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const db = req.db;
    
    const [comments] = await db.query(
      `SELECT c.comment_id, c.content, c.created_at, 
              u.user_id, u.username, u.profile_image_url,
              COUNT(cl.like_id) as like_count
       FROM comments c
       JOIN users u ON c.user_id = u.user_id
       LEFT JOIN comment_likes cl ON c.comment_id = cl.comment_id
       WHERE c.post_id = ?
       GROUP BY c.comment_id, u.user_id
       ORDER BY c.created_at DESC`,
      [postId]
    );
    
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 添加评论
router.post('/post/:postId', authenticate, async (req, res) => {
  try {
    const postId = req.params.postId;
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const db = req.db;
    
    // 检查帖子是否存在
    const [postCheck] = await db.query('SELECT post_id FROM posts WHERE post_id = ?', [postId]);
    
    if (postCheck.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // 创建评论
    const [result] = await db.query(
      'INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())',
      [postId, req.user.userId, content]
    );
    
    // 获取用户信息
    const [userInfo] = await db.query(
      'SELECT username, profile_image_url FROM users WHERE user_id = ?',
      [req.user.userId]
    );
    
    // 获取创建的评论
    const [newComment] = await db.query(
      'SELECT comment_id, content, created_at FROM comments WHERE comment_id = ?',
      [result.insertId]
    );
    
    const comment = {
      ...newComment[0],
      user_id: req.user.userId,
      username: userInfo[0].username,
      profile_image_url: userInfo[0].profile_image_url,
      like_count: 0
    };
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 删除评论
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const commentId = req.params.id;
    const db = req.db;
    
    // 检查评论是否存在
    const [commentCheck] = await db.query('SELECT user_id FROM comments WHERE comment_id = ?', [commentId]);
    
    if (commentCheck.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // 检查是否是评论拥有者
    if (commentCheck[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // 删除评论
    await db.query('DELETE FROM comments WHERE comment_id = ?', [commentId]);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 点赞评论
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const commentId = req.params.id;
    const db = req.db;
    
    // 检查评论是否存在
    const [commentCheck] = await db.query('SELECT comment_id FROM comments WHERE comment_id = ?', [commentId]);
    
    if (commentCheck.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // 检查用户是否已经点赞
    const [likeCheck] = await db.query(
      'SELECT like_id FROM comment_likes WHERE comment_id = ? AND user_id = ?',
      [commentId, req.user.userId]
    );
    
    if (likeCheck.length > 0) {
      return res.status(400).json({ error: 'Comment already liked' });
    }
    
    // 创建点赞
    await db.query(
      'INSERT INTO comment_likes (comment_id, user_id, created_at) VALUES (?, ?, NOW())',
      [commentId, req.user.userId]
    );
    
    // 获取点赞数量
    const [likesCountResult] = await db.query(
      'SELECT COUNT(*) as like_count FROM comment_likes WHERE comment_id = ?',
      [commentId]
    );
    
    res.json({ 
      message: 'Comment liked successfully',
      like_count: parseInt(likesCountResult[0].like_count)
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 取消点赞评论
router.delete('/:id/like', authenticate, async (req, res) => {
  try {
    const commentId = req.params.id;
    const db = req.db;
    
    // 检查点赞是否存在
    const [likeCheck] = await db.query(
      'SELECT like_id FROM comment_likes WHERE comment_id = ? AND user_id = ?',
      [commentId, req.user.userId]
    );
    
    if (likeCheck.length === 0) {
      return res.status(400).json({ error: 'Comment not liked' });
    }
    
    // 删除点赞
    await db.query(
      'DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?',
      [commentId, req.user.userId]
    );
    
    // 获取点赞数量
    const [likesCountResult] = await db.query(
      'SELECT COUNT(*) as like_count FROM comment_likes WHERE comment_id = ?',
      [commentId]
    );
    
    res.json({ 
      message: 'Comment unliked successfully',
      like_count: parseInt(likesCountResult[0].like_count)
    });
  } catch (error) {
    console.error('Error unliking comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;