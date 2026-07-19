# Camera Scanner Visual Guide

## Interface Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                     🎫 QR Code Check-in                                 │
│          Scan student QR codes or enter manually to check them in      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┬────────────────────────────────────────┐
│                                │                                        │
│         🎥 Scanner             │        ✅ Last Check-in                │
│                                │                                        │
│  ┌──────────────────────────┐ │   ┌─────────────────────────────────┐ │
│  │                          │ │   │  👤 John Doe                     │ │
│  │   [Camera Preview]       │ │   │  📧 john@university.edu          │ │
│  │                          │ │   │  ✅ Checked In                   │ │
│  │   (Live Video Feed)      │ │   │                                 │ │
│  │                          │ │   │  📅 Web Development Bootcamp     │ │
│  │   [Scanning QR Codes]    │ │   │  🕐 25 Jul 2026 at 2:00 PM       │ │
│  │                          │ │   │  📍 Computer Lab 3, IT Block     │ │
│  │                          │ │   │  🕒 Registered: 19 Jul 2026      │ │
│  └──────────────────────────┘ │   │  🎫 REG-A3F7B2                   │ │
│                                │   │  🏷️  Workshop                    │ │
│  [Start Camera] [Stop Camera] │   └─────────────────────────────────┘ │
│  [Switch Camera (↻)]           │                                        │
│  Using: Back Camera (1/2)      │                                        │
│                                │                                        │
│  ┌──────────────────────────┐ │                                        │
│  │  Drag & Drop QR Image    │ │                                        │
│  │  📷 or click to browse   │ │                                        │
│  └──────────────────────────┘ │                                        │
│                                │                                        │
│        ─── Or manual entry ─── │                                        │
│                                │                                        │
│  [REG-A3F7B2______] [Check In] │                                        │
│                                │                                        │
└────────────────────────────────┴────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        📋 Recent Check-ins                              │
│                                                                         │
│  ✅ John Doe - Web Development Bootcamp          REG-A3F7B2   Just now  │
│  ✅ Jane Smith - AI Workshop                     REG-B4K8C3   Just now  │
│  ✅ Bob Johnson - Coding Contest                 REG-C5L9D4   Just now  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Camera States

### State 1: Camera Not Started (Initial)
```
┌────────────────────────────────┐
│  🎥 Scanner                    │
│                                │
│  ┌──────────────────────────┐ │
│  │                          │ │
│  │      📷                  │ │
│  │                          │ │
│  │  Camera ready to scan    │ │
│  │                          │ │
│  └──────────────────────────┘ │
│                                │
│     [Start Camera]             │
│                                │
└────────────────────────────────┘
```

### State 2: Loading (Starting Camera)
```
┌────────────────────────────────┐
│  🎥 Scanner                    │
│                                │
│  ┌──────────────────────────┐ │
│  │                          │ │
│  │      ⏳                  │ │
│  │                          │ │
│  │    Starting camera...    │ │
│  │                          │ │
│  └──────────────────────────┘ │
│                                │
│     [Starting...]  ⏳          │
│                                │
└────────────────────────────────┘
```

### State 3: Camera Active (Scanning)
```
┌────────────────────────────────┐
│  🎥 Scanner                    │
│                                │
│  ┌──────────────────────────┐ │
│  │  ╔══════════════════╗    │ │
│  │  ║                  ║    │ │
│  │  ║  [Live Video]    ║    │ │
│  │  ║                  ║    │ │
│  │  ║  Point at QR     ║    │ │
│  │  ║                  ║    │ │
│  │  ╚══════════════════╝    │ │
│  └──────────────────────────┘ │
│                                │
│  [Stop Camera]  [Switch (↻)]  │
│  Using: Back Camera (1/2)      │
│                                │
└────────────────────────────────┘
```

### State 4: QR Code Detected
```
┌────────────────────────────────┐
│  🎥 Scanner                    │
│                                │
│  ┌──────────────────────────┐ │
│  │  ╔══════════════════╗    │ │
│  │  ║  ┌─────────────┐ ║    │ │
│  │  ║  │█▀▀█ █▀█ █▀▀│ ║    │ │
│  │  ║  │█ ▀█ ▀▀▄ ▀▀▄│ ║    │ │
│  │  ║  │█▄▄█ ▀▀▀ ▀▀▀│ ║    │ │
│  │  ║  └─────────────┘ ║    │ │
│  │  ╚══════════════════╝    │ │
│  └──────────────────────────┘ │
│                                │
│  ✅ Processing...              │
│                                │
└────────────────────────────────┘
```

---

## Success Flow Animation

