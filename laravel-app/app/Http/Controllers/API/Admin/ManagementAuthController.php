<?php

namespace App\Http\Controllers\API\Admin;

use App\Enums\Roles;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserNonPermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ManagementAuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'contact' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['contact'])
            ->orWhere('phone', $credentials['contact'])
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages(['contact' => ['Invalid email/phone or password.']]);
        }

        if (! $user->is_active || ! $user->hasAnyRole([Roles::ROOT->value, Roles::ADMIN->value])) {
            return $this->json('This account does not have access to the admin workspace.', [], 403);
        }

        $token = $user->createToken('ricemart-admin-workspace')->plainTextToken;

        return $this->json('Signed in successfully.', [
            'token' => $token,
            'user' => $this->userPayload($user),
        ]);
    }

    public function me(Request $request)
    {
        return $this->json('Admin profile.', ['user' => $this->userPayload($request->user())]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return $this->json('Signed out successfully.');
    }

    private function userPayload(User $user): array
    {
        $permissions = $user->getAllPermissions()->pluck('name')->all();
        if (! $user->hasRole(Roles::ROOT->value)) {
            $denied = UserNonPermission::where('user_id', $user->id)->pluck('name')->all();
            $permissions = array_values(array_diff($permissions, $denied));
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->getRoleNames()->values(),
            'permissions' => $permissions,
        ];
    }
}
