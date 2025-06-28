import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Toolbar from './Toolbar';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:5000');

function Room() {
  const { roomId } = useParams();
  const roomLink = `${window.location.origin}/room/${roomId}`;
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(5);
  const [mode, setMode] = useState('draw');
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit('join-room', roomId);

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    contextRef.current = ctx;

    socket.on('drawing', drawStroke);
    socket.on('load-drawing', (strokes) => {
      strokes.forEach(drawStroke);
    });
    socket.on('clear-canvas', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off('drawing');
      socket.off('load-drawing');
    };
  }, [roomId]);

  const drawStroke = ({ x, y, color, size }) => {
    const ctx = contextRef.current;
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const stroke = {
      x: offsetX,
      y: offsetY,
      color: mode === 'erase' ? '#ffffff' : color,
      size: parseInt(size),
    };
    drawStroke(stroke);
    socket.emit('drawing', { roomId, stroke });
  };

  const endDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const handleClear = () => {
    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    socket.emit('clear-canvas', roomId);
  };

  const handleExport = () => {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL(); // Convert canvas to base64 PNG
    link.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <>
      <Toolbar
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
        mode={mode}
        setMode={setMode}
        onClear={handleClear}
      />
      <canvas
        id='canvas'
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
      />

      <button onClick={handleExport}>Export as PNG</button>

      <button
        onClick={() => {
          navigator.clipboard.writeText(roomLink);
          alert('Room link copied to clipboard!');
        }}
      >
        Copy Invite Link
      </button>

      <div style={{ textAlign: 'right', padding: '10px' }}>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </>
  );
}

export default Room;
