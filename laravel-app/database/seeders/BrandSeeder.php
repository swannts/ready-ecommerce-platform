<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    private const BRANDS = [
        'Golden Harvest Reserve',
        'Heritage Valley Select',
        'Bengal Harvest',
        'Shahi Dastarkhwan',
        'River Delta Select',
        'Royal Indus Select',
    ];

    public function run(): void
    {
        $shop = User::role('root')->whereHas('shop')->first()?->shop;
        $slugs = array_map(Str::slug(...), self::BRANDS);

        Brand::whereNotIn('slug', $slugs)->update(['is_active' => false]);

        foreach (self::BRANDS as $name) {
            Brand::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'name_ar' => $name,
                    'shop_id' => $shop?->id,
                    'is_default' => true,
                    'is_active' => true,
                ]
            );
        }
    }
}
