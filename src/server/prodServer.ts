import express from 'express';
import { Server } from 'socket.io';
import { resolve } from 'path';

import { roomHandler } from './handlers/roomHandler';
import { playerOperations } from './handlers/playerOperations';

import * as Type from '../interface';

const PORT = process.env.PORT || 3000;

const assetsPath = resolve(__dirname, '../../dist');

const app = express()
  .use((req, res) => {
    switch (req.path) {
      case '/':
        res.sendFile('/index.html', { root: assetsPath });
        break;
      case '/main.css':
        res.sendFile('/main.css', { root: assetsPath });
        break;
      case '/main.js':
        res.sendFile('/main.js', { root: assetsPath });
        break;
    }
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = new Server(app, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  roomHandler(io, socket as Type.IOSocket);
  playerOperations(io, socket as Type.IOSocket);
});
