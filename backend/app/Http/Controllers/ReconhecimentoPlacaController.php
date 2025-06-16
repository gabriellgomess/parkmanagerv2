<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ReconhecimentoPlacaController extends Controller
{
    public function capturar(Request $request)
    {
        $cameraIp = $request->query('ip_camera');

        if (!$cameraIp) {
            return response()->json(['erro' => 'IP da câmera é obrigatório.'], 400);
        }

        $imageUrl = "http://{$cameraIp}/api/snapshot.cgi?qualidade=100";

        try {
            $response = Http::timeout(5)->get($imageUrl);

            if (!$response->successful()) {
                return response()->json(['erro' => 'Falha ao obter imagem da câmera.'], 500);
            }

            $imageData = $response->body();

            // Regex para placa no padrão brasileiro
            if (preg_match('/[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}/i', $imageData, $matches)) {
                $placa = strtoupper(str_replace('-', '', $matches[0]));

                return response()->json([
                    'placa' => $placa,
                ]);
            } else {
                return response()->json(['placa' => null, 'mensagem' => 'Nenhuma placa encontrada.']);
            }
        } catch (\Throwable $e) {
            return response()->json(['erro' => 'Erro ao processar imagem: ' . $e->getMessage()], 500);
        }
    }
}
