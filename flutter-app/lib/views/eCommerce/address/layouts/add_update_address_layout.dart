// ignore_for_file: public_member_api_docs, sort_constructors_first
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:gap/gap.dart';
import 'package:ready_ecommerce/components/ecommerce/custom_button.dart';
import 'package:ready_ecommerce/components/ecommerce/custom_text_field.dart';
import 'package:ready_ecommerce/config/app_color.dart';
import 'package:ready_ecommerce/config/app_constants.dart';
import 'package:ready_ecommerce/config/app_text_style.dart';
import 'package:ready_ecommerce/config/theme.dart';
import 'package:ready_ecommerce/controllers/common/master_controller.dart';
import 'package:ready_ecommerce/controllers/eCommerce/address/address_controller.dart';
import 'package:ready_ecommerce/controllers/eCommerce/address/areas_controller.dart';
import 'package:ready_ecommerce/generated/l10n.dart';
import 'package:ready_ecommerce/models/eCommerce/address/add_address.dart';
import 'package:ready_ecommerce/routes.dart';
import 'package:ready_ecommerce/services/common/hive_service_provider.dart';
import 'package:ready_ecommerce/utils/context_less_navigation.dart';
import 'package:ready_ecommerce/utils/global_function.dart';

class AddUpdateAddressLayout extends ConsumerStatefulWidget {
  final AddAddress? address;
  const AddUpdateAddressLayout({
    super.key,
    required this.address,
  });

  @override
  ConsumerState<AddUpdateAddressLayout> createState() =>
      _AddUpdateAddressLayoutState();
}

