<?php

namespace App\Http\Controllers;

use App\Models\EntradasSaidas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EntradasSaidasController extends Controller
{
    // Método para listar todas as entradas e saídas
    public function index(Request $request)
    {
        $dataInicial = $request->input('dataA');
        $dataFinal = $request->input('dataB');
        $ticket = $request->input('ticket');
        $placa = $request->input('placa');
        $permanenciaInicial = $request->input('permanenciaInicial');
        $permanenciaFinal = $request->input('permanenciaFinal');        
        $veiculosNoPatio = filter_var($request->input('veiculosNoPatio'), FILTER_VALIDATE_BOOLEAN);
        $saidaHiper = filter_var($request->input('saidaHiper'), FILTER_VALIDATE_BOOLEAN);
        $setor = $request->input('setorSelecionado') ? $request->input('setorSelecionado') : 'todos';
        $order = $request->input('order');

        $query = EntradasSaidas::from('etetickets')
            ->leftJoin('etstickets', 'etetickets.ticket', '=', 'etstickets.ticket')
            ->select(
                'etetickets.data as etetickets_data',
                'etetickets.ticket as etetickets_ticket',
                'etetickets.placa as etetickets_placa',
                'etetickets.idterminal as etetickets_idterminal',
                'etetickets.entrada as etetickets_entrada',
                'etetickets.descricao as etetickets_descricao',
                'etetickets.cancel as etetickets_cancel',
                'etetickets.mensal as etetickets_mensal',
                'etetickets.cartaodebito as etetickets_cartaodebito',
                'etetickets.empresa as etetickets_empresa',
                'etetickets.garagem as etetickets_garagem',
                'etetickets.tipoveiculo as etetickets_tipoveiculo',
                'etetickets.tiposervico as etetickets_tiposervico',
                'etetickets.prisma as etetickets_prisma',
                'etetickets.mensalista as etetickets_mensalista',
                'etetickets.sequencia as etetickets_sequencia',
                'etetickets.setor as etetickets_setor',
                'etetickets.origemacesso as etetickets_origemacesso',
                'etetickets.comloopmotos as etetickets_comloopmotos',
                'etstickets.ticket as etstickets_ticket',
                'etstickets.data as etstickets_data',
                'etstickets.placa as etstickets_placa',
                'etstickets.dataentrada as etstickets_dataentrada',
                'etstickets.saida as etstickets_saida',
                'etstickets.descricao as etstickets_descricao',
                'etstickets.mensal as etstickets_mensal',
                'etstickets.permanencia as etstickets_permanencia',
                'etstickets.saiucomhiper as etstickets_saiucomhiper',
                'etstickets.setor as etstickets_setor',
                'etstickets.origemacesso as etstickets_origemacesso'
            );

        // Filtro por data
        if ($dataInicial && $dataFinal) {
            $query->whereBetween('etetickets.data', [$dataInicial, $dataFinal]);
        } else if (!$ticket && !$placa && !$permanenciaInicial && !$permanenciaFinal && !$veiculosNoPatio) {
            $query->whereBetween('etetickets.data', [now()->startOfDay(), now()->endOfDay()]);
        }

        // Filtro por ticket
        if ($ticket) {
            $query->where('etetickets.ticket', $ticket);
        }

        // Filtro por placa
        if ($placa) {
            $query->where('etetickets.placa', $placa);
        }

        $query->where('etetickets.mensal', '!=', 'T')
      ->where('etstickets.mensal', '!=', 'T');

        // Filtro por permanência
        if ($permanenciaInicial !== null && $permanenciaFinal !== null && !$veiculosNoPatio) {
            $query->whereBetween('etstickets.permanencia', [$permanenciaInicial, $permanenciaFinal]);
            if (!$dataInicial && !$dataFinal) {
                $query->whereBetween('etetickets.data', [now()->subDays(31), now()]);
            }
        }

        // Filtro de veículos no pátio
        if ($veiculosNoPatio) {
            $query->whereNull('etstickets.ticket');
            if (!$dataInicial && !$dataFinal) {
                $query->whereBetween('etetickets.data', [now()->subDays(31), now()]);
            }
        } else {
            // Filtro saiu com hiper (aplicado apenas quando veiculosNoPatio é falso)
            if ($saidaHiper) {
                $query->where('etstickets.saiucomhiper', true);
                if (!$dataInicial && !$dataFinal) {
                    $query->whereBetween('etetickets.data', [now()->subDays(31), now()]);
                }
            }
        }

        // Filtro por setor
        if ($setor !== 'todos') {
            $query->where('etetickets.setor', $setor);
        }

        // Ordenação
        if ($order) {
            $query->orderBy('etetickets.data', $order);
        } else {
            $query->orderBy('etetickets.data', 'desc');
        }

        

        // Executa a consulta e retorna os resultados
        $entradasSaidas = $query->get();

        return response()->json($entradasSaidas);
    }





    // Método para buscar um registro específico pelo id
    public function show($id)
    {
        $entradaSaida = EntradasSaidas::find($id);

        if (!$entradaSaida) {
            return response()->json(['error' => 'Registro não encontrado'], 404);
        }

        return response()->json($entradaSaida);
    }
}
