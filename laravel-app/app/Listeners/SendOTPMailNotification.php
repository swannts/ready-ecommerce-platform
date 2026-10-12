<?php

namespace App\Listeners;

use App\Events\SendOTPMail as EventsSendOTPMail;
use App\Mail\SendOTP;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendOTPMailNotification
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(EventsSendOTPMail $event): void
    {
        // This used to be gated on mail_username && mail_password &&
        // mail_encryption. Those are empty for any mailer that needs no auth or
        // no encryption (local mailpit, port 25/1025, API-key providers), so the
        // OTP mail was silently dropped with no error anywhere. Attempt the send
        // and log what goes wrong instead.
        try {
            Mail::to($event->email)->send(new SendOTP($event->email, $event->messageContent, $event->otp));
        } catch (\Throwable $e) {
            Log::error('OTP mail to '.$event->email.' failed: '.$e->getMessage());
        }
    }
}
