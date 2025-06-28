require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth'); // ✅ make sure this file exists
const Drawing = require('./models/Drawing'); // Optional if you're persisting to DB

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';
const MONGO_URI = process.env.MONGO_URI || 'your_fallback_mongo_uri';
const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// In-memory drawing cache per room
const roomDrawings = {}; // { roomId: [ { x, y, prevX, prevY, color, size } ] }

// 🔧 Middleware
app.use(cors());
app.use(express.json());

// 🔐 Auth Routes
app.use('/auth', authRoutes);

// 🧾 Serve React frontend build (after build)
app.use(express.static(path.join(__dirname, 'frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

// 🌍 MongoDB connection
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// 🧠 Real-time socket logic
io.on('connection', (socket) => {
  console.log('🟢 New client connected');

  socket.on('join-room', (roomId) => {
    console.log(`➡️ Client joined room: ${roomId}`);
    socket.join(roomId);

    if (!roomDrawings[roomId]) {
      roomDrawings[roomId] = [];
    }

    // Send existing strokes to new user
    socket.emit('load-drawing', roomDrawings[roomId]);
  });

  socket.on('drawing', ({ roomId, ...stroke }) => {
    if (!roomId) return;

    // Save stroke in memory
    roomDrawings[roomId].push(stroke);

    // Broadcast to other users in the same room
    socket.to(roomId).emit('drawing', stroke);
  });

  socket.on('clear-canvas', (roomId) => {
    if (!roomId) return;
    roomDrawings[roomId] = [];
    socket.to(roomId).emit('clear-canvas');
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected');
  });
});

// 🚀 Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
