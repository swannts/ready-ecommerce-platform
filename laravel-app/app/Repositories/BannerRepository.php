<?php

namespace App\Repositories;

use App\Http\Requests\BannerRequest;
use App\Models\Banner;
use Illuminate\Support\Facades\Storage;

class BannerRepository extends Repository
{
    /**
     * base method
     *
     * @method model()
     */
    public static function model()
    {
        return Banner::class;
    }

    /**
     * store new banner
     *
     * */
    public static function storeByRequest(BannerRequest $request): Banner
    {
        // shop
        $shop = generaleSetting('shop');

        $shopId = $shop?->id;

        $user = $shop?->user;
        if ($user && $user->hasRole('root') && ! $request->for_shop) {
            $shopId = null;
        }

        $bannerPath = $request->banner;
        if ($request->hasFile('banner')) {
            $bannerPath = Storage::put('banners', $request->file('banner'));
        }

        return self::create([
            'shop_id' => $shopId,
            'title' => $request->title,
            'description' => $request->description,
            'banner' => $bannerPath,
            'url' => $request->url,
            'status' => true,
        ]);
    }

    /**
     * Update the banner.
     */
    public static function updateByRequest($request, Banner $banner): Banner
    {

        $shop = generaleSetting('shop');
        $shopId = $request->for_shop ? $shop?->id : $banner->shop_id;
        $user = $shop?->user;
        if ($user && $user->hasRole('root') && ! $request->for_shop) {
            $shopId = null;
        }

        $bannerPath = $banner->banner;
        if ($request->hasFile('banner')) {
            if ($banner->banner && Storage::exists($banner->banner)) {
                Storage::delete($banner->banner);
            }
            $bannerPath = Storage::put('banners', $request->file('banner'));
        } elseif ($request->filled('banner')) {
            $bannerPath = $request->banner;
        }

        $banner->update([
            'shop_id' => $shopId,
            'title' => $request->title,
            'description' => $request->description,
            'banner' => $bannerPath,
            'url' => $request->url,
        ]);

        return $banner;
    }

    /**
     * delete banner
     *
     * */
    public static function destroy(Banner $banner): bool
    {
        $media = $banner->media;
        if ($media) {
            if (Storage::exists($media->src)) {
                Storage::delete($media->src);
            }
            $media->delete();
        }
        if ($banner->banner && Storage::exists($banner->banner)) {
            Storage::delete($banner->banner);
        }
        $banner->delete();

        return true;
    }
}
