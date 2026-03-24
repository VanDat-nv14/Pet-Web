# Script để tự động thay thế DateTime.Now thành _dateTimeService.Now trong các Services
Write-Host "Bắt đầu cập nhật DateTime services..." -ForegroundColor Green

# Danh sách các services cần cập nhật (trừ các services đã cập nhật)
$servicesToUpdate = @(
    "StaffService.cs",
    "ProductService.cs", 
    "PetService.cs",
    "ServiceService.cs",
    "VaccinationService.cs",
    "ReminderService.cs",
    "PaymentService.cs",
    "BlogPostService.cs",
    "CommentService.cs",
    "ReviewService.cs"
)

$basePath = "Services/Implementations"

foreach ($service in $servicesToUpdate) {
    $filePath = Join-Path $basePath $service
    
    if (Test-Path $filePath) {
        Write-Host "Đang cập nhật $service..." -ForegroundColor Yellow
        
        # Đọc nội dung file
        $content = Get-Content $filePath -Raw
        
        # Kiểm tra xem đã có IDateTimeService chưa
        if ($content -notmatch "_dateTimeService") {
            # Thêm IDateTimeService vào constructor parameters
            $content = $content -replace "(public\s+\w+Service\s*\([^)]+)(\))", '$1, IDateTimeService dateTimeService$2'
            
            # Thêm private field
            $content = $content -replace "(private readonly [^;]+;)", '$1`r`n        private readonly IDateTimeService _dateTimeService;'
            
            # Thêm assignment trong constructor
            $content = $content -replace "(\s+_\w+\s*=\s*\w+;)(\s+}\s*$)", '$1`r`n            _dateTimeService = dateTimeService;$2'
        }
        
        # Thay thế DateTime.Now
        $content = $content -replace "DateTime\.Now", "_dateTimeService.Now"
        
        # Ghi lại file
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        
        Write-Host "✅ Đã cập nhật $service" -ForegroundColor Green
    } else {
        Write-Host "❌ Không tìm thấy $service" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Hoàn thành cập nhật DateTime services!" -ForegroundColor Green
Write-Host "📝 Cần rebuild solution để áp dụng thay đổi." -ForegroundColor Cyan 