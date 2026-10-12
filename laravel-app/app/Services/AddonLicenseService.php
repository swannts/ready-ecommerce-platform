<?php

namespace App\Services;

use App\Support\Licensing\RazinLicense;
use Illuminate\Support\Facades\File;
use InvalidArgumentException;
use Nwidart\Modules\Facades\Module;
use Nwidart\Modules\Module as ModuleInstance;

/**
 * Verifies an addon's purchase key against the RazinSoft licence server and
 * records the outcome in that addon's module.json.
 *
 * One addon, one licence, one live domain: activation binds the key to the
 * host this admin panel runs on. Development hosts (localhost, *.test, ...)
 * are accepted by the server without using up the domain slot.
 */
class AddonLicenseService
{
    /**
     * Activate a purchase key for the named module.
     *
     * @return array{ok: bool, message: string, data: array<string, mixed>|null}
     */
    public function activate(string $moduleName, string $key, string $email): array
    {
        $module = $this->module($moduleName);

        $result = $this->client($module)->activate(trim($key), trim($email));

        if (! $result['ok']) {
            return $result;
        }

        $mismatch = $this->productMismatch($module, $result['data']);
        if ($mismatch !== null) {
            return ['ok' => false, 'message' => $mismatch, 'data' => $result['data']];
        }

        $this->record($module, $key, $email, $result['data']);

        return $result;
    }

    /**
     * Release this domain from the module's licence and clear what was recorded.
     *
     * @return array{ok: bool, message: string, data: array<string, mixed>|null}
     */
    public function deactivate(string $moduleName): array
    {
        $module = $this->module($moduleName);

        $result = $this->client($module)->deactivate();

        if ($result['ok']) {
            $this->forget($module);
        }

        return $result;
    }

    /** The cached verdict for a module, as the SDK wrote it. */
    public function state(string $moduleName): array
    {
        return $this->client($this->module($moduleName))->state();
    }

    // ── Internals ──────────────────────────────────────────────────────────────

    protected function module(string $name): ModuleInstance
    {
        $module = Module::find($name);

        if (! $module) {
            throw new InvalidArgumentException("Addon [{$name}] is not installed.");
        }

        return $module;
    }

    protected function client(ModuleInstance $module): RazinLicense
    {
        $config = [
            'state_path' => rtrim(config('licensing.state_path'), '/').'/'.$module->getLowerName().'.json',
            'timeout' => (int) config('licensing.timeout', 8),
        ];

        // The constructor's endpoint override exists for test suites. Honour it on a
        // local install only, so a production copy always talks to the real server.
        $endpoint = app()->environment('local') ? config('licensing.endpoint') : null;

        return new RazinLicense($config, $endpoint ?: null);
    }

    /**
     * When the server says which CodeCanyon item the licence is for, it must be
     * this addon. Older server answers carry no item id, and are accepted as-is.
     *
     * @param  array<string, mixed>|null  $data
     */
    protected function productMismatch(ModuleInstance $module, ?array $data): ?string
    {
        $licensedItem = $data['product']['envato_item_id'] ?? null;
        $moduleItem = $module->get('id');

        if (! $licensedItem || ! $moduleItem || ! is_numeric($moduleItem)) {
            return null;
        }

        if ((int) $licensedItem === (int) $moduleItem) {
            return null;
        }

        $name = $data['product']['name'] ?? 'another product';

        return "This purchase key belongs to {$name}, not to {$module->get('display_name', $module->getName())}.";
    }

    /** @param array<string, mixed>|null $data */
    protected function record(ModuleInstance $module, string $key, string $email, ?array $data): void
    {
        $this->updateManifest($module, [
            'license_key' => trim($key),
            'license_email' => trim($email),
            'is_verified' => true,
            'licensed_product' => isset($data['product']) ? [
                'name' => $data['product']['name'] ?? null,
                'slug' => $data['product']['slug'] ?? null,
                'latest_version' => $data['product']['latest_version'] ?? null,
            ] : null,
            'support' => $data['support'] ?? null,
            'verified_at' => now()->toIso8601String(),
        ]);
    }

    protected function forget(ModuleInstance $module): void
    {
        $this->updateManifest($module, [
            'license_key' => '',
            'license_email' => null,
            'is_verified' => false,
            'licensed_product' => null,
            'support' => null,
            'verified_at' => null,
        ]);
    }

    /** @param array<string, mixed> $changes */
    protected function updateManifest(ModuleInstance $module, array $changes): void
    {
        $path = $module->getPath().'/module.json';

        $json = File::exists($path) ? json_decode(File::get($path), true) : [];
        if (! is_array($json)) {
            $json = [];
        }

        File::put($path, json_encode(array_merge($json, $changes), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)."\n");
    }
}
