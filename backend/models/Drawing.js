const mongoose = require('mongoose');

const strokeSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  color: String,
  size: Number,
});

const drawingSchema = new mongoose.Schema({
  roomId: String,
  strokes: [strokeSchema],
});

module.exports = mongoose.model('Drawing', drawingSchema);
