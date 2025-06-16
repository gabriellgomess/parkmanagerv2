<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setor extends Model
{
    use HasFactory;

    protected $table = 'ppmsetores'; // Nome real da tabela no banco
    protected $primaryKey = 'id'; // Chave primária da tabela
    public $timestamps = false; // Desativa timestamps automáticos

    protected $fillable = ['nome']; // Define quais campos podem ser preenchidos

    protected $visible = ['nome']; // Define que apenas 'nome' será retornado na API
}