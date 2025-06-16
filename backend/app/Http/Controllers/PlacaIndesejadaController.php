<?php

namespace App\Http\Controllers;

use App\Models\PlacaIndesejada;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PlacaIndesejadaController extends Controller
{
    public function index()
    {
        $placas = PlacaIndesejada::orderBy('created_at', 'desc')->get();
        return response()->json($placas);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'placa' => 'required|string|max:8',
            'motivo' => 'nullable|string|max:255',
            'marca_modelo' => 'nullable|string|max:255',
            'cor' => 'nullable|string|max:255'
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        if (PlacaIndesejada::where('placa', $request->placa)->exists()) {
            return response()->json(['error' => 'Placa já cadastrada.'], 409);
        }
    
        $data = $request->all();
        $data['cadastro'] = now();
        $data['usuario'] = auth()->user()->name ?? auth()->user()->email; // pega nome ou email
    
        $placa = PlacaIndesejada::create($data);
    
        return response()->json($placa, 201);
    }
    


    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'placa' => 'required|string|max:8',
            'motivo' => 'nullable|string|max:255',
            'marca_modelo' => 'nullable|string|max:255',
            'cor' => 'nullable|string|max:255'
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        $placa = PlacaIndesejada::findOrFail($id);
    
        $data = $request->all();
        $data['usuario'] = auth()->user()->name ?? auth()->user()->email;
    
        $placa->update($data);
    
        return response()->json($placa);
    }
    

   

    public function destroy($id)
{
    $placa = PlacaIndesejada::findOrFail($id);
    $placaTexto = $placa->placa;
    $usuario = auth()->user()->name ?? auth()->user()->email;
    $motivo = $placa->motivo ?? '';
    $origem = $placa->usuario ?? 'sistema';

    // 1. Exclui localmente
    try {
        $placa->delete();
    } catch (\Exception $e) {
        Log::error("Erro ao excluir localmente a placa {$placaTexto}: " . $e->getMessage());
        return response()->json([
            'status' => 'error',
            'message' => 'Erro ao excluir a placa localmente.'
        ], 500);
    }

    // 2. Registra na tabela de placas removidas no banco remoto
    try {
        DB::connection('remoto')->table('placas_removidas')->insert([
            'placa' => $placaTexto,
            'usuario' => $usuario,
            'motivo' => $motivo,
            'origem' => $origem,
            'created_at' => now(),
        ]);
    } catch (\Exception $e) {
        Log::warning("Placa {$placaTexto} excluída localmente, mas falhou ao registrar na nuvem: " . $e->getMessage());
    }

    return response()->json(null, 204);
}
    
}
