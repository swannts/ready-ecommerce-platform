<?php

namespace App\Support;

class DemoCatalogImages
{
    private const CATEGORY_IMAGES = [
        'Electronics' => 'electronics.jpg',
        'Fashion & Clothing' => 'fashion.jpg',
        'Beauty & Personal Care' => 'beauty.jpg',
        'Home & Living' => 'home.jpg',
        'Grocery & Essentials' => 'grocery.jpg',
        'Toys & Games' => 'toys.jpg',
        'Sports & Outdoors' => 'sports.jpg',
        'Books & Stationery' => 'books.jpg',
        'Automotive' => 'automotive.jpg',
        'Health & Wellness' => 'grocery.jpg',
        'Jewelry & Accessories' => 'jewelry.jpg',
    ];

    public static function forCategory(string $category): string
    {
        $filename = self::CATEGORY_IMAGES[$category] ?? 'electronics.jpg';

        return 'demo-catalog/'.$filename;
    }
}
