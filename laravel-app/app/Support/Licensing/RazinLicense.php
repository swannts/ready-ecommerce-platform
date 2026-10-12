<?php

namespace App\Support\Licensing;

/*
 * Copied from the RazinSoft licence server repository: installer-sdk/src/RazinLicense.php.
 * Changes from the original: the namespace, and the deprecated curl_close() call
 * (a no-op since PHP 8.0, a warning on 8.5) was dropped. To refresh the ENDPOINT / SIGNING_KEY constants, run
 * `php artisan licenses:sdk-constants` on the licence server and paste them in below.
 */

/**
 * The licence client that ships inside the product.
 *
 * Dependency-free and single-file on purpose: this drops into a Laravel app, a CodeIgniter app or
 * a folder of PHP scripts, and adding a Composer requirement to somebody else's project is not a
 * thing a licence check gets to do.
 *
 * Two rules run through all of it, and they pull against each other:
 *
 *   1. A licence the server says is revoked or suspended stops the site — at the next heartbeat,
 *      so within the hour.
 *   2. A server we cannot reach stops nothing, ever. Silence is not a verdict. If RazinSoft is
 *      down, or the network is out, or DNS is broken, the site carries on exactly as before, for
 *      as long as that lasts.
 *
 * Rule 2 is why every answer is signed and checked against an embedded PUBLIC key. Without it,
 * "point the product at a licence server of your own" would be a two-line hosts file edit; with
 * it, forging an answer needs RazinSoft's private key, which is not in this file or any copy of it.
 */
class RazinLicense
{
    public const ACTION_RUN = 'run';

    public const ACTION_LOCK = 'lock';

    public const ACTION_IGNORE = 'ignore';

    /**
     * Where the licence server is, and the key its answers are signed with.
     *
     * Baked in rather than configurable. Both used to live in a config file, where pointing an
     * install somewhere else was a one-line edit needing no knowledge of PHP — and an environment
     * override survived product updates, so a redirected install stayed redirected forever.
     *
     * Cloaked so they are not searchable strings in the source. This is obfuscation, not secrecy:
     * the method below undoes it, and anyone reading this class can see how. It buys a higher
     * floor, nothing more — and it is not the thing keeping anybody honest. That is the signature:
     * a licence server that is not ours cannot produce one, so a redirected install gets answers
     * it discards, which leaves it exactly where blocking us would have left it anyway.
     *
     * Regenerate with `php artisan licenses:sdk-constants` on the licence server.
     */
    private const CLOAK = 'mRmK+Rrlug0H2Ub5aDG9ZEokuKYuoD6c';

    private const ENDPOINT = ['8W3+iWnflSJjvDWS', 'CVXQDSQKysdUyVDv', '9n/+13mK1yJmqS8='];

    private const SIGNING_KEY = ['9E27kC6SwEJTgQCBDmLo', 'DR1V2e1Wyg/X1TLimlyr', '8EUytyeVAWDbCT4RjJs='];

    private string $api;

    private string $publicKey;

    private string $statePath;

    private int $timeout;

    private int $interval;

    /**
     * @param  array{state_path: string, timeout?: int, heartbeat_hours?: int}  $config
     * @param  string|null  $endpoint  Our own test suite only. The shipped config never passes it.
     */
    public function __construct(array $config, ?string $endpoint = null)
    {
        $this->api = rtrim($endpoint ?: self::reveal(self::ENDPOINT), '/');
        $this->publicKey = self::reveal(self::SIGNING_KEY);
        $this->statePath = $config['state_path'];
        // Short by design. A licence check is not allowed to make a page slow, and a timeout is
        // just another way of not reaching us — which changes nothing.
        $this->timeout = $config['timeout'] ?? 8;
        $this->interval = max(1, (int) ($config['heartbeat_hours'] ?? 1)) * 3600;
    }

