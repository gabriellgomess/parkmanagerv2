// src/App.jsx
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import MonitoramentoPlacas from './pages/MonitoramentoPlacas';
import EntradasSaidas from './pages/EntradasSaidas';
import ValidacaoHiper from './pages/ValidacaoHiper';
import Credenciados from './pages/Credenciados';
import Pagamentos from './pages/Pagamentos';
import Users from './pages/Users';
import GerirPlacasIndesejadas from './pages/GerirPlacasIndesejadas';
import Terminais from './components/Terminais';

const App = () => {
  useEffect(() => {
    // Modifica o título da página utilizando a variável de ambiente
    document.title = import.meta.env.VITE_APP_TITLE || 'Sistema';
  }, []);
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/terminais"
          element={
            <PrivateRoute>
              <Layout>
                <Terminais />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/placas-indesejadas"
          element={
            <PrivateRoute>
              <Layout>
                <GerirPlacasIndesejadas />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/monitoramento-placas"
          element={
            <PrivateRoute>
              <Layout>
                <MonitoramentoPlacas />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute requiredNivelAcesso={1}>
              <Layout>
                <Users />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/entradas-saidas"
          element={
            <PrivateRoute>
              <Layout>
                <EntradasSaidas />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
        path="/validacao-hiper"
        element={
          <PrivateRoute>
            <Layout>
              <ValidacaoHiper />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/credenciados"
        element={
          <PrivateRoute>
            <Layout>
              <Credenciados />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/pagamentos"
        element={
          <PrivateRoute>
            <Layout>
              <Pagamentos />
            </Layout>
          </PrivateRoute>
        }
      />
      </Routes>      
    </AuthProvider>
  );
};

export default App;
