import { useContext, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Divider
} from '@mui/material';
import AuthContext from '../context/AuthContext';


const PlacasIndesejadas = () => {
  const {
    placas,
    BuscaPlacas,
    loading
  } = useContext(AuthContext);  

  // Buscar dados ao carregar o componente e periodicamente
  useEffect(() => {
    // Buscar dados imediatamente
    BuscaPlacas();
    
    // Configurar intervalo para atualização
    const interval = setInterval(() => {
      BuscaPlacas();
    }, 10000);
    
    // Limpar intervalo ao desmontar
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ padding: 2, width: '100%' }}>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Detecção de Placas Indesejadas
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 2 }}>
        Para ativar e desativar o alerta sonoro, vá ao menu lateral
        e clique no ícone de sino.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ height: 300, width: '100%', marginBottom: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center"><strong>Placa</strong></TableCell>
                <TableCell align="center"><strong>Data/hora</strong></TableCell>
                <TableCell align="center"><strong>Motivo</strong></TableCell>
                <TableCell align="center"><strong>Origem</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {placas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhuma detecção de placa indesejada
                  </TableCell>
                </TableRow>
              ) : (
                placas.map((placa, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{fontSize: '10px !important'}} align="center">{placa.placa}</TableCell>
                    <TableCell sx={{fontSize: '10px !important'}} align="center">
                      {new Date(placa.datahora).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell sx={{fontSize: '10px !important'}} align="center">{placa.motivo}</TableCell>
                    <TableCell sx={{fontSize: '10px !important'}} align="center">{placa.origem}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}      
      
      
    </Box>
  );
};

export default PlacasIndesejadas;
