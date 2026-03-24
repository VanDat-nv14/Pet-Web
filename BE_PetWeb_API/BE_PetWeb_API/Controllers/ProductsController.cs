using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using BE_PetWeb_API.Services.Interfaces;
using BE_PetWeb_API.DTOs.Product;
using Microsoft.Extensions.Logging;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly IFileService _fileService;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(
            IProductService productService,
            IFileService fileService,
            ILogger<ProductsController> logger)
        {
            _productService = productService;
            _fileService = fileService;
            _logger = logger;
        }

        // GET: api/Products
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetAllProducts(
            [FromQuery] string category = null,
            [FromQuery] string brand = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null)
        {
            var products = await _productService.GetAllProductsAsync(category, brand, minPrice, maxPrice);
            return Ok(products);
        }

        // GET: api/Products/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);

            if (product == null)
            {
                return NotFound("Product not found");
            }

            return Ok(product);
        }

        // POST: api/Products
        [HttpPost]
        [AllowAnonymous] // Thay [Authorize(Roles = "Admin")] bằng [AllowAnonymous]
        public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductDto createProductDto)
        {
            try
            {
                var createdProduct = await _productService.CreateProductAsync(createProductDto);
                return CreatedAtAction(nameof(GetProduct), new { id = createdProduct.ProductId }, createdProduct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating product: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/Products/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateProduct(int id, UpdateProductDto updateProductDto)
        {
            try
            {
                var updatedProduct = await _productService.UpdateProductAsync(id, updateProductDto);
                return Ok(updatedProduct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating product {id}: {ex.Message}");
                if (ex.Message.Contains("not found") || ex.Message.Contains("không tồn tại"))
                {
                    return NotFound(ex.Message);
                }
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Products/5
        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var result = await _productService.DeleteProductAsync(id);
                if (!result)
                {
                    return NotFound("Product not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting product {id}: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }

        // POST: api/Products/{id}/upload-image
        [HttpPost("{id}/upload-image")]
        [AllowAnonymous] // Tạm thời bỏ xác thực để kiểm tra
        public async Task<IActionResult> UploadProductImage(int id, IFormFile file)
        {
            try
            {
                _logger.LogInformation($"Uploading image for product {id}");
                _logger.LogInformation($"Request content type: {Request.ContentType}");
                _logger.LogInformation($"Form file count: {Request.Form.Files.Count}");

                if (file == null)
                {
                    _logger.LogWarning("File parameter is null");

                    // Kiểm tra xem có file nào trong Request.Form.Files không
                    if (Request.Form.Files.Count > 0)
                    {
                        file = Request.Form.Files[0];
                        _logger.LogInformation($"Using first file from form: {file.FileName}, Size: {file.Length}");
                    }
                    else
                    {
                        return BadRequest("Không có file nào được tải lên");
                    }
                }
                else if (file.Length == 0)
                {
                    _logger.LogWarning("File is empty (zero length)");
                    return BadRequest("File rỗng");
                }
                else
                {
                    _logger.LogInformation($"File info: Name={file.FileName}, Size={file.Length}, ContentType={file.ContentType}");
                }

                // Kiểm tra sản phẩm có tồn tại không
                var product = await _productService.GetProductByIdAsync(id);
                if (product == null)
                {
                    _logger.LogWarning($"Product {id} not found for image upload");
                    return NotFound("Sản phẩm không tồn tại");
                }

                // Xóa ảnh cũ nếu có
                if (!string.IsNullOrEmpty(product.Photo))
                {
                    bool deleted = _fileService.DeleteImage(product.Photo);
                    _logger.LogInformation($"Deleted old image: {deleted}, Path: {product.Photo}");
                }

                // Upload ảnh mới vào thư mục products
                _logger.LogInformation("Calling FileService.UploadImageAsync");
                string photoPath = await _fileService.UploadImageAsync(file, "products");
                _logger.LogInformation($"UploadImageAsync result: {photoPath ?? "null"}");

                if (string.IsNullOrEmpty(photoPath))
                {
                    _logger.LogWarning("Failed to upload image, returned path was null or empty");
                    return BadRequest("Không thể tải lên hình ảnh");
                }

                _logger.LogInformation($"Image uploaded successfully: {photoPath}");

                // Cập nhật đường dẫn ảnh trong database
                var updateDto = new UpdateProductDto
                {
                    Photo = photoPath
                };

                _logger.LogInformation($"Updating product with new photo path: {photoPath}");
                var updatedProduct = await _productService.UpdateProductAsync(id, updateDto);
                _logger.LogInformation("Product updated successfully with new photo path");

                return Ok(updatedProduct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading image for product {id}: {ex.Message}");

                if (ex.InnerException != null)
                {
                    _logger.LogError($"Inner exception: {ex.InnerException.Message}");
                }

                return BadRequest($"Lỗi khi tải lên hình ảnh: {ex.Message}");
            }
        }

        // GET: api/Products/Categories
        [HttpGet("Categories")]
        [AllowAnonymous]
        public ActionResult<IEnumerable<string>> GetProductCategories()
        {
            var categories = new[] { "Food", "Toy", "Medicine", "Accessory", "Clothing", "Other" };
            return Ok(categories);
        }

        // GET: api/Products/LowStock
        [HttpGet("LowStock")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetLowStockProducts(
            [FromQuery] int threshold = 10)
        {
            var lowStockProducts = await _productService.GetLowStockProductsAsync(threshold);
            return Ok(lowStockProducts);
        }
    }
}

// Đây là controller thứ hai không có tiền tố "api" để hỗ trợ cả hai kiểu endpoint
// Thêm controller này để đảm bảo các request đến /Products cũng hoạt động
[Route("[controller]")]
[ApiController]
[Authorize]
public class ProductsNoApiController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IFileService _fileService;
    private readonly ILogger<ProductsNoApiController> _logger;

    public ProductsNoApiController(
        IProductService productService,
        IFileService fileService,
        ILogger<ProductsNoApiController> logger)
    {
        _productService = productService;
        _fileService = fileService;
        _logger = logger;
    }

    // POST: /Products/{id}/upload-image
    [HttpPost("{id}/upload-image")]
    [AllowAnonymous] // Tạm thời bỏ xác thực để kiểm tra
    public async Task<IActionResult> UploadProductImage(int id, IFormFile file)
    {
        try
        {
            _logger.LogInformation($"[NoApiController] Uploading image for product {id}");
            _logger.LogInformation($"Request content type: {Request.ContentType}");
            _logger.LogInformation($"Form file count: {Request.Form.Files.Count}");

            if (file == null)
            {
                _logger.LogWarning("File parameter is null");

                // Kiểm tra xem có file nào trong Request.Form.Files không
                if (Request.Form.Files.Count > 0)
                {
                    file = Request.Form.Files[0];
                    _logger.LogInformation($"Using first file from form: {file.FileName}, Size: {file.Length}");
                }
                else
                {
                    return BadRequest("Không có file nào được tải lên");
                }
            }
            else if (file.Length == 0)
            {
                _logger.LogWarning("File is empty (zero length)");
                return BadRequest("File rỗng");
            }
            else
            {
                _logger.LogInformation($"File info: Name={file.FileName}, Size={file.Length}, ContentType={file.ContentType}");
            }

            // Kiểm tra sản phẩm có tồn tại không
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
            {
                _logger.LogWarning($"Product {id} not found for image upload");
                return NotFound("Sản phẩm không tồn tại");
            }

            // Xóa ảnh cũ nếu có
            if (!string.IsNullOrEmpty(product.Photo))
            {
                bool deleted = _fileService.DeleteImage(product.Photo);
                _logger.LogInformation($"Deleted old image: {deleted}, Path: {product.Photo}");
            }

            // Upload ảnh mới vào thư mục products
            _logger.LogInformation("Calling FileService.UploadImageAsync");
            string photoPath = await _fileService.UploadImageAsync(file, "products");
            _logger.LogInformation($"UploadImageAsync result: {photoPath ?? "null"}");

            if (string.IsNullOrEmpty(photoPath))
            {
                _logger.LogWarning("Failed to upload image, returned path was null or empty");
                return BadRequest("Không thể tải lên hình ảnh");
            }

            _logger.LogInformation($"Image uploaded successfully: {photoPath}");

            // Cập nhật đường dẫn ảnh trong database
            var updateDto = new UpdateProductDto
            {
                Photo = photoPath
            };

            _logger.LogInformation($"Updating product with new photo path: {photoPath}");
            var updatedProduct = await _productService.UpdateProductAsync(id, updateDto);
            _logger.LogInformation("Product updated successfully with new photo path");

            return Ok(updatedProduct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error uploading image for product {id}: {ex.Message}");

            if (ex.InnerException != null)
            {
                _logger.LogError($"Inner exception: {ex.InnerException.Message}");
            }

            return BadRequest($"Lỗi khi tải lên hình ảnh: {ex.Message}");
        }
    }
}