    /**
     * The key this copy will believe, and the address it will ask.
     *
     * Exposed so the licence server's own test suite can assert they still match what it signs
     * with. If those ever drift apart every copy in the field quietly stops believing us — and
     * because an unverifiable answer is treated as unreachable, nothing would look wrong until a
     * revocation failed to land.
     */
    public function publicKey(): string
    {
        return $this->publicKey;
    }

    public function endpoint(): string
    {
        return $this->api;
    }

    /** @param list<string> $chunks */
    private static function reveal(array $chunks): string
    {
        $raw = base64_decode(implode('', $chunks), true) ?: '';
        $cloak = base64_decode(self::CLOAK, true) ?: '';

        return $raw ^ str_pad('', strlen($raw), $cloak);
    }

    // ── Setup ──────────────────────────────────────────────────────────────────────────────

    /**
     * Check a key before writing anything. Used by the installer's licence step.
     *
     * @return array{ok: bool, message: string, data: array<string, mixed>|null}
     */
    public function verify(string $key, string $email): array
    {
        return $this->call('verify', ['key' => $key, 'email' => $email]);
    }

    /**
     * Bind the licence to this domain. Call once, at the end of a successful install.
     *
     * @return array{ok: bool, message: string, data: array<string, mixed>|null}
     */
    public function activate(string $key, string $email, ?string $domain = null): array
    {
        $result = $this->call('activate', [
            'key' => $key,
            'email' => $email,
            'domain' => $domain ?? $this->domain(),
            'php_version' => PHP_VERSION,
        ]);

        if ($result['ok']) {
            $this->remember($key, $email, $result['data']);
        }

        return $result;
    }

    /** Let go of this domain so the licence can be installed elsewhere. */
    public function deactivate(): array
    {
        $state = $this->state();

        if (! isset($state['key'], $state['email'])) {
            return ['ok' => false, 'message' => 'This copy is not activated.', 'data' => null];
        }

        $result = $this->call('deactivate', [
            'key' => $state['key'],
            'email' => $state['email'],
            'domain' => $this->domain(),
        ]);

        if ($result['ok']) {
            @unlink($this->statePath);
        }

        return $result;
    }

    // ── Running ────────────────────────────────────────────────────────────────────────────

    /**
     * The hourly check-in. Put this on cron:
     *
     *   0 * * * * php /path/to/razin-license-check.php
     *
     * Nothing else in the product should ever call the network. Everything on the request path
     * reads the cached verdict instead, so a slow or unreachable licence server can never show up
     * as a slow page.
     */
    public function heartbeat(): array
    {
        $state = $this->state();

        if (! isset($state['key'], $state['email'])) {
            return ['ok' => false, 'message' => 'This copy is not activated.', 'data' => null];
        }

        $result = $this->call('check', [
            'key' => $state['key'],
            'email' => $state['email'],
            'domain' => $this->domain(),
            'php_version' => PHP_VERSION,
        ]);

        // A verified answer is written down whatever it says — including "lock", which is the
        // whole point. An UNVERIFIED answer, or none at all, changes nothing: see call().
        if ($result['data'] !== null) {
            $this->remember($state['key'], $state['email'], $result['data']);
        }

        return $result;
    }

    /**
     * Whether a check-in is overdue.
     *
     * Measured from the last ATTEMPT, not the last success. During an outage at our end every
     * attempt fails, and gating on success would mean firing one on every single page view for as
     * long as it lasted — hammering a server that is already having a bad day, and running
     * straight into the per-key rate limit.
     */
    public function isDue(): bool
    {
        $state = $this->state();

        if (! isset($state['key'], $state['email'])) {
            return false;   // never activated; there is nothing to check in about
        }

        $last = $state['attempted_at'] ?? $state['stored_at'] ?? null;

        return $last === null || (time() - (int) strtotime($last)) >= $this->interval;
    }

