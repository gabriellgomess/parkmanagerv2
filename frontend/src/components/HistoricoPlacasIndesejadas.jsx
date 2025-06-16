import { useState, useEffect, useContext } from 'react';
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
  TextField,
  Button,
  Stack
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ptBR from 'date-fns/locale/pt-BR';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const HistoricoPlacasIndesejadas = () => {
  const { ip } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [dataInicial, setDataInicial] = useState(null);
  const [dataFinal, setDataFinal] = useState(null);
  const [placa, setPlaca] = useState('');

  const buscarHistorico = async () => {
    setLoading(true);
    try {
      const params = {};
      
      if (dataInicial && dataFinal) {
        params.dataInicial = dataInicial.toISOString();
        params.dataFinal = dataFinal.toISOString();
      }
      
      if (placa) {
        params.placa = placa;
      }

      const response = await axios.get(`http://${ip}/api/blacklist/historico`, {
        params,
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });

      setHistorico(response.data);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarHistorico();
  }, []);

  const handleLimparFiltros = () => {
    setDataInicial(null);
    setDataFinal(null);
    setPlaca('');
    buscarHistorico();
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Adiciona o título
    doc.setFontSize(16);
    doc.text('Relatório de Acessos Indesejados', 14, 15);
    
    // Adiciona informações do filtro
    doc.setFontSize(10);
    let yPos = 25;
    
    if (dataInicial && dataFinal) {
      doc.text(`Período: ${dataInicial.toLocaleDateString('pt-BR')} até ${dataFinal.toLocaleDateString('pt-BR')}`, 14, yPos);
      yPos += 5;
    }
    
    if (placa) {
      doc.text(`Placa: ${placa}`, 14, yPos);
      yPos += 5;
    }
    
    // Prepara os dados para a tabela
    const tableData = historico.map(registro => [
      registro.placa,
      formatarData(registro.datahora),
      registro.motivo || '-',
      registro.origem || '-'
    ]);

    // Configura e gera a tabela
    doc.autoTable({
      startY: yPos + 5,
      head: [['Placa', 'Data/Hora', 'Motivo', 'Origem']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
      styles: { 
        fontSize: 8,
        cellPadding: 2,
        valign: 'middle',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Placa
        1: { cellWidth: 40 }, // Data/Hora
        2: { cellWidth: 70 }, // Motivo
        3: { cellWidth: 40 }  // Origem
      }
    });

    // Adiciona rodapé com total de registros
    const finalY = doc.previousAutoTable.finalY || yPos;
    doc.text(`Total de registros: ${historico.length}`, 14, finalY + 10);
    
    // Salva o PDF
    doc.save('historico-placas-indesejadas.pdf');
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Histórico de Acessos Indesejados
      </Typography>

      <Stack direction="row" spacing={2} sx={{ marginBottom: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <DatePicker
            label="Data Inicial"
            value={dataInicial}
            onChange={setDataInicial}
            slotProps={{ textField: { variant: 'outlined' } }}
          />
          <DatePicker
            label="Data Final"
            value={dataFinal}
            onChange={setDataFinal}
            slotProps={{ textField: { variant: 'outlined' } }}
          />
        </LocalizationProvider>
        <TextField
          label="Placa"
          value={placa}
          onChange={(e) => setPlaca(e.target.value.toUpperCase())}
          sx={{ width: 150 }}
        />
        <Button variant="contained" onClick={buscarHistorico}>
          Buscar
        </Button>
        <Button variant="outlined" onClick={handleLimparFiltros}>
          Limpar Filtros
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={generatePDF}
          startIcon={<TextSnippetIcon />}
          disabled={historico.length === 0}
        >
          Gerar Relatório
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Placa</strong></TableCell>
                <TableCell><strong>Data/Hora</strong></TableCell>
                <TableCell><strong>Motivo</strong></TableCell>
                <TableCell><strong>Origem</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historico.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                historico.map((registro, index) => (
                  <TableRow key={index}>
                    <TableCell>{registro.placa}</TableCell>
                    <TableCell>{formatarData(registro.datahora)}</TableCell>
                    <TableCell>{registro.motivo}</TableCell>
                    <TableCell>{registro.origem}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default HistoricoPlacasIndesejadas; 