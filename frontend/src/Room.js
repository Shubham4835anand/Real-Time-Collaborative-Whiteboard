import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Toolbar from './Toolbar';

const socket = io(
  'https://real-time-collaborative-whiteboard-4lwp.onrender.com'
);

function Room() {
  const { roomId } = useParams();
  const roomLink = `${window.location.origin}/room/${roomId}`;
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(5);
  const [mode, setMode] = useState('draw');
  const [prevPos, setPrevPos] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit('join-room', roomId);

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    contextRef.current = ctx;

    socket.on('load-drawing', (strokes) => {
      strokes.forEach((stroke) => {
        drawStroke(stroke);
      });
    });

    socket.on('drawing', (stroke) => {
      if (
        stroke &&
        stroke.prevX != null &&
        stroke.prevY != null &&
        stroke.x != null &&
        stroke.y != null
      ) {
        drawStroke(stroke); // ✅ Simply draw the stroke received from server
      }
    });

    socket.on('clear-canvas', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off('drawing');
      socket.off('clear-canvas');
    };
  }, [roomId]);

  const drawStroke = (stroke) => {
    if (!stroke || stroke.prevX == null || stroke.prevY == null) return;

    const { prevX, prevY, x, y, color, size } = stroke;
    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();
  };

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setPrevPos({ x: offsetX, y: offsetY });
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !prevPos) return;

    // Prevent drawing on UI controls
    if (e.target.id !== 'canvas') return;

    const { offsetX, offsetY } = e.nativeEvent;
    const newPos = { x: offsetX, y: offsetY };

    const stroke = {
      prevX: prevPos.x,
      prevY: prevPos.y,
      x: newPos.x,
      y: newPos.y,
      color: mode === 'erase' ? '#ffffff' : color,
      size: parseInt(size),
    };

    drawStroke(stroke);
    socket.emit('drawing', { roomId, ...stroke }); // ✅ Send to server

    setPrevPos(newPos);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    setPrevPos(null);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear-canvas', roomId);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setPrevPos({ x, y });
    setIsDrawing(true);
  };

  const handleTouchMove = (e) => {
    if (!isDrawing || !prevPos) return;

    e.preventDefault(); // prevent scrolling while drawing

    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const stroke = {
      prevX: prevPos.x,
      prevY: prevPos.y,
      x,
      y,
      color: mode === 'erase' ? '#ffffff' : color,
      size: parseInt(size),
    };

    drawStroke(stroke);
    socket.emit('drawing', { roomId, ...stroke });

    setPrevPos({ x, y });
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={endDrawing}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
          touchAction: 'none', // ✅ canvas should be underneath UI
        }}
      />

      <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 2 }}>
        <button onClick={handleExport}>Export as PNG</button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(roomLink);
            alert('Room link copied to clipboard!');
          }}
        >
          Copy Invite Link
        </button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </>
  );
}

export default Room;
