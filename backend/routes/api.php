<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;

use App\Http\Controllers\EntradasSaidasController;
use App\Http\Controllers\LogHiperController;
use App\Http\Controllers\TerminaisController;
use App\Http\Controllers\CredenciadosController;
use App\Http\Controllers\CredenciadoAcessosController;
use App\Http\Controllers\PagamentosController;
use App\Http\Controllers\LotController;
use App\Http\Controllers\BlacklistController;
use App\Http\Controllers\SetorController;
use App\Http\Controllers\VagasPmController;
use App\Http\Controllers\PlacaIndesejadaController;
use App\Http\Controllers\CancelaController;
use App\Http\Controllers\ReconhecimentoPlacaController;
use App\Http\Controllers\MotivoAberturaController;
use App\Http\Controllers\LogAberturaCancelaController;


// Rotas de Autenticação
Route::post("register", [AuthController::class, "register"]);
Route::post("login", [AuthController::class, "login"]);


// Rotas protegidas
Route::group(["middleware" => ["auth:sanctum"]], function () {
    Route::get("profile", [AuthController::class, "profile"]);
    Route::post("logout", [AuthController::class, "logout"]);

    // Rotas de Usuários (Apenas após autenticação)
    Route::get("users", [UserController::class, "index"]);
    Route::post("users", [UserController::class, "store"]);
    Route::put("users/{id}", [UserController::class, "update"]);
    Route::delete("users/{id}", [UserController::class, "destroy"]);

    // Rotas de Entradas e Saídas
    Route::get("entradas-saidas", [EntradasSaidasController::class, "index"]);
    Route::get('hiper', [LogHiperController::class, 'index']);
    Route::get('terminais', [TerminaisController::class, 'index']);

    // Rotas de Credenciados
    Route::get("credenciados", [CredenciadosController::class, "index"]);

    // Rotas de Credenciados Acessos
    Route::get("credenciado-acessos", [CredenciadoAcessosController::class, "index"]);

    // Rotas de Pagamentos
    Route::get("pagamentos", [PagamentosController::class, "index"]);

    // Rota para contagem de patio
    Route::get('patio', [LotController::class, 'countLots']);

    // Placas Indesejadas
    Route::get('blacklist/listar', [BlacklistController::class, 'listarOcorrenciasDoDia']);
    Route::get('blacklist/notify', [BlacklistController::class, 'getOcorrenciasLPR']);
    Route::get('blacklist/historico', [BlacklistController::class, 'historicoOcorrencias']);

    Route::get('vagas', [VagasPmController::class, 'show']);
    Route::put('vagas', [VagasPmController::class, 'update']);

    Route::get('setores', [SetorController::class, 'listarNomes']);

    Route::apiResource('placas-indesejadas', PlacaIndesejadaController::class);

    // Abrir cancela
    Route::post('/abrir-cancela', [CancelaController::class, 'abrirCancela'])->middleware('auth:sanctum');

    Route::get('/captura-placa', [ReconhecimentoPlacaController::class, 'capturar']);

    Route::get('/motivos-abertura', [MotivoAberturaController::class, 'index']);
    Route::post('/motivos-abertura', [MotivoAberturaController::class, 'store']);

    Route::get('/historico-cancela', [LogAberturaCancelaController::class, 'index']);
});
