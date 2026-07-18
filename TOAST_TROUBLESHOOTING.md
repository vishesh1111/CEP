# Toast Not Showing - Troubleshooting Guide

## 🔍 Debug Steps

### Step 1: Check Browser Console

1. Open your browser DevTools (F12 or Cmd+Option+I on Mac)
2. Go to the "Console" tab
3. Click the "Cancel" button on any upcoming event
4. Look for these debug messages:

```
🚀 handleCancel called
Test: Cancel button clicked!
📋 Toast ID: [some number]
```

**If you see these**: The function is running! Toast system might have an issue.

**If you DON'T see these**: The button click isn't reaching handleCancel.

---

### Step 2: Test Simple Toast First

When you click Cancel, you should see **TWO toasts**:
1. First: "Test: Cancel button clicked!" (appears for 2 seconds)
2. Second: "Registration will be cancelled in 5 seconds..." (with Undo button)

**If you see toast #1 but not #2**: The `toast.loading()` with action might have an issue

**If you see neither**: Toaster component isn't rendering

---

### Step 3: Check Toaster Position

Look at the **top-right corner** of your screen when you click Cancel.

The Toaster is configured with `position="top-right"` in `src/components/providers.tsx`

---

### Step 4: Verify Toaster is Rendering

1. Open browser DevTools
2. Go to "Elements" or "Inspector" tab
3. Search for: `sonner` or `toaster`
4. You should see a `<ol>` element with data attributes

**If you don't see it**: Toaster component isn't being rendered

---

## 🐛 Common Issues & Fixes

### Issue 1: No Console Messages

**Problem**: handleCancel isn't being called

**Fix**: Check if the Button is properly bound

```tsx
<Button
  onClick={handleCancel}  // ← This should be there
  disabled={isCancelling}
>
```

---

### Issue 2: Console Shows Messages But No Toast

**Problem**: Sonner library issue or Toaster not rendering

**Fix 1**: Verify Toaster in providers.tsx
```tsx
// Should have:
import { Toaster } from 'sonner';

<Toaster richColors position="top-right" />
```

**Fix 2**: Try different position
```tsx
<Toaster richColors position="bottom-right" />
```

---

### Issue 3: Test Toast Shows, Main Toast Doesn't

**Problem**: `toast.loading()` with action prop might not be supported

**Alternative Implementation**: Use promise toast instead

```typescript
const handleCancel = async () => {
  setIsCancelling(true);
  
  // Simpler toast without action
  toast.info('Registration will be cancelled in 5 seconds. Refresh to undo.', {
    duration: 5000,
  });
  
  // Timeout still works
  cancelTimeoutRef.current = setTimeout(async () => {
    const result = await cancelRegistration(registration.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Registration cancelled successfully');
    }
  }, 5000);
};
```

---

### Issue 4: Toast Appears Behind Other Elements

**Problem**: z-index issue

**Fix**: Check CSS - Toaster should have high z-index

In your global CSS or providers:
```css
[data-sonner-toaster] {
  z-index: 9999 !important;
}
```

---

## 🧪 Manual Test Commands

### Test 1: Simple Toast from Console

Open browser console on dashboard page and run:

```javascript
// Test if toast works at all
window.dispatchEvent(new CustomEvent('test-toast'));
```

### Test 2: Import and Test Directly

In browser console:
```javascript
// This won't work directly, but you can add a test button
```

---

## 🔧 Alternative: Add Visual Indicator

If toasts are problematic, add a visual countdown in the UI:

```tsx
// Add to state
const [countdown, setCountdown] = useState<number | null>(null);

// In handleCancel
const handleCancel = () => {
  setCountdown(5);
  const interval = setInterval(() => {
    setCountdown(prev => {
      if (prev === null || prev <= 1) {
        clearInterval(interval);
        return null;
      }
      return prev - 1;
    });
  }, 1000);
  
  // Rest of cancel logic
};

// In JSX (show countdown on card)
{countdown !== null && (
  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded">
    Cancelling in {countdown}s
    <button onClick={() => {
      setCountdown(null);
      // Clear timeout
    }}>
      Undo
    </button>
  </div>
)}
```

---

## 📋 Checklist

When clicking Cancel, verify:

- [ ] Browser console shows: "🚀 handleCancel called"
- [ ] Browser console shows: "Test: Cancel button clicked!"
- [ ] Browser console shows: "📋 Toast ID: [number]"
- [ ] A toast appears at top-right (or bottom-right)
- [ ] Toast says "Test: Cancel button clicked!"
- [ ] Another toast appears saying "Registration will be cancelled..."
- [ ] The second toast has an "Undo" button
- [ ] After 5 seconds, toast says "Registration cancelled successfully"

---

## 🎯 What to Report

If it's still not working, please check and report:

1. **Console messages**: Share what you see in console
2. **Toast visibility**: Do you see ANY toast at all?
3. **Toaster element**: Search for "sonner" in DOM inspector - is it there?
4. **Position**: Check all 4 corners of screen - is toast visible anywhere?
5. **Browser**: Which browser? (Chrome, Firefox, Safari, etc.)
6. **Screen size**: Desktop or mobile viewport?

---

## 🚨 Emergency Workaround

If toasts absolutely won't work, here's a fallback using native browser alert:

```typescript
const handleCancel = async () => {
  const shouldCancel = window.confirm(
    'Click OK to cancel. You have 5 seconds to close this dialog to undo.'
  );
  
  if (!shouldCancel) {
    return; // User clicked Cancel on confirm dialog
  }
  
  setIsCancelling(true);
  
  setTimeout(async () => {
    const result = await cancelRegistration(registration.id);
    if (result.error) {
      alert('Error: ' + result.error);
    } else {
      alert('Registration cancelled successfully');
    }
  }, 5000);
};
```

This isn't ideal but it works!

---

## 🔍 Next Debugging Steps

Run this in your browser console while on dashboard:

```javascript
// 1. Check if sonner is loaded
console.log('Sonner loaded?', typeof window !== 'undefined');

// 2. Try to manually trigger a toast
// (This won't work but we can try)
document.querySelector('button')?.click();

// 3. Check for toast container
console.log('Toast container:', document.querySelector('[data-sonner-toaster]'));
```

Share the output and we can diagnose further!
