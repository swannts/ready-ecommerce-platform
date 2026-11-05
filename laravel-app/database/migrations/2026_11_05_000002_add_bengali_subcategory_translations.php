<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sub_categories', function (Blueprint $table) {
            $table->string('name_bn')->nullable();
            $table->string('short_description_bn')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('sub_categories', fn (Blueprint $table) => $table->dropColumn(['name_bn', 'short_description_bn']));
    }
};
