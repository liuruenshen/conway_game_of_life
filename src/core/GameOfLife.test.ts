import { GameOfLife } from './GameOfLife';

describe('Test GameOfLife class', () => {
  it('should calculate the expected envolution result', () => {
    expect.assertions(1);

    const gameOfLife = new GameOfLife([
      {
        position: { x: 0, y: 0 },
        isLiving: true,
        appearance: {
          hue: 20,
          saturation: 50,
          light: 50,
        },
        neighbors: [],
      },
      {
        position: { x: 2, y: 0 },
        isLiving: true,
        appearance: {
          hue: 20,
          saturation: 50,
          light: 50,
        },
        neighbors: [],
      },
      {
        position: { x: 1, y: 1 },
        isLiving: true,
        appearance: {
          hue: 110,
          saturation: 100,
          light: 80,
        },
        neighbors: [],
      },
      {
        position: { x: 0, y: 2 },
        isLiving: true,
        appearance: {
          hue: 190,
          saturation: 40,
          light: 80,
        },
        neighbors: [],
      },
      {
        position: { x: 2, y: 2 },
        isLiving: true,
        appearance: {
          hue: 190,
          saturation: 40,
          light: 80,
        },
        neighbors: [],
      },
    ]);

    gameOfLife.runEnvolution();

    const currentLivingCells = gameOfLife.currentLivingCells;
    expect(currentLivingCells).toMatchObject([
      {
        position: { x: 0, y: 1 },
        isLiving: true,
        appearance: { hue: 106, saturation: 63, light: 70 },
        neighbors: [],
      },
      {
        position: { x: 1, y: 0 },
        isLiving: true,
        appearance: { hue: 50, saturation: 66, light: 60 },
        neighbors: [],
      },
      {
        position: { x: 2, y: 1 },
        isLiving: true,
        appearance: { hue: 106, saturation: 63, light: 70 },
        neighbors: [],
      },
      {
        position: { x: 1, y: 2 },
        isLiving: true,
        appearance: { hue: 163, saturation: 60, light: 80 },
        neighbors: [],
      },
    ]);
  });

  it('should expand the territory', () => {
    expect.assertions(2);

    const gameOfLife = new GameOfLife([
      {
        appearance: { hue: 100, saturation: 50, light: 50 },
        isLiving: true,
        neighbors: [],
        position: { x: 99, y: 97 },
      },
      {
        appearance: { hue: 100, saturation: 50, light: 50 },
        isLiving: true,
        neighbors: [],
        position: { x: 99, y: 98 },
      },
      {
        appearance: { hue: 100, saturation: 50, light: 50 },
        isLiving: true,
        neighbors: [],
        position: { x: 99, y: 99 },
      },
      {
        appearance: { hue: 100, saturation: 50, light: 50 },
        isLiving: true,
        neighbors: [],
        position: { x: 98, y: 99 },
      },
      {
        appearance: { hue: 100, saturation: 50, light: 50 },
        isLiving: true,
        neighbors: [],
        position: { x: 97, y: 99 },
      },
    ]);

    gameOfLife.runEnvolution();

    const currentLivingCells = gameOfLife.currentLivingCells;
    expect(currentLivingCells).toMatchObject([
      {
        appearance: { hue: 100, saturation: 50, light: 50 },
        position: { x: 99, y: 98 },
        isLiving: true,
        neighbors: [],
      },
      {
        appearance: { hue: 100, saturation: 50, light: 50 },
        position: { x: 100, y: 98 },
        isLiving: true,
        neighbors: [],
      },
      {
        appearance: { hue: 100, saturation: 50, light: 50 },
        position: { x: 99, y: 99 },
        isLiving: true,
        neighbors: [],
      },
      {
        appearance: { hue: 100, saturation: 50, light: 50 },
        position: { x: 98, y: 99 },
        isLiving: true,
        neighbors: [],
      },
      {
        appearance: { hue: 100, saturation: 50, light: 50 },
        position: { x: 98, y: 100 },
        isLiving: true,
        neighbors: [],
      },
    ]);

    expect(gameOfLife.bottomRightBoundary).toMatchObject({ x: 100, y: 100 });
  });
});
