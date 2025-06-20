import 'package:flutter/material.dart';
import 'package:land_auction_app/models/bid.dart';
import 'package:intl/intl.dart';

class BidHistoryItem extends StatelessWidget {
  final Bid bid;
  final bool isHighestBid;
  
  const BidHistoryItem({
    super.key,
    required this.bid,
    this.isHighestBid = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currencyFormat = NumberFormat.currency(
      locale: 'tr_TR',
      symbol: '₺',
      decimalDigits: 0,
    );
    
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      elevation: isHighestBid ? 2 : 0,
      color: isHighestBid 
          ? theme.colorScheme.primary.withOpacity(0.05)
          : theme.colorScheme.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(
          color: isHighestBid
              ? theme.colorScheme.primary.withOpacity(0.3)
              : theme.colorScheme.onBackground.withOpacity(0.05),
          width: isHighestBid ? 1 : 0.5,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            // Bid rank indicator
            Container(
              width: 30,
              height: 30,
              decoration: BoxDecoration(
                color: isHighestBid
                    ? theme.colorScheme.primary
                    : theme.colorScheme.onBackground.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Icon(
                  isHighestBid ? Icons.emoji_events : Icons.person,
                  size: 16,
                  color: isHighestBid
                      ? Colors.white
                      : theme.colorScheme.onBackground.withOpacity(0.5),
                ),
              ),
            ),
            const SizedBox(width: 12),
            
            // Bid details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Bidder name
                  Text(
                    bid.bidderName ?? 'İsimsiz Kullanıcı',
                    style: TextStyle(
                      fontWeight: isHighestBid ? FontWeight.bold : FontWeight.w500,
                      color: isHighestBid
                          ? theme.colorScheme.primary
                          : theme.colorScheme.onBackground,
                    ),
                  ),
                  
                  // Bid timestamp
                  Text(
                    _formatDateTime(bid.createdAt),
                    style: TextStyle(
                      fontSize: 12,
                      color: theme.colorScheme.onBackground.withOpacity(0.5),
                    ),
                  ),
                ],
              ),
            ),
            
            // Bid amount
            Text(
              currencyFormat.format(bid.amount),
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: isHighestBid
                    ? theme.colorScheme.primary
                    : theme.colorScheme.onBackground,
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  String _formatDateTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inMinutes < 1) {
      return 'Az önce';
    } else if (difference.inHours < 1) {
      return '${difference.inMinutes} dakika önce';
    } else if (difference.inDays < 1) {
      return '${difference.inHours} saat önce';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} gün önce';
    } else {
      return DateFormat('dd MMM yyyy, HH:mm').format(dateTime);
    }
  }
} 