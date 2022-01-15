export interface Hsl {
  hue: number;
  saturation: number;
  light: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Dimension {
  upperLeft: Position;
  bottomRight: Position;
}

export interface Cell<IsLiving extends boolean = false | true> {
  position: {
    x: number;
    y: number;
  };
  isLiving: IsLiving;
  neighbors: Hsl[];
  appearance: Hsl;
}

export type LivingCells = Cell<true>[];

export type EnvolvingCells = Cell[];

export type EnvolvingCellMap = Record<string, Cell>;

export type MutatedLivingCells = Cell<true>[];

export type ChangedCells = Cell[];
