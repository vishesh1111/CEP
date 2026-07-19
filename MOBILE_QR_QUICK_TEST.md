# Mobile QR Scanner - Quick Test Guide

## 🚀 Quick Deploy & Test

### 1. Deploy to Vercel
```bash
git add .
git commit -m "Fix: Mobile QR scanner with optimized settings"
git push
```

### 2. Test on Mobile (Chrome)
1. Open: `https://your-domain.vercel.app/admin/check-in`
2. Click "Start Camera"
3. Allow camera permissions
4. Point rear camera at QR code
5. Hold 20-40cm away
6. Wait 2-3 seconds

---

## ✅ What Should Happen

**When Working:**
- ✅ Rear camera opens (not selfie camera)
- ✅ Large green box appears (85% of screen)
- ✅ Instructions show at bottom (mobile only)
- ✅ Phone vibrates when code detected
- ✅ Toast: "✅ Successfully checked in!"
- ✅ Details display on screen

**Console Logs (if debugging):**
```
Device type: Mobile
Starting scanner with config: {fps: 5, ...}
Scanner started successfully
QR Code detected: REG-ABC123
Processing scan: REG-ABC123
```

---

## 🔍 Mobile Debugging (If Not Working)

### Chrome Remote Debugging (Android)
1. Connect phone via USB
2. Desktop: `chrome://inspect`
3. Select device
4. Click "Inspect"
5. View console logs

### Safari Remote Debugging (iOS)
1. Connect iPhone to Mac
2. Safari > Develop > [iPhone] > [Website]
3. View Web Inspector

---

## 🎯 Key Differences from Desktop

| Feature | Desktop | Mobile |
|---------|---------|--------|
| **FPS** | 10 | 5 |
| **QR Box** | 70% | 85% |
| **Detection Time** | 0.5-1s | 1-3s |
| **Instructions** | Hidden | Visible |
| **Focus** | Auto | Continuous |

---

## 💡 Mobile Scanning Tips

**Distance:** 20-40cm (8-16 inches)  
**Lighting:** Bright, even lighting  
**Position:** Center QR in green box  
**Patience:** Wait 2-3 seconds  
**Stability:** Hold phone steady  

---

## 🐛 Common Issues

**Camera Opens But Doesn't Scan:**
- Move closer (25-30cm)
- Improve lighting
- Wait longer (3-5s)
- Clean camera lens
- Try different angle

**Permission Denied:**
- Chrome: Tap lock icon → Permissions → Camera → Allow
- Safari: Settings → Safari → Camera → Allow

**Wrong Camera (Front Camera):**
- Tap "Switch Camera" button
- Refresh page

**Blurry:**
- Tap screen to focus
- Hold at 25-35cm
- Wait for auto-focus
- Better lighting

---

## 📊 Expected Performance

**Good Conditions:**
- Detection: 1-2 seconds
- Success Rate: 95%+

**Poor Conditions:**
- Detection: 3-5 seconds
- May need multiple attempts

**Not Working:**
- Check console for errors
- Verify camera permissions
- Try different browser
- Ensure HTTPS enabled

---

## 🎉 Success Indicators

1. **Visual**
   - Green box highlights QR code
   - Mobile instructions visible
   - Toast notification appears

2. **Haptic**
   - Phone vibrates on scan

3. **UI Updates**
   - Last check-in card updates
   - Recent list shows new entry

4. **Console**
   - "QR Code detected" logged
   - "Processing scan" logged
   - No error messages

---

## 📱 Test Checklist

- [ ] Deploy to Vercel
- [ ] Test on Android Chrome
- [ ] Test on iOS Chrome/Safari
- [ ] Verify rear camera opens
- [ ] Check QR box size (large on mobile)
- [ ] Confirm instructions visible
- [ ] Test successful scan (1-3s)
- [ ] Verify haptic feedback
- [ ] Check toast notification
- [ ] Confirm check-in processes
- [ ] Test camera switch (if multiple)
- [ ] Verify no duplicate notifications

---

## 🆘 If Still Not Working

1. **Check Console Logs**
   - Use remote debugging
   - Look for "Scanner started successfully"
   - Look for errors

2. **Verify Configuration**
   - Device type should show "Mobile"
   - FPS should be 5 (not 10)
   - QR box should be larger

3. **Test Different Conditions**
   - Better lighting
   - Different distances
   - Different QR codes
   - Different browsers

4. **Report Issue**
   - Include device/browser info
   - Share console logs
   - Describe exact behavior
   - Mention what you tried

---

**Deploy now and test on real mobile devices!** 📱🚀
