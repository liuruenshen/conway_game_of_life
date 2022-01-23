import { Cell } from '../interface';

export type InvolvingCells = Cell[];

export type InvolvingCellMap = Record<string, Cell>;

export type MutatedLivingCells = Cell<true>[];

export type ChangedCells = Cell[];
