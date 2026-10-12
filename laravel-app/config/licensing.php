<?php

/*
|--------------------------------------------------------------------------
| Addon licence verification
|--------------------------------------------------------------------------
| Addons (Modules/*) are verified against the RazinSoft licence server
| through App\Support\Licensing\RazinLicense. The server address and the
| signing key are baked into that class on purpose; only per-install
| settings live here.
*/

return [

    // Where each addon's last verified verdict is cached (one file per module).
    // Holds the customer's licence key and email, so it stays outside the web root.
    'state_path' => storage_path('app/licenses/addons'),

    // Seconds. A timeout is treated as "could not reach the server", never as invalid.
    'timeout' => 8,

    // Local development only: point the client at a licence server of your own
    // (e.g. http://razinsoft-admin.test/api). Ignored unless APP_ENV=local, and a
    // server that is not RazinSoft's cannot sign answers, so its verdicts are discarded.
    'endpoint' => env('RAZIN_LICENSE_ENDPOINT'),

];
