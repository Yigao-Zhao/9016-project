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
const PORT = process.env.PORT || 3001;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '336753',
  database: process.env.DB_NAME || 'socialmedia',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// **CORS 配置**
app.use(cors({
  origin: '*',  // 允许所有来源访问
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 预检请求处理
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});

// **全局中间件**
app.use(helmet()); // 安全头
app.use(express.json());
app.use(morgan('dev'));

// **数据库连接中间件**
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// **健康检查端点**
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/ready', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT NOW() as now');
    res.status(200).json({ status: 'ready', time: result[0].now });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ status: 'not ready', error: 'Database connection failed' });
  }
});

// **应用路由**
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// **404 处理**
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// **全局错误处理中间件**
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// **启动服务器**
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
