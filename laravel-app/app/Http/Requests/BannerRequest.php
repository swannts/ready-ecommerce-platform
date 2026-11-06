<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BannerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $required = ($this->isMethod('POST') && ! $this->routeIs('*update*')) ? 'required' : 'nullable';
        $bannerRule = $this->hasFile('banner')
            ? [$required, 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:5120']
            : [$required, 'nullable', 'string', 'max:500'];

        return [
            'title' => ['nullable', 'string', 'max:255'],
            'banner' => $bannerRule,
            'url' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        $request = request();
        if ($request->is('api/*')) {
            $header = strtolower($request->header('accept-language'));
            $lan = (preg_match('/^[a-z]+$/', $header)) ? $header : 'en';
            app()->setLocale($lan);
        }

        return [
            'banner.required' => __('The banner field is required.'),
            'banner.image' => __('The banner must be an image.'),
            'banner.mimes' => __('The banner must be a file of type: jpeg, jpg, png, gif, webp.'),
            'banner.max' => __('The banner may not be greater than 2048 kilobytes.'),
        ];
    }
}
