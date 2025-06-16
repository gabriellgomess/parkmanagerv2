<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bl_fila_eventos', function (Blueprint $table) {
            $table->id();
            $table->timestamp('datahora')->nullable(false);
            $table->string('placaveiculo', 10)->nullable();
            $table->string('status', 15)->default('pendente');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bl_fila_eventos');
    }
};
