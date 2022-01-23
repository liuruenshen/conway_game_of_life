import React, { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';

export function Scene({ children }: PropsWithChildren<unknown>) {
  return (
    <Box
      sx={{
        width: '100%',
        flexGrow: 1,
        height: 0.5,
        backgroundColor: 'background.default',
        overflow: 'auto',
      }}
    >
      {children}
    </Box>
  );
}
