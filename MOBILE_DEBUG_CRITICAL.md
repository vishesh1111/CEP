# 🚨 CRITICAL: Mobile QR Scanner Debug Guide

## Current Status: NOT WORKING ON MOBILE

Camera opens but doesn't detect QR codes on mobile Chrome.

---

## 🔍 IMMEDIATE DEBUG STEPS

### Step 1: Enable Remote Debugging (REQUIRED)

**Android + Chrome:**
1. Connect phone to computer via USB
2. Phone: Enable Developer Options → USB Debugging
3. Computer: Open Chrome → `chrome://inspect`
4. Click "Inspect" on your device
5. Navigate to check-in page on phone
6. Watch console logs in real-time

**iOS + Safari:**
1. Connect iPhone to Mac via USB
2. iPhone: Settings → Safari → Advanced → Web Inspector (ON)
3. Mac: Safari → Develop → [Your iPhone] → [Website]
4. Watch console in Web Inspector

---

## 📋 WHAT TO CHECK IN CONSOLE

### When you click "Start Camera", you MUST see:

```
=== STARTING SCANNER ===
Device type: MOBILE
Current camera index: 0 (or 1)
Available cameras: 1 (or 2)
Config: {fps: 3, qrbox: {...}, ...}
Camera to use: [camera-id-string]
✅ Scanner started successfully
Scanner state: 2 (SCANNING)
```

### When you point at QR code (after 3-5 seconds), you SHOULD see:

```
🎯 QR CODE DETECTED: REG-ABC123
✅ Processing scan: REG-ABC123
📳 Haptic feedback triggered
```

### If you DON'T see "QR CODE DETECTED" after 10 seconds:

**PROBLEM: Scanner not detecting codes**

Check for errors in console:
- Any red error messages?
- Any warnings about camera?
- Does scanner state show "2" (SCANNING)?

---

## 🎯 CRITICAL QUESTIONS TO ANSWER

Please answer these and report back:

### 1. Console Logs
- [ ] Does it say "Device type: MOBILE"?
- [ ] Does it say "Scanner started successfully"?
- [ ] What is the "Scanner state" number?
- [ ] Are there ANY red error messages?
- [ ] Do you see "QR CODE DETECTED" after pointing at code for 10 seconds?

### 2. Camera Behavior
- [ ] Does camera actually open (you see video feed)?
- [ ] Is it the REAR camera (not selfie)?
- [ ] Can you see the QR code clearly in the video?
- [ ] Is there a green box overlay?
- [ ] What's the lighting condition (bright/dim)?

### 3. QR Code
- [ ] Is the QR code printed or on screen?
- [ ] What size is it (approximate cm/inches)?
- [ ] Is it clear and not blurry?
- [ ] Can you take a photo of the QR code you're testing?

### 4. Device Info
- [ ] What phone model? (e.g., iPhone 14, Samsung S23)
- [ ] What OS version? (e.g., iOS 17, Android 13)
- [ ] What browser? (Chrome, Safari, other)
- [ ] What browser version? (check in Settings → About)

### 5. Permissions
- [ ] Did you allow camera permissions when prompted?
- [ ] Check browser settings - is camera allowed for this site?
- [ ] Try Settings → Apps → Chrome → Permissions → Camera → Allow

---

## 🔧 THINGS TO TRY (IN ORDER)

### Try #1: Force Rear Camera
1. If you see "Switch Camera" button, click it
2. Watch console - does it restart scanner?
3. Try scanning again

### Try #2: Better Lighting
1. Move to very bright area (near window or bright lights)
2. Avoid shadows on QR code
3. Try again

### Try #3: Optimal Distance
1. Start very close (10cm)
2. Slowly move back to 40cm
3. Watch console for detection

### Try #4: Different QR Code
1. Open this test QR code generator: https://www.qr-code-generator.com
2. Type "TEST123"
3. Generate QR code
4. Try scanning that QR code
5. Does console show "QR CODE DETECTED: TEST123"?

### Try #5: Clear Cache
1. Browser → Settings → Privacy → Clear browsing data
2. Select "Cached images and files"
3. Clear
4. Reload page and try again

### Try #6: Different Browser
1. Try Safari (if on iPhone)
2. Try Chrome (if on Android)
3. Try Samsung Internet (if Samsung phone)
4. Does it work in any of them?

---

## 🚩 COMMON ISSUES & FIXES

### Issue A: Console shows "Scanner started" but no "QR CODE DETECTED"

**This is the current problem.**

Possible causes:
1. **FPS too low** - Scanner checking too slowly
2. **QR box wrong size** - Not covering the code
3. **Camera resolution too low** - Can't read the code
4. **Focus issues** - Camera not focusing properly
5. **Library bug** - html5-qrcode issue on this device

