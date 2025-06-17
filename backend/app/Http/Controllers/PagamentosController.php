<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pagamentos;
use Illuminate\Support\Facades\DB;

class PagamentosController extends Controller
{
    public function index(Request $request)
    {
        $dataInicial = $request->input('startDate');
        $dataFinal = $request->input('endDate');
        $ticket = $request->input('ticket');
        $statusPagamento = $request->input('status_pagamento');
        $desconto = $request->input('desconto');
        $order = $request->input('order');
        $nometarifa = $request->input('nometarifa');

        // Construindo a consulta principal
        $pagamentosQuery = DB::table('logrotativo as p')
            ->leftJoin('formadepagamento as fp', 'p.descformadepagamento', '=', 'fp.descricao')
            ->leftJoin('logdescontos as ld', 'p.ticket', '=', 'ld.ticket')
            ->select(
                'p.datahoraentrada',
                'p.datahorasaida',
                'p.ticket',
                'p.valorpago',
                'p.nometarifa',
                'p.desconto',
                'p.operador',
                'p.placa',
                'p.descformadepagamento',
                'p.valorrecebido',
                'ld.nome as nome_desconto',
                'ld.valor_descontado',
                DB::raw("CASE WHEN fp.descricao IS NOT NULL THEN 'pago' ELSE 'abononado' END as status_pagamento"),
                DB::raw("CASE WHEN p.desconto > 0 THEN 'true' ELSE 'false' END as possui_desconto")
            )
            ->where('p.ticket', '>', 0);

        // Filtro por data
        if ($dataInicial && $dataFinal) {
            $pagamentosQuery->whereBetween('p.datahoraentrada', [$dataInicial . ' 00:00:00', $dataFinal . ' 23:59:59']);
        } else {
            $pagamentosQuery->whereBetween('p.datahoraentrada', [now()->startOfDay(), now()->endOfDay()]);
        }

        // Filtro por ticket
        if ($ticket) {
            $pagamentosQuery->where('p.ticket', $ticket);
        }

        // Filtro por nometarifa
        if ($nometarifa) {
            $pagamentosQuery->where('p.nometarifa', $nometarifa);
        }

        // Filtro por nome do desconto e data não informada, definir ultimos 30 dias
        if ($request->input('nome_desconto') && !$dataInicial && !$dataFinal) {
            $pagamentosQuery->where(function ($query) use ($request) {
                $query->whereRaw("ld.nome = ?", [$request->input('nome_desconto')])
                    ->whereNotNull('ld.ticket')
                    ->whereBetween('p.datahoraentrada', [now()->subDays(30)->startOfDay(), now()->endOfDay()]);
            });
        }else{
            $pagamentosQuery->where(function ($query) use ($request) {
                $query->whereRaw("ld.nome = ?", [$request->input('nome_desconto')])
                    ->whereNotNull('ld.ticket');
            });
        }

        // Subconsulta para permitir o filtro no status_pagamento
        $pagamentos = DB::table(DB::raw("({$pagamentosQuery->toSql()}) as subquery"))
            ->mergeBindings($pagamentosQuery) // Para manter os bindings da consulta original
            ->select('*');

        // Filtro por status_pagamento
        if ($statusPagamento) {
            $pagamentos->where('status_pagamento', $statusPagamento);
        }

        // Filtro por desconto
        if ($desconto === 'true') {
            $pagamentos->where('possui_desconto', 'true');
        } elseif ($desconto === 'false') {
            $pagamentos->where('possui_desconto', 'false');
        }

        // Ordenação
        $pagamentos->orderBy('datahoraentrada', $order);

        // Executando a consulta
        $resultados = $pagamentos->get();

        return response()->json($resultados);
    }

    public function getDescontos()
    {
        $descontos = DB::table('logdescontos')
            ->select('nome')
            ->groupBy('nome')
            ->orderBy('nome')
            ->get();

        return response()->json($descontos);
    }
}
