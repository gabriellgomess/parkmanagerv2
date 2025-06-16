<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('bl_monitor_placas', function (Blueprint $table) {
            $table->id(); // Cria ID auto incrementado (integer com sequence)
            $table->string('placa', 10);
            $table->string('ip_camera', 50);
            $table->string('terminal', 100);
            $table->timestamp('data_hora')->useCurrent(); // Data obrigatória, sem time zone
        });
    }
    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bl_monitor_placas');
    }
};
