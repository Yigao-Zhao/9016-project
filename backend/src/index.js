require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mysql = require('mysql2/promise');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Sd221456!',
  database: 'socialmedia',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('环境变量：', {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME
});

// 中间件
app.use(helmet()); // 安全头
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 使数据库连接在路由中可用
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/ready', async (req, res) => {
  try {
    // 检查数据库连接
    const [result] = await pool.query('SELECT NOW() as now');
    res.status(200).json({ status: 'ready', time: result[0].now });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ status: 'not ready', error: 'Database connection failed' });
  }
});

// 应用路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;