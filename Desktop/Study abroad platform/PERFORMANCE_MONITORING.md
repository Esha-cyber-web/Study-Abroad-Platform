# 📊 Performance Optimization & Monitoring Guide

## 1️⃣ Backend Performance Optimization

### Add Compression Middleware
```javascript
// backend/server.js
const compression = require('compression');

app.use(compression());  // Compress responses
```

### Database Query Optimization
```javascript
// Add indexes to MongoDB
db.collection('universities').createIndex({ country: 1 });
db.collection('universities').createIndex({ fees: 1 });
db.collection('universities').createIndex({ ranking: 1 });
db.collection('applications').createIndex({ userId: 1 });
db.collection('users').createIndex({ email: 1 }, { unique: true });

// Use lean() for read-only queries
const universities = await University.find(filter).lean();

// Use select() to limit fields
const users = await User.find().select('name email -password');

// Use pagination
const page = req.query.page || 1;
const limit = req.query.limit || 10;
const skip = (page - 1) * limit;
const universities = await University.find()
  .skip(skip)
  .limit(limit)
  .lean();
```

### Response Caching Strategy
```javascript
// backend/middleware/cache.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

const cacheMiddleware = (req, res, next) => {
  if (req.method !== 'GET') return next();
  
  const key = req.originalUrl;
  const cachedResponse = cache.get(key);
  
  if (cachedResponse) {
    return res.json(cachedResponse);
  }
  
  // Override res.json to cache response
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    cache.set(key, data);
    return originalJson(data);
  };
  
  next();
};

app.use('/api/universities', cacheMiddleware);
app.use('/api/scholarships', cacheMiddleware);
```

### Connection Pooling
```javascript
// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 45000,
    });
    console.log('✅ MongoDB connected with pooling');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### API Response Optimization
```javascript
// Reduce response payload
const universities = await University.find()
  .select('name country ranking fees -_id')
  .lean()
  .limit(20);

// Implement pagination
res.json({
  data: universities,
  pagination: {
    page: req.query.page || 1,
    limit: req.query.limit || 20,
    total: await University.countDocuments()
  }
});
```

---

## 2️⃣ Frontend Performance Optimization

### Code Splitting with Vite
```javascript
// frontend/src/App.jsx
import { lazy, Suspense } from 'react';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Universities = lazy(() => import('./pages/Universities'));

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/universities" element={<Universities />} />
      </Routes>
    </Suspense>
  );
}
```

### Image Optimization
```javascript
// Use WebP format with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="description" loading="lazy" />
</picture>

// Or use Next.js Image component style
<img 
  src="/images/university.jpg" 
  alt="university"
  loading="lazy"
  decoding="async"
/>
```

### Bundle Analysis
```bash
# Install Vite plugin
npm install --save-dev vite-plugin-visualizer

# vite.config.js
import { visualizer } from 'vite-plugin-visualizer';

export default {
  plugins: [visualizer()]
};

# Run build and check
npm run build
```

### Service Worker (PWA)
```javascript
// frontend/src/serviceWorker.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ Service Worker registered'))
      .catch(err => console.error('❌ Service Worker failed:', err));
  });
}
```

---

## 3️⃣ CDN & Caching Strategy

### Frontend CDN (Cloudflare/Vercel)
```
Cache Rules:
- HTML: 0 seconds (always fresh)
- CSS/JS: 1 year (immutable hashes)
- Images: 1 month
- API responses: 5 minutes
```

### Backend Cache Headers
```javascript
// backend/middleware/cacheHeaders.js
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    if (req.method === 'GET') {
      // Cache GET requests for 5 minutes
      res.set('Cache-Control', 'public, max-age=300');
    } else {
      // Don't cache POST/PUT/DELETE
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
  next();
});
```

---

## 4️⃣ Monitoring & Analytics

### Sentry Error Tracking
```javascript
// backend/server.js
const Sentry = require("@sentry/node");

Sentry.init({ dsn: process.env.SENTRY_DSN });
app.use(Sentry.Handlers.requestHandler());

// ... routes ...

app.use(Sentry.Handlers.errorHandler());
```

### Google Analytics (Frontend)
```javascript
// frontend/src/utils/analytics.js
import ReactGA from 'react-ga4';

ReactGA.initialize(process.env.REACT_APP_GA_ID);

export const trackPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

