// 🔧 Debug Script để test SignalR Real-time Time Slot Sharing
// Copy script này vào browser console để test tính năng

window.debugSignalRRealTimeSharing = {
  
  // 1. Kiểm tra tổng quan
  checkOverall: () => {
    console.clear();
    console.log('🔍 === CHECKING SIGNALR REAL-TIME SHARING ===\n');
    
    // Check SignalR service
    console.log('📋 1. Checking SignalR Service...');
    if (window.signalRService) {
      const status = window.signalRService.getConnectionStatus();
      console.log('✅ SignalR Service found');
      console.log('   - Connection State:', window.signalRService.connection?.state);
      console.log('   - Is Connected:', status.isConnected);
      console.log('   - Connection ID:', window.signalRService.connection?.connectionId);
    } else {
      console.log('❌ SignalR Service not found');
      console.log('💡 Solution: Đảm bảo TimeSlotGrid đã render để attach service');
    }
    
    // Check TimeSlotGrid props
    console.log('\n📋 2. Checking TimeSlotGrid Props...');
    console.log('💡 Mở DevTools → React → Tìm TimeSlotGrid component để xem props:');
    console.log('   - signalRConnection: should not be null');
    console.log('   - currentUserId: should be unique string');
    console.log('   - selectedService: should have .id');
    console.log('   - selectedStaffId: should not be null/undefined');
    console.log('   - selectedDate: should be valid date');
    
    // Check localStorage/sessionStorage
    console.log('\n📋 3. Checking User Identity...');
    const currentUserId = sessionStorage.getItem('currentUserId') || 
                         localStorage.getItem('userId') || 
                         localStorage.getItem('currentUserId');
    const userName = localStorage.getItem('userName') || 
                    localStorage.getItem('currentUserName');
    
    console.log('👤 Current User ID:', currentUserId);
    console.log('👤 Current User Name:', userName);
    
    if (!currentUserId) {
      console.log('⚠️ No user ID found - generating new one...');
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('currentUserId', newUserId);
      console.log('✅ Generated new user ID:', newUserId);
    }
    
    // Check current page state
    console.log('\n📋 4. Checking Current Page State...');
    console.log('💡 Để SignalR hoạt động, bạn cần:');
    console.log('   1. Đang ở trang đặt lịch (/appointment)');
    console.log('   2. Đã chọn dịch vụ');
    console.log('   3. Đã chọn nhân viên cụ thể (không phải "Bất kỳ nhân viên nào")');
    console.log('   4. Đã chọn ngày');
    console.log('   5. TimeSlotGrid đã render ra khung giờ');
    
    return {
      hasSignalRService: !!window.signalRService,
      isConnected: window.signalRService?.isConnected,
      currentUserId,
      userName
    };
  },
  
  // 2. Test kết nối SignalR
  testConnection: async () => {
    console.log('\n📡 === TESTING SIGNALR CONNECTION ===');
    
    if (!window.signalRService) {
      console.log('❌ SignalR service not available');
      return false;
    }
    
    const service = window.signalRService;
    
    // Test connection state
    console.log('📋 Connection state:', service.connection?.state);
    
    if (service.connection?.state !== 'Connected') {
      console.log('⚠️ Not connected, attempting to connect...');
      try {
        await service.initialize();
        console.log('✅ Connection successful');
      } catch (error) {
        console.error('❌ Connection failed:', error);
        console.log('💡 Kiểm tra:');
        console.log('   - Backend có chạy trên https://localhost:7164 không?');
        console.log('   - CORS có được config đúng không?');
        console.log('   - SignalR Hub có được config đúng không?');
        return false;
      }
    } else {
      console.log('✅ SignalR already connected');
    }
    
    // Test hub methods
    console.log('\n📋 Testing Hub Methods...');
    try {
      // Test basic hub method (if exists)
      const connection = service.getConnection();
      
      // Test join room
      const testRoomKey = 'service_1_staff_1_date_2025-01-06';
      console.log('🏠 Testing room join:', testRoomKey);
      await connection.invoke('JoinTimeSlotRoom', testRoomKey);
      console.log('✅ Room join successful');
      
      // Test send message
      console.log('📤 Testing message send...');
      await connection.invoke('NotifyTimeSlotSelected', {
        roomKey: testRoomKey,
        timeSlot: '10:00',
        userId: sessionStorage.getItem('currentUserId') || 'test_user',
        userName: 'Test User',
        serviceId: 1,
        staffId: 1,
        date: '2025-01-06'
      });
      console.log('✅ Message send successful');
      
      return true;
      
    } catch (error) {
      console.error('❌ Hub method test failed:', error);
      console.log('💡 Backend có thể chưa có các method:');
      console.log('   - JoinTimeSlotRoom');
      console.log('   - NotifyTimeSlotSelected');
      console.log('   - NotifyTimeSlotCleared');
      return false;
    }
  },
  
  // 3. Test manual message
  sendTestMessage: async (timeSlot = '14:30') => {
    console.log('\n📤 === SENDING TEST MESSAGE ===');
    
    if (!window.signalRService?.isConnected) {
      console.log('❌ SignalR not connected');
      return;
    }
    
    const connection = window.signalRService.getConnection();
    const testData = {
      roomKey: 'service_1_staff_1_date_2025-01-06',
      timeSlot: timeSlot,
      userId: `test_${Math.random().toString(36).substr(2, 9)}`,
      userName: 'Test User',
      serviceId: 1,
      staffId: 1,
      date: '2025-01-06'
    };
    
    console.log('📤 Sending test message:', testData);
    
    try {
      await connection.invoke('NotifyTimeSlotSelected', testData);
      console.log('✅ Test message sent successfully');
      console.log('💡 Nếu bạn đang xem cùng service + staff + date, bạn sẽ thấy slot này được highlight');
    } catch (error) {
      console.error('❌ Failed to send test message:', error);
    }
  },
  
  // 4. Listen for messages
  listenForMessages: () => {
    console.log('\n👂 === LISTENING FOR MESSAGES ===');
    
    if (!window.signalRService?.connection) {
      console.log('❌ No SignalR connection');
      return;
    }
    
    const connection = window.signalRService.connection;
    
    // Remove existing listeners to avoid duplicates
    connection.off('TimeSlotSelected');
    connection.off('TimeSlotCleared');
    
    // Add test listeners
    connection.on('TimeSlotSelected', (data) => {
      console.log('🎯 [TEST LISTENER] Received TimeSlotSelected:', data);
      console.log('   - Time Slot:', data.timeSlot);
      console.log('   - User:', data.userName, '(' + data.userId + ')');
      console.log('   - Room:', data.roomKey);
    });
    
    connection.on('TimeSlotCleared', (data) => {
      console.log('🧹 [TEST LISTENER] Received TimeSlotCleared:', data);
      console.log('   - Time Slot:', data.timeSlot);
      console.log('   - User:', data.userName, '(' + data.userId + ')');
      console.log('   - Room:', data.roomKey);
    });
    
    console.log('✅ Test listeners added');
    console.log('💡 Bây giờ mở tab khác và chọn khung giờ để test');
  },
  
  // 5. Reset và clean up
  reset: () => {
    console.log('\n🔄 === RESETTING SIGNALR ===');
    
    if (window.signalRService) {
      window.signalRService.disconnect();
      console.log('✅ SignalR disconnected');
    }
    
    // Clear user data
    sessionStorage.removeItem('currentUserId');
    localStorage.removeItem('userId');
    console.log('✅ User data cleared');
    
    // Reload page
    console.log('🔄 Reloading page in 2 seconds...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  },
  
  // 6. Full integration test
  fullTest: async () => {
    console.log('\n🧪 === FULL INTEGRATION TEST ===');
    
    const results = {
      service: false,
      connection: false,
      hubMethods: false,
      messaging: false
    };
    
    // Step 1: Check service
    console.log('Step 1: Checking service...');
    results.service = window.debugSignalRRealTimeSharing.checkOverall().hasSignalRService;
    
    if (!results.service) {
      console.log('❌ Test failed at step 1 - no SignalR service');
      return results;
    }
    
    // Step 2: Test connection
    console.log('\nStep 2: Testing connection...');
    results.connection = await window.debugSignalRRealTimeSharing.testConnection();
    
    if (!results.connection) {
      console.log('❌ Test failed at step 2 - connection failed');
      return results;
    }
    
    // Step 3: Test messaging
    console.log('\nStep 3: Testing messaging...');
    try {
      await window.debugSignalRRealTimeSharing.sendTestMessage();
      results.messaging = true;
    } catch (error) {
      console.error('❌ Messaging test failed:', error);
    }
    
    // Results
    console.log('\n📊 === TEST RESULTS ===');
    console.log('SignalR Service:', results.service ? '✅' : '❌');
    console.log('Connection:', results.connection ? '✅' : '❌');
    console.log('Messaging:', results.messaging ? '✅' : '❌');
    
    if (results.service && results.connection && results.messaging) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('💡 SignalR real-time sharing should work now');
      console.log('📝 To test:');
      console.log('   1. Mở 2 tab browser');
      console.log('   2. Cả 2 tab đều vào trang đặt lịch');
      console.log('   3. Chọn cùng dịch vụ, nhân viên, ngày');
      console.log('   4. Tab 1 chọn 1 khung giờ → Tab 2 sẽ thấy highlight');
    } else {
      console.log('\n❌ SOME TESTS FAILED');
      console.log('💡 Check console errors and backend configuration');
    }
    
    return results;
  }
};

// Auto run basic check
console.log('🔧 SignalR Real-time Sharing Debug Tool loaded');
console.log('📝 Available commands:');
console.log('   window.debugSignalRRealTimeSharing.checkOverall()');
console.log('   window.debugSignalRRealTimeSharing.testConnection()');
console.log('   window.debugSignalRRealTimeSharing.sendTestMessage()');
console.log('   window.debugSignalRRealTimeSharing.listenForMessages()');
console.log('   window.debugSignalRRealTimeSharing.fullTest()');
console.log('   window.debugSignalRRealTimeSharing.reset()');
console.log('\n🚀 Running basic check...');
window.debugSignalRRealTimeSharing.checkOverall(); 