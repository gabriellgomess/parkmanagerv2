<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bl_fila_eventos', function (Blueprint $table) {
            $table->string('numero_tiquete_acesso')->nullable();
            $table->integer('idterminal')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('bl_fila_eventos', function (Blueprint $table) {
            $table->dropColumn(['numero_tiquete_acesso', 'idterminal']);
        });
    }
};
