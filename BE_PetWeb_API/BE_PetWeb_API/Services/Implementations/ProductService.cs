using BE_PetWeb_API.DTOs.Product;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class ProductService : IProductService
    {
        private readonly PetWebContext _context;

        public ProductService(PetWebContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductDto>> GetAllProductsAsync(
            string category = null,
            string brand = null,
            decimal? minPrice = null,
            decimal? maxPrice = null)
        {
            var query = _context.Products.AsQueryable();

            // Lọc theo danh mục
            if (!string.IsNullOrEmpty(category))
                query = query.Where(p => p.Category == category);

            // Lọc theo thương hiệu
            if (!string.IsNullOrEmpty(brand))
                query = query.Where(p => p.Brand == brand);

            // Lọc theo khoảng giá
            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);

            // Chỉ lấy sản phẩm còn hoạt động
            query = query.Where(p => p.IsActive == true);

            // Sắp xếp theo ngày tạo mới nhất
            query = query.OrderByDescending(p => p.CreatedAt);

            var products = await query.ToListAsync();
            return products.Select(MapToProductDto);
        }

        public async Task<ProductDto> GetProductByIdAsync(int id)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
                return null;

            return MapToProductDto(product);
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto)
        {
            // Kiểm tra tính hợp lệ của danh mục
            var validCategories = new[] { "Food", "Toy", "Medicine", "Accessory", "Clothing", "Other" };
            if (!validCategories.Contains(createProductDto.Category))
                throw new Exception("Danh mục sản phẩm không hợp lệ");

            // Tạo sản phẩm mới
            var product = new Product
            {
                Name = createProductDto.Name,
                Description = createProductDto.Description,
                Price = createProductDto.Price,
                Category = createProductDto.Category,
                Brand = createProductDto.Brand,
                StockQuantity = createProductDto.StockQuantity,
                Photo = createProductDto.Photo,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                IsActive = true
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return MapToProductDto(product);
        }

        public async Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto updateProductDto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                throw new Exception("Sản phẩm không tồn tại");

            // Cập nhật thông tin sản phẩm
            if (!string.IsNullOrEmpty(updateProductDto.Name))
                product.Name = updateProductDto.Name;

            if (!string.IsNullOrEmpty(updateProductDto.Description))
                product.Description = updateProductDto.Description;

            if (updateProductDto.Price.HasValue)
                product.Price = updateProductDto.Price.Value;

            if (!string.IsNullOrEmpty(updateProductDto.Category))
            {
                var validCategories = new[] { "Food", "Toy", "Medicine", "Accessory", "Clothing", "Other" };
                if (!validCategories.Contains(updateProductDto.Category))
                    throw new Exception("Danh mục sản phẩm không hợp lệ");
                product.Category = updateProductDto.Category;
            }

            if (!string.IsNullOrEmpty(updateProductDto.Brand))
                product.Brand = updateProductDto.Brand;

            if (updateProductDto.StockQuantity.HasValue)
                product.StockQuantity = updateProductDto.StockQuantity.Value;

            if (!string.IsNullOrEmpty(updateProductDto.Photo))
                product.Photo = updateProductDto.Photo;

            if (updateProductDto.IsActive.HasValue)
                product.IsActive = updateProductDto.IsActive.Value;

            product.UpdatedAt = DateTime.Now;

            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            return MapToProductDto(product);
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return false;

            // Kiểm tra xem sản phẩm có trong đơn hàng chưa hoàn thành không
            var inActiveOrder = await _context.OrderItems
                .Include(oi => oi.Order)
                .AnyAsync(oi => oi.ProductId == id &&
                    oi.Order.Status != "Completed" &&
                    oi.Order.Status != "Cancelled");

            if (inActiveOrder)
                throw new Exception("Không thể xóa sản phẩm đang có trong đơn hàng chưa hoàn thành");

            // Chuyển trạng thái thành không hoạt động thay vì xóa hoàn toàn
            product.IsActive = false;
            product.UpdatedAt = DateTime.Now;

            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<ProductDto>> GetLowStockProductsAsync(int threshold = 10)
        {
            var lowStockProducts = await _context.Products
                .Where(p => p.StockQuantity <= threshold && p.IsActive == true)
                .OrderBy(p => p.StockQuantity)
                .ToListAsync();

            return lowStockProducts.Select(MapToProductDto);
        }

        private ProductDto MapToProductDto(Product product)
        {
            return new ProductDto
            {
                ProductId = product.ProductId,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                Category = product.Category,
                Brand = product.Brand,
                StockQuantity = product.StockQuantity,
                Photo = product.Photo,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt,
                IsActive = product.IsActive
            };
        }
    }
}