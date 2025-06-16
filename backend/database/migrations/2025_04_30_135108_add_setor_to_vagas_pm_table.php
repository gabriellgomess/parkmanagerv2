<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('vagas_pm', function (Blueprint $table) {
            $table->string('setor')->nullable()->after('id')->comment('Setor onde a vaga está localizada');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vagas_pm', function (Blueprint $table) {
            $table->dropColumn('setor');
        });
    }
};
