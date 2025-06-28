require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');

const Drawing = require('./models/Drawing');

const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const server = http.createServer(app);
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
  console.log('📡 User connected:', socket.id);

  socket.on('join-room', async (roomId) => {
    socket.join(roomId);
    console.log(`🟢 ${socket.id} joined room: ${roomId}`);

    const existing = await Drawing.findOne({ roomId });
    if (existing) {
      socket.emit('load-drawing', existing.strokes);
    }
  });

  socket.on('drawing', async ({ roomId, stroke }) => {
    socket.to(roomId).emit('drawing', stroke);
    await Drawing.findOneAndUpdate(
      { roomId },
      { $push: { strokes: stroke } },
      { upsert: true }
    );
  });

  socket.on('clear-canvas', async (roomId) => {
    await Drawing.findOneAndUpdate({ roomId }, { strokes: [] });
    io.to(roomId).emit('clear-canvas');
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// 🚀 Start Server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
