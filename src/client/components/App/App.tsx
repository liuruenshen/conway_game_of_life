import React from 'react';
import { render } from 'react-dom';
import AppTheme from '../../theme/theme';
import { MainLayout } from '../layout/MainLayout';

import { CreateOrSelectRoom } from '../CreateOrSelectRoom/CreateOrSelectRoom';

const rootElement = document.getElementById('root');

render(
  <React.StrictMode>
    <AppTheme>
      <MainLayout>
        <CreateOrSelectRoom />
      </MainLayout>
    </AppTheme>
  </React.StrictMode>,
  rootElement
);
