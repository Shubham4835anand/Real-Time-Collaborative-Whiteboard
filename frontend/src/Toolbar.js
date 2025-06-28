import React from 'react';

const Toolbar = ({
  color,
  setColor,
  size,
  setSize,
  mode,
  setMode,
  onClear,
}) => {
  return (
    <div className='toolbar'>
      <label>Color:</label>
      <input
        type='color'
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />

      <label>Size:</label>
      <input
        type='range'
        min='1'
        max='20'
        value={size}
        onChange={(e) => setSize(e.target.value)}
      />

      <button onClick={() => setMode(mode === 'draw' ? 'erase' : 'draw')}>
        {mode === 'draw' ? 'Eraser' : 'Pen'}
      </button>

      <button onClick={onClear}>Clear</button>
    </div>
  );
};

export default Toolbar;
