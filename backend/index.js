require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');

const Drawing = require('./models/Drawing');

const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const server = http.createServer(app);
const roomDrawings = {}; // { roomId: [ { x, y, prevX, prevY, color, size } ] }

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// 🌐 Middleware
app.use(cors());
app.use(express.json());

// 🔌 API Routes
app.use('/auth', authRoutes);

// Serve frontend build
app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

// 🌍 MongoDB Connection
mongoose
  .connect(
    'mongodb+srv://shubham4835:Destro9708@cluster0.quxo0uz.mongodb.net/',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// 🎨 Real-time Whiteboard Logic
io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);

    // Send the existing strokes to the new user
    if (roomDrawings[roomId]) {
      socket.emit('load-drawing', roomDrawings[roomId]);
    } else {
      roomDrawings[roomId] = [];
    }
  });

  socket.on('drawing', (data) => {
    if (!data || !data.roomId) return;
    const { roomId, ...stroke } = data;

    // Save stroke in memory
    roomDrawings[roomId].push(stroke);

    // Broadcast to others
    socket.to(roomId).emit('drawing', stroke);
  });

  socket.on('clear-canvas', (roomId) => {
    roomDrawings[roomId] = []; // Clear stored strokes
    socket.to(roomId).emit('clear-canvas');
  });
});
// 🚀 Start Server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
