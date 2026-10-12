// ignore_for_file: public_member_api_docs, sort_constructors_first
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:gap/gap.dart';
import 'package:ready_ecommerce/gen/assets.gen.dart';

class AppLogo extends StatefulWidget {
  final bool isAnimation;
  final bool? withAppName;
  final bool centerAlign;
  const AppLogo({
    super.key,
    this.withAppName = true,
    this.isAnimation = true,
    this.centerAlign = true,
  });

  @override
  State<AppLogo> createState() => _AppLogoState();
}

class _AppLogoState extends State<AppLogo> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    if (widget.isAnimation) {
      // Initialize the controller and set the duration
      _controller = AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 1000),
      );

      // Create a curved animation to control the easing
      _animation = CurvedAnimation(
        parent: _controller,
        curve: Curves.easeInOut,
      );

      // Set up a listener to rebuild the widget when animation value changes
      _animation.addListener(() {
        setState(() {});
      });

      // Repeat the animation indefinitely
      _controller.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    if (widget.isAnimation) {
      _controller.dispose();
    }

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: widget.centerAlign
          ? MainAxisAlignment.center
          : MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Assets.png.favicon.image(
          width: 180.w,
          height: 70.h,
          fit: BoxFit.contain,
        ),
        // if (widget.withAppName ?? false)
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Gap(14.w),
            // Text(
            //   'Ready Ecommerce',
            //   style: TextStyle(
            //     fontSize: 24.sp,
            //     fontWeight: FontWeight.w600,
            //   ),
            // ),
          ],
        )
      ],
    );
  }
}
