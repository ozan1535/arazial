import 'package:flutter/material.dart';
import 'package:provider/provider.dart' as provider;
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:land_auction_app/models/auction.dart';
import 'package:land_auction_app/models/bid.dart';
import 'package:land_auction_app/models/offer.dart';
import 'package:land_auction_app/providers/auction_provider.dart';
import 'package:land_auction_app/providers/auth_provider.dart';
import 'package:land_auction_app/services/auth_service.dart';
import 'package:land_auction_app/widgets/auction_countdown.dart';
import 'package:land_auction_app/widgets/bid_history_item.dart';
import 'package:land_auction_app/widgets/bid_history.dart';
import 'package:land_auction_app/widgets/bid_form.dart';
import 'package:land_auction_app/widgets/countdown_timer.dart';
import 'package:land_auction_app/widgets/place_bid_button.dart';

class AuctionDetailScreen extends StatefulWidget {
  final String auctionId;
  
  const AuctionDetailScreen({
    super.key,
    required this.auctionId,
  });

  @override
  State<AuctionDetailScreen> createState() => _AuctionDetailScreenState();
}

class _AuctionDetailScreenState extends State<AuctionDetailScreen> {
  late Stream<Auction> _auctionStream;
  late Stream<List<Bid>> _bidsStream;

  // New fields for offer listings
  Stream<List<Offer>>? _userOffersStream;
  final TextEditingController _offerAmountController = TextEditingController();
  bool _isSubmittingOffer = false;
  String? _offerError;
  String? _offerSuccess;

  @override
  void initState() {
    super.initState();
    final auctionProvider = provider.Provider.of<AuctionProvider>(context, listen: false);
    _auctionStream = auctionProvider.subscribeToAuction(widget.auctionId);
    _bidsStream = auctionProvider.subscribeToAuctionBids(widget.auctionId);
    
    // Set up user offers stream if user is authenticated
    final authService = provider.Provider.of<AuthService>(context, listen: false);
    if (authService.currentUser != null) {
      _userOffersStream = auctionProvider.streamUserOffersForAuction(widget.auctionId);
    }
  }
  