export const trackEvent = (category, action, label) => {
  ReactGA.event({
    category,
    action,
    label
  });
};
```

### Application Performance Monitoring
```javascript
// backend/middleware/monitoring.js
const startTime = Date.now();

app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    
    // Send to monitoring service
    if (duration > 1000) {
      console.warn(`⚠️ Slow request: ${req.path} took ${duration}ms`);
    }
  });
  
  next();
});
```

---

## 5️⃣ Load Testing Results Analysis

### k6 Metrics to Monitor
```
✅ Response Time:
- p50 (median): < 200ms
- p95: < 500ms
- p99: < 1000ms

✅ Throughput:
- Requests/sec: > 1000
- Data transfer: > 10MB/s

✅ Error Rate:
- Target: < 0.1% (< 0.1% of 1M requests = 1000 errors)
- HTTP 5xx: < 0.01%
```

### Example k6 Results
```
Script Summary:
- vus: 100
- duration: 1m
- total requests: 54,890
- avg response time: 182.4ms
- p95 response time: 458.2ms
- error rate: 0.02%
- data received: 542MB

✅ Performance Grade: A+
```

---

## 6️⃣ Production Monitoring Checklist

```bash
☑️ Application Logs (Sentry)
☑️ Error Tracking (DataDog/New Relic)
☑️ Performance Metrics (APM)
☑️ Database Performance (MongoDB Atlas Charts)
☑️ API Response Times (Grafana)
☑️ User Analytics (Google Analytics)
☑️ Uptime Monitoring (UptimeRobot)
☑️ Security Monitoring (OWASP Top 10)
☑️ Cost Monitoring (Cloud provider dashboard)
```

---

## 7️⃣ Auto-Scaling Configuration

### For Railway/Render
```yaml
# railway.yaml or render.yaml
scaling:
  minInstances: 2
  maxInstances: 10
  targetCPU: 70%
  targetMemory: 80%
```

### For AWS
```yaml
# CloudFormation Template
AutoScalingGroup:
  MinSize: 2
  MaxSize: 10
  DesiredCapacity: 4
  TargetGroupArn: !Ref TargetGroup
  HealthCheckType: ELB
```

---

## 8️⃣ Real-Time Monitoring Dashboard

Create a dashboard showing:
1. **Traffic**: Requests/sec, active users
2. **Performance**: Response times, error rates
3. **Infrastructure**: CPU, Memory, Disk usage
4. **Databases**: Query times, connection pool
5. **Errors**: Top errors, error trends
6. **User Analytics**: Sessions, page views, conversions

```bash
# Monitor in real-time
watch -n 1 'curl -s http://localhost:5000/health | jq .'
```

---

## 9️⃣ Cost Optimization

| Component | Estimated Monthly Cost |
|-----------|------------------------|
| MongoDB Atlas (M0 - Free) | $0 |
| Railway (2 instances @ $0.50/day) | $30 |
| OpenAI API ($0.01-0.05 per request) | $100-500 |
| Google OAuth | Free |
| Email (Gmail) | Free |
| Frontend (Vercel) | Free-100 |
| **Total Estimated** | **$130-630** |

### Cost Saving Tips:
1. Use MongoDB M0 (free tier) for development
2. Switch to M10 ($57/month) for production
3. Use pay-as-you-go for OpenAI (not subscription)
4. Cache API responses to reduce OpenAI calls
5. Use CDN to reduce bandwidth costs

---

## 🔟 Performance Targets

```
Target Metrics:
✅ First Contentful Paint (FCP): < 1.8s
✅ Largest Contentful Paint (LCP): < 2.5s
✅ Cumulative Layout Shift (CLS): < 0.1
✅ Time to Interactive (TTI): < 3.8s
✅ Page Load Time: < 3s
✅ API Response Time: < 500ms
✅ Database Query Time: < 100ms
✅ Error Rate: < 0.1%
✅ Availability: > 99.9%
```

---

## Usage Instructions

1. **Check Response Times:**
   ```bash
   curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5000/api/universities
   ```

2. **Monitor Database Performance:**
   ```javascript
   // MongoDB Atlas Charts
   // Go to: https://charts.mongodb.com/
   ```

3. **Track Frontend Performance:**
   ```bash
   # Google Lighthouse
   lighthouse http://localhost:5173 --view
   ```

4. **Load Test:**
   ```bash
   k6 run k6_load_test.js
   ```

---

**Next**: Deploy to production and monitor with Sentry + DataDog!
