<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('sms_configs')) return;
        Schema::create('sms_configs', function (Blueprint $table) {
            $table->id();
            $table->string('provider')->unique();
            $table->json('data')->nullable();
            $table->boolean('status')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('sms_configs')) Schema::drop('sms_configs');
    }
};
