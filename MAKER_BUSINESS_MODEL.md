# Maker Business Model & Implementation Plan

## 💰 Payment Model

### Commission Structure
- **Formula**: `max(1 GEL, 10% of product price)` per product
- **Payment Timing**: After delivery confirmation
- **Method**: Manual payments initially, automated later
- **Example**:
  - Product: 5 GEL → Commission: 1 GEL (10% = 0.5 GEL, so 1 GEL applies)
  - Product: 20 GEL → Commission: 2 GEL (10% = 2 GEL)
  - Product: 50 GEL → Commission: 5 GEL (10% = 5 GEL)

### Implementation Notes
- Track commission per order item
- Calculate maker payout: `(product_price × quantity) - (commission × quantity)`
- Store payment status: `pending`, `paid`, `disputed`
- Payment history/ledger for each maker

---

## ✅ Quality Assurance System

### Product Review Process
- **All products**: Admin review required before going live
- **Status Flow**: `draft` → `pending_review` → `approved` → `live` OR `rejected`
- **Review Criteria**: Quality, accuracy, completeness

### User Rating System
- **Rating Scale**: 1-5 stars (or thumbs up/down)
- **Review Requirements**: Optional text, required rating
- **Review Window**: After order delivered (e.g., 7-30 days)

### Disqualification Rules
- **Trigger**: 2 bad reviews (rating ≤ 2/5 or "unsatisfied")
- **Actions**:
  1. Unsatisfied customers get:
     - Replacement product (from you directly) OR
     - Full refund
  2. Maker gets:
     - Immediate disqualification
     - All pending products set to `rejected`
     - Pending payments held (for refunds)
     - Account status: `disqualified`

### Edge Cases to Consider
- **Review Disputes**: What if maker disputes a review? Appeal process?
- **Review Timing**: Can customers review after refund? (Probably yes, for transparency)
- **Multiple Orders**: 2 bad reviews from same customer? (Count as 1 or 2?)
- **Review Window**: How long after delivery can they review? (30 days?)
- **Maker Response**: Can makers respond to reviews publicly?

---

## 🎯 Strict Maker Approval Process

### Application Requirements
1. **Machine Quality**
   - Only approve quality machines (specific brands/models?)
   - Machine age limits? (e.g., < 5 years old)
   - Machine condition verification

2. **Filament Brands**
   - Ask about filament brands they use
   - Preferred brands list? (e.g., Prusament, Polymaker, etc.)
   - Reject if using low-quality filaments?

3. **Portfolio Quality**
   - High-quality example photos required
   - Multiple angles, good lighting
   - Show attention to detail

4. **Application Tone**
   - Emphasize: "This is a professional platform, not a playground"
   - Clear expectations about quality standards
   - Serious business commitment required

### Application Questions (Enhanced)
```
1. What do you want to sell?
2. What machines do you own? (Brand, model, year)
3. How many machines do you have?
4. How old are your machines? (Years)
5. What filament brands do you use? (List all)
6. Location (City)
7. Portfolio images (3-5 examples of your best work)
8. Years of 3D printing experience
9. Production capacity (items per week/month)
10. Why do you want to join Makers Hub?
11. Do you understand our quality standards? (Yes/No checkbox)
12. Do you agree to our terms? (Required acceptance)
```

### Approval Criteria
- ✅ Quality machines (specific list?)
- ✅ Good filament brands
- ✅ Strong portfolio
- ✅ Professional attitude
- ✅ Realistic production capacity
- ✅ Location verification (if needed)

---

## 📋 Implementation Checklist

### Phase 1: Database Schema Updates

#### Profile Model - Add Maker Fields
```javascript
{
  role: { 
    type: String, 
    enum: ['customer', 'maker', 'admin'], 
    default: 'customer' 
  },
  makerStatus: { 
    type: String, 
    enum: ['none', 'pending', 'approved', 'rejected', 'disqualified'], 
    default: 'none' 
  },
  makerApplicationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MakerApplication' 
  },
  makerProfile: {
    businessName: String,
    location: String,
    machines: [{
      brand: String,
      model: String,
      year: Number,
      age: Number
    }],
    filamentBrands: [String],
    experience: Number, // years
    productionCapacity: String,
    portfolio: [String], // image URLs
    bio: String,
    verified: { type: Boolean, default: false },
    joinedDate: Date,
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      badReviews: { type: Number, default: 0 } // reviews ≤ 2/5
    }
  },
  makerPayout: {
    pending: { type: Number, default: 0 }, // GEL
    paid: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  }
}
```

