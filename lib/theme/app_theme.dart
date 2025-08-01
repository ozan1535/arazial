import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppTheme {
  // Define the color constants - more sophisticated, business-like palette
  static const Color primaryColor = Color(0xFF0F3460); // Deep navy blue
  static const Color primaryLightColor = Color(0xFF1A4D8C); // Lighter navy
  static const Color primaryDarkColor = Color(0xFF071E3D); // Darker navy

  static const Color accentColor =
      Color(0xFFE94560); // Vivid accent for important actions
  static const Color goldColor = Color(0xFFD4AF37); // Gold for premium feel

  static const Color surfaceColor = Colors.white;
  static const Color backgroundColor = Color(0xFFF9FAFB);
  static const Color surfaceSecondaryColor = Color(0xFFF3F4F6);

  static const Color textColor = Color(0xFF0A0F1C);
  static const Color textSecondaryColor = Color(0xFF4B5563);

  static const Color errorColor = Color(0xFFE63946);
  static const Color successColor = Color(0xFF00A67E);
  static const Color warningColor = Color(0xFFFF9800);

  static final lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme(
      primary: primaryColor,
      primaryContainer: primaryLightColor,
      secondary: accentColor,
      secondaryContainer: accentColor.withOpacity(0.1),
      tertiary: goldColor,
      tertiaryContainer: goldColor.withOpacity(0.1),
      surface: surfaceColor,
      background: backgroundColor,
      error: errorColor,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: textColor,
      onBackground: textColor,
      onError: Colors.white,
      brightness: Brightness.light,
    ),
    appBarTheme: AppBarTheme(
      systemOverlayStyle: SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        systemNavigationBarColor: surfaceColor,
      ),
      centerTitle: true,
      elevation: 2,
      shadowColor: Colors.black.withOpacity(0.05),
      backgroundColor: surfaceColor,
      foregroundColor: textColor,
      titleTextStyle: const TextStyle(
        fontFamily: 'Inter',
        fontWeight: FontWeight.w600,
        fontSize: 18,
        color: textColor,
        letterSpacing: 0.2,
      ),
    ),
    cardTheme: CardThemeData(
      elevation: 3,
      shadowColor: Colors.black.withOpacity(0.08),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        elevation: 2,
        shadowColor: primaryColor.withOpacity(0.3),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        minimumSize: const Size(120, 50),
        textStyle: const TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 15,
          letterSpacing: 0.5,
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: primaryColor,
        side: const BorderSide(color: primaryColor, width: 1.2),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        textStyle: const TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 15,
          letterSpacing: 0.2,
        ),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: primaryColor,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        textStyle: const TextStyle(
          fontWeight: FontWeight.w500,
          fontSize: 15,
          letterSpacing: 0.2,
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: surfaceColor,
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide:
            BorderSide(color: textSecondaryColor.withOpacity(0.2), width: 1.2),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide:
            BorderSide(color: textSecondaryColor.withOpacity(0.15), width: 1.2),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: primaryColor, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: errorColor, width: 1.5),
      ),
      labelStyle: TextStyle(
        color: textSecondaryColor,
        fontWeight: FontWeight.w500,
      ),
      hintStyle: TextStyle(
        color: textSecondaryColor.withOpacity(0.5),
        fontWeight: FontWeight.w400,
      ),
    ),
    fontFamily: 'Inter',
    textTheme: const TextTheme(
      displayLarge: TextStyle(
        fontWeight: FontWeight.w700,
        fontSize: 32,
        color: textColor,
        letterSpacing: -0.5,
        height: 1.2,
      ),
      displayMedium: TextStyle(
        fontWeight: FontWeight.w700,
        fontSize: 26,
        color: textColor,
        letterSpacing: -0.3,
      ),
      titleLarge: TextStyle(
        fontWeight: FontWeight.w700,
        fontSize: 22,
        color: textColor,
        letterSpacing: 0.1,
      ),
      titleMedium: TextStyle(
        fontWeight: FontWeight.w600,
        fontSize: 18,
        color: textColor,
        letterSpacing: 0.1,
      ),
      titleSmall: TextStyle(
        fontWeight: FontWeight.w600,
        fontSize: 16,
        color: textColor,
      ),
      bodyLarge: TextStyle(
        fontWeight: FontWeight.w500,
        fontSize: 16,
        color: textColor,
        height: 1.5,
      ),
      bodyMedium: TextStyle(
        fontWeight: FontWeight.w400,
        fontSize: 15,
        color: textColor,
        height: 1.5,
      ),
      bodySmall: TextStyle(
        fontWeight: FontWeight.w400,
        fontSize: 14,
        color: textSecondaryColor,
        height: 1.4,
      ),
      labelLarge: TextStyle(
        fontWeight: FontWeight.w600,
        fontSize: 14,
        color: primaryColor,
        letterSpacing: 0.3,
      ),
    ),
    dividerTheme: const DividerThemeData(
      thickness: 1,
      color: Color(0xFFEEEEEE),
    ),
    chipTheme: ChipThemeData(
      backgroundColor: primaryColor.withOpacity(0.05),
      labelStyle: const TextStyle(
        fontWeight: FontWeight.w500,
        color: primaryColor,
      ),
      side: BorderSide(
        color: primaryColor.withOpacity(0.1),
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
      contentTextStyle: const TextStyle(
        fontFamily: 'Inter',
        fontWeight: FontWeight.w500,
      ),
    ),
  );

  static final darkTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme(
      primary: primaryColor,
      primaryContainer: primaryLightColor,
      secondary: accentColor,
      secondaryContainer: accentColor.withOpacity(0.15),
      tertiary: goldColor,
      tertiaryContainer: goldColor.withOpacity(0.15),
      surface: const Color(0xFF1A1F2E),
      background: const Color(0xFF0D1117),
      error: errorColor,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: Colors.white,
      onBackground: Colors.white,
      onError: Colors.white,
      brightness: Brightness.dark,
    ),
    appBarTheme: const AppBarTheme(
      systemOverlayStyle: SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        systemNavigationBarColor: Color(0xFF1A1F2E),
      ),
      centerTitle: true,
      elevation: 0,
      backgroundColor: Color(0xFF1A1F2E),
      foregroundColor: Colors.white,
      titleTextStyle: TextStyle(
        fontFamily: 'Inter',
        fontWeight: FontWeight.w600,
        fontSize: 18,
        color: Colors.white,
        letterSpacing: 0.2,
      ),
    ),
    cardTheme: CardThemeData(
      elevation: 5,
      shadowColor: Colors.black.withOpacity(0.3),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
      ),
      color: const Color(0xFF1A1F2E),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        elevation: 2,
        shadowColor: Colors.black.withOpacity(0.3),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        minimumSize: const Size(120, 50),
        textStyle: const TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 15,
          letterSpacing: 0.5,
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: Colors.white,
        side: const BorderSide(color: primaryLightColor, width: 1.2),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        textStyle: const TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 15,
          letterSpacing: 0.2,
        ),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: primaryLightColor,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        textStyle: const TextStyle(
          fontWeight: FontWeight.w500,
          fontSize: 15,
          letterSpacing: 0.2,
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: const Color(0xFF1A1F2E),
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Color(0xFF3F4555), width: 1.2),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Color(0xFF3F4555), width: 1.2),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: primaryLightColor, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: errorColor, width: 1.5),
      ),
      labelStyle: const TextStyle(
        color: Color(0xFFADB5BD),
        fontWeight: FontWeight.w500,
      ),
      hintStyle: const TextStyle(
        color: Color(0xFF6C7280),
        fontWeight: FontWeight.w400,
      ),
    ),
    fontFamily: 'Inter',
    textTheme: const TextTheme(
      displayLarge: TextStyle(
        fontWeight: FontWeight.w700,
        fontSize: 32,
        color: Colors.white,
        letterSpacing: -0.5,
        height: 1.2,
      ),
      displayMedium: TextStyle(
        fontWeight: FontWeight.w700,
        fontSize: 26,
        color: Colors.white,
        letterSpacing: -0.3,
      ),
      titleLarge: TextStyle(
        fontWeight: FontWeight.w700,
        fontSize: 22,
        color: Colors.white,
        letterSpacing: 0.1,
      ),
      titleMedium: TextStyle(
        fontWeight: FontWeight.w600,
        fontSize: 18,
        color: Colors.white,
        letterSpacing: 0.1,
      ),
      titleSmall: TextStyle(
        fontWeight: FontWeight.w600,
        fontSize: 16,
        color: Colors.white,
      ),
      bodyLarge: TextStyle(
        fontWeight: FontWeight.w500,
        fontSize: 16,
        color: Colors.white,
        height: 1.5,
      ),
      bodyMedium: TextStyle(
        fontWeight: FontWeight.w400,
        fontSize: 15,
        color: Colors.white,
        height: 1.5,
      ),
      bodySmall: TextStyle(
        fontWeight: FontWeight.w400,
        fontSize: 14,
        color: Color(0xFFADB5BD),
        height: 1.4,
      ),
      labelLarge: TextStyle(
        fontWeight: FontWeight.w600,
        fontSize: 14,
        color: primaryLightColor,
        letterSpacing: 0.3,
      ),
    ),
    dividerTheme: const DividerThemeData(
      thickness: 1,
      color: Color(0xFF2A303C),
    ),
    chipTheme: ChipThemeData(
      backgroundColor: primaryColor.withOpacity(0.15),
      labelStyle: const TextStyle(
        fontWeight: FontWeight.w500,
        color: Colors.white,
      ),
      side: BorderSide(
        color: primaryColor.withOpacity(0.2),
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: const Color(0xFF25293A),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
      contentTextStyle: const TextStyle(
        fontFamily: 'Inter',
        fontWeight: FontWeight.w500,
        color: Colors.white,
      ),
    ),
  );
}
