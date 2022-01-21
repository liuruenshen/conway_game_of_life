import React, { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';

export function Scene({ children }: PropsWithChildren<unknown>) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '80%',
        backgroundColor: 'background.default',
        overflow: 'auto',
      }}
    >
      {children}
    </Box>
  );
}