    /**
     * The check-in, but only if one is due. Costs a file read otherwise.
     *
     * This exists because a great many customers never set up cron. Without it the kill switch
     * would be silent on exactly those installs — they would show up under Silent installs and
     * keep running forever, which is the correct fail-open behaviour but not much of a switch.
     *
     * Call it from somewhere that runs AFTER the response has been sent — Laravel middleware's
     * terminate(), or fastcgi_finish_request() — never on the request path. A licence check must
     * not be able to make a page slow.
     */
    public function heartbeatIfDue(): ?array
    {
        if (! $this->isDue()) {
            return null;
        }

        // Written before the call, not after: on a busy site several requests can arrive in the
        // same second, and all of them seeing "due" would fire at once.
        $this->markAttempted();

        return $this->heartbeat();
    }

    /**
     * What this copy should do right now, read from disk. Safe to call on every request.
     *
     * @return array<string, mixed>
     */
    public function state(): array
    {
        if (! is_readable($this->statePath)) {
            return [];
        }

        $state = json_decode((string) file_get_contents($this->statePath), true);

        return is_array($state) ? $state : [];
    }

    /** Whether the product may run. Defaults to yes — an absent or unreadable file is not a verdict. */
    public function allowed(): bool
    {
        return ($this->state()['action'] ?? self::ACTION_RUN) !== self::ACTION_LOCK;
    }

    /** Why it was stopped, for the lock screen. */
    public function lockReason(): ?string
    {
        return $this->state()['reason'] ?? null;
    }

    /**
     * The page a stopped install shows, or null when the product may run.
     *
     * Framework code should use this and return it as a normal 403 response — that keeps the
     * request pipeline intact and makes the behaviour testable. Plain-PHP products want guard().
     *
     * Deliberately self-contained rather than a redirect to a hosted page: a stopped site whose
     * lock screen lives on our server would break twice over when we have an outage.
     */
    public function lockScreen(): ?string
    {
        if ($this->allowed()) {
            return null;
        }

        $reason = htmlspecialchars($this->lockReason() ?? 'This license is no longer valid.', ENT_QUOTES, 'UTF-8');

        return '<!doctype html><meta charset="utf-8"><title>License inactive</title>'
            .'<div style="font:16px/1.6 system-ui,sans-serif;max-width:34rem;margin:18vh auto;padding:0 1.5rem;color:#111">'
            .'<h1 style="font-size:1.35rem;margin:0 0 .75rem">This installation has been deactivated</h1>'
            ."<p style=\"color:#444\">{$reason}</p>"
            .'<p style="color:#666;font-size:.9rem">If you believe this is a mistake, contact support with your license key.</p>'
            .'</div>';
    }

    /**
     * Drop this at the top of a plain-PHP application's bootstrap: prints the lock screen and stops.
     *
     * Inside a framework, prefer lockScreen() — exiting here would skip the response pipeline, and
     * anything that needed to run afterwards would silently not.
     */
    public function guard(): void
    {
        $screen = $this->lockScreen();

        if ($screen === null) {
            return;
        }

        http_response_code(403);
        echo $screen;

        exit;
    }

    // ── Internals ──────────────────────────────────────────────────────────────────────────

    /**
     * One call, verified.
     *
     * `data` is null whenever we could not get a signed answer we trust — no network, a timeout,
     * a bad signature, a replayed nonce. Callers must treat that as "carry on", never as invalid:
     * it is the difference between our bad day and the customer's site going down with it.
     *
     * @param  array<string, string|null>  $body
     * @return array{ok: bool, message: string, data: array<string, mixed>|null}
     */
    private function call(string $endpoint, array $body): array
    {
        $nonce = bin2hex(random_bytes(16));
        $body['nonce'] = $nonce;

        $response = $this->post("{$this->api}/license/{$endpoint}", $body);

        if ($response === null) {
            return ['ok' => false, 'message' => 'Could not reach the license server.', 'data' => null];
        }

        $envelope = json_decode($response['body'], true);

        if (! is_array($envelope) || ! isset($envelope['payload'], $envelope['signature'])) {
            // A validation error, a proxy's error page, anything that is not one of our answers.
            return ['ok' => false, 'message' => $this->errorFrom($envelope), 'data' => null];
        }

        if (! $this->verifySignature($envelope['payload'], $envelope['signature'])) {
            // Somebody is answering for us. Refuse to believe it — in either direction.
            return ['ok' => false, 'message' => 'The license server response could not be verified.', 'data' => null];
        }

        $payload = json_decode($envelope['payload'], true);

        if (! is_array($payload) || ($payload['nonce'] ?? null) !== $nonce) {
            // A correctly signed answer to a DIFFERENT question, replayed at us.
            return ['ok' => false, 'message' => 'The license server response did not match this request.', 'data' => null];
        }

        return [
            'ok' => ($payload['valid'] ?? false) === true,
            'message' => $payload['message'] ?? 'License verified.',
            'data' => $payload,
        ];
    }