```
Step 1: Point Camera at QR Code
┌──────────────────┐
│  📱 Phone shows  │
│  ╔════════════╗  │
│  ║ ▄▄▄▄▄▄▄▄▄ ║  │
│  ║ █ ▄▄▄ █ █ ║  │
│  ║ █ ███ █ █ ║  │ <- Participant's QR
│  ║ █▄▄▄▄▄█ █ ║  │
│  ║ ▄▄▄▄▄▄▄▄▄ ║  │
│  ╚════════════╝  │
│  REG-A3F7B2      │
└──────────────────┘
         ↓
         
Step 2: Camera Detects QR
┌──────────────────┐
│  💻 Scanner      │
│  ┌────────────┐  │
│  │ Scanning...│  │
│  │ ✓ Detected │  │
│  └────────────┘  │
└──────────────────┘
         ↓
         
Step 3: Server Validates
┌──────────────────┐
│  ⚙️  Processing   │
│  ┌────────────┐  │
│  │ Checking DB│  │
│  │ Validating │  │
│  └────────────┘  │
└──────────────────┘
         ↓
         
Step 4: Success!
┌──────────────────────────┐
│  ✅ Success!             │
│                          │
│  👤 John Doe checked in  │
│  📧 john@university.edu  │
│  📅 Web Dev Bootcamp     │
│                          │
│  🎉 Vibration feedback   │
└──────────────────────────┘
```

---

## Multi-Camera Interface

### With Multiple Cameras Available
```
┌────────────────────────────────┐
│  🎥 Scanner                    │
│                                │
│  ┌──────────────────────────┐ │
│  │  [Active Camera Feed]    │ │
│  │  [Scanning Area]         │ │
│  └──────────────────────────┘ │
│                                │
│  [Stop Camera]  [↻ Switch]    │
│                                │
│  📹 Using: Back Camera (1/3)   │
│     Available:                 │
│     • Front Camera             │
│     • Back Camera    ← current │
│     • External Webcam          │
│                                │
└────────────────────────────────┘
```

### Camera Switch Animation
```
Before:                  After:
┌─────────────┐         ┌─────────────┐
│ Back Camera │  [↻]    │Front Camera │
│             │  ─────> │             │
│   [View]    │         │   [View]    │
└─────────────┘         └─────────────┘
  Camera 1/2              Camera 2/2
```

---

## Toast Notifications

### Loading State
```
┌────────────────────────────────┐
│  ⏳ Checking in REG-A3F7B2...  │
└────────────────────────────────┘
```

### Success State
```
┌────────────────────────────────┐
│  ✅ Successfully checked in!   │
│                                │
│  John Doe                      │
│  Participant checked in        │
└────────────────────────────────┘
```

### Error States
```
┌────────────────────────────────┐
│  ❌ Invalid QR code, already   │
│     checked in, or registration│
│     not confirmed              │
└────────────────────────────────┘

┌────────────────────────────────┐
│  ❌ Failed to start camera     │
└────────────────────────────────┘

┌────────────────────────────────┐
│  ❌ No QR code found in image  │
└────────────────────────────────┘
```

---

## Image Upload Interface

### Drag & Drop Zone (Idle)
```
┌────────────────────────────────┐
│  Drag & Drop QR Code Image     │
│                                │
│        📷 Image Icon           │
│                                │
│   Drag & drop QR code image    │
│   or click to browse           │
│                                │
└────────────────────────────────┘
```

### Drag & Drop Zone (Dragging Over)
```
┌════════════════════════════════┐
║  Drop QR Code Image Here       ║
║                                ║
║        📤 Upload Icon          ║
║        (animated bounce)       ║
║                                ║
║   Drop QR code image here      ║
║                                ║
└════════════════════════════════┘
```

### Processing Upload
```
┌────────────────────────────────┐
│  Processing Image...           │
│                                │
│        ⏳ Loading              │
│                                │
│   Scanning QR code from image..│
│                                │
└────────────────────────────────┘
```

---

## Manual Entry Interface

### Input Field
```
┌────────────────────────────────────┐
│  ─── Or manual entry ───          │
│                                    │
│  [REG-A3F7B2____________]  [Check In]
│                                    │
│  Enter QR code (e.g., REG-A3F7B2) │
└────────────────────────────────────┘
```

### Processing
```
┌────────────────────────────────────┐
│  [REG-A3F7B2____________]  [Checking...]
│                             ⏳     │
└────────────────────────────────────┘
```

---

## Last Check-in Card (Detailed)

### Empty State
```
┌─────────────────────────────────────┐
│  ⚠️  Awaiting Check-in              │
│                                     │
│       🎫                            │
│     (Large icon)                    │
│                                     │
│  Scan a QR code to see              │
│  check-in details                   │
│                                     │
└─────────────────────────────────────┘
```

