<?php

date_default_timezone_set('America/Sao_Paulo');

require 'conexao_pgsql.php'; // conexão com PostgreSQL

$logPath = __DIR__ . '/execucao_recebe.log';
file_put_contents($logPath, date('Y-m-d H:i:s') . " - Iniciando sincronização da nuvem\n", FILE_APPEND);

// Conexão com MySQL remoto
$mysqlHost = '45.151.120.3';
$mysqlDb   = 'u362384337_rasolucoes_mb';
$mysqlUser = 'u362384337_rasolucoes_mb';
$mysqlPass = 'u*K7&lF?S59H';

try {
    $mysql = new PDO("mysql:host=$mysqlHost;dbname=$mysqlDb;charset=utf8", $mysqlUser, $mysqlPass);
    $mysql->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    file_put_contents($logPath, date('Y-m-d H:i:s') . " - Erro MySQL: " . $e->getMessage() . "\n", FILE_APPEND);
    die("Erro MySQL: " . $e->getMessage());
}

// Data da última sincronização
$arquivoSync = __DIR__ . '/ultima_sincronizacao.txt';
$dataSync = file_exists($arquivoSync) ? trim(file_get_contents($arquivoSync)) : '2000-01-01 00:00:00';

file_put_contents($logPath, date('Y-m-d H:i:s') . " - Última data: $dataSync\n", FILE_APPEND);

// Buscar novas placas no MySQL remoto
$sql = "SELECT placa, motivo, usuario, created_at, marca_modelo, cor 
        FROM placas_indesejadas
        WHERE created_at > :dataSync
        ORDER BY created_at ASC";

$stmt = $mysql->prepare($sql);
$stmt->execute([':dataSync' => $dataSync]);
$placas = $stmt->fetchAll(PDO::FETCH_ASSOC);

file_put_contents($logPath, date('Y-m-d H:i:s') . " - Encontradas " . count($placas) . " novas placas\n", FILE_APPEND);

if (empty($placas)) {
    echo "Sem novas placas para importar.";
    exit;
}

$ultimaData = $dataSync;

foreach ($placas as $placa) {
    // Verifica se já existe no PostgreSQL
    $verifica = $pdo_pg->prepare("SELECT id FROM bl_placas_indesejadas WHERE placa = ?");
    $verifica->execute([$placa['placa']]);

    if ($verifica->rowCount() === 0) {
        $insert = $pdo_pg->prepare("INSERT INTO bl_placas_indesejadas 
            (placa, motivo, usuario, created_at, cadastro, marca_modelo, cor) 
            VALUES (?, ?, ?, ?, ?, ?, ?)");

        $insert->execute([
            $placa['placa'],
            $placa['motivo'] ?? '',
            $placa['usuario'] ?? '',
            $placa['created_at'],
            $placa['created_at'], // campo "cadastro"
            $placa['marca_modelo'] ?? '',
            $placa['cor'] ?? ''
        ]);
    }

    // Atualiza a última data para o registro mais novo
    if ($placa['created_at'] > $ultimaData) {
        $ultimaData = $placa['created_at'];
    }
}

// Atualiza o arquivo com a última data sincronizada
file_put_contents($arquivoSync, $ultimaData);
file_put_contents($logPath, date('Y-m-d H:i:s') . " - Sincronização concluída. Última data salva: $ultimaData\n", FILE_APPEND);

echo "Sincronização finalizada com sucesso. " . count($placas) . " registros lidos.";
