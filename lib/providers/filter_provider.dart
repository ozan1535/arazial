import 'package:flutter/foundation.dart';
import 'package:land_auction_app/models/auction.dart';

class FilterProvider with ChangeNotifier {
  String? _selectedCity;
  
  String? get selectedCity => _selectedCity;
  
  void setSelectedCity(String? city) {
    _selectedCity = city;
    notifyListeners();
  }
  
  void clearCity() {
    _selectedCity = null;
    notifyListeners();
  }
  
  List<Auction> filterAuctions(List<Auction> auctions) {
    if (_selectedCity == null || _selectedCity!.isEmpty) {
      return auctions;
    }
    
    return auctions.where((auction) {
      bool matchesCity = false;
      
      // Check city field directly
      if (auction.city != null) {
        matchesCity = auction.city!.toLowerCase() == _selectedCity!.toLowerCase();
      }
      
      // Check location text (which might contain city name)
      if (!matchesCity && auction.location != null) {
        matchesCity = auction.location!.toLowerCase().contains(_selectedCity!.toLowerCase());
      }
      
      return matchesCity;
    }).toList();
  }
} 