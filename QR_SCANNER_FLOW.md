# QR Code Scanner Flow Diagram

## User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Admin Check-in Page                          │
│                     /admin/check-in                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Three Input Methods                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐    │
│  │   Camera    │  │   Image     │  │   Manual Entry          │    │
│  │   Scanning  │  │   Upload    │  │   (Type Code)           │    │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘    │
└─────────┼────────────────┼─────────────────────┼──────────────────┘
          │                │                     │
          │                │                     │
          ▼                ▼                     ▼
    ┌──────────────────────────────────────────────┐
    │         QR Code Extracted/Entered            │
    │         (e.g., "REG-A3F7B2")                 │
    └──────────────────┬───────────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────────┐
    │     Convert to Uppercase & Trim              │
    │     "REG-A3F7B2" → "REG-A3F7B2"              │
    └──────────────────┬───────────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────────┐
    │     Server: checkInRegistration()            │
    │     - Find registration with QR code         │
    │     - Validate status = 'confirmed'          │
    │     - Check checked_in = false               │
    └──────────────────┬───────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
    ┌─────────┐            ┌──────────────┐
    │ SUCCESS │            │    ERROR     │
    └────┬────┘            └───────┬──────┘
         │                         │
         ▼                         ▼
┌──────────────────┐      ┌─────────────────────────┐
│ Update DB:       │      │ Show Error:             │
│ checked_in=true  │      │ - Invalid QR code       │
└────┬─────────────┘      │ - Already checked in    │
     │                    │ - Not confirmed         │
     ▼                    └─────────────────────────┘
┌──────────────────┐
│ Fetch Full Data: │
│ - User info      │
│ - Event info     │
│ - Registration   │
└────┬─────────────┘
     │
     ▼
┌──────────────────────────────────────┐
│         Update UI:                   │
│  ✓ Success toast with name           │
│  ✓ Last Check-in Card                │
│  ✓ Recent Check-ins List             │
│  ✓ Haptic feedback (mobile)          │
└──────────────────────────────────────┘
```

## Camera Scanner State Machine

```
┌──────────────┐
│  INITIAL     │
│  (Stopped)   │
└──────┬───────┘
       │
       │ Click "Start Camera"
       ▼
┌──────────────┐
│  LOADING     │
│  (Starting)  │
└──────┬───────┘
       │
       │ Camera Access Granted
       ▼
┌──────────────────────────┐
│     SCANNING             │
│  (Active - Detecting)    │◄──────┐
└──────┬───────────────────┘       │
       │                           │
       │ QR Code Detected          │
       ▼                           │
┌──────────────────────────┐       │
│   CODE DETECTED          │       │
│   (Processing)           │       │
└──────┬───────────────────┘       │
       │                           │
       │ Check-in Complete         │
       ▼                           │
┌──────────────────────────┐       │
│   COOLDOWN               │       │
│   (2 seconds)            │───────┘
└──────────────────────────┘

       From any state:
       Click "Stop Camera"
              │
              ▼
       ┌──────────────┐
       │  STOPPED     │
       └──────────────┘
```

## Camera Selection Flow

```
┌─────────────────────────────────────────┐
│     Scanner Initialization              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Html5Qrcode.getCameras()              │
│   Detect all available cameras          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Store cameras array:                  │
│   [                                     │
│     { id: "cam1", label: "Front" }      │
│     { id: "cam2", label: "Back" }       │
│   ]                                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Default: Use first camera             │
│   (Usually back/environment camera)     │
└──────────────┬──────────────────────────┘
               │
               │ Click Switch Camera
               ▼
┌─────────────────────────────────────────┐
│   1. Stop current camera                │
│   2. Increment camera index             │
│   3. Start next camera                  │
│   4. Loop back to first if at end       │
└─────────────────────────────────────────┘
```

## Check-in Validation Logic

```
                    QR Code Scanned
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  Search registrations table     │
        │  WHERE qr_code = 'REG-XXXXX'    │
        └────────┬────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
 Found?                    Not Found?
    │                         │
    ▼                         ▼
┌────────────┐         ┌──────────────┐
│ Check      │         │ Return Error │
│ Status     │         │ "Invalid QR" │
└─────┬──────┘         └──────────────┘
      │
      ▼
Status = 'confirmed'?
      │
  ┌───┴───┐
  │       │
  ▼       ▼
 Yes      No
  │       │
  │       └──► Error: "Not confirmed"
  │
  ▼
checked_in = false?
  │
  ┌───┴───┐
  │       │
  ▼       ▼
 Yes      No
  │       │
  │       └──► Error: "Already checked in"
  │
  ▼
