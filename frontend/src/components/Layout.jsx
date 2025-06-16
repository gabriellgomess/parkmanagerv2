// src/components/Layout.jsx
import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { Link, useNavigate } from 'react-router-dom';
import menuItems from './MenuItems';
import AuthContext from '../context/AuthContext';

import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

import Logo from '../assets/logo_lg_light.png';
import LogoMobile from '../assets/logo_light.png';

import { useParams } from 'react-router-dom';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

export default function Layout({ children }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const { logout, user, config, audioEnabled, enableAudio, disableAudio} = React.useContext(AuthContext); // Obtém o config
  const navigate = useNavigate();
  const hostname = window.location.hostname;
const port = window.location.port; 
const ip = port ? `${hostname}:${port}` : hostname; // Extrai o parâmetro da rota

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenuClick = (item) => {
    if (item.action === 'logout') {
      logout();
      navigate('/');
    }
  };
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ marginRight: 5, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{display: {xs: 'none', sm: 'none', md: 'block'}}}>
            <img src={Logo} alt="Logo" width={200} />
          </Box>
          <Box sx={{display: {xs: 'block', sm: 'block', md: 'none'}}}>
            <img src={LogoMobile} alt="Logo" width={60} />
          </Box>         
          
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Avatar alt={user?.name} src={`http://${ip}/storage/${user?.profile_photo}`} />
            <Box>
              <Typography variant="body2" sx={{ ml: 'auto', lineHeight: '1px' }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ ml: 'auto', lineHeight: '1px' }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
        {!audioEnabled ? ( 
          <ListItem
            disablePadding
            sx={{display: 'block'}}
            onClick={enableAudio}
          >
            <ListItemButton
              component='button'
              sx={{minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5}}
            >
              <ListItemIcon sx={{minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'red'}}>
                <NotificationsOffIcon />
              </ListItemIcon>
              <ListItemText primary='Alerta de placa' sx={{opacity: open ? 1 : 0}} />
            </ListItemButton>            
          </ListItem>
          ):
          (
            <ListItem
            disablePadding
            sx={{display: 'block'}}
            onClick={disableAudio}
          >
            <ListItemButton
              component='button'
              sx={{minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5}}
            >
              <ListItemIcon sx={{minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'green'}}>
                <NotificationsActiveIcon />
              </ListItemIcon>
              <ListItemText primary='Alerta de placa' sx={{opacity: open ? 1 : 0}} />
            </ListItemButton>
          </ListItem>
          )}
          {menuItems(user || {}).filter(item => item.visible).map((item) => (
            <ListItem
              key={item.name}
              disablePadding
              sx={{ display: 'block' }}
              onClick={() => handleMenuClick(item)}
            >
              <ListItemButton
                component={item.action ? 'button' : Link}
                to={item.path || '#'}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.name} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}         

        </List>
        <Divider />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        <Box sx={{maxWidth: '1800px'}}>
          {children}
        </Box>        
      </Box>
    </Box>
  );
}