#### MakerApplication Model
```javascript
{
  userId: { type: String, required: true, ref: 'Profile' },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  answers: {
    whatToSell: String,
    machines: [{
      brand: String,
      model: String,
      year: Number,
      age: Number
    }],
    machineCount: Number,
    filamentBrands: [String],
    location: String,
    experience: Number,
    productionCapacity: String,
    whyJoin: String
  },
  portfolioImages: [String],
  termsAccepted: { type: Boolean, default: false },
  submittedAt: Date,
  reviewedAt: Date,
  reviewedBy: String, // admin userId
  rejectionReason: String,
  notes: String
}
```

#### MarketplaceItem Model - Add Maker & Review Fields
```javascript
{
  // ... existing fields ...
  makerId: { type: String, ref: 'Profile' },
  makerName: String,
  status: { 
    type: String, 
    enum: ['draft', 'pending_review', 'approved', 'rejected', 'live'], 
    default: 'draft' 
  },
  reviewedAt: Date,
  reviewedBy: String, // admin userId
  rejectionReason: String,
  commission: { 
    type: Number, 
    default: 0 
  } // calculated commission per unit
}
```

#### Order Model - Add Maker & Commission Fields
```javascript
{
  // ... existing fields ...
  items: [{
    // ... existing item fields ...
    makerId: String,
    makerName: String,
    commission: Number, // commission per unit
    makerPayout: Number, // (unitPrice - commission) × quantity
  }],
  makerPayments: [{
    makerId: String,
    makerName: String,
    amount: Number,
    commission: Number,
    status: { 
      type: String, 
      enum: ['pending', 'paid', 'held', 'refunded'], 
      default: 'pending' 
    },
    paidAt: Date,
    paidBy: String, // admin userId
    paymentMethod: String, // e.g., 'bank_transfer', 'paypal'
    transactionId: String // for tracking
  }],
  delivery: {
    code: { type: String, unique: true, sparse: true }, // Unique delivery code
    codeGeneratedAt: Date,
    codeUsed: { type: Boolean, default: false },
    codeUsedAt: Date,
    makerConfirmed: { type: Boolean, default: false },
    makerConfirmedAt: Date,
    makerId: String, // Maker who confirmed delivery
    customerConfirmed: { type: Boolean, default: false },
    customerConfirmedAt: Date,
    deliveredAt: Date,
    notes: String
  }
}
```

#### Review Model (New)
```javascript
{
  orderId: { type: String, required: true, ref: 'Order' },
  userId: { type: String, required: true, ref: 'Profile' },
  makerId: { type: String, required: true, ref: 'Profile' },
  productId: { type: String, ref: 'MarketplaceItem' },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: String,
  isBadReview: { 
    type: Boolean, 
    default: function() { 
      return this.rating <= 2; 
    } 
  },
  reviewedAt: Date,
  orderDeliveredAt: Date // to track review window
}
```

---

## 🔧 Business Logic Implementation

### Commission Calculation
```javascript
function calculateCommission(productPrice) {
  const percentage = productPrice * 0.10; // 10%
  return Math.max(1, percentage); // max(1 GEL, 10%)
}
```

### Maker Payout Calculation
```javascript
function calculateMakerPayout(orderItem) {
  const { unitPrice, quantity, commission } = orderItem;
  const totalCommission = commission * quantity;
  const totalRevenue = unitPrice * quantity;
  return totalRevenue - totalCommission;
}
```

### Disqualification Check
```javascript
async function checkMakerDisqualification(makerId) {
  const maker = await Profile.findOne({ userId: makerId });
  if (maker.makerProfile.rating.badReviews >= 2) {
    // Disqualify maker
    await Profile.updateOne(
      { userId: makerId },
      { 
        makerStatus: 'disqualified',
        'makerProfile.rating.disqualifiedAt': new Date()
      }
    );
    
    // Reject all pending products
    await MarketplaceItem.updateMany(
      { makerId, status: { $in: ['draft', 'pending_review'] } },
      { status: 'rejected' }
    );
    
    // Hold pending payments
    await Order.updateMany(
      { 
        'makerPayments.makerId': makerId,
        'makerPayments.status': 'pending'
      },
      { 
        $set: { 'makerPayments.$.status': 'held' }
      }
    );
    
    // Notify admin
    await sendMakerDisqualificationEmail(makerId);
  }
}
```

