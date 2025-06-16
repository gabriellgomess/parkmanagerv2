import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import AuthContext from '../context/AuthContext';

const Pagamentos = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ticket, setTicket] = useState('');
  const [placa, setPlaca] = useState('');
  const [placaError, setPlacaError] = useState(false);
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [status_pagamento, setStatusPagamento] = useState('todos');
  const [desconto, setDesconto] = useState('todos');
  const [order, setOrder] = useState('desc');
  const [tarifas, setTarifas] = useState([]);
  const [tarifaSelecionada, setTarifaSelecionada] = useState('todas');
  const [nomeDesconto, setNomeDesconto] = useState('');
  const [descontosDisponiveis, setDescontosDisponiveis] = useState([]);
  const { ip } = useContext(AuthContext);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSnackbarClose = () => setSnackbarOpen(false);

  // Buscar tarifas disponíveis
  const fetchTarifas = () => {
    axios
      .get(`http://${ip}/api/tarifas`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        // Extrair nomes de tarifas únicos do conjunto de dados
        if (response.data && response.data.length > 0) {
          const tarifasUnicas = [...new Set(response.data.map(item => item.nometarifa))].filter(Boolean);
          setTarifas(tarifasUnicas.sort());
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar tarifas:', error);
        setSnackbarMessage('Erro ao buscar tarifas disponíveis');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };
  
  // Função alternativa para extrair tarifas dos dados
  const extrairTarifasDosResultados = (dados) => {
    if (dados && dados.length > 0) {
      const tarifasUnicas = [...new Set(dados.map(item => item.nometarifa))].filter(Boolean);
      if (tarifasUnicas.length > 0) {
        setTarifas(tarifasUnicas.sort());
      }
    }
  };

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

  const fetchData = () => {
    if (placaError) {
      alert('Placa inválida, digite no formato LLL-NNNN ou LLL-NLNN');
      return;
    }

    handleOpen();
    axios
      .get(`http://${ip}/api/pagamentos`, {
        params: {
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
          ...(ticket && { ticket }),
          ...(placa && { placa }),
          ...(status_pagamento == 'todos' ? { status_pagamento: null } : { status_pagamento }),
          ...(desconto == 'todos' ? { desconto: null } : { desconto }),
          ...(tarifaSelecionada !== 'todas' ? { nometarifa: tarifaSelecionada } : {}),
          ...(nomeDesconto && { nome_desconto: nomeDesconto }),
          ...(order && { order }),
        },
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        handleClose();
        setData(response.data);
        calculateStats(response.data);
        
        // Se ainda não temos tarifas, vamos extraí-las dos resultados
        if (tarifas.length === 0) {
          extrairTarifasDosResultados(response.data);
        }
      })
      .catch((error) => {
        handleClose();
        setSnackbarMessage('Erro ao buscar os dados');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        console.error(error);
      });
  };

  const calculateStats = (data) => {
    const totalRecords = data.length;
    const totalValuePaid = data.reduce((sum, row) => sum + parseFloat(row.valorpago || 0), 0);
    const totaDiscount = data.reduce((sum, row) => sum + parseFloat(row.desconto || 0), 0);

    // Calcular valor médio pago
    const averageValuePaid = totalValuePaid / totalRecords || 0;
    const averageValueDiscount = totaDiscount / totalRecords || 0;

  
    // Contar formas de pagamento
    const paymentMethods = data.reduce((acc, row) => {
      const method = row.descformadepagamento || 'Desconhecido';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});
  
    // Encontrar a forma de pagamento mais usada
    const mostUsedPaymentMethod = Object.keys(paymentMethods).reduce((a, b) => (paymentMethods[a] > paymentMethods[b] ? a : b), '');
    const mostUsedPaymentMethodCount = paymentMethods[mostUsedPaymentMethod] || 0;
    const mostUsedPaymentMethodPercentage = ((mostUsedPaymentMethodCount / totalRecords) * 100).toFixed(2);
  
    setStats({
        totalRecords,
        totalValuePaid: totalValuePaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        totaDiscount: parseFloat(totaDiscount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        mostUsedPaymentMethod,
        mostUsedPaymentMethodCount,
        mostUsedPaymentMethodPercentage,
        averageValuePaid: averageValuePaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        averageValueDiscount: averageValueDiscount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    });
  };
  
  
  
  const formatDate = (date) => {
    // format yyyy-mm-dd hh:mm:ss to dd/mm/yyyy hh:mm:ss
    const [datePart, timePart] = date.split(' ');
    return datePart.split('-').reverse().join('/') + ' ' + timePart;
};

  // Buscar descontos disponíveis
  const fetchDescontos = () => {
    axios
      .get(`http://${ip}/api/descontos`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        if (response.data && response.data.length > 0) {
          setDescontosDisponiveis(response.data);
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar descontos:', error);
        setSnackbarMessage('Erro ao buscar descontos disponíveis');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };

  useEffect(() => {
    fetchData();
    fetchTarifas();
    fetchDescontos();
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF('landscape');
    doc.text('Relatório de Pagamentos', 14, 10);

    const statsData = [
      ['Total de Registros', stats.totalRecords || 0],
      ['Valor Total Pago', stats.totalValuePaid || '0,00'],
      ['Valor Médio Pago', stats.averageValuePaid || '0,00'],
      ['Total de Descontos', stats.totaDiscount || 0],
      ['Valor Médio Desconto', stats.averageValueDiscount || '0,00'],
      ['Forma de Pagamento Mais Usada', stats.mostUsedPaymentMethod || 'Desconhecido'],
      ['Quantidade', stats.mostUsedPaymentMethodCount || 0],
      ['Porcentagem', stats.mostUsedPaymentMethodPercentage || '0,00%'],      
    ];

    doc.autoTable({
      head: [['Descrição', 'Valor']],
      body: statsData,
      startY: 20,
    });

    const tableData = data.map((row) => [
        row.ticket,
        row.placa,
        formatDate(row.datahoraentrada),
        formatDate(row.datahorasaida),        
        row.valorpago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        row.valorrecebido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        row.desconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        row.nome_desconto || '-',
        // row.valor_descontado ? row.valor_descontado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-',
        row.descformadepagamento,
        row.nometarifa,        
        row.operador
    ]);

    doc.autoTable({
      head: [
        [
            'Ticket',
            'Placa',
            'Entrada',
            'Saída',            
            'Valor Pago',
            'Valor Recebido',
            'Desconto',
            'Nome Desconto',
            // 'Valor Descontado',
            'Forma de Pagamento',
            'Tarifa',            
            'Operador'
        ],
      ],
      body: tableData,
      startY: doc.autoTable.previous.finalY + 10,
    });

    doc.save('pagamentos.pdf');
  };

  const columns = [
    { field: 'ticket', headerName: 'Ticket', width: 120, sortable: false, filterable: false },
    { field: 'placa', headerName: 'Placa', width: 120, sortable: false, filterable: false },
    { field: 'datahoraentrada', headerName: 'Entrada', width: 200, sortable: false, filterable: false, renderCell: (params) => formatDate(params.value)},
    { field: 'datahorasaida', headerName: 'Saída', width: 200, sortable: false, filterable: false, renderCell: (params) => formatDate(params.value)},    
    {
        field: 'valorpago',
        headerName: 'Valor Pago',
        width: 150,
        sortable: false, filterable: false,
        renderCell: (params) => parseFloat(params.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    },
    {
        field: 'valorrecebido',
        headerName: 'Valor Recebido',
        width: 150,
        sortable: false, filterable: false,
        renderCell: (params) => parseFloat(params.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    },
    { 
        field: 'desconto', 
        headerName: 'Desconto', 
        width: 100,
        sortable: false, filterable: false,
        renderCell: (params) => parseFloat(params.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    },
    { 
        field: 'nome_desconto', 
        headerName: 'Nome Desconto', 
        width: 150, 
        sortable: false, 
        filterable: false,
        renderCell: (params) => params.value || '-'
    },
    // { 
    //     field: 'valor_descontado', 
    //     headerName: 'Valor Descontado', 
    //     width: 150, 
    //     sortable: false, 
    //     filterable: false,
    //     renderCell: (params) => params.value ? parseFloat(params.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'
    // },
    { field: 'descformadepagamento', headerName: 'Forma de Pagamento', width: 250, sortable: false, filterable: false },    
    { field: 'nometarifa', headerName: 'Tarifa', width: 150, sortable: false, filterable: false },    
    { field: 'operador', headerName: 'Operador', width: 150, sortable: false, filterable: false },
  ];

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setTicket('');
    setPlaca('');
    setStatusPagamento('todos');
    setDesconto('todos');
    setTarifaSelecionada('todas');
    setNomeDesconto('');
    setOrder('desc');
    fetchData();
  }
  

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h6" align="center" gutterBottom>
        Pagamentos
      </Typography>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography sx={{display: 'flex', alignItems: 'center', gap: '15px'}}>Filtros <FilterAltIcon /></Typography>
        </AccordionSummary>
        <AccordionDetails>
        <Box sx={{ gap: 2, mb: 2 }}>
          <Box sx={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
            <TextField              
              label="Ticket"
              type="text"
              value={ticket}
              onChange={(e) => setTicket(e.target.value)}
            />
             <TextField              
              label="Placa"
              type="text"
              value={placa}
              error={placaError}
              onChange={handlePlacaChange}
            />
            <FormControl sx={{ width: '250px' }}>
                <InputLabel>Nome do Desconto</InputLabel>
                <Select
                value={nomeDesconto}
                onChange={(e) => setNomeDesconto(e.target.value)}
                label="Nome do Desconto"
                >
                <MenuItem value="">Todos</MenuItem>
                {descontosDisponiveis.map((desconto) => (
                  <MenuItem key={desconto.nome} value={desconto.nome}>{desconto.nome}</MenuItem>
                ))}
                </Select>
            </FormControl>
            <TextField              
              label="Data Inicial"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField              
              label="Data Final"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl sx={{ width: '250px' }}>
                <InputLabel>Modalidade</InputLabel>
                <Select
                value={status_pagamento}
                onChange={(e) => setStatusPagamento(e.target.value)}
                label="Modalidade"
                >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="pago">Pago</MenuItem>
                <MenuItem value="abonado">Abonado</MenuItem>
                </Select>
            </FormControl>
            <FormControl sx={{ width: '250px' }}>
                <InputLabel>Desconto</InputLabel>
                <Select
                value={desconto}
                onChange={(e) => setDesconto(e.target.value)}
                label="Desconto"
                >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="true">Sim</MenuItem>
                <MenuItem value="false">Não</MenuItem>
                </Select>
            </FormControl>
            <FormControl sx={{ width: '250px' }}>
                <InputLabel>Tarifa</InputLabel>
                <Select
                value={tarifaSelecionada}
                onChange={(e) => setTarifaSelecionada(e.target.value)}
                label="Tarifa"
                >
                <MenuItem value="todas">Todas</MenuItem>
                {tarifas.map((tarifa) => (
                  <MenuItem key={tarifa} value={tarifa}>{tarifa}</MenuItem>
                ))}
                </Select>
            </FormControl>
            <FormControl sx={{ width: '320px' }}>
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
          <Button variant="contained" onClick={fetchData} startIcon={<FilterAltIcon />}>
          Filtrar
        </Button>
        <Button variant="outlined" onClick={handleClearFilter} startIcon={<FilterAltIcon />}>
          Limpar
        </Button>
        <Button variant="contained" color="secondary" onClick={generatePDF} startIcon={<TextSnippetIcon />}>
          Gerar Relatório
        </Button>
        </Box>
        
      </Box>
        </AccordionDetails>
      </Accordion>      

      <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 4, flexWrap: 'wrap' }}>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6">Total Registros</Typography>
            <Typography>{(stats.totalRecords || 0).toLocaleString('pt-BR')}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6">Valor Total Pago</Typography>
            <Typography>{stats.totalValuePaid || '0,00'}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6">Valor Médio Pago</Typography>
            <Typography>{stats.averageValuePaid || '0,00'}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
            <CardContent>
                <Typography variant="h6">Total de Descontos</Typography>
                <Typography>{stats.totaDiscount || 0}</Typography>
            </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
            <CardContent>
                <Typography variant="h6">Valor Médio Desconto</Typography>
                <Typography>{stats.averageValueDiscount || '0,00'}</Typography>
            </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
            <CardContent>
            <Typography variant="h6">Forma Pgto Mais Usada</Typography>
            <Typography>{stats.mostUsedPaymentMethod || 'Desconhecido'}</Typography>
            <Typography>
                {(stats.mostUsedPaymentMethodCount || 0).toLocaleString('pt-BR')} ({stats.mostUsedPaymentMethodPercentage || '0.00'}%)
            </Typography>
            </CardContent>
        </Card>
      </Box>

      <DataGrid
        rows={data}
        columns={columns}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        getRowId={(row) => row.ticket}
        autoHeight
      />

      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Pagamentos;
