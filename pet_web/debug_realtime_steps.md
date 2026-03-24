# Debug Steps - SignalR Real-time Time Slot Sharing

## 🎯 Mục tiêu
Khi người dùng A chọn khung giờ trong dịch vụ X với nhân viên Y, người dùng B cũng ở dịch vụ X với nhân viên Y sẽ thấy slot đó có màu tím và animation pulsing.

## 📋 Checklist trước khi test

### Backend (https://localhost:7164)
- [ ] Backend đang chạy 
- [ ] Swagger UI accessible: https://localhost:7164/swagger
- [ ] SlotReservationHub có methods: `JoinTimeSlotRoom`, `NotifyTimeSlotSelected`, `NotifyTimeSlotCleared`
- [ ] CORS được config cho localhost:3000

### Frontend 
- [ ] React app đang chạy trên localhost:3000
- [ ] Không có errors trong browser console
- [ ] TimeSlotGrid component render thành công với các khung giờ

## 🧪 Test Steps

### Step 1: Kiểm tra SignalR Connection
```bash
# Mở Browser Console (F12) và chạy:
debugSignalRTimeSlot()

# Kỳ vọng output:
# ✅ SignalR service found
# ✅ SignalR is connected
# ✅ Successfully joined test room
# ✅ Successfully broadcasted time slot selection
```

### Step 2: Test Manual Connection
```javascript
// Browser console:
console.log('SignalR Status:', window.signalRService?.getConnectionStatus());

// Kỳ vọng:
// {
//   isConnected: true,
//   currentGroup: null,
//   reservationsCount: 0
// }
```

### Step 3: Test với 2 Browser Tabs

#### Tab 1 (Người dùng A):
1. Vào appointment booking
2. Chọn pet, service, staff, date
3. **Quan trọng**: Đảm bảo chọn **cùng service và staff**
4. Click vào 1 time slot bất kỳ (ví dụ: 14:30)
5. Mở Console và check logs:
   ```
   📤 [SignalR] Broadcasting slot selection: 14:30
   ✅ [SignalR] Slot selection broadcasted successfully
   ```

#### Tab 2 (Người dùng B):
1. Vào appointment booking  
2. Chọn **cùng pet, service, staff, date** như Tab 1
3. **Không click vào slot nào**
4. Check console và UI:
   ```
   📡 [SignalR] Received timeSlotSelected: {timeSlot: "14:30", userId: "...", userName: "..."}
   📊 [STATE] Updated otherUsersSelections: {"14:30": {...}}
   🔍 [RENDER] Slot 14:30 being selected by others
   ```
5. **Kỳ vọng UI**: Slot 14:30 có:
   - Màu tím (border + background)
   - Animation pulsing
   - Chữ "Ai đó đang chọn" 
   - Icon tròn tím ở góc với chữ cái đầu của userName

## 🔧 Troubleshooting

### ❌ Vấn đề: SignalR service not found
```javascript
// Check xem TimeSlotGrid đã render chưa
document.querySelector('[data-testid="time-slot-grid"]') // Should exist

// Check signalRService
window.signalRService // Should be defined
```

### ❌ Vấn đề: Connection failed
```javascript
// Check backend
fetch('https://localhost:7164/swagger').then(r => console.log('Backend:', r.status))

// Check SignalR endpoint
fetch('https://localhost:7164/slotHub/negotiate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'}
}).then(r => console.log('SignalR:', r.status))
```

### ❌ Vấn đề: Room key mismatch
```javascript
// Tab 1 - Check room key being used
// Should see in console: "🏠 [TimeSlotGrid] Joining room: service_X_staff_Y_date_YYYY-MM-DD"

// Tab 2 - Should join same room
// Check logs có cùng room key không
```

### ❌ Vấn đề: User ID trùng nhau
```javascript
// Tab 1:
console.log('User ID:', sessionStorage.getItem('currentUserId'));

// Tab 2:  
console.log('User ID:', sessionStorage.getItem('currentUserId'));

// Should be different! If same, clear sessionStorage and reload
sessionStorage.removeItem('currentUserId');
location.reload();
```

### ❌ Vấn đề: Events không được receive
```javascript
// Manual test - Run in Tab 2 console:
window.signalRService.connection.on('TimeSlotSelected', (data) => {
  console.log('🎯 MANUAL TEST - Received:', data);
});

// Then in Tab 1, select a time slot
// Tab 2 should show the log above
```

## 🎨 Visual Debug

### Slot Colors để nhận biết:
- **Xanh lá**: Available (có thể click)
- **Đỏ**: Pet busy (không click được)
- **Cam**: Staff busy (không click được) 
- **Xám**: Past (không click được)
- **Xanh dương**: Selected by current user
- **TÍM + PULSING**: Being selected by others ⭐

### Animation Test:
```css
/* Should see this CSS animation on purple slots */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}
```

## 📝 Common Issues

1. **Different service/staff**: Room keys sẽ khác nhau → không real-time
2. **Same user ID**: Cả 2 tabs có cùng userId → ignore events  
3. **SignalR disconnected**: Check network tab for WebSocket connection
4. **Backend not running**: Check https://localhost:7164/swagger
5. **CORS issues**: Check browser console for CORS errors

## ✅ Success Criteria

**Tab 1** (User A):
- Click slot → Console shows "📤 Broadcasting slot selection"
- Slot becomes blue (selected)

**Tab 2** (User B):
- **Automatically** sees slot become purple
- Console shows "📡 Received timeSlotSelected"
- Slot has pulsing animation
- Badge shows "Ai đó đang chọn"
- Small purple circle indicator visible

**Tab 1** (User A):
- Deselect slot → Console shows "📤 Broadcasting slot clear"

**Tab 2** (User B):
- **Automatically** sees slot return to normal color
- Console shows "📡 Received timeSlotCleared"
- Purple styling disappears

---

## 🚀 Quick Test Command

Copy vào browser console để test nhanh:

```javascript
// Quick test
(async () => {
  if (!window.signalRService) return console.log('❌ No SignalR service');
  
  const conn = window.signalRService.connection;
  if (conn?.state !== 'Connected') return console.log('❌ Not connected:', conn?.state);
  
  console.log('✅ SignalR ready!');
  
  // Join test room
  await conn.invoke('JoinTimeSlotRoom', 'test_room_123');
  console.log('✅ Joined test room');
  
  // Listen for events
  conn.on('TimeSlotSelected', (data) => console.log('🎯 Got event:', data));
  
  // Send test event
  setTimeout(() => {
    conn.invoke('NotifyTimeSlotSelected', {
      roomKey: 'test_room_123',
      timeSlot: '14:30',
      userId: 'test_user_' + Date.now(),
      userName: 'Test User'
    });
    console.log('📤 Sent test event');
  }, 1000);
})();
``` 