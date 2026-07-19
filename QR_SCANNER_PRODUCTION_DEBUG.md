# QR Scanner Production Debugging Guide

## Issue
QR scanner opens camera but doesn't scan QR codes in Vercel production.

## Fix Applied

### Changes Made to Scanner

1. **Added Console Logging**
   - Logs when scanner starts
   - Logs when QR code is detected
   - Logs configuration used
   - Helps debug in production console

2. **Improved QR Box Configuration**
   - Changed from fixed size (250x250) to dynamic sizing
   - Now uses 70% of smallest viewport dimension
   - Better adaptation to different screen sizes
   - More reliable detection

3. **Added Video Constraints**
   - Explicitly requests environment-facing camera
   - Better camera selection
   - More reliable on mobile devices

4. **Enhanced Error Logging**
   - Filters out non-critical "NotFoundException" errors
   - Logs significant errors only
   - Cleaner console output

### Updated Configuration

**Before:**
```typescript
const config = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.0,
};
```

**After:**
```typescript
const config = {
  fps: 10,
  qrbox: function(viewfinderWidth, viewfinderHeight) {
    const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
    const qrboxSize = Math.floor(minEdgeSize * 0.7);
    return {
      width: qrboxSize,
      height: qrboxSize
    };
  },
  aspectRatio: 1.0,
  disableFlip: false,
  videoConstraints: {
    facingMode: { ideal: 'environment' }
  }
};
```

---

## How to Debug in Production

### 1. Open Browser Console
**Chrome/Edge:**
- Press `F12` or `Cmd+Option+I` (Mac)
- Go to "Console" tab

**Safari:**
- Enable Developer menu: Safari > Preferences > Advanced > Show Develop menu
- Press `Cmd+Option+C`

**Firefox:**
- Press `F12` or `Cmd+Option+K` (Mac)
- Go to "Console" tab

### 2. What to Look For

**When Starting Scanner:**
```
Starting scanner with config: {...}
Camera ID: {...}
Scanner started successfully
```

**When Scanning QR Code:**
```
QR Code detected: REG-ABC123
Processing scan: REG-ABC123
```

**If Duplicate Detected:**
```
Duplicate scan ignored
```

**If Errors Occur:**
```
Error starting scanner: [error message]
Scanner error (non-critical): [error message]
```

---

## Common Production Issues & Fixes

### Issue 1: Camera Opens But Doesn't Scan

**Symptoms:**
- Camera feed shows
- QR code in view
- Nothing happens

**Possible Causes:**
1. **QR code too small** - Move closer
2. **Poor lighting** - Improve lighting
3. **QR code out of focus** - Hold steady, wait for focus
4. **Wrong QR box size** - Fixed with dynamic sizing

**Solutions:**
- Hold QR code 15-30cm from camera
- Ensure good lighting
- Keep QR code centered in green box
- Wait 1-2 seconds for detection

### Issue 2: "Failed to start camera" Error

**Symptoms:**
- Error toast appears
- Camera doesn't start

**Possible Causes:**
1. **HTTPS not enabled** - Vercel should auto-enable
2. **Camera permissions denied** - User blocked camera
3. **Camera in use** - Another app using camera
4. **Browser not supported** - Old browser version

**Solutions:**
- Verify HTTPS (check URL starts with `https://`)
- Check browser permissions (click camera icon in address bar)
- Close other apps using camera
- Try different browser (Chrome recommended)
- Update browser to latest version

### Issue 3: Works Locally But Not in Production

**Symptoms:**
- Scanner works on localhost
- Doesn't work on Vercel

**Possible Causes:**
1. **HTTP vs HTTPS** - Localhost uses HTTP (allowed), production needs HTTPS
2. **Camera permissions** - Different permissions for different domains
3. **Browser restrictions** - Production has stricter security

**Solutions:**
- Verify Vercel deployment uses HTTPS ✅
- Check browser console for security errors
- Grant camera permissions when prompted
- Clear browser cache and try again

### Issue 4: Scanner Detects But Doesn't Process

**Symptoms:**
- Console shows "QR Code detected"
- No toast notification appears
- No check-in happens

**Possible Causes:**
1. **Network issue** - Can't reach server
2. **Auth expired** - Session timed out
3. **JavaScript error** - Code execution interrupted

**Solutions:**
- Check network tab for failed requests
- Re-login if session expired
- Look for JavaScript errors in console
- Refresh page and try again

---

## Testing in Production

### Step-by-Step Test

1. **Navigate to Check-in Page**
   ```
   https://your-domain.vercel.app/admin/check-in
   ```

2. **Open Browser Console**
   - Press F12 (Windows) or Cmd+Option+I (Mac)

3. **Click "Start Camera"**
   - Should see: "Starting scanner with config..."
   - Should see: "Scanner started successfully"
   - Camera feed should appear

4. **Point at QR Code**
   - Hold 15-30cm away
   - Keep centered in green box
   - Wait 1-2 seconds

5. **Check Console**
   - Should see: "QR Code detected: [code]"
   - Should see: "Processing scan: [code]"

6. **Verify Check-in**
   - Toast notification should appear
   - Last check-in card should update
   - Recent list should update

### If It Still Doesn't Work

**Check These in Console:**

1. **Scanner initialization:**
   ```javascript
   // Should see this:
   Starting scanner with config: {fps: 10, qrbox: ƒ, ...}
   Camera ID: [camera-id-string] or {facingMode: "environment"}
   Scanner started successfully
   ```

