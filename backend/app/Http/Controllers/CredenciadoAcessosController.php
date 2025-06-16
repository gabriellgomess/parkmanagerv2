<?php

namespace App\Http\Controllers;

use App\Models\CredenciadoAcessos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class CredenciadoAcessosController extends Controller
{
    public function index(Request $request)
    {
        $cartao = $request->input('cartaoHistory');
        $entrada = $request->input('entrada');
        $saida = $request->input('saida');
        $permanenciaInicial = $request->input('permanenciaInicial');
        $permanenciaFinal = $request->input('permanenciaFinal');
        $order = $request->input('order');

        // Usa o modelo CredenciadoAcessos e força a conexão 'pgsql' para a consulta
        $query = CredenciadoAcessos::from('etetickets as t1')
            ->leftJoin('etstickets as t2', function ($join) {
                $join->on('t1.ticket', '=', DB::raw("SPLIT_PART(t2.ticket, ':', 2)"))
                    ->on('t1.data', '=', 't2.dataentrada');
            })
            ->select(
                't1.data as etetickets_data',
                't1.ticket as etetickets_ticket',
                't1.placa as etetickets_placa',
                't1.idterminal as etetickets_idterminal',
                't1.entrada as etetickets_entrada',
                't1.descricao as etetickets_descricao',
                't1.cancel as etetickets_cancel',
                't1.mensal as etetickets_mensal',
                't1.cartaodebito as etetickets_cartaodebito',
                't1.empresa as etetickets_empresa',
                't1.garagem as etetickets_garagem',
                't1.tipoveiculo as etetickets_tipoveiculo',
                't1.tiposervico as etetickets_tiposervico',
                't1.prisma as etetickets_prisma',
                't1.mensalista as etetickets_mensalista',
                't1.sequencia as etetickets_sequencia',
                't1.setor as etetickets_setor',
                't1.origemacesso as etetickets_origemacesso',
                't1.comloopmotos as etetickets_comloopmotos',
                't2.ticket as etstickets_ticket',
                't2.data as etstickets_data',
                't2.placa as etstickets_placa',
                't2.dataentrada as etstickets_dataentrada',
                't2.saida as etstickets_saida',
                't2.descricao as etstickets_descricao',
                't2.mensal as etstickets_mensal',
                't2.permanencia as etstickets_permanencia',
                't2.saiucomhiper as etstickets_saiucomhiper',
                't2.setor as etstickets_setor',
                't2.origemacesso as etstickets_origemacesso'
            )
            ->where('t1.mensal', 'T')
            ->where('t1.ticket', $cartao);
        if ($entrada) {
            $query->where('t1.data', '>=', $entrada);
        }
        if ($saida) {
            $query->where('t2.data', '<=', $saida);
        }
        if ($permanenciaInicial) {
            $query->where('t2.permanencia', '>=', $permanenciaInicial);
        }
        if ($permanenciaFinal) {
            $query->where('t2.permanencia', '<=', $permanenciaFinal);
        }
        $query->orderBy('t1.data', $order);



        $credenciadoAcessos = $query->get();

        return response()->json($credenciadoAcessos);
    }
}
