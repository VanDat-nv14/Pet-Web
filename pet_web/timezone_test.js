console.log('=== TIMEZONE ISSUE DEMONSTRATION ==='); 

// Giả lập việc đặt lịch vào ngày mai lúc 18:00
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

console.log('Hôm nay:', today.toLocaleDateString('vi-VN'));
console.log('Ngày mai:', tomorrow.toLocaleDateString('vi-VN'));

// Test với nhiều khung giờ khác nhau
const testTimes = ['20:00', '19:00', '18:00', '17:00', '16:00'];

testTimes.forEach(testTime => {
    const testDate = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
    const combined = testDate + 'T' + testTime + ':00'; 

    console.log(`\n=== KIỂM TRA TIMEZONE ISSUE CHO ${testTime} ===`);
    console.log('1. Ngày đã chọn (ngày mai):', testDate);
    console.log('2. Giờ đã chọn:', testTime);
    console.log('3. Chuỗi combined:', combined);

    const dateObj = new Date(combined); 
    console.log('4. Date object đã tạo:', dateObj);
    console.log('5. getHours() (thời gian hiển thị):', dateObj.getHours());
    console.log('6. toISOString() (gửi lên server):', dateObj.toISOString());

    // Kiểm tra xem có bị lùi ngày không
    const isoDatePart = dateObj.toISOString().split('T')[0];
    const isoTimePart = dateObj.toISOString().split('T')[1].substring(0, 5);
    
    console.log('   Ngày trong ISO string:', isoDatePart);
    console.log('   Giờ trong ISO string:', isoTimePart);
    console.log('   Có bị lùi ngày không?', testDate !== isoDatePart ? 'CÓ ❌' : 'KHÔNG ✅');

    if (testDate !== isoDatePart) {
        console.log(`   🚨 LỖI: Khi chọn ngày mai ${testTime}, hệ thống sẽ lưu vào ngày hôm nay ${isoTimePart} UTC!`);
    }
});

console.log('\n=== TẠI SAO XẢY RA VẤN ĐỀ? ===');
console.log('VN ở múi giờ GMT+7. Khi tạo Date object:');
console.log('- JavaScript tự động chuyển local time sang UTC');
console.log('- Nếu chọn 20:00 ở VN, sẽ thành 13:00 UTC (trừ 7 tiếng)');
console.log('- Nếu chọn giờ > 17:00 ở VN, khi chuyển UTC sẽ bị lùi xuống ngày trước!');
console.log('====================');
