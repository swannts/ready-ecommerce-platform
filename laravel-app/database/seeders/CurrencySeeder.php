<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currencies = [
            [
                'name' => 'BDT',
                'symbol' => '৳',
                'rate' => 1,
                'is_active' => true,
                'is_default' => true,
            ],
            [
                'name' => 'USD',
                'symbol' => '$',
                'rate' => 1,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'EUR',
                'symbol' => '€',
                'rate' => 1,
                'is_active' => true,
                'is_default' => false,
            ],
        ];

        foreach ($currencies as $currency) {
            Currency::updateOrCreate(['name' => $currency['name']], $currency);
        }

        Currency::whereNotIn('name', array_column($currencies, 'name'))->update(['is_default' => false]);
    }
}
