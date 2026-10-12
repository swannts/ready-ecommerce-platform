import 'package:flutter/material.dart';
import 'package:ready_ecommerce/views/eCommerce/order_track/layouts/ecommerce_pin_customer_location_layout.dart';
import 'package:ready_ecommerce/views/eCommerce/order_track/layouts/ecommerce_update_customer_location_layout.dart';

class EcommerceOrderTrackView extends StatelessWidget {
  const EcommerceOrderTrackView({super.key, required this.hasAddress, required this.latitude, required this.longitude});

    final bool? hasAddress;
    final double? latitude;
    final double? longitude;

  @override
  Widget build(BuildContext context) {

    if(hasAddress == true){
      return  EcommerceUpdateCustomerLocationLayout(latitude: latitude,longitude: longitude,);
    } else{
      return EcommercePinCustomerLocationLayout();
    }


  }
}
