<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VagasPm extends Model
{
    use HasFactory;

    protected $table = 'vagas_pm';
    protected $fillable = ['vagas', 'setor'];
}
