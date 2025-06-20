import 'package:flutter/material.dart';
import 'package:land_auction_app/models/bid.dart';
import 'package:land_auction_app/widgets/bid_history_item.dart';
import 'package:intl/intl.dart';

class BidHistory extends StatelessWidget {
  final List<Bid> bids;
  final bool showLimit;
  final int limit;

  const BidHistory({
    super.key,
    required this.bids,
    this.showLimit = true,
    this.limit = 5,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final displayBids = showLimit && bids.length > limit 
        ? bids.take(limit).toList() 
        : bids;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Empty state message
        if (bids.isEmpty)
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Center(
              child: Text(
                'Henüz bir teklif verilmemiş.',
                style: TextStyle(
                  color: theme.colorScheme.onSurface.withOpacity(0.6),
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),
          ),
          
        // Bid history items
        if (bids.isNotEmpty)
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: displayBids.length,
            itemBuilder: (context, index) {
              final bid = displayBids[index];
              return BidHistoryItem(
                bid: bid,
                isHighestBid: index == 0,
              );
            },
          ),
        
        // Show "more bids" indicator if necessary
        if (showLimit && bids.length > limit)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
            child: InkWell(
              onTap: () {
                // Show dialog with full bid history
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Tüm Teklifler'),
                    content: SizedBox(
                      width: double.maxFinite,
                      child: ListView.builder(
                        shrinkWrap: true,
                        itemCount: bids.length,
                        itemBuilder: (context, index) {
                          return BidHistoryItem(
                            bid: bids[index],
                            isHighestBid: index == 0,
                          );
                        },
                      ),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Kapat'),
                      ),
                    ],
                  ),
                );
              },
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Daha fazla teklif gör (${bids.length - limit})',
                    style: TextStyle(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    Icons.arrow_forward_ios,
                    size: 14,
                    color: theme.colorScheme.primary,
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
} 