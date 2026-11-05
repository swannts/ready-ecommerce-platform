<?php

namespace Modules\Purchase\App\Models;

use App\Models\Product;
use App\Models\Scopes\PreOderProduct;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseProduct extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $guarded = ['id'];

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class)->withoutGlobalScope(PreOderProduct::class);
    }

    public function productSkus()
    {
        return $this->hasMany(ProductSku::class);
    }
}
