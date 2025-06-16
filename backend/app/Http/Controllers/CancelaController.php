<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class CancelaController extends Controller
{
    public function abrirCancela(Request $request)
    {
        $request->validate([
            'ip' => 'required|ip',
            'terminal' => 'required|string',
            'motivo' => 'required|string|max:255',
            'usuario' => 'required|string|max:255',
        ]);

        $ip = $request->ip;
        $terminal = $request->terminal;
        $motivo = $request->motivo;
        $placa = $request->placa;
        $usuario = $request->usuario;

        try {
            // $response = Http::withBasicAuth('SUPORTE', '221605')
            // ->timeout(5)
            // ->retry(2, 1000) // tenta até 3 vezes (1 + 2 retries), com 1s de intervalo
            // ->post("http://{$ip}/pdv?abrirCancela=1", []);
            // Envia o comando para a cancela
            $response = Http::withBasicAuth('SUPORTE', '221605')
                ->timeout(10)
                ->post("http://{$ip}/pdv?abrirCancela=1", []);

            $xmlString = $response->body();
            Log::debug("Resposta bruta da cancela ({$ip}): " . $xmlString);

            // Tenta interpretar o XML retornado
            try {
                $xml = simplexml_load_string($xmlString);
                $code = (string) $xml->code;
                $message = (string) $xml->message;
            } catch (\Exception $e) {
                Log::error("Erro ao interpretar XML da cancela ({$ip}): " . $e->getMessage());

                return response()->json([
                    'success' => false,
                    'message' => 'Erro ao interpretar resposta da cancela',
                    'raw' => $xmlString,
                    'error' => $e->getMessage(),
                ], 500);
            }

            // Verifica se a resposta foi realmente um sucesso
            if ($code !== '200') {
                Log::warning("Tentativa de abertura falhou no terminal {$terminal} ({$ip}): Código {$code} — {$message}");

                return response()->json([
                    'success' => false,
                    'message' => 'A cancela não respondeu com sucesso',
                    'code' => $code,
                    'detail' => $message,
                ], 400);
            }

            // Salva no banco
            DB::table('logs_acesso_cancela')->insert([
                'terminal' => $terminal,
                'ip' => $ip,
                'user_id' => auth()->id(),
                'usuario' => $usuario,
                'motivo' => $motivo,
                'placa' => $placa,
                'created_at' => now(),
            ]);

            Log::info("✅ Cancela aberta no terminal {$terminal} ({$ip}) por {$usuario}");

            return response()->json([
                'success' => true,
                'message' => 'Cancela aberta com sucesso',
                'code' => $code,
                'detail' => $message
            ]);
        } catch (\Exception $e) {
            Log::error("❌ Erro geral ao tentar abrir cancela ({$ip}): " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erro ao abrir cancela',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
