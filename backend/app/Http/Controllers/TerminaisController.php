<?php

namespace App\Http\Controllers;

use App\Models\Terminais;
use Illuminate\Support\Facades\DB;

class TerminaisController extends Controller
{
    public function index()
    {
        $terminais = Terminais::leftJoin('ppmestadoestacao as estado', 'ppmestacoes.enderecoip', '=', 'estado.enderecoip')
            ->leftJoin('lpr_concentrador as lpr', 'ppmestacoes.idestacao', '=', 'lpr.estacao_id') // novo join
            ->select(
                'ppmestacoes.idestacao',
                'ppmestacoes.descricao',
                'ppmestacoes.enderecoip',
                'ppmestacoes.tipo',
                'estado.datahora',
                'estado.versaoparkingplus',
                'estado.upsince',
                'lpr.configuracoes_lpr',
                DB::raw("CASE WHEN estado.enderecoip IS NULL THEN 'offline' ELSE 'online' END as status")
            )
            ->orderBy('ppmestacoes.enderecoip')
            ->get();
    
        return response()->json($terminais);
    }
    

    public function show($id)
    {
        // Busca um terminal específico pelo ID com leftJoin e verifica o status
        $terminal = Terminais::leftJoin('ppmestadoestacao as estado', 'ppmestacoes.enderecoip', '=', 'estado.enderecoip')
            ->where('ppmestacoes.id', $id)
            ->select(
                'ppmestacoes.idestacao',
                'ppmestacoes.descricao',
                'ppmestacoes.enderecoip',
                'ppmestacoes.tipo',
                'estado.datahora',
                'estado.versaoparkingplus',
                'estado.upsince',
                DB::raw("CASE WHEN estado.enderecoip IS NULL THEN 'offline' ELSE 'online' END as status")
            )
            ->first();

        if (!$terminal) {
            return response()->json(['error' => 'Registro não encontrado'], 404);
        }

        return response()->json($terminal);
    }
}
