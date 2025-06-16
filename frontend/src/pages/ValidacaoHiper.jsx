import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, Backdrop, Card, CardContent, Tooltip, Snackbar, Alert, Accordion, AccordionSummary, AccordionDetails, Select, FormControl, InputLabel, MenuItem } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';
import AuthContext from '../context/AuthContext'; // Importa o contexto

import { useParams } from 'react-router-dom';


const ValidacaoHiper = () => {
  const { ip } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ticket, setTicket] = useState('');
  const [placa, setPlaca] = useState('');
  const [validacaoStart, setValidacaoStart] = useState('');
  const [validacaoEnd, setValidacaoEnd] = useState('');
  const [order, setOrder] = useState('');
  const [placaError, setPlacaError] = useState(false);
  const [averages, setAverages] = useState({});
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };

    // States for Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('error');

     // Close Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Função para buscar dados com ou sem filtro de datas
  const fetchData = (start = '', end = '', ticket = '', placa = '', validacaoStart = '', validacaoEnd = '', order = '') => {
    if (placaError) {
      alert('Placa inválida, digite no formato LLL-NNNN ou LLL-NLNN');
      return;
    }
  
    handleOpen();
    const params = {};
  
    // Adicione ao objeto `params` somente se o valor for válido
    if (start && !isNaN(new Date(start))) params.dataA = start;
    if (end && !isNaN(new Date(end))) params.dataB = end;
    if (ticket) params.ticket = ticket;
    if (placa) params.placa = placa;
    if (validacaoStart && !isNaN(new Date(validacaoStart))) params.validacaoA = validacaoStart;
    if (validacaoEnd && !isNaN(new Date(validacaoEnd))) params.validacaoB = validacaoEnd;
    if (order) params.order = order;
  
    axios
      .get(`http://${ip}/api/hiper`, {
        params,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        handleClose();
        setData(response.data);
      })
      .catch((error) => {
        handleClose();
        console.error('Erro ao buscar os dados:', error);
      });
  };
  
  

  // Chamada inicial para buscar todos os dados
  useEffect(() => {
    fetchData();
  }, []);

  // Função para formatar datas no DataGrid
  const formatData = (data) => {
    if (!data) return "N/A";
    let date = data.split(' ')[0].split('-').reverse().join('/');
    let time = data.split(' ')[1];
    return `${date} ${time}`;
  };

  // Função para formatar a permanência em horas e minutos
