import { useContext, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Modal,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { ip } = useContext(AuthContext);
  const [vagas, setVagas] = useState(0); // Vagas ocupadas
  const [vagasLivres, setVagasLivres] = useState(0); // Vagas livres
  const [ocupacaoPercentual, setOcupacaoPercentual] = useState(0); // Porcentagem de ocupação
  const [totalVagas, setTotalVagas] = useState(0); // Total de vagas
  const [isModalOpen, setIsModalOpen] = useState(false); // Controle do modal
  const [newTotalVagas, setNewTotalVagas] = useState(totalVagas); // Novo valor temporário
  const [setoresPatio, setSetoresPatio] = useState({}); // Armazena os dados de ocupação por setor
  const [vagasPorSetor, setVagasPorSetor] = useState({}); // Armazena o total de vagas por setor
  const [setorEmEdicao, setSetorEmEdicao] = useState(null); // Controla qual setor está sendo editado

  // Função para buscar o total de vagas na API
  const fetchTotalVagas = () => {
    axios
      .get(`http://${ip}/api/vagas`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        // Verificamos se a API retorna vagas por setor
        if (response.data.vagas_por_setor) {
          setVagasPorSetor(response.data.vagas_por_setor);
          // Calculamos o total como a soma das vagas por setor
          const total = Object.values(response.data.vagas_por_setor).reduce((sum, valor) => sum + valor, 0);
          setTotalVagas(total);
        } else {
          // Caso não tenha vagas por setor, usamos o total geral da API
          setTotalVagas(response.data.vagas);
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar total de vagas:', error);
      });
  };

  // Recalcula o total geral sempre que vagasPorSetor mudar
  useEffect(() => {
    const total = Object.values(vagasPorSetor).reduce((sum, valor) => sum + valor, 0);
    setTotalVagas(total);
  }, [vagasPorSetor]);

  // Função para buscar dados do pátio com o novo formato
  const patio = () => {
    axios
      .get(`http://${ip}/api/patio`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        // Extrair informações do novo formato de resposta
        const patioTotal = response.data.patio_total || 0;
        const patioPorSetor = response.data.patio_por_setor || {};
        
        // Calcular vagas livres e ocupação percentual
        const vagasLivresCalculadas = totalVagas - patioTotal;
        const ocupacaoPercentualCalculada = ((patioTotal / totalVagas) * 100).toFixed(2);

        setVagas(patioTotal);
        setVagasLivres(vagasLivresCalculadas);
        setOcupacaoPercentual(ocupacaoPercentualCalculada);
        setSetoresPatio(patioPorSetor);
        
        // Se não temos dados de vagas por setor, vamos estimá-las
        if (Object.keys(vagasPorSetor).length === 0 && Object.keys(patioPorSetor).length > 0) {
          const totalSetores = Object.keys(patioPorSetor).length;
          const vagasEstimadasPorSetor = {};
          
          // Distribuir vagas igualmente entre os setores
          Object.keys(patioPorSetor).forEach(setor => {
            vagasEstimadasPorSetor[setor] = Math.round(totalVagas / totalSetores);
          });
          
          setVagasPorSetor(vagasEstimadasPorSetor);
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar vagas do pátio:', error);
      });
  };

  // Atualiza o total de vagas
  const updateTotalVagas = () => {
    // Garantimos que estamos apenas editando vagas de um setor específico
    if (!setorEmEdicao) {
      console.error('Setor não especificado para atualização');
      return;
    }

    axios
      .put(
        `http://${ip}/api/vagas`,
        { 
          vagas: newTotalVagas,
          setor: setorEmEdicao,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        }
      )
      .then(() => {
        // Atualiza apenas para o setor específico
        setVagasPorSetor(prev => ({
          ...prev,
          [setorEmEdicao]: newTotalVagas
        }));
        
        // O useEffect vai recalcular o total geral automaticamente
        setIsModalOpen(false);
        setSetorEmEdicao(null);
      })
      .catch((error) => {
        console.error('Erro ao atualizar total de vagas:', error);
      });
  };

  // Função para abrir modal de edição (somente para setores específicos)
  const handleOpenModal = (setor) => {
    if (!setor) return; // Não permitimos mais editar o total geral
    
    setSetorEmEdicao(setor);
    setNewTotalVagas(vagasPorSetor[setor] || 0);
    setIsModalOpen(true);
  };

  // Função para definir a cor do card por setor baseado na ocupação
  const getSetorCardColor = (setor) => {
    // Lista de cores para atribuir aos setores dinamicamente
    const colorPalette = [
      '#c5e1a5', // Verde claro
      '#fff59d', // Amarelo claro
      '#ffcc80', // Laranja claro
      '#ef9a9a', // Vermelho claro
      '#bbdefb', // Azul claro
      '#b39ddb', // Roxo claro
      '#f8bbd0', // Rosa claro
      '#b2dfdb', // Turquesa claro
    ];
    
    // Gera um índice baseado na primeira letra do nome do setor
    // Isso garante que o mesmo setor sempre receba a mesma cor
    const index = setor.charCodeAt(0) % colorPalette.length;
    
    return colorPalette[index];
  };

  useEffect(() => {
    fetchTotalVagas(); // Busca inicial do total de vagas
    patio(); // Busca inicial do pátio
    // const interval = setInterval(patio, 10000); // Atualização periódica do pátio

    // return () => clearInterval(interval); // Limpeza ao desmontar
  }, [vagasPorSetor]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* Cards totais gerais */}
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>Estatísticas Gerais</Typography>
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            gap: '20px',
            justifyContent: 'start',
            flexDirection: { xs: 'column', md: 'row' },
            flexWrap: 'wrap'
          }}
        >
          <Card sx={{ width: { xs: '100%', md: '30%' }, height: '150px', backgroundColor: '#33eb91' }}>
            <CardHeader title="Vagas livres" />
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="text.primary">
                {vagasLivres.toLocaleString('pt-BR')} <span style={{ fontSize: '36px' }}>({(100 - ocupacaoPercentual).toFixed(2)}%)</span>
              </Typography>
            </CardContent>
          </Card>
          <Card
            sx={{
              width: { xs: '100%', md: '30%' },
              height: '150px',
              backgroundColor: '#33c9dc',
            }}
          >
            <CardHeader
              title="Total de Vagas"
              subheader="Soma das vagas por setor"
            />
            <CardContent sx={{ textAlign: 'right' }}>
              <Typography variant="h4" color="text.primary">
                {totalVagas.toLocaleString('pt-BR')}
              </Typography>
            </CardContent>
          </Card>
          <Card
            sx={{
              width: { xs: '100%', md: '30%' },
              height: '150px',
              backgroundColor: '#ffef62',
            }}
          >
            <CardHeader title="Total no pátio" />
            <CardContent sx={{ textAlign: 'right' }}>
              <Typography variant="h4" color="text.primary">
                {vagas.toLocaleString('pt-BR')} <span style={{ fontSize: '18px' }}>({ocupacaoPercentual}%)</span>
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Cards para cada setor */}
      {Object.entries(setoresPatio).map(([setor, quantidade]) => {
        const totalVagasSetor = vagasPorSetor[setor] || 0;
        const vagasLivresSetor = totalVagasSetor - quantidade;
        const ocupacaoPercentualSetor = totalVagasSetor > 0 ? ((quantidade / totalVagasSetor) * 100).toFixed(2) : 0;
        const corSetor = getSetorCardColor(setor);
        
        return (
          <Box key={setor} sx={{ mt: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {setor.startsWith('SETOR') || setor.startsWith('Setor') ? setor : `Setor ${setor}`}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: 'flex',
                width: '100%',
                gap: '20px',
                justifyContent: 'start',
                flexDirection: { xs: 'column', md: 'row' },
                flexWrap: 'wrap'
              }}
            >
              <Card sx={{ width: { xs: '100%', md: '30%' }, height: '150px', backgroundColor: corSetor }}>
                <CardHeader title="Vagas livres" />
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="text.primary">
                    {vagasLivresSetor.toLocaleString('pt-BR')} 
                    <span style={{ fontSize: '24px', marginLeft: '10px' }}>
                      ({totalVagasSetor > 0 ? (100 - ocupacaoPercentualSetor).toFixed(2) : 0}%)
                    </span>
                  </Typography>
                </CardContent>
              </Card>
              <Card
                sx={{
                  width: { xs: '100%', md: '23%' },
                  height: '150px',
                  backgroundColor: corSetor,
                  opacity: 0.85,
                }}
              >
                <CardHeader
                  title="Total de Vagas"
                  action={
                    <IconButton
                      aria-label="settings"
                      onClick={() => handleOpenModal(setor)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  }
                />
                <CardContent sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" color="text.primary">
                    {totalVagasSetor.toLocaleString('pt-BR')}
                  </Typography>
                </CardContent>
              </Card>
              <Card
                sx={{
                  width: { xs: '100%', md: '23%' },
                  height: '150px',
                  backgroundColor: corSetor,
                  opacity: 0.7,
                }}
              >
                <CardHeader title="Vagas ocupadas" />
                <CardContent sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" color="text.primary">
                    {quantidade.toLocaleString('pt-BR')} <span style={{ fontSize: '18px' }}>({ocupacaoPercentualSetor}%)</span>
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        );
      })}

      {/* Modal para edição do total de vagas */}
      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSetorEmEdicao(null);
        }}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2">
            {setorEmEdicao 
              ? `Editar Total de Vagas - ${setorEmEdicao.startsWith('SETOR') || setorEmEdicao.startsWith('Setor') ? setorEmEdicao : `Setor ${setorEmEdicao}`}` 
              : 'Editar Total de Vagas'
            }
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={newTotalVagas}
            onChange={(e) => setNewTotalVagas(Number(e.target.value))}
            margin="normal"
            label="Total de Vagas"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => {
              setIsModalOpen(false);
              setSetorEmEdicao(null);
            }} sx={{ mr: 2 }}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={updateTotalVagas}>
              Salvar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Dashboard;
