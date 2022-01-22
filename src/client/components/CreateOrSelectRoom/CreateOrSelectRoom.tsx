import React, { useState, useEffect } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import * as Type from '../../../interface';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';

import {
  roomJoined,
  roomNamesUpdated,
  createRoom,
  joinRoom,
  getRoomNames,
} from '../../modules/socketEvents';

export function CreateOrSelectRoom() {
  const [open, setOpen] = useState(true);
  const [newRoomName, setNewRoomName] = useState('');
  const [joiningRoomName, setJoiningRoomName] = useState('');
  const [roomNames, setRoomNames] = useState<
    Type.RoomNamesUpdatedPayload['roomNames']
  >([]);

  roomJoined(() => setOpen(false));
  roomNamesUpdated((payload) => setRoomNames(payload.roomNames));

  useEffect(() => {
    getRoomNames();
  }, []);

  return (
    <Dialog maxWidth="sm" fullWidth open={open}>
      <DialogTitle sx={{ typography: 'h4' }}>Create or join a room</DialogTitle>
      <Stack direction="column" sx={{ p: 4, typography: 'h5' }} spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>Create a new room</Box>
          <Box>
            <TextField
              sx={{ width: 250 }}
              variant="outlined"
              onChange={(event) => setNewRoomName(event.target.value.trim())}
            />
          </Box>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>Join a existing room</Box>
          <Box>
            <Select
              sx={{ width: 250 }}
              label="Select a room"
              disabled={!roomNames.length}
              value={joiningRoomName}
              onChange={(event) => {
                setJoiningRoomName(event.target.value as string);
              }}
            >
              {roomNames.map((roomName) => (
                <MenuItem key={roomName} value={roomName}>
                  {roomName}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Stack>
        <Stack>
          <Button
            disabled={!joiningRoomName && !newRoomName}
            variant="contained"
            onClick={() => {
              if (newRoomName) {
                createRoom(newRoomName);
              } else {
                joinRoom(joiningRoomName);
              }
            }}
          >
            {newRoomName ? 'Create' : 'Join'}
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
}