**Test:**
- Take a screenshot while camera is open with QR in view
- Share screenshot - we can see if QR is visible/clear
- Check console for exact FPS and qrbox values

### Issue B: Camera doesn't open at all

**Error message in console?**
- "NotAllowedError" → Check permissions
- "NotFoundError" → No camera available
- "OverconstrainedError" → Video constraints too strict

### Issue C: Front camera opens instead of rear

**Check console:**
- What does "Camera to use" say?
- Does camera list show multiple cameras?

**Try:**
- Switch camera button
- Or clear site data and allow rear camera

### Issue D: Very slow or freezing

**Device performance issue**
- Close other apps
- Restart phone
- Try again

---

## 🔬 ADVANCED DEBUGGING

### Test Camera Access Directly

Open this page on your phone:
`https://webrtc.github.io/samples/src/content/getusermedia/gum/`

1. Click "Open camera"
2. Does it work?
3. Does rear camera work?
4. If this doesn't work, the issue is phone/browser permissions, not our code

### Test QR Detection Separately

Open this demo:
`https://blog.minhazav.dev/research/html5-qrcode`

1. Try their scanner
2. Does it detect QR codes?
3. If this doesn't work, html5-qrcode library may not work on your device

---

## 📸 WHAT TO SEND ME

To help debug, please send:

1. **Screenshot of console logs** (when scanner starts)
2. **Screenshot of camera view** (with QR code visible)
3. **Photo of the QR code** you're trying to scan
4. **Device info**: Phone model, OS version, Browser version
5. **Answers to the checklist** above
6. **Results of Try #4** (test QR code from generator)

---

## 🎯 CURRENT SETTINGS (v3)

```typescript
// Mobile detection: Active
isMobile: true (detected from user agent)

// Scanner config:
fps: 3 (very low for mobile)
qrbox: { width: 250, height: 250 } (fixed, not dynamic)
facingMode: 'environment' (rear camera)
video: {
  width: { min: 640, ideal: 1280, max: 1920 },
  height: { min: 480, ideal: 720, max: 1080 }
}
```

**Changes from v2:**
- ✅ FPS reduced from 5 → 3 (slower but more reliable)
- ✅ QR box changed from dynamic 85% → fixed 250px
- ✅ Video constraints more specific (min/ideal/max)
- ✅ Enhanced console logging with emojis
- ✅ Better rear camera detection
- ✅ More prominent mobile UI

---

## 🆘 IF NOTHING WORKS

### Plan B: Alternative Input Methods

The app has **TWO other ways** to check in:

1. **Image Upload**
   - Take photo of QR code
   - Upload image
   - Scanner extracts code from image
   - Should work on ALL devices

2. **Manual Entry**
   - Type QR code manually (e.g., REG-ABC123)
   - Press "Check In"
   - Always works

### Plan C: Different Scanner Library

If html5-qrcode doesn't work on your device, we can switch to:
- `react-qr-reader` (different library)
- `jsqr` (more basic but more compatible)
- Native browser API (if supported)

But first, we need to know:
- **What exactly is failing?**
- **What do the console logs show?**
- **Does the test QR code generator work?**

---

## 🚀 NEXT STEPS

1. **Deploy latest changes**: `git push`
2. **Enable remote debugging** (critical!)
3. **Open check-in page on mobile**
4. **Click "Start Camera"**
5. **Copy ALL console logs** (screenshot or text)
6. **Try scanning for 10 seconds**
7. **Report back with:**
   - Console logs
   - Screenshots
   - Answers to checklist
   - Results of test QR code

**I need to see the actual console logs to diagnose the issue!**

---

## 📞 REPORT FORMAT

```
DEVICE: iPhone 14 Pro / Samsung Galaxy S23
OS: iOS 17.2 / Android 13
BROWSER: Chrome 120 / Safari 17
URL: https://your-app.vercel.app/admin/check-in

CONSOLE LOGS ON START:
[paste logs here]

AFTER POINTING AT QR (10 seconds):
[paste logs here]

CAMERA: Opens? YES/NO
REAR CAMERA: YES/NO
VIDEO FEED: Clear? YES/NO
QR VISIBLE: YES/NO
GREEN BOX: YES/NO

TRIED:
- Different lighting: YES/NO
- Different distance: YES/NO
- Test QR code: YES/NO - Result: [detected or not]
- Different browser: YES/NO - Which: [name]

ERRORS IN CONSOLE:
[any red errors]
```

**Send this report and we can diagnose exactly what's wrong!** 🔍
