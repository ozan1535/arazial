import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart' as provider;
import 'dart:async';
import 'package:land_auction_app/services/auth_service.dart';
import 'package:land_auction_app/theme/app_theme.dart';
import 'package:land_auction_app/screens/home_screen.dart';

class PhoneSignupScreen extends StatefulWidget {
  const PhoneSignupScreen({super.key});

  @override
  State<PhoneSignupScreen> createState() => _PhoneSignupScreenState();
}

class _PhoneSignupScreenState extends State<PhoneSignupScreen> {
  final _formKey = GlobalKey<FormState>();
  
  // Controllers
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  
  // OTP input controllers and focus nodes
  final List<TextEditingController> _otpControllers = List.generate(
    6, (_) => TextEditingController()
  );
  final List<FocusNode> _otpFocusNodes = List.generate(
    6, (_) => FocusNode()
  );

  // State variables
  String _currentStep = 'phone'; // 'phone', 'otp', 'password'
  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;
  String? _formattedPhoneNumber;
  int _resendCountdown = 0;
  Timer? _timer;
  
  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    
    for (final controller in _otpControllers) {
      controller.dispose();
    }
    
    for (final focusNode in _otpFocusNodes) {
      focusNode.dispose();
    }
    
    _timer?.cancel();
    
    super.dispose();
  }
  
  // Send OTP to the provided phone number
  Future<void> _sendOTP() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    
    try {
      final phoneNumber = _phoneController.text.trim();
      final authService = provider.Provider.of<AuthService>(context, listen: false);
      
      final response = await authService.sendOTP(phoneNumber);
      
      if (mounted) {
        setState(() {
          _formattedPhoneNumber = phoneNumber;
          _currentStep = 'otp';
          _successMessage = 'Doğrulama kodu gönderildi';
          
          // Start countdown for resend
          _resendCountdown = 120; // 2 minutes
          _startResendTimer();
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _errorMessage = error.toString();
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }
  
  // Verify OTP and move to password screen or sign up if already at password screen
  Future<void> _verifyOTP() async {
    if (_currentStep == 'otp') {
      // Validate OTP input
      final otp = _otpControllers.map((controller) => controller.text).join('');
      
      if (otp.length != 6) {
        setState(() {
          _errorMessage = 'Lütfen 6 haneli doğrulama kodunu girin';
        });
        return;
      }
      
      // Move to password step without calling API yet
      setState(() {
        _currentStep = 'password';
        _errorMessage = null;
      });
      
    } else if (_currentStep == 'password') {
      // Validate password fields
      if (!_formKey.currentState!.validate()) return;
      
      if (_passwordController.text != _confirmPasswordController.text) {
        setState(() {
          _errorMessage = 'Şifreler eşleşmiyor';
        });
        return;
      }
      
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
      
      try {
        final otp = _otpControllers.map((controller) => controller.text).join('');
        final phoneNumber = _formattedPhoneNumber!;
        final password = _passwordController.text;
        
        final authService = provider.Provider.of<AuthService>(context, listen: false);
        
        final response = await authService.verifyOTP(
          phoneNumber: phoneNumber,
          otp: otp,
          password: password,
        );
        
        if (mounted && response.session != null) {
          // Navigate to home screen on success
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => const HomeScreen()),
            (route) => false,
          );
        }
      } catch (error) {
        if (mounted) {
          setState(() {
            _errorMessage = error.toString();
          });
        }
      } finally {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    }
  }
  
  // Start the countdown timer for OTP resend
  void _startResendTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          if (_resendCountdown > 0) {
            _resendCountdown--;
          } else {
            timer.cancel();
          }
        });
      }
    });
  }
  
  // Format the countdown time
  String _formatCountdown() {
    final minutes = _resendCountdown ~/ 60;
    final seconds = _resendCountdown % 60;
    return '$minutes:${seconds.toString().padLeft(2, '0')}';
  }
  
  // Handle OTP input changes
  void _handleOtpChange(int index, String value) {
    if (value.length == 1) {
      // Auto-focus next field
      if (index < 5) {
        _otpFocusNodes[index + 1].requestFocus();
      }
    } else if (value.isEmpty) {
      // Move focus to previous field when backspace is pressed
      if (index > 0) {
        _otpFocusNodes[index - 1].requestFocus();
      }
    }
  }
  
  // Build the phone number input step
  Widget _buildPhoneStep() {
    return Column(
      children: [
        TextFormField(
          controller: _phoneController,
          decoration: const InputDecoration(
            labelText: 'Telefon Numarası',
            hintText: '5XX XXX XX XX',
            prefixIcon: Icon(Icons.phone_android),
            prefixText: '+90 ',
          ),
          keyboardType: TextInputType.phone,
          textInputAction: TextInputAction.done,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Telefon numaranızı giriniz';
            }
            if (!value.startsWith('5') || value.length != 10) {
              return 'Geçerli bir telefon numarası giriniz (5XX XXX XX XX)';
            }
            return null;
          },
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(10),
          ],
        ),
        
        const SizedBox(height: 16),
        
        Text(
          'Telefon numaranıza bir doğrulama kodu göndereceğiz.',
          style: TextStyle(
            fontSize: 14,
            color: AppTheme.textSecondaryColor,
          ),
          textAlign: TextAlign.center,
        ),
        
        const SizedBox(height: 24),
        
        ElevatedButton(
          onPressed: _isLoading ? null : _sendOTP,
          style: ElevatedButton.styleFrom(
            minimumSize: const Size(double.infinity, 48),
            backgroundColor: AppTheme.primaryColor,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.symmetric(vertical: 12),
          ),
          child: _isLoading
              ? const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
              : const Text(
                  'Doğrulama Kodu Gönder',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
        ),
      ],
    );
  }
  
  // Build the OTP verification step
  Widget _buildOtpStep() {
    return Column(
      children: [
        Text(
          'Doğrulama Kodu',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: AppTheme.textColor,
          ),
        ),
        
        const SizedBox(height: 16),
        
        Text(
          '+90 ${_formattedPhoneNumber?.replaceFirst('90', '')} numarasına gönderilen 6 haneli doğrulama kodunu girin.',
          style: TextStyle(
            fontSize: 14,
            color: AppTheme.textSecondaryColor,
          ),
          textAlign: TextAlign.center,
        ),
        
        const SizedBox(height: 24),
        
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(6, (index) {
            return Container(
              width: 40,
              height: 48,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              child: TextField(
                controller: _otpControllers[index],
                focusNode: _otpFocusNodes[index],
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(
                      color: Colors.grey[300]!,
                    ),
                  ),
                  contentPadding: EdgeInsets.zero,
                ),
                textAlign: TextAlign.center,
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(1),
                ],
                onChanged: (value) => _handleOtpChange(index, value),
              ),
            );
          }),
        ),
        
        const SizedBox(height: 16),
        
        if (_resendCountdown > 0)
          Text(
            'Kodu yeniden gönderme: ${_formatCountdown()}',
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.textSecondaryColor,
            ),
          )
        else
          TextButton(
            onPressed: _isLoading ? null : _sendOTP,
            child: Text(
              'Kodu Yeniden Gönder',
              style: TextStyle(
                color: AppTheme.primaryColor,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        
        const SizedBox(height: 24),
        
        ElevatedButton(
          onPressed: _isLoading ? null : _verifyOTP,
          style: ElevatedButton.styleFrom(
            minimumSize: const Size(double.infinity, 48),
            backgroundColor: AppTheme.primaryColor,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.symmetric(vertical: 12),
          ),
          child: _isLoading
              ? const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
              : const Text(
                  'Doğrula ve Devam Et',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
        ),
      ],
    );
  }
  
  // Build the password creation step
  Widget _buildPasswordStep() {
    return Column(
      children: [
        Text(
          'Şifre Oluştur',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: AppTheme.textColor,
          ),
        ),
        
        const SizedBox(height: 16),
        
        Text(
          'Hesabınız için güçlü bir şifre belirleyin.',
          style: TextStyle(
            fontSize: 14,
            color: AppTheme.textSecondaryColor,
          ),
          textAlign: TextAlign.center,
        ),
        
        const SizedBox(height: 24),
        
        TextFormField(
          controller: _passwordController,
          decoration: const InputDecoration(
            labelText: 'Şifre',
            prefixIcon: Icon(Icons.lock_outline),
          ),
          obscureText: true,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Şifre giriniz';
            }
            if (value.length < 6) {
              return 'Şifre en az 6 karakter olmalıdır';
            }
            return null;
          },
        ),
        
        const SizedBox(height: 16),
        
        TextFormField(
          controller: _confirmPasswordController,
          decoration: const InputDecoration(
            labelText: 'Şifre (Tekrar)',
            prefixIcon: Icon(Icons.lock_outline),
          ),
          obscureText: true,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Şifreyi tekrar giriniz';
            }
            if (value != _passwordController.text) {
              return 'Şifreler eşleşmiyor';
            }
            return null;
          },
        ),
        
        const SizedBox(height: 24),
        
        ElevatedButton(
          onPressed: _isLoading ? null : _verifyOTP,
          style: ElevatedButton.styleFrom(
            minimumSize: const Size(double.infinity, 48),
            backgroundColor: AppTheme.primaryColor,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.symmetric(vertical: 12),
          ),
          child: _isLoading
              ? const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
              : const Text(
                  'Kayıt Ol',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Telefon ile Kayıt'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(24),
            children: [
              // Error message
              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(16),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppTheme.errorColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: AppTheme.errorColor.withOpacity(0.3),
                    ),
                  ),
                  child: Text(
                    _errorMessage!,
                    style: TextStyle(
                      color: AppTheme.errorColor,
                      fontSize: 14,
                    ),
                  ),
                ),
              
              // Success message
              if (_successMessage != null)
                Container(
                  padding: const EdgeInsets.all(16),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppTheme.successColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: AppTheme.successColor.withOpacity(0.3),
                    ),
                  ),
                  child: Text(
                    _successMessage!,
                    style: TextStyle(
                      color: AppTheme.successColor,
                      fontSize: 14,
                    ),
                  ),
                ),
              
              // Current step UI
              if (_currentStep == 'phone')
                _buildPhoneStep()
              else if (_currentStep == 'otp')
                _buildOtpStep()
              else if (_currentStep == 'password')
                _buildPasswordStep(),
            ],
          ),
        ),
      ),
    );
  }
} 