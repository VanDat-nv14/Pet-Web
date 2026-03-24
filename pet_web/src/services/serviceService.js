import axiosClient from '../utils/axiosClient';
import { getApiOrigin } from '../config/apiConfig';

// Chuyển đổi nhãn danh mục từ tiếng Việt sang tiếng Anh
const getCategoryValue = (categoryLabel) => {
  const categories = {
    'Chăm sóc & Làm đẹp': 'Grooming',
    'Y tế & Sức khỏe': 'Healthcare', 
    'Huấn luyện': 'Training',
    'Trông giữ qua đêm': 'Boarding',
    'Trông giữ ban ngày': 'DayCare',
    'Dịch vụ khác': 'Other'
  };
  return categories[categoryLabel] || categoryLabel;
};

const serviceService = {
 // Lấy tất cả dịch vụ đang hoạt động
 getAllServices: async () => {
   try {
     // Sửa đường dẫn API để loại bỏ /api vì đã được thêm trong baseURL
     const response = await axiosClient.get('/Services');
     const servicesWithFullImageUrls = response.data.map(service => ({
       ...service,
       photo: service.photo 
         ? `${getApiOrigin()}${service.photo.startsWith('/') ? service.photo : '/' + service.photo}`
         : null
     }));
     return servicesWithFullImageUrls;
   } catch (error) {
     console.error('Lỗi lấy danh sách dịch vụ:', error);
     throw error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách dịch vụ';
   }
 },
 
 // Lấy dịch vụ đang hoạt động (alias của getAllServices)
 getActiveServices: async () => {
   try {
     // Sửa đường dẫn API để loại bỏ /api vì đã được thêm trong baseURL
     const response = await axiosClient.get('/Services');
     const servicesWithFullImageUrls = response.data.map(service => ({
       ...service,
       photo: service.photo 
         ? `${getApiOrigin()}${service.photo.startsWith('/') ? service.photo : '/' + service.photo}`
         : null
     }));
     return servicesWithFullImageUrls;
   } catch (error) {
     console.error('Lỗi lấy danh sách dịch vụ:', error);
     throw error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách dịch vụ';
   }
 },
 
 // Lấy chi tiết dịch vụ theo id
 getServiceById: async (id) => {
   try {
     // Sửa đường dẫn API để loại bỏ /api vì đã được thêm trong baseURL
     const response = await axiosClient.get(`/Services/${id}`);
     const serviceWithFullImageUrl = {
       ...response.data,
       photo: response.data.photo 
         ? `${getApiOrigin()}${response.data.photo.startsWith('/') ? response.data.photo : '/' + response.data.photo}`
         : null
     };
     return serviceWithFullImageUrl;
   } catch (error) {
     console.error('Lỗi lấy thông tin dịch vụ:', error);
     throw error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin dịch vụ';
   }
 },
 
 // Lấy dịch vụ theo danh mục
 getServicesByCategory: async (category) => {
   try {
     // Sửa đường dẫn API để loại bỏ /api vì đã được thêm trong baseURL
     const response = await axiosClient.get(`/Services/category/${category}`);
     const servicesWithFullImageUrls = response.data.map(service => ({
       ...service,
       photo: service.photo 
         ? `${getApiOrigin()}${service.photo.startsWith('/') ? service.photo : '/' + service.photo}`
         : null
     }));
     return servicesWithFullImageUrls;
   } catch (error) {
     console.error('Lỗi lấy danh sách dịch vụ theo danh mục:', error);
     throw error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách dịch vụ theo danh mục';
   }
 },
 
 // Tạo dịch vụ mới (multipart/form-data)
 createService: async (serviceData) => {
   // Tạo FormData để gửi
   const formData = new FormData();
   
   // Chuyển đổi category sang tiếng Anh
   const processedCategory = getCategoryValue(serviceData.category);

   const priceNum = Number(serviceData.price);
   const durationNum = Number(serviceData.duration);
   if (!Number.isFinite(priceNum) || priceNum <= 0) {
     throw new Error('Giá dịch vụ không hợp lệ');
   }
   if (!Number.isFinite(durationNum) || durationNum < 1) {
     throw new Error('Thời lượng dịch vụ không hợp lệ');
   }
   
   // Thêm các trường dữ liệu vào FormData (PascalCase khớp DTO, model binder cũng chấp nhận camelCase)
   formData.append('Name', String(serviceData.name ?? '').trim());
   formData.append('Description', String(serviceData.description ?? '').trim());
   formData.append('Category', processedCategory);
   formData.append('Price', priceNum.toString());
   formData.append('Duration', String(Math.round(durationNum)));
   
   // Thêm ảnh nếu có
   if (serviceData.photo) {
     formData.append('Photo', serviceData.photo);
   }
   
   try {
     try {
       console.log('Dữ liệu gửi đi (không gồm file):', [...formData.entries()].filter(([, v]) => !(v instanceof File)));
     } catch (_) {
       /* ignore */
     }
     const response = await axiosClient.post('/Services', formData);
     return response.data;
   } catch (error) {
     const d = error.response?.data;
     console.error('Lỗi tạo dịch vụ:', d || error.message);
     const msg =
       (typeof d === 'string' && d) ||
       d?.sqlError ||
       d?.message ||
       d?.title ||
       (d?.errors && JSON.stringify(d.errors)) ||
       'Có lỗi xảy ra khi tạo dịch vụ';
     throw msg;
   }
 },
 
 // Cập nhật dịch vụ 
 updateService: async (id, serviceData) => {
   // Tạo FormData để gửi
   const formData = new FormData();
   
   // Chuyển đổi category sang tiếng Anh
   const processedCategory = getCategoryValue(serviceData.category);

   const priceNum = Number(serviceData.price);
   const durationNum = Number(serviceData.duration);
   if (!Number.isFinite(priceNum) || priceNum <= 0) {
     throw new Error('Giá dịch vụ không hợp lệ');
   }
   if (!Number.isFinite(durationNum) || durationNum < 1) {
     throw new Error('Thời lượng dịch vụ không hợp lệ');
   }
   
   formData.append('Name', String(serviceData.name ?? '').trim());
   formData.append('Description', String(serviceData.description ?? '').trim());
   formData.append('Category', processedCategory);
   formData.append('Price', priceNum.toString());
   formData.append('Duration', String(Math.round(durationNum)));
   
   // Thêm ảnh nếu có
   if (serviceData.photo) {
     formData.append('Photo', serviceData.photo);
   }
   
   try {
     console.log('Dữ liệu cập nhật:', Object.fromEntries(formData));
     // Sửa đường dẫn API để loại bỏ /api vì đã được thêm trong baseURL
     const response = await axiosClient.put(`/Services/${id}`, formData);
     console.log('Phản hồi cập nhật dịch vụ:', response.data);
     return response.data;
   } catch (error) {
     console.error('Lỗi cập nhật dịch vụ:', error.response?.data || error.message);
     
     // Log chi tiết lỗi
     if (error.response) {
       console.error('Chi tiết lỗi từ server:', error.response.data);
       console.error('Trạng thái lỗi:', error.response.status);
     }
     
     throw error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật dịch vụ';
   }
 },
 
 // Xóa dịch vụ 
 deleteService: async (id) => {
   try {
     // Sửa đường dẫn API để loại bỏ /api vì đã được thêm trong baseURL
     const response = await axiosClient.delete(`/Services/${id}`);
     return response.data;
   } catch (error) {
     console.error('Lỗi xóa dịch vụ:', error.response?.data || error.message);
     throw error.response?.data?.message || 'Có lỗi xảy ra khi xóa dịch vụ';
   }
 }
};

export default serviceService;