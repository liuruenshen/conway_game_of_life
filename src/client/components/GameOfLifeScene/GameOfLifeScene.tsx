import React, { useState, useEffect, useRef, MouseEventHandler } from 'react';
import {
  getClientEnv,
  addLivingCells,
  removeLivingCells,
  livingCellsUpdated,
} from '../../modules/socketEvents';
import * as Type from '../../../interface';
import { GameOfLife } from '../../../core/GameOfLife';

const CELL_WIDTH = 12;
const CELL_HEIGHT = 12;
const GRID_BUFFER = 50;
const GRID_BACKGROUND = 'hsl(0, 10%, 15%)';

interface Dimension {
  width: number;
  height: number;
}

interface Canvas {
  element: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
}

function hslToCssHsl(hsl: Type.Hsl) {
  return `hsl(${hsl.hue}, ${hsl.saturation}%, ${hsl.light}%)`;
}

export function GameOfLifeScene() {
  const canvasRef = useRef<Canvas>({ element: null, context: null });
  const livingCellsUpdatedInfo = useRef<Type.LivingCellsUpdatedPayload | null>(
    null
  );
  const removingLivingCells = useRef<Type.Position[]>([]);
  const livingCellsPositionMap = useRef<Record<string, boolean>>({});

  const [dimension, setDimension] = useState<Dimension>({
    width: 0,
    height: 0,
  });

  const onClick: MouseEventHandler<HTMLCanvasElement> = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;
    const position: Type.Position = {
      x: Math.floor(offsetX / (CELL_WIDTH + 1)),
      y: Math.floor(offsetY / (CELL_HEIGHT + 1)),
    };

    const positionKey = GameOfLife.getPositionKey(position);
    if (!livingCellsPositionMap.current[positionKey]) {
      addLivingCells([position]);
    } else {
      removeLivingCells([position]);
      removingLivingCells.current.push(position);
    }
  };

  function drawGrid(payload: Type.SetupClientPayload) {
    if (!canvasRef.current.context) {
      return;
    }

    const { x, y } = payload.dimension.bottomRight;
    const columns = x + GRID_BUFFER;
    const rows = y + GRID_BUFFER;

    const { context } = canvasRef.current;
    if (!context) {
      return;
    }

    const dimension = {
      width: columns * (CELL_WIDTH + 1),
      height: rows * (CELL_HEIGHT + 1),
    };

    setDimension(dimension);

    context.fillStyle = GRID_BACKGROUND;
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

  function drawCells(payload: Type.LivingCellsUpdatedPayload) {
    livingCellsUpdatedInfo.current = payload;
    livingCellsPositionMap.current = payload.cells.reduce(
      (result, item) => ({
        ...result,
        [GameOfLife.getPositionKey(item.position)]: true,
      }),
      {}
    );

    const { context } = canvasRef.current;
    if (!context) {
      return;
    }

    const { cells } = payload;
    cells.forEach((cell) => {
      const cellOffsetX = cell.position.x * (CELL_WIDTH + 1);
      const cellOffsetY = cell.position.y * (CELL_HEIGHT + 1);
      context.fillStyle = hslToCssHsl(cell.appearance);
      context.fillRect(cellOffsetX, cellOffsetY, CELL_WIDTH, CELL_HEIGHT);
    });

    context.fillStyle = GRID_BACKGROUND;
    removingLivingCells.current.forEach((removingCell) => {
      if (
        !livingCellsPositionMap.current[GameOfLife.getPositionKey(removingCell)]
      ) {
        const cellOffsetX = removingCell.x * (CELL_WIDTH + 1);
        const cellOffsetY = removingCell.y * (CELL_HEIGHT + 1);
        context.fillRect(cellOffsetX, cellOffsetY, CELL_WIDTH, CELL_HEIGHT);
      }
    });
  }

  useEffect(() => {
    const canvasElement = document.getElementById(
      'canvas'
    ) as HTMLCanvasElement;
    canvasRef.current.element = canvasElement;
    canvasRef.current.context = canvasElement.getContext('2d');

    getClientEnv(drawGrid);
    livingCellsUpdated(drawCells);

    return () => {
      canvasRef.current = { element: null, context: null };
    };
  }, []);

  return (
    <canvas
      id="canvas"
      width={dimension.width}
      height={dimension.height}
      onClick={onClick}
    ></canvas>
  );
}