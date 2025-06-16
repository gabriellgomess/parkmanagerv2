<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // Necessário para usar DB::table()

class CreateVagasPmTable extends Migration
{
    public function up()
    {
        Schema::create('vagas_pm', function (Blueprint $table) {
            $table->id();
            $table->integer('vagas');
            $table->timestamps();
        });

        // Inserir o valor inicial de 1000
        DB::table('vagas_pm')->insert([
            'vagas' => 1200,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('vagas_pm');
    }
}
