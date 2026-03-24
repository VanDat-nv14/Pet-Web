import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Result,
  Typography,
  Spin,
  Card,
  Row,
  Col,
  Button,
  Divider,
  Alert,
  Tag,
  Steps,
  Descriptions,
  Space,
  Statistic
} from 'antd';
import {
  CheckCircleOutlined,
  HomeOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  LoadingOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CarOutlined,
  ShopOutlined,
  MailOutlined,
  RightOutlined,
  CloseCircleOutlined 
} from '@ant-design/icons';
import orderService from '../services/orderService';
import './OrderSuccessPage.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy orderId từ state của location hoặc từ URL params
  const orderId = location.state?.orderId || new URLSearchParams(location.search).get('id');

  console.log('OrderSuccessPage rendered', {
    locationState: location.state,
    locationSearch: location.search,
    orderId: orderId
  });

  useEffect(() => {
    console.log('OrderSuccessPage useEffect running', {
      orderId,
      locationState: location.state
    });

    // Nếu không có orderId, chuyển hướng về trang chủ
    if (!orderId) {
      console.warn('No orderId found, redirecting to home page');
      navigate('/');
      return;
    }

    // Lấy thông tin đơn hàng
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        console.log(`Fetching order details for orderId: ${orderId}`);
        const orderData = await orderService.getOrderById(orderId);
        console.log('Order data received:', orderData);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Không thể tải thông tin đơn hàng. Vui lòng kiểm tra trong trang Đơn hàng của tôi.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  // Format thời gian
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mapping phương thức thanh toán
  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'COD':
        return 'Thanh toán khi nhận hàng';
      case 'Banking':
        return 'Chuyển khoản ngân hàng';
      case 'MoMo':
        return 'Ví MoMo';
      default:
        return method;
    }
  };

  // Render payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'COD':
        return <DollarOutlined style={{ color: '#faad14' }} />;
      case 'Banking':
        return <ShopOutlined style={{ color: '#1890ff' }} />;
      case 'MoMo':
        return <ShoppingOutlined style={{ color: '#eb2f96' }} />;
      default:
        return <CreditCardOutlined />;
    }
  };

  // Hiển thị trạng thái đơn hàng
  const getStatusTag = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return <Tag color="gold" icon={<ClockCircleOutlined />}>Đang xử lý</Tag>;
      case 'confirmed':
        return <Tag color="blue" icon={<CheckCircleOutlined />}>Đã xác nhận</Tag>;
      case 'shipped':
        return <Tag color="cyan" icon={<CarOutlined />}>Đang giao hàng</Tag>;
      case 'delivered':
        return <Tag color="green" icon={<CheckCircleOutlined />}>Đã giao hàng</Tag>;
      case 'cancelled':
        return <Tag color="red" icon={<CloseCircleOutlined />}>Đã hủy</Tag>;
      default:
        return <Tag color="default">{status || 'Không xác định'}</Tag>;
    }
  };

  if (loading) {
    return (
      <div className="order-success-loading">
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} 
          tip="Đang tải thông tin đơn hàng..."
        />
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <div className="success-content">
        <Result
          status="success"
          title="Đặt hàng thành công!"
          subTitle="Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý."
          className="success-result"
        />
        
        <div className="steps-container">
          <Steps 
            current={3} 
            labelPlacement="vertical"
            responsive={true}
            className="checkout-steps"
          >
            <Step title="Giỏ hàng" icon={<ShoppingCartOutlined />} />
            <Step title="Thông tin đặt hàng" icon={<InfoCircleOutlined />} />
            <Step title="Thanh toán" icon={<CreditCardOutlined />} />
            <Step title="Hoàn tất" icon={<CheckCircleOutlined />} status="finish" />
          </Steps>
        </div>

        <Divider />
        
        {error ? (
          <Alert
            message="Không thể tải thông tin đơn hàng"
            description={error}
            type="warning"
            showIcon
            className="error-alert"
          />
        ) : order ? (
          <Card className="order-details-card">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card 
                  className="order-info-card"
                  title={
                    <div className="card-title">
                      <InfoCircleOutlined className="card-title-icon" />
                      <span>Thông tin đơn hàng</span>
                    </div>
                  }
                  bordered={false}
                >
                  <Descriptions column={1} size="small" className="order-descriptions">
                    <Descriptions.Item 
                      label="Mã đơn hàng" 
                      labelStyle={{ fontWeight: 500 }}
                    >
                      <Text strong className="order-id">#{order.orderId}</Text>
                    </Descriptions.Item>
                    
                    <Descriptions.Item 
                      label="Ngày đặt hàng" 
                      labelStyle={{ fontWeight: 500 }}
                    >
                      <Space>
                        <ClockCircleOutlined />
                        <span>{formatDateTime(order.orderDate)}</span>
                      </Space>
                    </Descriptions.Item>
                    
                    <Descriptions.Item 
                      label="Trạng thái đơn hàng" 
                      labelStyle={{ fontWeight: 500 }}
                    >
                      {getStatusTag(order.status)}
                    </Descriptions.Item>
                    
                    <Descriptions.Item 
                      label="Phương thức thanh toán" 
                      labelStyle={{ fontWeight: 500 }}
                    >
                      <Space>
                        {getPaymentMethodIcon(order.paymentMethod)}
                        <span>{getPaymentMethodText(order.paymentMethod)}</span>
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card 
                  className="shipping-info-card"
                  title={
                    <div className="card-title">
                      <UserOutlined className="card-title-icon" />
                      <span>Thông tin giao hàng</span>
                    </div>
                  }
                  bordered={false}
                >
                  <Descriptions column={1} size="small" className="order-descriptions">
                    <Descriptions.Item 
                      label="Người nhận" 
                      labelStyle={{ fontWeight: 500 }}
                    >
                      <Space>
                        <UserOutlined />
                        <span>{order.recipientName}</span>
                      </Space>
                    </Descriptions.Item>
                    
                    <Descriptions.Item 
                      label="Số điện thoại" 
                      labelStyle={{ fontWeight: 500 }}
                    >
                      <Space>
                        <PhoneOutlined />
                        <span>{order.recipientPhone}</span>
                      </Space>
                    </Descriptions.Item>
                    
                    <Descriptions.Item 
                      label="Địa chỉ giao hàng" 
                      labelStyle={{ fontWeight: 500 }}
                    >
                      <Space align="start">
                        <EnvironmentOutlined style={{ marginTop: 4 }} />
                        <span>{order.shippingAddress}</span>
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              
              <Col xs={24}>
                <Card 
                  className="payment-summary-card"
                  title={
                    <div className="card-title">
                      <DollarOutlined className="card-title-icon" />
                      <span>Tổng quan đơn hàng</span>
                    </div>
                  }
                  bordered={false}
                >
                  <Row gutter={24} className="payment-summary">
                    <Col xs={24} sm={8}>
                      <Statistic 
                        title="Tổng số sản phẩm" 
                        value={order.orderItems?.length || 0} 
                        suffix="sản phẩm"
                        className="order-statistic"
                      />
                    </Col>
                    
                    <Col xs={24} sm={8}>
                      <Statistic 
                        title="Phí vận chuyển" 
                        value={formatCurrency(order.shippingFee || 0)} 
                        className="order-statistic"
                      />
                    </Col>
                    
                    <Col xs={24} sm={8}>
                      <Statistic 
                        title="Tổng thanh toán" 
                        value={formatCurrency(order.totalAmount)} 
                        className="order-statistic total-amount"
                        valueStyle={{ color: '#f5222d', fontWeight: 'bold' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Card>
        ) : (
          <Alert
            message="Không thể hiển thị thông tin đơn hàng"
            description="Bạn có thể kiểm tra trong mục Đơn hàng của tôi."
            type="info"
            showIcon
            className="error-alert"
          />
        )}
        
        <div className="order-note">
          <Card bordered={false} className="note-card">
            <Space direction="vertical" size="middle">
              <div className="note-item">
                <MailOutlined className="note-icon" />
                <Text>Chúng tôi sẽ gửi email xác nhận đơn hàng và thông tin chi tiết đến địa chỉ email của bạn.</Text>
              </div>
              
              <div className="note-item">
                <FileTextOutlined className="note-icon" />
                <Text>Bạn có thể theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi".</Text>
              </div>
              
              <div className="note-item">
                <CarOutlined className="note-icon" />
                <Text>Đơn hàng thường được giao trong vòng 2-3 ngày làm việc.</Text>
              </div>
            </Space>
          </Card>
        </div>
        
        <Divider />
        
        <div className="action-buttons">
          <Button 
            type="default" 
            icon={<HomeOutlined />}
            size="large"
            className="action-button home-button"
            onClick={() => navigate('/')}
          >
            Trang chủ
          </Button>
          
          <Button 
            type="primary" 
            ghost
            icon={<ShoppingOutlined />}
            size="large"
            className="action-button shop-button"
            onClick={() => navigate('/products')}
          >
            Tiếp tục mua sắm
          </Button>
          
          <Button 
            type="primary" 
            icon={<FileTextOutlined />}
            size="large"
            className="action-button orders-button"
            onClick={() => navigate('/orders')}
          >
            Đơn hàng của tôi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;