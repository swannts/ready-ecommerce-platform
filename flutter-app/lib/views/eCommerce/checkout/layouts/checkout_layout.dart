// import 'dart:developer';
//
// import 'package:flutter/material.dart';
// import 'package:flutter_form_builder/flutter_form_builder.dart';
// import 'package:flutter_riverpod/flutter_riverpod.dart';
// import 'package:flutter_screenutil/flutter_screenutil.dart';
// import 'package:flutter_svg/flutter_svg.dart';
// import 'package:gap/gap.dart';
// import 'package:ready_ecommerce/components/ecommerce/confirmation_dialog.dart';
// import 'package:ready_ecommerce/components/ecommerce/custom_button.dart';
// import 'package:ready_ecommerce/config/app_color.dart';
// import 'package:ready_ecommerce/config/app_text_style.dart';
// import 'package:ready_ecommerce/config/theme.dart';
// import 'package:ready_ecommerce/controllers/common/master_controller.dart';
// import 'package:ready_ecommerce/controllers/common/other_controller.dart';
// import 'package:ready_ecommerce/controllers/eCommerce/cart/cart_controller.dart';
// import 'package:ready_ecommerce/controllers/eCommerce/order/order_controller.dart';
// import 'package:ready_ecommerce/controllers/misc/misc_controller.dart';
// import 'package:ready_ecommerce/gen/assets.gen.dart';
// import 'package:ready_ecommerce/generated/l10n.dart';
// import 'package:ready_ecommerce/models/eCommerce/order/order_place_model.dart';
// import 'package:ready_ecommerce/routes.dart';
// import 'package:ready_ecommerce/services/common/hive_service_provider.dart';
// import 'package:ready_ecommerce/utils/context_less_navigation.dart';
// import 'package:ready_ecommerce/utils/global_function.dart';
// import 'package:ready_ecommerce/views/common/authentication/layouts/confirm_otp_layout.dart';
// import 'package:ready_ecommerce/views/eCommerce/checkout/components/add_address_button.dart';
// import 'package:ready_ecommerce/views/eCommerce/checkout/components/address_card.dart';
// import 'package:ready_ecommerce/views/eCommerce/checkout/components/address_modal_bottom_sheet.dart';
// import 'package:ready_ecommerce/views/eCommerce/checkout/components/build_payment_card.dart';
// import 'package:ready_ecommerce/views/eCommerce/checkout/components/order_placed_dialog.dart';
// import 'package:ready_ecommerce/views/eCommerce/checkout/components/pay_card.dart';
// import 'package:ready_ecommerce/views/eCommerce/checkout/layouts/web_payment_page.dart';
// import 'package:shimmer/shimmer.dart';
//
// class EcommerceCheckoutLayout extends ConsumerStatefulWidget {
//   final bool? isDigital;
//   final bool? isBuyNow;
//   final double payableAmount;
//   final String? couponCode;
//   final  List<int> shopIds;
//
//   const EcommerceCheckoutLayout({
//     super.key,
//     required this.payableAmount,
//     required this.couponCode,
//     required this.shopIds,
//     this.isBuyNow = false,
//     this.isDigital = false,
//   });
//
//   @override
//   ConsumerState<EcommerceCheckoutLayout> createState() => _EcommerceCheckoutLayoutState();
// }
//
// class _EcommerceCheckoutLayoutState
//     extends ConsumerState<EcommerceCheckoutLayout> {
//   final TextEditingController additionalTextEditingController = TextEditingController();
//   PaymentType selectedPaymentType = PaymentType.none;
//   // String selectedPayment = '';
//
//   @override
//   void initState() {
//
//
//     log("---shopIds----->> ${ widget.shopIds}");
//
//     WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
//       init();
//       ref.refresh(profileInfoControllerProvider);
//
//       // ref.read(cartSummeryController.notifier).calculateCartSummery(
//       //   couponCode: widget.couponCode,
//       //   shopIds: widget.shopIds,
//       //   addressId: 1
//       // );
//
//
//
//     });
//     super.initState();
//   }
//
//   void init() async{
//     ref.watch(hiveServiceProvider).getDefaultAddress().then((address) {
//       ref.read(selectedDeliveryAddress.notifier).state = address;
//     });
//
//     // Load default address from Hive
//     final defaultAddress = await ref.read(hiveServiceProvider).getDefaultAddress();
//
//     // Set the selected address
//     ref.read(selectedDeliveryAddress.notifier).state = defaultAddress;
//
//     // Initial calculation - use the addressId if available, otherwise fallback
//     final initialAddressId = defaultAddress?.addressId ?? 1; // or null if API allows
//
//     ref.read(cartSummeryController.notifier).calculateCartSummery(
//       couponCode: widget.couponCode,
//       shopIds: widget.shopIds,
//       addressId: initialAddressId,
//     );
//
//   }
//
//
//
//
//   String safePrice(dynamic value) {
//     if (value == null) return '0';
//
//     if (value is num) return value.toString();
//
//     if (value is List) {
//       return value.fold<double>(
//         0.0,
//             (sum, item) => sum + (item['amount'] ?? 0),
//       ).toString();
//     }
//
//     return double.tryParse(value.toString())?.toString() ?? '0';
//   }
//
//
//
//   @override
//   Widget build(BuildContext context,) {
//     debugPrint('couponCode: ${widget.couponCode}');
//     final masterData = ref.watch(masterControllerProvider.notifier).materModel;
//     final checkout = ref.watch(cartSummeryController);
//
//
//     return Scaffold(
//
//       backgroundColor: colors(context).accentColor,
//       appBar: AppBar(
//         surfaceTintColor: Theme.of(context).scaffoldBackgroundColor,
//         title: Text(S.of(context).checkout),
//       ),
//       bottomNavigationBar:
//           ref.watch(profileInfoControllerProvider).whenOrNull(data: (user) {
//         return _buildBottomNavigationBar(isProfileVerify: user.accountVerified);
//       }),
//       body: Container(
//         margin: EdgeInsets.only(top: 10.h),
//         color: GlobalFunction.getContainerColor(),
//         width: double.infinity,
//         padding: EdgeInsets.symmetric(
//           horizontal: 20.w,
//           vertical: 8.h,
//         ),
//         child: SingleChildScrollView(
//           child: Column(
//             mainAxisSize: MainAxisSize.min,
//             children: [
//               _buildAddressWidget(couponCode: widget.couponCode, shopIds: widget.shopIds
//
//               ),
//               Gap(20.h),
//               _buildAdditionalInfoTextField(),
//               Gap(20.h),
//
//
//
//
//               Container(
//                 height: 200.h,
//                 width: double.infinity,
//                 decoration: BoxDecoration(
//                   color: EcommerceAppColor.gray.withValues(alpha: 0.1),
//                   borderRadius: BorderRadius.circular(16.r)
//
//                 ),
//                 child: Padding(
//                   padding:  EdgeInsets.all(16.r),
//                   child: Column(
//                     children: [
//
//                       Row(
//
//                         children: [
//                           Column(
//                             spacing: 3.h,
//                             crossAxisAlignment: CrossAxisAlignment.start,
//                             children: [
//                               Text("Total Amount", style: AppTextStyle(context).bodyText.copyWith(fontSize: 16.sp)),
//                               Text("Delivery Charge", style: AppTextStyle(context).bodyText.copyWith(fontSize: 16.sp)),
//                               Text("Coupon Discount", style: AppTextStyle(context).bodyText.copyWith(fontSize: 16.sp)),
//                               Text("Order Tax Amount", style: AppTextStyle(context).bodyText.copyWith(fontSize: 16.sp)),
//                               Text("All Vat Taxes", style: AppTextStyle(context).bodyText.copyWith(fontSize: 16.sp)),
//                               Text("Payable Amount", style: AppTextStyle(context).bodyText.copyWith(fontSize: 16.sp)),
//
//                             ],
//                           ),
//                           Gap(10.w),
//                           Column(
//                             spacing: 3.h,
//                             crossAxisAlignment: CrossAxisAlignment.start,
//                             children: [
//                               Text(":", style: AppTextStyle(context).bodyText.copyWith(fontSize: 16.sp)),
//                               Text(":", style: AppTextStyle(context).bodyText.copyWith(fontSize: 16.sp)),
//                               Text(":", style: AppTextStyle(context).bodyText.copyWith(fontSize: 16.sp)),
//                               Text(":", style: AppTextStyle(context).bodyText.copyWith(fontSize: 16.sp)),
//                               Text(":", style: AppTextStyle(context).bodyText.copyWith(fontSize: 16.sp)),
//                               Text(":", style: AppTextStyle(context).bodyText.copyWith(fontSize: 16.sp)),
//
//                             ],
//                           ),
//                           Spacer(),
//                           Column(
//                             spacing: 3.h,
//                             crossAxisAlignment: CrossAxisAlignment.end,
//                             children: [
//                               Text(
//                                 GlobalFunction.price(
//                                   ref: ref,
//                                   price: checkout['totalAmount']?.toString() ?? '0',
//                                 ),
//                                 style: AppTextStyle(context).bodyText.copyWith(fontSize: 16.sp),
//                               ),
//                               Text(
//                                 GlobalFunction.price(
//                                   ref: ref,
//                                   price: checkout['deliveryCharge']?.toString() ?? '0',
//                                 ),
//                                 style: AppTextStyle(context).bodyText.copyWith(fontSize: 16.sp),
//                               ),
//                               Text(
//                                 '- ${GlobalFunction.price(
//                                   ref: ref,
//                                   price: checkout['discount']?.toString() ?? '0',
//                                 )}',
//                                 style: AppTextStyle(context).bodyText.copyWith(fontSize: 16.sp),
//                               ),
//                               Text(
//                                 GlobalFunction.price(
//                                   ref: ref,
//                                   price: checkout['orderTaxAmount']?.toString() ?? '0',
//                                 ),
//                                 style: AppTextStyle(context).bodyText.copyWith(fontSize: 16.sp),
//                               ),
//
//                               Text(
//                                 GlobalFunction.price(
//                                   ref: ref,
//                                   price: safePrice(checkout['allVatTaxes']),
//                                 ),
//                                 style: AppTextStyle(context).bodyText.copyWith(fontSize: 16.sp),
//                               ),
//
//                               Text(
//                                 GlobalFunction.price(
//                                   ref: ref,
//                                   price: checkout['payableAmount']?.toString() ?? '0',
//                                 ),
//                                 style: AppTextStyle(context).bodyText.copyWith(
//                                   fontSize: 16.sp,
//                                   fontWeight: FontWeight.bold,
//                                 ),
//                               ),
//
//
//                             ],
//                           ),
//
//                         ],
//                       )
//
//                     ],
//                   ),
//                 ),
//               ),
//               Gap(20.h),
//               _buildToBePaidWidget(),
//               if (selectedPaymentType == PaymentType.online) ...[
//                 _buildPaymentMethodsWidget()
//                 // const CircularProgressIndicator(),
//               ]
//             ],
//           ),
//         ),
//       ),
//     );
//   }
//
//   Widget _buildAddressWidget({required String? couponCode,required List<int> shopIds}) {
//     return Consumer(builder: (context, ref, _) {
//       return Column(
//         children: [
//           Row(
//             mainAxisAlignment: MainAxisAlignment.spaceBetween,
//             children: [
//               Text(
//                 S.of(context).deliveryAddress,
//                 style: AppTextStyle(context).subTitle,
//               ),
//               ref.watch(selectedDeliveryAddress) != null
//                   ? GestureDetector(
//                       onTap: () {
//                         showModalBottomSheet(
//                           isScrollControlled: true,
//                           shape: RoundedRectangleBorder(
//                             borderRadius: BorderRadius.only(
//                               topLeft: Radius.circular(12.r),
//                               topRight: Radius.circular(12.r),
//                             ),
//                           ),
//                           context: context,
//                           builder: (context) {
//                             return  AddressModalBottomSheet(
//                               couponCode: couponCode,
//                               shopIds: shopIds,
//                             );
//                           },
//                         );
//                       },
//                       child: Text(
//                         S.of(context).change,
//                         style: AppTextStyle(context).bodyTextSmall.copyWith(
//                               color: colors(context).primaryColor,
//                             ),
//                       ),
//                     )
//                   : const SizedBox()
//             ],
//           ),
//           Gap(10.h),
//           ref.watch(selectedDeliveryAddress) != null
//               ? AddressCard(
//                   address: ref.watch(selectedDeliveryAddress.notifier).state,
//
//                 )
//               : _buildAddAddressCardWidget(),
//         ],
//       );
//     });
//   }
//
//   Widget _buildAddAddressCardWidget() {
//     return Container(
//       padding: EdgeInsets.symmetric(
//         horizontal: 14.w,
//         vertical: 14.h,
//       ),
//       decoration: ShapeDecoration(
//         shape: RoundedRectangleBorder(
//           borderRadius: BorderRadius.circular(10.r),
//           side: const BorderSide(color: EcommerceAppColor.offWhite),
//         ),
//       ),
//       child: Row(
//         children: [
//           SvgPicture.asset(
//             Assets.svg.locationPurple,
//             width: 20.w,
//           ),
//           Gap(10.w),
//           Expanded(
//             child: AddAddressButton(
//               onTap: () {
//                 showModalBottomSheet(
//                   isScrollControlled: true,
//                   shape: RoundedRectangleBorder(
//                     borderRadius: BorderRadius.only(
//                       topLeft: Radius.circular(12.r),
//                       topRight: Radius.circular(12.r),
//                     ),
//                   ),
//                   context: context,
//                   builder: (context) {
//                     return const AddressModalBottomSheet();
//                   },
//                 );
//               },
//             ),
//           )
//         ],
//       ),
//     );
//   }
//
//   Widget _buildAdditionalInfoTextField() {
//     return FormBuilderTextField(
//       textAlign: TextAlign.start,
//       name: 'additionalInfo',
//       controller: additionalTextEditingController,
//       style: AppTextStyle(context).bodyText.copyWith(
//             fontWeight: FontWeight.w600,
//           ),
//       cursorColor: colors(context).primaryColor,
//       maxLines: 5,
//       minLines: 3,
//       decoration: InputDecoration(
//         contentPadding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16),
//         alignLabelWithHint: true,
//         hintText: 'Write here any additional info',
//         hintStyle: AppTextStyle(context).bodyText.copyWith(
//               fontWeight: FontWeight.w500,
//               color: colors(context).hintTextColor,
//             ),
//         floatingLabelStyle: AppTextStyle(context).bodyText.copyWith(
//               fontWeight: FontWeight.w400,
//               color: colors(context).primaryColor,
//             ),
//         filled: true,
//         fillColor: colors(context).accentColor,
//         errorStyle: AppTextStyle(context).bodyTextSmall.copyWith(
//               fontWeight: FontWeight.w400,
//               color: colors(context).errorColor,
//             ),
//         border: OutlineInputBorder(
//             borderRadius: BorderRadius.circular(10.r),
//             borderSide: BorderSide.none),
//       ),
//       keyboardType: TextInputType.text,
//       textInputAction: TextInputAction.done,
//     );
//   }
//
//   Widget _buildToBePaidWidget() {
//     final masterData = ref.watch(masterControllerProvider.notifier).materModel;
//     bool isCashonDeliveryEnable = masterData.data.cashOnDelivery;
//     bool isOnlinePaymentEnable = masterData.data.onlinePayment;
//     debugPrint('isCashonDeliveryEnable: $isCashonDeliveryEnable');
//     debugPrint('isOnlinePaymentEnable: $isOnlinePaymentEnable');
//     return Column(
//       children: [
//         Row(
//           mainAxisAlignment: MainAxisAlignment.spaceBetween,
//           children: [
//             SizedBox(
//               child: Row(
//                 children: [
//                   SvgPicture.asset(Assets.svg.receipt),
//                   Gap(8.w),
//                   Text(
//                     S.of(context).toBePaid,
//                     style: AppTextStyle(context).subTitle,
//                   )
//                 ],
//               ),
//             ),
//             Text(
//               GlobalFunction.price(
//                 ref: ref,
//                 price:
//                     ref.read(cartSummeryController)['payableAmount'].toString(),
//               ),
//               style: AppTextStyle(context).subTitle,
//             )
//           ],
//         ),
//         Gap(10.h),
//         Row(
//           children: [
//             if (isCashonDeliveryEnable && widget.isDigital != true)
//               Flexible(
//                 flex: 1,
//                 child: PayCard(
//                   isActive:
//                       selectedPaymentType == PaymentType.cash ? true : false,
//                   type: S.of(context).cashOnDelivery,
//                   image: Assets.png.cash.image(),
//                   onTap: () {
//                     if (selectedPaymentType != PaymentType.cash) {
//                       setState(() {
//                         selectedPaymentType = PaymentType.cash;
//                       });
//                     }
//                   },
//                 ),
//               ),
//             Gap(10.w),
//             if (isOnlinePaymentEnable)
//               Flexible(
//                 flex: 1,
//                 child: PayCard(
//                   isActive:
//                       selectedPaymentType == PaymentType.online ? true : false,
//                   type: S.of(context).creditOrDebitCard,
//                   image: Assets.png.card.image(),
//                   onTap: () {
//                     if (selectedPaymentType != PaymentType.online) {
//                       setState(() {
//                         selectedPaymentType = PaymentType.online;
//                       });
//                     }
//                   },
//                 ),
//               )
//           ],
//         ),
//       ],
//     );
//   }
//
//   Widget _buildBottomNavigationBar({bool? isProfileVerify}) {
//     final masterData = ref.watch(masterControllerProvider.notifier).materModel;
//     final orderPlaceAccountVerify = masterData.data.orderPlaceAccountVerify;
//     final registerOtpType = masterData.data.registerOtpType;
//     debugPrint('registerOtpType: $registerOtpType');
//     debugPrint('orderPlaceAccountVerify: $orderPlaceAccountVerify');
//     return Container(
//       height: orderPlaceAccountVerify == true && isProfileVerify == false
//           ? 110.h
//           : 76.h,
//       color: Theme.of(context).scaffoldBackgroundColor,
//       padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 4.h),
//       child: Column(
//         children: [
//           orderPlaceAccountVerify == true && isProfileVerify == false
//               ? Container(
//                   padding: EdgeInsets.symmetric(
//                     horizontal: 10.w,
//                     vertical: 4.h,
//                   ),
//                   decoration: ShapeDecoration(
//                     shape: RoundedRectangleBorder(
//                       borderRadius: BorderRadius.circular(10.r),
//                       side: BorderSide(
//                         width: 1.5,
//                         color: colors(context).accentColor!,
//                       ),
//                     ),
//                   ),
//                   child: Row(
//                     mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                     children: [
//                       Shimmer(
//                         gradient: LinearGradient(
//                           colors: [
//                             Colors.deepPurple,
//                             Colors.yellow,
//                             Colors.red,
//                           ],
//                           stops: [0.2, 0.5, 0.8],
//                           begin: Alignment.centerLeft,
//                           end: Alignment.centerRight,
//                         ),
//                         child: Text(
//                           S.of(context).pleaseVerifyYourAccount,
//                           style: AppTextStyle(context).title.copyWith(
//                               fontSize: 14.sp, fontWeight: FontWeight.bold),
//                         ),
//                       ),
//                       GestureDetector(
//                         onTap: () {
//                           ref
//                               .read(hiveServiceProvider)
//                               .getUserInfo()
//                               .then((userInfo) {
//                             if (userInfo != null) {
//                               if (registerOtpType == 'email') {
//                                 if (userInfo.email == null) {
//                                   GlobalFunction.showCustomSnackbar(
//                                       message:
//                                           "Please update your profile with email to verify your account",
//                                       isSuccess: false);
//                                 } else {
//                                   context.nav.pushNamed(
//                                     Routes.confirmOTP,
//                                     arguments: ConfirmOTPScreenArguments(
//                                         phoneNumber: userInfo.email!,
//                                         isPasswordRecover: false,
//                                         isFromCheckoutScreen: true),
//                                   );
//                                 }
//                               } else if (registerOtpType == 'phone') {
//                                 if (userInfo.email == null) {
//                                   GlobalFunction.showCustomSnackbar(
//                                       message:
//                                           "Please update your profile with phone number to verify your account",
//                                       isSuccess: false);
//                                 } else {
//                                   context.nav.pushNamed(
//                                     Routes.confirmOTP,
//                                     arguments: ConfirmOTPScreenArguments(
//                                         phoneNumber: userInfo.phone!,
//                                         isPasswordRecover: false,
//                                         isFromCheckoutScreen: true),
//                                   );
//                                 }
//                               }
//                             }
//                           });
//                         },
//                         child: Container(
//                           padding: EdgeInsets.symmetric(
//                             horizontal: 6.w,
//                             vertical: 2.h,
//                           ),
//                           decoration: ShapeDecoration(
//                             color:
//                                 colors(context).primaryColor!.withOpacity(0.1),
//                             shape: RoundedRectangleBorder(
//                               side: BorderSide(
//                                 width: 1,
//                                 color: colors(context).primaryColor!,
//                               ),
//                               borderRadius: BorderRadius.circular(4.r),
//                             ),
//                           ),
//                           child: Text(
//                             S.of(context).verifyNow,
//                             style: AppTextStyle(context).bodyTextSmall.copyWith(
//                                   color: colors(context).primaryColor,
//                                 ),
//                           ),
//                         ),
//                       ),
//                     ],
//                   ),
//                 )
//               : SizedBox.shrink(),
//           Gap(8.h),
//           ref.watch(orderControllerProvider)
//               ? const Center(child: CircularProgressIndicator())
//               : AbsorbPointer(
//                   absorbing: selectedPaymentType == PaymentType.none,
//                   child: CustomButton(
//                     buttonColor: selectedPaymentType == PaymentType.none
//                         ? ColorTween(
//                             begin: colors(context).primaryColor,
//                             end: colors(context).light,
//                           ).lerp(0.5)
//                         : colors(context).primaryColor,
//                     buttonText: S.of(context).placeOrder,
//                     onPressed: () {
//                       if (isProfileVerify == false &&
//                           orderPlaceAccountVerify == true) {
//                         GlobalFunction.showCustomSnackbar(
//                           message: 'Please verify your account first!',
//                           isSuccess: false,
//                         );
//                       } else if (ref.watch(selectedDeliveryAddress) == null) {
//                         GlobalFunction.showCustomSnackbar(
//                           message: 'Please add your delivery address!',
//                           isSuccess: false,
//                         );
//                       } else if (selectedPaymentType == PaymentType.online &&
//                           ref.read(selectedPayment) == '') {
//                         GlobalFunction.showCustomSnackbar(
//                           message: 'Please select your payment method!',
//                           isSuccess: false,
//                         );
//                       } else {
//                         if (selectedPaymentType == PaymentType.cash) {
//                           showDialog(
//                               context: context,
//                               barrierColor:
//                                   colors(context).accentColor!.withOpacity(0.8),
//                               builder: (context) => ConfirmationDialog(
//                                     title: S.of(context).pyment,
//                                     des: S.of(context).cashPaymentDes,
//                                     confirmButtonText: S.of(context).yes,
//                                     cancelButtonText: S.of(context).no,
//                                     confirmationButtonColor:
//                                         colors(context).primaryColor,
//                                     onPressed: () {
//                                       context.nav.pop();
//                                       _placeOrder();
//                                     },
//                                   ));
//                         } else {
//                           _placeOrder();
//                         }
//                       }
//                     },
//                   ),
//                 ),
//         ],
//       ),
//     );
//   }
//
//   Widget _buildPaymentMethodsWidget() {
//     return SizedBox(
//       child: ListView.builder(
//         physics: const NeverScrollableScrollPhysics(),
//         padding: EdgeInsets.only(top: 16.h),
//         shrinkWrap: true,
//         itemCount: ref
//             .read(masterControllerProvider.notifier)
//             .materModel
//             .data
//             .paymentGateways
//             .length,
//         itemBuilder: (context, index) {
//           final paymentMethod = ref
//               .read(masterControllerProvider.notifier)
//               .materModel
//               .data
//               .paymentGateways[index];
//           return Padding(
//             padding: EdgeInsets.only(bottom: 10.h),
//             child: PaymentCard(
//               onTap: () {
//                 ref.read(selectedPayment.notifier).state = paymentMethod.name;
//               },
//               isActive: ref.watch(selectedPayment) == paymentMethod.name,
//               paymentGateways: paymentMethod,
//             ),
//           );
//         },
//       ),
//     );
//   }
//
//   void _placeOrder() {
//     final OrderPlaceModel order = OrderPlaceModel(
//       addressId: ref.watch(selectedDeliveryAddress)!.addressId,
//       couponId: widget.couponCode,
//       note: additionalTextEditingController.text,
//       paymentMethod: selectedPaymentType == PaymentType.online
//           ? ref.read(selectedPayment)
//           : selectedPaymentType.name,
//       shopIds: ref.read(shopIdsProvider).toList(),
//       isBuyNow: widget.isBuyNow == true ? 1 : null,
//     );
//     ref
//         .read(orderControllerProvider.notifier)
//         .placeOrder(orderPlaceModel: order)
//         .then((response) {
//       if (response.isSuccess) {
//         ref.invalidate(isProfileVefifySuccess);
//         ref.read(cartController.notifier).getAllCarts();
//         ref.refresh(selectedTabIndexProvider.notifier).state;
//         if (response.data != null) {
//           if (mounted) {
//             context.nav.pushNamedAndRemoveUntil(
//               Routes.webPaymentScreen,
//               (route) => false,
//               arguments: WebPaymentScreenArg(
//                 paymentUrl: response.data,
//                 orderId: null,
//               ),
//             );
//           }
//         } else {
//           if (mounted) {
//             showDialog(
//               barrierDismissible: false,
//               context: context,
//               builder: (context) => OrderPlacedDialog(),
//             );
//           }
//         }
//       }
//     });
//   }
// }
//
// class OrderNowArguments {
//   final int productId;
//   final int quantity;
//   final String? color;
//   final String? size;
//   OrderNowArguments({
//     required this.productId,
//     required this.quantity,
//     this.color,
//     this.size,
//   });
// }
//
// enum PaymentType { cash, online, none }
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:gap/gap.dart';
import 'package:ready_ecommerce/components/ecommerce/confirmation_dialog.dart';
import 'package:ready_ecommerce/components/ecommerce/custom_button.dart';
import 'package:ready_ecommerce/config/app_color.dart';
import 'package:ready_ecommerce/config/app_text_style.dart';
import 'package:ready_ecommerce/config/theme.dart';
import 'package:ready_ecommerce/controllers/common/master_controller.dart';
import 'package:ready_ecommerce/controllers/common/other_controller.dart';
import 'package:ready_ecommerce/controllers/eCommerce/cart/cart_controller.dart';
import 'package:ready_ecommerce/controllers/eCommerce/order/order_controller.dart';
import 'package:ready_ecommerce/controllers/misc/misc_controller.dart';
import 'package:ready_ecommerce/gen/assets.gen.dart';
import 'package:ready_ecommerce/generated/l10n.dart';
import 'package:ready_ecommerce/models/eCommerce/order/order_place_model.dart';
import 'package:ready_ecommerce/routes.dart';
import 'package:ready_ecommerce/services/common/hive_service_provider.dart';
import 'package:ready_ecommerce/utils/context_less_navigation.dart';
import 'package:ready_ecommerce/utils/global_function.dart';
import 'package:ready_ecommerce/views/common/authentication/layouts/confirm_otp_layout.dart';
import 'package:ready_ecommerce/views/eCommerce/checkout/components/add_address_button.dart';
import 'package:ready_ecommerce/views/eCommerce/checkout/components/address_card.dart';
import 'package:ready_ecommerce/views/eCommerce/checkout/components/address_modal_bottom_sheet.dart';
import 'package:ready_ecommerce/views/eCommerce/checkout/components/build_payment_card.dart';
import 'package:ready_ecommerce/views/eCommerce/checkout/components/order_placed_dialog.dart';
import 'package:ready_ecommerce/views/eCommerce/checkout/components/pay_card.dart';
import 'package:ready_ecommerce/views/eCommerce/checkout/layouts/web_payment_page.dart';
import 'package:shimmer/shimmer.dart';

