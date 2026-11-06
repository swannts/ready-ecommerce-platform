<?php

namespace App\Http\Controllers\API\Seller;

use App\Enums\ReturnOderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReturnOrderDetailsResource;
use App\Http\Resources\ReturnOrderResource;
use App\Models\ReturnOrder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

class ReturnOrderController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->page;
        $perPage = $request->per_page;
        $skip = ($page * $perPage) - $perPage;
        $shop = auth()->user()->shop;

        $returnOrders = $shop->returnOrders()->latest('id');

        $total = $returnOrders->count();

        // paginate
        $returnOrders = $returnOrders->when($perPage && $page, function ($query) use ($perPage, $skip) {
            return $query->skip($skip)->take($perPage);
        })->get();

        return $this->json('returnOrders', [
            'total' => $total,
            'returnOrders' => ReturnOrderResource::collection($returnOrders),
        ]);
    }

    public function show(ReturnOrder $returnOrder)
    {
        $shop = auth()->user()->shop;

        $returnOrder = $shop->returnOrders()->where('id', $returnOrder->id)->first();
        if (! $returnOrder) {
            return $this->json('error', __('Return order not found'), 404);
        }

        return $this->json('returnOrders', [
            'returnOrders' => ReturnOrderDetailsResource::make($returnOrder),
        ]);
    }

    public function statusChange(ReturnOrder $returnOrder, Request $request)
    {
        $request->validate(['status' => ['required', new Enum(ReturnOderStatus::class)]]);

        $shop = auth()->user()->shop;
        $returnOrder = $shop->returnOrders()->whereKey($returnOrder->getKey())->first();
        if (! $returnOrder) {
            return $this->json('error', __('Return order not found'), 404);
        }
        if ($returnOrder->payment_status == 1) {
            return $this->json(__('Already paid for this order'), [], 422);
        }

        $returnOrder->update(['status' => $request->status]);

        return $this->json('success', __('Status updated successfully'));
    }
}