const formatPermanencia = (minutos) => {
  if (!minutos && minutos !== 0) return "N/A";
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const formatOrigemAcesso = (origem) => {
  if ( origem === 'TICKETLESS' || origem === 'PLACA LPR') return 'Placa LPR';
  if ( origem === 'CARTAO TAG') return 'Ticket';
}




const faixaDeValorNum = (tempodesc) => {
  const ranges = {
    60: 10,
    120: 20,
    180: 30,
    240: 40,
    300: 50,
    360: 60,
    420: 70,
    480: 80,
    540: 90,
    600: 100,
    660: 110,
    720: 120,
    780: 130,
    840: 140,
    900: 150
  };
  return ranges[tempodesc] || 0; // Retorna 0 se estiver fora do intervalo
};

  // Definindo as colunas para o DataGrid com renderCell
  const columns = [
    { field: 'ticket', headerName: 'Ticket', width: 100, sortable: false, filterable: false },
    { field: 'placa', headerName: 'Placa', width: 100, sortable: false, filterable: false },
    { field: 'terminal_entrada', headerName: 'Entrada', width: 100, sortable: false, filterable: false },             
    { field: 'datahoraentrada', headerName: 'Data Entrada', width: 140, sortable: false, filterable: false, renderCell: (params) => <span>{formatData(params.row.datahoraentrada)}</span> },
    { field: 'datahoravalidacao', headerName: 'Validação', width: 140, sortable: false, filterable: false, renderCell: (params) => <span>{formatData(params.row.datahoravalidacao)}</span> },
    { field: 'terminal_saida', headerName: 'Saída', width: 100, sortable: false, filterable: false }, 
    { field: 'datahorasaida', headerName: 'Hora Saída', width: 140, sortable: false, filterable: false, renderCell: (params) => <span>{params.row.datahorasaida.split(' ')[1]}</span> },
    { field: 'permanencia', headerName: 'Permanência', width: 130, sortable: false, filterable: false, renderCell: (params) => <span>{formatPermanencia(params.row.permanencia)}</span> },
    { field: 'origem_acesso_saida', headerName: 'Como saiu', width: 100, sortable: false, filterable: false, renderCell: (params) => <span>{formatOrigemAcesso(params.row.origem_acesso_saida)}</span> },
    { field: 'valordesc', headerName: 'Valor Desc', width: 100, sortable: false, filterable: false, renderCell: (params) => <span>R$ {params.row.valordesc},00</span> },
    { field: 'tempodesc', headerName: 'Tempo Desc', width: 100, sortable: false, filterable: false, renderCell: (params) => <span>{formatPermanencia(params.row.tempodesc)}</span>  },
    { field: 'faixa_valor', headerName: 'Compras até', width: 150, sortable: false, filterable: false, renderCell: (params) => <span>{faixaDeValorNum(params.row.tempodesc)}</span> } 
  ];

  // Função para aplicar o filtro
  const handleApplyFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      setSnackbarMessage('Data Inicial não pode ser maior que Data Final');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
  
    const start = dayjs(startDate).format('YYYY-MM-DD HH:mm:ss');
    const end = dayjs(endDate).format('YYYY-MM-DD HH:mm:ss');
    const valStart = dayjs(validacaoStart).format('YYYY-MM-DD HH:mm:ss');
    const valEnd = dayjs(validacaoEnd).format('YYYY-MM-DD HH:mm:ss');
  
    fetchData(start, end, ticket, placa, valStart, valEnd, order);
  };
  

  // Função para limpar o filtro
  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setTicket('');
    setPlaca('');
    setValidacaoStart('');
    setValidacaoEnd('');
    setOrder('');
    fetchData();
  };

  const generatePDF = () => {
    handleOpen(); // Abre o Backdrop antes de gerar o PDF
  
    const doc = new jsPDF('landscape');
    doc.text("Relatório de Validações Hiper", 14, 10);
    
    // Configurar dados para a tabela de médias
    const mediaData = [
      ["Total de Tickets", averages.totalTickets],
      ["Tempo médio de Permanência", formatPermanencia(Math.ceil(averages.mediaPermanencia) || 0)],
      ["Tempo médio de desconto aplicado", formatPermanencia(Math.ceil(averages.mediaTempodesc) || 0)],
      ["Média de valor abonado no ticket", `R$ ${averages.mediaValordesc?.toFixed(2)}`],
      ["Terminal de entrada Mais utilizado", averages.terminalEntradaMaisUtilizado || 'N/A'],
      ["Terminal de saída Mais utilizado", averages.terminalSaidaMaisUtilizado || 'N/A']      
    ];
  
    // Adicionar a tabela de médias no topo do PDF
    doc.autoTable({
      head: [["Descrição", "Valor"]],
      body: mediaData,
      startY: 20, // Posição Y onde a tabela de médias começa
      theme: 'grid',
   
    });
  
    // Configurar dados para a tabela principal
    const tableData = data.filter(row => row.ticket !== '100').map(row => ([
      row.ticket,
      row.placa || 'Sem captura',
      row.terminal_entrada || 'N/A',
      formatData(row.datahoraentrada),
      formatData(row.datahoravalidacao),
      row.terminal_saida || 'N/A',
      row.datahorasaida ? row.datahorasaida.split(' ')[1] : 'N/A',
      formatPermanencia(row.permanencia),
      formatOrigemAcesso(row.origem_acesso_saida) || 'N/A',
      'R$ '+row.valordesc+',00' || 'N/A',
      formatPermanencia(row.tempodesc) || 'N/A',
      faixaDeValorNum(row.tempodesc) // Adiciona a faixa de valor ao PDF
    ]));
  
    // Adicionar a tabela principal abaixo da tabela de médias
    doc.autoTable({
      head: [['Ticket', 'Placa', 'Entrada', 'Data Entrada', 'Validação', 'Saída', 'Hora Saída', 'Permanência', 'Como saiu', 'Valor Desc', 'Tempo Desc', 'Compras até']],
      body: tableData,
      startY: doc.autoTable.previous.finalY + 10, // Começa após a tabela de médias, com um espaço de 10 unidades
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
      styles: { fontSize: 8, halign: 'center' },
      didDrawPage: (data) => {
        // Adiciona o número da página no rodapé
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(`Página ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
      }
    });
  
    doc.save('validacoes_hiper.pdf');
    handleClose(); // Fecha o Backdrop após salvar o PDF
  };
  
  
  

  const calculateAverages = (data) => {
    const totalPermanencia = data.reduce((sum, row) => sum + row.permanencia, 0);
    const totalTempodesc = data.reduce((sum, row) => sum + row.tempodesc, 0);
    const totalValordesc = data.reduce((sum, row) => sum + parseFloat(row.valordesc), 0);
    const totalFaixaValor = data.reduce((sum, row) => sum + faixaDeValorNum(row.tempodesc), 0);
    const totalTickets = data.length;
  
    const entradaCounts = {};
    const saidaCounts = {};
  
    data.forEach(row => {
      entradaCounts[row.terminal_entrada] = (entradaCounts[row.terminal_entrada] || 0) + 1;
      saidaCounts[row.terminal_saida] = (saidaCounts[row.terminal_saida] || 0) + 1;
    });
  
    const mostFrequent = (counts) => Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  
    return {
      mediaPermanencia: totalPermanencia / data.length,
      mediaTempodesc: totalTempodesc / data.length,
      mediaValordesc: totalValordesc / data.length,
      mediaFaixaValor: totalFaixaValor / data.length,
      terminalEntradaMaisUtilizado: mostFrequent(entradaCounts),
      terminalEntradaCount: entradaCounts[mostFrequent(entradaCounts)],
      terminalSaidaMaisUtilizado: mostFrequent(saidaCounts),
      terminalSaidaCount: saidaCounts[mostFrequent(saidaCounts)],
      totalTickets: totalTickets
    };
  };
   
  
  
  // No seu useEffect, após fetchData, adicione:
  useEffect(() => {
    if (data.length > 0) {
      const averages = calculateAverages(data);
      setAverages(averages);
    }
  }, [data]);

    // Função para validar a placa no padrão Brasil/Mercosul
    const validatePlaca = (value) => {
      const regex = /^[A-Z]{3}-\d{4}$|^[A-Z]{3}-\d{1}[A-Z]{1}\d{2}$/; // Regex para LLL-NNNN ou LLL-NLNN
      return regex.test(value.toUpperCase());
    };
  
    // Atualiza o valor e valida a placa
    const handlePlacaChange = (e) => {
      const value = e.target.value.toUpperCase();
      setPlaca(value);
      setPlacaError(!validatePlaca(value) && value !== ''); // Erro se não for válida e não estiver vazia
    };
  

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Typography variant="h6" align="center" gutterBottom>
        Validações Hiper
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', gap: 2, mb: 2 }}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography sx={{display: 'flex', alignItems: 'center', gap: '15px'}}>Filtros <FilterAltIcon /></Typography>
        </AccordionSummary>
        <AccordionDetails>
        <Box>
          <Box sx={{display: 'flex', alignItems: 'end', justifyContent: 'start', gap: '15px', flexWrap: 'wrap'}}>
             <TextField
    
            label="Ticket"
            value={ticket}
            onChange={(e) => setTicket(e.target.value)}
            sx={{width: {xs: '100%', sm: '100%', md: '170px'}}}
          />
          <TextField    
            label="Placa"
            value={placa}
            onChange={handlePlacaChange}
            error={placaError}
            sx={{width: {xs: '100%', sm: '100%', md: '170px'}}}
          />        
          <TextField
    
            label="Data Inicial"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{width: {xs: '100%', sm: '100%', md: '170px'}}}
          />
          <TextField
    
            label="Data Final"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{width: {xs: '100%', sm: '100%', md: '170px'}}}
          />
           <fieldset style={{display: 'flex', gap: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '-10px'}}>
           <legend style={{padding: '0 10px'}}>Período de validação</legend>           
            <TextField label="De" type="datetime-local" value={validacaoStart} onChange={(e) => setValidacaoStart(e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField label="Até" type="datetime-local" value={validacaoEnd} onChange={(e) => setValidacaoEnd(e.target.value)} InputLabelProps={{ shrink: true }} />
          </fieldset>
          <FormControl sx={{ width: '280px' }} margin="normal">
            <InputLabel>Ordenar por data de entrada</InputLabel>
            <Select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              label="Ordenar por data de entrada"
            >
              <MenuItem value="asc">Do mais antigo para o mais recente</MenuItem>
              <MenuItem value="desc">Do mais recente para o mais antigo</MenuItem>
            </Select>
          </FormControl>
          </Box>         
          <Box sx={{display: 'flex', alignItems: 'end', justifyContent: 'start', gap: '15px', flexWrap: 'wrap', paddingTop: '15px'}}>          
          
            <Tooltip sx={{width: {xs: '100%', sm: '100%', md: '180px'}}} arrow title="Aplicar Filtro">
              <Button variant="contained" onClick={handleApplyFilter} startIcon={<FilterAltIcon />}>Filtrar</Button>
            </Tooltip>
            <Tooltip sx={{width: {xs: '100%', sm: '100%', md: '180px'}}} arrow title="Limpar Filtro">
              <Button variant="outlined" onClick={handleClearFilter} startIcon={<FilterAltOffIcon />}>Limpar</Button>
            </Tooltip>
            <Tooltip sx={{width: {xs: '100%', sm: '100%', md: '180px'}}} arrow title="Gerar Relatório">
              <Button variant="contained" color="secondary" onClick={generatePDF} startIcon={<TextSnippetIcon />}>Relatório</Button>
            </Tooltip>
        
          </Box>
         
        </Box>
        </AccordionDetails>
      </Accordion>      

        <Box sx={{display: 'flex', justifyContent: 'start', gap: '15px', flexWrap: 'wrap'}}>
          <Card elevation={3} sx={{minWidth: '150px', width:{xs: '100%', sm: '100%', md: '150px'}}}>
            <CardContent>
            <Typography variant='caption'>Total de Tickets</Typography>
            <Typography variant='h6'>{averages.totalTickets?.toLocaleString('pt-BR')}</Typography>
            </CardContent>
          </Card>
          <Card elevation={3} sx={{minWidth: '150px', width:{xs: '100%', sm: '100%', md: '150px'}}}>
            <CardContent>
            <Typography variant='caption'>Permanência média</Typography>
            <Typography variant='h6'>{formatPermanencia(Math.ceil(averages.mediaPermanencia)) || 0}</Typography>
            </CardContent>
          </Card>
          <Card elevation={3} sx={{minWidth: '150px', width:{xs: '100%', sm: '100%', md: '150px'}}}>
            <CardContent>
            <Typography variant='caption'>Tempo médio desc</Typography>
            <Typography variant='h6'>{formatPermanencia(Math.ceil(averages.mediaTempodesc)) || 0}</Typography>
            </CardContent>
          </Card>
          <Card elevation={3} sx={{minWidth: '150px', width:{xs: '100%', sm: '100%', md: '150px'}}}>
            <CardContent>
            <Typography variant='caption'>Valor médio desc</Typography>
            <Typography variant='h6'>R$ {averages.mediaValordesc?.toFixed(2)}</Typography>
            </CardContent>
          </Card>
          <Card elevation={3} sx={{minWidth: '150px', width:{xs: '100%', sm: '100%', md: '150px'}}}>
            <CardContent>
            <Typography variant='caption'>Média de Valor</Typography>
            <Typography variant='h6'>R$ {averages.mediaFaixaValor?.toFixed(2)}</Typography>
            </CardContent>
          </Card>
          <Card elevation={3} sx={{minWidth: '150px', width:{xs: '100%', sm: '100%', md: '270px'}}}>
            <CardContent>
            <Typography variant='caption'>Terminal de Entrada Mais Utilizado</Typography>
            <Typography variant='h6'>{averages.terminalEntradaMaisUtilizado || 'N/A'}</Typography>
            <Box sx={{display: 'flex', justifyContent: 'end'}}>
              <Typography variant='caption'>{averages.terminalEntradaCount?.toLocaleString('pt-BR') || 0} acessos</Typography>
            </Box>            
            </CardContent>
          </Card>
          <Card elevation={3} sx={{minWidth: '150px', width:{xs: '100%', sm: '100%', md: '270px'}}}>
            <CardContent>
            <Typography variant='caption'>Terminal de Saída Mais Utilizado</Typography>
            <Typography variant='h6'>{averages.terminalSaidaMaisUtilizado || 'N/A'}</Typography>
            <Box sx={{display: 'flex', justifyContent: 'end'}}>
              <Typography variant='caption'>{averages.terminalSaidaCount?.toLocaleString('pt-BR') || 0} acessos</Typography>
            </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <DataGrid
        sx={{display: {xs: 'none', sm: 'none', md: 'flex'}}}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        rows={data.filter(row => row.ticket !== '100')}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        disableRowSelectionOnClick
        getRowId={(row) => row.ticket}
      />  

      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={open}
        onClick={handleClose}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
       {/* Snackbar for messages */}
       <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default ValidacaoHiper;