### Delivery Code System

**Flow:**
1. Order confirmed → Generate unique delivery code → Send to customer
2. Maker delivers product → Customer gives code to maker
3. Maker enters code → System validates → Delivery confirmed
4. Payment queued → Admin processes payment

**Code Format:**
- 6-8 alphanumeric characters (e.g., `ABC123` or `XYZ789`)
- Uppercase letters and numbers only (easy to read/type)
- Unique per order
- One-time use only
- Generated when order status changes to `payment_received` or `processing`

### Delivery Confirmation Workflow
```javascript
// Generate unique delivery code
function generateDeliveryCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars (0, O, I, 1)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// When order is confirmed (payment received or processing)
async function generateAndSendDeliveryCode(orderId) {
  const order = await Order.findById(orderId);
  
  if (!order || order.delivery?.code) {
    return; // Code already generated
  }
  
  let code;
  let isUnique = false;
  
  // Ensure code is unique
  while (!isUnique) {
    code = generateDeliveryCode();
    const existing = await Order.findOne({ 'delivery.code': code });
    if (!existing) {
      isUnique = true;
    }
  }
  
  // Save code to order
  await Order.updateOne(
    { _id: orderId },
    {
      $set: {
        'delivery.code': code,
        'delivery.codeGeneratedAt': new Date(),
        'delivery.codeUsed': false
      }
    }
  );
  
  // Send code to customer via email
  await sendDeliveryCodeEmail(orderId, code);
  
  return code;
}

// When maker enters delivery code
async function confirmDeliveryWithCode(orderId, makerId, enteredCode) {
  const order = await Order.findById(orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  // Validate code
  if (!order.delivery?.code) {
    throw new Error('Delivery code not generated for this order');
  }
  
  if (order.delivery.codeUsed) {
    throw new Error('Delivery code has already been used');
  }
  
  if (order.delivery.code !== enteredCode.toUpperCase().trim()) {
    throw new Error('Invalid delivery code');
  }
  
  // Verify maker is assigned to this order
  const orderHasMaker = order.items.some(item => item.makerId === makerId);
  if (!orderHasMaker) {
    throw new Error('You are not authorized to deliver this order');
  }
  
  // Mark code as used and confirm delivery
  await Order.updateOne(
    { _id: orderId },
    {
      $set: {
        'delivery.codeUsed': true,
        'delivery.codeUsedAt': new Date(),
        'delivery.makerConfirmed': true,
        'delivery.makerConfirmedAt': new Date(),
        'delivery.makerId': makerId,
        status: 'fulfilled' // or 'delivered' if you add that status
      }
    }
  );
  
  // Add to history
  await Order.updateOne(
    { _id: orderId },
    {
      $push: {
        history: {
          status: 'fulfilled',
          note: `Delivery confirmed by maker using code ${enteredCode}`,
          changedBy: makerId,
          changedAt: new Date()
        }
      }
    }
  );
  
  // Notify customer to confirm receipt (optional)
  await sendDeliveryConfirmationEmail(orderId);
  
  // Queue payment for maker
  await queueMakerPayment(orderId);
  
  // Notify admin payment is ready
  await sendPaymentReadyNotification(orderId);
  
  // Open review window (30 days)
  await openReviewWindow(orderId);
  
  return { success: true, message: 'Delivery confirmed successfully' };
}

// Admin can view delivery code (for support purposes)
async function getDeliveryCode(orderId, adminId) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }
  
  // Only admin can view codes
  // (Add admin check in middleware)
  
  return {
    code: order.delivery?.code,
    codeGeneratedAt: order.delivery?.codeGeneratedAt,
    codeUsed: order.delivery?.codeUsed,
    codeUsedAt: order.delivery?.codeUsedAt
  };
}

// Admin processes payment manually
async function processMakerPayment(orderId, adminId, paymentMethod, transactionId) {
  const order = await Order.findById(orderId);
  
  for (const payment of order.makerPayments) {
    if (payment.status === 'pending') {
      await Order.updateOne(
        { _id: orderId, 'makerPayments.makerId': payment.makerId },
        {
          $set: {
            'makerPayments.$.status': 'paid',
            'makerPayments.$.paidAt': new Date(),
            'makerPayments.$.paidBy': adminId,
            'makerPayments.$.paymentMethod': paymentMethod,
            'makerPayments.$.transactionId': transactionId
          }
        }
      );
      
      // Update maker's payout totals
      await Profile.updateOne(
        { userId: payment.makerId },
        {
          $inc: {
            'makerPayout.paid': payment.amount,
            'makerPayout.total': payment.amount
          },
          $dec: {
            'makerPayout.pending': payment.amount
          }
        }
      );
    }
  }
  
  // Notify maker
  await sendPaymentConfirmationEmail(orderId);
}
```

