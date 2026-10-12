<?php

namespace App\Http\Controllers\API\Rider;

use App\Enums\Roles;
use App\Models\User;
use App\Models\Driver;
use App\Models\DeviceKey;
use App\Events\SendOTPMail;
use App\Models\VerifyManage;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RiderRequest;
use App\Services\SmsGatewayService;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use App\Repositories\DriverRepository;
use App\Http\Requests\RiderLoginRequest;
use App\Http\Resources\RiderUserResource;
use App\Repositories\DeviceKeyRepository;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\CreatePasswordRequest;
use App\Repositories\VerificationCodeRepository;

class LoginController extends Controller
{
    /**
     * check user status
     */
    public function checkUserStatus(Request $request)
    {
        // findByContact() below resolves a phone or an email, so this must not
        // be constrained to numeric phone numbers.
        $request->validate(['phone' => 'nullable|string']);

        $user = UserRepository::findByContact($request->phone);

        $message = $user?->is_active ? 'Your account is active' : 'Your account is not active. please contact the admin';

        return $this->json($message, [
            'user_status' => (bool) $user?->is_active ?? false,
        ]);
    }

    /**
     * login a user.
     */
    public function login(RiderLoginRequest $request)
    {
        if ($user = $this->authenticate($request)) {
            if (! $user->is_active) {
                return $this->json('Your account is not active. please contact the admin', [], Response::HTTP_BAD_REQUEST);
            }

            if ($request->device_key && ! $this->findByKey($request->device_key, $user)) {
                DeviceKey::create([
                    'user_id' => $user->id,
                    'key' => $request->device_key,
                    'device_type' => $request->device_type ?? 'android',
                ]);
            }

            UserRepository::locationByRequest($request, $user);

            return $this->json('Log In Successful', [
                'user' => new UserResource($user),
                'access' => UserRepository::getAccessToken($user),
            ]);
        }

        return $this->json('Credential is invalid!', [], Response::HTTP_BAD_REQUEST);
    }

    /**
     * register new user.
     *
     * @param  RiderRequest  $request  The request object containing the user data.
     * @return \Illuminate\Http\Response
     */
    public function register(RiderRequest $request)
    {
        $user = UserRepository::storeByRequest($request);
        $user->assignRole(Roles::DRIVER->value);

        DriverRepository::storeByUser($user);

        $user->update(['is_active' => false]);

        return $this->json('Your profile is under review', [
            'user' => RiderUserResource::make($user),
        ]);
    }

    /**
     * Authenticate a user.
     */
    private function authenticate($request)
    {
        $user = UserRepository::findByContact($request->phone);
        if (! is_null($user) && $user->driver) {
            if (Hash::check($request->password, $user->password)) {
                return $user;
            }
        }

        return false;
    }

    /**
     * Find a user by device key.
     */
    public function findByKey($key, $user)
    {
        return DeviceKey::where('key', $key)->where('user_id', $user->id)->first();
    }

    /**
     * change password.
     *
     * @param  ChangePasswordRequest  $request  The request object containing the user data.
     * @return \Illuminate\Http\Response
     */
    public function changePassword(ChangePasswordRequest $request)
    {
        $user = User::find(auth()->user()->id);
        $currentPassword = $request->current_password;
        if (Hash::check($currentPassword, $user->password)) {

            if (Hash::check($request->password, $user->password)) {
                return $this->json('New password cannot be same as current password', [], Response::HTTP_BAD_REQUEST);
            }

            $user->update([
                'password' => Hash::make($request->password),
            ]);

            return $this->json('Password change successfully', [
                'user' => RiderUserResource::make($user),
            ]);
        }

        return $this->json('Current password is incorrect', [], Response::HTTP_BAD_REQUEST);
    }

