import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Modal, TextField, Typography, MenuItem, FormControl, InputLabel, Select, Avatar
} from '@mui/material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AlertSnackbar from '../components/AlertSnackbar';
import Tooltip from '@mui/material/Tooltip';
import AuthContext from '../context/AuthContext'; // Importa o contexto
import { useParams } from 'react-router-dom';

const Users = () => {
  const { ip } = useContext(AuthContext); // Pega o config do contexto  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [alertData, setAlertData] = useState({ open: false, message: '', severity: 'success' });


const apiUrl = `http://${ip}/api/users`; // Usa config em vez da variável de ambiente

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    cpf: '',
    nivel_acesso: '',
    password: '',
    confirmPassword: '',
    profile_photo: null,
    existing_profile_photo: null,
    preview_photo: null,
  });

  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
      setUsers(response.data.data);
      setLoading(false);
    } catch (error) {
      handleOpenAlert('Erro ao buscar usuários', 'error');
    }
  };

  const handleSaveUser = async () => {
    if (formData.password !== formData.confirmPassword) {
      handleOpenAlert('As senhas não coincidem.', 'error');
      return;
    }

    if (!Object.values(passwordRequirements).every(Boolean) && !formData.id) {
      handleOpenAlert('A senha não atende a todos os requisitos.', 'error');
      return;
    }

    try {
      const formDataToSend = new FormData();

      if (formData.name) formDataToSend.append('name', formData.name);
      if (formData.email) formDataToSend.append('email', formData.email);
      if (formData.cpf) formDataToSend.append('cpf', formData.cpf);
      if (formData.nivel_acesso) formDataToSend.append('nivel_acesso', formData.nivel_acesso);
      if (formData.password) formDataToSend.append('password', formData.password);

      if (!formData.profile_photo) {
        formDataToSend.append('profile_photo', null);
        formDataToSend.append('remove_photo', true);
      } else if (formData.profile_photo) {
        formDataToSend.append('profile_photo', formData.profile_photo);
      }

      if (formData.id) {
        // Atualização de usuário
        await axios.post(`${apiUrl}/${formData.id}?_method=PUT`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        handleOpenAlert('Usuário atualizado com sucesso!', 'success');
      } else {
        // Criação de usuário
        await axios.post(apiUrl, formDataToSend, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        handleOpenAlert('Usuário criado com sucesso!', 'success');
      }

      fetchUsers();
      setOpenModal(false);
      setFormData({
        id: null, name: '', email: '', cpf: '', nivel_acesso: '',
        password: '', confirmPassword: '', profile_photo: null, existing_profile_photo: null, preview_photo: null
      });
    } catch (error) {
      handleOpenAlert('Erro ao salvar usuário', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${apiUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
      handleOpenAlert('Usuário excluído com sucesso!', 'success');
      fetchUsers();
    } catch (error) {
      handleOpenAlert('Erro ao deletar usuário', 'error');
    }
  };

  const openUserModal = (user = null) => {
    if (user) {
      setFormData({
        ...user,
        password: '',
        confirmPassword: '',
        profile_photo: null,
        existing_profile_photo: user.profile_photo,
        preview_photo: null,
      });
    } else {
      setFormData({
        id: null, name: '', email: '', cpf: '', nivel_acesso: '',
        password: '', confirmPassword: '', profile_photo: null, existing_profile_photo: null, preview_photo: null
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handlePasswordChange = (password) => {
    setFormData({ ...formData, password });
    setPasswordValidation(passwordRequirements);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAlert = (message, severity = 'success') => {
    setAlertData({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlertData({ ...alertData, open: false });
  };

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const maxSizeInMB = 2;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        handleOpenAlert(`A imagem deve ser menor que ${maxSizeInMB}MB`, 'error');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setFormData({ ...formData, profile_photo: file, preview_photo: previewUrl });
    }
  };

  const handleRemovePhoto = () => {
    setFormData({ ...formData, profile_photo: null, preview_photo: null, existing_profile_photo: null });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Usuários
      </Typography>
      <Button
        startIcon={<PersonAddIcon />}
        variant="contained"
        color="primary"
        onClick={() => openUserModal()}
        sx={{ mb: 2 }}
      >
        Novo Usuário
      </Button>

      {loading ? (
        <Typography>Carregando...</Typography>
      ) : (
        <>
          <TableContainer sx={{ display: { xs: 'none', sm: 'none', md: 'block' } }} component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Foto</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>CPF</TableCell>
                  <TableCell>Nível de Acesso</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell><Avatar alt={user?.name} src={``} /></TableCell>{/*  http://${ip}/storage/${user?.profile_photo} */}
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.cpf}</TableCell>
                    <TableCell>{user.nivel_acesso}</TableCell>
                    <TableCell>
                      <Tooltip title="Editar usuário" arrow>
                        <IconButton disabled={user.email === 'admin@admin'} color="primary" onClick={() => openUserModal(user)}>
                          <ManageAccountsIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remover usuário" arrow>
                        <IconButton disabled={user.email === 'admin@admin'} color="error" onClick={() => handleDeleteUser(user.id)}>
                          <PersonRemoveIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: { xs: 'block', sm: 'block', md: 'none' } }}>
            {users.map((user) => (
              <Box key={user.id} sx={{ display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid #ccc', borderRadius: '5px', p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <Avatar alt={user?.name} src={`http://${ip}/storage/${user?.profile_photo} `} />
                  <Typography variant="h6">{user.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: '10px' }}>
                  <Box>
                    <Typography variant="body2">{user.email}</Typography>
                    <Typography variant="body2">{user.cpf}</Typography>
                    <Typography variant="body2">{user.nivel_acesso}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                  <Tooltip title="Editar usuário" arrow>
                    <IconButton disabled={user.email === 'admin@admin'} color="primary" onClick={() => openUserModal(user)}>
                      <ManageAccountsIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remover usuário" arrow>
                    <IconButton disabled={user.email === 'admin@admin'} color="error" onClick={() => handleDeleteUser(user.id)}>
                      <PersonRemoveIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}

      <AlertSnackbar
        open={alertData.open}
        handleClose={handleCloseAlert}
        message={alertData.message}
        severity={alertData.severity}
      />

     {/* Modal para Criar/Editar Usuário */}
     <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '50%', md: '50%' },
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {formData.id ? 'Editar Usuário' : 'Novo Usuário'}
          </Typography>
          <Box sx={{ display: 'flex', gap: '20px' }}>
            <TextField
              label="Nome"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: '20px' }}>
            <TextField
              label="CPF"
              fullWidth
              margin="normal"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            />

          <FormControl fullWidth margin="normal">
            <InputLabel id="nivel_acesso">Nível de Acesso</InputLabel>
            <Select
              labelId="nivel_acesso"
              value={formData.nivel_acesso}
              onChange={(e) =>
                setFormData({ ...formData, nivel_acesso: e.target.value })
              }
              label="Nível de Acesso"  // Correto
            >
              <MenuItem value={1}>Nível 1</MenuItem>
              <MenuItem value={2}>Nível 2</MenuItem>
              <MenuItem value={3}>Nível 3</MenuItem>
              <MenuItem value={4}>Nível 4</MenuItem>
              <MenuItem value={5}>Nível 5</MenuItem>
            </Select>
          </FormControl>

          </Box>

          <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {/* Exibir a pré-visualização ou a imagem atual */}
            {formData.preview_photo ? (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Avatar
                  src={formData.preview_photo}
                  alt="Pré-visualização da imagem"
                  sx={{ width: 100, height: 100 }}
                />
              </Box>
            ) : formData.existing_profile_photo ? (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Avatar
                  src={``} // http://${ip}/storage/${formData.existing_profile_photo}
                  alt="Foto atual"
                  sx={{ width: 100, height: 100 }}
                />
              </Box>
            ) : (
              <Avatar sx={{ width: 100, height: 100  }} src="/broken-image.jpg" />
            )}

            {/* Botão para upload da nova imagem */}
            <Button variant="contained" component="label" sx={{ mt: 2, height: 'fit-content' }}>
              Upload Foto de Perfil
              <input type="file" hidden onChange={handleProfilePhotoChange} />
            </Button>
          </Box>


          {/* Botão para remover a imagem de perfil */}
          {formData.existing_profile_photo || formData.preview_photo ? (
            <Button
              variant="outlined"
              color="secondary"
              sx={{ mt: 2 }}
              startIcon={<DeleteIcon />}
              onClick={handleRemovePhoto}
            >
              Remover Foto de Perfil
            </Button>
          ) : null}

          {!formData.id && (
            <>
              <Box sx={{ display: 'flex', gap: '20px' }}>
                <TextField
                  label="Senha"
                  type="password"
                  fullWidth
                  margin="normal"
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                />
                <TextField
                  label="Confirmar Senha"
                  type="password"
                  fullWidth
                  margin="normal"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </Box>


              <Box>
                <Typography sx={{display: 'flex', alignItems: 'center', gap: '10px'}} variant="body2" color={passwordRequirements.minLength ? 'green' : 'red'}>
                  {passwordRequirements.minLength ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />} Pelo menos 8 caracteres
                </Typography>
                <Typography sx={{display: 'flex', alignItems: 'center', gap: '10px'}} variant="body2" color={passwordRequirements.hasUpperCase ? 'green' : 'red'}>
                  {passwordRequirements.hasUpperCase ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />} Pelo menos uma letra maiúscula
                </Typography>
                <Typography sx={{display: 'flex', alignItems: 'center', gap: '10px'}} variant="body2" color={passwordRequirements.hasLowerCase ? 'green' : 'red'}>
                  {passwordRequirements.hasLowerCase ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />} Pelo menos uma letra minúscula
                </Typography>
                <Typography sx={{display: 'flex', alignItems: 'center', gap: '10px'}} variant="body2" color={passwordRequirements.hasNumber ? 'green' : 'red'}>
                  {passwordRequirements.hasNumber ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />} Pelo menos um número
                </Typography>
                <Typography sx={{display: 'flex', alignItems: 'center', gap: '10px'}} variant="body2" color={passwordRequirements.hasSpecialChar ? 'green' : 'red'}>
                  {passwordRequirements.hasSpecialChar ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />} Pelo menos um caractere especial
                </Typography>
                <Typography sx={{display: 'flex', alignItems: 'center', gap: '10px'}} variant="body2" color={formData.password == formData.confirmPassword && formData.password.length > 0 ? 'green' : 'red'}>
                  {formData.password == formData.confirmPassword && formData.password.length > 0 ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />} Senhas coincidem
                </Typography>
              </Box>
            </>
          )}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
            <Button variant="contained" color="primary" onClick={handleSaveUser} sx={{ mt: 2 }}>
              {formData.id ? 'Atualizar' : 'Criar'}
            </Button>
          </Box>

        </Box>
      </Modal>
    </Box>
  );
};

export default Users;
