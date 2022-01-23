import { pattern101 } from './101';
import { patternDiamond4812 } from './diamond4-8-12';
import { patternBoat4 } from './boat4';

import { Position } from '../interface';

export interface PatternMap {
  '101': Position[];
  diamond4812: Position[];
  boat4: Position[];
}

export const PATTERN_MAP: PatternMap = {
  '101': pattern101,
  diamond4812: patternDiamond4812,
  boat4: patternBoat4,
};
