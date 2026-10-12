<?php

namespace Database\Seeders;

use App\Models\PaymentGateway;
use Illuminate\Database\Seeder;

class PaymentGatewaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $paymentMethods = [
            [
                'title' => 'Stripe',
                'name' => 'stripe',
                'config' => json_encode([
                    'secret_key' => 'sk_test_51LQPRBI8v6B8L0HsH8JBOEoUuzy0OMkhiOeqfiei1AHEkZBUnmcf7Cv5Go6fwhi3HYayZgjeLxjDsP0DYHcR0xJ1008GRte5Vf',
                    'published_key' => 'pk_test_51LQPRBI8v6B8L0HsDPqZN4PY9gpuOvAktw3bqhvqWfo3zXs7Xe6S1hntVX7hZjVIVCDQ76nroy0nHUYGpRjt0lbT00aiqqq3M7',
                ]),
                'mode' => 'test',
                'alias' => 'Stripe',
                'is_active' => true,
            ],
            [
                'title' => 'PayPal',
                'name' => 'paypal',
                'config' => json_encode([
                    'client_id' => 'ASw2Ol4zJrd7UOYWz7Vjwv2ZBEZ9AXuF4aCbSXLXImOp8HaCFwGHCggJ1QBuzSoouGJ6vMncd9pMAtV9',
                    'client_secret' => 'EA3d_eVh67xx4_vk1FYAsV75faeFvLVf1B6d2Rg9E4BfjXetw63k883MtSoVLi2v8P3bbW3tOJVFEKdt',
                ]),
                'mode' => 'test',
                'alias' => 'PayPal',
                'is_active' => true,
            ],
            [
                'title' => 'Razorpay',
                'name' => 'razorpay',
                'config' => json_encode([
                    'key' => 'rzp_live_C7ayx7PaJJkARf',
                    'secret' => '4BdgF5N5FitWBRBA6QwZrVwi',
                ]),
                'mode' => 'test',
                'alias' => 'Razorpay',
                'is_active' => true,
            ],
            [
                'title' => 'Paystack',
                'name' => 'paystack',
                'config' => json_encode([
                    'public_key' => 'pk_test_99e718f74dfbffff4a4101680c367d39d5d90c5b',
                    'secret_key' => 'sk_test_12498c55ac75a902a8ebe908f4e5108790e6e93c',
                    'machant_email' => '',
                ]),
                'mode' => 'test',
                'alias' => 'PayStack',
                'is_active' => true,
            ],
            [
                'title' => 'aamarPay',
                'name' => 'aamarpay',
                'config' => json_encode([
                    'store_id' => 'aamarpaytest',
                    'signature_key' => 'dbb74894e82415a2f7ff0ec3a97e4183',
                ]),
                'mode' => 'test',
                'alias' => 'AamarPay',
                'is_active' => true,
            ],
            [
                'title' => 'BKash',
                'name' => 'bKash',
                'config' => json_encode([
                    'username' => 'sandboxTokenizedUser02',
                    'password' => 'sandboxTokenizedUser02@12345',
                    'app_key' => '4f6o0cjiki2rfm34kfdadl1eqq',
                    'app_secret_key' => '2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b',
                ]),
                'mode' => 'test',
                'alias' => 'Bkash',
                'is_active' => true,
            ],
            [
                'title' => 'PayTabs',
                'name' => 'paytabs',
                'config' => json_encode([
                    'base_url' => 'https://secure-global.paytabs.com',
                    'profile_id' => '142160',
                    'server_key' => 'S6J9R6JRLB-JJBGTHLGJK-GZWGDGZMJL',
                    'currency' => 'USD',
                ]),
                'mode' => 'test',
                'alias' => 'PayTabs',
                'is_active' => true,
            ],
            [
                'title' => 'QiCard',
                'name' => 'qicard',
                'config' => json_encode([
                    'terminalId' => '237984',
                    'username' => 'paymentgatewaytest',
                    'password' => 'WHaNFE5C3qlChqNbAzH4',
                    'currency' => 'IQD',
                ]),
                'mode' => 'test',
                'alias' => 'QiCard',
                'is_active' => true,
            ],
            [
                'title' => 'PayU',
                'name' => 'payu',
                'config' => json_encode([
                    'merchant_key' => '',
                    'merchant_salt' => '',
                    'base_url' => 'https://secure.payu.in/_payment',
                ]),
                'mode' => 'test',
                'alias' => 'PayU',
                'is_active' => true,
            ],
            [
                'title' => 'CashFree',
                'name' => 'cashfree',
                'config' => json_encode([
                    'app_id' => '10284038c1f33442eff5cb81b563048201',
                    'secret_key' => 'cfsk_ma_prod_8f440f96332d6b5dae6c993b4eec5d54_53cfa6ca',
                    'base_url' => 'https://api.cashfree.com/pg/orders',
                ]),
                'mode' => 'test',
                'alias' => 'CashFree',
                'is_active' => true,
            ],
            [
                'title' => 'JazzCash',
                'name' => 'jazzcash',
                'config' => json_encode([
                    'merchant_id' => 'MC651136',
                    'password' => 'u4v42e33xb',
                    'integrity_salt' => '8118u2byxu',
                    'base_url' => 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform',
                    'note' => 'You have to setup this return URL in your JazzCash merchant account dashboard: '.route('payment.success.post'),
                ]),
                'mode' => 'test',
                'alias' => 'JazzCash',
                'is_active' => true,
            ],
            [
                'title' => 'Nagad',
                'name' => 'nagad',
                'config' => json_encode([
                    'merchant_id' => '',
                    'merchant_number' => '',
                    'public_key' => '',
                    'private_key' => '',
                    'note' => 'Provide the Nagad merchant id, merchant number, Nagad public key and your merchant private key (PEM body only). Callback URL is handled automatically.',
                ]),
                'mode' => 'test',
                'alias' => 'Nagad',
                'is_active' => true,
            ],
            [
                'title' => 'Rocket',
                'name' => 'rocket',
                'config' => json_encode([
                    'merchant_id' => '',
                    'api_key' => '',
                    'base_url' => 'https://sandbox.rocket.com.bd/checkout',
                    'note' => 'Rocket (DBBL) is served through a hosted checkout. Set the base_url, merchant id and api key provided by your Rocket/DBBL merchant account. Return URL to configure on their dashboard: '.route('payment.success.post'),
                ]),
                'mode' => 'test',
                'alias' => 'Rocket',
                'is_active' => true,
            ],
            [
                'title' => 'SSLCommerz',
                'name' => 'sslcommerz',
                'config' => json_encode([
                    'store_id' => 'testbox',
                    'store_passwd' => 'qwerty',
                    'currency' => 'BDT',
                    'note' => 'Default values are the SSLCommerz sandbox test store. Replace store_id and store_passwd with your live merchant credentials before going live.',
                ]),
                'mode' => 'test',
                'alias' => 'Sslcommerz',
                'is_active' => true,
            ],
        ];
        foreach ($paymentMethods as $method) {
            $exists = PaymentGateway::where('name', $method['name'])->first();
            if(!$exists) {
                PaymentGateway::create($method);
            }
        }
    }
}
