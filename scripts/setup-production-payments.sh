#!/bin/bash

# ThoHCM Production Setup Script
# Chuẩn bị môi trường production cho payment gateways

echo "🚀 ThoHCM Production Payment Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running in production environment
echo -e "\n📍 Checking environment..."

if [ "$NODE_ENV" != "production" ]; then
    print_warning "NODE_ENV is not set to 'production'"
    echo "Set NODE_ENV=production in your .env file"
fi

# Check required environment variables
echo -e "\n🔑 Checking environment variables..."

required_vars=(
    "VNP_TMN_CODE"
    "VNP_HASH_SECRET" 
    "STRIPE_SECRET_KEY"
    "STRIPE_PUBLISHABLE_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "CLIENT_URL"
    "SERVER_URL"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
        print_error "$var is not set"
    else
        # Check if it's still using sandbox/test values
        case $var in
            "VNP_TMN_CODE")
                if [[ "${!var}" == "VNPAYSANDBOX" ]]; then
                    print_warning "$var is using sandbox value"
                else
                    print_status "$var is configured"
                fi
                ;;
            "VNP_HASH_SECRET")
                if [[ "${!var}" == "SANDBOXHASHSECRET" ]]; then
                    print_warning "$var is using sandbox value"
                else
                    print_status "$var is configured"
                fi
                ;;
            "STRIPE_SECRET_KEY")
                if [[ "${!var}" == sk_test_* ]]; then
                    print_warning "$var is using test key"
                elif [[ "${!var}" == sk_live_* ]]; then
                    print_status "$var is using live key"
                else
                    print_error "$var format is invalid"
                fi
                ;;
            "STRIPE_PUBLISHABLE_KEY")
                if [[ "${!var}" == pk_test_* ]]; then
                    print_warning "$var is using test key"
                elif [[ "${!var}" == pk_live_* ]]; then
                    print_status "$var is using live key"
                else
                    print_error "$var format is invalid"
                fi
                ;;
            *)
                print_status "$var is set"
                ;;
        esac
    fi
done

# Check database indexes
echo -e "\n🗄️  Checking database indexes..."

# This would need to be run against your MongoDB
echo "Run these MongoDB commands to create required indexes:"
echo ""
echo "db.wallets.createIndex({ \"worker\": 1 }, { unique: true })"
echo "db.transactions.createIndex({ \"wallet\": 1, \"createdAt\": -1 })"
echo "db.transactions.createIndex({ \"paymentReference\": 1 })"
echo "db.transactions.createIndex({ \"status\": 1 })"

# Check HTTPS
echo -e "\n🔒 Checking HTTPS configuration..."

if [[ "$SERVER_URL" == https://* ]]; then
    print_status "SERVER_URL is using HTTPS"
else
    print_error "SERVER_URL must use HTTPS for production"
fi

if [[ "$CLIENT_URL" == https://* ]]; then
    print_status "CLIENT_URL is using HTTPS"
else
    print_error "CLIENT_URL must use HTTPS for production"
fi

# Webhook URL validation
echo -e "\n🔗 Validating webhook URLs..."

webhook_urls=(
    "$SERVER_URL/api/wallet/vnpay-return"
    "$SERVER_URL/api/wallet/vnpay-ipn"
    "$SERVER_URL/api/wallet/stripe-webhook"
    "$SERVER_URL/api/wallet/zalopay-callback"
)

for url in "${webhook_urls[@]}"; do
    echo "  • $url"
done

echo -e "\nMake sure these URLs are:"
echo "  1. Publicly accessible"
echo "  2. HTTPS enabled"
echo "  3. No authentication required"
echo "  4. Registered with payment gateways"

# Security checklist
echo -e "\n🛡️  Security checklist:"

security_items=(
    "Webhook signature verification enabled"
    "Rate limiting configured"
    "Input validation on all endpoints"
    "CORS properly configured"
    "Sensitive data not logged"
    "Error messages don't expose internals"
    "Database connection secured"
    "SSL certificates valid"
)

for item in "${security_items[@]}"; do
    echo "  [ ] $item"
done

# Generate production deployment commands
echo -e "\n🚀 Production deployment commands:"

cat << 'EOF'

# 1. Build and deploy backend
cd backend
npm install --production
npm run build  # if you have a build step
pm2 start ecosystem.config.js --env production

# 2. Build mobile app (if changes made)
cd ../mobile/worker_app  
flutter build apk --release
# or
flutter build appbundle --release

# 3. Deploy web frontend
cd ../../web
npm install --production
npm run build
# Deploy build/ to your web server

# 4. Update payment gateway webhook URLs
# VNPay: Login to merchant portal and update return URL
# Stripe: Dashboard > Webhooks > Add endpoint
# ZaloPay: Contact support to update callback URL

EOF

# Final summary
echo -e "\n📋 Summary:"

if [ ${#missing_vars[@]} -eq 0 ]; then
    print_status "All required environment variables are set"
else
    print_error "Missing ${#missing_vars[@]} environment variables"
    echo "Missing: ${missing_vars[*]}"
fi

echo -e "\n📚 Next steps:"
echo "1. Complete payment gateway account setup"
echo "2. Update environment variables with production values"  
echo "3. Setup monitoring and alerting"
echo "4. Run database index creation commands"
echo "5. Deploy to production environment"
echo "6. Test with small transactions"
echo "7. Monitor for 24h before full launch"

echo -e "\n✨ Good luck with your production deployment!"