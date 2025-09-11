# 🔒 Critical Security Requirements for Production

## ⚠️ IMMEDIATE ACTIONS REQUIRED

### 1. Secret Rotation (URGENT)
- [ ] **Rotate ALL API keys and webhook secrets immediately**
- [ ] Remove `.env` from version control: `git rm --cached .env`
- [ ] Add `.env` to `.gitignore`
- [ ] Use environment variables or Replit Secrets for production

### 2. Webhook Security Enhancements

#### Current Status: ⚠️ Partially Secure
- ✅ Raw body signature verification 
- ✅ Constant-time comparison
- ✅ Multi-provider support (basic)
- ❌ Missing replay protection
- ❌ Missing idempotency 
- ❌ Provider-specific signature parsing

#### Production Requirements:

**Replay Protection:**
```javascript
// Add timestamp validation (5-minute window)
const timestamp = extractTimestamp(signature) // e.g., from "t=1234567890,v1=abc123"
const now = Math.floor(Date.now() / 1000)
if (Math.abs(now - timestamp) > 300) { // 5 minutes
  return res.status(401).json({ error: 'Request too old' })
}
```

**Idempotency:**
```javascript
// Store processed webhook IDs in database
const eventId = webhookData.id || `${timestamp}_${webhookData.reference}`
const existing = await ProcessedWebhook.findOne({ eventId })
if (existing) {
  return res.status(200).json({ message: 'Already processed' })
}
```

**Provider-Specific Parsing:**
```javascript
// For Tap Payments: "t=timestamp,v1=signature"
if (signature.includes('t=')) {
  const parts = signature.split(',')
  const timestamp = parts.find(p => p.startsWith('t=')).slice(2)
  const sig = parts.find(p => p.startsWith('v1=')).slice(3)
  const payload = `${timestamp}.${rawBody}`
  // Then verify HMAC of payload
}
```

### 3. Environment Variables Setup
```bash
# Required for production
HOLOBANK_API_KEY=your-new-api-key
HOLOBANK_WEBHOOK_SECRET=your-new-webhook-secret
TAP_WEBHOOK_SECRET=your-tap-secret-if-applicable
```

### 4. Database Schema for Replay Protection
```javascript
// Add this model for webhook deduplication
const ProcessedWebhookSchema = new Schema({
  eventId: { type: String, required: true, unique: true },
  provider: { type: String, required: true },
  processedAt: { type: Date, default: Date.now, expires: '7d' }
})
```

## Current Implementation Status

✅ **Working:** Basic webhook reception, signature verification, transaction storage
⚠️ **Needs Production Hardening:** Replay protection, idempotency, proper provider parsing
❌ **Critical Security Gap:** Secrets in repository (rotate immediately)

## Testing Webhook Integration

### 1. With Proper Signature (Example for testing)
```bash
# Generate proper HMAC signature for testing
echo -n '{"test":"webhook"}' | openssl dgst -sha256 -hmac "your-webhook-secret" -binary | base64
```

### 2. Webhook Endpoint
- **URL:** `POST /api/v1/holobank/webhook`
- **Headers:** `X-Holobank-Signature` or `X-Tap-Signature`
- **Body:** Raw JSON with user._id as reference

### 3. Expected Events
- `kyc.status_updated` - KYC verification results
- `payment.status_updated` - Payment completion
- `transaction.completed` - Transaction processing
- `account.balance_updated` - Balance changes

## Next Steps for Production

1. **Immediate:** Rotate secrets and remove from repo
2. **Phase 1:** Add replay protection and idempotency
3. **Phase 2:** Implement provider-specific signature schemes
4. **Phase 3:** Add comprehensive logging and monitoring

---
*This implementation provides a solid foundation but requires the above security enhancements for production use.*