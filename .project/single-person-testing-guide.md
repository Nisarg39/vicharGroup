# SINGLE-PERSON TESTING GUIDE
**How to test exam portal with just yourself**

## The Problem
- You need to test 1000+ concurrent users
- You're the only tester available
- Manual testing can't simulate real load

## Solution: Smart Testing Strategies

## 1. BROWSER TAB SIMULATION

### Test Concurrent Requests:
```bash
# Start dev server
npm run dev
```

**Open 20+ browser tabs:**
1. Open 20 tabs to your exam portal
2. In each tab, navigate to exam eligibility check
3. Press F12 → Network tab in one browser
4. **Quickly refresh all 20 tabs at once** (Ctrl+Shift+R on each)
5. Watch network timings

**What to look for:**
- ✅ All requests complete in < 2 seconds
- ✅ No "connection refused" errors
- ❌ Any timeouts or failures = Problem!

### Test Caching:
1. Tab 1: Check exam eligibility (watch network time ~200-500ms)
2. Tab 2: Same exam eligibility (should be much faster ~10-50ms)
3. **If both take same time = Caching not working**

## 2. AUTOMATED LOAD TESTING

### Quick Load Test Script:
```javascript
// Save as test-load.js and run: node test-load.js
const https = require('https');

async function hitEndpoint(url, times = 50) {
  const promises = [];
  console.log(`Testing ${times} concurrent requests...`);
  
  const start = Date.now();
  
  for (let i = 0; i < times; i++) {
    promises.push(
      fetch(url).catch(err => ({ error: err.message }))
    );
  }
  
  const results = await Promise.all(promises);
  const duration = Date.now() - start;
  const errors = results.filter(r => r.error).length;
  
  console.log(`Results: ${times - errors}/${times} success in ${duration}ms`);
  console.log(`Average: ${Math.round(duration / times)}ms per request`);
  if (errors > 0) console.log(`❌ ${errors} failures!`);
}

// Test your endpoints
hitEndpoint('http://localhost:3000/api/your-exam-endpoint');
```

## 3. SIMULATE NETWORK ISSUES

### Test Auto-Save Offline:
1. Start an exam
2. Answer 2-3 questions
3. **Open DevTools → Network → Check "Offline"**
4. Wait 30+ seconds (auto-save should trigger)
5. Check localStorage: `localStorage.getItem('exam_progress_...')`
6. ✅ Should see your answers saved locally
7. Toggle back online
8. ✅ Should sync to server

### Test Retry Logic:
```bash
# Stop MongoDB temporarily (simulate database failure)
# On Mac/Linux:
brew services stop mongodb-community
# Or kill the MongoDB process
```

1. Try to submit exam
2. ✅ Should get "queued for retry" message
3. ✅ Should NOT get complete failure

```bash
# Restart MongoDB
brew services start mongodb-community
```

## 4. MEMORY LEAK TESTING

### Test Cache Growth:
```bash
# Monitor memory while running
top -p $(pgrep -f "node.*next")  # Linux
# or Activity Monitor on Mac
```

1. Check baseline memory usage
2. Refresh exam eligibility page 100+ times rapidly
3. Watch memory usage
4. ✅ Should stabilize, not keep growing infinitely
5. ❌ If memory keeps climbing = Memory leak!

## 5. DATABASE PERFORMANCE TEST

### Test Connection Pooling:
```javascript
// Save as db-test.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnections() {
  await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 100,
    minPoolSize: 10
  });
  
  console.log('Testing 100 concurrent database operations...');
  const start = Date.now();
  
  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(mongoose.connection.db.admin().ping());
  }
  
  await Promise.all(promises);
  const duration = Date.now() - start;
  
  console.log(`✅ 100 operations in ${duration}ms`);
  if (duration > 5000) {
    console.log('⚠️ Performance might be slow under real load');
  }
  
  process.exit(0);
}

testConnections();
```

## 6. REALISTIC EXAM SIMULATION

### Complete Exam Flow Test:
1. **Pre-exam (Cache test):**
   - Check eligibility 3 times rapidly
   - Should get faster each time

2. **During exam (Auto-save test):**
   - Start exam
   - Answer questions slowly
   - Watch DevTools Network for auto-save requests every 30 seconds
   - Go offline briefly, come back online

