<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Credenciados extends Model
{
    use HasFactory;

    // Nome da tabela
    protected $table = 'cartoes';

    // Permite operações em massa em todas as colunas (opcional)
    protected $guarded = []; // ou remova $fillable completamente
}
