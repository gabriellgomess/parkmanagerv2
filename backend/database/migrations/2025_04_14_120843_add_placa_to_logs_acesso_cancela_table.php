<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('logs_acesso_cancela', function (Blueprint $table) {
            $table->string('placa', 10)->nullable()->after('motivo');
        });
    }

    public function down(): void
    {
        Schema::table('logs_acesso_cancela', function (Blueprint $table) {
            $table->dropColumn('placa');
        });
    }
};

