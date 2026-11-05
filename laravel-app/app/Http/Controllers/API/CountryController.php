<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\AreaResource;
use App\Http\Resources\CountryResource;
use App\Models\Country;
use App\Repositories\AreaRepository;
use Illuminate\Support\Facades\Cache;

class CountryController extends Controller
{
    public function index()
    {
        $countries = Cache::rememberForever('countries', function () {
            return Country::all();
        });

        return $this->json('all countries', [
            'countries' => CountryResource::collection($countries),
        ]);
    }

    public function indexAreas()
    {
        $areas = AreaRepository::query()->orderBy('name', 'asc')->isActive()->get();

        return $this->json('all areas', [
            'areas' => AreaResource::collection($areas),
        ]);
    }
}
