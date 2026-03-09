import React from 'react';
import { AppBar, Toolbar, Typography, Badge } from '@mui/material';

interface NavbarProps {
  totalTasks: number;
}

const Navbar: React.FC<NavbarProps> = ({ totalTasks }) => {

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Gestor de Tareas ICE
        </Typography>
        <Badge badgeContent={totalTasks} color="secondary">
          <Typography>Tareas</Typography>
        </Badge>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;