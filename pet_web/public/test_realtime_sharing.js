// 🔥 Script để test real-time time slot sharing
// Copy toàn bộ vào browser console để test

console.clear();
console.log('🚀 === TESTING REAL-TIME TIME SLOT SHARING ===\n');

// Test functions
window.realTimeTest = {
  
  // 1. Kiểm tra setup cơ bản
  checkSetup: () => {
    console.log('📋 1. Checking Basic Setup...');
    
    // Check backend
    console.log('   Backend URL: https://localhost:7164');
    console.log('   Hub endpoint: /timeSlotHub');
    
    // Check SignalR service
    if (window.signalRService) {
      console.log('✅ SignalR Service: Available');
      console.log('   Connection state:', window.signalRService.connection?.state);
      console.log('   URL:', window.signalRService.connection?.baseUrl);
    } else {
      console.log('❌ SignalR Service: Not found');
      console.log('💡 Navigate to appointment page first');
    }
    
    // Check user info
    const userId = sessionStorage.getItem('currentUserId') || localStorage.getItem('userId');
    console.log('👤 User ID:', userId);
    
    // Check page context
    console.log('🌐 Current page:', window.location.pathname);
    console.log('📝 Form context: Need to select service + staff + date');
    
    return {
      hasService: !!window.signalRService,
      hasUserId: !!userId,
      onRightPage: window.location.pathname.includes('appointment')
    };
  },
  
  // 2. Test kết nối Hub mới
  testConnection: async () => {
    console.log('\n🔌 2. Testing Hub Connection...');
    
    try {
      // Import SignalR nếu cần
      let signalR = window.signalR;
      if (!signalR) {
        console.log('📦 Loading SignalR...');
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@microsoft/signalr@latest/dist/browser/signalr.js';
        document.head.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
        signalR = window.signalR;
      }
      
      // Tạo connection mới
      console.log('🔗 Creating connection to timeSlotHub...');
      const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7164/timeSlotHub", {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.LongPolling | signalR.HttpTransportType.WebSockets
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();
      
      // Setup event listeners
      connection.on('TimeSlotSelected', (data) => {
        console.log('🎯 [RECEIVED] TimeSlotSelected:', data);
        // Show visual notification
        if (window.location.pathname.includes('appointment')) {
          alert(`🎯 ${data.userName} đang chọn slot ${data.timeSlot}`);
        }
      });
      
      connection.on('TimeSlotCleared', (data) => {
        console.log('🧹 [RECEIVED] TimeSlotCleared:', data);
        if (window.location.pathname.includes('appointment')) {
          alert(`🧹 ${data.userName} đã bỏ chọn slot ${data.timeSlot}`);
        }
      });
      
      connection.on('TimeSlotAutoCleared', (data) => {
        console.log('⏰ [RECEIVED] TimeSlotAutoCleared:', data);
      });
      
      // Connect
      console.log('🚀 Starting connection...');
      await connection.start();
      console.log('✅ Connected successfully!');
      console.log('   State:', connection.state);
      console.log('   Connection ID:', connection.connectionId);
      
      // Store globally for testing
      window.testConnection = connection;
      
      return connection;
      
    } catch (error) {
      console.error('❌ Connection failed:', error);
      console.log('💡 Solutions:');
      console.log('   - Start backend: dotnet run');
      console.log('   - Check URL: https://localhost:7164/swagger');
      console.log('   - Check firewall/antivirus');
      return null;
    }
  },
  
  // 3. Test join room
  testJoinRoom: async (serviceId = 1, staffId = 1, date = '2025-01-06') => {
    console.log('\n🏠 3. Testing Room Join...');
    
    const connection = window.testConnection || window.signalRService?.connection;
    if (!connection || connection.state !== 'Connected') {
      console.log('❌ No connection available');
      return;
    }
    
    const roomKey = `service_${serviceId}_staff_${staffId}_date_${date}`;
    console.log('📍 Room key:', roomKey);
    
    try {
      await connection.invoke('JoinTimeSlotRoom', roomKey);
      console.log('✅ Joined room successfully');
      window.currentRoomKey = roomKey;
      return roomKey;
    } catch (error) {
      console.error('❌ Failed to join room:', error);
      return null;
    }
  },
  
  // 4. Test send message
  testSendMessage: async (timeSlot = '14:30') => {
    console.log('\n📤 4. Testing Send Message...');
    
    const connection = window.testConnection || window.signalRService?.connection;
    if (!connection || connection.state !== 'Connected') {
      console.log('❌ No connection');
      return;
    }
    
    const roomKey = window.currentRoomKey || 'service_1_staff_1_date_2025-01-06';
    const userId = sessionStorage.getItem('currentUserId') || `test_${Date.now()}`;
    
    const data = {
      RoomKey: roomKey,
      TimeSlot: timeSlot,
      UserId: userId,
      UserName: 'Test User A',
      ServiceId: 1,
      StaffId: 1,
      Date: '2025-01-06'
    };
    
    console.log('📤 Sending:', data);
    
    try {
      await connection.invoke('NotifyTimeSlotSelected', data);
      console.log('✅ Message sent successfully');
      console.log('💡 Other users in same room should see this');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  },
  
  // 5. Test clear message
  testClearMessage: async (timeSlot = '14:30') => {
    console.log('\n🧹 5. Testing Clear Message...');
    
    const connection = window.testConnection || window.signalRService?.connection;
    if (!connection) {
      console.log('❌ No connection');
      return;
    }
    
    const roomKey = window.currentRoomKey || 'service_1_staff_1_date_2025-01-06';
    const userId = sessionStorage.getItem('currentUserId') || `test_${Date.now()}`;
    
    const data = {
      RoomKey: roomKey,
      TimeSlot: timeSlot,
      UserId: userId,
      UserName: 'Test User A'
    };
    
    console.log('🧹 Clearing:', data);
    
    try {
      await connection.invoke('NotifyTimeSlotCleared', data);
      console.log('✅ Clear message sent');
    } catch (error) {
      console.error('❌ Failed to clear:', error);
    }
  },
  
  // 6. Full integration test
  fullTest: async () => {
    console.log('\n🧪 6. Full Integration Test...');
    
    const setup = window.realTimeTest.checkSetup();
    if (!setup.hasService) {
      console.log('❌ Need to navigate to appointment page first');
      return;
    }
    
    // Test connection
    const connection = await window.realTimeTest.testConnection();
    if (!connection) {
      console.log('❌ Connection test failed');
      return;
    }
    
    // Test room join
    const roomKey = await window.realTimeTest.testJoinRoom();
    if (!roomKey) {
      console.log('❌ Room join failed');
      return;
    }
    
    // Test messaging
    console.log('\n⏰ Testing message sequence...');
    
    setTimeout(async () => {
      await window.realTimeTest.testSendMessage('10:00');
    }, 1000);
    
    setTimeout(async () => {
      await window.realTimeTest.testSendMessage('11:00');
    }, 2000);
    
    setTimeout(async () => {
      await window.realTimeTest.testClearMessage('10:00');
    }, 4000);
    
    console.log('🎯 Watch for real-time updates...');
    console.log('💡 Open another tab with same service+staff+date to see effect');
    
    return true;
  },
  
  // 7. Reset và cleanup
  reset: () => {
    console.log('\n🔄 7. Reset & Cleanup...');
    
    if (window.testConnection) {
      window.testConnection.stop();
      delete window.testConnection;
    }
    
    delete window.currentRoomKey;
    
    console.log('✅ Cleaned up test connection');
    console.log('💡 Page will reload in 2 seconds...');
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
};

// Auto run basic check
console.log('🎯 Available commands:');
console.log('   window.realTimeTest.checkSetup()');
console.log('   window.realTimeTest.testConnection()');
console.log('   window.realTimeTest.testJoinRoom(serviceId, staffId, date)');
console.log('   window.realTimeTest.testSendMessage(timeSlot)');
console.log('   window.realTimeTest.fullTest()');
console.log('   window.realTimeTest.reset()');

console.log('\n🚀 Running basic check...');
window.realTimeTest.checkSetup();

console.log('\n💡 === NEXT STEPS ===');
console.log('1. Nếu chưa có SignalR Service → vào trang /appointment');
console.log('2. Chọn service + staff cụ thể + date');
console.log('3. Chạy: await window.realTimeTest.fullTest()');
console.log('4. Mở tab thứ 2 với cùng service+staff+date');
console.log('5. Test real-time sharing!'); 