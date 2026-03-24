import * as signalR from '@microsoft/signalr';

// Manual SignalR Test
window.testSignalRManual = async () => {
  console.log('\n🧪 === MANUAL SIGNALR CONNECTION TEST ===');
  
  try {
    // Test 1: Simple connection without auth
    console.log('📡 Test 1: Connecting without authentication...');
    
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7164/slotHub", {
        withCredentials: false,
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Add event handlers
    connection.on('TimeSlotSelected', (data) => {
      console.log('🎯 [TEST] Received TimeSlotSelected:', data);
    });

    connection.on('TimeSlotCleared', (data) => {
      console.log('🧹 [TEST] Received TimeSlotCleared:', data);
    });

    // Connection events
    connection.onreconnecting(() => {
      console.log('⚠️ [TEST] SignalR Reconnecting...');
    });

    connection.onreconnected(() => {
      console.log('✅ [TEST] SignalR Reconnected');
    });

    connection.onclose((error) => {
      console.log('🔌 [TEST] SignalR Connection Closed:', error);
    });

    // Start connection
    await connection.start();
    console.log('✅ [TEST] SignalR Connected successfully!');
    console.log('   - Connection State:', connection.state);
    console.log('   - Connection ID:', connection.connectionId);

    // Test 2: Join a test room
    const testRoomKey = 'service_2_staff_1_date_2025-06-12';
    console.log('🏠 Test 2: Joining test room:', testRoomKey);
    
    await connection.invoke('JoinTimeSlotRoom', testRoomKey);
    console.log('✅ [TEST] Successfully joined room');

    // Test 3: Send a test message
    console.log('📤 Test 3: Sending test time slot selection...');
    
    const testData = {
      roomKey: testRoomKey,
      timeSlot: '10:00',
      userId: 'test_user_manual',
      userName: 'Manual Test User',
      serviceId: 2,
      staffId: 1,
      date: '2025-06-12'
    };

    await connection.invoke('NotifyTimeSlotSelected', testData);
    console.log('✅ [TEST] Test message sent successfully');

    // Store connection globally for further testing
    window.testSignalRConnection = connection;
    
    console.log('\n🎉 SignalR Manual Test PASSED!');
    console.log('👉 You can now test with a second tab');
    console.log('👉 Use: window.testSignalRConnection to interact');
    
    return connection;

  } catch (error) {
    console.error('❌ [TEST] SignalR Manual Test FAILED:', error);
    
    // Detailed error analysis
    if (error.message.includes('negotiate')) {
      console.log('💡 [HINT] Negotiate error - check if backend is running on port 7164');
    }
    
    if (error.message.includes('CORS')) {
      console.log('💡 [HINT] CORS error - check backend CORS configuration');
    }
    
    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('💡 [HINT] Auth error - try with authentication token');
    }
    
    throw error;
  }
};

// Helper function to test from second tab
window.testSignalRSendFromSecondTab = async () => {
  if (!window.testSignalRConnection) {
    console.log('❌ No test connection found. Run window.testSignalRManual() first');
    return;
  }
  
  console.log('📤 Sending test message from second tab...');
  
  const testData = {
    roomKey: 'service_2_staff_1_date_2025-06-12',
    timeSlot: '11:30',
    userId: 'test_user_tab2',
    userName: 'Second Tab User',
    serviceId: 2,
    staffId: 1,
    date: '2025-06-12'
  };

  try {
    await window.testSignalRConnection.invoke('NotifyTimeSlotSelected', testData);
    console.log('✅ Test message sent from second tab');
  } catch (error) {
    console.error('❌ Failed to send from second tab:', error);
  }
};

// Auto-run test
console.log('🔧 SignalR Manual Test loaded');
console.log('📋 Available commands:');
console.log('   window.testSignalRManual() - Run main test');
console.log('   window.testSignalRSendFromSecondTab() - Test from second tab');

export default { testSignalRManual: window.testSignalRManual }; 