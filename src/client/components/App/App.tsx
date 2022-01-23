import React from 'react';
import { render } from 'react-dom';
import AppTheme from '../../theme/theme';
import { MainLayout } from '../layout/MainLayout';
import { Scene } from '../layout/Scene';
import { GameOfLifeScene } from '../GameOfLifeScene/GameOfLifeScene';
import { ControlPanel } from '../ControlPanel/ControlPanel';

import { CreateOrSelectRoom } from '../CreateOrSelectRoom/CreateOrSelectRoom';

const rootElement = document.getElementById('root');

render(
  <React.StrictMode>
    <AppTheme>
      <MainLayout>
        <CreateOrSelectRoom />
        <Scene>
          <GameOfLifeScene />
        </Scene>
        <ControlPanel />
      </MainLayout>
    </AppTheme>
  </React.StrictMode>,
  rootElement
);
