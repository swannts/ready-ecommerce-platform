<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Media;
use App\Models\Product;
use App\Models\Shop;
use App\Models\Unit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    private const PRODUCTS = [
        [
            'slug' => 'royal-aged-basmati-rice-xxl',
            'name' => 'Royal 2-Year Aged Super Kernel Basmati Rice',
            'variety' => 'Super Kernel Basmati', 'category' => 'basmati-rice',
            'brand' => 'Golden Harvest Reserve', 'supplier' => 'golden-harvest-rice-mills',
            'origin' => 'Himalayan Foothills',
            'description' => 'Naturally matured for 24 months to enhance aroma, moisture balance, and fluffiness. The slender grains expand to 20mm upon cooking without breaking.',
            'grain_type' => 'Extra Long', 'processing_type' => 'Aromatic / Aged',
            'price_per_kg' => 3.40, 'min_order_kg' => 1, 'stock_kg' => 24500,
            'rating' => 4.9, 'reviews' => 142, 'popular' => true, 'organic' => true,
            'packaging' => [
                ['size' => '1 kg Bag', 'weightKg' => 1, 'price' => 3.80, 'inStock' => true],
                ['size' => '5 kg Family Sack', 'weightKg' => 5, 'price' => 17.50, 'inStock' => true],
                ['size' => '10 kg Sack', 'weightKg' => 10, 'price' => 33.00, 'inStock' => true],
                ['size' => '25 kg Commercial Bag', 'weightKg' => 25, 'price' => 77.50, 'inStock' => true],
                ['size' => '50 kg Wholesale Sack', 'weightKg' => 50, 'price' => 145.00, 'inStock' => true],
            ],
            'tiers' => [
                ['minQuantityKg' => 10, 'maxQuantityKg' => 49, 'unitPricePerKg' => 3.10, 'label' => '10–49 kg'],
                ['minQuantityKg' => 50, 'maxQuantityKg' => 499, 'unitPricePerKg' => 2.75, 'label' => '50–499 kg'],
                ['minQuantityKg' => 500, 'unitPricePerKg' => 2.35, 'label' => '500+ kg (Bulk Quote)'],
            ],
        ],
        [
            'slug' => 'premium-silky-miniket-rice',
            'name' => 'Premium Silky White Miniket Rice (Single Boiled)',
            'variety' => 'Miniket Grade A+', 'category' => 'miniket-rice',
            'brand' => 'Heritage Valley Select', 'supplier' => 'heritage-grain-cooperative',
            'origin' => 'Dinajpur, Bangladesh',
            'description' => 'Polished to perfection with zero chalkiness. Fast-cooking, light on the stomach, and ideal for daily household and restaurant use.',
            'grain_type' => 'Long Grain', 'processing_type' => 'Parboiled',
            'price_per_kg' => 1.15, 'min_order_kg' => 5, 'stock_kg' => 85000,
            'rating' => 4.8, 'reviews' => 96, 'popular' => true, 'organic' => false,
            'packaging' => [
                ['size' => '5 kg Bag', 'weightKg' => 5, 'price' => 6.00, 'inStock' => true],
                ['size' => '25 kg Sack', 'weightKg' => 25, 'price' => 27.50, 'inStock' => true],
                ['size' => '50 kg Wholesale Sack', 'weightKg' => 50, 'price' => 52.00, 'inStock' => true],
            ],
            'tiers' => [
                ['minQuantityKg' => 50, 'maxQuantityKg' => 249, 'unitPricePerKg' => 1.02, 'label' => '50–249 kg'],
                ['minQuantityKg' => 250, 'maxQuantityKg' => 999, 'unitPricePerKg' => 0.94, 'label' => '250–999 kg'],
                ['minQuantityKg' => 1000, 'unitPricePerKg' => 0.88, 'label' => '1 MT+ (Wholesale)'],
            ],
        ],
        [
            'slug' => 'heirloom-traditional-nazirshail-rice',
            'name' => 'Heirloom Traditional Nazirshail Unpolished Long Grain',
            'variety' => 'Nazirshail', 'category' => 'nazirshail-rice',
            'brand' => 'Bengal Harvest', 'supplier' => 'heritage-grain-cooperative',
            'origin' => 'Barisal, Bangladesh',
            'description' => 'Pointed tips, firm consistency, and nutrient-dense fiber. Does not turn mushy even when reheated.',
            'grain_type' => 'Long Grain', 'processing_type' => 'Raw / White',
            'price_per_kg' => 1.30, 'min_order_kg' => 5, 'stock_kg' => 32000,
            'rating' => 4.7, 'reviews' => 64, 'popular' => false, 'organic' => false,
            'packaging' => [
                ['size' => '5 kg Sack', 'weightKg' => 5, 'price' => 6.80, 'inStock' => true],
                ['size' => '25 kg Sack', 'weightKg' => 25, 'price' => 31.00, 'inStock' => true],
                ['size' => '50 kg Sack', 'weightKg' => 50, 'price' => 60.00, 'inStock' => true],
            ],
            'tiers' => [
                ['minQuantityKg' => 50, 'maxQuantityKg' => 499, 'unitPricePerKg' => 1.12, 'label' => '50–499 kg'],
                ['minQuantityKg' => 500, 'unitPricePerKg' => 1.02, 'label' => '500+ kg'],
            ],
        ],
        [
            'slug' => 'chinigura-fragrant-polao-rice',
            'name' => 'Sun-Dried Chinigura Aromatic Rice (Aged 1 Year)',
            'variety' => 'Chinigura / Kalijira', 'category' => 'aromatic-rice',
            'brand' => 'Shahi Dastarkhwan', 'supplier' => 'golden-harvest-rice-mills',
            'origin' => 'Dinajpur, Bangladesh',
            'description' => 'Tiny, pearl-like grains renowned for sweet floral fragrance. The essential ingredient for festive royal biryani, payesh, and wedding feasts.',
            'grain_type' => 'Short Grain', 'processing_type' => 'Aromatic / Aged',
            'price_per_kg' => 2.10, 'min_order_kg' => 1, 'stock_kg' => 18000,
            'rating' => 4.95, 'reviews' => 215, 'popular' => true, 'organic' => false,
            'packaging' => [
                ['size' => '1 kg Pack', 'weightKg' => 1, 'price' => 2.25, 'inStock' => true],
                ['size' => '5 kg Box', 'weightKg' => 5, 'price' => 10.50, 'inStock' => true],
                ['size' => '25 kg Sack', 'weightKg' => 25, 'price' => 48.00, 'inStock' => true],
            ],
            'tiers' => [
                ['minQuantityKg' => 25, 'maxQuantityKg' => 99, 'unitPricePerKg' => 1.88, 'label' => '25–99 kg'],
                ['minQuantityKg' => 100, 'maxQuantityKg' => 499, 'unitPricePerKg' => 1.72, 'label' => '100–499 kg'],
                ['minQuantityKg' => 500, 'unitPricePerKg' => 1.58, 'label' => '500+ kg'],
            ],
        ],
        [
            'slug' => 'kalijira-fragrant-rice-premium',
            'name' => 'Premium Kalijira Fragrant Rice',
            'variety' => 'Kalijira', 'category' => 'aromatic-rice',
            'brand' => 'Shahi Dastarkhwan', 'supplier' => 'heritage-grain-cooperative',
            'origin' => 'Dinajpur, Bangladesh',
            'description' => 'Small-grain Kalijira rice with a delicate fragrance, selected for pilaf, celebratory meals, and traditional rice desserts.',
            'grain_type' => 'Short Grain', 'processing_type' => 'Aromatic / Aged',
            'price_per_kg' => 2.35, 'min_order_kg' => 2, 'stock_kg' => 12600,
            'rating' => 4.75, 'reviews' => 38, 'popular' => true, 'organic' => false,
            'packaging' => [
                ['size' => '2 kg Pouch', 'weightKg' => 2, 'price' => 4.90, 'inStock' => true],
                ['size' => '10 kg Sack', 'weightKg' => 10, 'price' => 23.00, 'inStock' => true],
                ['size' => '25 kg Commercial Sack', 'weightKg' => 25, 'price' => 56.25, 'inStock' => true],
            ],
            'tiers' => [
                ['minQuantityKg' => 25, 'maxQuantityKg' => 99, 'unitPricePerKg' => 2.12, 'label' => '25–99 kg'],
                ['minQuantityKg' => 100, 'maxQuantityKg' => 499, 'unitPricePerKg' => 1.96, 'label' => '100–499 kg'],
                ['minQuantityKg' => 500, 'unitPricePerKg' => 1.82, 'label' => '500+ kg'],
            ],
        ],
        [
            'slug' => 'golden-parboiled-miniket-rice',
            'name' => 'Golden Parboiled Miniket Rice',
            'variety' => 'Miniket Parboiled', 'category' => 'parboiled-rice',
            'brand' => 'Golden Harvest Reserve', 'supplier' => 'golden-harvest-rice-mills',
            'origin' => 'Rangpur, Bangladesh',
            'description' => 'Parboiled long-grain Miniket for everyday meals, with separate grains and reliable cooking performance.',
            'grain_type' => 'Long Grain', 'processing_type' => 'Parboiled',
            'price_per_kg' => 1.05, 'min_order_kg' => 5, 'stock_kg' => 64000,
            'rating' => 4.55, 'reviews' => 51, 'popular' => true, 'organic' => false,
            'packaging' => [
                ['size' => '5 kg Bag', 'weightKg' => 5, 'price' => 5.50, 'inStock' => true],
                ['size' => '25 kg Sack', 'weightKg' => 25, 'price' => 26.00, 'inStock' => true],
                ['size' => '50 kg Wholesale Sack', 'weightKg' => 50, 'price' => 50.00, 'inStock' => true],
            ],
            'tiers' => [
                ['minQuantityKg' => 50, 'maxQuantityKg' => 249, 'unitPricePerKg' => 0.96, 'label' => '50–249 kg'],
                ['minQuantityKg' => 250, 'maxQuantityKg' => 999, 'unitPricePerKg' => 0.89, 'label' => '250–999 kg'],
                ['minQuantityKg' => 1000, 'unitPricePerKg' => 0.83, 'label' => '1 MT+'],
            ],
        ],
        [
            'slug' => 'heritage-steamed-parboiled-rice',
            'name' => 'Heritage Steamed Parboiled Rice',
            'variety' => 'Traditional Parboiled', 'category' => 'parboiled-rice',
            'brand' => 'Bengal Harvest', 'supplier' => 'heritage-grain-cooperative',
            'origin' => 'Barisal, Bangladesh',
            'description' => 'Traditional steamed rice sourced through the cooperative for family kitchens and high-volume food service.',
            'grain_type' => 'Long Grain', 'processing_type' => 'Parboiled',
            'price_per_kg' => 0.98, 'min_order_kg' => 10, 'stock_kg' => 41800,
            'rating' => 4.45, 'reviews' => 27, 'popular' => false, 'organic' => false,
            'packaging' => [
                ['size' => '10 kg Sack', 'weightKg' => 10, 'price' => 10.50, 'inStock' => true],
                ['size' => '25 kg Sack', 'weightKg' => 25, 'price' => 25.50, 'inStock' => true],
                ['size' => '50 kg Sack', 'weightKg' => 50, 'price' => 49.00, 'inStock' => true],
            ],
            'tiers' => [
                ['minQuantityKg' => 50, 'maxQuantityKg' => 249, 'unitPricePerKg' => 0.91, 'label' => '50–249 kg'],
                ['minQuantityKg' => 250, 'maxQuantityKg' => 999, 'unitPricePerKg' => 0.84, 'label' => '250–999 kg'],
                ['minQuantityKg' => 1000, 'unitPricePerKg' => 0.79, 'label' => '1 MT+'],
            ],
        ],
        [
            'slug' => 'sweet-glutinous-sticky-rice',
            'name' => 'Sweet Glutinous Sticky Rice',
            'variety' => 'Glutinous White Rice', 'category' => 'sticky-rice',
            'brand' => 'River Delta Select', 'supplier' => 'heritage-grain-cooperative',
            'origin' => 'Sylhet, Bangladesh',
            'description' => 'Soft, sticky short grains for rice cakes, steamed desserts, and specialty recipes.',
            'grain_type' => 'Short Grain', 'processing_type' => 'Raw / White',
            'price_per_kg' => 1.75, 'min_order_kg' => 2, 'stock_kg' => 9400,
            'rating' => 4.6, 'reviews' => 19, 'popular' => false, 'organic' => false,
            'packaging' => [
                ['size' => '2 kg Bag', 'weightKg' => 2, 'price' => 3.70, 'inStock' => true],
                ['size' => '10 kg Sack', 'weightKg' => 10, 'price' => 18.00, 'inStock' => true],
                ['size' => '25 kg Sack', 'weightKg' => 25, 'price' => 43.75, 'inStock' => true],
            ],
            'tiers' => [
                ['minQuantityKg' => 25, 'maxQuantityKg' => 99, 'unitPricePerKg' => 1.59, 'label' => '25–99 kg'],
                ['minQuantityKg' => 100, 'maxQuantityKg' => 499, 'unitPricePerKg' => 1.47, 'label' => '100–499 kg'],
                ['minQuantityKg' => 500, 'unitPricePerKg' => 1.35, 'label' => '500+ kg'],
            ],
        ],
        [
            'slug' => 'royal-indus-sella-basmati-rice',
            'name' => 'Royal Indus Golden Sella Basmati Rice',
            'variety' => 'Golden Sella Basmati', 'category' => 'basmati-rice',
            'brand' => 'Royal Indus Select', 'supplier' => 'royal-indus-mills',
            'origin' => 'Punjab, India',
            'description' => 'Golden sella basmati with long, resilient grains suited to biryani kitchens and bulk catering.',
            'grain_type' => 'Extra Long', 'processing_type' => 'Parboiled',
            'price_per_kg' => 2.85, 'min_order_kg' => 5, 'stock_kg' => 52000,
            'rating' => 4.85, 'reviews' => 73, 'popular' => true, 'organic' => false,
            'packaging' => [
                ['size' => '5 kg Bag', 'weightKg' => 5, 'price' => 14.75, 'inStock' => true],
                ['size' => '25 kg Sack', 'weightKg' => 25, 'price' => 71.25, 'inStock' => true],
                ['size' => '50 kg Export Sack', 'weightKg' => 50, 'price' => 140.00, 'inStock' => true],
            ],
            'tiers' => [
                ['minQuantityKg' => 50, 'maxQuantityKg' => 249, 'unitPricePerKg' => 2.63, 'label' => '50–249 kg'],
                ['minQuantityKg' => 250, 'maxQuantityKg' => 999, 'unitPricePerKg' => 2.44, 'label' => '250–999 kg'],
                ['minQuantityKg' => 1000, 'unitPricePerKg' => 2.28, 'label' => '1 MT+'],
            ],
        ],
        [
            'slug' => 'brown-miniket-wholegrain-rice',
            'name' => 'Brown Miniket Wholegrain Rice',
            'variety' => 'Wholegrain Miniket', 'category' => 'miniket-rice',
            'brand' => 'River Delta Select', 'supplier' => 'golden-harvest-rice-mills',
            'origin' => 'Dinajpur, Bangladesh',
            'description' => 'Milled with the bran layer retained for customers seeking a hearty wholegrain rice option.',
            'grain_type' => 'Long Grain', 'processing_type' => 'Brown / Wholegrain',
            'price_per_kg' => 1.48, 'min_order_kg' => 2, 'stock_kg' => 16700,
            'rating' => 4.35, 'reviews' => 22, 'popular' => false, 'organic' => false,
            'packaging' => [
                ['size' => '2 kg Pouch', 'weightKg' => 2, 'price' => 3.10, 'inStock' => true],
                ['size' => '10 kg Sack', 'weightKg' => 10, 'price' => 15.20, 'inStock' => true],
                ['size' => '25 kg Sack', 'weightKg' => 25, 'price' => 36.25, 'inStock' => true],
            ],
            'tiers' => [
                ['minQuantityKg' => 25, 'maxQuantityKg' => 99, 'unitPricePerKg' => 1.36, 'label' => '25–99 kg'],
                ['minQuantityKg' => 100, 'maxQuantityKg' => 499, 'unitPricePerKg' => 1.25, 'label' => '100–499 kg'],
                ['minQuantityKg' => 500, 'unitPricePerKg' => 1.16, 'label' => '500+ kg'],
            ],
        ],
        [
            'slug' => 'barisal-nazirshail-family-rice',
            'name' => 'Barisal Nazirshail Family Rice',
            'variety' => 'Barisal Nazirshail', 'category' => 'nazirshail-rice',
            'brand' => 'Bengal Harvest', 'supplier' => 'heritage-grain-cooperative',
            'origin' => 'Barisal, Bangladesh',
            'description' => 'A clean, everyday Nazirshail selection with a firm bite and distinct grains after cooking.',
            'grain_type' => 'Long Grain', 'processing_type' => 'Raw / White',
            'price_per_kg' => 1.22, 'min_order_kg' => 5, 'stock_kg' => 28300,
            'rating' => 4.5, 'reviews' => 31, 'popular' => false, 'organic' => false,
            'packaging' => [
                ['size' => '5 kg Bag', 'weightKg' => 5, 'price' => 6.40, 'inStock' => true],
                ['size' => '25 kg Sack', 'weightKg' => 25, 'price' => 29.50, 'inStock' => true],
                ['size' => '50 kg Sack', 'weightKg' => 50, 'price' => 57.00, 'inStock' => true],
            ],
            'tiers' => [
                ['minQuantityKg' => 50, 'maxQuantityKg' => 249, 'unitPricePerKg' => 1.12, 'label' => '50–249 kg'],
                ['minQuantityKg' => 250, 'maxQuantityKg' => 999, 'unitPricePerKg' => 1.04, 'label' => '250–999 kg'],
                ['minQuantityKg' => 1000, 'unitPricePerKg' => 0.97, 'label' => '1 MT+'],
            ],
        ],
    ];

    public function run(): void
    {
        $slugs = array_column(self::PRODUCTS, 'slug');
        Product::withoutGlobalScopes()->whereNotIn('slug', $slugs)->update(['is_active' => false]);

        foreach (self::PRODUCTS as $item) {
            $shop = Shop::where('supplier_slug', $item['supplier'])->firstOrFail();
            $category = Category::where('slug', $item['category'])->firstOrFail();
            $brand = Brand::where('slug', Str::slug($item['brand']))->firstOrFail();
            $media = Media::firstOrCreate(
                ['src' => 'rice-catalog/'.basename($category->display_image)],
                ['type' => 'image', 'name' => $item['variety'], 'extention' => 'svg']
            );
            $unit = Unit::where('shop_id', $shop->id)->where('name', 'kg')->first()
                ?? Unit::where('name', 'kg')->firstOrFail();

            $product = Product::withTrashed()->updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'shop_id' => $shop->id,
                    'media_id' => $media->id,
                    'brand_id' => $brand->id,
                    'unit_id' => $unit->id,
                    'name' => $item['name'],
                    'name_ar' => $item['name'],
                    'short_description' => $item['description'],
                    'description' => $item['description'],
                    'short_description_ar' => $item['description'],
                    'description_ar' => $item['description'],
                    'price' => $item['price_per_kg'],
                    'retail_price_per_kg' => $item['price_per_kg'],
                    'discount_price' => 0,
                    'quantity' => $item['stock_kg'],
                    'available_stock_kg' => $item['stock_kg'],
                    'catalog_rating' => $item['rating'],
                    'catalog_review_count' => $item['reviews'],
                    'is_active' => true,
                    'is_approve' => true,
                    'is_digital' => false,
                    'variety' => $item['variety'],
                    'origin' => $item['origin'],
                    'grain_type' => $item['grain_type'],
                    'processing_type' => $item['processing_type'],
                    'packaging_options' => $item['packaging'],
                    'wholesale_tiers' => $item['tiers'],
                    'min_order_quantity_kg' => $item['min_order_kg'],
                    'is_popular' => $item['popular'],
                    'is_organic' => $item['organic'],
                    'deleted_at' => null,
                ]
            );

            $product->categories()->sync([$category->id]);
            $product->colors()->detach();
            $product->sizes()->detach();
        }
    }
}
