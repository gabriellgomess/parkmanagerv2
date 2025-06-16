<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LogAberturaCancelaController extends Controller
{
    public function index(Request $request)
{
    $inicio = $request->query('inicio');
    $fim = $request->query('fim');

    // Se nenhum dos dois foi enviado, assumimos o dia atual
    if (!$inicio && !$fim) {
        $inicio = now()->toDateString();
        $fim = now()->toDateString();
    }

    $query = DB::table('logs_acesso_cancela');

    if ($inicio) {
        $query->whereDate('created_at', '>=', $inicio);
    }

    if ($fim) {
        $query->whereDate('created_at', '<=', $fim);
    }

    return $query->orderByDesc('created_at')->get();
}

}
