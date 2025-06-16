<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class BlacklistController extends Controller
{
    /**
     * Retorna as ocorrências indesejadas do dia atual
     */
    public function listarOcorrenciasDoDia(Request $request)
    {
        try {
            $currentDate = date('Y-m-d');

            $ocorrencias = DB::table('bl_ocorrencias_indesejadas')
                ->whereRaw("datahora::text LIKE ?", ["$currentDate%"])
                ->orderByDesc('id')
                ->get();

            return response()->json($ocorrencias);
        } catch (\Exception $e) {
            \Log::error("Erro ao listar ocorrências indesejadas do dia: " . $e->getMessage());
            return response()->json(['error' => 'Erro ao buscar os dados.'], 500);
        }
    }

    /**
     * Retorna as últimas ocorrências indesejadas ainda não notificadas
     * e marca como processadas (via flag `notificado`)
     */
    public function getOcorrenciasLPR(Request $request)
    {
        try {
            $ocorrencias = DB::table('bl_ocorrencias_indesejadas')
                ->where('notificado', false)
                ->orderBy('id')
                ->limit(10)
                ->get();

            if ($ocorrencias->count() > 0) {
                DB::table('bl_ocorrencias_indesejadas')
                    ->whereIn('id', $ocorrencias->pluck('id'))
                    ->update(['notificado' => true]);
            }

            return response()->json($ocorrencias);
        } catch (\Exception $e) {
            \Log::error("Erro ao buscar novas ocorrências indesejadas: " . $e->getMessage());
            return response()->json(['error' => 'Erro ao buscar novas ocorrências.'], 500);
        }
    }

    /**
     * Retorna o histórico de ocorrências indesejadas com filtros
     */
    public function historicoOcorrencias(Request $request)
    {
        try {
            $query = DB::table('bl_ocorrencias_indesejadas');

            // limpar - da placa se houver
            $request->placa = str_replace('-', '', $request->placa);

            // Formatar data do formato 2025-04-25T03:00:00.000Z para yyyy-mm-dd HH:mm:ss
            $request->dataInicial = date('Y-m-d', strtotime($request->dataInicial));
            $request->dataFinal = date('Y-m-d', strtotime($request->dataFinal));

            $request->dataInicial = $request->dataInicial . ' 00:00:00';
            $request->dataFinal = $request->dataFinal . ' 23:59:59';

            // Filtro por data
            if ($request->has('dataInicial') && $request->has('dataFinal')) {
                $query->whereBetween('datahora', [$request->dataInicial, $request->dataFinal]);
            }            

            // Filtro por placa
            if ($request->has('placa')) {
                $query->where('placa', 'like', '%' . $request->placa . '%');
            }

            // Se não vier data nem placa
            if (!$request->has('dataInicial') && !$request->has('dataFinal') && !$request->has('placa')) {
                // Buscar dados de hoje com a data no formato yyyy-mm-dd 00:00:00
                $query->where('datahora', '>=', date('Y-m-d') . ' 00:00:00');
            }

            // Se vier dataInicial mas não dataFinal
            if ($request->has('dataInicial') && !$request->has('dataFinal')) {
                $query->where('datahora', '>=', $request->dataInicial);
            }
            
            // Se vier dataFinal mas não dataInicial
            if ($request->has('dataFinal') && !$request->has('dataInicial')) {
                $query->where('datahora', '<=', $request->dataFinal);
            }

            // Se vier dataInicial, dataFinal e placa
            if ($request->has('dataInicial') && $request->has('dataFinal') && $request->has('placa')) {
                $query->whereBetween('datahora', [$request->dataInicial, $request->dataFinal])
                    ->where('placa', 'like', '%' . $request->placa . '%');
            }

            $ocorrencias = $query->orderByDesc('datahora')->get();

            return response()->json($ocorrencias);
        } catch (\Exception $e) {
            \Log::error("Erro ao buscar histórico de ocorrências indesejadas: " . $e->getMessage());
            return response()->json(['error' => 'Erro ao buscar os dados.'], 500);
        }
    }
}
