import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ready_ecommerce/config/app_constants.dart';
import 'package:ready_ecommerce/models/eCommerce/cart/add_to_cart_model.dart';
import 'package:ready_ecommerce/models/eCommerce/cart/gift_add_model.dart';
import 'package:ready_ecommerce/services/base/eCommerce/cart_provider_base.dart';
import 'package:ready_ecommerce/services/common/hive_service_provider.dart';
import 'package:ready_ecommerce/utils/api_client.dart';

class CartService implements CartProviderBase {
  final Ref ref;
  CartService(this.ref);

  @override
  Future<Response> addToCart({required AddToCartModel addToCartModel}) async {
    debugPrint(
      'CartService.addToCart -> endpoint: ${AppConstants.addToCart}, payload: ${addToCartModel.toMap()}',
    );
    final response = await ref.read(apiClientProvider).post(
          AppConstants.addToCart,
          data: addToCartModel.toMap(),
        );
    debugPrint(
      'CartService.addToCart <- status: ${response.statusCode}, data: ${response.data}',
    );
    return response;
  }

  @override
  Future<Response> increentQty({required int productId}) async {
    final response = await ref
        .read(apiClientProvider)
        .post(AppConstants.incrementQty, data: {'product_id': productId});

    return response;
  }

  @override
  Future<Response> decrementQty({required int productId}) async {
    final response = await ref
        .read(apiClientProvider)
        .post(AppConstants.decrementQty, data: {
      'product_id': productId,
    });
    return response;
  }

  @override
  Future<Response> cartSummery({
    required String? couponId,
    required List<int> shopIds,
    dynamic addressId,
    bool? isBuyNow,
    double? latitude,
    double? longitude,
  }) async {
    final hiveLat = ref.read(hiveServiceProvider).getLatitude();
    final hiveLng = ref.read(hiveServiceProvider).getLongitude();

    final Map<String, dynamic> data = {
      'coupon_code': couponId,
      'shop_ids': shopIds,
      'is_buy_now': isBuyNow,
      'address_id': addressId,
      'latitude': latitude ?? hiveLat,
      'longitude': longitude ?? hiveLng,
    };

    final response = await ref.read(apiClientProvider).post(
          AppConstants.cartSummery,
          data: data,
        );
    return response;
  }

  @override
  Future<Response> getAllCarts() async {
    final response =
        await ref.read(apiClientProvider).get(AppConstants.getAllCarts);
    return response;
  }

  @override
  Future<Response> buyNow({
    required int productId,
    required String? couponCode,
    required int quantity,
  }) async {
    debugPrint(
      'CartService.buyNow -> endpoint: ${AppConstants.buyNow}, payload: {product_id: $productId, coupon_code: $couponCode, quantity: $quantity}',
    );
    final response = await ref.read(apiClientProvider).post(
      AppConstants.buyNow,
      data: {
        'product_id': productId,
        'coupon_code': couponCode,
        'quantity': quantity,
      },
    );
    debugPrint(
      'CartService.buyNow <- status: ${response.statusCode}, data: ${response.data}',
    );
    return response;
  }

  @override
  Future<Response> getAllGifts({required int shopId}) async {
    final response = await ref
        .read(apiClientProvider)
        .get(AppConstants.getAllGifts, query: {'shop_id': shopId});
    return response;
  }

  @override
  Future<Response> addGiftToCart({required GiftAddModel giftAddModel}) async {
    final userInfo = await ref.read(hiveServiceProvider).getUserInfo();
    final response = await ref.read(apiClientProvider).post(
      AppConstants.addGift,
      data: {...giftAddModel.toMap(), 'sender_name': userInfo?.name},
    );
    return response;
  }

  @override
  Future<Response> deleteGiftFromCart({required int giftId}) async {
    final response = await ref
        .read(apiClientProvider)
        .delete(AppConstants.removeGift, query: {
      'cart_id': giftId,
    });

    return response;
  }
}

final cartServiceProvider = Provider((ref) => CartService(ref));
