<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MotivoAberturaController extends Controller
{
    public function index()
    {
        $motivos = DB::table('cadmotivosaberturacancela')->pluck('motivo');
        return response()->json($motivos);
    }

    public function store(Request $request)
{
    $request->validate([
        'motivo' => 'required|string|max:255'
    ]);

    DB::table('cadmotivosaberturacancela')->insert([
        'motivo' => $request->motivo
    ]);

    return response()->json(['message' => 'Motivo cadastrado com sucesso.']);
}

}
