# MANUAL TESTING INSTRUCTIONS
**Critical: Test these scenarios before deployment**

## You're absolutely right - the build test wasn't enough!

Here are the specific scenarios you MUST test manually to ensure the optimizations work correctly:

## 1. Database Connection Pooling Test

**Start the dev server:**
```bash
npm run dev
```

**Open browser network tab and:**
1. Navigate to exam portal
2. Open 10+ browser tabs with different student logins
3. All try to check exam eligibility simultaneously
4. **Expected:** All requests succeed in < 1 second
5. **Red flag:** Any timeouts or connection errors

## 2. Caching Test

**Test exam eligibility caching:**
1. Student checks exam eligibility (first time - should be slower ~200-500ms)
2. Same student checks again immediately (should be instant ~10-50ms)
3. Wait 10+ minutes, check again (cache expires, slower again)
4. **Expected:** Second check much faster than first
5. **Red flag:** All requests take same time (cache not working)

## 3. Auto-Save & Retry Test

**Test auto-save with network issues:**
1. Start an exam
2. Answer a few questions
3. Open DevTools → Network → Toggle "Offline"
4. Wait for auto-save attempt (every 30 seconds)
5. Toggle back online
6. **Expected:** Progress saved locally, syncs when online
7. **Red flag:** Progress lost when going offline

**Test retry logic:**
```bash
# Simulate database issues by temporarily stopping MongoDB
sudo systemctl stop mongod  # or kill MongoDB process
```
1. Student tries to submit exam
2. **Expected:** Gets "queued for retry" message, not complete failure
3. Restart MongoDB
4. **Expected:** Submission eventually succeeds

## 4. Performance Under Load

**Simulate concurrent users:**
1. Get 10+ people to simultaneously:
   - Check exam eligibility
   - Start exams
   - Submit answers
   - Use auto-save

2. **Expected results:**
   - All operations complete in < 1 second
   - No timeout errors
   - No "too many connections" errors

3. **Red flags:**
   - Any operation takes > 5 seconds
   - "Connection timeout" errors
   - "Pool exhausted" errors

## 5. Exam Submission Flow Test

**Test the complete exam journey:**
1. Student joins exam → Should use cached eligibility check
2. Student navigates questions → Should be smooth
3. Student saves progress (auto-save) → Should work offline
4. Student submits exam → Should use retry logic if needed
5. Student views results → Should be instant

**Specific things to check:**
- Do auto-saves happen every 30 seconds?
- If network fails during submission, does it retry?
- Are the optimizations actually being used?

## 6. Memory Usage Test

**Monitor server memory:**
```bash
# Watch memory usage
htop  # or Activity Monitor on Mac
```

1. Start with baseline memory usage
2. Have 100+ students check eligibility (to fill cache)
3. **Expected:** Memory increases gradually, stabilizes
4. **Red flag:** Memory keeps growing (memory leak)

## 7. Error Scenarios

**Test what happens when things break:**
1. **Database down:** Should queue submissions, show user message
2. **Cache full:** Should still work, just slower  
3. **Network unstable:** Should retry automatically
4. **High load:** Should maintain performance

## CRITICAL TESTS (Must Pass Before Tomorrow)

### ✅ Connection Test
- [ ] 50+ concurrent eligibility checks succeed
- [ ] No timeout errors
- [ ] Response time < 1 second

### ✅ Cache Test  
- [ ] Second eligibility check is 5x+ faster than first
- [ ] Memory usage reasonable (< 1GB after 1000 checks)

### ✅ Auto-Save Test
- [ ] Works offline (localStorage)
- [ ] Syncs to server when online
- [ ] No data loss during network issues

### ✅ Retry Test
- [ ] Submissions retry on failure
- [ ] Students notified if queued
- [ ] Eventually succeeds when system recovers

### ✅ End-to-End Test
- [ ] Complete exam flow works smoothly
- [ ] All optimizations actually being used
- [ ] Performance better than before optimizations

## What to Watch Out For

### Database Issues
```
Error: MongoNetworkTimeoutError
Error: MongoServerSelectionTimeoutError  
Error: connection pool exhausted
```

### Cache Issues
```
Error: Maximum call stack size exceeded
Memory usage keeps growing
Cache hits not happening
```

### Retry Issues
```
Error: Maximum retry attempts exceeded
Failed submissions not being queued
Infinite retry loops
```

### Import/Module Issues
```
Error: Cannot find module
Error: import statement cannot be used outside a module
Error: require() of ES modules is not supported
```

## How to Test Properly

1. **Use actual browser testing** - Not just build tests
2. **Test with real database** - Not just mock data
3. **Simulate real load** - Multiple users, network issues
4. **Monitor system resources** - Memory, CPU, connections
5. **Test error scenarios** - What happens when things fail

## If You Find Issues

1. **Document the exact error message**
2. **Note what you were doing when it happened**
3. **Check browser console and server logs**
4. **Test if it's a new issue or existing bug**

## Quick Validation Commands

```bash
# Check database connections
mongo --eval "db.serverStatus().connections"

# Check cache status (if implemented monitoring)
curl http://localhost:3000/api/cache/status

# Check server memory
ps aux | grep node

# Check for errors
tail -f logs/error.log  # if you have logging
```

---

## The Bottom Line

You're absolutely right to be skeptical. The optimizations could introduce bugs:

- **Import errors** (ES modules vs CommonJS)
- **Cache invalidation bugs** (stale data)
- **Retry infinite loops** (bad error handling)
- **Memory leaks** (cache growing forever)
- **Race conditions** (concurrent operations)

**Test these scenarios manually before trusting the system with your exam!**