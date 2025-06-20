import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:land_auction_app/models/auction.dart';
import 'package:land_auction_app/providers/auction_provider.dart';
import 'package:provider/provider.dart' as provider;
import 'package:intl/intl.dart';

class BidForm extends StatefulWidget {
  final Auction auction;
  
  const BidForm({
    super.key,
    required this.auction,
  });

  @override
  State<BidForm> createState() => _BidFormState();
}

class _BidFormState extends State<BidForm> {
  final _formKey = GlobalKey<FormState>();
  final _bidController = TextEditingController();
  bool _isSubmitting = false;
  String? _errorMessage;
  
  @override
  void initState() {
    super.initState();
    // Pre-fill with minimum bid amount
    _bidController.text = NumberFormat.currency(
      locale: 'tr_TR',
      symbol: '',
      decimalDigits: 0,
    ).format(widget.auction.minimumNextBid);
  }
  
  @override
  void didUpdateWidget(BidForm oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Update controller if auction changes
    if (oldWidget.auction.id != widget.auction.id ||
        oldWidget.auction.minimumNextBid != widget.auction.minimumNextBid) {
      _bidController.text = NumberFormat.currency(
        locale: 'tr_TR',
        symbol: '',
        decimalDigits: 0,
      ).format(widget.auction.minimumNextBid);
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
    
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Teklif Ver',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          
          // Error message
          if (_errorMessage != null)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: theme.colorScheme.error.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: theme.colorScheme.error.withOpacity(0.3),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.error_outline,
                    color: theme.colorScheme.error,
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _errorMessage!,
                      style: TextStyle(
                        color: theme.colorScheme.error,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          
          // Minimum bid info
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withOpacity(0.05),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.info_outline,
                  color: theme.colorScheme.primary,
                  size: 18,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Minimum teklif tutarı: ${NumberFormat.currency(
                      locale: 'tr_TR',
                      symbol: '₺',
                      decimalDigits: 0,
                    ).format(widget.auction.minimumNextBid)}',
                    style: TextStyle(
                      color: theme.colorScheme.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Bid input field
          TextFormField(
            controller: _bidController,
            decoration: InputDecoration(
              labelText: 'Teklif Tutarı',
              prefixText: '₺ ',
              border: const OutlineInputBorder(),
              enabled: !_isSubmitting,
            ),
            keyboardType: TextInputType.number,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              // Custom formatter for currency
              TextInputFormatter.withFunction((oldValue, newValue) {
                if (newValue.text.isEmpty) {
                  return newValue;
                }
                final number = int.tryParse(newValue.text.replaceAll('.', ''));
                if (number != null) {
                  final formattedValue = NumberFormat.decimalPattern('tr_TR').format(number);
                  return TextEditingValue(
                    text: formattedValue,
                    selection: TextSelection.collapsed(offset: formattedValue.length),
                  );
                }
                return oldValue;
              }),
            ],
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Lütfen bir tutar girin';
              }
              
              final amount = double.tryParse(value.replaceAll('.', ''));
              if (amount == null) {
                return 'Geçerli bir tutar girin';
              }
              
              if (amount < widget.auction.minimumNextBid) {
                return 'Teklif minimum tutardan az olamaz';
              }
              
              return null;
            },
          ),
          const SizedBox(height: 16),
          
          // Submit button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : _submitBid,
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.colorScheme.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: _isSubmitting
                  ? SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : const Text(
                      'TEKLİF VER',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
  
  void _submitBid() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    
    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });
    
    try {
      // Parse bid amount
      final String bidText = _bidController.text.replaceAll('.', '');
      final double bidAmount = double.parse(bidText);
      
      // Submit bid
      final auctionProvider = provider.Provider.of<AuctionProvider>(context, listen: false);
      final result = await auctionProvider.placeBid(widget.auction.id, bidAmount);
      
      if (result) {
        // Success - reset form
        _bidController.text = NumberFormat.currency(
          locale: 'tr_TR',
          symbol: '',
          decimalDigits: 0,
        ).format(widget.auction.minimumNextBid + widget.auction.minIncrement);
        
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Teklifiniz başarıyla kaydedildi.'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        setState(() {
          _errorMessage = 'Teklif verilemedi. Lütfen tekrar deneyin.';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Bir hata oluştu: $e';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }
} 