// src/components/AlertSnackbar.jsx
import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const AlertSnackbar = ({ open, handleClose, message, severity = 'success' }) => {
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertSnackbar;
