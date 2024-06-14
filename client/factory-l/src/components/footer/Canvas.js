import React from 'react';
import useCanvas from './useCanvas';

const Canvas = ({ draw, handleClick }) => {
  const canvasRef = useCanvas(draw, handleClick); // Pass handleClick to useCanvas

  return <canvas ref={canvasRef} width={window.innerWidth} height={500} />;
};

export default Canvas;