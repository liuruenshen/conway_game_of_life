import React, { useState, useEffect, useRef, MouseEventHandler } from 'react';
import {
  processClientEnv,
  addLivingCells,
  removeLivingCells,
  livingCellsUpdated,
} from '../../modules/socketEvents';
import * as Type from '../../../interface';
import { GameOfLife } from '../../../core/GameOfLife';

const CELL_WIDTH = 16;
const CELL_HEIGHT = 16;
const GRID_BUFFER = 20;
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
    }
  };

  function drawGrid(payload: Type.SetupClientPayload) {
    const { context } = canvasRef.current;

    if (!context) {
      return;
    }

    const { x, y } = payload.dimension.bottomRight;
    const columns = x + GRID_BUFFER;
    const rows = y + GRID_BUFFER;

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
      context.strokeStyle = 'hsl(0, 0%, 30%)';
      context.moveTo(i * (CELL_WIDTH + 1), 0);
      context.lineTo(i * (CELL_WIDTH + 1), dimension.height);
      context.stroke();

      context.beginPath();
      context.strokeStyle = GRID_BACKGROUND;
      context.moveTo(i * (CELL_WIDTH + 1) - 1, 0);
      context.lineTo(i * (CELL_WIDTH + 1) - 1, dimension.height);
      context.moveTo(i * (CELL_WIDTH + 1) + 1, 0);
      context.lineTo(i * (CELL_WIDTH + 1) + 1, dimension.height);
      context.stroke();
    }

    for (let i = 0; i < rows; ++i) {
      context.beginPath();
      context.strokeStyle = 'hsl(0, 0%, 30%)';
      context.moveTo(0, i * (CELL_HEIGHT + 1));
      context.lineTo(dimension.width, i * (CELL_HEIGHT + 1));
      context.stroke();

      context.beginPath();
      context.strokeStyle = GRID_BACKGROUND;
      context.moveTo(0, i * (CELL_HEIGHT + 1) - 1);
      context.lineTo(dimension.width, i * (CELL_HEIGHT + 1) - 1);
      context.moveTo(0, i * (CELL_HEIGHT + 1) + 1);
      context.lineTo(dimension.width, i * (CELL_HEIGHT + 1) + 1);
      context.stroke();
    }
  }

  function drawCells(payload: Type.LivingCellsUpdatedPayload) {
    const { context } = canvasRef.current;

    if (!context) {
      return;
    }

    const stallLivingCells = livingCellsUpdatedInfo.current || { cells: [] };
    livingCellsUpdatedInfo.current = payload;
    livingCellsPositionMap.current = payload.cells.reduce(
      (result, item) => ({
        ...result,
        [GameOfLife.getPositionKey(item.position)]: true,
      }),
      {}
    );

    const removedCells = stallLivingCells.cells.filter(
      (cell) =>
        !livingCellsPositionMap.current[
          GameOfLife.getPositionKey(cell.position)
        ]
    );

    const { cells } = payload;
    cells.forEach((cell) => {
      const cellOffsetX = cell.position.x * (CELL_WIDTH + 1) + 1;
      const cellOffsetY = cell.position.y * (CELL_HEIGHT + 1) + 1;
      context.fillStyle = hslToCssHsl(cell.appearance);
      context.fillRect(
        cellOffsetX,
        cellOffsetY,
        CELL_WIDTH - 1,
        CELL_HEIGHT - 1
      );
    });

    context.fillStyle = GRID_BACKGROUND;
    removedCells.map((removingCell) => {
      if (
        !livingCellsPositionMap.current[
          GameOfLife.getPositionKey(removingCell.position)
        ]
      ) {
        const cellOffsetX = removingCell.position.x * (CELL_WIDTH + 1) + 1;
        const cellOffsetY = removingCell.position.y * (CELL_HEIGHT + 1) + 1;
        context.fillRect(
          cellOffsetX,
          cellOffsetY,
          CELL_WIDTH - 1,
          CELL_HEIGHT - 1
        );
      }
    });
  }

  useEffect(() => {
    const canvasElement = document.getElementById(
      'canvas'
    ) as HTMLCanvasElement;
    canvasRef.current.element = canvasElement;
    canvasRef.current.context = canvasElement.getContext('2d', {
      alpha: false,
    });

    processClientEnv(drawGrid);
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
