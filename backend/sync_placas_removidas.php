<?php
require 'conexao_pgsql.php';

date_default_timezone_set('America/Sao_Paulo');
$logPath = __DIR__ . '/log_remocoes.txt';

try {
    $mysql = new PDO(
        "mysql:host=45.151.120.3;dbname=u362384337_rasolucoes_mb;charset=utf8",
        'u362384337_rasolucoes_mb',
        'u*K7&lF?S59H'
    );
    $mysql->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    file_put_contents($logPath, "[".date('Y-m-d H:i:s')."] Erro conexão MySQL: {$e->getMessage()}\n", FILE_APPEND);
    exit;
}

$arquivoSync = __DIR__ . '/ultima_remocao.txt';
$dataSync = file_exists($arquivoSync) ? trim(file_get_contents($arquivoSync)) : '2000-01-01 00:00:00';

$stmt = $mysql->prepare("SELECT placa, created_at FROM placas_removidas WHERE created_at > ? ORDER BY created_at ASC");
$stmt->execute([$dataSync]);
$placas = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($placas as $p) {
    $del = $pdo_pg->prepare("DELETE FROM bl_placas_indesejadas WHERE placa = ?");
    $del->execute([$p['placa']]);

    $msg = "[".date('Y-m-d H:i:s')."] Removida local: {$p['placa']}\n";
    file_put_contents($logPath, $msg, FILE_APPEND);
    $ultimaData = $p['created_at'];
}

if (isset($ultimaData)) {
    file_put_contents($arquivoSync, $ultimaData);
}
