
# API de Autenticação em Laravel

Este projeto é uma API básica de autenticação construída com Laravel. Ele permite o registro de usuários, login, obtenção de perfil de usuário autenticado e logout. A API utiliza **Laravel Sanctum** para autenticação baseada em tokens e documentada usando **Swagger**.

## Funcionalidades

- **Registro de Usuário**: Cria um novo usuário na base de dados.
- **Login de Usuário**: Autentica o usuário e retorna um token de acesso.
- **Perfil de Usuário**: Obtém os dados do usuário autenticado.
- **Logout de Usuário**: Invalida o token de acesso do usuário.

## Endpoints

### 1. Registro

- **URL**: `/api/register`  
- **Método**: `POST`  
- **Corpo da Requisição**:
  ```json
  {
      "name": "Nome do Usuário",
      "email": "email@dominio.com",
      "password": "senha"
  }
  ```
- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
        "status": "success",
        "message": "Usuário criado com sucesso",
        "token": "1|V0upjdioPsDPjWdOyNGjJIaCQHJTJH0MQvwK5DdZ13806f99",
        "data": {
            "name": "Nome do Usuário",
            "email": "email@dominio.com",
            "created_at": "2024-10-03T15:51:05.000000Z",
            "updated_at": "2024-10-03T15:51:05.000000Z",
            "id": 1
        }
    }
    ```
  - **401 (Erro de Validação)**:
    ```json
    {
        "status": "error",
        "message": "Erro de validação",
        "erros": {
            "email": [
                "Este e-mail já está em uso"
            ]
        }
    }
    ```

### 2. Login

- **URL**: `/api/login`  
- **Método**: `POST`  
- **Corpo da Requisição**:
  ```json
  {
      "email": "email@dominio.com",
      "password": "senha"
  }
  ```
- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
        "status": "success",
        "message": "Usuário logado com sucesso",
        "token": "2|B6CL7DLBQHLFvpBPv4qHn2swyqeRH6lSAZOHsGEs66100ee8",
        "data": {
            "id": 1,
            "name": "Nome do Usuário",
            "email": "email@dominio.com",
            "created_at": "2024-10-03T15:51:05.000000Z",
            "updated_at": "2024-10-03T15:51:05.000000Z"
        }
    }
    ```
  - **401 (Email ou Senha Incorretos)**:
    ```json
    {
        "status": "error",
        "message": "E-mail ou senha incorretos"
    }
    ```

### 3. Perfil

- **URL**: `/api/profile`  
- **Método**: `GET`  
- **Cabeçalho**:
  ```json
  {
      "accept": "application/json",
      "Authorization": "Bearer {token}"
  }
  ```
- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
        "status": "success",
        "message": "Perfil do Usuário",
        "data": {
            "id": 1,
            "name": "Nome do Usuário",
            "email": "email@dominio.com",
            "created_at": "2024-10-03T15:51:05.000000Z",
            "updated_at": "2024-10-03T15:51:05.000000Z"
        },
        "id": 1
    }
    ```
  - **401 (Não Autenticado)**:
    ```json
    {
        "message": "Não autenticado."
    }
    ```

### 4. Logout

- **URL**: `/api/logout`  
- **Método**: `POST`  
- **Cabeçalho**:
  ```json
  {
      "accept": "application/json",
      "Authorization": "Bearer {token}"
  }
  ```
- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
        "status": "success",
        "message": "Logout realizado com sucesso"
    }
    ```
  - **401 (Não Autenticado)**:
    ```json
    {
        "message": "Usuário não autenticado."
    }
    ```

## Como executar o projeto

1. Clone o Repositório:
    ```bash
    git clone https://github.com/gabriellgomess/api-login-laravel-11.git
    ```

2. Instale as dependências:
    ```bash
    composer install
    ```

3. Configure o arquivo `.env`:
    ```bash
    cp .env.example .env
    ```

4. Gere a chave da aplicação:
    ```bash
    php artisan key:generate
    ```

5. Execute as migrações:
    ```bash
    php artisan migrate
    ```
6. Implementar a documentação do Swagger ou quando alterá-la
    ```bash
    php artisan l5-swagger:generate
    ```

7. Inicie o servidor:
    ```bash
    php artisan serve
    ```
