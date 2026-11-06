<?php

namespace App\Repositories;

use App\Http\Requests\BannerRequest;
use App\Models\Ad;
use Illuminate\Support\Facades\Storage;

class AdsRepository extends Repository
{
    /**
     * base method
     *
     * @method model()
     */
    public static function model()
    {
        return Ad::class;
    }

    /**
     * store new banner
     *
     * */
    public static function storeByRequest(BannerRequest $request): Ad
    {
        $bannerPath = $request->banner;
        if ($request->hasFile('banner')) {
            $bannerPath = Storage::put('ads', $request->file('banner'));
        }

        return self::create([
            'title' => $request->title,
            'banner' => $bannerPath,
            'status' => true,
        ]);
    }

    /**
     * Update the banner.
     */
    public static function updateByRequest($request, Ad $ad): Ad
    {
        $bannerPath = $ad->banner;
        if ($request->hasFile('banner')) {
            if ($ad->banner && Storage::exists($ad->banner)) {
                Storage::delete($ad->banner);
            }
            $bannerPath = Storage::put('ads', $request->file('banner'));
        } elseif ($request->filled('banner')) {
            $bannerPath = $request->banner;
        }

        $ad->update([
            'title' => $request->title,
            'banner' => $bannerPath,
        ]);

        return $ad;
    }

    /**
     * delete banner
     *
     * */
    public static function destroy(Ad $ad): bool
    {
        $media = $ad->media;
        if ($media) {
            if (Storage::exists($media->src)) {
                Storage::delete($media->src);
            }
            $media->delete();
        }
        if ($ad->banner && Storage::exists($ad->banner)) {
            Storage::delete($ad->banner);
        }
        $ad->delete();

        return true;
    }
}
