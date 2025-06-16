<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Terminais extends Model
{
    use HasFactory;

    // Nome da tabela
    protected $table = 'ppmestacoes';

    // Permite operações em massa em todas as colunas
    protected $guarded = [];
}
