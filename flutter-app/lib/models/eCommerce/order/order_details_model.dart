import 'package:ready_ecommerce/models/eCommerce/address/add_address.dart';

class OrderDetails {
  OrderDetails({
    required this.message,
    required this.data,
  });
  late final String message;
  late final Data data;

  OrderDetails.fromJson(Map<String, dynamic> json) {
    message = json['message'];
    data = Data.fromJson(json['data']);
  }

  Map<String, dynamic> toJson() {
    final data = <String, dynamic>{};
    data['message'] = message;
    data['data'] = data;
    return data;
  }
}

class Data {
  Data({
    required this.order,
  });
  late final Order order;

  Data.fromJson(Map<String, dynamic> json) {
    order = Order.fromJson(json['order']);
  }

  Map<String, dynamic> toJson() {
    final data = <String, dynamic>{};
    data['order'] = order.toJson();
    return data;
  }
}

class Order {
  Order({
    required this.id,
    required this.orderCode,
    required this.orderStatus,
    required this.createdAt,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.taxAmount,
    required this.totalAmount,
    required this.discount,
    required this.couponDiscount,
    required this.payableAmount,
    required this.quantity,
    required this.deliveryCharge,
    required this.shop,
    required this.products,
    this.invoiceUrl,
    this.paymentReceiptUrl,
    required this.address,
    required this.isReturnable,
    required this.lastReturnDate,
    required this.returnOrderWithinDays,
    this.rider,
  });
  late final int id;
  late final String orderCode;
  late final String orderStatus;
  late final String createdAt;
  late final String paymentMethod;
  late final String paymentStatus;
  late double taxAmount;
  late final double totalAmount;
  late final double discount;
  late final double couponDiscount;
  late final double payableAmount;
  late final int quantity;
  late final double deliveryCharge;
  late final Shop shop;
  late final List<Products> products;
  late final String? invoiceUrl;
  late final String? paymentReceiptUrl;
  late final AddAddress address;
  late final bool? isReturnable;
  late final String? lastReturnDate;
  late final int? returnOrderWithinDays;
  late final Rider? rider;


  // Order.fromJson(Map<String, dynamic> json) {
  //   id = json['id'];
  //   orderCode = json['order_code'];
  //   orderStatus = json['order_status'];
  //   createdAt = json['created_at'];
  //   taxAmount = json['tax_amount'];
  //   paymentMethod = json['payment_method'];
  //   paymentStatus = json['payment_status'];
  //   totalAmount = json['total_amount'];
  //   discount = json['discount'];
  //   couponDiscount = json['coupon_discount'];
  //   payableAmount = json['payable_amount'];
  //   quantity = json['quantity'];
  //   deliveryCharge = json['delivery_charge'];
  //   shop = Shop.fromJson(json['shop']);
  //   products = List.from(json['products']).map((e) => Products.fromJson(e)).toList();
  //   invoiceUrl = json['invoice_url'];
  //   paymentReceiptUrl = json['payment_receipt_url'];
  //   address = AddAddress.fromMap(json['address']);
  //   isReturnable = json['is_returnable'];
  //   lastReturnDate = json['last_return_date'];
  //   returnOrderWithinDays = json['return_order_within_days'];
  //   rider = json['rider'] == null ? null : Rider.fromJson(json['rider']);
  //
  // }
  Order.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    orderCode = json['order_code'];
    orderStatus = json['order_status'];
    createdAt = json['created_at'];
    taxAmount = json['tax_amount'];
    paymentMethod = json['payment_method'];
    paymentStatus = json['payment_status'];
    totalAmount = json['total_amount'];
    discount = json['discount'];
    couponDiscount = json['coupon_discount'];
    payableAmount = json['payable_amount'];
    quantity = json['quantity'];
    deliveryCharge = json['delivery_charge'];
    shop = Shop.fromJson(json['shop']);
    products = List.from(json['products']).map((e) => Products.fromJson(e)).toList();
    invoiceUrl = json['invoice_url'];
    paymentReceiptUrl = json['payment_receipt_url'];
    address = AddAddress.fromMap(json['address']);
    isReturnable = json['is_returnable'];
    lastReturnDate = json['last_return_date'];
    returnOrderWithinDays = json['return_order_within_days'];

    // Fixed rider parsing - handle both List and Map cases
    if (json['rider'] == null) {
      rider = null;
    } else if (json['rider'] is List) {
      // If it's a list, take the first item (or null if empty)
      final riderList = json['rider'] as List;
      rider = riderList.isNotEmpty ? Rider.fromJson(riderList[0]) : null;
    } else if (json['rider'] is Map<String, dynamic>) {
      // If it's a map, parse it directly
      rider = Rider.fromJson(json['rider']);
    } else {
      rider = null;
    }
  }

  Map<String, dynamic> toJson() {
    final data = <String, dynamic>{};
    data['id'] = id;
    data['order_code'] = orderCode;
    data['order_status'] = orderStatus;
    data['created_at'] = createdAt;
    data['payment_method'] = paymentMethod;
    data['payment_status'] = paymentStatus;
    data['tax_amount'] = taxAmount;
    data['total_amount'] = totalAmount;
    data['discount'] = discount;
    data['coupon_discount'] = couponDiscount;
    data['payable_amount'] = payableAmount;
    data['quantity'] = quantity;
    data['delivery_charge'] = deliveryCharge;
    data['shop'] = shop.toJson();
    data['products'] = products.map((e) => e.toJson()).toList();
    data['invoice_url'] = invoiceUrl;
    data['address'] = address.toJson();
    data['rider'] = rider?.toJson();

    return data;
  }
}

