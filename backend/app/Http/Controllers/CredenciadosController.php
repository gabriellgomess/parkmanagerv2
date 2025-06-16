<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Credenciados;

class CredenciadosController extends Controller
{
    public function index(Request $request)
    {
        $cartao = $request->input('cartao');
        $nome = $request->input('nome');
        $placa = $request->input('placa');

        $query = Credenciados::leftJoin('ctrplaca', 'cartoes.cartao', '=', 'ctrplaca.cartao');
        
        // Filtro por cartao
        if ($cartao) {
            $query->where('cartoes.cartao', $cartao);
        }
    
        // Filtro por nome
        if ($nome) {
            $query->where('cartoes.nome', 'like', '%' . $nome . '%');
        }
        // Filtro por placa
        if ($placa) {
            $query->where('ctrplaca.placa', 'like', '%' . $placa . '%');
        }
    
        $query->select(
            'cartoes.*', 
            'ctrplaca.cartao as p_cartao',
            'ctrplaca.placa as p_placa',
            'ctrplaca.cor as p_cor',
            'ctrplaca.marca as p_marca',
            'ctrplaca.modelo as p_modelo',
            'ctrplaca.ano as p_ano'
        )
        ->orderBy('cartoes.cartao', 'asc');
    
        $credenciados = $query->get();
        
        return response()->json($credenciados);
    }
    

    public function show($id)
    {
        return Credenciados::find($id);
    }

    public function store(Request $request)
    {
        return Credenciados::create($request->all());
    }

    public function update(Request $request, $id)
    {
        $credenciado = Credenciados::find($id);
        $credenciado->update($request->all());
        return $credenciado;
    }

    public function destroy($id)
    {
        return Credenciados::destroy($id);
    }
    
}
