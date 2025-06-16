<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('logs_acesso_cancela', function (Blueprint $table) {
            $table->id();
            $table->string('terminal');                 
            $table->ipAddress('ip');                     
            $table->unsignedBigInteger('user_id');
            $table->string('usuario');       
            $table->string('motivo');                    
            $table->timestamp('created_at')->useCurrent();

            // Chave estrangeira com users (ajuste se necessário)
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logs_acesso_cancela');
    }
};
