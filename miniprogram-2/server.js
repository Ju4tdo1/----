const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your WeChat Mini Program credentials
const APPID = 'wx6dc70da779672d26';
const SECRET = '081bf294a1dfabb596029ff497419984';
const JWT_SECRET = 'your_jwt_secret';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Exchange code for openid and session_key
    const response = await axios.get(`https://api.weixin.qq.com/sns/jscode2session`, {
      params: {
        appid: APPID,
        secret: SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key } = response.data;

    if (!openid) {
      return res.status(401).json({ error: 'Failed to get openid' });
    }

    // Generate JWT token
    const token = jwt.sign({ openid }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, openid });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Verify token endpoint
app.get('/api/verify-token', verifyToken, (req, res) => {
  res.json({ openid: req.user.openid });
});

// Logout endpoint
app.post('/api/logout', verifyToken, (req, res) => {
  // In a real application, you might want to blacklist the token
  // For this simple example, we'll just return a success message
  res.json({ message: 'Logged out successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 