class EcommerceCheckoutLayout extends ConsumerStatefulWidget {
  final bool? isDigital;
  final bool? isBuyNow;
  final double payableAmount;
  final String? couponCode;
  final  List<int> shopIds;

  const EcommerceCheckoutLayout({
    super.key,
    required this.payableAmount,
    required this.couponCode,
    required this.shopIds,
    this.isBuyNow = false,
    this.isDigital = false,
  });

  @override
  ConsumerState<EcommerceCheckoutLayout> createState() => _EcommerceCheckoutLayoutState();
}

class _EcommerceCheckoutLayoutState
    extends ConsumerState<EcommerceCheckoutLayout> {
  final TextEditingController additionalTextEditingController = TextEditingController();
  PaymentType selectedPaymentType = PaymentType.none;
  // String selectedPayment = '';

  @override
  void initState() {


    log("---shopIds----->> ${ widget.shopIds}");

    WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
      init();
      ref.refresh(profileInfoControllerProvider);

      // ref.read(cartSummeryController.notifier).calculateCartSummery(
      //   couponCode: widget.couponCode,
      //   shopIds: widget.shopIds,
      //   addressId: 1
      // );

      WidgetsBinding.instance.addPostFrameCallback((_){
        ref.watch(selectedDeliveryAddress);
      });


    });
    super.initState();
  }

  void init() async{
    ref.watch(hiveServiceProvider).getDefaultAddress().then((address) {
      ref.read(selectedDeliveryAddress.notifier).state = address;
    });

    // Load default address from Hive
    final defaultAddress = await ref.read(hiveServiceProvider).getDefaultAddress();

    // Set the selected address
    ref.read(selectedDeliveryAddress.notifier).state = defaultAddress;

    // Initial calculation - use the addressId if available, otherwise fallback
    final initialAddressId = defaultAddress?.addressId ?? 1; // or null if API allows

    ref.read(cartSummeryController.notifier).calculateCartSummery(
      couponCode: widget.couponCode,
      shopIds: widget.shopIds,
      addressId: initialAddressId,
      latitude: defaultAddress?.latitude,
      longitude: defaultAddress?.longitude,
        isBuyNow: true
    );

   log("--------------->> message");
  }




  String safePrice(dynamic value) {
    if (value == null) return '0';

    if (value is num) return value.toString();

    if (value is List) {
      return value.fold<double>(
        0.0,
            (sum, item) => sum + (item['amount'] ?? 0),
      ).toString();
    }

    return double.tryParse(value.toString())?.toString() ?? '0';
  }



  @override
  Widget build(BuildContext context,) {
    debugPrint('couponCode: ${widget.couponCode}');
    final masterData = ref.watch(masterControllerProvider.notifier).materModel;
   // final checkout = ref.watch(cartSummeryController);

    final allVatTaxes = ref.watch(cartSummeryController)['allVatTaxes'] as List;
    return Scaffold(

      backgroundColor: colors(context).accentColor,
      appBar: AppBar(
        surfaceTintColor: Theme.of(context).scaffoldBackgroundColor,
        title: Text(S.of(context).checkout),
      ),
      bottomNavigationBar:
      ref.watch(profileInfoControllerProvider).whenOrNull(data: (user) {
        return _buildBottomNavigationBar(isProfileVerify: user.accountVerified);
      }),
      body: Container(
        margin: EdgeInsets.only(top: 10.h),
        color: GlobalFunction.getContainerColor(),
        width: double.infinity,
        padding: EdgeInsets.symmetric(
          horizontal: 20.w,
          vertical: 8.h,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildAddressWidget(couponCode: widget.couponCode, shopIds: widget.shopIds

              ),
              Gap(20.h),
              _buildAdditionalInfoTextField(),
              Gap(20.h),





              Container(
                padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 12.h),
                decoration: ShapeDecoration(
                  color: colors(context).accentColor,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10.r),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSummaryRow(
                      context: context,
                      title: S.of(context).subTotal,
                      value: ref.watch(cartSummeryController)['totalAmount'],
                    ),
                    Gap(10.h),
                    _buildSummaryRow(
                      context: context,
                      title: S.of(context).discount,
                      value: ref.watch(cartSummeryController)['discount'],
                      isDiscount: true,
                    ),
                    Gap(10.h),
                    _buildSummaryRow(
                      context: context,
                      title: S.of(context).deliveryCharge,
                      value: ref.watch(cartSummeryController)['deliveryCharge'],
                    ),
                    Gap(10.h),
                    Text(
                      S
                          .of(context)
                          .orderSummary
                          .replaceAll("Order", S.of(context).vatTax),
                      style: AppTextStyle(context).bodyText.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Gap(6.h),
                    Column(
                        children: List.generate(allVatTaxes.length, (index) {
                          final tax = allVatTaxes[index];
                          return _buildSummaryRow(
                            context: context,
                            title: "${tax['name'] ?? ''} (${tax['percentage']}%)",
                            value: double.parse(tax['amount'].toString()),
                          );
                        })),
                    Gap(10.h),
                    _buildSummaryRow(
                      isPayable: true,
                      context: context,
                      title: S.of(context).totalVatTaxAmount,
                      value: ref.watch(cartSummeryController)['orderTaxAmount'],
                    ),
                    Gap(10.h),
                    const Divider(
                      thickness: 1,
                    ),
                    Gap(5.h),
                    _buildSummaryRow(
                      context: context,
                      title: S.of(context).payableAmount,
                      value: ref.watch(cartSummeryController)['payableAmount'],
                      isPayable: true,
                    ),
                  ],
                ),
              ),
              Gap(20.h),
              _buildToBePaidWidget(),
              if (selectedPaymentType == PaymentType.online) ...[
                _buildPaymentMethodsWidget()
                // const CircularProgressIndicator(),
              ]
            ],
          ),
        ),
      ),
    );
  }
  Widget _buildSummaryRow({
    required String title,
    required double value,
    required BuildContext context,
    bool isDiscount = false,
    bool isPayable = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: AppTextStyle(context).bodyText.copyWith(
              fontWeight: isPayable ? FontWeight.bold : FontWeight.w500),
        ),
        Text(
          "${isDiscount ? '-' : ''}${GlobalFunction.price(
            ref: ref,
            price: value.toString(),
          )}",
          style: AppTextStyle(context).bodyText.copyWith(
              fontWeight: isPayable ? FontWeight.bold : FontWeight.w500,
              color: isDiscount ? EcommerceAppColor.primary : null),
        ),
      ],
    );
  }
  Widget _buildAddressWidget({required String? couponCode,required List<int> shopIds}) {
    return Consumer(builder: (context, ref, _) {
      return Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                S.of(context).deliveryAddress,
                style: AppTextStyle(context).subTitle,
              ),
              ref.watch(selectedDeliveryAddress) != null
                  ? GestureDetector(
                onTap: () {
                  showModalBottomSheet(
                    isScrollControlled: true,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(12.r),
                        topRight: Radius.circular(12.r),
                      ),
                    ),
                    context: context,
                    builder: (context) {
                      return  AddressModalBottomSheet(
                        couponCode: couponCode,
                        shopIds: shopIds,
                      );
                    },
                  );
                },
                child: Text(
                  S.of(context).change,
                  style: AppTextStyle(context).bodyTextSmall.copyWith(
                    color: colors(context).primaryColor,
                  ),
                ),
              )
                  : const SizedBox()
            ],
          ),
          Gap(10.h),
          ref.watch(selectedDeliveryAddress) != null
              ? AddressCard(
            address: ref.watch(selectedDeliveryAddress.notifier).state,

          )
              : _buildAddAddressCardWidget(couponCode: couponCode),
        ],
      );
    });
  }

  Widget _buildAddAddressCardWidget({required String? couponCode}) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: 14.w,
        vertical: 14.h,
      ),
      decoration: ShapeDecoration(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10.r),
          side: const BorderSide(color: EcommerceAppColor.offWhite),
        ),
      ),
      child: Row(
        children: [
          SvgPicture.asset(
            Assets.svg.locationPurple,
            width: 20.w,
          ),
          Gap(10.w),
          Expanded(
            child: AddAddressButton(
              onTap: () {
                showModalBottomSheet(
                  isScrollControlled: true,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(12.r),
                      topRight: Radius.circular(12.r),
                    ),
                  ),
                  context: context,
                  builder: (context) {
                    return  AddressModalBottomSheet(
                      couponCode: couponCode,
                      shopIds: widget.shopIds,);
                  },
                );
              },
            ),
          )
        ],
      ),
    );
  }

  Widget _buildAdditionalInfoTextField() {
    return FormBuilderTextField(
      textAlign: TextAlign.start,
      name: 'additionalInfo',
      controller: additionalTextEditingController,
      style: AppTextStyle(context).bodyText.copyWith(
        fontWeight: FontWeight.w600,
      ),
      cursorColor: colors(context).primaryColor,
      maxLines: 5,
      minLines: 3,
      decoration: InputDecoration(
        contentPadding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16),
        alignLabelWithHint: true,
        hintText: 'Write here any additional info',
        hintStyle: AppTextStyle(context).bodyText.copyWith(
          fontWeight: FontWeight.w500,
          color: colors(context).hintTextColor,
        ),
        floatingLabelStyle: AppTextStyle(context).bodyText.copyWith(
          fontWeight: FontWeight.w400,
          color: colors(context).primaryColor,
        ),
        filled: true,
        fillColor: colors(context).accentColor,
        errorStyle: AppTextStyle(context).bodyTextSmall.copyWith(
          fontWeight: FontWeight.w400,
          color: colors(context).errorColor,
        ),
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10.r),
            borderSide: BorderSide.none),
      ),
      keyboardType: TextInputType.text,
      textInputAction: TextInputAction.done,
    );
  }

  Widget _buildToBePaidWidget() {
    final masterData = ref.watch(masterControllerProvider.notifier).materModel;
    bool isCashonDeliveryEnable = masterData.data.cashOnDelivery;
    bool isOnlinePaymentEnable = masterData.data.onlinePayment;
    debugPrint('isCashonDeliveryEnable: $isCashonDeliveryEnable');
    debugPrint('isOnlinePaymentEnable: $isOnlinePaymentEnable');
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            SizedBox(
              child: Row(
                children: [
                  SvgPicture.asset(Assets.svg.receipt),
                  Gap(8.w),
                  Text(
                    S.of(context).toBePaid,
                    style: AppTextStyle(context).subTitle,
                  )
                ],
              ),
            ),
            Text(
              GlobalFunction.price(
                ref: ref,
                price:
                ref.read(cartSummeryController)['payableAmount'].toString(),
              ),
              style: AppTextStyle(context).subTitle,
            )
          ],
        ),
        Gap(10.h),
        Row(
          children: [
            if (isCashonDeliveryEnable && widget.isDigital != true)
              Flexible(
                flex: 1,
                child: PayCard(
                  isActive:
                  selectedPaymentType == PaymentType.cash ? true : false,
                  type: S.of(context).cashOnDelivery,
                  image: Assets.png.cash.image(),
                  onTap: () {
                    if (selectedPaymentType != PaymentType.cash) {
                      setState(() {
                        selectedPaymentType = PaymentType.cash;
                      });
                    }
                  },
                ),
              ),
            Gap(10.w),
            if (isOnlinePaymentEnable)
              Flexible(
                flex: 1,
                child: PayCard(
                  isActive:
                  selectedPaymentType == PaymentType.online ? true : false,
                  type: S.of(context).creditOrDebitCard,
                  image: Assets.png.card.image(),
                  onTap: () {
                    if (selectedPaymentType != PaymentType.online) {
                      setState(() {
                        selectedPaymentType = PaymentType.online;
                      });
                    }
                  },
                ),
              )
          ],
        ),
      ],
    );
  }

  Widget _buildBottomNavigationBar({bool? isProfileVerify}) {
    final masterData = ref.watch(masterControllerProvider.notifier).materModel;
    final orderPlaceAccountVerify = masterData.data.orderPlaceAccountVerify;
    final registerOtpType = masterData.data.registerOtpType;
    debugPrint('registerOtpType: $registerOtpType');
    debugPrint('orderPlaceAccountVerify: $orderPlaceAccountVerify');
    return Container(
      height: orderPlaceAccountVerify == true && isProfileVerify == false
          ? 110.h
          : 76.h,
      color: Theme.of(context).scaffoldBackgroundColor,
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 4.h),
      child: Column(
        children: [
          orderPlaceAccountVerify == true && isProfileVerify == false
              ? Container(
            padding: EdgeInsets.symmetric(
              horizontal: 10.w,
              vertical: 4.h,
            ),
            decoration: ShapeDecoration(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10.r),
                side: BorderSide(
                  width: 1.5,
                  color: colors(context).accentColor!,
                ),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Shimmer(
                  gradient: LinearGradient(
                    colors: [
                      Colors.deepPurple,
                      Colors.yellow,
                      Colors.red,
                    ],
                    stops: [0.2, 0.5, 0.8],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                  child: Text(
                    S.of(context).pleaseVerifyYourAccount,
                    style: AppTextStyle(context).title.copyWith(
                        fontSize: 14.sp, fontWeight: FontWeight.bold),
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    ref
                        .read(hiveServiceProvider)
                        .getUserInfo()
                        .then((userInfo) {
                      if (userInfo != null) {
                        if (registerOtpType == 'email') {
                          if (userInfo.email == null) {
                            GlobalFunction.showCustomSnackbar(
                                message:
                                "Please update your profile with email to verify your account",
                                isSuccess: false);
                          } else {
                            context.nav.pushNamed(
                              Routes.confirmOTP,
                              arguments: ConfirmOTPScreenArguments(
                                  phoneNumber: userInfo.email!,
                                  isPasswordRecover: false,
                                  isFromCheckoutScreen: true),
                            );
                          }
                        } else if (registerOtpType == 'phone') {
                          if (userInfo.email == null) {
                            GlobalFunction.showCustomSnackbar(
                                message:
                                "Please update your profile with phone number to verify your account",
                                isSuccess: false);
                          } else {
                            context.nav.pushNamed(
                              Routes.confirmOTP,
                              arguments: ConfirmOTPScreenArguments(
                                  phoneNumber: userInfo.phone!,
                                  isPasswordRecover: false,
                                  isFromCheckoutScreen: true),
                            );
                          }
                        }
                      }
                    });
                  },
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 6.w,
                      vertical: 2.h,
                    ),
                    decoration: ShapeDecoration(
                      color:
                      colors(context).primaryColor!.withOpacity(0.1),
                      shape: RoundedRectangleBorder(
                        side: BorderSide(
                          width: 1,
                          color: colors(context).primaryColor!,
                        ),
                        borderRadius: BorderRadius.circular(4.r),
                      ),
                    ),
                    child: Text(
                      S.of(context).verifyNow,
                      style: AppTextStyle(context).bodyTextSmall.copyWith(
                        color: colors(context).primaryColor,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          )
              : SizedBox.shrink(),
          Gap(8.h),
          ref.watch(orderControllerProvider)
              ? const Center(child: CircularProgressIndicator())
              : AbsorbPointer(
            absorbing: selectedPaymentType == PaymentType.none,
            child: CustomButton(
              buttonColor: selectedPaymentType == PaymentType.none
                  ? ColorTween(
                begin: colors(context).primaryColor,
                end: colors(context).light,
              ).lerp(0.5)
                  : colors(context).primaryColor,
              buttonText: S.of(context).placeOrder,
              onPressed: () {
                if (isProfileVerify == false &&
                    orderPlaceAccountVerify == true) {
                  GlobalFunction.showCustomSnackbar(
                    message: 'Please verify your account first!',
                    isSuccess: false,
                  );
                } else if (ref.watch(selectedDeliveryAddress) == null) {
                  GlobalFunction.showCustomSnackbar(
                    message: 'Please add your delivery address!',
                    isSuccess: false,
                  );
                } else if (selectedPaymentType == PaymentType.online &&
                    ref.read(selectedPayment) == '') {
                  GlobalFunction.showCustomSnackbar(
                    message: 'Please select your payment method!',
                    isSuccess: false,
                  );
                } else {
                  if (selectedPaymentType == PaymentType.cash) {
                    showDialog(
                        context: context,
                        barrierColor:
                        colors(context).accentColor!.withOpacity(0.8),
                        builder: (context) => ConfirmationDialog(
                          title: S.of(context).pyment,
                          des: S.of(context).cashPaymentDes,
                          confirmButtonText: S.of(context).yes,
                          cancelButtonText: S.of(context).no,
                          confirmationButtonColor:
                          colors(context).primaryColor,
                          onPressed: () {
                            context.nav.pop();
                            _placeOrder();
                          },
                        ));
                  } else {
                    _placeOrder();
                  }
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethodsWidget() {
    return SizedBox(
      child: ListView.builder(
        physics: const NeverScrollableScrollPhysics(),
        padding: EdgeInsets.only(top: 16.h),
        shrinkWrap: true,
        itemCount: ref
            .read(masterControllerProvider.notifier)
            .materModel
            .data
            .paymentGateways
            .length,
        itemBuilder: (context, index) {
          final paymentMethod = ref
              .read(masterControllerProvider.notifier)
              .materModel
              .data
              .paymentGateways[index];
          return Padding(
            padding: EdgeInsets.only(bottom: 10.h),
            child: PaymentCard(
              onTap: () {
                ref.read(selectedPayment.notifier).state = paymentMethod.name;
              },
              isActive: ref.watch(selectedPayment) == paymentMethod.name,
              paymentGateways: paymentMethod,
            ),
          );
        },
      ),
    );
  }

  void _placeOrder() {
    final selectedAddress = ref.watch(selectedDeliveryAddress)!;
    final OrderPlaceModel order = OrderPlaceModel(
      addressId: selectedAddress.addressId,
      couponId: widget.couponCode,
      note: additionalTextEditingController.text,
      paymentMethod: selectedPaymentType == PaymentType.online
          ? ref.read(selectedPayment)
          : selectedPaymentType.name,
      shopIds: ref.read(shopIdsProvider).toList(),
      isBuyNow: widget.isBuyNow == true ? 1 : null,
      latitude: selectedAddress.latitude,
      longitude: selectedAddress.longitude,
    );
    ref
        .read(orderControllerProvider.notifier)
        .placeOrder(orderPlaceModel: order)
        .then((response) {
      if (response.isSuccess) {
        ref.invalidate(isProfileVefifySuccess);
        ref.read(cartController.notifier).getAllCarts();
        ref.refresh(selectedTabIndexProvider.notifier).state;
        if (response.data != null) {
          if (mounted) {
            context.nav.pushNamedAndRemoveUntil(
              Routes.webPaymentScreen,
                  (route) => false,
              arguments: WebPaymentScreenArg(
                paymentUrl: response.data,
                orderId: null,
              ),
            );
          }
        } else {
          if (mounted) {
            showDialog(
              barrierDismissible: false,
              context: context,
              builder: (context) => OrderPlacedDialog(),
            );
          }
        }
      }
    });
  }
}

class OrderNowArguments {
  final int productId;
  final int quantity;
  final String? color;
  final String? size;
  OrderNowArguments({
    required this.productId,
    required this.quantity,
    this.color,
    this.size,
  });
}

enum PaymentType { cash, online, none }
