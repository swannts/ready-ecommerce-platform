<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ModuleSetting;
use App\Services\AddonLicenseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Nwidart\Modules\Facades\Module;
use ZipArchive;

class MarketController extends Controller
{
    public function __construct(private AddonLicenseService $licenses) {}

    public function index()
    {
        return view('market.index');
    }

    public function upgrade()
    {
        return view('market.upgrade');
    }

    public function addons()
    {
        $modules = Module::all();
        $moduleData = collect($modules)->map(function ($module, $name) {
            $json = $module->json()->toArray();

            $moduleName = $json['name'] ?? $module->getName();

            return [
                'id' => $json['id'] ?? $moduleName,
                'name' => $moduleName,
                'display_name' => $json['display_name'] ?? $moduleName,
                'enabled' => Module::isEnabled($name),
                'version' => $json['version'] ?? '1.0.0',
                'image' => asset($json['image'] ?? 'default/default.jpg'),
                'license_key' => $json['license_key'] ?? null,
                'is_verified' => $json['is_verified'] ?? false
            ];
        });

        return view('market.addons', compact('moduleData'));
    }

    public function upload(Request $request)
    {
        $request->validate([
            'addon_package' => 'required|file|mimes:zip'
        ]);

        if (request()->hasFile('addon_package')) {
            $file = request()->file('addon_package');

            $dir = base_path('Modules/');

            $zip = new ZipArchive;

            if ($zip->open($file) === TRUE) {
                // Extract files
                $zip->extractTo($dir);
                // Close the zip file
                $zip->close();
                if(dir($dir . '__MACOSX')) {
                    exec('rm -r ' . $dir . '__MACOSX');
                }
            }
            Artisan::call('vendor:publish --tag=public --force');
            return response()->json(['message' => 'Addon uploaded successfully']);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    /**
     * Verify an addon's purchase key with the RazinSoft licence server and, on
     * success, bind it to this domain and mark the module as verified.
     */
    public function verifyAddon(Request $request)
    {
        $request->validate([
            'purchase_key' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'name' => 'required|string|max:100',
        ]);

        try {
            $result = $this->licenses->activate($request->name, $request->purchase_key, $request->email);
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        if (! $result['ok']) {
            return back()->with('error', $result['message']);
        }

        return back()->with('success', 'Addon verified successfully');
    }

    public function updateStatus($addon)
    {
        try{
        $modules = Module::all();
        collect($modules)->map(function ($module, $name) use ($addon) {
            if ($module->get('name') === $addon) {
                $moduleName = $module->get('name');
                $json = $module->json()->toArray();
                if (Module::isEnabled($moduleName)) {
                    Module::disable($moduleName);
                } else {
                    if(!$json['is_verified']) {
                        throw new \Exception('Addon is not verified. Please verify the addon before enabling it.');
                    }
                    $module = ModuleSetting::where('name', $moduleName)->first();

                    Module::enable($moduleName);
                    if(!$module) {
                        Artisan::call('module:migrate', ['module' => $moduleName, '--force' => true]);
                        Artisan::call('module:seed', ['module' => $moduleName, '--force' => true]);
                        Artisan::call('db:seed RoleSeeder --force');
                        Artisan::call('db:seed PermissionSeeder --force');
                        Artisan::call('vendor:publish --tag=public --force');
                        $module = ModuleSetting::create(['name' => $moduleName, 'enabled' => true, 'is_first' => false]);
                    }
                }
            }
        });
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update addon status: ' . $e->getMessage());
        }

        return back()->with('success', 'Addon status updated successfully');
    }
}

