import 'package:flutter/material.dart';

class AppLogo extends StatelessWidget {
  final double size;
  final bool showText;
  
  const AppLogo({
    Key? key, 
    this.size = 80,
    this.showText = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Image.asset(
          'assets/images/logo.png',
          width: size,
          height: size,
        ),
        if (showText) ...[
          const SizedBox(height: 10),
          Text(
            'Arazialcom',
            style: TextStyle(
              fontSize: size * 0.35,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.primary,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ],
    );
  }
}

class AppLogoHorizontal extends StatelessWidget {
  final double size;
  final bool showText;
  
  const AppLogoHorizontal({
    Key? key, 
    this.size = 40,
    this.showText = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Image.asset(
          'assets/images/logo.png',
          width: size,
          height: size,
        ),
        if (showText) ...[
          const SizedBox(width: 8),
          Text(
            'Arazialcom',
            style: TextStyle(
              fontSize: size * 0.45,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.primary,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ],
    );
  }
} 