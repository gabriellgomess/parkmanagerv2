import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  Typography,
  Divider,
  Button,
  Modal,
  Backdrop,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  styled,
  IconButton
} from '@mui/material';
import {
  Snackbar,
  Alert as MuiAlert,
  CircularProgress
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import IconEntrada from '../assets/entrada.png';
import IconSaida from '../assets/saida.png';
import IconCaixa from '../assets/caixa.png';
import AuthContext from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import PlacasIndesejadas from './PlacasIndesejadas';
import Barrier from '../assets/barrier.png';
import Placa from '../assets/plate.png';

const StyledCard = styled(Card)(({ theme, clickable }) => ({
  width: '230px',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  cursor: clickable ? 'pointer' : 'default',
  '&:hover': clickable && {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[8],
  },
}));

const ModalBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  backgroundColor: theme.palette.background.paper,
  border: '2px solid #000',
  boxShadow: theme.shadows[24],
  padding: theme.spacing(4),
}));

const Terminais = () => {
  const [terminais, setTerminais] = useState([]);
  const [open, setOpen] = useState(false);
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [ipt, setIpT] = useState('');
  const [term, setTerm] = useState('');
  const [motivo, setMotivo] = useState('');
  const [terminalIp, setTerminalIp] = useState('');
  const [placa, setPlaca] = useState('');
  const [motivosDisponiveis, setMotivosDisponiveis] = useState([]);
  const [novoMotivo, setNovoMotivo] = useState('');
  const [modalNovoMotivoOpen, setModalNovoMotivoOpen] = useState(false);
  const [historicoOpen, setHistoricoOpen] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [reloadHistory, setReloadHistory] = useState(true)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const intervalRef = useRef(null);
  const { config, ip, user } = useContext(AuthContext);

  const handleOpen = async (configLpr, terminalLPR, ipTerminal) => {
    let ipExtraido = '';
  
    if (configLpr) {
      const match = configLpr.match(/IP_CAM=([\d.]+)/);
      ipExtraido = match ? match[1] : '';
    }
  
    if (!ipExtraido) {
      const partes = ipTerminal.split('.');
      if (partes.length === 4) {
        const ultimoOcteto = parseInt(partes[3], 10);
        if (!isNaN(ultimoOcteto)) {
          partes[3] = (ultimoOcteto + 100).toString();
          ipExtraido = partes.join('.');
        }
      }
    }
  
    setIpT(ipExtraido);
    setTerm(terminalLPR);
    setTerminalIp(ipTerminal);
    setOpen(true);
  
    const buscarPlacaDireto = async () => {
      try {
        const res = await axios.get(`http://${ip}/api/captura-placa`, {
          params: { ip_camera: ipExtraido },
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });
  
        if (res.data?.placa) {
          const rawPlaca = res.data.placa.toUpperCase().replace('-', '');
          let placaFormatada = rawPlaca;
          if (rawPlaca.length === 7) {
            placaFormatada = `${rawPlaca.substring(0, 3)}-${rawPlaca.substring(3)}`;
          }
          setPlaca(placaFormatada);
        } else {
          setPlaca('');
        }
      } catch (err) {
        console.error('Erro ao capturar placa:', err);
        setPlaca('');
      }
    };
  
    await buscarPlacaDireto();
  
    // Limpa qualquer intervalo anterior antes de criar um novo
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(buscarPlacaDireto, 2500);
  };
  
  

  const getMotivos = async () => {
    try {
      const resMotivos = await axios.get(`http://${ip}/api/motivos-abertura`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
      const motivosOrdenados = resMotivos.data.sort((a, b) => a.localeCompare(b));
      setMotivosDisponiveis(motivosOrdenados);
    } catch (err) {
      console.error('Erro ao buscar motivos de abertura:', err);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setIpT('');
    setTerm('');
    setMotivo('');
    setTerminalIp('');
    setPlaca('');

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleCloseBackdrop = () => {
    setOpenBackdrop(false);
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
  };

  const formatVersion = (version) => {
    let v = version?.split(' ');
    let versao = v[0];
    return 'ParkingPlus ' + versao;
  };

  const abrirCancela = async () => {
    if (!motivo.trim()) {
      showSnackbar('Por favor, informe o motivo da abertura da cancela.', 'warning');
      return;
    }

    try {
      const response = await axios.post(
        `http://${ip}/api/abrir-cancela`,
        {
          ip: terminalIp,
          terminal: term,
          motivo: motivo,
          placa: placa,
          usuario: user.email
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        }
      );

      showSnackbar(response.data.message || 'Cancela aberta com sucesso!', 'success');
      setMotivo('');
    } catch (error) {
      console.error('Erro ao abrir cancela:', error);
      
      if (error.response?.data?.detail === 'Precondition Failed') {
        showSnackbar('O veículo deve estar sobre o sensor!', 'warning');
      } else {
        showSnackbar(error.response?.data?.message || 'Houve um erro ao abrir a cancela.', 'error');
      }
    }
  };

  const buscarDadosAberturaCancela = async () => {
    try {
      const res = await axios.get(`http://${ip}/api/historico-cancela`, {
        params: {
          inicio: dataInicio,
          fim: dataFim,
        },
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
      setHistorico(res.data);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleAddNewReason = async () => {
    if (!novoMotivo.trim()) return;
    
    try {
      await axios.post(`http://${ip}/api/motivos-abertura`, {
        motivo: novoMotivo.trim()
      }, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      setMotivosDisponiveis(prev => [...prev, novoMotivo.trim()].sort((a, b) => a.localeCompare(b)));
      setMotivo(novoMotivo.trim());
      setNovoMotivo('');
      setModalNovoMotivoOpen(false);
    } catch (err) {
      console.error("Erro ao salvar novo motivo:", err);
    }
  };

  useEffect(() => {
    getMotivos();
    setOpenBackdrop(true);
    buscarDadosAberturaCancela();
    
    const fetchTerminais = async () => {
      try {
        const response = await axios.get(`http://${ip}/api/terminais`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });
        setTerminais(response.data || []);
      } catch (error) {
        console.error('Houve um erro ao buscar os terminais:', error);
        setError('Falha ao carregar os terminais. Por favor, tente novamente.');
        showSnackbar('Falha ao carregar os terminais. Por favor, tente novamente.', 'error');
      } finally {
        setOpenBackdrop(false);
        setLoading(false);
      }
    };

    fetchTerminais();
  }, [reloadHistory]);

  useEffect(() => {
    if (!open && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [open]);
  

  const resetarHistorico = () => {
    setDataInicio('');
    setDataFim('');
    buscarDadosAberturaCancela();
    setReloadHistory(reloadHistory==true?false:true)
  };
  

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <Button size="small" variant="outlined" mb={3} onClick={() => setHistoricoOpen(true)}>
        Histórico de aberturas manuais
      </Button>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: '100%' }}>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: '55%', minWidth: '350px' }}>
        
        {Array.isArray(terminais) && terminais.length > 0 ? (
          terminais.map((terminal) => (
            <StyledCard
              key={terminal.idestacao}
              clickable={terminal.tipo === 8 || terminal.tipo === 10}
              onClick={(terminal.tipo === 8 || terminal.tipo === 10) 
                ? () => handleOpen(terminal.configuracoes_lpr, terminal.descricao, terminal.enderecoip) 
                : undefined}
            >
              <Box sx={{ display: 'flex', alignItems: 'end', gap: '20px' }}>                            
                <img 
                  width={30} 
                  src={
                    terminal.tipo === 8 ? IconEntrada : 
                    terminal.tipo === 10 ? IconSaida : 
                    IconCaixa
                  } 
                  alt={terminal.tipo} 
                />
                <Typography variant="caption">{terminal.descricao}</Typography>
              </Box>                          
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant='caption'>
                    {terminal.tipo === 8 ? 'Entrada' : terminal.tipo === 10 ? 'Saída' : 'Caixa'}
                  </Typography>
                  <Typography 
                    variant='caption' 
                    sx={{ color: terminal.status === 'online' ? 'success.main' : 'error.main' }}
                  >
                    {terminal.status}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <Typography variant='caption' sx={{ fontSize: '0.6rem', lineHeight: '3px' }}>IP {terminal.enderecoip}</Typography>
              <Typography variant='caption' sx={{ fontSize: '0.6rem', lineHeight: '3px' }}>
                Online desde: {formatDateTime(terminal.upsince)}
              </Typography>
              {(terminal.tipo === 8 || terminal.tipo === 10) &&
                <Typography variant='caption' sx={{ fontSize: '0.6rem', lineHeight: '3px' }}>
                  Versão: {formatVersion(terminal.versaoparkingplus)}
                </Typography>
              }                        
            </StyledCard>
          ))
        ) : (
          <Typography variant="caption" sx={{ color: 'error.main' }}>
            Nenhum terminal encontrado.
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: '40%', minWidth: '250px' }}>
        <PlacasIndesejadas />
      </Box>

      {/* Modal para abrir cancela */}
      <Modal open={open} onClose={handleClose}>
        <ModalBox>
          <Typography variant="h6" component="h2">
            {term}
          </Typography>
          {/* <Box sx={{ width: '480px', margin: '0 auto' }}>
            <img src={`http://${ipt}/api/mjpegvideo.cgi`} width="100%" alt="Video feed"/>
          </Box> */}
          
          {/* <Typography variant="h6" align="center" sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <img src={Placa} width="60px" alt="Placa" />
            {placa 
              ? <strong style={{ color: 'grey' }}>{placa}</strong>
              : <em style={{ color: 'lightgrey' }}>Nenhuma placa detectada</em>}
          </Typography> */}

          {ipt && (
            <>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="select-motivo-label">Motivo da abertura</InputLabel>
                  <Select
                    labelId="select-motivo-label"
                    id="select-motivo"
                    value={motivo}
                    label="Motivo da abertura"
                    onChange={(e) => setMotivo(e.target.value)}
                  >
                    {motivosDisponiveis.map((m, index) => (
                      <MenuItem key={index} value={m}>{m}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton aria-label="add" color="primary" onClick={() => setModalNovoMotivoOpen(true)}>
                  <AddCircleOutlineIcon />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"                            
                  onClick={abrirCancela}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  Abrir Cancela
                  <img src={Barrier} width={24} height={24} alt="Cancela" />
                </Button>
              </Box>
            </>
          )}
        </ModalBox>
      </Modal>

      {/* Modal para adicionar novo motivo */}
      <Modal open={modalNovoMotivoOpen} onClose={() => setModalNovoMotivoOpen(false)}>
        <ModalBox sx={{ width: 400 }}>
          <Typography variant="h6" gutterBottom>Adicionar novo motivo</Typography>
          <TextField
            fullWidth
            value={novoMotivo}
            onChange={(e) => setNovoMotivo(e.target.value)}
            placeholder="Digite o novo motivo"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setModalNovoMotivoOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleAddNewReason}>
              Salvar
            </Button>
          </Box>
        </ModalBox>
      </Modal>

      {/* Modal para histórico */}
      <Modal open={historicoOpen} onClose={() => {
        setHistoricoOpen(false);
        resetarHistorico();
      }}>
     
        <ModalBox sx={{ width: '90%', maxWidth: '1200px', maxHeight: '90vh', overflow: 'auto' }}>
          <Typography variant="h6" mb={2}>Histórico de Aberturas Manuais</Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <TextField
              type="date"
              label="Data inicial"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              label="Data final"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" onClick={buscarDadosAberturaCancela}>
              Filtrar
            </Button>
            <Button variant="outlined" color="secondary" onClick={resetarHistorico}>
              Limpar
            </Button>
          </Box>


          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Terminal</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>Usuário</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell>Placa</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historico.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(item.created_at).toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{item.terminal}</TableCell>
                    <TableCell>{item.ip}</TableCell>
                    <TableCell>{item.usuario}</TableCell>
                    <TableCell>{item.motivo}</TableCell>
                    <TableCell>{item.placa}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </ModalBox>
      </Modal>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBackdrop}
        onClick={handleCloseBackdrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>

    </>
      );
};

export default Terminais;