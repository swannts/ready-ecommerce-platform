<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Number;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $this->load(['reviews', 'orders', 'sizes', 'colors', 'unit', 'brand', 'shop', 'flashSales', 'categories']);

        $lang = $request->attributes->get('api_locale', 'en');

        $favorite = false;
        $user = Auth::guard('api')->user();

        if ($user && $user->customer) {
            $favorite = $user->customer->favorites()->where('product_id', $this->id)->exists();
        }

        $discountPercentage = $this->getDiscountPercentage($this->price, $this->discount_price);
        $totalSold = $this->orders->sum('pivot.quantity');

        $flashSale = $this->flashSales?->first();
        $flashSaleProduct = null;
        $quantity = null;

        if ($flashSale) {
            $flashSaleProduct = $flashSale?->products()->where('id', $this->id)->first();

            $quantity = $flashSaleProduct?->pivot->quantity - $flashSaleProduct->pivot->sale_quantity;

            if ($quantity == 0) {
                $quantity = null;
                $flashSaleProduct = null;
            } else {
                $discountPercentage = $flashSale?->pivot->discount;
            }
        }

        $price = $this->price;
        $discountPrice = $flashSaleProduct ? $flashSaleProduct->pivot->price : $this->discount_price;

        $name = $lang === 'bn' ? ($this->name_bn ?: $this->name) : $this->name;
        $shortDescription = $lang === 'bn' ? ($this->short_description_bn ?: $this->short_description) : $this->short_description;
        $description = $lang === 'bn' ? ($this->description_bn ?: $this->description) : $this->description;
        $brandName = $lang === 'bn' ? ($this->brand?->name_bn ?: $this->brand?->name) : $this->brand?->name;
        module_exists('PreOrder') ? $isPreorder = (bool) $this->is_preorder : $isPreorder = false;

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'is_digital' => (bool) $this->is_digital,
            'name' => $name,
            'short_description' => $shortDescription,
            'description' => $description,
            'thumbnail' => $this->thumbnail,
            'price' => (float) number_format($price, 2, '.', ''),
            'discount_price' => (float) number_format($discountPrice, 2, '.', ''),
            'discount_percentage' => (float) number_format($discountPercentage, 2, '.', ''),
            'discount_type' => $this->discount_type,
            'discount' => (float) number_format($this->discount, 2, '.', ''),
            'rating' => (float) ($this->catalog_rating ?? $this->averageRating ?? 0.0),
            'total_reviews' => (string) Number::abbreviate($this->catalog_review_count ?? $this->reviews?->count() ?? 0, maxPrecision: 2),
            'total_sold' => (string) number_format($totalSold, 0, '.', ','),
            'quantity' => (int) ($flashSaleProduct ? $quantity : $this->quantity),
            'is_favorite' => (bool) $favorite,
            'sizes' => SizeResource::collection($this->sizes),
            'colors' => ColorResource::collection($this->colors),
            'unit' => $this->unit ? UnitResource::make($this->unit) : null,
            'brand' => $brandName,
            'category_slug' => $this->categories->first()?->slug,
            'supplier_id' => $this->shop?->supplier_code,
            'supplier_slug' => $this->shop?->slug,
            'supplier_name' => $lang === 'bn' ? ($this->shop?->name_bn ?: $this->shop?->name) : $this->shop?->name,
            'supplier_verified' => (bool) $this->shop?->supplier_verified,
            'images' => [$this->thumbnail],
            'variety' => $this->variety,
            'origin' => $this->origin,
            'grain_type' => $this->grain_type,
            'processing_type' => $this->processing_type,
            'retail_price_per_kg' => $this->retail_price_per_kg !== null ? (float) $this->retail_price_per_kg : null,
            'packaging_options' => $this->packaging_options ?? [],
            'wholesale_tiers' => $this->wholesale_tiers ?? [],
            'min_order_quantity_kg' => $this->min_order_quantity_kg,
            'available_stock_kg' => $this->available_stock_kg,
            'is_popular' => (bool) $this->is_popular,
            'is_organic' => (bool) $this->is_organic,
            'is_preorder' => $isPreorder,
            'is_prepay' => (bool) $this->is_prepay ?? false,
            'shop' => ProductShopResource::make($this->shop),
        ];
    }
}
