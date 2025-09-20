import express from 'express';
import jwt from 'jsonwebtoken';
import dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

// Custom auth middleware for SSE (token in query params)
const sseAuth = (req, res, next) => {
  try {
    const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token required for SSE connection' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('SSE Auth error:', error);
    return res.status(401).json({ message: 'Invalid token for SSE connection' });
  }
};

// Server-Sent Events endpoint for real-time dashboard updates
router.get('/events', sseAuth, (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  // Send initial data
  const sendUpdate = async () => {
    try {
      const stats = await dashboardController.getDashboardStatsData(req);
      res.write(`data: ${JSON.stringify({
        type: 'dashboard_update',
        stats: stats,
        timestamp: new Date().toISOString()
      })}\n\n`);
    } catch (error) {
      console.error('Error sending dashboard update:', error);
    }
  };

  // Send initial data
  sendUpdate();

  // Send updates every 30 seconds
  const interval = setInterval(sendUpdate, 30000);

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });

  // Handle errors
  req.on('error', (error) => {
    console.error('SSE connection error:', error);
    clearInterval(interval);
    res.end();
  });
});

export default router;
