import 'dart:async';
import 'package:flutter/material.dart';
import 'package:land_auction_app/models/app_lifecycle_event.dart';

class LifecycleService with WidgetsBindingObserver {
  final StreamController<AppLifecycleEvent> _lifecycleController = StreamController<AppLifecycleEvent>.broadcast();
  DateTime? _lastResumedTime;
  bool _isFirstResume = true;
  bool _isProcessingEvent = false; // Flag to prevent reentrant events
  Timer? _debugTimer;
  
  /// Stream of lifecycle events that components can listen to
  Stream<AppLifecycleEvent> get lifecycleEvents => _lifecycleController.stream;
  
  /// When the app was last resumed from background
  DateTime? get lastResumedTime => _lastResumedTime;
  
  /// Whether we should refresh data based on time elapsed
  bool get shouldRefreshData {
    if (_lastResumedTime == null) return true;
    
    final now = DateTime.now();
    final difference = now.difference(_lastResumedTime!);
    // Refresh if it's been more than 5 minutes
    return difference.inMinutes > 5;
  }
  
  LifecycleService() {
    WidgetsBinding.instance.addObserver(this);
    _lastResumedTime = DateTime.now(); // Consider app start as a resume
    
    // Add a debug timer to log the app state every 30 seconds
    _debugTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      debugPrint('App lifecycle service alive. Last resume: $_lastResumedTime');
    });
  }
  
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Guard against reentrant calls
    if (_isProcessingEvent) {
      debugPrint('Already processing a lifecycle event, skipping');
      return;
    }
    
    _isProcessingEvent = true;
    
    try {
      debugPrint('App lifecycle changed to: $state');
      
      switch (state) {
        case AppLifecycleState.resumed:
          if (!_isFirstResume) {  // Skip the first resume which happens on app start
            _lastResumedTime = DateTime.now();
            
            // Use a microtask to avoid blocking the main thread
            Future.microtask(() {
              if (!_lifecycleController.isClosed) {
                _lifecycleController.add(AppLifecycleEvent(AppLifecycleEventType.resumed));
              }
              debugPrint('App resumed event sent at: $_lastResumedTime');
            });
          } else {
            _isFirstResume = false;
            debugPrint('First resume event ignored (app start)');
          }
          break;
        case AppLifecycleState.inactive:
          Future.microtask(() {
            if (!_lifecycleController.isClosed) {
              _lifecycleController.add(AppLifecycleEvent(AppLifecycleEventType.inactive));
            }
          });
          break;
        case AppLifecycleState.paused:
          Future.microtask(() {
            if (!_lifecycleController.isClosed) {
              _lifecycleController.add(AppLifecycleEvent(AppLifecycleEventType.paused));
            }
          });
          break;
        case AppLifecycleState.detached:
          Future.microtask(() {
            if (!_lifecycleController.isClosed) {
              _lifecycleController.add(AppLifecycleEvent(AppLifecycleEventType.detached));
            }
          });
          break;
        default:
          break;
      }
    } finally {
      _isProcessingEvent = false;
    }
  }
  
  // Method to manually trigger a lifecycle event
  void triggerLifecycleEvent(AppLifecycleEventType type) {
    if (!_lifecycleController.isClosed) {
      debugPrint('Manually triggering lifecycle event: $type');
      _lifecycleController.add(AppLifecycleEvent(type));
    }
  }
  
  void dispose() {
    debugPrint('Disposing lifecycle service');
    WidgetsBinding.instance.removeObserver(this);
    _lifecycleController.close();
    _debugTimer?.cancel();
  }
} 