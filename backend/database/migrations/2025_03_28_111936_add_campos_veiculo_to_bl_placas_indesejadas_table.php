<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bl_placas_indesejadas', function (Blueprint $table) {
            $table->timestamp('cadastro')->nullable()->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->string('marca_modelo', 100)->nullable();
            $table->string('cor', 50)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('bl_placas_indesejadas', function (Blueprint $table) {
            $table->dropColumn(['cadastro', 'marca_modelo', 'cor']);
        });
    }
};
