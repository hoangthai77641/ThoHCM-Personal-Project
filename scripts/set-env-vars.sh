# Script to set Cloud Run environment variables after deployment

# Wait for deployment to complete, then run:
gcloud run services update thohcm-backend --region=asia-southeast1 \
  --set-env-vars MONGODB_URI="mongodb+srv://thohcm_admin:thohcmadmin@thohcm-cluster.bxqkpw6.mongodb.net/thohcm" \
  --set-env-vars JWT_SECRET="your-strong-jwt-secret-here" \
  --set-env-vars ALLOWED_ORIGINS="https://thohcm-frontend.web.app,https://thohcm-application.web.app" \
  --set-env-vars GCS_BUCKET_NAME="thohcm-storage" \
  --set-env-vars NODE_ENV="production"

# Get the service URL
gcloud run services describe thohcm-backend --region=asia-southeast1 --format="value(status.url)"