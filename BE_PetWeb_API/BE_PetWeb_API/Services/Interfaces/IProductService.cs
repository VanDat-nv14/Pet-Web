using System.Collections.Generic;
using System.Threading.Tasks;
using BE_PetWeb_API.DTOs.Product;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllProductsAsync(
            string category = null,
            string brand = null,
            decimal? minPrice = null,
            decimal? maxPrice = null);
        Task<ProductDto> GetProductByIdAsync(int id);
        Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto);
        Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto updateProductDto);
        Task<bool> DeleteProductAsync(int id);
        Task<IEnumerable<ProductDto>> GetLowStockProductsAsync(int threshold);
    }
}