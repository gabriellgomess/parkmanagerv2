<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setor;

class SetorController extends Controller
{
    public function listarNomes()
    {
        $setores = Setor::select('nome')->orderBy('nome')->get();
        return response()->json($setores);
    }
}
