import 'package:flutter/material.dart';
import 'package:provider/provider.dart' as provider;
import 'package:land_auction_app/models/bid.dart';
import 'package:land_auction_app/providers/auction_provider.dart';
import 'package:land_auction_app/screens/auction_detail_screen.dart';
import 'package:land_auction_app/theme/app_theme.dart';
import 'package:land_auction_app/widgets/app_drawer.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';

class MyBidsScreen extends StatefulWidget {
  const MyBidsScreen({super.key});

  @override
  State<MyBidsScreen> createState() => _MyBidsScreenState();
}

class _MyBidsScreenState extends State<MyBidsScreen> with SingleTickerProviderStateMixin {
  bool _isLoading = true;
  bool _hasError = false;
  String? _errorMessage;
  List<Bid> _userBids = [];
  late TabController _tabController;
  
  @override
  void initState() {
    super.initState();
    // Initialize date formatting for Turkish locale
    initializeDateFormatting('tr_TR', null);
    _tabController = TabController(length: 3, vsync: this);
    _loadUserBids();
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
  
  Future<void> _loadUserBids({bool forceRefresh = false}) async {
    setState(() {
      _isLoading = true;
      _hasError = false;
      _errorMessage = null;
    });
    
    try {
      final bids = await provider.Provider.of<AuctionProvider>(context, listen: false)
          .fetchUserBids(forceRefresh: forceRefresh);
      
      setState(() {
        _userBids = bids;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _hasError = true;
        _errorMessage = e.toString();
      });
    }
  }
  
  Future<void> _onRefresh() async {
    await _loadUserBids(forceRefresh: true);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      appBar: AppBar(
        title: const Text('Teklifleriniz'),
        backgroundColor: theme.colorScheme.surface,
        elevation: 2,
        bottom: TabBar(
          controller: _tabController,
          labelStyle: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
          unselectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.w400,
            fontSize: 14,
          ),
          labelColor: AppTheme.primaryColor,
          unselectedLabelColor: theme.colorScheme.onBackground.withOpacity(0.6),
          indicatorColor: AppTheme.primaryColor,
          indicatorWeight: 2,
          indicatorSize: TabBarIndicatorSize.label,
          tabs: const [
            Tab(text: 'Tüm Teklifler'),
            Tab(text: 'Aktif İhaleler'),
            Tab(text: 'Kazananlar'),
          ],
        ),
      ),
      drawer: const AppDrawer(),
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        color: AppTheme.primaryColor,
        backgroundColor: theme.colorScheme.surface,
        child: _buildContent(theme),
      ),
    );
  }
  
  Widget _buildContent(ThemeData theme) {
    if (_isLoading && _userBids.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 32,
              height: 32,
              child: CircularProgressIndicator(
                color: AppTheme.primaryColor,
                strokeWidth: 2,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Teklifleriniz yükleniyor...',
              style: TextStyle(
                color: theme.colorScheme.onBackground.withOpacity(0.7),
                fontSize: 14,
              ),
            ),
          ],
        ),
      );
    }
    
    if (_hasError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: theme.colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Teklifleriniz yüklenirken bir hata oluştu',
              style: TextStyle(
                color: theme.colorScheme.error,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage ?? 'Bilinmeyen hata',
              style: TextStyle(
                color: theme.colorScheme.error.withOpacity(0.7),
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => _loadUserBids(forceRefresh: true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Tekrar Dene'),
            ),
          ],
        ),
      );
    }
    
    if (_userBids.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.gavel_outlined,
              size: 48,
              color: theme.colorScheme.onBackground.withOpacity(0.3),
            ),
            const SizedBox(height: 16),
            Text(
              'Henüz hiç teklif vermemişsiniz',
              style: TextStyle(
                color: theme.colorScheme.onBackground.withOpacity(0.7),
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'İhalelere teklif vererek burada görüntüleyebilirsiniz',
              style: TextStyle(
                color: theme.colorScheme.onBackground.withOpacity(0.5),
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            OutlinedButton.icon(
              onPressed: () => Navigator.of(context).pushReplacementNamed('/'),
              icon: const Icon(Icons.search),
              label: const Text('İhalelere Göz At'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.primaryColor,
              ),
            ),
          ],
        ),
      );
    }
    
    return TabBarView(
      controller: _tabController,
      children: [
        _buildBidsList(_userBids),
        _buildBidsList(_userBids.where((bid) => 
          bid.auction != null && bid.auction!.isActive).toList()),
        _buildBidsList(_userBids.where((bid) => 
          bid.auction != null && bid.isHighestBid && bid.auction!.hasEnded).toList()),
      ],
    );
  }
  
  Widget _buildBidsList(List<Bid> bids) {
    if (bids.isEmpty) {
      return Center(
        child: Text(
          'Bu kategoride teklif bulunamadı',
          style: TextStyle(
            color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
            fontSize: 16,
          ),
        ),
      );
    }
    
    return ListView.builder(
      padding: const EdgeInsets.only(top: 16, bottom: 16),
      itemCount: bids.length,
      itemBuilder: (context, index) {
        final bid = bids[index];
        return _buildBidItem(bid);
      },
    );
  }
  
  Widget _buildBidItem(Bid bid) {
    final theme = Theme.of(context);
    final currencyFormat = NumberFormat.currency(
      locale: 'tr_TR',
      symbol: '₺',
      decimalDigits: 0,
    );
    final dateFormat = DateFormat('dd MMM yyyy HH:mm', 'tr_TR');
    
    final auction = bid.auction;
    
    // Default background color
    Color backgroundColor = theme.colorScheme.surface;
    Color borderColor = theme.colorScheme.onSurface.withOpacity(0.1);
    Color statusColor = AppTheme.textSecondaryColor;
    String statusText = 'Bilinmeyen Durum';
    IconData statusIcon = Icons.help_outline;
    
    if (auction != null) {
      if (auction.hasEnded) {
        if (bid.isHighestBid) {
          // Won auction
          statusColor = Colors.green;
          statusText = 'Kazandınız';
          statusIcon = Icons.emoji_events_outlined;
          borderColor = Colors.green.withOpacity(0.3);
          backgroundColor = Colors.green.withOpacity(0.05);
        } else {
          // Lost auction
          statusColor = Colors.red;
          statusText = 'Kaybettiniz';
          statusIcon = Icons.cancel_outlined;
          borderColor = Colors.red.withOpacity(0.2);
        }
      } else if (auction.isActive) {
        if (bid.isHighestBid) {
          // Highest bid in active auction
          statusColor = AppTheme.primaryColor;
          statusText = 'En Yüksek Teklif';
          statusIcon = Icons.star_outline;
          borderColor = AppTheme.primaryColor.withOpacity(0.3);
          backgroundColor = AppTheme.primaryColor.withOpacity(0.05);
        } else {
          // Not the highest bid in active auction
          statusColor = Colors.orange;
          statusText = 'Aktif';
          statusIcon = Icons.pending_outlined;
        }
      } else if (auction.isUpcoming) {
        statusColor = Colors.blue;
        statusText = 'Yaklaşan';
        statusIcon = Icons.upcoming_outlined;
      }
    }
    
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: borderColor),
      ),
      color: backgroundColor,
      child: InkWell(
        onTap: auction != null ? () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (ctx) => AuctionDetailScreen(
                auctionId: auction.id,
              ),
            ),
          );
        } : null,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (auction?.images != null && auction!.images.isNotEmpty)
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        image: DecorationImage(
                          image: NetworkImage(auction.images.first),
                          fit: BoxFit.cover,
                        ),
                      ),
                    )
                  else
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        color: theme.colorScheme.primary.withOpacity(0.1),
                      ),
                      child: Icon(
                        Icons.terrain_outlined,
                        color: AppTheme.primaryColor,
                        size: 30,
                      ),
                    ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          auction?.title ?? 'Arazi İhalesi',
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          auction?.location ?? 'Konum bilgisi yok',
                          style: TextStyle(
                            color: AppTheme.textSecondaryColor,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(
                              statusIcon,
                              size: 16,
                              color: statusColor,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              statusText,
                              style: TextStyle(
                                color: statusColor,
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Teklif Tutarı',
                        style: TextStyle(
                          color: AppTheme.textSecondaryColor,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        currencyFormat.format(bid.amount),
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 18,
                          color: bid.isHighestBid ? AppTheme.primaryColor : AppTheme.textColor,
                        ),
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        'Teklif Tarihi',
                        style: TextStyle(
                          color: AppTheme.textSecondaryColor,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        dateFormat.format(bid.createdAt),
                        style: TextStyle(
                          color: AppTheme.textColor,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
} 