<?php

namespace App\Console\Commands;

use App\Enums\Roles;
use App\Models\GeneraleSetting;
use App\Models\Shop;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class InstallApplication extends Command
{
    protected $signature = 'app:install';

    protected $description = 'Install the application from the command line';

    private const ESSENTIAL_SEEDERS = [
        'RoleSeeder',
        'PermissionSeeder',
        'CurrencySeeder',
        'GeneraleSettingSeeder',
        'LegalPageSeeder',
        'PaymentGatewaySeeder',
        'SocialLinkSeeder',
        'ThemeColorSeeder',
        'SocialAuthSeeder',
        'VerifyManageSeeder',
        'PageSeeder',
        'MenuSeeder',
        'CountrySeeder',
        'FooterSeeder',
        'SupportItemSeeder',
        'CatalogSlugSeeder',
    ];

    public function handle(): int
    {
        if (! $this->input->isInteractive()) {
            $this->error('Run this command interactively so you can set the root administrator credentials.');

            return self::FAILURE;
        }

        try {
            DB::connection()->getPdo();
        } catch (\Throwable $exception) {
            $this->error('Database connection failed: '.$exception->getMessage());

            return self::FAILURE;
        }

        if ($this->hasExistingInstallData()) {
            $this->error('This database already contains users or general settings. No seed data or administrator was changed.');
            $this->line('Use this installer only with a fresh database, or complete the setup manually without rerunning the seeders.');

            return self::FAILURE;
        }

        $name = trim((string) $this->ask('Root administrator name'));
        while ($name === '') {
            $name = trim((string) $this->ask('Name cannot be empty. Enter the administrator name'));
        }

        $email = trim((string) $this->ask('Root administrator email'));
        while (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $email = trim((string) $this->ask('Enter a valid email address'));
        }

        $phone = trim((string) $this->ask('Root administrator phone number'));
        while ($phone === '') {
            $phone = trim((string) $this->ask('Phone number cannot be empty. Enter a phone number'));
        }

        $password = (string) $this->secret('Root administrator password (minimum 12 characters)');
        while (strlen($password) < 12) {
            $password = (string) $this->secret('Password must be at least 12 characters. Enter a new password');
        }

        $confirmation = (string) $this->secret('Confirm password');
        if (! hash_equals($password, $confirmation)) {
            $this->error('The passwords do not match. Run the command again.');

            return self::FAILURE;
        }

        $this->newLine();
        $this->info('Running database migrations...');
        if ($this->call('migrate', ['--force' => true]) !== self::SUCCESS) {
            return self::FAILURE;
        }

        if ($this->hasExistingInstallData()) {
            $this->error('This database already contains users or general settings. No seed data or administrator was changed.');
            $this->line('Use this installer only with a fresh database, or complete the setup manually without rerunning the seeders.');

            return self::FAILURE;
        }

        if (User::query()->where('email', $email)->exists() || User::query()->where('phone', $phone)->exists()) {
            $this->error('That email or phone number is already in use. Run the command again with unique contact details.');

            return self::FAILURE;
        }

        $this->info('Installing required application defaults...');
        foreach (self::ESSENTIAL_SEEDERS as $seeder) {
            $class = 'Database\\Seeders\\'.$seeder;
            if (! class_exists($class) || $this->call('db:seed', [
                '--class' => $class,
                '--force' => true,
            ]) !== self::SUCCESS) {
                $this->error("Could not run required seeder: {$seeder}");

                return self::FAILURE;
            }
        }

        if (! Schema::hasTable('users') || ! Schema::hasTable('roles')) {
            $this->error('Required user and role tables are missing after migration.');

            return self::FAILURE;
        }

        DB::transaction(function () use ($name, $email, $phone, $password): void {
            $user = User::query()->create([
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'password' => Hash::make($password),
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            $user->assignRole(Roles::ROOT->value);

            Shop::query()->firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name' => 'My Shop',
                    'delivery_charge' => 0,
                    'description' => 'My Shop Description',
                    'status' => true,
                    'min_order_amount' => 1,
                ]
            );

            $user->assignRole(Roles::SHOP->value);
            Wallet::query()->firstOrCreate(['user_id' => $user->id], ['balance' => 0]);
        });

        $this->call('optimize:clear');
        $this->info('Installation complete. Sign in at /admin/login with the administrator email you entered.');

        return self::SUCCESS;
    }

    private function hasExistingInstallData(): bool
    {
        return (Schema::hasTable('users') && User::query()->exists())
            || (Schema::hasTable('generale_settings') && GeneraleSetting::query()->exists());
    }
}