  @override
  void dispose() {
    _offerAmountController.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currencyFormat = NumberFormat.currency(
      locale: 'tr_TR',
      symbol: '₺',
      decimalDigits: 0,
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('İlan Detayları'),
      ),
      body: StreamBuilder<Auction>(
        stream: _auctionStream,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Center(
              child: Text('Bir hata oluştu: ${snapshot.error}'),
            );
          }

          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          final auction = snapshot.data!;

          // Determine if this is an offer-type listing
          final isOfferListing = auction.listingType == ListingType.offer;

          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image Carousel
                SizedBox(
                  height: 250,
                  width: double.infinity,
                  child: _buildImageCarousel(auction),
                ),

                // Title and Status
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              _getAuctionTitle(auction),
                              style: theme.textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          _buildStatusChip(context, auction),
                        ],
                      ),
                      
                      auction.isActive ? _buildCountdownTimer(auction) : const SizedBox.shrink(),
                      
                      const SizedBox(height: 16),

                      // Type badge (Auction or Offer)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: isOfferListing 
                              ? theme.colorScheme.tertiary.withOpacity(0.1)
                              : theme.colorScheme.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          isOfferListing ? 'Pazarlıklı Satış' : 'Açık Arttırma',
                          style: TextStyle(
                            color: isOfferListing 
                                ? theme.colorScheme.tertiary 
                                : theme.colorScheme.primary,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 16),

                      // Location
                      Row(
                        children: [
                          Icon(
                            Icons.location_on,
                            color: theme.colorScheme.primary,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              auction.fullLocation,
                              style: theme.textTheme.bodyLarge,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Area
                      Row(
                        children: [
                          Icon(
                            Icons.straighten,
                            color: theme.colorScheme.primary,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            auction.formattedArea,
                            style: theme.textTheme.bodyLarge,
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Add zoning information if available
                      if (auction.zoningInfo.isNotEmpty) ...[
                        Row(
                          children: [
                            Icon(
                              Icons.map_outlined,
                              color: theme.colorScheme.primary,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                auction.zoningInfo,
                                style: theme.textTheme.bodyLarge,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Add owner info if available
                      if (auction.ownerInfo != null && auction.ownerInfo!.isNotEmpty) ...[
                        Row(
                          children: [
                            Icon(
                              Icons.person_outline,
                              color: theme.colorScheme.primary,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Satıcı: ${auction.ownerInfo}',
                                style: theme.textTheme.bodyLarge,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Description
                      Text(
                        'Açıklama',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _getAuctionDescription(auction),
                        style: theme.textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 16),

                      // Auction Details
                      Text(
                        isOfferListing ? 'İlan Detayları' : 'İhale Detayları',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      
                      _buildDetailRow(
                        isOfferListing ? 'Başlangıç Fiyatı' : 'Mevcut Teklif',
                        currencyFormat.format(auction.currentPrice),
                        theme,
                        emphasize: true,
                      ),
                      
                      if (!isOfferListing) 
                        _buildDetailRow(
                          'Minimum Teklif',
                          currencyFormat.format(auction.minimumNextBid),
                          theme,
                          emphasize: true,
                        ),
                      
                      if (isOfferListing)
                        _buildDetailRow(
                          'Minimum Artış Tutarı',
                          currencyFormat.format(auction.offerIncrement ?? 0),
                          theme,
                        ),
                      
                      _buildDetailRow(
                        'Başlangıç Fiyatı',
                        currencyFormat.format(auction.startPrice),
                        theme,
                      ),
                      
                      if (!isOfferListing)
                        _buildDetailRow(
                          'Minimum Artış',
                          currencyFormat.format(auction.minIncrement),
                          theme,
                        ),
                      
                      _buildDetailRow(
                        'Başlangıç',
                        DateFormat('dd MMM yyyy, HH:mm').format(auction.startTime),
                        theme,
                      ),
                      
                      _buildDetailRow(
                        'Bitiş',
                        DateFormat('dd MMM yyyy, HH:mm').format(auction.endTime),
                        theme,
                      ),
                      
                      const SizedBox(height: 16),

                      // Property Details Section (New)
                      Text(
                        'Emlak Detayları',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Property Grid
                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        childAspectRatio: 2.8,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        children: [
                          // Property Type
                          _buildPropertyGridItem(
                            'Emlak Tipi',
                            'ARSA',
                            theme,
                          ),
                          
                          // Area
                          _buildPropertyGridItem(
                            'Alan (m²)',
                            auction.formattedArea.isEmpty ? '-' : auction.formattedArea,
                            theme,
                          ),
                          
                          // Zoning
                          _buildPropertyGridItem(
                            'İmar Durumu',
                            auction.zoning ?? '-',
                            theme,
                          ),
                          
                          // Ada No
                          _buildPropertyGridItem(
                            'Ada No',
                            auction.adaNo ?? '-',
                            theme,
                          ),
                          
                          // Parsel No
                          _buildPropertyGridItem(
                            'Parsel No',
                            auction.parselNo ?? '-',
                            theme,
                          ),
                          
                          // Listing Owner
                          _buildPropertyGridItem(
                            'İlan Sahibi',
                            auction.ownerInfo ?? 'Bilinmiyor',
                            theme,
                          ),
                          
                          // Listing Date
                          _buildPropertyGridItem(
                            'İlan Tarihi',
                            DateFormat('dd MMM yyyy, HH:mm').format(auction.createdAt),
                            theme,
                          ),
                          
                          // Start Time (for auctions)
                          _buildPropertyGridItem(
                            'Başlangıç Zamanı',
                            DateFormat('dd MMM yyyy, HH:mm').format(auction.startTime),
                            theme,
                          ),
                          
                          // End Time (for auctions)
                          _buildPropertyGridItem(
                            'Bitiş Zamanı',
                            DateFormat('dd MMM yyyy, HH:mm').format(auction.endTime),
                            theme,
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 16),

                      // Countdown for auctions
                      if (!isOfferListing && auction.isActive) 
                        AuctionCountdown(auction: auction),
                      
                      const SizedBox(height: 16),

                      // Show appropriate UI based on listing type
                      if (!isOfferListing) 
                        _buildAuctionUI(auction, theme) 
                      else 
                        _buildOfferUI(auction, theme),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: StreamBuilder<Auction>(
        stream: _auctionStream,
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const SizedBox.shrink();
          final auction = snapshot.data!;

          // Don't show button if auction is not active
          if (!auction.isActive) return const SizedBox.shrink();

          // Different button based on listing type
          return SafeArea(
            child: auction.isOfferType
                ? Padding(
                    padding: const EdgeInsets.all(16),
                    child: ElevatedButton(
                      onPressed: () {
                        // Scroll to the offer form section
                        // This assumes the SingleChildScrollView has a ScrollController
                        Scrollable.ensureVisible(
                          context,
                          duration: const Duration(milliseconds: 500),
                          curve: Curves.easeInOut,
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.deepPurple,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'PAZARLIĞA BAŞLA',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ),
                  )
                : Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, -2),
                        ),
                      ],
                    ),
                    child: PlaceBidButton(
                      auction: auction,
                      onBidPlaced: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Teklifiniz başarıyla kaydedildi.'),
                            backgroundColor: Colors.green,
                          ),
                        );
                      },
                    ),
                  ),
          );
        },
      ),
    );
  }
  
  Widget _buildStatusChip(BuildContext context, Auction auction) {
    final theme = Theme.of(context);
    
    Color chipColor;
    String statusText;
    IconData statusIcon;
    
    // First check if this is an offer-type listing
    if (auction.isOfferType) {
      chipColor = Colors.deepPurple;
      statusText = 'Pazarlıklı';
      statusIcon = Icons.handshake_outlined;
    } else if (auction.isActive) {
      chipColor = theme.colorScheme.primary;
      statusText = 'Aktif';
      statusIcon = Icons.local_fire_department_rounded;
    } else if (auction.isUpcoming) {
      chipColor = theme.colorScheme.tertiary;
      statusText = 'Yaklaşan';
      statusIcon = Icons.upcoming_rounded;
    } else {
      chipColor = Colors.grey;
      statusText = 'Sona Erdi';
      statusIcon = Icons.check_circle_outline_rounded;
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: chipColor.withOpacity(0.1),
        border: Border.all(color: chipColor),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            statusIcon,
            size: 16,
            color: chipColor,
          ),
          const SizedBox(width: 6),
          Text(
            statusText,
            style: TextStyle(
              color: chipColor,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildDetailRow(String label, String value, ThemeData theme, {bool emphasize = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
              label,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: emphasize ? theme.colorScheme.primary : Colors.grey[600],
              fontWeight: emphasize ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          Text(
              value,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: emphasize ? theme.colorScheme.primary : null,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImageCarousel(Auction auction) {
    if (auction.images.isNotEmpty) {
      return PageView.builder(
        itemCount: auction.images.length,
        itemBuilder: (context, index) {
          return CachedNetworkImage(
            imageUrl: auction.images[index],
            fit: BoxFit.cover,
            placeholder: (context, url) => const Center(
              child: CircularProgressIndicator(),
            ),
            errorWidget: (context, url, error) =>
                const Icon(Icons.error),
          );
        },
      );
    } else {
      return Container(
        color: Colors.grey[200],
        child: const Icon(
          Icons.landscape,
          size: 64,
          color: Colors.grey,
        ),
      );
    }
  }

  String _getAuctionTitle(Auction auction) {
    return auction.title ?? 'Arazi İlanı';
  }

  String _getAuctionLocation(Auction auction) {
    return auction.fullLocation;
  }

  String _getAuctionDescription(Auction auction) {
    return auction.description ?? 'Açıklama bulunmuyor.';
  }

  Widget _buildCountdownTimer(Auction auction) {
    if (!auction.isActive) return const SizedBox();
    
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 16),
      child: CountdownTimer(
        seconds: auction.remainingTimeInSeconds,
        auctionId: auction.id,
        compact: false,
        style: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: Theme.of(context).colorScheme.primary,
        ),
        onFinish: () {
          provider.Provider.of<AuctionProvider>(context, listen: false)
            .fetchAuctions(forceRefresh: true);
        },
      ),
    );
  }

  // UI for regular auction listings
  Widget _buildAuctionUI(Auction auction, ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Bid History
        Text(
          'Teklif Geçmişi',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        
        StreamBuilder<List<Bid>>(
          stream: _bidsStream,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(
                child: CircularProgressIndicator(),
              );
            }

            if (snapshot.hasError) {
              return Text('Hata: ${snapshot.error}');
            }

            final bids = snapshot.data ?? [];
            
            if (bids.isEmpty) {
              return const Text('Henüz bir teklif verilmemiş.');
            }

            return BidHistory(bids: bids);
          },
        ),
        
        const SizedBox(height: 16),
      ],
    );
  }
  
  // UI for negotiable (offer) listings
  Widget _buildOfferUI(Auction auction, ThemeData theme) {
    // If no user is logged in, show login prompt
    final authService = provider.Provider.of<AuthService>(context, listen: false);
    if (authService.currentUser == null) {
      return Card(
        margin: const EdgeInsets.symmetric(vertical: 16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              const Text(
                'Teklif vermek için giriş yapmalısınız.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  // Navigate to login screen
                  Navigator.of(context).pushNamed('/login');
                },
                child: const Text('Giriş Yap'),
              ),
            ],
          ),
        ),
      );
    }
    
    // Show current user offers and offer form
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Pazarlık Durumu',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        
        // Show user offers
        if (_userOffersStream != null)
          StreamBuilder<List<Offer>>(
            stream: _userOffersStream!,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }
              
              if (snapshot.hasError) {
                return Text('Hata: ${snapshot.error}');
              }
              
              final offers = snapshot.data ?? [];
              final activeOffer = offers.isNotEmpty 
                  ? offers.firstWhere(
                      (o) => o.status == OfferStatus.pending || o.status == OfferStatus.accepted,
                      orElse: () => offers.first,
                    )
                  : null;
                  
              if (activeOffer != null) {
                return _buildOfferStatusCard(activeOffer, theme);
              }
              
              // No active offers, show offer form
              return _buildOfferForm(auction, theme);
            },
          ),
      ],
    );
  }
  
  // Card showing status of user's offer
  Widget _buildOfferStatusCard(Offer offer, ThemeData theme) {
    final formatter = NumberFormat.currency(
      locale: 'tr_TR',
      symbol: '₺',
      decimalDigits: 0,
    );
    
    Color statusColor;
    String statusText;
    IconData statusIcon;
    
    switch (offer.status) {
      case OfferStatus.pending:
        statusColor = Colors.amber;
        statusText = 'Beklemede';
        statusIcon = Icons.pending;
        break;
      case OfferStatus.accepted:
        statusColor = Colors.green;
        statusText = 'Kabul Edildi';
        statusIcon = Icons.check_circle;
        break;
      case OfferStatus.rejected:
        statusColor = Colors.red;
        statusText = 'Reddedildi';
        statusIcon = Icons.cancel;
        break;
      case OfferStatus.withdrawn:
        statusColor = Colors.grey;
        statusText = 'Geri Çekildi';
        statusIcon = Icons.undo;
        break;
    }
    
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(statusIcon, color: statusColor),
                const SizedBox(width: 8),
                Text(
                  'Teklifiniz: $statusText',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Teklif Tutarı: ${formatter.format(offer.amount)}',
              style: theme.textTheme.titleMedium,
            ),
            Text(
              'Teklif Tarihi: ${DateFormat('dd MMM yyyy, HH:mm').format(offer.createdAt)}',
              style: theme.textTheme.bodySmall,
            ),
            
            if (offer.status == OfferStatus.pending) ...[
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: () => _withdrawOffer(offer.id),
                icon: const Icon(Icons.cancel),
                label: const Text('Teklifi Geri Çek'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                ),
              ),
            ],
            
            if (offer.status == OfferStatus.rejected || offer.status == OfferStatus.withdrawn) ...[
              const SizedBox(height: 24),
              const Text('Yeni bir teklif verebilirsiniz:'),
              const SizedBox(height: 8),
              _buildOfferForm(
                provider.Provider.of<AuctionProvider>(context, listen: false)
                    .getAuctionById(offer.auctionId)!,
                theme,
              ),
            ],
          ],
        ),
      ),
    );
  }
  
  // Form to submit a new offer
  Widget _buildOfferForm(Auction auction, ThemeData theme) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Pazarlığa Başla',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Bu ilan için bir teklif vererek pazarlığa başlayabilirsiniz.',
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            
            // Error message
            if (_offerError != null) ...[
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: theme.colorScheme.error.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.error_outline,
                      color: theme.colorScheme.error,
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _offerError!,
                        style: TextStyle(
                          color: theme.colorScheme.error,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
            
            // Success message
            if (_offerSuccess != null) ...[
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.check_circle_outline,
                      color: theme.colorScheme.primary,
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _offerSuccess!,
                        style: TextStyle(
                          color: theme.colorScheme.primary,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
            
            TextField(
              controller: _offerAmountController,
              decoration: InputDecoration(
                labelText: 'Teklif Tutarı (₺)',
                hintText: 'Teklifiniz için bir tutar giriniz',
                border: const OutlineInputBorder(),
                prefixIcon: const Icon(Icons.money),
              ),
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSubmittingOffer 
                    ? null 
                    : () => _submitOffer(auction),
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.colorScheme.primary,
                  foregroundColor: theme.colorScheme.onPrimary,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                child: _isSubmittingOffer
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text('Teklif Ver'),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  // Submit an offer
  Future<void> _submitOffer(Auction auction) async {
    setState(() {
      _offerError = null;
      _offerSuccess = null;
      _isSubmittingOffer = true;
    });
    
    final amountText = _offerAmountController.text.trim();
    if (amountText.isEmpty) {
      setState(() {
        _offerError = 'Lütfen bir teklif tutarı girin.';
        _isSubmittingOffer = false;
      });
      return;
    }
    
    // Parse amount
    double amount;
    try {
      amount = double.parse(amountText.replaceAll('.', '').replaceAll(',', '.'));
    } catch (e) {
      setState(() {
        _offerError = 'Geçerli bir tutar girin.';
        _isSubmittingOffer = false;
      });
      return;
    }
    
    // For offer-type listings, don't check for minimum amount
    // Only check minimum amount for auction-type listings 
    if (!auction.isOfferType && amount < auction.minimumNextOffer) {
      setState(() {
        _offerError = 'Teklif en az ${NumberFormat.currency(locale: 'tr_TR', symbol: '₺', decimalDigits: 0).format(auction.minimumNextOffer)} olmalıdır.';
        _isSubmittingOffer = false;
      });
      return;
    }
    
    try {
      final auctionProvider = provider.Provider.of<AuctionProvider>(context, listen: false);
      final result = await auctionProvider.submitOffer(auction.id, amount);
      
      if (result['success'] == true) {
        setState(() {
          _offerSuccess = 'Teklifiniz başarıyla gönderildi.';
          _offerAmountController.clear();
        });
        
        // Force refresh user offers to update UI immediately
        final authService = provider.Provider.of<AuthService>(context, listen: false);
        if (authService.currentUser != null) {
          // This will trigger refresh of the _userOffersStream
          await auctionProvider.getUserOffersForAuction(auction.id, authService.currentUser!.id);
          
          // Rebuild the UI to show the new offer status
          setState(() {});
        }
      } else {
        setState(() {
          _offerError = result['error'] ?? 'Teklif gönderilirken bir hata oluştu.';
        });
      }
    } catch (e) {
      setState(() {
        _offerError = 'Bir hata oluştu: $e';
      });
    } finally {
      setState(() {
        _isSubmittingOffer = false;
      });
    }
  }
  
  // Withdraw an offer
  Future<void> _withdrawOffer(String offerId) async {
    // Show loading indicator
    final loadingDialog = showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(),
      ),
    );
    
    try {
      final auctionProvider = provider.Provider.of<AuctionProvider>(context, listen: false);
      final result = await auctionProvider.withdrawOffer(offerId);
      
      // Dismiss loading indicator
      Navigator.of(context, rootNavigator: true).pop();
      
      if (result['success'] == true) {
        // Success message
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Teklifiniz başarıyla geri çekildi'),
            backgroundColor: Colors.green,
          ),
        );
        
        // Force refresh user offers to update UI immediately
        final authService = provider.Provider.of<AuthService>(context, listen: false);
        if (authService.currentUser != null) {
          // Trigger a UI rebuild right away
          setState(() {
            // Reset offer messages
            _offerError = null;
            _offerSuccess = null;
          });
          
          // Get the most recent data
          await auctionProvider.getUserOffersForAuction(
            widget.auctionId,
            authService.currentUser!.id
          );
          
          // Force the StreamBuilder to rebuild with updated data
          if (_userOffersStream != null) {
            setState(() {
              _userOffersStream = auctionProvider.streamUserOffersForAuction(widget.auctionId);
            });
          }
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['error'] ?? 'Teklif geri çekilirken bir hata oluştu')),
        );
      }
    } catch (e) {
      // Dismiss loading indicator
      Navigator.of(context, rootNavigator: true).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Bir hata oluştu: $e')),
      );
    }
  }

  Widget _buildPropertyGridItem(String label, String value, ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: theme.textTheme.bodyMedium,
        ),
      ],
    );
  }
} 