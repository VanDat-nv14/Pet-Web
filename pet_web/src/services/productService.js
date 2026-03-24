import axiosClient from '../utils/axiosClient';
import axios from 'axios';
import { getApiOrigin } from '../config/apiConfig';

const BASE_URL = '/Products';

const productService = {
 // Lấy tất cả sản phẩm với các filter
 getAllProducts: async (filters = {}) => {
   try {
     const { category, brand, minPrice, maxPrice } = filters;
     let url = BASE_URL;
     
     // Xây dựng query string
     const params = new URLSearchParams();
     if (category) params.append('category', category);
     if (brand) params.append('brand', brand);
     if (minPrice) params.append('minPrice', minPrice);
     if (maxPrice) params.append('maxPrice', maxPrice);
     
     // Thêm query string vào URL nếu có filter
     if (params.toString()) {
       url += `?${params.toString()}`;
     }
     
     const response = await axiosClient.get(url);
     
     // Ánh xạ từ stockQuantity sang stock và photo sang imageUrl
     const mappedProducts = response.data.map(product => ({
       productId: product.productId,
       name: product.name,
       description: product.description,
       price: product.price,
       category: product.category,
       brand: product.brand,
       stock: product.stockQuantity, // Ánh xạ từ stockQuantity sang stock
       imageUrl: product.photo 
         ? `${getApiOrigin()}${product.photo.startsWith('/') ? product.photo : '/' + product.photo}` 
         : null
     }));
     
     return mappedProducts;
   } catch (error) {
     console.error('Error fetching products:', error);
     // Trả về mảng rỗng nếu có lỗi để tránh crash
     return [];
   }
 },
 
 // Lấy thông tin chi tiết sản phẩm
 getProductById: async (id) => {
   try {
     const response = await axiosClient.get(`${BASE_URL}/${id}`);
     
     // Ánh xạ từ stockQuantity sang stock và photo sang imageUrl
     const product = response.data;
     return {
       productId: product.productId,
       name: product.name,
       description: product.description,
       price: product.price,
       category: product.category,
       brand: product.brand,
       stock: product.stockQuantity, // Ánh xạ từ stockQuantity sang stock
       imageUrl: product.photo 
         ? `${getApiOrigin()}${product.photo.startsWith('/') ? product.photo : '/' + product.photo}` 
         : null,
       createdAt: product.createdAt,
       updatedAt: product.updatedAt,
       isActive: product.isActive
     };
   } catch (error) {
     console.error(`Error fetching product with id ${id}:`, error);
     throw error;
   }
 },
 
 // Lấy danh sách categories
 getProductCategories: async () => {
   try {
     const response = await axiosClient.get(`${BASE_URL}/Categories`);
     return response.data;
   } catch (error) {
     console.error('Error fetching product categories:', error);
     // Trả về các danh mục mặc định nếu không thể lấy từ API
     return ["Food", "Toy", "Medicine", "Accessory", "Clothing", "Other"];
   }
 },
 
 // Các API dành cho Admin
 
 // Thêm sản phẩm mới
 createProduct: async (productData) => {
   try {
     // Ánh xạ ngược lại từ stock sang stockQuantity và imageUrl sang photo
     const mappedProductData = {
       name: productData.name,
       description: productData.description,
       price: productData.price,
       category: productData.category,
       brand: productData.brand,
       stockQuantity: productData.stock,
       photo: productData.imageUrl ? productData.imageUrl.split('/').pop() : null
     };
     
     const response = await axiosClient.post(BASE_URL, mappedProductData);
     return response.data;
   } catch (error) {
     console.error('Error creating product:', error);
     throw error;
   }
 },
 
 // Cập nhật sản phẩm
 updateProduct: async (id, productData) => {
   try {
     // Ánh xạ ngược lại từ stock sang stockQuantity và imageUrl sang photo
     const mappedProductData = {};
     
     if (productData.name !== undefined) mappedProductData.name = productData.name;
     if (productData.description !== undefined) mappedProductData.description = productData.description;
     if (productData.price !== undefined) mappedProductData.price = productData.price;
     if (productData.category !== undefined) mappedProductData.category = productData.category;
     if (productData.brand !== undefined) mappedProductData.brand = productData.brand;
     if (productData.stock !== undefined) mappedProductData.stockQuantity = productData.stock;
     if (productData.imageUrl !== undefined) {
       mappedProductData.photo = productData.imageUrl ? productData.imageUrl.split('/').pop() : null;
     }
     
     const response = await axiosClient.put(`${BASE_URL}/${id}`, mappedProductData);
     return response.data;
   } catch (error) {
     console.error(`Error updating product with id ${id}:`, error);
     throw error;
   }
 },
 
 // Xóa sản phẩm
 deleteProduct: async (id) => {
   console.log(`Đang cố gắng xóa sản phẩm ID: ${id}`);
   
   try {
     // Cách 1: Dùng fetch API thay vì axios (bypass các vấn đề CORS của axios)
     const response = await fetch(`${getApiOrigin()}/api/Products/${id}`, {
       method: 'DELETE',
       headers: {
         'Accept': 'application/json'
       }
     });
     
     if (!response.ok) {
       const errorText = await response.text();
       console.error(`Lỗi HTTP ${response.status}: ${errorText}`);
       throw new Error(errorText || `Lỗi xóa sản phẩm (HTTP ${response.status})`);
     }
     
     console.log('Xóa sản phẩm thành công!');
     return true;
   } catch (error) {
     console.error(`Lỗi khi xóa sản phẩm ID ${id}:`, error);
     throw error;
   }
 },
 
 // Lấy sản phẩm có số lượng thấp (dành cho Admin)
 getLowStockProducts: async (threshold = 10) => {
   try {
     const response = await axiosClient.get(`${BASE_URL}/LowStock?threshold=${threshold}`);
     
     // Ánh xạ từ stockQuantity sang stock và photo sang imageUrl
     const mappedProducts = response.data.map(product => ({
       productId: product.productId,
       name: product.name,
       description: product.description,
       price: product.price,
       category: product.category,
       brand: product.brand,
       stock: product.stockQuantity, // Ánh xạ từ stockQuantity sang stock
       imageUrl: product.photo 
         ? `${getApiOrigin()}${product.photo.startsWith('/') ? product.photo : '/' + product.photo}` 
         : null // Đường dẫn uploads/products
     }));
     
     return mappedProducts;
   } catch (error) {
     console.error('Error fetching low stock products:', error);
     throw error;
   }
 }
};

export default productService;