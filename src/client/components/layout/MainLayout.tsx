import React, { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';

export function MainLayout({ children }: PropsWithChildren<unknown>) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      {children}
    </Box>
  );
}
