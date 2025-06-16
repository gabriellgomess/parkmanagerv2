<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EntradasSaidas extends Model
{
    use HasFactory;

    // Nome da tabela
    protected $table = 'etetickets';

    // Permite operações em massa em todas as colunas (opcional)
    protected $guarded = []; // ou remova $fillable completamente
}
