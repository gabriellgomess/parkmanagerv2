import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import HistoryIcon from '@mui/icons-material/History';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButton, Modal, Box, CircularProgress, Typography, Button, Tooltip, TextField, Backdrop, Accordion, AccordionSummary, AccordionDetails, Slider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useParams } from 'react-router-dom';

const Credenciados = () => {
    const [credenciados, setCredenciados] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [cartao, setCartao] = useState('');
    const [cartaoHistory, setCartaoHistory] = useState('');
    const [credenciadoHistory, setCredenciadoHistory] = useState('');
    const [nome, setNome] = useState('');
    const [placa, setPlaca] = useState('');
    const [placaError, setPlacaError] = useState(false);
    const [open, setOpen] = useState(false);
    const [entrada, setEntrada] = useState('');   
    const [saida, setSaida] = useState('');
    const [rangeHours, setRangeHours] = useState([0, 1440]);
    const [order, setOrder] = useState('desc');
    const { ip } = useContext(AuthContext);


    const handleRangeHours = (event, newValue) => {
        setRangeHours(newValue);
    };

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      };

    const handleClose = () => {
        setOpen(false);
    };

    const fetchData = async () => {
        if (placaError) {
        alert('Placa inválida, digite no formato LLL-NNNN ou LLL-NLNN');
        return;
        }
        setOpen(true);
        const response = await axios.get(`http://${ip}/api/credenciados`, {
            params: { cartao, nome, placa },
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            }
        });
        setCredenciados(response.data);
        setOpen(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        { field: 'cartao', headerName: 'Cartao', width: 100, sortable: false, filterable: false },
        { field: 'nome', headerName: 'Nome', width: 250, sortable: false, filterable: false },
        { field: 'grupo', headerName: 'Grupo', width: 100, sortable: false, filterable: false },
        { field: 'p_placa', headerName: 'Placa', width: 100, sortable: false, filterable: false },
        { field: 'p_cor', headerName: 'Cor', width: 100, sortable: false, filterable: false },
        { field: 'p_marca', headerName: 'Marca', width: 100, sortable: false, filterable: false },
        { field: 'p_modelo', headerName: 'Modelo', width: 100, sortable: false, filterable: false },
        { field: 'p_ano', headerName: 'Ano', width: 100, sortable: false, filterable: false },
        { field: 'validadeinicio', headerName: 'Validade Inicio', width: 130, renderCell: (params) => <span>{params.row.validadeinicio.split(' ')[0].split('-').reverse().join('/')}</span>, sortable: false, filterable: false },
        { field: 'validadefim', headerName: 'Validade Fim', width: 130, renderCell: (params) => <span>{params.row.validadefim.split(' ')[0].split('-').reverse().join('/')}</span>, sortable: false, filterable: false },
        { field: 'inativo', headerName: 'Status', width: 100, renderCell: (params) => <span>{params.row.inativo === 'F' ? 'Ativo' : 'Inativo'}</span>, sortable: false, filterable: false },
        { field: 'historico', headerName: 'Histórico', width: 100, renderCell: (params) => <IconButton onClick={() => handleOpenHistory(params.row.cartao, params.row.nome)} color="primary" aria-label="histórico de acesso"><HistoryIcon /></IconButton>, sortable: false, filterable: false }
      ];

    const handleOpenHistory = (tkt, nomeH) => {
        setCartaoHistory(tkt);
        setCredenciadoHistory(nomeH);
        setIsModalOpen(true);       
    }


    

    const handleGetHistory = async () => {
    setIsLoading(true);

    // Validação das datas
    if (entrada && saida && entrada > saida) {
        alert('A data de entrada não pode ser maior que a data de saída');
        setIsLoading(false);
        return;
    }

    if (entrada && !saida || !entrada && saida) {
        alert('Selecione a data de entrada e a data de saída');
        setIsLoading(false);
        return;
    }
    
    const params = {
        cartaoHistory,
        entrada,
        saida,
        order,
        ...(rangeHours[0] !== 0 || rangeHours[1] !== 1440 ? { permanenciaInicial: rangeHours[0], permanenciaFinal: rangeHours[1] } : {})
    };
    
    try {
        const response = await axios.get(`http://${ip}/api/credenciado-acessos`, {
        params,
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
        });
        setHistoryData(response.data);
    } catch (error) {
        console.error('Erro ao buscar o histórico:', error);
    } finally {
        setIsLoading(false);
    }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setHistoryData([]);
        setEntrada('');
        setSaida('');
        setRangeHours([0, 1440]);
        setCartaoHistory('');
        setCredenciadoHistory('');
    };

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

      const calculateStatistics = () => {
        const terminalEntradaCounts = {};
        const terminalSaidaCounts = {};
        const accessModeCounts = { entrada: {}, saida: {} };
        let totalPermanence = 0;
        let countPermanence = 0;
    
        historyData.forEach(row => {
            // Terminal de Entrada
            if (row.etetickets_descricao) {
                terminalEntradaCounts[row.etetickets_descricao] =
                    (terminalEntradaCounts[row.etetickets_descricao] || 0) + 1;
            }
            // Terminal de Saída
            if (row.etstickets_descricao) {
                terminalSaidaCounts[row.etstickets_descricao] =
                    (terminalSaidaCounts[row.etstickets_descricao] || 0) + 1;
            }
            // Modos de Acesso
            if (row.etetickets_origemacesso) {
                accessModeCounts.entrada[row.etetickets_origemacesso] =
                    (accessModeCounts.entrada[row.etetickets_origemacesso] || 0) + 1;
            }
            if (row.etstickets_origemacesso) {
                accessModeCounts.saida[row.etstickets_origemacesso] =
                    (accessModeCounts.saida[row.etstickets_origemacesso] || 0) + 1;
            }
            // Tempo de Permanência
            if (row.etstickets_permanencia) {
                totalPermanence += row.etstickets_permanencia;
                countPermanence++;
            }
        });
    
        const mostAccessedTerminalEntrada = Object.entries(terminalEntradaCounts).reduce(
            (a, b) => (b[1] > a[1] ? b : a),
            ['', 0]
        );
        const mostAccessedTerminalSaida = Object.entries(terminalSaidaCounts).reduce(
            (a, b) => (b[1] > a[1] ? b : a),
            ['', 0]
        );
        const mostUsedAccessModeEntrada = Object.entries(accessModeCounts.entrada).reduce(
            (a, b) => (b[1] > a[1] ? b : a),
            ['', 0]
        );
        const mostUsedAccessModeSaida = Object.entries(accessModeCounts.saida).reduce(
            (a, b) => (b[1] > a[1] ? b : a),
            ['', 0]
        );
        const averagePermanence = countPermanence ? totalPermanence / countPermanence : 0;
    
        // Tratamento para NaN nas porcentagens e no tempo médio de permanência
        const safePercentage = (value, total) =>
            isNaN(value) || isNaN(total) || total === 0 ? '0.00%' : `${((value / total) * 100).toFixed(2)}%`;
    
        return {
            terminalEntrada: `${mostAccessedTerminalEntrada[0]} (${safePercentage(mostAccessedTerminalEntrada[1], historyData.length)})`,
            terminalSaida: `${mostAccessedTerminalSaida[0]} (${safePercentage(mostAccessedTerminalSaida[1], historyData.length)})`,
            accessModeEntrada: `${mostUsedAccessModeEntrada[0]} (${safePercentage(mostUsedAccessModeEntrada[1], historyData.length)})`,
            accessModeSaida: `${mostUsedAccessModeSaida[0]} (${safePercentage(mostUsedAccessModeSaida[1], historyData.length)})`,
            averagePermanence: isNaN(averagePermanence) ? 'N/A' : formatPermanencia(Math.round(averagePermanence)),
        };
    };
    
    

    const columnsHistory = [
        { field: 'etetickets_ticket', headerName: 'Cartao', flex: 1, sortable: false, filterable: false },
        { field: 'etetickets_placa', headerName: 'Placa', flex: 2, sortable: false, filterable: false },
        { field: 'etetickets_data', headerName: 'Data Entrada', flex: 2, sortable: false, filterable: false, renderCell: (params) => <span>{formatData(params.row.etetickets_data)}</span> },
        { field: 'etetickets_descricao', headerName: 'Terminal', flex: 1, sortable: false, filterable: false },
        { field: 'etetickets_origemacesso', headerName: 'Modo de Acesso', flex: 1, sortable: false, filterable: false },
        { field: 'etstickets_data', headerName: 'Data Saída', flex: 2, sortable: false, filterable: false, renderCell: (params) => <span>{formatData(params.row.etstickets_data)}</span> },
        { field: 'etstickets_descricao', headerName: 'Terminal', flex: 2, sortable: false, filterable: false },
        { field: 'etstickets_origemacesso', headerName: 'Modo de Acesso', flex: 1, sortable: false, filterable: false },
        { field: 'etstickets_permanencia', headerName: 'Permanência', flex: 1, sortable: false, filterable: false, renderCell: (params) => <span>{formatPermanencia(params.row.etstickets_permanencia)}</span> }
    ];
    

    // Função para gerar o PDF do histórico
    const generateHistoryPDF = () => {
        const doc = new jsPDF('landscape');
        const stats = calculateStatistics();
    
        // Título do relatório
        doc.text('Histórico do Cartão', 14, 10);
    
        // Configurar dados para a tabela de médias
        const mediaData = [
            ["Credenciado", `${cartaoHistory} - ${credenciadoHistory}`],
            ["Período", `${entrada?.split(' ')[0].split('-').reverse().join('/') || ''} - ${saida?.split(' ')[0].split('-').reverse().join('/') || 'Todos'}`],
            ["Tempo de permanência", `${formatTime(rangeHours[0])} - ${formatTime(rangeHours[1])}`],
            ["Terminal de entrada mais acessado", stats.terminalEntrada],
            ["Terminal de saída mais acessado", stats.terminalSaida],
            ["Modo de acesso mais usado (Entrada)", stats.accessModeEntrada],
            ["Modo de acesso mais usado (Saída)", stats.accessModeSaida],
            ["Tempo médio de permanência", stats.averagePermanence]
        ];
    
        // Adicionar a tabela de médias no topo do PDF
        doc.autoTable({
            head: [["Descrição", "Valor"]],
            body: mediaData,
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
        });
    
        // Calcular a próxima posição para iniciar a tabela de histórico
        const nextY = doc.previousAutoTable.finalY + 10;
    
        // Dados do histórico
        const historyTableData = historyData.map(row => [
            row.etetickets_ticket || '-',
            row.etetickets_placa || '-',
            row.etetickets_data ? formatData(row.etetickets_data) : '-',
            row.etetickets_descricao || '-',
            row.etetickets_origemacesso || '-',
            row.etstickets_data ? formatData(row.etstickets_data) : '-',
            row.etstickets_descricao || '-',
            row.etstickets_origemacesso || '-',
            formatPermanencia(row.etstickets_permanencia) || '-',
        ]);
    
        // Adicionar a tabela de histórico
        doc.autoTable({
            head: [['Cartao', 'Placa', 'Data Entrada', 'Terminal Entrada', 'Modo de Acesso Entrada', 'Data Saída', 'Terminal Saída', 'Modo de Acesso Saída', 'Permanência']],
            body: historyTableData,
            startY: nextY, // Inicia após a tabela de médias
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
            styles: { fontSize: 8, halign: 'center' }
        });
    
        // Salva o arquivo
        doc.save('historico_cartao.pdf');
    };
    

    // Função para gerar o PDF dos credenciados
    const generateCredenciadosPDF = () => {
        const doc = new jsPDF('landscape');

        // Título do relatório
        doc.text('Relatório de Credenciados', 14, 10);

        // Dados da tabela principal
        const tableData = credenciados.map(row => [
            row.cartao,
            row.nome,
            row.grupo,
            row.p_placa || '-',
            row.p_cor || '-',
            row.p_marca || '-',
            row.p_modelo || '-',
            row.p_ano || '-',
            row.validadeinicio.split(' ')[0].split('-').reverse().join('/') || '-',
            row.validadefim.split(' ')[0].split('-').reverse().join('/') || '-',
            row.inativo === 'F' ? 'Ativo' : 'Inativo'
        ]);

        doc.autoTable({
            head: [['Cartao', 'Nome', 'Grupo', 'Placa', 'Cor', 'Marca', 'Modelo', 'Ano', 'Validade Inicio', 'Validade Fim', 'Status']],
            body: tableData,
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
            styles: { fontSize: 8, halign: 'center' }
        });

        // Salva o arquivo
        doc.save('relatorio_credenciados.pdf');
    };

    const handleApplyFilter = () => {
        fetchData();
    };

    const handleApplyFilterHistory = () => {
        handleGetHistory();
    };

    const handleClearFilter = () => {
        window.location.reload(); 

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

    return (
        <div>
            <h1>Credenciados</h1>
             {/* Filtros */}
             <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography sx={{display: 'flex', alignItems: 'center', gap: '15px'}}>Filtros <FilterAltIcon /></Typography>
                </AccordionSummary>
                <AccordionDetails>
                <Box sx={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
                        <TextField label="Cartão" variant="outlined" value={cartao} onChange={(e) => setCartao(e.target.value)} style={{ marginRight: '10px' }} />
                        <TextField label="Nome" variant="outlined" value={nome} onChange={(e) => setNome(e.target.value)} style={{ marginRight: '10px' }} />
                        <TextField label="Placa" variant="outlined" value={placa} onChange={handlePlacaChange} error={placaError} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>        
                        <Tooltip sx={{width: {xs: '100%', sm: '100%', md: '180px'}}} arrow title="Aplicar Filtro">
                        <Button variant="contained" onClick={handleApplyFilter} startIcon={<FilterAltIcon />}>Filtrar</Button>
                        </Tooltip>

                        <Tooltip sx={{width: {xs: '100%', sm: '100%', md: '180px'}}} arrow title="Limpar Filtro">
                        <Button variant="outlined" onClick={handleClearFilter} startIcon={<FilterAltOffIcon />}>Limpar</Button>
                        </Tooltip>

                        <Tooltip sx={{width: {xs: '100%', sm: '100%', md: '180px'}}} arrow title="Imprimir">
                        <Button variant="contained" color="secondary" onClick={generateCredenciadosPDF} startIcon={<TextSnippetIcon />}>Imprimir</Button>
                        </Tooltip>
                    </Box>
                    </Box>
                </AccordionDetails>
                </Accordion>
            
            <DataGrid
                sx={{ display: { xs: 'none', sm: 'none', md: 'flex' }, marginTop: '40px' }}
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                rows={credenciados}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
                disableRowSelectionOnClick
                getRowId={(row) => row.cartao}
            />

            {/* Modal for History */}
            <Modal open={isModalOpen} onClose={closeModal}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90vw', height: '80vh', bgcolor: 'background.paper',
                    boxShadow: 24, p: 4,
                }}>
                    <Typography variant="h6" component="h2">
                        Histórico do Cartão {cartaoHistory}
                    </Typography>

                    {/* Filtros */}
                    <Box sx={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                        <TextField
                            label="Entrada"
                            type="date"
                            sx={{width: '250px'}}
                            value={entrada}
                            onChange={(e) => setEntrada(e.target.value)}                            
                            InputLabelProps={{ shrink: true }}
                        /> 
                        <TextField
                            label="Saída"
                            type="date"
                            sx={{width: '250px'}}
                            value={saida}
                            onChange={(e) => setSaida(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
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
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', marginLeft: '20px' }}>
                            <Typography variant="caption">
                                Tempo de permanência: {formatTime(rangeHours[0])} - {formatTime(rangeHours[1])}
                            </Typography>
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
                                { value: 1440, label: '1.440 min (24h)' },
                                ]}
                                sx={{ width: { xs: '100%', sm: '100%', md: '300px' }, marginBottom: { xs: '15px', sm: '15px', md: '-3px' } }}
                            />
                        </Box>
                       
                    </Box>

                    <Box sx={{display: 'flex', gap: '15px', marginTop: '20px'}}>
                        {/* Botão para aplicar filtro */}
                    <Button onClick={handleApplyFilterHistory} variant="contained" sx={{ marginTop: '10px' }}>
                        Buscar
                    </Button>

                    {/* Botão para limpar filtro */}
                    <Button onClick={handleClearFilter} variant="outlined" sx={{ marginTop: '10px' }}>
                        Limpar
                    </Button>

                    {/* Botão para gerar PDF */}
                    <Button onClick={generateHistoryPDF} variant="contained" color="secondary" sx={{ marginTop: '10px' }}>
                        Imprimir Histórico
                    </Button>
                    </Box>

                    

                    {/* Tabela de histórico */}
                    {isLoading ? (
                        <CircularProgress sx={{ marginTop: '20px' }} />
                    ) : (
                        <Box sx={{ maxHeight: '300px', width: '100%', marginTop: '20px', overflow: 'auto' }}>
                        <DataGrid
                            rows={historyData}
                            columns={columnsHistory}
                            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                            pageSize={5}
                            rowsPerPageOptions={[5, 10]}                            
                            style={{ marginTop: '20px' }}
                            getRowId={(row) => `${row.etetickets_ticket}-${row.etetickets_data}-${row.etstickets_data}`}
                        />
                        </Box>
                    )}
                </Box>
            </Modal>
            <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={open}
                onClick={handleClose}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );
};

export default Credenciados;
