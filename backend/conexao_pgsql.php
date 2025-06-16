<?php
$host = '125.125.10.100';
$db   = 'parkingplus';
$user = 'postgres';
$pass = 'postgres';

try {
    $pdo_pg = new PDO("pgsql:host=$host;dbname=$db", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    echo "Erro ao conectar no PostgreSQL: " . $e->getMessage();
    exit;
}
?>
