enum AppLifecycleEventType {
  resumed,
  paused,
  inactive,
  detached,
}

class AppLifecycleEvent {
  final AppLifecycleEventType type;
  final DateTime timestamp;
  
  AppLifecycleEvent(this.type) : timestamp = DateTime.now();
} 