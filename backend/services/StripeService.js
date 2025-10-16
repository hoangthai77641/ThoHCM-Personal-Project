const stripe = require('stripe');

class StripeService {
  constructor() {
    // Stripe configuration
    this.stripe = stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...');
    this.publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_...';
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    this.currency = 'vnd'; // Vietnamese Dong
  }

  /**
   * Tạo Payment Intent cho thanh toán thẻ
   */
  async createPaymentIntent(params) {
    const {
      amount,
      description,
      metadata = {}
    } = params;

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Stripe tính bằng cent
        currency: this.currency,
        description: description,
        metadata: {
          ...metadata,
          source: 'wallet_topup'
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Stripe create payment intent error:', error);
      throw error;
    }
  }

  /**
   * Tạo Checkout Session cho thanh toán redirect
   */
  async createCheckoutSession(params) {
    const {
      amount,
      description,
      success_url,
      cancel_url,
      metadata = {}
    } = params;

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: this.currency,
            product_data: {
              name: 'Nạp ví điện tử',
              description: description,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: success_url,
        cancel_url: cancel_url,
        metadata: {
          ...metadata,
          source: 'wallet_topup'
        },
      });

      return {
        checkout_url: session.url,
        session_id: session.id,
        payment_intent: session.payment_intent
      };
    } catch (error) {
      console.error('Stripe create checkout session error:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin Payment Intent
   */
  async getPaymentIntent(payment_intent_id) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(payment_intent_id);
      return paymentIntent;
    } catch (error) {
      console.error('Stripe get payment intent error:', error);
      throw error;
    }
  }

  /**
   * Xác thực webhook từ Stripe
   */
  verifyWebhook(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
      return event;
    } catch (error) {
      console.error('Stripe webhook verification error:', error);
      throw error;
    }
  }

  /**
   * Xử lý các loại event từ Stripe webhook
   */
  handleWebhookEvent(event) {
    const eventHandlers = {
      'payment_intent.succeeded': this.handlePaymentSuccess,
      'payment_intent.payment_failed': this.handlePaymentFailed,
      'checkout.session.completed': this.handleCheckoutCompleted,
      'checkout.session.expired': this.handleCheckoutExpired
    };

    const handler = eventHandlers[event.type];
    if (handler) {
      return handler(event.data.object);
    }

    console.log(`Unhandled Stripe event type: ${event.type}`);
    return null;
  }

  /**
   * Xử lý thanh toán successful
   */
  handlePaymentSuccess(paymentIntent) {
    console.log('💳 Stripe payment succeeded:', paymentIntent.id);
    return {
      success: true,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata
    };
  }

  /**
   * Xử lý thanh toán thất bại
   */
  handlePaymentFailed(paymentIntent) {
    console.log('❌ Stripe payment failed:', paymentIntent.id);
    return {
      success: false,
      payment_intent_id: paymentIntent.id,
      error: paymentIntent.last_payment_error?.message || 'Payment failed',
      metadata: paymentIntent.metadata
    };
  }

  /**
   * Xử lý checkout session hoàn thành
   */
  handleCheckoutCompleted(session) {
    console.log('✅ Stripe checkout completed:', session.id);
    return {
      success: true,
      session_id: session.id,
      payment_intent: session.payment_intent,
      amount_total: session.amount_total / 100,
      currency: session.currency,
      metadata: session.metadata
    };
  }

  /**
   * Xử lý checkout session hết hạn
   */
  handleCheckoutExpired(session) {
    console.log('⏰ Stripe checkout expired:', session.id);
    return {
      success: false,
      session_id: session.id,
      error: 'Checkout session expired',
      metadata: session.metadata
    };
  }

  /**
   * Parse status từ Stripe
   */
  getStatusMessage(status) {
    const messages = {
      'succeeded': 'Thanh toán successful',
      'processing': 'Đang xử lý thanh toán',
      'requires_payment_method': 'Cần phương thức thanh toán',
      'requires_confirmation': 'Cần xác receive thanh toán',
      'requires_action': 'Cần thao tác bổ sung',
      'canceled': 'Đã hủy thanh toán',
      'failed': 'Thanh toán thất bại'
    };

    return messages[status] || 'Trạng thái không xác định';
  }

  /**
   * Kiểm tra thanh toán successful
   */
  isSuccessTransaction(status) {
    return status === 'succeeded';
  }
}

module.exports = StripeService;