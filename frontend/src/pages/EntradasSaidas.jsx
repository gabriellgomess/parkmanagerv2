import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, Tooltip, Backdrop, Card, CardContent, Snackbar, Alert, Slider, Accordion, AccordionSummary, AccordionDetails, FormControlLabel, Checkbox, Popover, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';
import AuthContext from '../context/AuthContext';
import { useParams } from 'react-router-dom';

const EntradasSaidas = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ticket, setTicket] = useState('');
  const [placa, setPlaca] = useState('');
  const [open, setOpen] = useState(false);
  const [averages, setAverages] = useState({});
  const [stats, setStats] = useState({});
  const [veiculosNoPatio, setVeiculosNoPatio] = useState(false);
  const [saidaHiper, setSaidaHiper] = useState(false);
  const [order, setOrder] = useState('desc');
  // const hostname = window.location.hostname;
  // const port = window.location.port; 
  // const ip = port ? `${hostname}:${port}` : hostname;

  const [rangeHours, setRangeHours] = useState([0, 1440]);
  const { setores, ip } = useContext(AuthContext);

  const [setorSelecionado, setSetorSelecionado] = useState('todos');

  // States for Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const [anchorEl, setAnchorEl] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const openPopover = Boolean(anchorEl);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  // Close Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleRangeHours = (event, newValue) => {
    setRangeHours(newValue);
  }

  const fetchData = (start = '', end = '', ticket = '', placa = '', order = '', permanenciaInicial = 0, permanenciaFinal = 1440, setorSelecionado) => {
    handleOpen();
    const params = {
        ...(start && { dataA: start }),
        ...(end && { dataB: end }),
        ...(ticket && { ticket }),
        ...(placa && { placa }),
        ...(order && { order }),
        ...(permanenciaInicial !== 0 || permanenciaFinal !== 1440 ? { permanenciaInicial, permanenciaFinal } : {}),
        veiculosNoPatio,
        saidaHiper,
        setorSelecionado
    };

    axios.get(`http://${ip}/api/entradas-saidas`, {
        params,
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
    })
    .then(response => {
        handleClose();
        setData(response.data);
    })
    .catch(error => {
        handleClose();
        console.error("Erro ao buscar os dados:", error);
    });
};

  

  useEffect(() => {
    fetchData();
  }, []);

  const formatData = (data) => {
    if (!data) return "N/A";
    const [date, time] = data.split(' ');
    return `${date.split('-').reverse().join('/')} ${time}`;
  };

  const formatPermanencia = (minutos) => {
    if (!minutos && minutos !== 0) return "N/A";
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const calculateAverages = (data) => {
    const totalPermanencia = data.reduce((sum, row) => sum + (row.etstickets_permanencia || 0), 0);
    const totalTickets = data.length;

    return {
      mediaPermanencia: totalPermanencia / totalTickets,
      totalTickets: totalTickets
    };
  };

  useEffect(() => {
    if (data.length > 0) {
      const averages = calculateAverages(data);
      setAverages(averages);
    }
  }, [data]);

  const generatePDF = () => {
    handleOpen();
    const doc = new jsPDF('landscape');
    doc.text("Relatório de Entradas e Saídas", 14, 10);
    // set font size
    doc.setFontSize(10);
    doc.text(filterMessage, 14, 15);
    doc.setFontSize(12);


    const mediaData = [
      ["Total de Tickets", averages.totalTickets],
      ["Tempo médio de Permanência", formatPermanencia(Math.ceil(averages.mediaPermanencia) || 0)],
      ["Entrada mais utilizada", stats.mostUsedEteticketsDesc || 'N/A'],
      ["Saída mais utilizada", stats.mostUsedEtsticketsDesc || 'N/A'],
      ["Placas capturadas", `${stats.platePercentage || '0'}%`],
      ["Veículos que saíram", `${stats.exitPercentage || '0'}%`],
      ["Saíram com Hiper", `${stats.withHiperPercentage || '0'}%`],
      ["Saíram sem Hiper", `${stats.withoutHiperPercentage || '0'}%`]
    ];

    doc.autoTable({
      head: [["Descrição", "Valor"]],
      body: mediaData,
      startY: 20,
      theme: 'grid'
    });

    const tableData = data.map(row => ([
      row.etetickets_ticket,
      row.etetickets_placa || 'Sem captura',
      formatData(row.etetickets_entrada),
      row.etetickets_descricao || 'N/A',
      formatData(row.etstickets_saida),
      row.etstickets_descricao || 'N/A',
      formatPermanencia(row.etstickets_permanencia),
      row.etstickets_saiucomhiper ? 'Sim' : 'Não'
    ]));

    doc.autoTable({
      head: [['Ticket', 'Placa', 'Entrada', 'Terminal Entrada', 'Saída', 'Terminal Saída', 'Permanência', 'Saiu com Hiper']],
      body: tableData,
      startY: doc.autoTable.previous.finalY + 10,
      theme: 'grid'
    });

    doc.save('entradas_saidas.pdf');
    handleClose();
  };

  const handleApplyFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      setSnackbarMessage('Data Inicial não pode ser maior que Data Final');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (startDate && endDate && end.diff(start, 'day') > 31) {
      setSnackbarMessage('O período de busca não pode exceder 31 dias.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (rangeHours[0] > rangeHours[1]) {
      setSnackbarMessage('O tempo de permanência inicial não pode ser maior que o tempo final.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    fetchData(
      startDate ? `${startDate} 00:00:00` : '',
      endDate ? `${endDate} 23:59:59` : '',
      ticket,
      placa,
      order,
      rangeHours[0],
      rangeHours[1],
      setorSelecionado


    );
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setTicket('');
    setPlaca('');
    setRangeHours([0, 1440]);
    setStats({});
    setAverages({});
    window.location.reload();  
  };

  const columns = [
    { field: 'etetickets_ticket', headerName: 'Ticket', width: 100, sortable: false, filterable: false },
    { field: 'etetickets_placa', headerName: 'Placa', width: 100, sortable: false, filterable: false },
    { field: 'etetickets_entrada', headerName: 'Entrada', width: 150, sortable: false, filterable: false, renderCell: (params) => <span>{formatData(params.row.etetickets_entrada)}</span> },
    { field: 'etetickets_setor', headerName: 'Setor', width: 130, sortable: false, filterable: false },
    { field: 'etetickets_origemacesso', headerName: 'Modo de entrada', width: 130, sortable: false, filterable: false },
    { field: 'etetickets_descricao', headerName: 'Terminal Entrada', width: 150, sortable: false, filterable: false },
    { field: 'etstickets_saida', headerName: 'Saída', width: 150, sortable: false, filterable: false, renderCell: (params) => <span>{formatData(params.row.etstickets_saida)}</span> },
    { field: 'etstickets_origemacesso', headerName: 'Modo de saída', width: 130, sortable: false, filterable: false },
    { field: 'etstickets_descricao', headerName: 'Terminal Saída', width: 150, sortable: false, filterable: false },
    { field: 'etstickets_permanencia', headerName: 'Permanência', width: 100, sortable: false, filterable: false, renderCell: (params) => <span>{formatPermanencia(params.row.etstickets_permanencia)}</span> },
    { field: 'etstickets_saiucomhiper', headerName: 'Saida Hiper', width: 100, sortable: false, filterable: false, renderCell: (params) => <span>{params.row.etstickets_saiucomhiper ? 'Sim' : 'Não'}</span> },
    { field: 'etetickets_mensal', headerName: 'Credenciado', width: 100, sortable: false, filterable: false, renderCell: (params) => <span>{params.row.etetickets_mensal == 'T' ? 'Sim' : 'Não'}</span> }
  ];

  const calculateStatistics = (data) => {
    const eteticketsDescCount = {};
    const eteticketsOrigemCount = {};
    const etsticketsDescCount = {};
    let totalVehicles = data.length;
    let vehiclesExited = 0;
    let vehiclesWithPlate = 0;
    let withHiper = 0; // Contador para saídas com hiper
    let withoutHiper = 0; // Contador para saídas sem hiper
  
    data.forEach(row => {
      eteticketsDescCount[row.etetickets_descricao] = (eteticketsDescCount[row.etetickets_descricao] || 0) + 1;
      eteticketsOrigemCount[row.etetickets_origemacesso] = (eteticketsOrigemCount[row.etetickets_origemacesso] || 0) + 1;
      if (row.etstickets_descricao) {
        etsticketsDescCount[row.etstickets_descricao] = (etsticketsDescCount[row.etstickets_descricao] || 0) + 1;
        vehiclesExited += 1;
      }
      if (row.etetickets_placa) {
        vehiclesWithPlate += 1;
      }
      // Incrementa com base na saída com hiper ou não      
      if (row.etstickets_saiucomhiper) {
        withHiper += 1;
      } else {
        withoutHiper += 1;
      }
    });
  
    const mostUsedEteticketsDesc = Object.keys(eteticketsDescCount).reduce((a, b) => eteticketsDescCount[a] > eteticketsDescCount[b] ? a : b, '');
    const mostUsedEtsticketsDesc = Object.keys(etsticketsDescCount).reduce((a, b) => etsticketsDescCount[a] > etsticketsDescCount[b] ? a : b, '');
  
    const exitPercentage = ((vehiclesExited / totalVehicles) * 100).toFixed(2);
    const platePercentage = ((vehiclesWithPlate / totalVehicles) * 100).toFixed(2);
    const withHiperPercentage = ((withHiper / totalVehicles) * 100).toFixed(2); // Porcentagem dos que saíram com hiper
    const withoutHiperPercentage = ((withoutHiper / totalVehicles) * 100).toFixed(2); // Porcentagem dos que saíram sem hiper
  
    return {
      mostUsedEteticketsDesc,
      mostUsedEteticketsDescCount: eteticketsDescCount[mostUsedEteticketsDesc],
      mostUsedEtsticketsDesc,
      mostUsedEtsticketsDescCount: etsticketsDescCount[mostUsedEtsticketsDesc],
      exitPercentage,
      platePercentage,
      withHiper,
      withHiperPercentage,
      withoutHiper,
      withoutHiperPercentage
    };
  };
  
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };
  
  

  useEffect(() => {
    if (data.length > 0) {
      setStats(calculateStatistics(data));
    }
  }, [data]);

// Função para verificar se algum filtro foi aplicado
const isFilterApplied = () => {
  return startDate || endDate || ticket || placa || rangeHours[0] !== 0 || rangeHours[1] !== 1440;
};

// Mensagem condicional para os dados exibidos
const filterMessage = isFilterApplied()
  ? `Dados referente a ${startDate ? `Data Inicial: ${startDate.split('-').reverse().join('/')} ` : ''}${endDate ? `Data Final: ${endDate.split('-').reverse().join('/')} ` : ''}${ticket ? `Ticket: ${ticket} ` : ''}${placa ? `Placa: ${placa} ` : ''}${rangeHours[0] !== 0 || rangeHours[1] !== 1440 ? `Permanência entre ${formatTime(rangeHours[0])} - ${formatTime(rangeHours[1])}` : ''}`
  : "Dados referente ao dia de hoje";
const textTooltip = () => {
  return(
    <h3>Teste texto h3</h3>
  )
}

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Typography variant="h6" align="center" gutterBottom>
        Entradas e Saídas
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
           <Box sx={{display: 'flex', alignItems: 'end', justifyContent: 'start', gap: '15px', flexWrap: 'wrap'}}>
          <TextField  label="Ticket" value={ticket} onChange={(e) => setTicket(e.target.value)} sx={{width: {xs: '100%', sm: '100%', md: '170px'}}} />
          <TextField  label="Placa" value={placa} onChange={(e) => setPlaca(e.target.value)} sx={{width: {xs: '100%', sm: '100%', md: '170px'}}} />
          <TextField  label="Data Inicial" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{width: {xs: '100%', sm: '100%', md: '170px'}}} />
          <TextField  label="Data Final" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{width: {xs: '100%', sm: '100%', md: '170px'}}} />
          <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'start', marginLeft: '20px'}}>
              <Typography variant="caption">Tempo de permanência: {formatTime(rangeHours[0])} - {formatTime(rangeHours[1])}</Typography>
            <Slider
            label="Horas"
              value={rangeHours}
              onChange={handleRangeHours}
              valueLabelDisplay="auto"
              aria-labelledby="range-slider"
              getAriaValueText={(value) => `${value}h`}
              min={0}
              max={1440}
              step={1}
              marks={[
                { value: 0, label: '0 min' },
                { value: 1440, label: '1.440 min (24h)' }
              ]}
              sx={{width: {xs: '100%', sm: '100%', md: '300px'}, marginBottom: {xs: '15px', sm: '15px', md: '-3px'}}}
            />
            </Box>
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
          <Box sx={{display: 'flex', alignItems: 'end', justifyContent: 'start', gap: '15px', flexWrap: 'wrap'}}>
          <FormControl sx={{ width: '280px' }} margin="normal">
            <InputLabel>Setor</InputLabel>
            <Select
              value={setorSelecionado}
              onChange={(e) => setSetorSelecionado(e.target.value)}
              label="Setor"
            >
              {/* Opção de TODOS */}
              <MenuItem value="todos">TODOS</MenuItem>

              {/* Opções dinâmicas */}
              {setores?.map((setor) => (
                <MenuItem key={setor.nome} value={setor.nome}>{setor.nome}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel 
            control={<Checkbox checked={veiculosNoPatio} onChange={(e) => setVeiculosNoPatio(e.target.checked)} />} 
            label="Veículos no pátio" 
          />
          <FormControlLabel 
            control={<Checkbox checked={saidaHiper} onChange={(e) => setSaidaHiper(e.target.checked)} />} 
            label="Saída Híper" 
          />

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
        </AccordionDetails>
      </Accordion>        
      
      <Box sx={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Typography variant='body1'>{filterMessage}</Typography>        
        <InfoIcon 
          color='info'
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
          aria-owns={open ? 'mouse-over-popover' : undefined}
          aria-haspopup="true"
          sx={{cursor: 'pointer', marginRight: '30px'}}

        />
        <Popover
              id="mouse-over-popover"
              sx={{ pointerEvents: 'none' }}
              open={openPopover}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              onClose={handlePopoverClose}
              disableRestoreFocus
            >
              <Box sx={{maxWidth: '400px', padding: '15px'}}>
                <Typography><span style={{fontWeight: 'bold'}}>Carregamento Inicial: </span>Mostra dados dos últimos 7 dias automaticamente.</Typography>
                <Typography><span style={{fontWeight: 'bold'}}>Busca por Ticket ou Placa: </span>Mostra o resultado independente da data.</Typography>
                <Typography><span style={{fontWeight: 'bold'}}>Busca por Tempo de Permanência, Veículos no Pátio ou Saída Hiper: </span>Mostra dados dos últimos 31 dias, caso seja informada uma data inicial e final, será respeitado o período informado (máximo de 31 dias).</Typography>
              </Box>              
          </Popover>     
        
      </Box>


      <Box sx={{display: 'flex', justifyContent: 'start', gap: '15px', flexWrap: 'wrap'}}>
          <Card elevation={3} sx={{width:{xs: '100%', sm: '100%', md: 'fit-content'}}}>
            <CardContent>
            <Typography variant='caption'>Entrada mais utilizada</Typography>
            <Typography variant='subtitle1'>{stats.mostUsedEteticketsDesc || 'N/A'}</Typography>
            <Box sx={{display: 'flex', justifyContent: 'end'}}>
              <Typography variant='caption'>{(stats.mostUsedEteticketsDescCount || 0).toLocaleString('pt-BR')} acessos</Typography>
            </Box>
            </CardContent>
          </Card>
          <Card elevation={3} sx={{width:{xs: '100%', sm: '100%', md: 'fit-content'}}}>
            <CardContent>
            <Typography variant='caption'>Saída mais utilizada</Typography>
            <Typography variant='subtitle1'>{stats.mostUsedEtsticketsDesc || 'N/A'}</Typography>
            <Box sx={{display: 'flex', justifyContent: 'end'}}>
              <Typography variant='caption'>{(stats.mostUsedEtsticketsDescCount || 0).toLocaleString('pt-BR')} acessos</Typography>
            </Box>
            </CardContent>
          </Card>
          <Card elevation={3} sx={{minWidth: '150px', width:{xs: '100%', sm: '100%', md: '150px'}}}>
            <CardContent>
            <Typography variant='caption'>Placas Capturadas</Typography>
            <Typography variant='h6'>{stats.platePercentage || '0'}%</Typography>
            </CardContent>
          </Card>
          <Card elevation={3} sx={{minWidth: '150px', width:{xs: '100%', sm: '100%', md: '150px'}}}>
            <CardContent>
            <Typography variant='caption'>Veículos que saíram</Typography>
            <Typography variant='h6'>{stats.exitPercentage || '0'}%</Typography>
            </CardContent>
          </Card>
          <Card elevation={3} sx={{minWidth: '150px', width:{xs: '100%', sm: '100%', md: '150px'}}}>
            <CardContent>
            <Typography variant='caption'>Total de Tickets</Typography>
            <Typography variant='h6'>{(averages.totalTickets || 0).toLocaleString('pt-BR')}</Typography>
            </CardContent>
          </Card>
          <Card elevation={3} sx={{minWidth: '150px', width:{xs: '100%', sm: '100%', md: '150px'}}}>
            <CardContent>
            <Typography variant='caption'>Permanência média</Typography>
            <Typography variant='h6'>{formatPermanencia(Math.ceil(averages.mediaPermanencia) || 0)}</Typography>
            </CardContent>
          </Card>
          <Card elevation={3} sx={{ minWidth: '150px', width: { xs: '100%', sm: '100%', md: '150px' } }}>
            <CardContent>
              <Typography variant='caption'>Saíram com Hiper</Typography>
              <Typography variant='h6'>{(stats.withHiper || 0).toLocaleString('pt-BR')}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                <Typography variant='caption'>{stats.withHiperPercentage || '0'}%</Typography>
              </Box>
            </CardContent>
          </Card>
          <Card elevation={3} sx={{ minWidth: '150px', width: { xs: '100%', sm: '100%', md: '150px' } }}>
            <CardContent>
              <Typography variant='caption'>Saíram sem Hiper</Typography>
              <Typography variant='h6'>{(stats.withoutHiper || 0).toLocaleString('pt-BR')}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                <Typography variant='caption'>{stats.withoutHiperPercentage || '0'}%</Typography>
              </Box>
            </CardContent>
          </Card>


          

        </Box>
        </Box>
      
        <DataGrid
          sx={{display: {xs: 'none', sm: 'none', md: 'flex'}, fontSize: {xs: '10px', sm: '10px', md: '12px'}}}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          rows={data.filter(row => row.ticket !== '100' && row.etetickets_mensal !== 'T')}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50, data.length]}
          disableRowSelectionOnClick
          getRowId={(row) => `${row.etetickets_ticket}-${row.etetickets_entrada}-${row.etstickets_saida}`}
          disableColumnMenu
        />


      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open} onClick={handleClose}>
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

export default EntradasSaidas;
