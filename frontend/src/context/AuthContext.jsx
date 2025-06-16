import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import alertaSound from '../assets/alerta.mp3';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(sessionStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState(null);
  const [placas, setPlacas] = useState([]);
  const [placasIndesejadas, setPlacasIndesejadas] = useState([]);
  const [lastIds, setLastIds] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [setores, setSetores] = useState([]);

  const navigate = useNavigate();
  
  const hostname = window.location.hostname;
  const port = window.location.port; 
  // const ip = port ? `${hostname}:${port}` : hostname;

  const ip = 'localhost:8000'; // Defina o IP do seu backend aqui

  // === Autenticação ===

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`http://${ip}/api/login`, { email, password });
      const { token } = response.data;

      if (token) {
        sessionStorage.setItem('token', token);
        setAuthToken(token);
        getUser();
        navigate('/dashboard');
      } else {
        throw new Error('Token inválido.');
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError('Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`http://${ip}/api/logout`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      sessionStorage.removeItem('token');
      setAuthToken(null);
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      setError('Falha no logout.');
    }
  };

  const getUser = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get(`http://${ip}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.data || null);
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      setUser(null);
    }
  };

  const getSetores = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get(`http://${ip}/api/setores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSetores(response.data || []);
    } catch (err) {
      console.error('Erro ao buscar setores:', err);
      setSetores([]);
    }
  };

  // === Placas indesejadas CRUD ===

  const getPlacasIndesejadas = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const response = await axios.get(`http://${ip}/api/placas-indesejadas`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-cache',
      });
      setPlacasIndesejadas(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao buscar placas indesejadas:', error);
      setPlacasIndesejadas([]);
    } finally {
      setLoading(false);
    }
  };

  const saveOrUpdatePlacaIndesejada = async (data, id = null) => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      if (id) {
        await axios.put(`http://${ip}/api/placas-indesejadas/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`http://${ip}/api/placas-indesejadas`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      getPlacasIndesejadas();
    } catch (error) {
      console.error('Erro ao salvar placa:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePlacaIndesejada = async (id) => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
  
    setLoading(true);
    try {
      await axios.delete(`http://${ip}/api/placas-indesejadas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      getPlacasIndesejadas();
    } catch (error) {
      console.error('Erro ao excluir placa:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  

  // === Blacklist em tempo real ===

  const BuscaPlacas = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const responseListar = await axios.get(`http://${ip}/api/blacklist/listar`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const responseNovas = await axios.get(`http://${ip}/api/blacklist/notify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const todas = responseListar.data || [];
      const novas = responseNovas.data || [];

      setPlacas(todas);

      if (novas.length > 0 && audioEnabled) {
        playAlertSound();
        showSnackbar(`🚨 ${novas.length} nova(s) ocorrência(s) detectada(s)!`, 'warning');
      }

    } catch (error) {
      console.error('Erro ao buscar placas:', error);
    }
  };

  const playAlertSound = () => {
    const alertSound = new Audio(alertaSound);
    alertSound.play().catch((error) => {
      console.error('Erro ao tocar som de alerta:', error);
    });
  };

  const enableAudio = () => {
    const alertSound = new Audio(alertaSound);
    alertSound.play()
      .then(() => setAudioEnabled(true))
      .catch((error) => {
        console.error('Erro ao autorizar áudio:', error);
        setAudioEnabled(false);
      });
  };

  const disableAudio = () => setAudioEnabled(false);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // === Effects ===

  useEffect(() => {
    if (authToken) {
      getUser();
      getSetores();
      getPlacasIndesejadas();
    }
  }, [authToken]);

  useEffect(() => {
    if (authToken) {
      const interval = setInterval(() => {
        BuscaPlacas();
      }, 3000);

      BuscaPlacas();

      return () => clearInterval(interval);
    }
  }, [authToken, audioEnabled]);

  return (
    <AuthContext.Provider
      value={{
        authToken,
        login,
        logout,
        user,
        loading,
        error,
        config,
        placas,
        placasIndesejadas,
        getPlacasIndesejadas,
        saveOrUpdatePlacaIndesejada,
        deletePlacaIndesejada,
        lastIds,
        audioEnabled,
        ip,
        setores,
        enableAudio,
        disableAudio,
        showSnackbar,
        BuscaPlacas
      }}
    >
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AuthContext.Provider>
  );
};

export default AuthContext;
