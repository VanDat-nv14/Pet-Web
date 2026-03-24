// Debug Script để test SignalR Real-time Sharing
// Copy script này vào browser console để test

window.debugSignalRTimeSlot = async function() {
  console.clear();
  console.log('🧪 === SIGNALR TIME SLOT SHARING DEBUG ===\n');
  
  // Step 1: Check if SignalR service exists
  console.log('📋 Step 1: Checking SignalR Service...');
  if (!window.signalRService) {
    console.error('❌ SignalR service not found on window object');
    console.log('💡 Solution: Make sure TimeSlotGrid is rendered and signalRService is attached');
    return;
  }
  
  const service = window.signalRService;
  console.log('✅ SignalR service found');
  console.log('   - Connection state:', service.connection?.state);
  console.log('   - Is connected:', service.isConnected);
  console.log('   - Connection ID:', service.connection?.connectionId);
  
  // Step 2: Test connection
  console.log('\n📋 Step 2: Testing Connection...');
  if (service.connection?.state !== 'Connected') {
    console.error('❌ SignalR not connected, current state:', service.connection?.state);
    console.log('💡 Solution: Wait for connection or check network/backend');
    
    // Try to connect
    try {
      console.log('🔄 Attempting to connect...');
      await service.initialize();
      console.log('✅ Connection successful, state:', service.connection?.state);
    } catch (error) {
      console.error('❌ Connection failed:', error);
      console.log('💡 Check backend is running on https://localhost:7164');
      return;
    }
  } else {
    console.log('✅ SignalR is connected');
  }
  
  // Step 3: Test joining a room
  console.log('\n📋 Step 3: Testing Room Join...');
  const testRoomKey = 'service_2_staff_1_date_2025-01-06';
  
  try {
    await service.joinTimeSlotRoom(testRoomKey);
    console.log('✅ Successfully joined test room:', testRoomKey);
  } catch (error) {
    console.error('❌ Failed to join room:', error);
    return;
  }
  
  // Step 4: Test sending a time slot selection
  console.log('\n📋 Step 4: Testing Time Slot Selection Broadcast...');
  const testData = {
    roomKey: testRoomKey,
    timeSlot: '14:30',
    userId: 'test_user_' + Date.now(),
    userName: 'Test User',
    serviceId: 2,
    staffId: 1,
    date: '2025-01-06'
  };
  
  try {
    await service.notifyTimeSlotSelected(testData);
    console.log('✅ Successfully broadcasted time slot selection:', testData.timeSlot);
  } catch (error) {
    console.error('❌ Failed to broadcast selection:', error);
    return;
  }
  
  // Step 5: Add event listener to see if we receive our own broadcasts (we shouldn't)
  console.log('\n📋 Step 5: Setting up Event Listeners...');
  
  const testHandler = (data) => {
    console.log('🎯 Received TimeSlotSelected event:', data);
    console.log('   - Time Slot:', data.timeSlot);
    console.log('   - User:', data.userName);
    console.log('   - User ID:', data.userId);
  };
  
  service.connection.on('TimeSlotSelected', testHandler);
  
  // Step 6: Test with different user ID
  console.log('\n📋 Step 6: Testing with Different User ID (should see event)...');
  setTimeout(async () => {
    const testData2 = {
      ...testData,
      timeSlot: '15:00',
      userId: 'different_user_' + Date.now(),
      userName: 'Different User'
    };
    
    try {
      await service.notifyTimeSlotSelected(testData2);
      console.log('✅ Broadcasted from different user:', testData2.timeSlot);
      console.log('💡 You should see an event above if real-time sharing works');
    } catch (error) {
      console.error('❌ Failed to broadcast from different user:', error);
    }
  }, 2000);
  
  // Step 7: Clean up after 10 seconds
  setTimeout(async () => {
    console.log('\n📋 Step 7: Cleaning up...');
    service.connection.off('TimeSlotSelected', testHandler);
    
    try {
      await service.leaveTimeSlotRoom(testRoomKey);
      console.log('✅ Left test room successfully');
    } catch (error) {
      console.error('❌ Failed to leave room:', error);
    }
    
    console.log('\n🎉 Debug test completed!');
    console.log('\n📋 What to check next:');
    console.log('1. Open another browser tab');
    console.log('2. Go to appointment booking');
    console.log('3. Select same service, staff, date');
    console.log('4. Try selecting time slots');
    console.log('5. Check if you see purple indicators');
  }, 10000);
  
  console.log('\n⏱️ Test running... events will appear above');
  console.log('⏱️ Auto cleanup in 10 seconds...');
};

// Hướng dẫn sử dụng
console.log(`
🔧 === HƯỚNG DẪN DEBUG SIGNALR REAL-TIME SHARING ===

1. Vào trang appointment booking
2. Chọn service, staff, date để TimeSlotGrid render
3. Mở Browser Console (F12)
4. Run: debugSignalRTimeSlot()
5. Theo dõi logs để xem có lỗi gì không

📋 Checklist trước khi test:
✅ Backend đang chạy trên https://localhost:7164
✅ Đã chọn service, staff, date trong UI
✅ TimeSlotGrid đã render (thấy khung giờ)
✅ Console không có error về SignalR connection

🧪 Test với 2 browser tabs:
1. Tab 1: Chọn service/staff/date, click vào 1 time slot
2. Tab 2: Vào cùng service/staff/date, check xem có thấy slot tab 1 chọn không
3. Kỳ vọng: Slot có màu tím với animation pulsing
`); 