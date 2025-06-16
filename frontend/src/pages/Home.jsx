import { useState, useContext } from 'react';
import { Button, TextField, Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import AuthContext from '../context/AuthContext';
import BgHome from '../assets/bg-home.jpg';
import LogoRA from '../assets/logo_ra.png';
import LogoParkManager from '../assets/logo_lg_light.png';

const Home = () => {
  const { login, loading, error } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const theme = useTheme();

  const handleLogin = async () => {
    await login(email, password);
  };

  return (
    <div
      style={{
        backgroundImage: `url(${BgHome})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          flexGrow: 1,
          height: '100%',
        }}
      >
        {/* Esquerda - Título */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: { xs: 3, md: '5%' },
            gap: 2,
            background: 'rgba(0, 0, 0, 0.6)',
            color: '#fff',
            textShadow: '4px 4px 3px rgba(0,0,0,0.5)',
          }}
        >
          <img src={LogoParkManager} alt="Logo RA" style={{ width: '60%' }} />
          <Typography variant="h3">
            {`${import.meta.env.VITE_REACT_APP_TITLE_HOME}`}
          </Typography>
          <Typography variant="h6">
            {`${import.meta.env.VITE_REACT_APP_SUBTITLE_HOME}`}
          </Typography>
        </Box>

        {/* Direita - Login */}
        <Box
          sx={{
            width: { xs: '100%', md: '350px' },
            backgroundColor: '#fff',
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: { xs: 'auto', md: '100vh' }, // Evita scroll
            boxSizing: 'border-box',
          }}
        >

          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <img src={LogoRA} alt="Logo RA" style={{ width: '150px' }} />
            </Box>
            <Typography variant="h6" align="center">Acesso</Typography>
            <TextField
              label="Email"
              fullWidth
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Senha"
              type="password"
              fullWidth
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Entrar'}
            </Button>
            {error && <Typography color="error">{error}</Typography>}
          </Box>

          {/* Rodapé dentro da coluna direita */}
          <Box sx={{ textAlign: 'center', mt: 'auto', pt: 2 }}>
            <a href="https://nexustech.net.br" target="blank" style={{ textDecoration: 'none' }}>
              <Typography
                variant="caption"
                align="center"
                sx={{ color: '#878787' }}
              >
                &copy; NexusTech {new Date().getFullYear()} - Todos os direitos reservados
              </Typography>
            </a>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default Home;
