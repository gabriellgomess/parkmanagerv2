<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class LotController extends Controller
{
    public function countLots()
    {
        // Conta total geral do pátio
        $totalCount = DB::table('lot')->count();

        // Agrupa os resultados por setor
        $setores = DB::table('lot')
            ->select('setor', DB::raw('count(*) as total'))
            ->groupBy('setor')
            ->get();

        // Formatar os totais por setor para um formato mais amigável
        $totalPorSetor = [];
        foreach ($setores as $setor) {
            $totalPorSetor[$setor->setor] = $setor->total;
        }

        // Retorna o resultado como JSON
        return response()->json([
            'patio_total' => $totalCount,
            'patio_por_setor' => $totalPorSetor
        ]);
    }
}
