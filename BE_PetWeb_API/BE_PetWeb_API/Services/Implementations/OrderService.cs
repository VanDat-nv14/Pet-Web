using BE_PetWeb_API.DTOs.Order;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class OrderService : IOrderService
    {
        private readonly PetWebContext _context;
        private readonly IDateTimeService _dateTimeService;

        public OrderService(PetWebContext context, IDateTimeService dateTimeService)
        {
            _context = context;
            _dateTimeService = dateTimeService;
        }

        public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(MapToOrderDto);
        }

        public async Task<OrderDto> GetOrderByIdAsync(int id)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
                return null;

            return MapToOrderDto(order);
        }

        public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId)
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(MapToOrderDto);
        }

        public async Task<OrderDto> CreateOrderAsync(int userId, CreateOrderDto createOrderDto)
        {
            // Kiểm tra user có tồn tại
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User không tồn tại");

            // Kiểm tra danh sách sản phẩm
            if (createOrderDto.OrderItems == null || !createOrderDto.OrderItems.Any())
                throw new Exception("Đơn hàng phải có ít nhất một sản phẩm");

            // Kiểm tra và lấy thông tin sản phẩm
            var productIds = createOrderDto.OrderItems.Select(oi => oi.ProductId).ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.ProductId) && p.IsActive == true)
                .ToListAsync();

            if (products.Count != productIds.Count)
                throw new Exception("Một số sản phẩm không tồn tại hoặc không còn hoạt động");

            // Tính tổng tiền
            decimal totalAmount = 0;
            foreach (var item in createOrderDto.OrderItems)
            {
                var product = products.First(p => p.ProductId == item.ProductId);
                totalAmount += product.Price * item.Quantity;
            }

            // Tạo đơn hàng mới
            var order = new Order
            {
                UserId = userId,
                TotalAmount = totalAmount,
                ShippingAddress = createOrderDto.ShippingAddress,
                PaymentMethod = createOrderDto.PaymentMethod,
                Status = "Pending",
                PaymentStatus = "Pending",
                OrderDate = _dateTimeService.Now, // Đối với DateTime? vẫn có thể gán DateTime
                UpdatedAt = _dateTimeService.Now
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Tạo chi tiết đơn hàng
            foreach (var item in createOrderDto.OrderItems)
            {
                var product = products.First(p => p.ProductId == item.ProductId);
                var orderItem = new OrderItem
                {
                    OrderId = order.OrderId,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Price = product.Price,
                    Subtotal = product.Price * item.Quantity
                };

                _context.OrderItems.Add(orderItem);
            }

            await _context.SaveChangesAsync();

            // Trả về thông tin đơn hàng mới
            return await GetOrderByIdAsync(order.OrderId);
        }

        public async Task<OrderDto> UpdateOrderAsync(int orderId, UpdateOrderDto updateOrderDto)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                throw new Exception("Đơn hàng không tồn tại");

            // Không cho phép cập nhật đơn hàng đã hoàn thành hoặc đã hủy
            if (order.Status == "Completed" || order.Status == "Cancelled")
                throw new Exception("Không thể cập nhật đơn hàng đã hoàn thành hoặc đã hủy");

            // Cập nhật thông tin đơn hàng
            if (!string.IsNullOrEmpty(updateOrderDto.ShippingAddress))
                order.ShippingAddress = updateOrderDto.ShippingAddress;

            if (!string.IsNullOrEmpty(updateOrderDto.Status))
                order.Status = updateOrderDto.Status;

            order.UpdatedAt = _dateTimeService.Now;

            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

            return await GetOrderByIdAsync(orderId);
        }

        public async Task<OrderDto> UpdateOrderStatusAsync(int orderId, string status)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                throw new Exception("Đơn hàng không tồn tại");

            // Kiểm tra trạng thái hợp lệ
            var validStatuses = new[] { "Pending", "Processing", "Shipped", "Delivered", "Completed", "Cancelled" };
            if (!validStatuses.Contains(status))
                throw new Exception("Trạng thái không hợp lệ");

            // Không cho phép cập nhật từ trạng thái Cancelled
            if (order.Status == "Cancelled")
                throw new Exception("Không thể cập nhật đơn hàng đã hủy");

            // Cập nhật trạng thái
            order.Status = status;
            order.UpdatedAt = _dateTimeService.Now;

            // Nếu trạng thái là Completed, cập nhật trạng thái thanh toán
            if (status == "Completed")
                order.PaymentStatus = "Paid";

            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

            return await GetOrderByIdAsync(orderId);
        }

        public async Task<bool> CancelOrderAsync(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return false;

            // Chỉ cho phép hủy đơn hàng ở trạng thái Pending hoặc Processing
            if (order.Status != "Pending" && order.Status != "Processing")
                throw new Exception("Không thể hủy đơn hàng ở trạng thái hiện tại");

            order.Status = "Cancelled";
            order.UpdatedAt = _dateTimeService.Now;

            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<OrderDto>> GetOrdersByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.OrderDate.HasValue && o.OrderDate.Value >= startDate.Date && o.OrderDate.Value < endDate.Date.AddDays(1))
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(MapToOrderDto);
        }

        public async Task<IEnumerable<OrderDto>> GetOrdersByStatusAsync(string status)
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.Status == status)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(MapToOrderDto);
        }

        private OrderDto MapToOrderDto(Order order)
        {
            return new OrderDto
            {
                OrderId = order.OrderId,
                UserId = order.UserId,
                UserName = order.User?.FullName,
                TotalAmount = order.TotalAmount,
                ShippingAddress = order.ShippingAddress,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                Status = order.Status,
                OrderDate = order.OrderDate ?? _dateTimeService.Now, // Sử dụng null-coalescing để xử lý null
                UpdatedAt = order.UpdatedAt,
                OrderItems = order.OrderItems.Select(oi => new OrderItemDto
                {
                    OrderItemId = oi.OrderItemId,
                    OrderId = oi.OrderId,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.Name,
                    ProductImage = oi.Product?.Photo,
                    Quantity = oi.Quantity,
                    Price = oi.Price,
                    Subtotal = oi.Subtotal
                }).ToList()
            };
        }
    }
}