'use client';

import React from 'react';
import { Avatar } from '@mui/material';

export default function UserAvatar({ photoURL, displayName }) {
  return (
    <Avatar
      src={photoURL}
      alt={displayName}
      sx={{ width: 40, height: 40 }}
    />
  );
}