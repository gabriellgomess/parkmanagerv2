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
    Schema::table('bl_ocorrencias_indesejadas', function (Blueprint $table) {
        $table->boolean('notificado')->default(false);
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bl_ocorrencias_indesejadas', function (Blueprint $table) {
            //
        });
    }
};
