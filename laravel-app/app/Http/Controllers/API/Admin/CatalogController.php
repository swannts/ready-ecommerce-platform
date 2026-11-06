<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Color;
use App\Models\Shop;
use App\Models\Size;
use App\Models\SubCategory;
use App\Models\Unit;
use App\Models\UserNonPermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CatalogController extends Controller
{
    private const RESOURCES = [
        'categories' => [Category::class, 'category', 'status'],
        'subcategories' => [SubCategory::class, 'subcategory', 'is_active'],
        'brands' => [Brand::class, 'brand', 'is_active'],
        'colors' => [Color::class, 'color', 'is_active'],
        'sizes' => [Size::class, 'size', 'is_active'],
        'units' => [Unit::class, 'unit', 'is_active'],
    ];

    public function index(Request $request, string $resource)
    {
        [$model, $permission] = $this->resource($request, $resource, 'index');
        $shop = generaleSetting('rootShop');
        $query = $resource === 'categories'
            ? $shop->categories()->withCount('products')
            : $model::query()->where('shop_id', $shop->id);

        if ($resource === 'subcategories') {
            $query->with('categories:id,name');
        }

        $records = $query->when($request->filled('search'), fn ($builder) => $builder->where('name', 'like', '%'.$request->string('search').'%'))
            ->orderByDesc('id')->paginate(min($request->integer('per_page', 50), 100));

        return $this->json('Catalog records.', ['items' => $records->items(), 'total' => $records->total(), 'current_page' => $records->currentPage()]);
    }

    public function store(Request $request, string $resource)
    {
        [$model, $permission] = $this->resource($request, $resource, 'create');
        $data = $this->validateData($request, $resource);
        $shop = generaleSetting('rootShop');
        $record = DB::transaction(function () use ($model, $resource, $data, $shop) {
            $categoryIds = $data['category_ids'] ?? [];
            unset($data['category_ids']);
            if ($resource !== 'categories') {
                $data['shop_id'] = $shop->id;
            }
            $record = $model::create($data);
            if ($resource === 'categories') {
                $shop->categories()->syncWithoutDetaching([$record->id]);
            } elseif ($resource === 'subcategories') {
                $record->categories()->sync($categoryIds);
            }

            return $record;
        });

        return $this->json('Catalog record created.', ['record' => $record->fresh()]);
    }

    public function update(Request $request, string $resource, int $recordId)
    {
        [$model] = $this->resource($request, $resource, 'edit');
        $shop = generaleSetting('rootShop');
        $record = $this->findOwned($model, $resource, $recordId, $shop);
        $data = $this->validateData($request, $resource, true);
        $categoryIds = $data['category_ids'] ?? null;
        unset($data['category_ids']);
        $record->update($data);
        if ($resource === 'subcategories' && $categoryIds !== null) {
            $record->categories()->sync($categoryIds);
        }

        return $this->json('Catalog record updated.', ['record' => $record->fresh()]);
    }

    public function toggle(Request $request, string $resource, int $recordId)
    {
        [$model, , $statusField] = $this->resource($request, $resource, 'toggle');
        $record = $this->findOwned($model, $resource, $recordId, generaleSetting('rootShop'));
        $record->update([$statusField => ! (bool) $record->{$statusField}]);

        return $this->json('Catalog status updated.', ['record' => $record->fresh()]);
    }

    public function destroy(Request $request, string $resource, int $recordId)
    {
        [$model] = $this->resource($request, $resource, 'destroy');
        $record = $this->findOwned($model, $resource, $recordId, generaleSetting('rootShop'));
        if (method_exists($record, 'products') && $record->products()->exists()) {
            return $this->json('This record is still used by products and cannot be deleted.', [], 422);
        }
        if ($resource === 'categories') {
            $record->shops()->detach();
            $record->products()->detach();
            $record->subCategories()->detach();
        }
        if ($resource === 'subcategories') {
            $record->categories()->detach();
        }
        $record->delete();

        return $this->json('Catalog record deleted.');
    }

    private function resource(Request $request, string $resource, string $action): array
    {
        abort_unless(isset(self::RESOURCES[$resource]), 404);
        [$model, $permissionBase, $statusField] = self::RESOURCES[$resource];
        $permission = 'admin.'.$permissionBase.'.'.$action;
        $user = $request->user();
        abort_unless($user && ($user->hasRole('root') || (
            $user->hasPermissionTo($permission, 'web')
            && ! UserNonPermission::where('user_id', $user->id)->where('name', $permission)->exists()
        )), 403);

        return [$model, $permissionBase, $statusField];
    }

    private function findOwned(string $model, string $resource, int $id, Shop $shop)
    {
        if ($resource === 'categories') {
            return $shop->categories()->findOrFail($id);
        }

        return $model::where('shop_id', $shop->id)->findOrFail($id);
    }

    private function validateData(Request $request, string $resource, bool $updating = false): array
    {
        $name = ['required', 'string', 'max:255'];
        $rules = match ($resource) {
            'categories' => [
                'name' => $name,
                'description' => ['nullable', 'string', 'max:2000'],
                'icon' => ['nullable', 'string', 'max:255'],
                'order_by' => ['nullable', 'integer', 'min:0'],
            ],
            'subcategories' => [
                'name' => $name,
                'short_description' => ['nullable', 'string', 'max:255'],
                'thumbnail' => ['nullable', 'string', 'max:255'],
                'category_ids' => ['required', 'array', 'min:1'],
                'category_ids.*' => ['integer', Rule::exists('categories', 'id')],
            ],
            'colors' => ['name' => $name, 'color_code' => ['nullable', 'string', 'max:30']],
            default => ['name' => $name],
        };
        $validated = $request->validate($rules);
        if ($resource === 'categories' && ! $updating && empty($validated['icon'])) {
            $validated['icon'] = 'bi-tags';
        }
        if ($resource === 'categories' && $updating && array_key_exists('icon', $validated) && $validated['icon'] === null) {
            unset($validated['icon']);
        }

        return $validated;
    }
}
