import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import AuthContext from '../context/AuthContext';
import HistoricoPlacasIndesejadas from '../components/HistoricoPlacasIndesejadas';

const GerirPlacasIndesejadas = () => {
  const {
    placasIndesejadas,
    loading,
    saveOrUpdatePlacaIndesejada,
    deletePlacaIndesejada,
    showSnackbar,
    getPlacasIndesejadas
  } = useContext(AuthContext);

  // Estado para paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [open, setOpen] = useState(false);
  const [editingPlaca, setEditingPlaca] = useState(null);
  const [formData, setFormData] = useState({
    placa: '',
    motivo: '',
    marca_modelo: '',
    cor: '',
  });
  const [placaError, setPlacaError] = useState(false);

  // Carregar dados ao iniciar o componente
  useEffect(() => {
    getPlacasIndesejadas();
  }, []);

  // Handlers para paginação
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpen = (placa = null) => {
    if (placa) {
      setEditingPlaca(placa);
      setFormData(placa);
      setPlacaError(false);
    } else {
      setEditingPlaca(null);
      setFormData({
        placa: '',
        motivo: '',
        marca_modelo: '',
        cor: '',
      });
      setPlacaError(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPlaca(null);
    setFormData({
      placa: '',
      motivo: '',
      marca_modelo: '',
      cor: '',
    });
    setPlacaError(false);
  };

  // Função para validar a placa no padrão Brasil/Mercosul
  const validatePlaca = (value) => {
    const regex = /^[A-Z]{3}-\d{4}$|^[A-Z]{3}-\d{1}[A-Z]{1}\d{2}$/; // Regex para LLL-NNNN ou LLL-NLNN
    return regex.test(value.toUpperCase());
  };

  // Atualiza o valor e valida a placa
  const handlePlacaChange = (e) => {
    const value = e.target.value.toUpperCase();
    setFormData({ ...formData, placa: value });
    setPlacaError(!validatePlaca(value) && value !== ''); // Erro se não for válida e não estiver vazia
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar a placa antes de enviar
    if (!validatePlaca(formData.placa)) {
      setPlacaError(true);
      showSnackbar('Formato de placa inválido. Use o formato AAA-1234 ou AAA-1A23.', 'error');
      return;
    }
    
    try {
      await saveOrUpdatePlacaIndesejada(formData, editingPlaca?.id || null);
      showSnackbar('Placa salva com sucesso!', 'success');
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar placa:', error);
      showSnackbar('Erro ao salvar placa. Por favor, tente novamente.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta placa?')) {
      try {
        await deletePlacaIndesejada(id);
        showSnackbar('Placa removida com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao excluir placa:', error);
        showSnackbar('Erro ao excluir placa. Por favor, tente novamente.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Pegar apenas os itens para a página atual
  const currentPlacas = placasIndesejadas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gerenciamento de Placas Indesejadas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Nova Placa
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Placa</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Cadastro</TableCell>
                <TableCell>Marca/Modelo</TableCell>
                <TableCell>Cor</TableCell>
                <TableCell>Usuário</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPlacas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Nenhuma placa indesejada cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                currentPlacas.map((placa) => (
                  <TableRow key={placa.id}>
                    <TableCell>{placa.placa}</TableCell>
                    <TableCell>{placa.motivo}</TableCell>                  
                    <TableCell>{placa.cadastro.split(' ')[0].split('-').reverse().join('/') + ' ' + placa.cadastro.split(' ')[1]}</TableCell>
                    <TableCell>{placa.marca_modelo}</TableCell>
                    <TableCell>{placa.cor}</TableCell>
                    <TableCell>{placa.usuario}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpen(placa)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(placa.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={placasIndesejadas.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
        
      </Paper>
      <Divider sx={{ margin: 4 }} />
      <HistoricoPlacasIndesejadas />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingPlaca ? 'Editar Placa' : 'Nova Placa'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Placa"
              value={formData.placa}
              onChange={handlePlacaChange}
              margin="normal"
              required
              inputProps={{ maxLength: 8 }}
              error={placaError}
              helperText={placaError ? "Formato inválido. Use AAA-1234 ou AAA-1A23" : ""}
            />
            <TextField
              fullWidth
              label="Motivo"
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Marca/Modelo"
              value={formData.marca_modelo}
              onChange={(e) => setFormData({ ...formData, marca_modelo: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Cor"
              value={formData.cor}
              onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GerirPlacasIndesejadas;
