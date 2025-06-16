<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bl_placas_indesejadas', function (Blueprint $table) {
            $table->id();
            $table->string('placa', 10)->unique()->nullable(false);
            $table->text('motivo')->nullable();
            $table->string('usuario', 100)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bl_placas_indesejadas');
    }
};
