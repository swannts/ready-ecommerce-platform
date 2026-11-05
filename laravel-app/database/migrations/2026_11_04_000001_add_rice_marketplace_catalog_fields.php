<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('tagline')->nullable();
            $table->string('grain_detail')->nullable();
            $table->string('popular_uses')->nullable();
            $table->string('display_image')->nullable();
            $table->string('color_bg')->nullable();
        });

        Schema::table('shops', function (Blueprint $table) {
            $table->string('supplier_slug')->nullable()->unique();
            $table->string('supplier_type')->nullable();
            $table->string('country')->nullable();
            $table->boolean('supplier_verified')->default(false);
            $table->unsignedSmallInteger('established_year')->nullable();
            $table->unsignedInteger('capacity_metric_tons_monthly')->nullable();
            $table->json('certifications')->nullable();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('variety')->nullable();
            $table->string('origin')->nullable();
            $table->string('grain_type')->nullable();
            $table->string('processing_type')->nullable();
            $table->decimal('retail_price_per_kg', 10, 2)->nullable();
            $table->json('packaging_options')->nullable();
            $table->json('wholesale_tiers')->nullable();
            $table->unsignedInteger('min_order_quantity_kg')->nullable();
            $table->unsignedInteger('available_stock_kg')->nullable();
            $table->decimal('catalog_rating', 3, 2)->nullable();
            $table->unsignedInteger('catalog_review_count')->nullable();
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_organic')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'variety', 'origin', 'grain_type', 'processing_type',
                'retail_price_per_kg', 'packaging_options', 'wholesale_tiers',
                'min_order_quantity_kg', 'available_stock_kg', 'catalog_rating', 'catalog_review_count', 'is_popular', 'is_organic',
            ]);
        });

        Schema::table('shops', function (Blueprint $table) {
            $table->dropUnique(['supplier_slug']);
            $table->dropColumn([
                'supplier_slug', 'supplier_type', 'country', 'supplier_verified',
                'established_year', 'capacity_metric_tons_monthly', 'certifications',
            ]);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['tagline', 'grain_detail', 'popular_uses', 'display_image', 'color_bg']);
        });
    }
};
