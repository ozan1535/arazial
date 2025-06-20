import 'package:flutter/material.dart';

class Badge extends StatelessWidget {
  final Widget child;
  final bool isLabelVisible;

  const Badge({
    Key? key,
    required this.child,
    this.isLabelVisible = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.topRight,
      children: [
        child,
        if (isLabelVisible)
          Positioned(
            right: 0,
            top: 0,
            child: Container(
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                shape: BoxShape.circle,
              ),
              constraints: const BoxConstraints(
                minWidth: 8,
                minHeight: 8,
              ),
            ),
          ),
      ],
    );
  }
} 