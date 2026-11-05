<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    private const CATEGORIES = [
        [
            'name' => 'Basmati Rice', 'slug' => 'basmati-rice', 'tagline' => 'Aged Himalayan Fragrance',
            'description' => 'Slender, fragrant extra-long grains that elongate twice their size upon cooking. Ideal for Biryani, Pulao, and gourmet dining.',
            'grain_detail' => 'Extra Long & Slender', 'popular_uses' => 'Biryani, Polao, Special Occasions',
            'display_image' => 'rice-catalog/basmati.svg', 'color_bg' => 'from-[#F7F3EA] to-[#EFE7D8]',
        ],
        [
            'name' => 'Miniket Rice', 'slug' => 'miniket-rice', 'tagline' => 'Fine Daily Household Staple',
            'description' => 'Polished, slender white rice loved for its delicate texture, quick cooking time, and everyday versatile culinary pairing.',
            'grain_detail' => 'Slender & Silky White', 'popular_uses' => 'Daily Meals, Curries, Stir Fry',
            'display_image' => 'rice-catalog/miniket.svg', 'color_bg' => 'from-[#F4EFE6] to-[#EAE0D0]',
        ],
        [
            'name' => 'Nazirshail Rice', 'slug' => 'nazirshail-rice', 'tagline' => 'Heritage Firm Texture',
            'description' => 'Traditional long-grain variety with a firm, non-sticky bite. Retains distinct grains with exceptional nutritional value.',
            'grain_detail' => 'Pointed Long Grain', 'popular_uses' => 'Traditional Asian Fare, Fish Curries',
            'display_image' => 'rice-catalog/nazirshail.svg', 'color_bg' => 'from-[#F6F1E7] to-[#ECE2CF]',
        ],
        [
            'name' => 'Aromatic Rice', 'slug' => 'aromatic-rice', 'tagline' => 'Chinigura & Kalijira Gems',
            'description' => 'Tiny, highly fragrant pearls with unmatched floral perfume. The gold standard for festive desserts, Kheer, and royal Pilaf.',
            'grain_detail' => 'Short Fragrant Pearl', 'popular_uses' => 'Kheer, Payesh, Morog Polao',
            'display_image' => 'rice-catalog/aromatic.svg', 'color_bg' => 'from-[#F7F2E8] to-[#EBE0CD]',
        ],
        [
            'name' => 'Parboiled Rice', 'slug' => 'parboiled-rice', 'tagline' => 'Nutrient-Dense Steamed Grain',
            'description' => 'Steamed inside the husk before milling to drive vitamins and minerals straight into the grain kernel. High fiber and low GI.',
            'grain_detail' => 'Golden Translucent Grain', 'popular_uses' => 'Health-Conscious Households, Bulk Messes',
            'display_image' => 'rice-catalog/parboiled.svg', 'color_bg' => 'from-[#F5EFE3] to-[#E9DFCE]',
        ],
        [
            'name' => 'Sticky Rice', 'slug' => 'sticky-rice', 'tagline' => 'Glutinous Specialty Rice',
            'description' => 'High-amylopectin sweet grain that tenderly adheres together when steamed. Essential for Asian desserts, sushi, and dumplings.',
            'grain_detail' => 'Opaque Round Grain', 'popular_uses' => 'Mango Sticky Rice, Rice Cakes, Dim Sum',
            'display_image' => 'rice-catalog/sticky.svg', 'color_bg' => 'from-[#F8F4EC] to-[#EFE5D3]',
        ],
    ];

    public function run(): void
    {
        Category::whereNotIn('slug', array_column(self::CATEGORIES, 'slug'))
            ->update(['status' => false]);

        $rootShop = User::role('root')->whereHas('shop')->first()?->shop;

        foreach (self::CATEGORIES as $order => $data) {
            $category = Category::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    ...$data,
                    'category_thumbnail' => $data['display_image'],
                    'icon' => $data['display_image'],
                    'status' => true,
                    'order_by' => $order + 1,
                ]
            );

            if ($rootShop) {
                $rootShop->categories()->syncWithoutDetaching([$category->id]);
            }
        }

        foreach (Shop::whereNotNull('supplier_slug')->get() as $supplierShop) {
            $supplierShop->categories()->sync(Category::where('status', true)->pluck('id'));
        }
    }
}
