<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('name_bn')->nullable();
            $table->text('short_description_bn')->nullable();
            $table->longText('description_bn')->nullable();
        });
        Schema::table('categories', function (Blueprint $table) {
            $table->string('name_bn')->nullable();
            $table->longText('description_bn')->nullable();
        });
        Schema::table('shops', function (Blueprint $table) {
            $table->string('name_bn')->nullable();
        });
        Schema::table('brands', function (Blueprint $table) {
            $table->string('name_bn')->nullable();
        });
        Schema::table('pages', function (Blueprint $table) {
            $table->string('title_bn')->nullable();
            $table->longText('description_bn')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('products', fn (Blueprint $table) => $table->dropColumn(['name_bn', 'short_description_bn', 'description_bn']));
        Schema::table('categories', fn (Blueprint $table) => $table->dropColumn(['name_bn', 'description_bn']));
        Schema::table('shops', fn (Blueprint $table) => $table->dropColumn('name_bn'));
        Schema::table('brands', fn (Blueprint $table) => $table->dropColumn('name_bn'));
        Schema::table('pages', fn (Blueprint $table) => $table->dropColumn(['title_bn', 'description_bn']));
    }
};
