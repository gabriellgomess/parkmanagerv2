<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('cpf')->unique()->default('00000000000')->after('email');
            $table->tinyInteger('nivel_acesso')->default(1)->after('cpf');
        });

        // Atualizar o usuário admin com o CPF e nível de acesso
        DB::table('users')
            ->where('email', 'admin@admin')
            ->update([
                'cpf' => '000.000.000-00', // Substitua pelo CPF desejado
                'nivel_acesso' => 1,        // Nível de acesso 5 para administrador
            ]);
    }
    
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('cpf');
            $table->dropColumn('nivel_acesso');
        });
    }
};

