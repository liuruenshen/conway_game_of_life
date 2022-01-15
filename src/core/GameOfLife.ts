import * as Type from './GameOfLife.interface';

export class GameOfLife {
  #currentLivingCells: Type.LivingCells = [];
  #mutatedLivingCells: Type.MutatedLivingCells = [];
  #changedCells: Type.ChangedCells = [];
  #dimension: Type.Dimension = {
    upperLeft: { x: 0, y: 0 },
    bottomRight: { x: 99, y: 99 },
  };

  constructor(livingCells: Type.LivingCells) {
    this.#currentLivingCells = livingCells.filter(
      (cell) =>
        cell.position.x >= this.#dimension.upperLeft.x &&
        cell.position.x <= this.#dimension.bottomRight.x &&
        cell.position.y >= this.#dimension.upperLeft.x &&
        cell.position.y <= this.#dimension.bottomRight.x
    );
  }

  private getEnvolvingCells(): Type.EnvolvingCells {
    return this.#currentLivingCells
      .map<Type.EnvolvingCells>((cell) => {
        const { x, y } = cell.position;

        return [
          {
            ...cell,
            neighbors: [],
          },
          {
            appearance: { hue: 0, saturation: 0, light: 0 },
            position: { x, y: y - 1 },
            isLiving: false,
            neighbors: [cell.appearance],
          },
          {
            appearance: { hue: 0, saturation: 0, light: 0 },
            position: { x, y: y + 1 },
            isLiving: false,
            neighbors: [cell.appearance],
          },
          {
            appearance: { hue: 0, saturation: 0, light: 0 },
            position: { x: x - 1, y },
            isLiving: false,
            neighbors: [cell.appearance],
          },
          {
            appearance: { hue: 0, saturation: 0, light: 0 },
            position: { x: x - 1, y: y - 1 },
            isLiving: false,
            neighbors: [cell.appearance],
          },
          {
            appearance: { hue: 0, saturation: 0, light: 0 },
            position: { x: x - 1, y: y + 1 },
            isLiving: false,
            neighbors: [cell.appearance],
          },
          {
            appearance: { hue: 0, saturation: 0, light: 0 },
            position: { x: x + 1, y },
            isLiving: false,
            neighbors: [cell.appearance],
          },
          {
            appearance: { hue: 0, saturation: 0, light: 0 },
            position: { x: x + 1, y: y - 1 },
            isLiving: false,
            neighbors: [cell.appearance],
          },
          {
            appearance: { hue: 0, saturation: 0, light: 0 },
            position: { x: x + 1, y: y + 1 },
            isLiving: false,
            neighbors: [cell.appearance],
          },
        ];
      })
      .flat()
      .filter(
        (cell) =>
          cell.position.x >= this.#dimension.upperLeft.x &&
          cell.position.y >= this.#dimension.upperLeft.y
      );
  }

  private getPositionKey(position: Type.Cell['position']) {
    return `${position.x},${position.y}`;
  }

  private getEnvolvingCellMap(): Type.EnvolvingCellMap {
    const envolvingCellsMap: Type.EnvolvingCellMap = {};
    const envolvingCells = this.getEnvolvingCells();

    envolvingCells.forEach((cell) => {
      const posKey = this.getPositionKey(cell.position);
      if (!envolvingCellsMap[posKey]) {
        envolvingCellsMap[posKey] = { ...cell, neighbors: [] };
      }

      envolvingCellsMap[posKey].isLiving =
        envolvingCellsMap[posKey].isLiving || cell.isLiving;

      if (cell.neighbors.length) {
        envolvingCellsMap[posKey].neighbors.push(cell.neighbors[0]);
      } else {
        envolvingCellsMap[posKey].appearance = cell.appearance;
      }
    });

    return envolvingCellsMap;
  }

  private getAppearance(neighbors: Type.Cell['neighbors']) {
    let result: Type.Hsl = { hue: 0, saturation: 0, light: 0 };

    if (!neighbors.length) {
      return result;
    }

    result = neighbors.reduce(
      (result, neighbor) => ({
        hue: result.hue + neighbor.hue,
        saturation: result.saturation + neighbor.saturation,
        light: result.light + neighbor.light,
      }),
      result
    );

    result.hue = Math.floor(result.hue / neighbors.length);
    result.saturation = Math.floor(result.saturation / neighbors.length);
    result.light = Math.floor(result.light / neighbors.length);

    return result;
  }

  private calculateEnvolvedResult() {
    const envolvingCellsMap = this.getEnvolvingCellMap();
    const newBottomRight: Type.Position = { x: 0, y: 0 };

    this.#changedCells = [];
    this.#mutatedLivingCells = [];

    Object.entries(envolvingCellsMap).forEach(([key, cell]) => {
      if (cell.isLiving) {
        if (cell.neighbors.length < 2) {
          const deadCell: Type.Cell = {
            ...cell,
            isLiving: false,
            neighbors: [],
            appearance: { hue: 0, saturation: 0, light: 0 },
          };

          this.#changedCells.push(deadCell);
        } else if (cell.neighbors.length > 3) {
          const deadCell: Type.Cell = {
            ...cell,
            isLiving: false,
            neighbors: [],
            appearance: { hue: 0, saturation: 0, light: 0 },
          };

          this.#changedCells.push(deadCell);
        } else {
          const livingCell: Type.Cell<true> = {
            ...cell,
            neighbors: [],
            isLiving: true,
          };

          this.#mutatedLivingCells.push(livingCell);
        }
      } else {
        if (cell.neighbors.length === 3) {
          const newCell: Type.Cell<true> = {
            ...cell,
            neighbors: [],
            isLiving: true,
            appearance: this.getAppearance(cell.neighbors),
          };

          this.#changedCells.push(newCell);
          this.#mutatedLivingCells.push(newCell);

          if (cell.position.x > newBottomRight.x) {
            newBottomRight.x = cell.position.x;
          }

          if (cell.position.y > newBottomRight.y) {
            newBottomRight.y = cell.position.y;
          }
        }
      }
    });

    if (newBottomRight.x > this.#dimension.bottomRight.x) {
      this.#dimension.bottomRight.x = newBottomRight.x;
    }

    if (newBottomRight.y > this.#dimension.bottomRight.y) {
      this.#dimension.bottomRight.y = newBottomRight.y;
    }
  }

  public runEnvolution() {
    this.calculateEnvolvedResult();
    this.#currentLivingCells = this.#mutatedLivingCells;
  }

  public get changedCells() {
    return this.#changedCells;
  }

  public get currentLivingCells() {
    return this.#currentLivingCells;
  }

  public get bottomRightBoundary() {
    return { ...this.#dimension.bottomRight };
  }
}
