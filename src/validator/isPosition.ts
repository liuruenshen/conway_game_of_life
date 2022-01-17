import isFinite from 'lodash/isFinite';

import { isPlainObject } from '../utilities/EnhancedLodash';
import * as Type from '../server/interface';

export function isPosition(data: unknown): data is Type.Position {
  return (
    isPlainObject<Type.Position>(data) && isFinite(data.x) && isFinite(data.y)
  );
}
