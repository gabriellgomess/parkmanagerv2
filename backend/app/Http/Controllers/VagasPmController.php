<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\VagasPm;

class VagasPmController extends Controller
{
    // Método para obter as vagas por setor
    public function show()
    {
        $vagas = VagasPm::all();

        if ($vagas->isEmpty()) {
            return response()->json(['message' => 'Capacidade ainda não definida'], 404);
        }

        // Agrupa as vagas por setor
        $vagasPorSetor = [];
        foreach ($vagas as $vaga) {
            $setor = $vaga->setor ?? 'Sem Setor';
            $vagasPorSetor[$setor] = $vaga->vagas;
        }

        return response()->json([
            'vagas_total' => $vagas->sum('vagas'),
            'vagas_por_setor' => $vagasPorSetor
        ], 200);
    }

    // Método para editar o valor de vagas
    public function update(Request $request)
    {
        $request->validate([
            'vagas' => 'required|integer|min:1',
            'setor' => 'nullable|string|max:255'
        ]);

        $dadosUpdate = [
            'vagas' => $request->vagas
        ];

        // Adiciona o setor aos dados de atualização, se fornecido
        if ($request->has('setor')) {
            $dadosUpdate['setor'] = $request->setor;
        }

        // Busca registro pelo setor ou cria novo
        if ($request->has('setor')) {
            $vagas = VagasPm::firstOrNew(['setor' => $request->setor]);
            $vagas->vagas = $request->vagas;
            $vagas->save();
        } else {
            // Se não tiver setor, atualiza ou cria o primeiro registro
            $vagas = VagasPm::first();
            if (!$vagas) {
                $vagas = VagasPm::create($dadosUpdate);
            } else {
                $vagas->update($dadosUpdate);
            }
        }

        return response()->json($vagas, 200);
    }
}