    /**
     * logout a user.
     *
     * @param  Request  $request  The request object containing the user data.
     * @return \Illuminate\Http\Response
     */
    public function logout(Request $request)
    {
        /** @var \User $user */
        $user = auth()->user();

        if ($request->device_key) {
            DeviceKeyRepository::deleteByKey($request->device_key, $user);
        }

        if ($user) {
            $user->currentAccessToken()->delete();

            return $this->json('Logged out successfully!');
        }

        return $this->json('No Logged in user found', [], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * send OTP
     *
     * @param  Request  $request  The request object containing the user data.
     * @return \Illuminate\Http\Response
     */
    public function sendOTP(Request $request)
    {
        $forgotPassword = $request->forgot_password;

        if ($forgotPassword) {
            // The `phone` field carries either a phone number or an email —
            // `numeric|exists:users,phone` used to reject every email here.
            $request->validate([
                'phone' => [
                    'required',
                    function ($attribute, $value, $fail) {
                        if (! UserRepository::findByContact($value)) {
                            $fail(__('We could not find an account with that phone or email.'));
                        }
                    },
                ],
            ]);
        }

        $user = UserRepository::findByPhone($request->phone ?? $request->email);

        $verificationCode = VerificationCodeRepository::findOrCreateByContact($request->phone ?? $request->email);
        $OTP = $verificationCode?->otp;

        $message = 'Your Ridder '.($forgotPassword ? 'Forgot Password' : 'Registration').' OTP is '.$OTP;

        [$responseMessage, $emailOrPhone] = $this->dispatchOTP(
            type: $this->otpType(forgotPassword: (bool) $forgotPassword),
            message: $message,
            otp: $OTP,
            phone: $request->phone,
            phoneCode: $request->phone_code,
            // On registration there is no user row yet, so fall back to the
            // address the rider typed rather than to their phone number.
            email: $user?->email ?? $request->email,
        );

        return $this->json($responseMessage, [
            'email_or_phone' => $emailOrPhone,
            'otp' => app()->environment('local') ? $OTP : null,
        ]);
    }

    /**
     * Resolve the OTP channel the admin configured under Verification Manage.
     */
    private function otpType(bool $forgotPassword): ?string
    {
        $verifyManage = Cache::rememberForever('verify_manage', function () {
            return VerifyManage::first();
        });

        return $forgotPassword ? $verifyManage?->forgot_otp_type : $verifyManage?->register_otp_type;
    }

    /**
     * Send an OTP over the configured channel.
     *
     * @return array{0: string, 1: ?string} the response message and the contact it went to
     */
    private function dispatchOTP(
        ?string $type,
        string $message,
        $otp,
        ?string $phone,
        ?string $phoneCode,
        ?string $email
    ): array {
        if ($type == 'phone') {
            try {
                (new SmsGatewayService)->sendSMS($phoneCode, $phone, $message);
            } catch (\Throwable $th) {
                // A dead gateway must not block registration.
            }

            return ['Please Verify your phone number. We sent otp to your phone number', $phoneCode.$phone];
        }

        try {
            SendOTPMail::dispatch($email, $message, $otp);
        } catch (\Throwable $th) {
        }

        return ['We sent otp to your email address', $email];
    }

    /**
     * verify OTP
     *
     * @param  Request  $request  The request object containing the user data.
     */
    public function verifyOtp(Request $request)
    {
        $verificationCode = VerificationCodeRepository::checkOTP($request->phone, $request->otp);

        if (! $verificationCode) {
            return $this->json('Invalid OTP', [], Response::HTTP_BAD_REQUEST);
        }

        return $this->json('Otp matched successfully!', [
            'token' => $verificationCode->token,
        ]);
    }

    /**
     * create new password
     *
     * @param  CreatePasswordRequest  $request  The request object containing the user data.
     */
    public function createPassword(CreatePasswordRequest $request)
    {
        $verifyOtp = VerificationCodeRepository::checkByToken($request->token);

        if (! $verifyOtp) {
            return $this->json('Invalid or expired token', [], Response::HTTP_NOT_FOUND);
        }

        // verify_otps.phone holds whichever contact the OTP was sent to, so an
        // email-based reset has to be looked up against users.email as well.
        $user = UserRepository::findByContact($verifyOtp->phone);

        if (! $user) {
            return $this->json('User not found', [], Response::HTTP_NOT_FOUND);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        $verifyOtp->delete();

        return $this->json('Password created successfully', [
            'user' => RiderUserResource::make($user),
        ]);
    }

    public function deleteAccountRider(){

        $user=auth()->user();

        if (app()->environment() == 'local' && $user->email == 'rider@readygrocery.com') {
            return $this->json('You can not delete the driver in demo mode!');
        }

        $driver=Driver::where('user_id',$user->id)->first();

        if($driver){
           $driver->delete();
        }
        $user->delete();
        return $this->json('Delete Account Successfully!');
    }
}
