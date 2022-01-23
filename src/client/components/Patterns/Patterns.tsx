import { ReactElement, useState } from 'react';

import type { PatternMap } from '../../../patterns/patternsMap';

export interface PatternsChildProps {
  placingPatterns: boolean;
  placingPatternName: keyof PatternMap;
  getPatterns: (pattern: keyof PatternMap) => void;
  placePatterns: () => void;
}

interface PatternsProps {
  children: (props: PatternsChildProps) => ReactElement;
}

export function Patterns({ children }: PatternsProps) {
  const [placingPatterns, setPlacingPatterns] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<keyof PatternMap>('101');

  const childProps: PatternsChildProps = {
    placingPatterns,
    placingPatternName: currentPattern,
    getPatterns: (patternName: keyof PatternMap) => {
      setPlacingPatterns(true);
      setCurrentPattern(patternName);
    },
    placePatterns: () => {
      setPlacingPatterns(false);
    },
  };

  return children(childProps);
}