class Shop {
  Shop({
    required this.id,
    required this.name,
    required this.logo,
    required this.banner,
    required this.totalProducts,
    required this.totalCategories,
    required this.rating,
    required this.shopStatus,
    required this.totalReviews,
  });
  late final int id;
  late final String name;
  late final String logo;
  late final String banner;
  late final int totalProducts;
  late final int totalCategories;
  late final double rating;
  late final String shopStatus;
  late final String totalReviews;

  Shop.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    name = json['name'];
    logo = json['logo'];
    banner = json['banner'];
    totalProducts = json['total_products'];
    totalCategories = json['total_categories'];
    rating = json['rating'];
    shopStatus = json['shop_status'];
    totalReviews = json['total_reviews'];
  }

  Map<String, dynamic> toJson() {
    final data = <String, dynamic>{};
    data['id'] = id;
    data['name'] = name;
    data['logo'] = logo;
    data['banner'] = banner;
    data['total_products'] = totalProducts;
    data['total_categories'] = totalCategories;
    data['rating'] = rating;
    data['shop_status'] = shopStatus;
    data['total_reviews'] = totalReviews;
    return data;
  }
}

class Products {
  Products({
    required this.id,
    required this.name,
    required this.brand,
    required this.thumbnail,
    required this.price,
    required this.orderQty,
    required this.color,
    required this.size,
    required this.discountPrice,
    required this.rating,
    required this.isReturnable,
    this.isDigital,
    this.licenses,
    this.attachments,
  });
  late final int id;
  late final String name;
  late final String? brand;
  late final String thumbnail;
  late final double price;
  late final int orderQty;
  late final String? color;
  late final String? size;
  late final double discountPrice;
  late final double? rating;
  late final bool? isReturnable;
  bool? isDigital;
  License? licenses;
  String? licenseDownloadUrl;
  List<Attachment>? attachments;

  Products.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    name = json['name'];
    brand = json['brand'] as String?;
    thumbnail = json['thumbnail'];
    price = json['price'];
    orderQty = json['order_qty'];
    color = json['color'];
    size = json['size'];
    discountPrice = (json['discount_price'] as num).toDouble();
    rating = json['rating'];
    isReturnable = json['is_returned'];
    isDigital = json['is_digital'];
    licenseDownloadUrl = json['license_download_link'];
    licenses =
        json['licenses'] == null ? null : License.fromJson(json['licenses']);
    attachments = json['attachments'] == null
        ? []
        : List<Attachment>.from(
            json['attachments'].map((x) => Attachment.fromJson(x)));
  }

  Map<String, dynamic> toJson() {
    final data = <String, dynamic>{};
    data['id'] = id;
    data['name'] = name;
    data['brand'] = brand;
    data['thumbnail'] = thumbnail;
    data['price'] = price;
    data['order_qty'] = orderQty;
    data['color'] = color;
    data['size'] = size;
    data['discount_price'] = discountPrice;
    data['rating'] = rating;
    data['is_returned'] = isReturnable;
    data['is_digital'] = isDigital;
    data['licenses'] = licenses;
    data['attachments'] = attachments;
    return data;
  }
}

class Attachment {
  int id;
  String url;
  String extension;

  Attachment({
    required this.id,
    required this.url,
    required this.extension,
  });

  factory Attachment.fromJson(Map<String, dynamic> json) => Attachment(
        id: json["id"],
        url: json["url"],
        extension: json["extension"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "url": url,
        "extension": extension,
      };
}

class License {
  int id;
  int productId;
  int userId;
  int orderId;
  String productLicense;
  int isUsed;
  int status;
  DateTime createdAt;
  DateTime updatedAt;

  License({
    required this.id,
    required this.productId,
    required this.userId,
    required this.orderId,
    required this.productLicense,
    required this.isUsed,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory License.fromJson(Map<String, dynamic> json) => License(
        id: json["id"],
        productId: json["product_id"],
        userId: json["user_id"],
        orderId: json["order_id"],
        productLicense: json["product_license"],
        isUsed: json["is_used"],
        status: json["status"],
        createdAt: DateTime.parse(json["created_at"]),
        updatedAt: DateTime.parse(json["updated_at"]),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "product_id": productId,
        "user_id": userId,
        "order_id": orderId,
        "product_license": productLicense,
        "is_used": isUsed,
        "status": status,
        "created_at": createdAt.toIso8601String(),
        "updated_at": updatedAt.toIso8601String(),
      };
}
class Rider {
  Rider({
    required this.id,
    required this.name,
    required this.phone,
    required this.profilePhoto,
    required this.assignedAt,
    required this.latitude,
    required this.longitude,
  });

  late final int id;
  late final String name;
  late final String phone;
  late final String profilePhoto;
  late final String assignedAt;
  late final String latitude;
  late final String longitude;

  Rider.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    name = json['name'];
    phone = json['phone'];
    profilePhoto = json['profile_photo'];
    assignedAt = json['assigned_at'];
    latitude = json['latitude'];
    longitude = json['longitude'];
  }

  Map<String, dynamic> toJson() {
    final data = <String, dynamic>{};
    data['id'] = id;
    data['name'] = name;
    data['phone'] = phone;
    data['profile_photo'] = profilePhoto;
    data['assigned_at'] = assignedAt;
    data['latitude'] = latitude;
    data['longitude'] = longitude;
    return data;
  }
}
