import 'package:flutter/material.dart';
import 'package:land_auction_app/models/auction.dart';
import 'package:provider/provider.dart' as provider;
import 'package:land_auction_app/providers/auction_provider.dart';
import 'package:land_auction_app/services/auth_service.dart';
import 'package:intl/intl.dart';
import 'package:flutter/services.dart';

class PlaceBidButton extends StatefulWidget {
  final Auction auction;
  final VoidCallback? onBidPlaced;

  const PlaceBidButton({
    super.key,
    required this.auction,
    this.onBidPlaced,
  });

  @override
  State<PlaceBidButton> createState() => _PlaceBidButtonState();
}

class _PlaceBidButtonState extends State<PlaceBidButton> {
  final TextEditingController _bidController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    // Pre-fill with minimum bid amount
    _bidController.text = widget.auction.minimumNextBid.toString();
  }

  @override
  void didUpdateWidget(PlaceBidButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.auction.minimumNextBid != widget.auction.minimumNextBid) {
      _bidController.text = widget.auction.minimumNextBid.toString();
    }
  }

  @override
  void dispose() {
    _bidController.dispose();
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

    // Check authentication status
    final authService =
        provider.Provider.of<AuthService>(context, listen: false);
    final isLoggedIn = authService.currentUser != null;

    if (!isLoggedIn) {
      // Show login prompt if not logged in
      return ElevatedButton(
        onPressed: () {
          Navigator.of(context).pushNamed('/login');
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: theme.colorScheme.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
        child: const Text(
          'TEKLİF VERMEK İÇİN GİRİŞ YAPIN',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      );
    }

    // Show input field directly in the bottom bar
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Minimum bid info
              Row(
                children: [
                  Icon(
                    Icons.info_outline,
                    color: theme.colorScheme.primary,
                    size: 16,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'Minimum teklif: ${currencyFormat.format(widget.auction.minimumNextBid)}',
                    style: TextStyle(
                      color: theme.colorScheme.primary,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Bid input field
              TextField(
                controller: _bidController,
                decoration: InputDecoration(
                  labelText: 'Teklif Tutarı',
                  prefixText: '₺ ',
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  enabled: !_isSubmitting,
                ),
                keyboardType: TextInputType.number,
                style: const TextStyle(fontSize: 16),
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  // Custom formatter for currency
                  TextInputFormatter.withFunction((oldValue, newValue) {
                    if (newValue.text.isEmpty) {
                      return newValue;
                    }
                    final number =
                        int.tryParse(newValue.text.replaceAll('.', ''));
                    if (number != null) {
                      final formattedValue =
                          NumberFormat.decimalPattern('tr_TR').format(number);
                      return TextEditingValue(
                        text: formattedValue,
                        selection: TextSelection.collapsed(
                            offset: formattedValue.length),
                      );
                    }
                    return oldValue;
                  }),
                ],
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : _submitBid,
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.colorScheme.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 18),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.gavel),
                        SizedBox(width: 8),
                        Text(
                          'TEKLİF VER',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _submitBid() async {
    // Validate bid amount
    final bidAmount = double.tryParse(_bidController.text.replaceAll(',', '.'));
    if (bidAmount == null || bidAmount < widget.auction.minimumNextBid) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Teklifiniz minimum tutardan az olamaz: ${NumberFormat.currency(
              locale: 'tr_TR',
              symbol: '₺',
              decimalDigits: 0,
            ).format(widget.auction.minimumNextBid)}',
          ),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final auctionProvider =
          provider.Provider.of<AuctionProvider>(context, listen: false);
      final success =
          await auctionProvider.placeBid(widget.auction.id, bidAmount);

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Teklifiniz başarıyla kaydedildi'),
            backgroundColor: Colors.green,
          ),
        );

        if (widget.onBidPlaced != null) {
          widget.onBidPlaced!();
        }
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Teklif verilemedi. Lütfen tekrar deneyin.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Bir hata oluştu: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }
}
