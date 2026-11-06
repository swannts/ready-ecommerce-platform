<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AdminManagementSeeder extends Seeder
{
    /**
     * Seed idempotent records used to exercise the admin workspace locally.
     */
    public function run(): void
    {
        if (! app()->environment('local')) {
            $this->command?->warn('Admin management development records are only seeded in local.');

            return;
        }

        $this->call(RoleSeeder::class);
        $this->call(PermissionSeeder::class);

        $adminRole = Role::where('name', 'admin')->where('guard_name', 'web')->firstOrFail();
        $permissionNames = [
            'admin.dashboard.index',
            'admin.shop.index',
            'admin.shop.show',
            'admin.shop.status.toggle',
            'admin.product.index',
            'admin.product.approve',
            'admin.product.destroy',
            'admin.order.index',
            'admin.order.show',
            'admin.order.status.change',
            'admin.order.payment.status.toggle',
            'admin.order.assign.courier',
            'admin.customer.index',
            'admin.customer.show',
            'admin.customer.toggle',
            'admin.customer.reset-password',
            'admin.coupon.index',
            'admin.coupon.create',
            'admin.coupon.update',
            'admin.coupon.toggle',
            'admin.coupon.destroy',
            'admin.flashSale.index',
            'admin.flashSale.create',
            'admin.flashSale.edit',
            'admin.flashSale.update',
            'admin.flashSale.product',
            'admin.flashSale.toggle',
            'admin.flashSale.destroy',
            'admin.role.index',
            'admin.role.store',
            'admin.role.update',
            'admin.role.destroy',
            'admin.role.permission.update',
            'admin.employee.index',
            'admin.employee.permission',
            'admin.employee.permission.update',
            'admin.employee.reset-password',
            'admin.supportTicket.index',
            'admin.supportTicket.show',
            'admin.supportTicket.sendMessage',
            'admin.supportTicket.updateStatus',
            'admin.supportTicket.pinMessage',
            'admin.page.index',
            'admin.page.store',
            'admin.page.update',
            'admin.page.destroy',
            'admin.category.index',
            'admin.returnOrder.index',
            'admin.returnOrder.reject',
            'admin.returnOrder.payment.status',
            'admin.withdraw.index',
            'admin.withdraw.update',
            'admin.review.index',
            'admin.review.toggle',
            'admin.rider.index',
            'admin.rider.toggle',
            'admin.banner.index',
            'admin.banner.toggle',
            'admin.category.create',
            'admin.category.edit',
            'admin.category.destroy',
            'admin.category.toggle',
            'admin.subcategory.index',
            'admin.subcategory.create',
            'admin.subcategory.edit',
            'admin.subcategory.destroy',
            'admin.subcategory.toggle',
            'admin.brand.index',
            'admin.brand.create',
            'admin.brand.edit',
            'admin.brand.destroy',
            'admin.brand.toggle',
            'admin.color.index',
            'admin.color.create',
            'admin.color.edit',
            'admin.color.destroy',
            'admin.color.toggle',
            'admin.size.index',
            'admin.size.create',
            'admin.size.edit',
            'admin.size.destroy',
            'admin.size.toggle',
            'admin.unit.index',
            'admin.unit.create',
            'admin.unit.edit',
            'admin.unit.destroy',
            'admin.unit.toggle',
        ];
        $adminRole->givePermissionTo(Permission::where('guard_name', 'web')->whereIn('name', $permissionNames)->get());

        $admin = User::firstOrCreate(
            ['email' => 'admin@readyecommerce.com'],
            [
                'name' => 'Admin',
                'phone' => '01000000002',
                'password' => Hash::make('secret'),
                'is_active' => true,
            ]
        );
        $admin->assignRole($adminRole);

        $this->seedPendingProduct('admin-review-golden-harvest-basmati', 'Admin Review Sample: Golden Basmati Rice', 'golden-harvest-rice-mills');
        $this->seedPendingProduct('admin-review-heritage-nazirshail', 'Admin Review Sample: Heritage Nazirshail Rice', 'heritage-grain-cooperative');

        $this->command?->info('Admin workspace development data is ready.');
    }

    private function seedPendingProduct(string $slug, string $name, string $supplierSlug): void
    {
        $shop = Shop::where('supplier_slug', $supplierSlug)->firstOrFail();
        $template = Product::withoutGlobalScopes()
            ->where('shop_id', $shop->id)
            ->where('is_approve', true)
            ->first();

        if (! $template) {
            throw new ModelNotFoundException("No approved product template exists for supplier [{$supplierSlug}]. Run the catalog seeders first.");
        }

        $attributes = $template->getAttributes();
        unset($attributes['id'], $attributes['created_at'], $attributes['updated_at'], $attributes['deleted_at'], $attributes['slug']);
        $attributes = array_merge($attributes, [
            'shop_id' => $shop->id,
            'name' => $name,
            'name_ar' => $name,
            'slug' => $slug,
            'short_description' => 'Local development submission waiting for administrator review.',
            'description' => 'A realistic unpublished marketplace listing seeded for testing the admin product review workflow.',
            'is_active' => false,
            'is_approve' => false,
            'is_new' => true,
            'deleted_at' => null,
        ]);

        $submission = Product::withoutGlobalScopes()->withTrashed()->updateOrCreate(['slug' => $slug], $attributes);
        $submission->categories()->sync($template->categories()->pluck('categories.id')->all());
    }
}
