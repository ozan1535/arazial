import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart' as provider;
import 'package:land_auction_app/models/auction.dart';
import 'package:land_auction_app/providers/auction_provider.dart';
import 'package:land_auction_app/providers/filter_provider.dart';
import 'package:land_auction_app/screens/auction_detail_screen.dart';
import 'package:land_auction_app/widgets/auction_card.dart';
import 'package:land_auction_app/widgets/app_drawer.dart';
import 'package:land_auction_app/theme/app_theme.dart';
import 'dart:ui';
import 'package:intl/intl.dart';
import 'package:land_auction_app/widgets/app_logo.dart';
import 'package:land_auction_app/widgets/city_dropdown.dart';
import 'dart:async';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  bool _isInit = true;
  late TabController _tabController;
  Timer? _loadingTimer;
  bool _showTopLoadingIndicator = false;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(_handleTabChange);
    
    // Set status bar appearance for a more premium feel
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
      ),
    );
  }
  
  void _handleTabChange() {
    if (_tabController.indexIsChanging) {
      return;
    }
    
    // Refresh data when switching tabs
    _loadAuctions(forceRefresh: true);
  }
  
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_isInit) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _loadAuctions(forceRefresh: true);
      });
      _isInit = false;
    }
  }
  
  Future<void> _loadAuctions({bool forceRefresh = false}) async {
    if (!mounted) return;
    
    // Start a timer that will hide the loading indicator after 5 seconds
    // no matter what happens with the actual loading
    _loadingTimer?.cancel();
    setState(() {
      _showTopLoadingIndicator = true;
    });
    
    _loadingTimer = Timer(const Duration(seconds: 5), () {
      if (mounted && _showTopLoadingIndicator) {
        setState(() {
          _showTopLoadingIndicator = false;
        });
      }
    });
    
    await provider.Provider.of<AuctionProvider>(context, listen: false).fetchAuctions(forceRefresh: forceRefresh);
    
    // If loading finishes before the timer, hide the indicator right away
    if (mounted && _showTopLoadingIndicator) {
      setState(() {
        _showTopLoadingIndicator = false;
      });
    }
  }
  
  Future<void> _onRefresh() async {
    await provider.Provider.of<AuctionProvider>(context, listen: false).fetchAuctions(forceRefresh: true);
  }
  
  @override
  void dispose() {
    _tabController.removeListener(_handleTabChange);
    _tabController.dispose();
    _loadingTimer?.cancel();
    super.dispose();
  }

  Widget _buildLogo() {
    return const AppLogoHorizontal(
      size: 36,
      showText: true,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      appBar: AppBar(
        centerTitle: true,
        elevation: 2,
        shadowColor: Colors.black.withOpacity(0.05),
        backgroundColor: theme.colorScheme.surface,
        title: _buildLogo(),
        toolbarHeight: 70,
        leading: Builder(
          builder: (context) => IconButton(
            icon: Icon(
              Icons.menu_rounded,
              size: 26,
              color: theme.colorScheme.primary,
            ),
            onPressed: () {
              Scaffold.of(context).openDrawer();
            },
          ),
        ),
        actions: [],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(54),
          child: Container(
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: theme.colorScheme.onBackground.withOpacity(0.08),
                  width: 1,
                ),
              ),
            ),
            child: TabBar(
              controller: _tabController,
              labelStyle: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 15,
                letterSpacing: 0.3,
              ),
              unselectedLabelStyle: const TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 15,
                letterSpacing: 0.3,
              ),
              labelColor: theme.colorScheme.primary,
              unselectedLabelColor: theme.colorScheme.onBackground.withOpacity(0.6),
              indicatorColor: theme.colorScheme.primary,
              indicatorWeight: 3,
              indicatorSize: TabBarIndicatorSize.label,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              tabs: [
                // Active tab with counter badge
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Flexible(child: Tab(text: 'Aktif')),
                    provider.Consumer<AuctionProvider>(
                      builder: (context, provider, _) {
                        if (provider.activeAuctions.isEmpty) return const SizedBox.shrink();
                        
                        return Container(
                          margin: const EdgeInsets.only(left: 2),
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primary,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            provider.activeAuctions.length.toString(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
                // Açık Arttırma tab 
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Flexible(
                      child: Tab(
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.gavel, size: 12),
                            SizedBox(width: 2),
                            Flexible(
                              child: Text(
                                'Açık Arttırma',
                                overflow: TextOverflow.ellipsis,
                                maxLines: 1,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                // Pazarlık tab
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Flexible(
                      child: Tab(
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.handshake_outlined, size: 12),
                            SizedBox(width: 2),
                            Flexible(
                              child: Text(
                                'Pazarlık',
                                overflow: TextOverflow.ellipsis,
                                maxLines: 1,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
      drawer: const AppDrawer(),
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        color: theme.colorScheme.primary,
        backgroundColor: theme.colorScheme.surface,
        displacement: 40,
        edgeOffset: 8,
        strokeWidth: 2.5,
        child: provider.Consumer<AuctionProvider>(
          builder: (context, auctionProvider, child) {
            // If loading for less than 3 seconds, show premium loading indicator
            if (auctionProvider.isLoading && auctionProvider.auctions.isEmpty) {
              // Create a future that resolves after 3 seconds
              Future.delayed(const Duration(seconds: 3), () {
                if (mounted && auctionProvider.isLoading) {
                  // Force load from cache
                  provider.Provider.of<AuctionProvider>(context, listen: false)
                    .loadFromCache();
                  
                  setState(() {
                    // This will trigger a rebuild
                  });
                }
              });
              
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Use a business-themed loading animation
                    Container(
                      width: 60,
                      height: 60,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surface,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: CircularProgressIndicator(
                        color: theme.colorScheme.primary,
                        strokeWidth: 3,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Arazi İhaleleri Yükleniyor',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surface,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: theme.colorScheme.primary.withOpacity(0.1),
                        ),
                      ),
                      child: Text(
                        'Lütfen bekleyiniz...',
                        style: TextStyle(
                          color: theme.colorScheme.onSurface.withOpacity(0.7),
                          fontSize: 14,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }
            
            if (auctionProvider.hasError && auctionProvider.auctions.isEmpty) {
              return Center(
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 32),
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.warning_amber_rounded,
                        size: 56,
                        color: theme.colorScheme.error,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Bağlantı Hatası',
                        style: theme.textTheme.titleLarge?.copyWith(
                          color: theme.colorScheme.error,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'İhaleler yüklenirken bir sorun oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.',
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurface.withOpacity(0.7),
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: () => _loadAuctions(forceRefresh: true),
                        icon: const Icon(Icons.refresh_rounded),
                        label: const Text('Tekrar Dene'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: theme.colorScheme.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }
            
            return Stack(
              children: [
                Column(
                  children: [
                    // Add city filter bar here
                    provider.Consumer<FilterProvider>(
                      builder: (context, filterProvider, _) {
                        return Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.surface,
                            border: Border(
                              bottom: BorderSide(
                                color: theme.colorScheme.onBackground.withOpacity(0.05),
                                width: 1,
                              ),
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.location_city_outlined,
                                size: 18,
                                color: theme.colorScheme.primary,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: GestureDetector(
                                  onTap: () {
                                    _showCityFilterDialog(context, filterProvider);
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                    decoration: BoxDecoration(
                                      color: theme.colorScheme.surface,
                                      border: Border.all(
                                        color: theme.colorScheme.onBackground.withOpacity(0.15),
                                      ),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            filterProvider.selectedCity ?? 'Şehir Seçin',
                                            style: TextStyle(
                                              color: filterProvider.selectedCity != null
                                                  ? theme.colorScheme.primary
                                                  : theme.colorScheme.onBackground.withOpacity(0.7),
                                              fontWeight: filterProvider.selectedCity != null
                                                  ? FontWeight.w600
                                                  : FontWeight.normal,
                                            ),
                                          ),
                                        ),
                                        Icon(
                                          Icons.arrow_drop_down,
                                          color: theme.colorScheme.onBackground.withOpacity(0.7),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              if (filterProvider.selectedCity != null)
                                Padding(
                                  padding: const EdgeInsets.only(left: 8),
                                  child: IconButton(
                                    icon: Icon(
                                      Icons.close,
                                      size: 20,
                                      color: theme.colorScheme.onBackground.withOpacity(0.7),
                                    ),
                                    onPressed: filterProvider.clearCity,
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(
                                      minWidth: 32,
                                      minHeight: 32,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        );
                      },
                    ),
                    Expanded(
                      child: TabBarView(
                        controller: _tabController,
                        children: [
                          _buildAuctionsList(auctionProvider.activeAuctions, 'active'),
                          _buildAuctionsList(auctionProvider.auctions.where((a) => a.isAuctionType).toList(), 'auction'),
                          _buildAuctionsList(auctionProvider.auctions.where((a) => a.isOfferType).toList(), 'offer'),
                        ],
                      ),
                    ),
                  ],
                ),
                // Elegant loading indicator overlay
                if (_showTopLoadingIndicator)
                  Positioned(
                    top: 12,
                    right: 0,
                    left: 0,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surface,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.08),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                          border: Border.all(
                            color: theme.colorScheme.primary.withOpacity(0.1),
                            width: 1,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                color: theme.colorScheme.primary,
                                strokeWidth: 2,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Text(
                              'Veriler güncelleniyor',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                                color: theme.colorScheme.primary,
                                letterSpacing: 0.2,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
      // Floating action button for quick refresh
      floatingActionButton: provider.Consumer<AuctionProvider>(
        builder: (context, auctionProvider, _) {
          // Only show when we have data loaded
          if (auctionProvider.isLoading || auctionProvider.auctions.isEmpty) {
            return const SizedBox.shrink();
          }
          
          return FloatingActionButton(
            onPressed: () => _loadAuctions(forceRefresh: true),
            backgroundColor: theme.colorScheme.primary,
            foregroundColor: Colors.white,
            elevation: 4,
            tooltip: 'Yenile',
            child: const Icon(Icons.refresh_rounded),
          );
        },
      ),
    );
  }
  
  Widget _buildAuctionsList(List<Auction> auctions, String type) {
    final theme = Theme.of(context);
    
    // Apply city filter
    final filterProvider = provider.Provider.of<FilterProvider>(context);
    final filteredAuctions = filterProvider.filterAuctions(auctions);
    
    if (filteredAuctions.isEmpty) {
      // More business-like empty state with appropriate messaging
      return Center(
        child: Container(
          padding: const EdgeInsets.all(24),
          margin: const EdgeInsets.symmetric(horizontal: 32),
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.02),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
            border: Border.all(
              color: theme.colorScheme.primary.withOpacity(0.1),
              width: 1,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Different icons for different tab types
              Icon(
                type == 'active' 
                  ? Icons.local_fire_department_rounded
                  : type == 'auction' 
                    ? Icons.gavel_rounded
                    : Icons.handshake_outlined,
                size: 56,
                color: type == 'active' 
                  ? theme.colorScheme.primary.withOpacity(0.3)
                  : type == 'auction'
                    ? theme.colorScheme.secondary.withOpacity(0.3)
                    : Colors.deepPurple.withOpacity(0.3),
              ),
              const SizedBox(height: 16),
              Text(
                filterProvider.selectedCity != null
                  ? '${filterProvider.selectedCity} için ${type == 'active' 
                      ? 'Aktif İlan Bulunamadı'
                      : type == 'auction'
                        ? 'Açık Arttırma Bulunamadı'
                        : 'Pazarlık İlanı Bulunamadı'}'
                  : type == 'active' 
                    ? 'Aktif İlan Bulunamadı'
                    : type == 'auction'
                      ? 'Açık Arttırma Bulunamadı'
                      : 'Pazarlık İlanı Bulunamadı',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface.withOpacity(0.7),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                filterProvider.selectedCity != null
                  ? 'Seçili şehirde hiçbir ilan bulunamadı.'
                  : type == 'active' 
                    ? 'Şu anda aktif bir ilan bulunmamaktadır.'
                    : type == 'auction'
                      ? 'Açık arttırma tipi ilan bulunamadı.'
                      : 'Pazarlıklı ilan bulunamadı.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurface.withOpacity(0.5),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              // Only show refresh button on development
              OutlinedButton.icon(
                onPressed: () => _loadAuctions(forceRefresh: true),
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Yenile'),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: theme.colorScheme.primary),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }
    
    return Scrollbar(
      child: RefreshIndicator(
        onRefresh: _onRefresh,
        color: theme.colorScheme.primary,
        backgroundColor: theme.colorScheme.surface,
        child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: filteredAuctions.length,
          itemBuilder: (context, index) {
            final auction = filteredAuctions[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: AuctionCard(
                auction: auction,
                onTap: () => _openAuctionDetail(auction.id),
              ),
            );
          },
        ),
      ),
    );
  }
  
  void _openAuctionDetail(String auctionId) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (ctx) => AuctionDetailScreen(
          auctionId: auctionId,
        ),
      ),
    );
  }
  
  Widget _buildAuctionItem(BuildContext ctx, int i) {
    final auctionProvider = provider.Provider.of<AuctionProvider>(context, listen: false);
    final List<Auction> auctionsList;
    
    switch (_tabController.index) {
      case 0: // Aktif
        auctionsList = auctionProvider.activeAuctions;
        break;
      case 1: // Açık Arttırma
        auctionsList = auctionProvider.auctions.where((a) => a.isAuctionType).toList();
        break;
      case 2: // Pazarlık
        auctionsList = auctionProvider.auctions.where((a) => a.isOfferType).toList();
        break;
      default:
        auctionsList = auctionProvider.activeAuctions;
    }
    
    if (i >= auctionsList.length) return const SizedBox.shrink();
    
    return AuctionCard(
      auction: auctionsList[i],
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (ctx) => AuctionDetailScreen(
              auctionId: auctionsList[i].id,
            ),
          ),
        );
      },
    );
  }

  void _showCityFilterDialog(BuildContext context, FilterProvider filterProvider) {
    final List<String> turkishCities = [
      'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin',
      'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur',
      'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan',
      'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
      'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale', 'Kırklareli', 'Kırşehir',
      'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş',
      'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas',
      'Şanlıurfa', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
    ];

    // Keep track of filtered cities
    List<String> filteredCities = List.from(turkishCities);
    String searchQuery = '';

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: Row(
                children: [
                  const Icon(Icons.location_city_outlined),
                  const SizedBox(width: 8),
                  const Text('Şehir Seçin'),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(
                      minWidth: 32,
                      minHeight: 32,
                    ),
                  ),
                ],
              ),
              contentPadding: const EdgeInsets.fromLTRB(24, 20, 24, 24),
              content: Container(
                width: double.maxFinite,
                constraints: const BoxConstraints(
                  maxHeight: 400,
                  maxWidth: 400,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      decoration: InputDecoration(
                        hintText: 'Şehir ara...',
                        prefixIcon: const Icon(Icons.search),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      onChanged: (value) {
                        setState(() {
                          searchQuery = value;
                          if (value.isEmpty) {
                            filteredCities = List.from(turkishCities);
                          } else {
                            filteredCities = turkishCities
                                .where((city) => city.toLowerCase().contains(value.toLowerCase()))
                                .toList();
                          }
                        });
                      },
                    ),
                    const SizedBox(height: 12),
                    if (filterProvider.selectedCity != null) 
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          children: [
                            const Text('Seçili: '),
                            Chip(
                              label: Text(filterProvider.selectedCity!),
                              onDeleted: () {
                                filterProvider.clearCity();
                                Navigator.of(context).pop();
                              },
                            ),
                          ],
                        ),
                      ),
                    Expanded(
                      child: ListView.builder(
                        shrinkWrap: true,
                        itemCount: filteredCities.length,
                        itemBuilder: (context, index) {
                          final city = filteredCities[index];
                          final isSelected = filterProvider.selectedCity == city;
                          
                          return ListTile(
                            dense: true,
                            title: Text(city),
                            selected: isSelected,
                            selectedTileColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                            selectedColor: Theme.of(context).colorScheme.primary,
                            leading: isSelected ? const Icon(Icons.check) : null,
                            onTap: () {
                              filterProvider.setSelectedCity(city);
                              Navigator.of(context).pop();
                            },
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    filterProvider.clearCity();
                    Navigator.of(context).pop();
                  },
                  child: const Text('Tümü'),
                ),
                ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Kapat'),
                ),
              ],
            );
          },
        );
      },
    );
  }
}