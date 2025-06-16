<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="API de Autenticação",
 *     description="Documentação da API de autenticação",
 *     @OA\Contact(
 *         email="gabriel.gomes@outlook.com"
 *     )
 * )
 */

class AuthController extends Controller
{
    /**
 * @OA\Post(
 *     
 *     path="/api/register",
 *     summary="Registro de Usuário",
 *     description="Registra um novo usuário.",
 *     tags={"Autenticação"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"name", "email", "password", "cpf", "nivel_acesso"},
 *             @OA\Property(property="name", type="string", example="Nome Usuário"),
 *             @OA\Property(property="email", type="string", format="email", example="usuario@email.com"),
 *             @OA\Property(property="password", type="string", format="password", example="senhaSegura123"),
 *             @OA\Property(property="cpf", type="string", example="123.456.789-00"),
 *             @OA\Property(property="nivel_acesso", type="integer", example=1, description="Nível de acesso de 1 a 5")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Usuário criado com sucesso",
 *         @OA\JsonContent(
 *             @OA\Property(property="status", type="string", example="success"),
 *             @OA\Property(property="message", type="string", example="Usuário criado com sucesso"),
 *             @OA\Property(property="token", type="string", example="1|V0upjdioPsDPjWdOyNGjJIaCQHJTJH0MQvwK5DdZ13806f99"),
 *             @OA\Property(property="data", type="object",
 *                 @OA\Property(property="name", type="string", example="Nome Usuário"),
 *                 @OA\Property(property="email", type="string", example="usuario@email.com"),
 *                 @OA\Property(property="cpf", type="string", example="123.456.789-00"),
 *                 @OA\Property(property="nivel_acesso", type="integer", example=1),
 *                 @OA\Property(property="created_at", type="string", example="2024-10-16T15:51:05.000000Z"),
 *                 @OA\Property(property="updated_at", type="string", example="2024-10-16T15:51:05.000000Z"),
 *                 @OA\Property(property="id", type="integer", example=1)
 *             )
 *         )
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Erro de validação",
 *         @OA\JsonContent(
 *             @OA\Property(property="status", type="string", example="error"),
 *             @OA\Property(property="message", type="string", example="Erro de Validação"),
 *             @OA\Property(property="erros", type="object",
 *                 @OA\Property(property="email", type="array", @OA\Items(type="string", example="Este email já foi cadastrado"))
 *             )
 *         )
 *     )
 * )
 */

    public function register(Request $request)
    {
        try {
            $validateUser = Validator::make($request->all(), [
                'name' => 'required',
                'email' => 'required|email|unique:users,email',
                'password' => 'required',
                'cpf' => 'required|unique:users,cpf',  // Validação de CPF
                'nivel_acesso' => 'required|integer|between:1,5',  // Validação de nível de acesso
            ], [
                'name.required' => 'O campo nome é obrigatório.',
                'email.required' => 'O campo e-mail é obrigatório.',
                'email.email' => 'O e-mail informado não é válido.',
                'email.unique' => 'O e-mail já está em uso.',
                'password.required' => 'O campo senha é obrigatório.',
                'cpf.required' => 'O campo CPF é obrigatório.',
                'cpf.unique' => 'O CPF já está em uso.',
                'nivel_acesso.required' => 'O nível de acesso é obrigatório.',
                'nivel_acesso.between' => 'O nível de acesso deve estar entre 1 e 5.'
            ]);

            if ($validateUser->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Erro de validação',
                    'erros' => $validateUser->errors()
                ], 401);
            }