### With Check-in Data
```
┌─────────────────────────────────────┐
│  ✅ Last Check-in                   │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  👤  John Doe                 │ │
│  │      john@university.edu      │ │
│  │      ✅ Checked In            │ │
│  └───────────────────────────────┘ │
│                                     │
│  ────────────────────────────────── │
│                                     │
│  📅  Web Development Bootcamp       │
│      25 Jul 2026 at 2:00 PM         │
│                                     │
│  📍  Computer Lab 3, IT Block       │
│                                     │
│  🕒  Registered: 19 Jul 2026        │
│                                     │
│  🎫  REG-A3F7B2                     │
│                                     │
│  🏷️   Workshop                      │
│                                     │
└─────────────────────────────────────┘
```

---

## Recent Check-ins List

```
┌─────────────────────────────────────────────────────────────┐
│  📋 Recent Check-ins                                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ✅ John Doe                          Just now         │ │
│  │    Web Development Bootcamp          REG-A3F7B2       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ✅ Jane Smith                        Just now         │ │
│  │    AI Workshop                       REG-B4K8C3       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ✅ Bob Johnson                       Just now         │ │
│  │    Coding Contest                    REG-C5L9D4       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Mobile View (Responsive)

### Portrait Mode
```
┌─────────────────────┐
│  🎫 QR Check-in     │
├─────────────────────┤
│                     │
│  🎥 Scanner         │
│  ┌───────────────┐ │
│  │   [Camera]    │ │
│  │   [Preview]   │ │
│  └───────────────┘ │
│                     │
│  [Start Camera]    │
│                     │
├─────────────────────┤
│                     │
│  ✅ Last Check-in   │
│  👤 John Doe        │
│  📅 Event           │
│  ✅ Checked In      │
│                     │
├─────────────────────┤
│                     │
│  📋 Recent          │
│  ✅ John Doe        │
│  ✅ Jane Smith      │
│                     │
└─────────────────────┘
```

---

## Button States

### Start Camera Button
```
Idle:      [  🎥 Start Camera  ]
Loading:   [  ⏳ Starting...   ]
```

### Stop Camera Button
```
Active:    [  🛑 Stop Camera   ]
Loading:   [  ⏳ Stopping...   ]
```

### Switch Camera Button
```
Available: [  ↻  ]  (circular arrow icon)
Hidden:    (when only one camera)
```

---

## Color Coding

### Success (Green)
```
✅ Checked In (badge)
✅ Success messages
🟢 Green border on card
```

### Loading (Blue)
```
⏳ Processing toast
🔵 Loading spinner
```

### Error (Red)
```
❌ Error messages
🔴 Destructive button (Stop)
```

### Neutral (Gray)
```
📋 Recent check-ins
📊 Informational text
⚪ Default state
```

---

## Accessibility Features

### Visual Feedback
- ✅ Clear button states
- ✅ Color-coded status
- ✅ Loading indicators
- ✅ Success/error messages

### Haptic Feedback
- ✅ Vibration on successful scan (mobile)
- ✅ 200ms pulse

### Screen Readers
- ✅ "Toggle Menu" for hamburger
- ✅ Proper ARIA labels
- ✅ Semantic HTML

---

## Animation Timing

### Camera Start
```
Click → 100ms → Permission → 500ms → Camera Active
                 (browser prompt)
```

### QR Detection
```
QR in View → 100-500ms → Detection → Immediate Processing
```

### Check-in Flow
```
Detect → 0ms → Toast → 200ms → Haptic → 300ms → Card Update
```

### Cooldown
```
Success → 2000ms → Ready for Next Scan
```

---

## Responsive Breakpoints

### Desktop (≥768px)
```
Two columns: Scanner | Last Check-in
Full width: Recent Check-ins
```

### Tablet (≥640px, <768px)
```
Stacked layout
Scanner full width
Last Check-in full width
Recent Check-ins full width
```

### Mobile (<640px)
```
Single column
Compact scanner
Simplified check-in card
Shorter recent list (5 items)
```

---

## Icon Legend

```
🎥 Camera/Scanner
📷 Image/Photo
👤 User/Person
📧 Email
✅ Success/Checked In
❌ Error/Failed
⏳ Loading/Processing
📅 Event/Calendar
🕒 Time/Clock
📍 Location/Venue
🎫 Ticket/QR Code
🏷️  Category/Tag
📋 List/History
↻ Switch/Rotate
🛑 Stop
🎉 Celebration/Success
📱 Mobile Device
💻 Computer/Desktop
⚙️  Settings/Process
🔒 Security/Lock
```

---

This visual guide provides a comprehensive overview of what users will see when using the camera scanner feature!