### Product Review Workflow
```javascript
// When maker submits product
async function submitProductForReview(productId, makerId) {
  await MarketplaceItem.updateOne(
    { _id: productId },
    { 
      status: 'pending_review',
      submittedForReviewAt: new Date()
    }
  );
  
  // Notify admin
  await sendProductReviewNotification(productId);
}

// When admin approves product
async function approveProduct(productId, adminId) {
  const product = await MarketplaceItem.findById(productId);
  const commission = calculateCommission(parseFloat(product.price));
  
  await MarketplaceItem.updateOne(
    { _id: productId },
    { 
      status: 'approved',
      reviewedAt: new Date(),
      reviewedBy: adminId,
      commission: commission
    }
  );
  
  // Make product live
  await MarketplaceItem.updateOne(
    { _id: productId },
    { status: 'live' }
  );
}
```

---

## 🎨 UI/UX Considerations

### Application Page
- **Serious Tone**: Professional, business-focused design
- **Clear Expectations**: Prominent quality standards section
- **Terms Acceptance**: Required checkbox with link to terms
- **Machine Selection**: Dropdown of approved machines (if applicable)
- **Filament Brands**: Multi-select or checkboxes for known brands
- **Portfolio Upload**: Multiple images with preview, quality requirements shown

### Maker Dashboard
- **Earnings Overview**: Pending, paid, total earnings
- **Product Status**: Draft, pending review, approved, rejected
- **Rating Display**: Current rating, review count, warning if close to disqualification
- **Payment History**: List of payments received
- **Performance Metrics**: Sales, views, conversion rate

### Admin Dashboard
- **Application Review**: List with filters, quick approve/reject
- **Product Review Queue**: Pending products to review
- **Maker Management**: All makers, status, ratings, earnings
- **Payment Management**: Pending payments, payment history
- **Disqualification Alerts**: Makers with 1 bad review (warning)

---

## ⚠️ Important Considerations & Recommendations

### 1. **Payment Timing**
- **Current**: After delivery confirmation
- **Question**: Who confirms delivery? Customer? Admin?
- **Recommendation**: 
  - Customer marks "received" → triggers payment queue
  - Admin reviews → approves payment
  - Or: Auto-pay after X days if no dispute

### 2. **Disqualification Threshold**
- **Current**: 2 bad reviews
- **Considerations**:
  - What if 2 reviews from same customer? (Count as 1?)
  - What if reviews are old? (Reset after X months?)
  - What if maker improves? (Re-application process?)
- **Recommendation**: 
  - Count unique customers only
  - Consider time window (e.g., last 6 months)
  - Allow re-application after 6-12 months

### 3. **Review System**
- **Rating Scale**: 1-5 stars or thumbs up/down?
- **Review Requirements**: Optional or required?
- **Review Window**: How long after delivery?
- **Recommendation**: 
  - 1-5 stars (more granular)
  - Optional text, required rating
  - 30-day review window
  - Email reminder after delivery

### 4. **Machine Quality Standards**
- **Define**: What are "quality machines"?
- **List**: Create approved machine list?
- **Verification**: How to verify? Photos? Serial numbers?
- **Recommendation**: 
  - Start with common quality brands (Prusa, Ultimaker, etc.)
  - Allow "other" with manual review
  - Require machine photos in application

### 5. **Filament Brands**
- **Define**: What are acceptable brands?
- **List**: Create approved filament list?
- **Flexibility**: Allow "other" with explanation?
- **Recommendation**: 
  - List top 10-15 quality brands
  - Allow "other" with brand name and justification
  - Admin reviews "other" brands

