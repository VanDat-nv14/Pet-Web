import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import orderService from '../services/orderService';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import {
  Typography,
  Form,
  Button,
  Card,
  Table,
  Row,
  Col,
  Alert,
  Space,
  Divider,
  Steps,
  message,
  Badge,
  Tag,
  Avatar,
  Result
} from 'antd';
import {
  ShoppingCartOutlined,
  InfoCircleOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  CarOutlined,
  ShopOutlined,
  LockOutlined
} from '@ant-design/icons';
import './PaymentPage.css';

const { Title, Text } = Typography;
const { Step } = Steps;

const PaymentPage = () => {
  const [form] = Form.useForm();
  const { currentUser } = useContext(AuthContext);
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [orderData, setOrderData] = useState(null);

  // Phí vận chuyển cố định
  const shippingFee = cartItems && cartItems.length > 0 ? 30000 : 0;

  // Log khi component được render
  console.log('PaymentPage rendered', {
    locationState: location.state,
    cartItems: cartItems?.length,
    orderData
  });

  useEffect(() => {
    console.log('PaymentPage useEffect running', {
      locationState: location.state,
      cartItems: cartItems?.length
    });
    
    // Kiểm tra xem có dữ liệu đơn hàng được truyền từ trang checkout không
    if (location.state?.orderData) {
      console.log('Found orderData in location state:', location.state.orderData);
      setOrderData(location.state.orderData);
      form.setFieldsValue({
        paymentMethod: 'COD'
      });
    } else {
      console.log('No orderData found, redirecting to checkout');
      navigate('/checkout');
      return; // Dừng thực thi useEffect
    }
    
    // Kiểm tra nếu giỏ hàng trống thì chuyển về trang giỏ hàng
    if (!cartItems || cartItems.length === 0) {
      console.log('Cart is empty, redirecting to cart page');
      navigate('/cart');
      return; // Dừng thực thi useEffect
    }
  }, [location, navigate, cartItems, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    console.log('Starting order submission with values:', values);

    try {
      if (!orderData) {
        throw new Error('Không có thông tin đơn hàng. Vui lòng thử lại.');
      }

      // Tạo mảng orderItems từ cartItems
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        productOption: item.option || null
      }));
      console.log('Created orderItems:', orderItems);

      // Tạo đối tượng đơn hàng mới kết hợp dữ liệu từ trang checkout
      const newOrder = {
        ...orderData,
        paymentMethod: values.paymentMethod,
        shippingFee,
        orderItems,
        // Tính tổng số tiền
        totalAmount: cartTotal + shippingFee
      };
      console.log('Final order object to be submitted:', newOrder);

      // Gọi API để tạo đơn hàng
      console.log('Calling API to create order...');
      const createdOrder = await orderService.createOrder(newOrder);
      console.log('Order creation successful. Response:', createdOrder);

      // Kiểm tra orderId
      if (!createdOrder || !createdOrder.orderId) {
        console.error('Invalid order response - missing orderId:', createdOrder);
        throw new Error('Không nhận được mã đơn hàng. Vui lòng thử lại.');
      }
      
      // Xóa giỏ hàng sau khi đặt hàng thành công
      console.log('Clearing cart...');
      clearCart();
      
      // Thông báo thành công
      console.log('Showing success message...');
      message.success('Đặt hàng thành công!');
      
      // Chuyển hướng đến trang đặt hàng thành công
      console.log('Navigating to order success page with orderId:', createdOrder.orderId);
      try {
        navigate('/order-success', { 
          state: { 
            success: true, 
            message: 'Đặt hàng thành công!',
            orderId: createdOrder.orderId 
          },
          replace: true // Thêm replace: true để không quay lại trang thanh toán khi ấn back
        });
        console.log('Navigation to success page completed');
      } catch (navError) {
        console.error('Error during navigation:', navError);
      }
    } catch (err) {
      // Hiển thị thông báo lỗi
      console.error('Error during order submission:', err);
      const errorMessage = err.response?.data?.message || 
        err.message || 
        'Đã có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
      
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  if (!cartItems || cartItems.length === 0 || !orderData) {
    return (
      <div className="payment-page empty-cart">
        <Result
          status="warning"
          title="Không thể tiến hành thanh toán"
          subTitle="Vui lòng kiểm tra giỏ hàng và thông tin đặt hàng trước khi thanh toán"
          extra={
            <Button 
              type="primary" 
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate('/checkout')}
              size="large"
            >
              Quay lại trang đặt hàng
            </Button>
          }
        />
      </div>
    );
  }

  // Danh sách sản phẩm trong giỏ hàng
  const cartItemsData = cartItems.map(item => ({
    key: `${item.productId}-${item.option || 'default'}`,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    option: item.option,
    total: item.price * item.quantity,
    image: item.imageUrl
  }));

  // Cột cho bảng tóm tắt đơn hàng
  const orderColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div className="product-summary">
          <Avatar 
            shape="square" 
            size={40} 
            src={record.image} 
            icon={<ShopOutlined />}
            className="product-avatar"
          />
          <div className="product-summary-info">
            <Text strong>{record.name}</Text>
            <div className="product-meta">
              <Text type="secondary">SL: {record.quantity}</Text>
              {record.option && (
                <Tag color="blue" className="option-tag">{record.option}</Tag>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (total) => (
        <Text strong>{formatCurrency(total)}</Text>
      ),
    },
  ];

  return (
    <div className="payment-page">
      <div className="page-header">
        <Title level={2} className="page-title">
          <CreditCardOutlined className="title-icon" /> Phương thức thanh toán
        </Title>
        <Text type="secondary" className="breadcrumb-text">
          Trang chủ / Giỏ hàng / Thông tin đặt hàng / Thanh toán
        </Text>
      </div>
      
      <div className="steps-container">
        <Steps 
          current={2} 
          labelPlacement="vertical"
          responsive={true}
          className="checkout-steps"
        >
          <Step title="Giỏ hàng" icon={<ShoppingCartOutlined />} />
          <Step title="Thông tin đặt hàng" icon={<InfoCircleOutlined />} />
          <Step title="Thanh toán" icon={<CreditCardOutlined />} />
          <Step title="Hoàn tất" icon={<CheckCircleOutlined />} />
        </Steps>
      </div>
      
      {error && (
        <Alert
          message="Lỗi thanh toán"
          description={error}
          type="error"
          showIcon
          closable
          className="error-alert"
          onClose={() => setError(null)}
        />
      )}
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="payment-form"
        initialValues={{
          paymentMethod: 'COD'
        }}
      >
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card 
              className="shipping-info-preview-card"
              title={
                <div className="card-title">
                  <InfoCircleOutlined className="card-title-icon" />
                  <span>Thông tin đặt hàng</span>
                </div>
              }
              bordered={false}
            >
              {orderData && (
                <div className="shipping-info-preview">
                  <div className="info-group">
                    <Title level={5}>Người nhận:</Title>
                    <Text>{orderData.recipientName}</Text>
                  </div>
                  
                  <div className="info-group">
                    <Title level={5}>Số điện thoại:</Title>
                    <Text>{orderData.recipientPhone}</Text>
                  </div>
                  
                  <div className="info-group">
                    <Title level={5}>Địa chỉ giao hàng:</Title>
                    <Text>{orderData.shippingAddress}</Text>
                  </div>
                  
                  {orderData.note && (
                    <div className="info-group">
                      <Title level={5}>Ghi chú:</Title>
                      <Text>{orderData.note}</Text>
                    </div>
                  )}
                </div>
              )}
              <div className="edit-button-container">
                <Button 
                  type="link" 
                  onClick={() => navigate('/checkout')}
                  className="edit-button"
                >
                  Chỉnh sửa
                </Button>
              </div>
            </Card>
            
            <Card 
              className="payment-methods-card"
              title={
                <div className="card-title">
                  <CreditCardOutlined className="card-title-icon" />
                  <span>Phương thức thanh toán</span>
                </div>
              }
              bordered={false}
            >
              <Form.Item 
                name="paymentMethod" 
                rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
              >
                <PaymentMethodSelector 
                  paymentMethod={paymentMethod} 
                  setPaymentMethod={setPaymentMethod} 
                />
              </Form.Item>
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card 
              title={
                <div className="card-title">
                  <ShoppingCartOutlined className="card-title-icon" />
                  <span>Tóm tắt đơn hàng</span>
                  <Badge count={cartItems.length} className="items-count" />
                </div>
              }
              className="order-summary-card"
              bordered={false}
            >
              <div className="order-items">
                <Table 
                  dataSource={cartItemsData}
                  columns={orderColumns}
                  pagination={false}
                  showHeader={false}
                  rowKey="key"
                  className="order-items-table"
                />
              </div>
              
              <Divider />
              
              <div className="order-totals">
                <div className="order-total-row">
                  <Text>Tạm tính:</Text>
                  <Text>{formatCurrency(cartTotal)}</Text>
                </div>
                
                <div className="order-total-row">
                  <Text>
                    <Space>
                      <CarOutlined />
                      <span>Phí vận chuyển:</span>
                    </Space>
                  </Text>
                  <Text>{formatCurrency(shippingFee)}</Text>
                </div>
                
                <Divider />
                
                <div className="order-total-row order-final-total">
                  <Title level={4}>Tổng cộng:</Title>
                  <Title level={3} type="danger">{formatCurrency(cartTotal + shippingFee)}</Title>
                </div>
              </div>
              
              <div className="payment-actions">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  size="large"
                  className="place-order-button"
                  loading={loading}
                  icon={<CheckCircleOutlined />}
                >
                  {loading ? 'Đang xử lý...' : 'Hoàn tất đơn hàng'}
                </Button>
                
                <div className="secure-checkout">
                  <LockOutlined className="secure-icon" />
                  <Text type="secondary">Thanh toán an toàn & bảo mật</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default PaymentPage;