    /** @param array<string, mixed>|null $envelope */
    private function errorFrom(?array $envelope): string
    {
        if (isset($envelope['message']) && is_string($envelope['message'])) {
            return $envelope['message'];
        }

        return 'The license server sent an unexpected response.';
    }

    /**
     * Whether a payload really came from RazinSoft.
     *
     * Public so the shipping product can be tested against a real response rather than a mock of
     * one — this is the check the whole arrangement rests on, and it is worth being able to prove.
     */
    public function verifySignature(string $payload, string $signature): bool
    {
        $key = base64_decode($this->publicKey, true);
        $sig = base64_decode($signature, true);

        if ($key === false || $sig === false || strlen($key) !== SODIUM_CRYPTO_SIGN_PUBLICKEYBYTES) {
            return false;
        }

        try {
            return sodium_crypto_sign_verify_detached($sig, $payload, $key);
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * @param  array<string, string|null>  $body
     * @return array{status: int, body: string}|null
     */
    private function post(string $url, array $body): ?array
    {
        $ch = curl_init($url);

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode(array_filter($body, fn ($v) => $v !== null)),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Accept: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_CONNECTTIMEOUT => $this->timeout,
            CURLOPT_FOLLOWLOCATION => false,
        ]);

        $raw = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        // curl_close() is a deprecated no-op on PHP 8.5; the handle is freed when it goes out of scope.

        return $raw === false ? null : ['status' => $status, 'body' => (string) $raw];
    }

    /** @param array<string, mixed>|null $payload */
    private function remember(string $key, string $email, ?array $payload): void
    {
        if ($payload === null) {
            return;
        }

        $this->write([
            'key' => $key,
            'email' => $email,
            'domain' => $this->domain(),
            'action' => $payload['action'] ?? self::ACTION_RUN,
            // Tolerant on purpose: this file ships inside a zip and can never be corrected, so it
            // reads both names rather than depending on the server never renaming the field.
            'reason' => $payload['reason'] ?? $payload['message'] ?? null,
            'support' => $payload['support'] ?? null,
            'checked_at' => $payload['issued_at'] ?? null,
            'attempted_at' => date('c'),
            'stored_at' => date('c'),
        ]);
    }

    /** Note that we tried, whether or not anybody answered. See isDue(). */
    private function markAttempted(): void
    {
        $state = $this->state();

        if ($state === []) {
            return;
        }

        $state['attempted_at'] = date('c');

        $this->write($state);
    }

    /** @param array<string, mixed> $state */
    private function write(array $state): void
    {
        $dir = dirname($this->statePath);

        if (! is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }

        file_put_contents($this->statePath, json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
        @chmod($this->statePath, 0640);
    }

    /**
     * The address this copy is running on.
     *
     * Sent from here rather than read off the request by the server, which cannot see it: the
     * installer calls us from the customer's server, so the only host in that request is ours.
     */
    private function domain(): string
    {
        foreach (['HTTP_HOST', 'SERVER_NAME'] as $key) {
            if (! empty($_SERVER[$key])) {
                return (string) $_SERVER[$key];
            }
        }

        // Cron has no request. Fall back to whatever activation recorded.
        return (string) ($this->state()['domain'] ?? gethostname() ?: 'unknown');
    }
}
