<?php
require 'conexao_pgsql.php'; // conexão com PostgreSQL

date_default_timezone_set('America/Sao_Paulo');

$mysqlHost = '45.151.120.3';
$mysqlDb   = 'u362384337_rasolucoes_mb';
$mysqlUser = 'u362384337_rasolucoes_mb';
$mysqlPass = 'u*K7&lF?S59H';

try {
    $mysql = new PDO("mysql:host=$mysqlHost;dbname=$mysqlDb;charset=utf8", $mysqlUser, $mysqlPass);
    $mysql->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erro MySQL: " . $e->getMessage());
}

$arquivoSync = __DIR__ . '/ultima_sync_envio.txt';
$dataSync = file_exists($arquivoSync) ? trim(file_get_contents($arquivoSync)) : '2000-01-01 00:00:00';

$sql = "SELECT placa, motivo, usuario, created_at, marca_modelo, cor
        FROM bl_placas_indesejadas
        WHERE created_at > :dataSync
        ORDER BY created_at ASC";

$stmt = $pdo_pg->prepare($sql);
$stmt->execute([':dataSync' => $dataSync]);
$placas = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($placas)) {
    echo "Sem novas placas.\n";
    exit;
}

$verifica = $mysql->prepare("SELECT id FROM placas_indesejadas WHERE placa = ?");
$insert = $mysql->prepare("INSERT INTO placas_indesejadas 
    (placa, motivo, usuario, garagem, created_at, marca_modelo, cor) 
    VALUES (?, ?, ?, ?, ?, ?, ?)");

$enviadas = 0;

foreach ($placas as $placa) {
    $verifica->execute([$placa['placa']]);
    if ($verifica->rowCount() === 0) {
        $insert->execute([
            $placa['placa'],
            $placa['motivo'] ?? '',
            $placa['usuario'] ?? '',
            'plaza',
            $placa['created_at'] ?? date('Y-m-d H:i:s'),
            $placa['marca_modelo'] ?? '',
            $placa['cor'] ?? ''
        ]);
        $enviadas++;
    }
}

file_put_contents($arquivoSync, end($placas)['created_at']);
echo "Enviadas $enviadas placas para a nuvem.\n";
