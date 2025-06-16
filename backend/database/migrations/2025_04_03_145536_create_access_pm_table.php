<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('access_pm', function (Blueprint $table) {
            $table->id();
            $table->string('garagem');
            $table->boolean('access');
            $table->timestamps();
        });

        // Insere o registro padrão
        DB::table('access_pm')->insert([
            'garagem' => 'plaza',
            'access' => true,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('access_pm');
    }
};

