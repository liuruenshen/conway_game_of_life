import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch, { SwitchProps } from '@mui/material/Switch';
import FaceIcon from '@mui/icons-material/Face';
import PersonIcon from '@mui/icons-material/Person';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { isPlayer as isPlayerValidator } from '../../../validator/isPlayer';
import * as Type from '../../../interface';

import {
  roomJoined,
  roomLeaved,
  getRoomStatus,
  requestSimulation,
} from '../../modules/socketEvents';

export function ControlPanel() {
  const [isPlayer, setIsPlayer] = useState<boolean>(false);
  const [roomStatus, setRoomStatus] = useState<
    Type.RoomJoinedPayload['roomStatus']
  >({ players: [], guests: [] });

  useEffect(() => {
    roomJoined(async (payload) => {
      if (payload.roomStatus && payload.newUser) {
        setIsPlayer(isPlayerValidator(payload.newUser));
      }

      if (!payload.roomStatus) {
        const roomStatus = await getRoomStatus();
        if (roomStatus) {
          setRoomStatus({ ...roomStatus });
        }
        return;
      }
      setRoomStatus(payload.roomStatus);
    });

    roomLeaved((roomStatus) => {
      if (!roomStatus) {
        return;
      }

      setRoomStatus(roomStatus);
    });
  }, []);

  const onChangeStartSimulation: SwitchProps['onChange'] = (event) => {
    requestSimulation(event.target.checked);
  };

  return (
    <Box
      sx={{
        width: 1,
        height: 200,
        flexGrow: 0,
        backgroundColor: 'background.paper',
        p: 3,
        boxSizing: 'border-box',
      }}
    >
      <Stack direction="row" sx={{ width: 1, height: 1 }} spacing={2}>
        <Paper
          sx={(theme) => ({
            height: 1,
            width: 250,
            boxSizing: 'border-box',
            borderRadius: 2,
            backgroundColor: theme.extendBackground.light,
            padding: 1,
          })}
        >
          <List
            sx={{
              height: 1,
              width: 1,
              overflowX: 'hidden',
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}
          >
            {roomStatus?.players.map((item) => (
              <ListItem key={item.id}>
                <ListItemIcon>
                  <FaceIcon color="primary" />
                </ListItemIcon>
                <ListItemText>{`${item.id.slice(0, 8)}...`}</ListItemText>
              </ListItem>
            ))}
            {roomStatus?.guests.map((item) => (
              <ListItem key={item.id}>
                <ListItemIcon>
                  <PersonIcon color="disabled"></PersonIcon>
                </ListItemIcon>
                <ListItemText>{`${item.id.slice(0, 8)}...`}</ListItemText>
              </ListItem>
            ))}
          </List>
        </Paper>
        {isPlayer ? (
          <Paper
            sx={(theme) => ({
              height: 1,
              width: 250,
              boxSizing: 'border-box',
              borderRadius: 2,
              backgroundColor: theme.extendBackground.light,
              padding: 2,
            })}
          >
            <FormGroup>
              <FormControlLabel
                control={<Switch onChange={onChangeStartSimulation} />}
                label="Start simulation"
              ></FormControlLabel>
            </FormGroup>
          </Paper>
        ) : null}
      </Stack>
    </Box>
  );
}