3. **Submission (Retry test):**
   - Submit exam normally (should work)
   - Try submitting with network off (should queue)

## 7. BROWSER DEVELOPER TOOLS MONITORING

### Performance Tab:
1. Open DevTools → Performance
2. Start recording
3. Navigate through exam flow
4. Stop recording
5. Look for:
   - ✅ Fast response times
   - ❌ Long blocking tasks
   - ❌ Memory leaks

### Network Tab:
1. Monitor all requests
2. Look for:
   - ✅ Cache hits (304 responses)
   - ✅ Fast API responses (< 500ms)
   - ❌ Failed requests
   - ❌ Timeouts

## 8. STRESS TEST YOUR MACHINE

### Simulate Heavy Load:
```bash
# Run multiple dev servers (different ports)
npm run dev &  # Port 3000
PORT=3001 npm run dev &  # Port 3001
PORT=3002 npm run dev &  # Port 3002

# Then hit all three simultaneously with browser tabs
```

## 9. ERROR SCENARIO TESTING

### What happens when things break?

**Database connection issues:**
```bash
# Kill all MongoDB connections
pkill -f mongod
```
- Navigate to exam portal
- ✅ Should show graceful error, not crash
- ✅ Should attempt retry

**High memory usage:**
```bash
# Simulate low memory
stress --vm 1 --vm-bytes 7G --timeout 30s  # Linux
```
- Navigate exam portal during memory stress
- ✅ Should still work (maybe slower)
- ❌ If crashes = Not production ready

## 10. CHECKLIST FOR SINGLE-PERSON TESTING

### Must Test (30 minutes):
- [ ] 20 browser tabs can check eligibility simultaneously
- [ ] Second eligibility check is faster than first (caching)
- [ ] Auto-save works offline (check localStorage)
- [ ] Memory usage stabilizes after heavy use
- [ ] Database operations complete in < 1 second

### Should Test (15 minutes):
- [ ] Complete exam flow works smoothly
- [ ] Error messages are user-friendly
- [ ] No console errors in browser
- [ ] Server doesn't crash under load

### Nice to Test (10 minutes):
- [ ] Mobile browser testing
- [ ] Different network speeds
- [ ] Edge cases (very long exam, many questions)

## 11. RED FLAGS TO WATCH FOR

### Immediate Deployment Blockers:
- ❌ Any request takes > 5 seconds
- ❌ "Connection refused" errors
- ❌ Server crashes during testing
- ❌ Auto-save doesn't work offline
- ❌ Memory usage keeps growing

### Warning Signs:
- ⚠️ Requests inconsistently slow
- ⚠️ Cache not improving speed
- ⚠️ High CPU usage at rest
- ⚠️ Error messages unclear

## 12. QUICK 10-MINUTE CONFIDENCE TEST

```bash
# 1. Start server
npm run dev

# 2. Run concurrent database test
node .project/simple-validation.js

# 3. Browser test (5 minutes):
#    - Open 10 tabs
#    - Navigate all to exam portal
#    - Refresh all simultaneously
#    - Check if all load quickly

# 4. Auto-save test (2 minutes):
#    - Start exam
#    - Go offline in DevTools
#    - Wait 30 seconds
#    - Check localStorage has data

# 5. Memory test (2 minutes):
#    - Monitor Activity Monitor
#    - Refresh page 50 times rapidly
#    - Check memory doesn't keep growing
```

### If All Pass:
✅ **You have 85% confidence for tomorrow**

### If Any Fail:
❌ **Fix the issue before deployment**

## The Reality Check

**Single-person testing can catch:**
- ✅ Basic functionality bugs
- ✅ Obvious performance issues
- ✅ Memory leaks
- ✅ Database connection problems

**Single-person testing CANNOT catch:**
- ❌ True concurrent user conflicts
- ❌ Race conditions under heavy load
- ❌ Distributed system issues

**My Recommendation:**
1. Do the 10-minute confidence test above
2. If it passes → **Deploy with monitoring ready**
3. Have backup plan ready (limit concurrent users)
4. Monitor closely during real exam
5. Be ready to scale back if issues arise

**Bottom Line:** Better to deploy with good monitoring than not deploy at all. The optimizations will help significantly even if not perfect.