            // Remover pontos e traços do CPF
            $cpfLimpo = preg_replace('/\D/', '', $request->cpf);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'cpf' => $cpfLimpo,
                'nivel_acesso' => $request->nivel_acesso
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Usuário criado com sucesso',
                'token' => $user->createToken('token')->plainTextToken,
                'data' => $user
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro interno do servidor',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
 * @OA\Post(
 *     path="/api/login",
 *     summary="Login de Usuário",
 *     description="Autentica um usuário.",
 *     tags={"Autenticação"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"email", "password"},
 *             @OA\Property(property="email", type="string", format="email", example="usuario@email.com"),
 *             @OA\Property(property="password", type="string", format="password", example="senhaSegura123")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Usuário logado com sucesso",
 *         @OA\JsonContent(
 *             @OA\Property(property="status", type="string", example="success"),
 *             @OA\Property(property="message", type="string", example="Usuário logado com sucesso"),
 *             @OA\Property(property="token", type="string", example="2|B6CL7DLBQHLFvpBPv4qHn2swyqeRH6lSAZOHsGEs66100ee8"),
 *             @OA\Property(property="data", type="object",
 *                 @OA\Property(property="id", type="integer", example=1),
 *                 @OA\Property(property="name", type="string", example="Nome Usuário"),
 *                 @OA\Property(property="email", type="string", example="usuario@email.com"),
 *                 @OA\Property(property="email_verified_at", type="string", nullable=true, example=null),
 *                 @OA\Property(property="created_at", type="string", example="2024-10-16T15:51:05.000000Z"),
 *                 @OA\Property(property="updated_at", type="string", example="2024-10-16T15:51:05.000000Z")
 *             )
 *         )
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Email ou senha incorretos",
 *         @OA\JsonContent(
 *             @OA\Property(property="status", type="string", example="error"),
 *             @OA\Property(property="message", type="string", example="Email ou senha incorretos")
 *         )
 *     )
 * )
 */



 public function login(Request $request)
 {
     try {
         $validateUser = Validator::make($request->all(), [
             'email' => 'required|email',
             'password' => 'required',
         ]);
 
         if ($validateUser->fails()) {
             return response()->json([
                 'status' => 'error',
                 'message' => 'Erro de validação',
                 'erros' => $validateUser->errors()
             ], 401);
         }

         $garagem = 'plaza';
 
         // Consulta remota para verificar se a garagem está liberada
        $liberado = DB::connection('remoto')
        ->table('controle_acessos')
        ->where('garagem', $garagem)
        ->value('liberado');

        if (!$liberado) {
        return response()->json([
                'status' => 'error',
                'message' => 'Acesso negado. Esta garagem não está autorizada.'
            ], 403);
        }
        
         if (!Auth::attempt($request->only('email', 'password'))) {
             return response()->json([
                 'status' => 'error',
                 'message' => 'E-mail ou senha incorretos'
             ], 401);
         }
 
         $user = User::where('email', $request->email)->first();
 
         return response()->json([
             'status' => 'success',
             'message' => 'Usuário logado com sucesso',
             'token' => $user->createToken('token')->plainTextToken,
             'data' => $user
         ], 200);
     } catch (\Throwable $th) {
         return response()->json([
             'status' => 'error',
             'message' => 'Erro interno do servidor',
             'error' => $th->getMessage()
         ], 500);
     }
 }
 

    /**
 * @OA\Get(
 *     path="/api/profile",
 *     summary="Obter perfil do usuário autenticado",
 *     description="Retorna o perfil do usuário autenticado.",
 *     tags={"Autenticação"},
 *     security={{ "sanctum": {} }},
 *     @OA\Response(
 *         response=200,
 *         description="Perfil do usuário recuperado com sucesso",
 *         @OA\JsonContent(
 *             @OA\Property(property="status", type="string", example="success"),
 *             @OA\Property(property="message", type="string", example="User profile"),
 *             @OA\Property(property="data", type="object",
 *                 @OA\Property(property="id", type="integer", example=1),
 *                 @OA\Property(property="name", type="string", example="Nome Usuário"),
 *                 @OA\Property(property="email", type="string", example="usuario@email.com"),
 *                 @OA\Property(property="cpf", type="string", example="123.456.789-00"),
 *                 @OA\Property(property="nivel_acesso", type="integer", example=3),
 *                 @OA\Property(property="created_at", type="string", example="2024-10-16T15:51:05.000000Z"),
 *                 @OA\Property(property="updated_at", type="string", example="2024-10-16T15:51:05.000000Z")
 *             )
 *         )
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Usuário não autenticado",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="Usuário não autenticado.")
 *         )
 *     )
 * )
 */


    public function profile()
    {
        $userData = auth()->user();
        return response()->json([
            'status' => 'success',
            'message' => 'Perfil do usuário',
            'data' => $userData
        ], 200);
    }

    /**
 * @OA\Post(
 *     path="/api/logout",
 *     summary="Logout do usuário autenticado",
 *     description="Efetua o logout do usuário autenticado.",
 *     tags={"Autenticação"},
 *     security={{ "sanctum": {} }},
 *     @OA\Response(
 *         response=200,
 *         description="Logout realizado com sucesso",
 *         @OA\JsonContent(
 *             @OA\Property(property="status", type="string", example="success"),
 *             @OA\Property(property="message", type="string", example="Logout realizado com sucesso")
 *         )
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Usuário não autenticado",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="Usuário não autenticado")
 *         )
 *     )
 * )
 */


    public function logout()
    {
        try {
            auth()->user()->tokens()->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Usuário deslogado com sucesso'
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro interno do servidor',
                'error' => $th->getMessage()
            ], 500);
        }
    }
}
