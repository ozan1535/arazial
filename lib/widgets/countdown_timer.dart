import 'dart:async';
import 'package:flutter/material.dart';
import 'package:land_auction_app/models/auction.dart';
import 'package:land_auction_app/providers/auction_provider.dart';
import 'package:provider/provider.dart' as provider;
import 'package:land_auction_app/theme/app_theme.dart';

class CountdownTimer extends StatefulWidget {
  final int seconds;
  final TextStyle? style;
  final VoidCallback? onFinish;
  final bool compact;
  final bool showWarningColor;
  final String? auctionId;
  
  const CountdownTimer({
    super.key,
    required this.seconds,
    this.style,
    this.onFinish,
    this.compact = false,
    this.showWarningColor = true,
    this.auctionId,
  });
  
  @override
  State<CountdownTimer> createState() => _CountdownTimerState();
}

class _CountdownTimerState extends State<CountdownTimer> with SingleTickerProviderStateMixin {
  late Timer _timer;
  late int _remainingSeconds;
  bool _isExpiring = false;
  bool _isUrgent = false;
  
  // Add animation controller for pulsating effect on urgent timers
  late AnimationController _animationController;
  late Animation<double> _opacityAnimation;
  
  @override
  void initState() {
    super.initState();
    _remainingSeconds = widget.seconds;
    
    // Check if time is expiring (less than 5 minutes)
    _isExpiring = _remainingSeconds > 0 && _remainingSeconds < 5 * 60;
    
    // Check if time is urgent (less than 1 minute)
    _isUrgent = _remainingSeconds > 0 && _remainingSeconds < 60;
    
    // Setup animation controller for urgent countdown
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    
    _opacityAnimation = Tween<double>(begin: 1.0, end: 0.4).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut)
    )..addListener(() {
      if (mounted) setState(() {});
    });
    
    if (_isUrgent) {
      _animationController.repeat(reverse: true);
    }
    
    if (_remainingSeconds > 0) {
      _startTimer();
    }
  }
  
  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() {
        if (_remainingSeconds > 0) {
          _remainingSeconds--;
          
          // Update expiring state when we cross the 5-minute threshold
          if (widget.showWarningColor && _remainingSeconds == 5 * 60) {
            _isExpiring = true;
          }
          
          // Update urgent state when we cross the 1-minute threshold
          if (widget.showWarningColor && _remainingSeconds == 60) {
            _isUrgent = true;
            // Start pulsating animation for urgent timer
            _animationController.repeat(reverse: true);
          }
        } else {
          _timer.cancel();
          
          // If an auction ID is provided, try to complete the auction
          if (widget.auctionId != null) {
            _completeAuction(widget.auctionId!);
          }
          
          if (widget.onFinish != null) {
            widget.onFinish!();
          }
        }
      });
    });
  }
  
  void _completeAuction(String auctionId) {
    debugPrint('Auction timer ended for auction $auctionId, completing auction...');
    
    // Get the auction provider and try to complete the auction
    final auctionProvider = provider.Provider.of<AuctionProvider>(context, listen: false);
    auctionProvider.completeAuction(auctionId).then((success) {
      if (success) {
        debugPrint('Auction $auctionId completed successfully');
      } else {
        debugPrint('Failed to complete auction $auctionId');
      }
    }).catchError((err) {
      debugPrint('Error in auction completion for $auctionId: $err');
    });
  }
  
  @override
  void dispose() {
    if (_remainingSeconds > 0) {
      _timer.cancel();
    }
    _animationController.dispose();
    super.dispose();
  }

  String _formatRemainingTime(int seconds) {
    if (seconds <= 0) return 'Süre doldu';
    
    final days = seconds ~/ (24 * 3600);
    final hours = (seconds % (24 * 3600)) ~/ 3600;
    final minutes = (seconds % 3600) ~/ 60;
    final remainingSeconds = seconds % 60;
    
    // Format for days remaining
    if (days > 0) {
      if (widget.compact) {
        return '${days}g ${hours}s';
      } else {
        // For full display with day count, use a more sophisticated format
        return '${days} gün ${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
      }
    }
    
    // Format for hours remaining
    if (hours > 0) {
      return '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
    }
    
    // Format for minutes and seconds only
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }
  
  Color _getTimerColor(BuildContext context) {
    final theme = Theme.of(context);
    
    if (!widget.showWarningColor) {
      return theme.colorScheme.primary;
    }
    
    if (_isUrgent) {
      return theme.colorScheme.error;
    } else if (_isExpiring) {
      return theme.colorScheme.error.withOpacity(0.8);
    } else if (_remainingSeconds < 24 * 3600) { // Less than 1 day
      return AppTheme.warningColor; // Use the warning color from AppTheme
    } else {
      return theme.colorScheme.primary;
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final timerColor = _getTimerColor(context);
    
    // Base style from props or default
    final baseStyle = widget.style ?? TextStyle(
      fontSize: widget.compact ? 14 : 19, 
      fontWeight: FontWeight.bold,
      fontFamily: 'monospace', // For better digit alignment
      letterSpacing: 0.5,
    );
    
    // Apply color based on time status
    final TextStyle textStyle = baseStyle.copyWith(
      color: _isUrgent && widget.showWarningColor 
        ? timerColor.withOpacity(_opacityAnimation.value)
        : timerColor,
    );
    
    // For compact mode, just show the text (used in auction cards)
    if (widget.compact) {
      return Text(
        _formatRemainingTime(_remainingSeconds),
        style: textStyle,
      );
    }
    
    // For full mode, create a luxurious timer widget (used in detail screen)
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 14.0),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
      decoration: BoxDecoration(
        color: timerColor.withOpacity(0.08),
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(
          color: timerColor.withOpacity(_isUrgent ? _opacityAnimation.value * 0.5 : 0.15),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: timerColor.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Timer icon
          Icon(
            _isUrgent ? Icons.timer_sharp : Icons.timer_outlined,
            size: 24,
            color: timerColor.withOpacity(_isUrgent ? _opacityAnimation.value : 0.8),
          ),
          const SizedBox(width: 12),
          
          // Timer units
          if (_remainingSeconds >= 3600 || _timeComponents['days']! > 0) 
            _buildTimerDigits(context),
          
          // For shorter times, use a simpler display
          if (_remainingSeconds < 3600 && _timeComponents['days']! == 0)
            Text(
              _formatRemainingTime(_remainingSeconds),
              style: textStyle.copyWith(fontSize: 22),
            ),
        ],
      ),
    );
  }
  
  // Helper to get time components
  Map<String, int> get _timeComponents {
    final days = _remainingSeconds ~/ (24 * 3600);
    final hours = (_remainingSeconds % (24 * 3600)) ~/ 3600;
    final minutes = (_remainingSeconds % 3600) ~/ 60;
    final seconds = _remainingSeconds % 60;
    
    return {
      'days': days,
      'hours': hours,
      'minutes': minutes,
      'seconds': seconds,
    };
  }
  
  // Create a fancy digit display for timers over 1 hour
  Widget _buildTimerDigits(BuildContext context) {
    final components = _timeComponents;
    final timerColor = _getTimerColor(context);
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Only show days if there are days remaining
        if (components['days']! > 0) ...[
          _buildDigitBox(
            context, 
            components['days'].toString(), 
            'GÜN', 
            timerColor,
          ),
          _buildSeparator(timerColor),
        ],
        
        // Hours
        _buildDigitBox(
          context, 
          components['hours']!.toString().padLeft(2, '0'), 
          'SAAT', 
          timerColor,
        ),
        _buildSeparator(timerColor),
        
        // Minutes
        _buildDigitBox(
          context, 
          components['minutes']!.toString().padLeft(2, '0'), 
          'DK', 
          timerColor,
        ),
        _buildSeparator(timerColor),
        
        // Seconds
        _buildDigitBox(
          context, 
          components['seconds']!.toString().padLeft(2, '0'), 
          'SN', 
          timerColor,
        ),
      ],
    );
  }
  
  // Build a fancy separator between time units
  Widget _buildSeparator(Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6),
      child: Text(
        ':',
        style: TextStyle(
          color: color.withOpacity(_isUrgent ? _opacityAnimation.value : 0.7),
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
  
  // Build a box for each time unit
  Widget _buildDigitBox(BuildContext context, String digits, String label, Color color) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          digits,
          style: TextStyle(
            color: color.withOpacity(_isUrgent ? _opacityAnimation.value : 1.0),
            fontSize: 22,
            fontWeight: FontWeight.w800,
            fontFamily: 'monospace',
          ),
        ),
        if (!widget.compact) ...[
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              color: color.withOpacity(0.5),
              fontSize: 10,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ],
    );
  }
} 