import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:land_auction_app/models/auction.dart';
import 'package:intl/intl.dart';
import 'package:land_auction_app/widgets/countdown_timer.dart';
import 'package:land_auction_app/theme/app_theme.dart';
import 'dart:ui';

class AuctionCard extends StatelessWidget {
  final Auction auction;
  final VoidCallback onTap;
  
  const AuctionCard({
    super.key,
    required this.auction,
    required this.onTap,
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
      margin: const EdgeInsets.only(bottom: 20),
      elevation: 4,
      shadowColor: Colors.black.withOpacity(0.15),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // Card Content
          InkWell(
            onTap: onTap,
            splashColor: theme.colorScheme.primary.withOpacity(0.05),
            highlightColor: theme.colorScheme.primary.withOpacity(0.025),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image section
                Stack(
                  children: [
                    Hero(
                      tag: 'auction-image-${auction.id}',
                      child: SizedBox(
                        height: 200, // Taller image for more impact
                        width: double.infinity,
                        child: _getAuctionImage(theme),
                      ),
                    ),
                    // Premium gradient overlay with gold accent
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              Colors.black.withOpacity(0.1),
                              Colors.black.withOpacity(0.5),
                            ],
                            stops: const [0.6, 0.75, 1.0],
                          ),
                        ),
                      ),
                    ),
                    // Top-right corner decoration
                    Positioned(
                      top: 0,
                      right: 0,
                      child: Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topRight,
                            end: Alignment.bottomLeft,
                            colors: [
                              theme.colorScheme.tertiary.withOpacity(0.7),
                              theme.colorScheme.tertiary.withOpacity(0.0),
                            ],
                          ),
                        ),
                      ),
                    ),
                    // Status badge with improved style
                    Positioned(
                      top: 16,
                      left: 16,
                      child: _buildStatusBadge(context),
                    ),
                    // Area size badge at bottom left
                    Positioned(
                      bottom: 16,
                      left: 16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.6),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.3),
                            width: 0.5,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.straighten_outlined,
                              size: 14,
                              color: Colors.white.withOpacity(0.9),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '${auction.areaSize ?? 0} ${auction.areaUnit ?? 'm²'}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    // Countdown for active auctions with improved style
                    if (auction.isActive)
                      Positioned(
                        bottom: 16,
                        right: 16,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.7),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: Colors.white.withOpacity(0.3),
                              width: 0.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.2),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: CountdownTimer(
                            seconds: auction.remainingTimeInSeconds,
                            compact: true,
                            auctionId: auction.id,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                              letterSpacing: 0.5,
                              fontFamily: 'monospace',
                            ),
                            onFinish: () {
                              debugPrint('Timer finished for auction: ${auction.id}');
                            },
                          ),
                        ),
                      ),
                  ],
                ),
                
                // Content section with enhanced styling
                Padding(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Title with improved typography
                      Text(
                        _getAuctionTitle(),
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          fontSize: 18,
                          letterSpacing: 0.1,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 10),
                      
                      // Location with enhanced styling
                      Row(
                        children: [
                          Icon(
                            Icons.location_on_outlined,
                            size: 16,
                            color: theme.colorScheme.primary.withOpacity(0.7),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              _getAuctionLocation(),
                              style: theme.textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.w500,
                                color: theme.colorScheme.onSurface.withOpacity(0.7),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 14),
                      const Divider(height: 1),
                      const SizedBox(height: 14),
                      
                      // Price and button with premium layout
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                auction.isOfferType ? 'Başlangıç Fiyatı' : 'Güncel Fiyat',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: theme.colorScheme.onSurface.withOpacity(0.5),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                currencyFormat.format(auction.currentPrice),
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w800,
                                  color: auction.isOfferType
                                    ? Colors.deepPurple
                                    : auction.isActive 
                                      ? theme.colorScheme.secondary
                                      : theme.colorScheme.primary,
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ],
                          ),
                          
                          // Action button with premium style
                          ElevatedButton(
                            onPressed: onTap,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: auction.isOfferType 
                                ? Colors.deepPurple 
                                : theme.colorScheme.primary,
                              foregroundColor: Colors.white,
                              elevation: 2,
                              shadowColor: auction.isOfferType
                                ? Colors.deepPurple.withOpacity(0.3)
                                : theme.colorScheme.primary.withOpacity(0.3),
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: Text(
                              auction.isOfferType ? 'Teklif Ver' : 'Görüntüle',
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Premium ribbon for high-value properties (over 1 million TL)
          if (auction.currentPrice > 1000000)
            Positioned(
              top: 24,
              right: -30,
              child: Transform.rotate(
                angle: 0.785398, // 45 degrees in radians
                child: Container(
                  width: 120,
                  height: 30,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.tertiary,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.15),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      )
                    ],
                  ),
                  child: const Center(
                    child: Text(
                      'PREMİUM',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 12,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
  
  Widget _buildStatusBadge(BuildContext context) {
    final theme = Theme.of(context);
    
    late Color backgroundColor;
    late Color borderColor;
    late Color textColor;
    late String text;
    late IconData icon;
    
    // Check if this is an offer-type listing first
    if (auction.isOfferType) {
      backgroundColor = Colors.deepPurple.withOpacity(0.85);
      borderColor = Colors.white.withOpacity(0.3);
      textColor = Colors.white;
      text = 'Pazarlıklı';
      icon = Icons.handshake_outlined;
    } else if (auction.isActive) {
      backgroundColor = theme.colorScheme.primary.withOpacity(0.85);
      borderColor = Colors.white.withOpacity(0.3);
      textColor = Colors.white;
      text = 'Aktif';
      icon = Icons.local_fire_department_rounded;
    } else if (auction.isUpcoming) {
      backgroundColor = theme.colorScheme.tertiary.withOpacity(0.85);
      borderColor = Colors.white.withOpacity(0.3);
      textColor = Colors.white;
      text = 'Yaklaşan';
      icon = Icons.upcoming_rounded;
    } else {
      backgroundColor = Colors.black.withOpacity(0.7);
      borderColor = Colors.white.withOpacity(0.2);
      textColor = Colors.white;
      text = 'Tamamlandı';
      icon = Icons.check_circle_outline_rounded;
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: borderColor,
          width: 0.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: textColor,
          ),
          const SizedBox(width: 6),
          Text(
            text,
            style: TextStyle(
              color: textColor,
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
  
  String _formatDate(DateTime? date) {
    if (date == null) return 'Belirtilmemiş';
    
    return DateFormat('dd.MM.yyyy HH:mm').format(date);
  }

  Widget _getAuctionImage(ThemeData theme) {
    // Check if the auction has images
    if (auction.images.isNotEmpty) {
      return CachedNetworkImage(
        imageUrl: auction.images.first,
        fit: BoxFit.cover,
        placeholder: (context, url) => Container(
          color: theme.colorScheme.surface.withOpacity(0.5),
          child: Center(
            child: SizedBox(
              width: 30,
              height: 30,
              child: CircularProgressIndicator(
                color: theme.colorScheme.primary,
                strokeWidth: 2,
              ),
            ),
          ),
        ),
        errorWidget: (context, url, error) => Container(
          color: theme.colorScheme.surface.withOpacity(0.8),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.image_not_supported_outlined,
                size: 48,
                color: theme.colorScheme.onSurface.withOpacity(0.3),
              ),
              const SizedBox(height: 8),
              Text(
                'Görsel Yüklenemedi',
                style: TextStyle(
                  color: theme.colorScheme.onSurface.withOpacity(0.5),
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      );
    }
    // Default fallback with more sophisticated empty state
    else {
      return Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              theme.colorScheme.surface,
              theme.colorScheme.surfaceVariant ?? theme.colorScheme.surface.withOpacity(0.7),
            ],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.real_estate_agent_rounded,
                size: 48,
                color: theme.colorScheme.primary.withOpacity(0.15),
              ),
              const SizedBox(height: 12),
              Text(
                'ARAZİ İHALESİ',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.0,
                  color: theme.colorScheme.onSurface.withOpacity(0.4),
                ),
              ),
            ],
          ),
        ),
      );
    }
  }

  String _getAuctionTitle() {
    return auction.title ?? 'Arazi İhalesi';
  }

  String _getAuctionLocation() {
    return auction.location ?? 'Konum belirtilmemiş';
  }
}