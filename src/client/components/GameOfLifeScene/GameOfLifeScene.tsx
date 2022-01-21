import React, { useState, useEffect, useRef } from 'react';
import { getClientEnv } from '../../modules/socketEvents';
import * as Type from '../../../interface';

const CELL_WIDTH = 12;
const CELL_HEIGHT = 12;
const GRID_BUFFER = 50;

interface Dimension {
  width: number;
  height: number;
}

export function GameOfLifeScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dimension, setDimension] = useState<Dimension>({
    width: 0,
    height: 0,
  });

  function drawGrid(payload: Type.SetupClientPayload) {
    if (!canvasRef.current) {
      return;
    }

    const { x, y } = payload.dimension.bottomRight;
    const columns = x + GRID_BUFFER;
    const rows = y + GRID_BUFFER;
    const canvas = canvasRef.current;

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const dimension = {
      width: columns * (CELL_WIDTH + 1),
      height: rows * (CELL_HEIGHT + 1),
    };

    setDimension(dimension);

    context.fillStyle = 'hsl(0, 10%, 15%)';
    context.fillRect(0, 0, dimension.width, dimension.height);

    context.lineWidth = 1;
    for (let i = 0; i < columns; ++i) {
      context.beginPath();
      context.moveTo(i * (CELL_WIDTH + 1), 0);
      context.lineTo(i * (CELL_WIDTH + 1), dimension.height);
      context.stroke();
    }

    for (let i = 0; i < rows; ++i) {
      context.beginPath();
      context.moveTo(0, i * (CELL_HEIGHT + 1));
      context.lineTo(dimension.width, i * (CELL_HEIGHT + 1));
      context.stroke();
    }
  }

  useEffect(() => {
    const canvasElement = document.getElementById(
      'canvas'
    ) as HTMLCanvasElement;
    canvasRef.current = canvasElement;

    getClientEnv(drawGrid);

    return () => {
      canvasRef.current = null;
    };
  }, []);

  return (
    <canvas
      id="canvas"
      width={dimension.width}
      height={dimension.height}
    ></canvas>
  );
}
