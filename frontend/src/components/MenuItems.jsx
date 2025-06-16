import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BadgeIcon from '@mui/icons-material/Badge';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LogoutIcon from '@mui/icons-material/Logout';
import CarCrashIcon from '@mui/icons-material/CarCrash';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import Traffic from '../assets/traffic_jam.png';

const MenuItems = (user) => [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
    visible: true, // Sempre visível
  },
  {
    name: 'Terminais',
    path: '/terminais',
    icon: <img src={Traffic} alt="Terminais" style={{ width: '1.5em', height: '1.5em' }} />,
    visible: true, // Sempre visível
  },
  {
    name: 'Placas indesejadas',
    path: '/placas-indesejadas',
    icon: <CarCrashIcon />,
    visible: true, // Sempre visível
  },
  {
    name: 'Monitoramento de Placas',
    path: '/monitoramento-placas',
    icon: <NotificationsActiveIcon />,
    visible: true, // Sempre visível
  },
  {
    name: 'Entradas/Saídas',
    path: '/entradas-saidas',
    icon: <SyncAltIcon />,
    visible: true, // Sempre visível
  },
  {
    name: 'Validação Hiper',
    path: '/validacao-hiper',
    icon: <StorefrontIcon />,
    visible: true, // Sempre visível
  },
  {
    name: 'Credenciados',
    path: '/credenciados',
    icon: <BadgeIcon />,
    visible: true, // Sempre visível
  },
  {
    name: 'Pagamentos',
    path: '/pagamentos',
    icon: <AttachMoneyIcon />,
    visible: true, // Sempre visível
  },
  {
    name: 'Usuários',
    path: '/users',
    icon: <PeopleIcon />,
    visible: user?.nivel_acesso === 1, // Apenas se user estiver definido e nivel_acesso for 1
  },
  {
    name: 'Sair',
    action: 'logout',
    icon: <LogoutIcon />,
    visible: true, // Sempre visível
  },
];

export default MenuItems;