2. **QR detection:**
   ```javascript
   // When QR in view, should see:
   QR Code detected: REG-ABC123
   Processing scan: REG-ABC123
   ```

3. **Any errors:**
   ```javascript
   // Should NOT see:
   Error starting scanner: ...
   Failed to start camera
   Permission denied
   ```

---

## Vercel-Specific Checks

### 1. HTTPS Verification
```
✅ URL should be: https://your-app.vercel.app
❌ NOT: http://your-app.vercel.app
```

Vercel auto-enables HTTPS, but verify in browser address bar.

### 2. Environment Variables
No special env vars needed for QR scanner.
Only Supabase vars required (already set).

### 3. Build Settings
```
✅ Build Command: npm run build
✅ Output Directory: .next
✅ Install Command: npm install
✅ Node Version: 18.x or higher
```

### 4. Function Region
Scanner runs client-side, so function region doesn't matter.
But for API calls, ensure database region matches.

---

## Browser-Specific Issues

### Chrome/Edge (Recommended)
**Should work perfectly**
- Best camera support
- Best QR detection
- Most tested

**If not working:**
1. Check chrome://flags - ensure no camera flags disabled
2. Check site settings: Settings > Privacy > Camera
3. Clear site data: Settings > Privacy > Site Settings > [your domain] > Clear data

### Safari (iOS/Mac)
**May need extra permissions**
- First use shows permission dialog
- May need to enable in iOS Settings > Safari > Camera

**If not working:**
1. Safari > Settings for This Website > Camera > Allow
2. iOS: Settings > Safari > Camera > Allow
3. Clear website data

### Firefox
**Should work well**
- Good camera support
- Good QR detection

**If not working:**
1. Check about:permissions
2. Ensure camera not blocked for site
3. Clear cookies and cache

---

## Mobile-Specific Issues

### iOS (iPhone/iPad)
**Requirements:**
- iOS 14 or higher recommended
- Safari or Chrome
- Camera permission granted

**Common Issues:**
- Camera opens in wrong orientation → Rotate device
- Focus issues → Tap screen to focus
- Slow detection → Better lighting needed

### Android
**Requirements:**
- Android 8 or higher recommended
- Chrome recommended
- Camera permission granted

**Common Issues:**
- Multiple cameras → Use switch button
- Poor focus → Better lighting
- Slow performance → Close other apps

---

## Network Debugging

### Check API Calls

In browser Network tab:
1. Filter by "Fetch/XHR"
2. Look for `/api/` calls
3. Check response status

**Expected calls:**
- `POST /api/.../checkInRegistration` (when scanning)
- Status: 200 (success) or 4xx/5xx (error)

**If API fails:**
- Check request payload (should have QR code)
- Check response (should have user data or error)
- Verify auth token in headers

---

## Quick Fixes Checklist

### Scanner Not Opening
- [ ] HTTPS enabled (check URL)
- [ ] Camera permissions granted
- [ ] No other app using camera
- [ ] Browser updated to latest
- [ ] JavaScript enabled
- [ ] Clear cache and reload

### Scanner Opens But Doesn't Detect
- [ ] QR code visible in green box
- [ ] Distance: 15-30cm
- [ ] Good lighting
- [ ] Code not blurry
- [ ] Waited 2+ seconds
- [ ] Console shows "Scanner started successfully"

### Detects But Doesn't Process
- [ ] Console shows "QR Code detected"
- [ ] Network connected
- [ ] Auth session valid
- [ ] No JavaScript errors
- [ ] Page not frozen

---

## Production Monitoring

### Metrics to Watch

1. **Error Rate**
   - Monitor console errors
   - Track failed check-ins
   - Alert on high error rate

2. **Performance**
   - Scanner start time (<2s expected)
   - Detection time (<1s expected)
   - API response time (<1s expected)

3. **Success Rate**
   - % of successful scans
   - % of failed scans
   - % of duplicate scans

### Logging

**Console logs now include:**
```
✅ Starting scanner with config
✅ Scanner started successfully
✅ QR Code detected: [code]
✅ Processing scan: [code]
✅ Duplicate scan ignored (if applicable)
⚠️  Scanner error (if significant)
❌ Error starting scanner (if failed)
```

These logs help debug production issues.

---

## Contact Support

### When Reporting Issues

**Include:**
1. Browser and version (Chrome 120, Safari 17, etc.)
2. Device (iPhone 15, MacBook Pro, etc.)
3. Operating system (iOS 17, macOS 14, etc.)
4. Console logs (screenshot)
5. Steps to reproduce
6. Expected vs actual behavior

**Example Report:**
```
Browser: Chrome 120 on macOS 14
Issue: Scanner opens but doesn't detect QR codes
Console: Shows "Scanner started successfully" but no "QR Code detected"
Tried: Good lighting, 20cm distance, waited 5 seconds
QR Code: Confirmed valid (works on another device)
```

---

## Summary

### What Changed
✅ Added console logging for debugging  
✅ Dynamic QR box sizing (better detection)  
✅ Better video constraints  
✅ Enhanced error handling  
✅ Production-ready configuration  

### Expected Behavior
1. Click "Start Camera" → Camera opens
2. Point at QR code → Green box highlights
3. Code detected → Console logs appear
4. Check-in processes → Toast notification
5. Details display → Success!

### If Still Not Working
1. Check browser console
2. Verify HTTPS enabled
3. Ensure camera permissions granted
4. Try different browser
5. Check network connection
6. Report issue with details

---

**The scanner should now work in production with better detection and debugging capabilities!** 🚀
