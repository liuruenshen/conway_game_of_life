import { isPlainObject } from '../utilities/EnhancedLodash';
import * as Type from '../interface';

export function isPlayer(data: unknown): data is Type.Player {
  return (
    isPlainObject<Type.Player>(data) && isPlainObject<Type.Hsl>(data.appearance)
  );
}
