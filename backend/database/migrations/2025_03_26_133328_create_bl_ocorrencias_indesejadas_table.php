<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bl_ocorrencias_indesejadas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_fila_evento');
            $table->string('placa', 20);
            $table->timestamp('datahora');
            $table->string('motivo')->nullable();
            $table->string('origem')->nullable(); // Ex: câmera, terminal, etc.
            $table->timestamps();

            $table->foreign('id_fila_evento')
                  ->references('id')
                  ->on('bl_fila_eventos')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bl_ocorrencias_indesejadas');
    }
};