class _AddUpdateAddressLayoutState
    extends ConsumerState<AddUpdateAddressLayout> {
  final GlobalKey<FormBuilderState> _formkey = GlobalKey<FormBuilderState>();

  final TextEditingController nameControler = TextEditingController();

  final TextEditingController phoneNumController = TextEditingController();

 // final TextEditingController areaController = TextEditingController();

//  final TextEditingController flatNumController = TextEditingController();

  //final TextEditingController postalCodeController = TextEditingController();

  final TextEditingController addressLine1Controller = TextEditingController();

 // final TextEditingController addressLine2Controller = TextEditingController();

  int activeIndex = 0;

  List<String> addressTags = ['Home', 'Office', 'other'];
  String addressTag = '';

  final List<FocusNode> fNodes = [
    FocusNode(),
    FocusNode(),
    FocusNode(),
    FocusNode(),
    FocusNode(),
    FocusNode(),
    FocusNode()
  ];
  bool isDefaultAddress = false;




  // @override
  // void initState() {
  //   super.initState();
  //
  //   log("----->> ${widget.address?.areaId}");
  //
  //
  //   if (widget.address != null) {
  //     nameControler.text = widget.address!.name;
  //     phoneNumController.text = widget.address!.phone;
  //   //  areaController.text = widget.address!.area ?? '';
  //    // flatNumController.text = widget.address!.flatNo ?? '';
  //    // postalCodeController.text = widget.address!.postCode ?? '';
  //     addressLine1Controller.text = widget.address!.addressLine;
  //    // addressLine2Controller.text = widget.address!.addressLine2 ?? '';
  //     addressTag = widget.address!.addressType;
  //     isDefaultAddress = widget.address!.isDefault;
  //     activeIndex = addressTags.indexOf(widget.address!.addressType);
  //     selectedArea = null;
  //   } else {
  //     addressTag = addressTags.first;
  //   }
  // }





  @override
  void initState() {
    super.initState();

    log("--areaId--->> ${widget.address?.areaId}");

    if (widget.address != null) {
      nameControler.text = widget.address!.name;
      phoneNumController.text = widget.address!.phone;
      addressLine1Controller.text = widget.address!.addressLine;
      addressTag = widget.address!.addressType;
      isDefaultAddress = widget.address!.isDefault;
      activeIndex = addressTags.indexOf(widget.address!.addressType);

      selectedArea = null;

      // Schedule the area selection for after the first frame
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _loadSelectedArea();
      });
    } else {
      addressTag = addressTags.first;
    }
  }

  void _loadSelectedArea() async {
    if (widget.address?.areaId == null) return;

    final areasAsync = ref.read(areasProvider);

    areasAsync.when(
      data: (areasList) {
        log("--areasList loaded, count: ${areasList.length}");

        try {
          final match = areasList.firstWhere(
                (area) {
              log("--comparing area.id: ${area.id} with ${widget.address!.areaId}");
              return area.id == widget.address!.areaId;
            },
            orElse: () {
              log("--No match found, using first area");
              return areasList.first;
            },
          );

          log("--match found--->> id: ${match.id}, name: ${match.name}");

          if (mounted) {
            setState(() {
              selectedArea = match.name;
            });
          }
        } catch (e) {
          log("--Error finding area: $e");
        }
      },
      loading: () {
        log("--areas still loading, will retry");
        // Retry after a short delay if still loading
        Future.delayed(Duration(milliseconds: 500), () {
          if (mounted && selectedArea == null) {
            _loadSelectedArea();
          }
        });
      },
      error: (err, stack) {
        log("--Error loading areas: $err");
      },
    );
  }


  @override
  void dispose() {
    nameControler.dispose();
    phoneNumController.dispose();
    //areaController.dispose();
    //flatNumController.dispose();
   // postalCodeController.dispose();
    addressLine1Controller.dispose();
   // addressLine2Controller.dispose();
    super.dispose();
  }
  String? selectedArea;

  @override
  Widget build(BuildContext context) {
    final materModelData =
        ref.watch(masterControllerProvider.notifier).materModel.data;
    final isPhoneRequired = materModelData.phoneRequired;
    int? phoneMinLength = materModelData.phoneMinLength;
    int? phoneMaxLength = materModelData.phoneMaxLength;

    final areaState = ref.watch(areasProvider);

    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(S.of(context).addNewAddress),
          surfaceTintColor: Theme.of(context).scaffoldBackgroundColor,
        ),
        body: FormBuilder(
          key: _formkey,
          child: Padding(
            padding: EdgeInsets.symmetric(
              horizontal: 14.w,
            ),
            child: SingleChildScrollView(
              child: AnimationLimiter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: AnimationConfiguration.toStaggeredList(
                    duration: const Duration(milliseconds: 375),
                    childAnimationBuilder: (widget) => SlideAnimation(
                        horizontalOffset: 50.0,
                        child: FadeInAnimation(
                          child: widget,
                        )),
                    children: [
                      SizedBox(height: 10.h),
                      CustomTextFormField(
                        name: S.of(context).name,
                        hintText: S.of(context).name,
                        textInputType: TextInputType.text,
                        controller: nameControler,
                        focusNode: fNodes[0],
                        textInputAction: TextInputAction.next,
                        validator: (value) => GlobalFunction.commonValidator(
                          context: context,
                          value: value!,
                          hintText: S.of(context).name,
                        ),
                      ),
                      Gap(14.h),
                      CustomTextFormField(
                        name: S.of(context).phone,
                        hintText: S.of(context).phone,
                        textInputType: TextInputType.number,
                        controller: phoneNumController,
                        focusNode: fNodes[1],
                        textInputAction: TextInputAction.next,
                        validator: (value) => GlobalFunction.phoneValidator(
                          isPhoneRequired: isPhoneRequired,
                          context: context,
                          value: value!,
                          hintText: S.of(context).phone,
                          minLength: phoneMinLength,
                          maxLength: phoneMaxLength,
                        ),
                      ),
                      Gap(14.h),
                      Gap(14.h),
                      CustomTextFormField(
                        name: S.of(context).addressOne,
                        hintText: S.of(context).addressOne,
                        textInputType: TextInputType.text,
                        controller: addressLine1Controller,
                        focusNode: fNodes[5],
                        textInputAction: TextInputAction.next,
                        validator: (value) => GlobalFunction.commonValidator(
                          context: context,
                          value: value!,
                          hintText: S.of(context).addressOne,
                        ),
                      ),

                      Gap(14.h),
                      CustomButton(
                          buttonText: widget.address != null ? "Update Delivery Location" : "Pin Delivery Location",
                          onPressed: (){

                            debugPrint('Address: ${widget.address}');
                            debugPrint('Latitude: ${widget.address?.latitude}');
                            debugPrint('Longitude: ${widget.address?.longitude}');

                            context.nav.pushNamed(
                              Routes.getTrackOrderRouteName(
                                AppConstants.appServiceName,
                              ),
                              arguments: [
                                widget.address != null,
                                widget.address?.latitude,
                                widget.address?.longitude,
                              ],
                            );
                          }
                      ),
                      Gap(14.h),

                      PopupMenuButton<String>(
                        offset: Offset(0, 52),
                        onSelected: (value) {
                          setState(() {
                            selectedArea = value;
                          });
                        },
                        itemBuilder: (context) {
                          return areaState.when(
                            data: (areasList) {
                              return areasList.map((area) {
                                return PopupMenuItem<String>(
                                  value: area.name,
                                  child: Text(
                                    area.name ?? '',
                                    style: TextStyle(color: colors(context).primaryColor),
                                  ),
                                );
                              }).toList();
                            },
                            loading: () => [
                              PopupMenuItem<String>(
                                value: '',
                                child: Text(
                                  'Loading...',
                                  style: TextStyle(color: colors(context).primaryColor),
                                ),
                              )
                            ],
                            error: (err, stack) => [
                              PopupMenuItem<String>(
                                value: '',
                                child: Text(
                                  'Error',
                                  style: TextStyle(color: Colors.red),
                                ),
                              )
                            ],
                          );
                        },
                        child: Container(
                          padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.h),
                          decoration: BoxDecoration(
                            border: Border.all(color: colors(context).primaryColor!),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                selectedArea ?? 'Select Area',
                                style: TextStyle(
                                  color: colors(context).primaryColor,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Icon(
                                Icons.arrow_drop_down,
                                color: colors(context).primaryColor,
                              ),
                            ],
                          ),
                        ),
                      ),



                      Gap(14.h),
                      buildAddressTag(),
                      Gap(14.h),
                      Row(
                        children: [
                          Checkbox(
                            materialTapTargetSize:
                                MaterialTapTargetSize.shrinkWrap,
                            activeColor: colors(context).primaryColor,
                            value: isDefaultAddress,
                            onChanged: (defult) {
                              setState(() {
                                isDefaultAddress = defult!;
                              });
                            },
                          ),
                          Text(S.of(context).makeItDefault,
                              style: AppTextStyle(context).bodyTextSmall),
                          const Spacer(),
                          widget.address?.addressId != null
                              ? TextButton(
                                  onPressed: () {
                                    ref
                                        .read(
                                            addressControllerProvider.notifier)
                                        .deleteAddress(
                                          addressId:
                                              widget.address?.addressId ?? 0,
                                        )
                                        .then((response) {
                                      if (response.isSuccess) {
                                        GlobalFunction.showCustomSnackbar(
                                            message: response.message,
                                            isSuccess: response.isSuccess);
                                        ref
                                            .read(addressControllerProvider
                                                .notifier)
                                            .getAddress();
                                        context.nav.pop();
                                      }
                                    });
                                  },
                                  child: Text(
                                    S.of(context).deleteThis,
                                    style: AppTextStyle(context)
                                        .bodyText
                                        .copyWith(color: EcommerceAppColor.red),
                                  ),
                                )
                              : const SizedBox()
                        ],
                      )
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
        bottomNavigationBar: SizedBox(
          height: 85.h,
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 20),
            child: ref.watch(addressControllerProvider)
                ? const Center(
                    child: CircularProgressIndicator(),
                  )
                : CustomButton(
                    buttonText: S.of(context).save,
                    onPressed: () {
                      if (_formkey.currentState!.validate()) {
                        final latitude = ref.read(hiveServiceProvider).getLatitude();
                        final longitude = ref.read(hiveServiceProvider).getLongitude();

                        if (latitude == null || longitude == null ) {
                          GlobalFunction.showCustomSnackbar(
                            message: "Please pin your delivery location on the map",
                            isSuccess: false,
                          );
                          return;
                        }
                        if (selectedArea == null) {
                          GlobalFunction.showCustomSnackbar(
                            message: "Please select your Area",
                            isSuccess: false,
                          );
                          return;
                        }
                        int? selectedAreaId;
                        areaState.when(
                          data: (areasList) {
                            final match = areasList.firstWhere(
                                  (area) => area.name == selectedArea,

                            );
                            selectedAreaId = match.id;
                          },
                          loading: () {
                            selectedAreaId = null;
                          },
                          error: (err, stack) {
                            selectedAreaId = null;
                          },
                        );

                        final AddAddress address = AddAddress(
                          addressId: widget.address?.addressId,
                          name: nameControler.text,
                          phone: phoneNumController.text,
                         // area: areaController.text,
                         // flatNo: flatNumController.text,
                          //postCode: postalCodeController.text,
                          addressLine: addressLine1Controller.text,
                         // addressLine2: addressLine2Controller.text,
                          latitude: latitude,
                          longitude: longitude,
                          areaId: selectedAreaId,
                          addressType: addressTag,
                          isDefault: isDefaultAddress,
                        );
                        if (widget.address != null) {
                          ref
                              .read(addressControllerProvider.notifier)
                              .updateAddress(addAddress: address)
                              .then((response) {
                            if (response.isSuccess) {
                              GlobalFunction.showCustomSnackbar(
                                  message: response.message,
                                  isSuccess: response.isSuccess);
                              ref
                                  .read(addressControllerProvider.notifier)
                                  .getAddress();
                              context.nav.pop();
                            }
                          });
                        } else {
                          ref
                              .read(addressControllerProvider.notifier)
                              .addAddress(addAddress: address)
                              .then((response) {
                            if (response.isSuccess) {
                              GlobalFunction.showCustomSnackbar(
                                  message: response.message,
                                  isSuccess: response.isSuccess);
                              ref
                                  .read(addressControllerProvider.notifier)
                                  .getAddress();
                              context.nav.pop();
                            }
                          });
                        }
                      }
                    },
                  ),
          ),
        ),
      ),
    );
  }

  Widget buildAddressTag() {
    final textStyle = AppTextStyle(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          S.of(context).addressTag,
          style: AppTextStyle(context)
              .bodyTextSmall
              .copyWith(fontWeight: FontWeight.w500),
        ),
        Gap(14.h),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: addressTags.asMap().entries.map(
            (entry) {
              int index = entry.key;
              String tag = entry.value;
              return InkWell(
                borderRadius: BorderRadius.circular(8.sp),
                onTap: () {
                  setState(() {
                    activeIndex = index;
                    addressTag = tag;
                  });
                },
                child: Container(
                  height: 50.h,
                  width: 110.w,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8.sp),
                    border: Border.all(
                      color: activeIndex == index
                          ? colors(context).primaryColor ??
                              EcommerceAppColor.primary
                          : colors(context).bodyTextColor!.withOpacity(0.5),
                    ),
                  ),
                  child: Center(
                    child: Text(
                      getTagTranslation(tag: tag),
                      style: textStyle.bodyTextSmall.copyWith(
                          color: activeIndex == index
                              ? colors(context).primaryColor ??
                                  EcommerceAppColor.primary
                              : colors(context).bodyTextColor,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              );
            },
          ).toList(),
        ),
      ],
    );
  }

  String getTagTranslation({required String tag}) {
    switch (tag.toUpperCase()) {
      case 'HOME':
        return S.of(ContextLess.context).home;
      case 'OFFICE':
        return S.of(ContextLess.context).office;
      default:
        return S.of(ContextLess.context).other;
    }
  }
}
