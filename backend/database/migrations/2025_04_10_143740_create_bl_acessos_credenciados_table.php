<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('acessos_credenciados', function (Blueprint $table) {
            $table->id();
            $table->string('placa', 10);
            $table->string('nome', 100)->nullable();
            $table->string('grupo', 100)->nullable();
            $table->string('ip_camera', 20)->nullable();
            $table->string('terminal', 50)->nullable();
            $table->timestamp('datahora')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('acessos_credenciados');
    }
};
