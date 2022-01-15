import { isPlainObject as _isPlainObject } from 'lodash';

export function isPlainObject<T>(arg: unknown): arg is T {
  return _isPlainObject(arg);
}
