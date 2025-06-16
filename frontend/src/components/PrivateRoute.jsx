import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children, requiredNivelAcesso }) => {
  const { authToken, user } = useContext(AuthContext);

  // Verifica se o token de autenticação e o nível de acesso do usuário são válidos
  if (!authToken) {
    return <Navigate to="/" />; // Redireciona para a página inicial se não estiver autenticado
  }

  if (requiredNivelAcesso !== undefined && user?.nivel_acesso !== requiredNivelAcesso) {
    return <Navigate to="/dashboard" />; // Redireciona para uma página de acesso negado
  }

  return children;
};

export default PrivateRoute;