### 6. **Refund/Replacement Process**
- **Who Pays**: You pay for replacement/refund, then what?
- **Recovery**: Can you recover from maker's pending payments?
- **Documentation**: Track all refunds/replacements
- **Recommendation**: 
  - Hold maker's pending payments for 30 days
  - Use held payments to cover refunds
  - Document all cases for accounting

### 7. **Legal/Terms**
- **Maker Agreement**: Required terms of service
- **Liability**: Who's liable for defects?
- **Insurance**: Required for makers?
- **Recommendation**: 
  - Consult lawyer for terms
  - Clear liability structure
  - Insurance requirements (if applicable)

### 8. **Scaling Considerations**
- **Manual Payments**: Fine for now, but plan for automation
- **Review Volume**: What if 100+ products pending?
- **Maker Volume**: What if 50+ makers?
- **Recommendation**: 
  - Build admin tools for efficiency
  - Consider batch operations
  - Plan automation early

---

## 🚀 Implementation Priority

### Must Have (MVP)
1. ✅ Maker application form with all questions
2. ✅ Admin application review
3. ✅ Maker role assignment
4. ✅ Product submission (pending review)
5. ✅ Admin product review/approval
6. ✅ Commission calculation
7. ✅ Payment tracking (manual)
8. ✅ Basic rating system
9. ✅ Disqualification logic

### Should Have (Phase 2)
1. Maker dashboard
2. Payment management UI
3. Review system UI
4. Maker profile pages
5. Admin maker management

### Nice to Have (Phase 3)
1. Automated payments
2. Advanced analytics
3. Maker communication tools
4. Bulk operations
5. Email notifications

---

## 📝 Finalized Decisions

1. **Delivery Confirmation**: 
   - **Unique Delivery Code System**:
     - Code generated when order is confirmed (6-8 alphanumeric characters)
     - Code sent to customer via email
     - Customer gives code to maker upon delivery
     - Maker enters code to confirm delivery
     - Code is one-time use only
     - System validates code before confirming delivery
   - Admin can also manually confirm if needed (for support)

2. **Payment Approval**: 
   - Manual payment by admin
   - Admin sends payment after delivery confirmation
   - Payment status tracked in system

3. **Approved Machines**:
   - **Preferred**: BambuLab (all models)
   - **Approved**: QidiTech (newer models), FlashForge (quality models)
   - **Other**: Manual review required
   - See `APPROVED_MACHINES_AND_FILAMENTS.md` for full list

4. **Approved Filament Brands**:
   - Premium brands: Prusament, Polymaker, BambuLab, Hatchbox, eSUN, Overture, Sunlu
   - Quality brands: ColorFabb, Fillamentum, FormFutura, etc.
   - **Not accepted**: Noname/unknown brands, extremely cheap filaments
   - "Other" option with manual review
   - See `APPROVED_MACHINES_AND_FILAMENTS.md` for full list

5. **Review Counting**: 2 bad reviews from same customer = 1 or 2? (TBD)
6. **Review Window**: How long after delivery can customers review? (TBD - suggest 30 days)
7. **Re-application**: Can disqualified makers re-apply? After how long? (TBD)
8. **Payment Recovery**: How to recover refund costs from makers? (TBD - suggest payment hold)
9. **Terms**: Do you have legal terms ready, or need to draft? (TBD)

---

## 💡 Final Thoughts

Your business model is **solid and well-thought-out**. The quality-first approach will help build trust. A few suggestions:

1. **Start Strict, Stay Strict**: Your quality standards are your brand. Don't compromise.
2. **Document Everything**: Keep records of all reviews, payments, disqualifications.
3. **Communication**: Clear communication with makers about expectations prevents issues.
4. **Customer Protection**: Your refund/replacement policy builds customer trust.
5. **Scalability**: Plan for automation early, even if you start manual.

The 2-strike rule is fair but strict. Consider:
- **Warning System**: 1 bad review = warning, 2 = disqualification
- **Appeal Process**: Allow makers to dispute reviews (with evidence)
- **Time Window**: Only count reviews from last 6-12 months

Ready to start building? Let me know which phase you want to tackle first!

