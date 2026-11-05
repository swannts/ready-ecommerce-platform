<?php

namespace Database\Seeders;

use App\Models\Media;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ShopSeeder extends Seeder
{
    private const SUPPLIERS = [
        [
            'code' => 'sup-golden-harvest', 'slug' => 'golden-harvest-rice-mills', 'name' => 'Golden Harvest Agro Mills',
            'type' => 'Mill', 'address' => 'Dinajpur, Northern Division', 'country' => 'Bangladesh',
            'verified' => true, 'established' => 1988, 'capacity' => 1200,
            'rating' => 4.9, 'review_count' => 0,
            'certifications' => ['HACCP Certified', 'ISO 22000', 'Organic Certified'],
        ],
        [
            'code' => 'sup-heritage-grain', 'slug' => 'heritage-grain-cooperative', 'name' => 'Heritage Valley Farmer Cooperative',
            'type' => 'Farmer Cooperative', 'address' => 'Barisal River Delta', 'country' => 'Bangladesh',
            'verified' => true, 'established' => 2004, 'capacity' => 650,
            'rating' => 4.8, 'review_count' => 0,
            'certifications' => ['Fair Trade', 'Non-GMO Project', 'GAP Standard'],
        ],
        [
            'code' => 'sup-royal-basmati', 'slug' => 'royal-indus-mills', 'name' => 'Royal Indus Premium Grain Export',
            'type' => 'Distributor', 'address' => 'Punjab Agricultural Belt', 'country' => 'India / Regional Hub',
            'verified' => true, 'established' => 1976, 'capacity' => 3000,
            'rating' => 4.95, 'review_count' => 0,
            'certifications' => ['BRCGS Food Safety', 'FDA Registered', 'Halal Certified'],
        ],
    ];

    public function run(): void
    {
        $this->call(RootAdminShopSeeder::class);

        foreach (self::SUPPLIERS as $supplier) {
            $email = Str::slug($supplier['name']).'@ricemart.local';
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $supplier['name'],
                    'phone' => 'rice-'.substr(sha1($supplier['slug']), 0, 8),
                    'password' => Hash::make(Str::random(40)),
                    'is_active' => true,
                ]
            );

            $user->assignRole('shop');

            $logo = Media::firstOrCreate(
                ['src' => 'rice-catalog/mill-facility.svg'],
                ['type' => 'image', 'name' => 'RiceMart supplier', 'extention' => 'svg']
            );
            $banner = Media::firstOrCreate(
                ['src' => 'rice-catalog/hero-rice-composition.svg'],
                ['type' => 'image', 'name' => 'RiceMart rice catalog', 'extention' => 'svg']
            );

            Shop::withTrashed()->updateOrCreate(
                ['supplier_slug' => $supplier['slug']],
                [
                    'user_id' => $user->id,
                    'name' => $supplier['name'],
                    'name_ar' => $supplier['name'],
                    'supplier_code' => $supplier['code'],
                    'logo_id' => $logo->id,
                    'banner_id' => $banner->id,
                    'supplier_type' => $supplier['type'],
                    'address' => $supplier['address'],
                    'country' => $supplier['country'],
                    'supplier_verified' => $supplier['verified'],
                    'supplier_rating' => $supplier['rating'],
                    'supplier_review_count' => $supplier['review_count'],
                    'established_year' => $supplier['established'],
                    'capacity_metric_tons_monthly' => $supplier['capacity'],
                    'certifications' => $supplier['certifications'],
                    'description' => $supplier['name'],
                    'status' => true,
                    'delivery_charge' => 0,
                    'min_order_amount' => 1,
                    'opening_time' => '00:00:00',
                    'closing_time' => '23:59:59',
                    'estimated_delivery_time' => 3,
                    'deleted_at' => null,
                ]
            );
        }
    }
}
