// import crypto from 'crypto';

class ValletPaymentService {
  constructor() {
    // Use HTTPS for the proxy URL
    // Assuming standard port 443, so no port needed unless configured otherwise
    this.proxyUrl = 'https://srv759491.hstgr.cloud/api/payment/create'; 
    // If HTTPS is on a non-standard port (e.g., 3001 still): 
    // this.proxyUrl = 'https://srv759491.hstgr.cloud:3001'; 
  }

  async createPaymentLink(params) {
    try {
      // Prepare payment parameters according to Vallet's documentation
      const paymentData = {
        orderId: params.orderId,
        amount: params.amount,
        productName: 'Depozito Ödemesi',
        productData: JSON.stringify([{
          productName: 'Depozito Ödemesi',
          productPrice: params.amount,
          productType: 'DIJITAL_URUN'
        }]),
        productType: 'DIJITAL_URUN',
        productsTotalPrice: params.amount,
        orderPrice: params.amount,
        currency: 'TRY',
        locale: 'tr',
        buyerName: params.buyerName,
        buyerSurName: params.buyerSurName,
        buyerGsmNo: params.buyerGsmNo,
        buyerMail: params.buyerMail,
        buyerIp: params.buyerIp,
        callbackOkUrl: params.callbackOkUrl,
        callbackFailUrl: params.callbackFailUrl
      };

      // Make request to our proxy server (now using HTTPS)
      const response = await fetch(`${this.proxyUrl}`, { // Removed endpoint path duplication
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(data.errorMessage || data.details || 'Ödeme sayfası oluşturulamadı');
      }

      // Store payment info in localStorage before redirecting
      localStorage.setItem('pendingPayment', JSON.stringify({
        orderId: params.orderId,
        auctionId: params.auctionId,
        amount: params.amount,
        timestamp: Date.now()
      }));

      // If we get a payment page URL, redirect to it
      if (data.payment_page_url) {
        window.location.href = data.payment_page_url;
        return { status: 'success' };
      } else {
        throw new Error('Ödeme sayfası URL adresi alınamadı');
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      throw error;
    }
  }

  async verifyCallback(callbackData) {
    // We might want to move this to the proxy server as well
    return true; // For now, just return true and handle verification on the proxy
  }
}

export default new ValletPaymentService(); 