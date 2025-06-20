import 'package:flutter/material.dart';
import 'package:land_auction_app/models/auction.dart';
import 'package:land_auction_app/widgets/countdown_timer.dart';

/// A specialized countdown widget for auctions
/// Displays a styled countdown timer with auction-specific labels
class AuctionCountdown extends StatelessWidget {
  final Auction auction;
  
  const AuctionCountdown({
    super.key,
    required this.auction,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    if (!auction.isActive) {
      return const SizedBox.shrink();
    }
    
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title for the countdown
          Text(
            'İhalenin Bitimine Kalan Süre',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.primary,
            ),
          ),
          const SizedBox(height: 8),
          
          // Countdown timer
          CountdownTimer(
            seconds: auction.remainingTimeInSeconds,
            auctionId: auction.id,
            compact: false,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.primary,
              letterSpacing: 0.5,
            ),
            onFinish: () {
              // When timer finishes, show a message
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: const Text('İhale süresi sona erdi'),
                  backgroundColor: theme.colorScheme.primary,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
} 