import { Cell } from '../server/interface';

export type EnvolvingCells = Cell[];

export type EnvolvingCellMap = Record<string, Cell>;

export type MutatedLivingCells = Cell<true>[];

export type ChangedCells = Cell[];
