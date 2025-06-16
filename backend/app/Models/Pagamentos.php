<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pagamentos extends Model
{
    use HasFactory;

    // Nome da tabela
    protected $table = 'logrotativo';

    // Permite operações em massa (opcional)
    protected $guarded = []; // ou defina $fillable caso queira controlar quais campos podem ser preenchidos em massa
}
