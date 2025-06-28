// Toolbar.js
import React from 'react';

function Toolbar({ color, setColor, size, setSize, mode, setMode, onClear }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        backgroundColor: '#fff',
        padding: '10px',
        borderRadius: '8px',
        zIndex: 2,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
      }}
    >
      <input
        type='color'
        value={color}
        onChange={(e) => setColor(e.target.value)}
        title='Pick Color'
      />

      <select
        value={size}
        onChange={(e) => setSize(e.target.value)}
        title='Brush Size'
      >
        <option value='2'>2</option>
        <option value='5'>5</option>
        <option value='10'>10</option>
        <option value='20'>20</option>
      </select>

      <button
        onClick={() => setMode('draw')}
        style={{
          backgroundColor: mode === 'draw' ? '#ddd' : '',
        }}
      >
        🖊 Pen
      </button>

      <button
        onClick={() => setMode('erase')}
        style={{
          backgroundColor: mode === 'erase' ? '#ddd' : '',
        }}
      >
        🧽 Eraser
      </button>

      <button onClick={onClear}>🗑 Clear</button>
    </div>
  );
}

export default Toolbar;
