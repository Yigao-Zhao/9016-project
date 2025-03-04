-- 创建用户表
CREATE TABLE users (
  user_id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(100),
  bio TEXT,
  profile_image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建帖子表
CREATE TABLE posts (
  post_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 创建评论表
CREATE TABLE comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 创建点赞表
CREATE TABLE likes (
  like_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  post_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);

-- 创建评论点赞表
CREATE TABLE comment_likes (
  like_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  comment_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, comment_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE
);

-- 创建关注表
CREATE TABLE follows (
  follow_id INT AUTO_INCREMENT PRIMARY KEY,
  follower_id VARCHAR(255) NOT NULL,
  following_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);

-- 添加一些测试数据
INSERT INTO users (user_id, username, email, password_hash, full_name, bio, profile_image_url)
VALUES 
('BrO5WQCn91OjLuM0QUZb29XDPF12', 'testuser', 'test@example.com', '$2b$10$1234567890123456789012', '测试用户', '这是一个测试账号', 'https://via.placeholder.com/150'),
('admin', 'admin', 'admin@example.com', '$2b$10$1234567890123456789012', '管理员', '系统管理员', 'https://via.placeholder.com/150');

INSERT INTO posts (user_id, content, image_url)
VALUES 
('BrO5WQCn91OjLuM0QUZb29XDPF12', '这是第一条帖子!', 'https://via.placeholder.com/800x400'),
('admin', '欢迎来到社交媒体应用!', NULL);

INSERT INTO comments (post_id, user_id, content)
VALUES 
(1, 'admin', '这是一条测试评论!'),
(2, 'BrO5WQCn91OjLuM0QUZb29XDPF12', '谢谢欢迎!');

INSERT INTO likes (post_id, user_id)
VALUES 
(1, 'admin'),
(2, 'BrO5WQCn91OjLuM0QUZb29XDPF12');

INSERT INTO comment_likes (comment_id, user_id)
VALUES 
(1, 'BrO5WQCn91OjLuM0QUZb29XDPF12'),
(2, 'admin');

INSERT INTO follows (follower_id, following_id)
VALUES 
('BrO5WQCn91OjLuM0QUZb29XDPF12', 'admin'),
('admin', 'BrO5WQCn91OjLuM0QUZb29XDPF12');