┌────────────────────────┐
│ Update registration:   │
│ SET checked_in = true  │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Fetch full details     │
│ with user & event data │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Return success with    │
│ participant data       │
└────────────────────────┘
```

## Data Structure

### Input (QR Code)
```typescript
string: "REG-A3F7B2"
```

### Database Query
```sql
SELECT * FROM registrations
WHERE qr_code = 'REG-A3F7B2'
  AND status = 'confirmed'
  AND checked_in = false
LIMIT 1
```

### Output (Success)
```typescript
{
  id: "uuid",
  user_id: "uuid",
  event_id: "uuid",
  status: "confirmed",
  checked_in: true,
  qr_code: "REG-A3F7B2",
  registered_at: "2026-07-19T10:30:00Z",
  user: {
    name: "John Doe",
    email: "john@university.edu"
  },
  event: {
    title: "Web Development Bootcamp",
    event_date: "2026-07-25T14:00:00Z",
    venue: "Computer Lab 3, IT Block",
    category: "Workshop"
  }
}
```

## UI Components Architecture

```
CheckInPage
│
├── QrScanner Component
│   ├── Camera Preview (html5-qrcode)
│   ├── Start/Stop Buttons
│   └── Camera Switch Button
│
├── Image Upload Zone
│   ├── Drag & Drop Area
│   └── File Input
│
├── Manual Entry
│   ├── Text Input
│   └── Submit Button
│
├── Last Check-in Card
│   ├── User Info
│   ├── Event Details
│   ├── Registration Info
│   └── Status Badge
│
└── Recent Check-ins List
    └── Check-in Items (last 10)
```

## Error Handling Flow

```
┌────────────────────────┐
│  Error Occurs          │
└───────┬────────────────┘
        │
        ▼
┌────────────────────────────────────┐
│  Identify Error Type               │
└───────┬────────────────────────────┘
        │
        ├──► Camera Error
        │    └──► Show: "Failed to start camera"
        │         Suggest: Check permissions, reload
        │
        ├──► Invalid QR Code
        │    └──► Show: "Invalid QR code"
        │         Suggest: Verify registration
        │
        ├──► Already Checked In
        │    └──► Show: "Already checked in"
        │         Suggest: Check recent list
        │
        ├──► Not Confirmed
        │    └──► Show: "Registration not confirmed"
        │         Suggest: Check registration status
        │
        └──► Network Error
             └──► Show: "Connection error"
                  Suggest: Check internet, retry
```

## Performance Optimizations

```
Scanner Performance
├── Frame Rate: 10 FPS (balance speed/CPU)
├── Scan Box: 250x250px (focus area)
├── Cooldown: 2s (prevent duplicates)
└── Auto-focus: Enabled

Database Performance
├── Indexed Fields:
│   ├── qr_code (primary lookup)
│   ├── status (filter)
│   └── checked_in (filter)
└── Single Query: All data in one fetch

UI Performance
├── Dynamic Import: QrScanner lazy-loaded
├── Debounced Input: Manual entry
├── Optimistic Updates: Immediate feedback
└── Limited History: Last 10 check-ins only
```

## Security Layers

```
┌─────────────────────────────────────┐
│  1. Admin Authentication            │
│     ✓ Must be logged in             │
│     ✓ Must have admin role          │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  2. Server-Side Validation          │
│     ✓ QR code exists in DB          │
│     ✓ Registration confirmed        │
│     ✓ Not already checked in        │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  3. Single-Use Enforcement          │
│     ✓ Flag checked_in = true        │
│     ✓ Timestamp recorded            │
│     ✓ Cannot reuse QR code          │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  4. Audit Trail                     │
│     ✓ User ID logged                │
│     ✓ Event ID logged               │
│     ✓ Timestamp logged              │
│     ✓ Admin ID recorded             │
└─────────────────────────────────────┘
```

## Browser Compatibility Matrix

```
Feature              Chrome  Firefox  Safari  Edge
─────────────────────────────────────────────────
Camera Access        ✅      ✅       ✅      ✅
Multi-Camera         ✅      ✅       ✅      ✅
QR Scanning          ✅      ✅       ✅      ✅
Image Upload         ✅      ✅       ✅      ✅
Haptic Feedback      ✅      ✅       📱      ✅
Drag & Drop          ✅      ✅       ✅      ✅
WebRTC               ✅      ✅       ✅      ✅

✅ Fully Supported
📱 Mobile Only
```

## Event Day Workflow

```
Pre-Event (T-30 min)
├── Test camera scanner
├── Verify permissions
├── Check internet connection
└── Position scanner at entrance

During Event
├── Monitor check-ins in real-time
├── Watch for error patterns
├── Use backup methods if needed
└── Track attendance numbers

Post-Event
├── Review check-in statistics
├── Export attendance report
├── Note technical issues
└── Plan improvements
```

---

This flow diagram provides a visual representation of how the QR code scanner works from start to finish, including all the error handling, state management, and security checks involved in the process.
