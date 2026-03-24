import axiosClient from '../utils/axiosClient';

const ORDER_API_URL = '/Orders';

const orderService = {
  // Lấy tất cả đơn hàng (chỉ dành cho Admin)
  getAllOrders: async () => {
    try {
      const response = await axiosClient.get(ORDER_API_URL);
      console.log('All Orders:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy đơn hàng theo ID
  getOrderById: async (orderId) => {
    try {
      const response = await axiosClient.get(`${ORDER_API_URL}/${orderId}`);
      console.log(`Order ${orderId} Details:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy đơn hàng của người dùng hiện tại
  getUserOrders: async () => {
    try {
      const response = await axiosClient.get(`${ORDER_API_URL}/User`);
      console.log('User Orders:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy đơn hàng theo khoảng thời gian (chỉ dành cho Admin)
  getOrdersByDateRange: async (startDate, endDate) => {
    try {
      const response = await axiosClient.get(
        `${ORDER_API_URL}/Date?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      console.log('Orders by Date Range:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by date range:', error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy đơn hàng theo trạng thái (chỉ dành cho Admin)
  getOrdersByStatus: async (status) => {
    try {
      const response = await axiosClient.get(`${ORDER_API_URL}/Status/${status}`);
      console.log(`Orders with status ${status}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching orders with status ${status}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Tạo đơn hàng mới
  createOrder: async (orderData) => {
    try {
      console.log('Creating Order - Input Data:', orderData);
      
      const response = await axiosClient.post(ORDER_API_URL, orderData);
      
      console.log('Order Creation Response:', response.data);
      
      // Kiểm tra và báo lỗi nếu không có orderId
      if (!response.data || !response.data.orderId) {
        console.error('Invalid order response: Missing orderId', response.data);
        throw new Error('Tạo đơn hàng không thành công. Vui lòng thử lại.');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating order:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Ném ra lỗi cụ thể để xử lý ở frontend
      throw new Error(
        error.response?.data?.message || 
        'Không thể tạo đơn hàng. Vui lòng kiểm tra lại thông tin.'
      );
    }
  },

  // Cập nhật đơn hàng
  updateOrder: async (orderId, orderData) => {
    try {
      const response = await axiosClient.put(`${ORDER_API_URL}/${orderId}`, orderData);
      console.log(`Updated Order ${orderId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Cập nhật trạng thái đơn hàng (chỉ dành cho Admin)
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await axiosClient.patch(`${ORDER_API_URL}/${orderId}/Status`, { status });
      console.log(`Updated Order ${orderId} Status:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating status for order ${orderId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Hủy đơn hàng
  cancelOrder: async (orderId) => {
    try {
      await axiosClient.delete(`${ORDER_API_URL}/${orderId}/Cancel`);
      console.log(`Cancelled Order ${orderId}`);
      return true;
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error.response?.data || error.message);
      throw error;
    }
  }
};

export default orderService;