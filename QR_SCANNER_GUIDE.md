# QR Code Scanner Guide for Admin Check-in

## Overview

The admin check-in page now features an enhanced camera-based QR code scanner that allows event organizers to quickly check in registered participants by scanning their QR codes directly from their phones or printed tickets.

## Features

### 1. **Live Camera Scanning**
- Real-time QR code detection using device camera
- Automatic scanning when QR code is detected
- Visual feedback with camera preview
- Haptic feedback on successful scan (on supported devices)

### 2. **Multi-Camera Support**
- Automatically detects all available cameras on the device
- Easy switching between front and back cameras
- Shows current camera name and count
- Default uses environment-facing (back) camera

### 3. **Multiple Input Methods**
The check-in system supports three ways to check in participants:

#### a) Camera Scanning (Recommended)
1. Click "Start Camera" button
2. Point camera at the QR code on participant's phone/ticket
3. Scanner automatically detects and processes the QR code
4. Shows check-in confirmation immediately

#### b) Image Upload
1. Drag and drop a screenshot/photo of QR code
2. Or click the upload zone to browse for an image
3. System automatically extracts and processes the QR code

#### c) Manual Entry
1. Type or paste the QR code text (e.g., "REG-A3F7B2")
2. Press Enter or click "Check In" button
3. System validates and processes the code

## How to Use

### Starting the Scanner

1. Navigate to **Admin Panel** → **Check-in**
2. The scanner section is on the left side
3. Click the **"Start Camera"** button
4. Grant camera permissions when prompted by your browser
5. Point the camera at a participant's QR code

### During Scanning

- **Green frame**: QR code detected successfully
- **Auto check-in**: Happens automatically when code is scanned
- **Cooldown period**: 2-second delay between scans to prevent duplicates
- **Real-time feedback**: Toast notification shows success/error

### Switching Cameras

If you have multiple cameras (e.g., laptop with front/back cameras):
1. Click the **camera switch icon** button (appears only when multiple cameras available)
2. Scanner will restart with the next available camera
3. Current camera name is displayed below the controls

### Stopping the Scanner

- Click **"Stop Camera"** button to release the camera
- Camera automatically stops when you navigate away from the page
- Scanner can be restarted at any time

## Check-in Display

### Last Check-in Card
Shows detailed information about the most recent check-in:
- **Student name and email**
- **Event details** (title, date, venue)
- **Registration time**
- **QR code used**
- **Event category**
- **Status badge** (Checked In)

### Recent Check-ins List
Displays the last 10 check-ins in chronological order:
- Student name
- Event name
- QR code
- Timestamp

## Browser Permissions

### Required Permissions
- **Camera access**: Required for QR code scanning
- **Media devices**: Needed to list available cameras

### Granting Permissions

**Chrome/Edge:**
1. Click the camera icon in address bar
2. Select "Allow" for camera access
3. Permission saved for future visits

**Firefox:**
1. Click the permissions icon in address bar
2. Enable camera access
3. Refresh the page if needed

**Safari:**
1. Click "Safari" → "Settings for this Website"
2. Allow camera access
3. Reload the page

### Troubleshooting Permissions

If camera doesn't start:
1. Check browser permissions settings
2. Ensure no other app is using the camera
3. Try reloading the page
4. Use a different browser if issues persist

## Best Practices

### For Optimal Scanning

1. **Lighting**: Ensure good lighting on the QR code
2. **Distance**: Hold phone/ticket 15-30cm from camera
3. **Stability**: Keep the QR code steady for 1-2 seconds
4. **Angle**: QR code should face camera directly (not tilted)
5. **Focus**: Wait for camera to focus before scanning

### During Events

1. **Test beforehand**: Test the scanner 30 minutes before event start
2. **Backup device**: Have a backup device ready
3. **Multiple stations**: Use multiple devices for large events
4. **Network**: Ensure stable internet connection
5. **Battery**: Keep devices charged or plugged in

### For High-Traffic Events

1. **Use camera scanning**: Fastest method for continuous check-ins
2. **Position the scanner**: Set up at entrance with good lighting
3. **Have staff assist**: Help participants prepare QR codes
4. **Monitor history**: Watch recent check-ins for verification
5. **Fallback method**: Keep manual entry ready for issues

## Technical Details

### QR Code Format
- Pattern: `REG-XXXXXX` (where X is alphanumeric)
- Case-insensitive (automatically converted to uppercase)
- Must be from confirmed registrations
- Each code can only be used once

### Scanner Specifications
- **Frame rate**: 10 FPS
- **Scan box**: 250x250 pixels
- **Supported codes**: QR codes only
- **Detection time**: ~0.1-0.5 seconds
- **Cooldown**: 2 seconds between successful scans

### Validation Rules
When a QR code is scanned, the system checks:
1. ✅ QR code exists in database
2. ✅ Registration status is "confirmed"
3. ✅ Not already checked in
4. ✅ Valid event association

### Error Messages

- **"Invalid QR code, already checked in, or registration not confirmed"**
  - QR code not found in system
  - Participant already checked in
  - Registration not confirmed

- **"Unable to access cameras"**
  - Browser doesn't support camera access
  - Permissions denied
  - No camera available on device

- **"Failed to start camera"**
  - Camera in use by another application
  - Browser permissions issue
  - Hardware error

- **"No QR code found in image"**
  - Uploaded image doesn't contain a valid QR code
  - QR code too small or blurry
  - Image format not supported

## Security Features

1. **Authentication required**: Only logged-in admins can access check-in
2. **Single-use codes**: Each QR code can only be used once
3. **Status validation**: Only confirmed registrations can be checked in
4. **Audit trail**: All check-ins are logged with timestamp
5. **Real-time updates**: Check-in history syncs across devices

## Mobile Device Support

### iOS (Safari)
- ✅ Camera scanning works
- ✅ Front/back camera switching
- ✅ Image upload supported
- 📱 Works best on iOS 14+

### Android (Chrome)
- ✅ Full feature support
- ✅ Multiple camera selection
- ✅ Haptic feedback
- 📱 Works on Android 8+

### Tablets
- ✅ Ideal for registration desk
- ✅ Larger screen for visibility
- ✅ Better camera positioning
- 💡 Recommended for events

## Tips for Event Day

### Pre-Event
- [ ] Test scanner with sample QR codes
- [ ] Verify camera permissions granted
- [ ] Check internet connectivity
- [ ] Prepare backup check-in device
- [ ] Brief staff on usage

### During Event
- [ ] Position scanner at eye level
- [ ] Ensure adequate lighting
- [ ] Have manual entry ready
- [ ] Monitor check-in history
- [ ] Address issues promptly

### Post-Event
- [ ] Review check-in statistics
- [ ] Export attendance data if needed
- [ ] Note any technical issues
- [ ] Prepare improvements for next event

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify camera permissions
3. Test with manual entry method
4. Try different browser/device
5. Contact technical support with error details

## Feature Roadmap

Coming soon:
- 🔜 Bulk check-in mode
- 🔜 Offline check-in capability
- 🔜 Check-in statistics dashboard
- 🔜 Export check-in reports
- 🔜 Sound effects on successful scan
