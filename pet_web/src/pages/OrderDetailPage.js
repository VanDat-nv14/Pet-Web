import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import orderService from '../services/orderService';
import styled, { keyframes, css } from 'styled-components';

// Ant Design Components
import {
  Layout,
  Typography,
  Button,
  Card,
  Table,
  Tag,
  Avatar,
  Spin,
  Alert,
  Divider,
  Steps,
  Space,
  Row,
  Col,
  Modal,
  Descriptions,
  Badge,
  Statistic,
  List,
  Result,
  Empty,
  Tooltip,
  message,
  Progress,
  Timeline
} from 'antd';

// Ant Design Icons
import {
  ArrowLeftOutlined,
  CarOutlined,
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  MessageOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  InboxOutlined,
  GiftOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  PrinterOutlined,
  DownloadOutlined,
  StarOutlined,
  RightOutlined,
  ExclamationCircleFilled,
  DollarOutlined,
  ShoppingCartOutlined,
  GlobalOutlined,
  CheckOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Content } = Layout;

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
  }
`;

// Add new animation
const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

// Styled Components
const PageContainer = styled(Content)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  animation: ${css`${fadeIn} 0.5s ease-out`};
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const StatusBadge = styled(Badge)`
  .ant-badge-status-dot {
    width: 10px;
    height: 10px;
  }
`;

const HeaderCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #ffffff, #f9fcff);
  border-left: 5px solid ${props => props.borderColor || '#1890ff'};
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
    transform: translateY(-3px);
  }
  
  .ant-card-body {
    padding: 28px;
  }
  
  .header-avatar {
    background: ${props => props.bgColor || 'rgba(24, 144, 255, 0.1)'};
    color: ${props => props.color || '#1890ff'};
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }
  
  .header-avatar:hover {
    transform: scale(1.1) rotate(12deg);
  }
`;

const ProductCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.1);
  }
  
  .ant-table-thead > tr > th {
    background-color: #f0f7ff;
    font-weight: 600;
  }
  
  .product-img {
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transition: transform 0.3s ease;
  }
  
  .product-img:hover {
    transform: scale(1.08);
  }
  
  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    background-color: #f0f7ff;
    padding: 16px 24px;
  }
  
  .ant-card-head-title {
    font-weight: 600;
    font-size: 16px;
  }
`;

const InfoCard = styled(Card)`
  border-radius: 16px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.1);
    transform: translateY(-3px);
  }
  
  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    background-color: #f0f7ff;
    padding: 14px 24px;
  }
  
  .ant-card-head-title {
    font-weight: 600;
  }
  
  .ant-card-body {
    padding: 20px 24px;
  }
`;

const StatusSteps = styled(Steps)`
  margin-top: 24px;
  
  .ant-steps-item-title {
    font-weight: 500;
  }
  
  .ant-steps-item-icon {
    background: #fff;
    border-color: #1890ff;
  }
  
  .ant-steps-item-active .ant-steps-item-icon {
    background: #1890ff;
    box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.2);
    animation: ${css`${pulse} 2s infinite`};
  }
`;

const ActionButton = styled(Button)`
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  font-weight: 500;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const StatusTag = styled(Tag)`
  border-radius: 6px;
  font-weight: 600;
  padding: 6px 12px;
  border: none;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
`;

const ProgressWrapper = styled.div`
  padding: 32px 0 16px;
  
  .status-line {
    height: 6px;
    background-color: #f0f0f0;
    position: relative;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .status-progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(90deg, #1890ff, #52c41a);
    border-radius: 8px;
    transition: width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 1px 4px rgba(24, 144, 255, 0.4);
  }
  
  .status-steps {
    display: flex;
    justify-content: space-between;
  }
  
  .status-step {
    text-align: center;
    flex: 1;
    position: relative;
  }
  
  .step-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    background-color: #f0f0f0;
    color: #999;
    font-size: 18px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    border: 2px solid transparent;
  }
  
  .step-icon.active {
    background-color: #1890ff;
    color: white;
    box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15);
    animation: ${css`${pulse} 2s infinite`};
    transform: scale(1.1);
  }
  
  .step-icon.completed {
    background-color: #52c41a;
    color: white;
    border: 2px solid rgba(82, 196, 26, 0.2);
  }
  
  .step-text {
    font-size: 13px;
    color: #999;
    transition: all 0.3s ease;
    max-width: 80px;
    margin: 0 auto;
    font-weight: 400;
  }
  
  .step-text.active {
    color: #1890ff;
    font-weight: 600;
    transform: scale(1.05);
  }
  
  .step-text.completed {
    color: #52c41a;
    font-weight: 600;
  }
  
  .connector {
    position: absolute;
    top: 20px;
    height: 2px;
    background-color: #f0f0f0;
    width: calc(100% - 40px);
    left: calc(50% + 20px);
    z-index: 0;
  }
  
  .connector.active {
    background-color: #1890ff;
  }
`;

const TotalPriceRow = styled(Row)`
  background-color: #f5f8ff;
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
`;

const ListIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  background-color: rgba(24, 144, 255, 0.1);
  color: #1890ff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    background-color: rgba(24, 144, 255, 0.15);
  }
`;

const OrderTimeline = styled(Timeline)`
  margin-top: 20px;
  padding: 16px;
  
  .ant-timeline-item-tail {
    border-left: 2px solid #e8e8e8;
  }
  
  .ant-timeline-item-head {
    width: 16px;
    height: 16px;
  }
  
  .ant-timeline-item-content {
    padding-bottom: 20px;
  }
  
  .timeline-date {
    color: #8c8c8c;
    font-size: 12px;
    display: block;
    margin-top: 4px;
  }
`;

const SummaryBanner = styled.div`
  background: linear-gradient(120deg, #e6f7ff, #f6ffed);
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
  border-left: 4px solid #52c41a;
  
  .banner-content {
    flex: 1;
  }
  
  .banner-actions {
    margin-left: 16px;
  }
`;

const AnimatedButton = styled(Button)`
  position: relative;
  overflow: hidden;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
    transition: all 0.5s ease;
    z-index: -1;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

// Media query helper for responsive views
const ResponsiveRow = styled(Row)`
  @media (max-width: 768px) {
    flex-direction: column;
    
    .ant-col {
      width: 100%;
      max-width: 100%;
      flex: 0 0 100%;
      margin-bottom: 16px;
    }
  }
`;

const ResponsiveSpace = styled(Space)`
  @media (max-width: 576px) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    
    .ant-space-item {
      margin-right: 0 !important;
      margin-bottom: 8px !important;
      width: 100%;
    }
    
    button {
      width: 100%;
    }
  }
`;

const BounceAvatar = styled.div`
  animation: ${bounce} 2s infinite;
`;

const ShimmerBar = styled.div`
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, #1890ff, #52c41a);
  position: absolute;
  animation: ${shimmer} 1.5s infinite;
`;

const OrderDetailPage = () => {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const isAdmin = currentUser?.role === 'Admin';
  const navigate = useNavigate();
  
  // Display message at component mount
  useEffect(() => {
    message.config({
      top: 80,
      duration: 2,
      maxCount: 3,
    });
    
    message.loading({ content: 'Đang tải thông tin đơn hàng...', key: 'orderLoad' });
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
        setError(null);
        message.success({ content: 'Tải thông tin đơn hàng thành công!', key: 'orderLoad' });
      } catch (err) {
        setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
        message.error({ content: 'Không thể tải thông tin đơn hàng!', key: 'orderLoad' });
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleCancelOrder = () => {
    Modal.confirm({
      title: 'Xác nhận hủy đơn hàng',
      icon: <ExclamationCircleFilled style={{ color: '#ff4d4f' }} />,
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.',
      okText: 'Đồng ý',
      okType: 'danger',
      cancelText: 'Hủy bỏ',
      async onOk() {
        try {
          await orderService.cancelOrder(orderId);
          setOrder({ ...order, status: 'Cancelled' });
          message.success('Đã hủy đơn hàng thành công!');
        } catch (err) {
          message.error('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
          console.error('Error cancelling order:', err);
        }
      }
    });
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      message.loading({ content: 'Đang cập nhật trạng thái...', key: 'updateStatus' });
      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
      setOrder(updatedOrder);
      message.success({ content: 'Cập nhật trạng thái thành công!', key: 'updateStatus' });
    } catch (err) {
      message.error({ content: 'Không thể cập nhật trạng thái đơn hàng!', key: 'updateStatus' });
      console.error('Error updating order status:', err);
    }
  };

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return {
          color: '#faad14',
          bgColor: 'rgba(250, 173, 20, 0.1)',
          icon: <SyncOutlined spin />,
          text: 'Đang xử lý',
          status: 'processing',
          step: 0
        };
      case 'confirmed':
        return {
          color: '#1890ff',
          bgColor: 'rgba(24, 144, 255, 0.1)',
          icon: <InboxOutlined />,
          text: 'Đã xác nhận',
          status: 'processing',
          step: 1
        };
      case 'shipped':
        return {
          color: '#722ed1',
          bgColor: 'rgba(114, 46, 209, 0.1)',
          icon: <CarOutlined />,
          text: 'Đang giao hàng',
          status: 'processing',
          step: 2
        };
      case 'delivered':
        return {
          color: '#52c41a',
          bgColor: 'rgba(82, 196, 26, 0.1)',
          icon: <CheckCircleOutlined />,
          text: 'Đã giao hàng',
          status: 'success',
          step: 3
        };
      case 'cancelled':
        return {
          color: '#ff4d4f',
          bgColor: 'rgba(255, 77, 79, 0.1)',
          icon: <CloseCircleOutlined />,
          text: 'Đã hủy',
          status: 'error',
          step: -1
        };
      default:
        return {
          color: '#8c8c8c',
          bgColor: 'rgba(140, 140, 140, 0.1)',
          icon: <ShoppingOutlined />,
          text: 'Không xác định',
          status: 'default',
          step: 0
        };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (text, record) => (
        <Space size="middle">
          {record.imageUrl && (
            <Avatar 
              src={record.imageUrl} 
              shape="square" 
              size={72} 
              className="product-img"
            />
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{text}</div>
            {record.productOption && (
              <Tag color="blue" style={{ fontWeight: 500, borderRadius: '4px', fontSize: '12px' }}>
                {record.productOption}
              </Tag>
            )}
            {record.productId && (
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: '4px' }}>
                ID: {record.productId}
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price) => (
        <Text style={{ fontWeight: 500, color: '#666' }}>
          {formatCurrency(price)}
        </Text>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (quantity) => (
        <Tag 
          color="blue" 
          style={{ 
            borderRadius: '12px', 
            padding: '4px 12px', 
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)'
          }}
        >
          {quantity}
        </Tag>
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      align: 'right',
      render: (_, record) => (
        <Text strong style={{ 
          color: '#1890ff', 
          fontSize: '16px',
          textShadow: '0 0 1px rgba(24, 144, 255, 0.2)'
        }}>
          {formatCurrency(record.price * record.quantity)}
        </Text>
      ),
    }
  ];

  // Enhanced loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%)',
        borderRadius: '16px',
        margin: '24px'
      }}>
        <BounceAvatar>
          <Avatar 
            size={80} 
            icon={<ShoppingOutlined />} 
            style={{ 
              backgroundColor: '#1890ff',
              boxShadow: '0 8px 16px rgba(24, 144, 255, 0.3)'
            }} 
          />
        </BounceAvatar>
        <Space direction="vertical" align="center" style={{ marginTop: 24 }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            Đang tải thông tin đơn hàng
          </Title>
          <Spin size="large" tip="Vui lòng đợi trong giây lát..." />
          <div style={{ 
            width: '200px', 
            height: '6px', 
            background: '#f0f0f0',
            borderRadius: '3px',
            marginTop: '16px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <ShimmerBar />
          </div>
          <Text type="secondary" style={{ marginTop: 16 }}>
            Chúng tôi đang lấy thông tin chi tiết về đơn hàng của bạn
          </Text>
        </Space>
      </div>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Result
          status="error"
          title="Đã xảy ra lỗi"
          subTitle={error}
          extra={[
            <ActionButton 
              type="primary" 
              key="retry" 
              icon={<SyncOutlined />}
              onClick={() => window.location.reload()}
            >
              Thử lại
            </ActionButton>,
            <ActionButton 
              key="back" 
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            >
              Quay lại
            </ActionButton>
          ]}
        />
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer>
        <Result
          status="warning"
          icon={<InfoCircleOutlined style={{ color: '#faad14' }} />}
          title={
            <Title level={2} style={{ color: '#faad14' }}>
              Không tìm thấy đơn hàng
            </Title>
          }
          subTitle={
            <Text style={{ fontSize: '16px' }}>
              Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn hàng này.
              Vui lòng kiểm tra lại mã đơn hàng hoặc liên hệ với bộ phận hỗ trợ.
            </Text>
          }
          extra={
            <Space size="middle" direction="vertical" style={{ width: '100%' }}>
              <ActionButton 
                type="primary" 
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                size="large"
                style={{ 
                  minWidth: '180px',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 500
                }}
              >
                Quay lại
              </ActionButton>
              <ActionButton
                onClick={() => navigate('/orders')}
                icon={<FileTextOutlined />}
                style={{ 
                  minWidth: '180px'
                }}
              >
                Xem tất cả đơn hàng
              </ActionButton>
            </Space>
          }
        />
        <SummaryBanner>
          <div className="banner-content">
            <Title level={4} style={{ marginBottom: 8 }}>
              Bạn muốn tạo đơn hàng mới?
            </Title>
            <Text>
              Khám phá bộ sưu tập sản phẩm mới nhất dành cho thú cưng của bạn.
            </Text>
          </div>
          <div className="banner-actions">
            <Space>
              <AnimatedButton 
                type="primary" 
                icon={<ShoppingCartOutlined />}
                size="large"
                onClick={() => navigate('/products')}
              >
                Mua sắm ngay
              </AnimatedButton>
            </Space>
          </div>
        </SummaryBanner>
      </PageContainer>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <PageContainer>
      {/* Page Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space size={12}>
            <Title level={2} style={{ margin: 0 }}>
              Chi tiết đơn hàng <Text type="primary">#{order.orderId}</Text>
            </Title>
          </Space>
        </Col>
        <Col>
          <ActionButton 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
          >
            Quay lại
          </ActionButton>
        </Col>
      </Row>

      {/* Order Status Card */}
      <HeaderCard borderColor={statusInfo.color} bgColor={statusInfo.bgColor}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <Space size={16} align="start">
              <Avatar 
                size={64} 
                className="header-avatar" 
                style={{ 
                  background: statusInfo.bgColor, 
                  color: statusInfo.color 
                }} 
                icon={statusInfo.icon} 
              />
              <div>
                <Text type="secondary">Trạng thái đơn hàng</Text>
                <div style={{ marginTop: 4 }}>
                  <Space>
                    <Title level={4} style={{ margin: 0 }}>
                      {statusInfo.text}
                    </Title>
                    <StatusTag color={statusInfo.status}>
                      {statusInfo.text}
                    </StatusTag>
                  </Space>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Space>
                    <CalendarOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary">
                      Đặt ngày: {new Date(order.orderDate).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </Space>
                </div>
              </div>
            </Space>

            {order.status.toLowerCase() !== 'cancelled' && (
              <ProgressWrapper>
                <div className="status-line">
                  <div 
                    className="status-progress" 
                    style={{ width: `${statusInfo.step * 33.33}%` }}
                  />
                </div>
                <div className="status-steps">
                  <div className="status-step">
                    <div className={`step-icon ${statusInfo.step >= 0 ? 'active' : ''} ${statusInfo.step > 0 ? 'completed' : ''}`}>
                      {statusInfo.step > 0 ? <CheckOutlined /> : <SyncOutlined />}
                    </div>
                    <div className={`step-text ${statusInfo.step >= 0 ? 'active' : ''} ${statusInfo.step > 0 ? 'completed' : ''}`}>
                      Xử lý
                    </div>
                    <div className={`connector ${statusInfo.step > 0 ? 'active' : ''}`}></div>
                  </div>
                  <div className="status-step">
                    <div className={`step-icon ${statusInfo.step >= 1 ? 'active' : ''} ${statusInfo.step > 1 ? 'completed' : ''}`}>
                      {statusInfo.step > 1 ? <CheckOutlined /> : <InboxOutlined />}
                    </div>
                    <div className={`step-text ${statusInfo.step >= 1 ? 'active' : ''} ${statusInfo.step > 1 ? 'completed' : ''}`}>
                      Xác nhận
                    </div>
                    <div className={`connector ${statusInfo.step > 1 ? 'active' : ''}`}></div>
                  </div>
                  <div className="status-step">
                    <div className={`step-icon ${statusInfo.step >= 2 ? 'active' : ''} ${statusInfo.step > 2 ? 'completed' : ''}`}>
                      {statusInfo.step > 2 ? <CheckOutlined /> : <CarOutlined />}
                    </div>
                    <div className={`step-text ${statusInfo.step >= 2 ? 'active' : ''} ${statusInfo.step > 2 ? 'completed' : ''}`}>
                      Đang giao
                    </div>
                    <div className={`connector ${statusInfo.step > 2 ? 'active' : ''}`}></div>
                  </div>
                  <div className="status-step">
                    <div className={`step-icon ${statusInfo.step >= 3 ? 'active' : ''}`}>
                      <CheckCircleOutlined />
                    </div>
                    <div className={`step-text ${statusInfo.step >= 3 ? 'active' : ''}`}>
                      Đã giao
                    </div>
                  </div>
                </div>
              </ProgressWrapper>
            )}
          </Col>
          <Col xs={24} md={8}>
            <Row justify="end">
              <Space direction="vertical" style={{ width: '100%' }}>
                {order.status.toLowerCase() === 'processing' && (
                  <ActionButton 
                    type="danger" 
                    icon={<CloseCircleOutlined />} 
                    onClick={handleCancelOrder}
                    block
                  >
                    Hủy đơn hàng
                  </ActionButton>
                )}
                
                <Space wrap style={{ marginTop: 12 }}>
                  <ActionButton icon={<PrinterOutlined />}>
                    In đơn hàng
                  </ActionButton>
                  <ActionButton icon={<DownloadOutlined />}>
                    Tải PDF
                  </ActionButton>
                </Space>
                
                {isAdmin && (
                  <Card 
                    size="small" 
                    title="Cập nhật trạng thái"
                    style={{ marginTop: 16 }}
                  >
                    <Space wrap>
                      {['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                        <Button
                          key={status}
                          type={order.status === status ? 'primary' : 'default'}
                          onClick={() => handleUpdateStatus(status)}
                          disabled={order.status === status || order.status.toLowerCase() === 'cancelled'}
                          size="small"
                        >
                          {status}
                        </Button>
                      ))}
                    </Space>
                  </Card>
                )}
              </Space>
            </Row>
          </Col>
        </Row>
      </HeaderCard>

      <ResponsiveRow gutter={24}>
        {/* Order Items Section */}
        <Col xs={24} lg={16}>
          <ProductCard
            title={
              <Space>
                <ShoppingOutlined style={{ color: '#1890ff' }} />
                <span>Sản phẩm đã đặt</span>
              </Space>
            }
          >
            <Table
              dataSource={order.orderItems}
              columns={columns}
              rowKey={(record) => record.orderItemId || record.productId}
              pagination={false}
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      <Text strong>Tổng tiền sản phẩm:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} />
                    <Table.Summary.Cell index={2} align="right">
                      <Text strong>{formatCurrency(order.subtotalAmount)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      <Text>Phí vận chuyển:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} />
                    <Table.Summary.Cell index={2} align="right">
                      <Text>{formatCurrency(order.shippingFee || 0)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  {order.discount > 0 && (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <Text type="danger">Giảm giá:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} />
                      <Table.Summary.Cell index={2} align="right">
                        <Text type="danger">-{formatCurrency(order.discount)}</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                  <Table.Summary.Row>
                    <Table.Summary.Cell 
                      index={0} 
                      colSpan={2}
                      style={{ borderTop: '1px solid #f0f0f0' }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: 600 }}>Tổng thanh toán:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell 
                      index={1}
                      style={{ borderTop: '1px solid #f0f0f0' }}
                    />
                    <Table.Summary.Cell 
                      index={2} 
                      align="right"
                      style={{ borderTop: '1px solid #f0f0f0' }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: 600, color: '#f5222d' }}>
                        {formatCurrency(order.totalAmount)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </ProductCard>
        </Col>

        {/* Order Info Section */}
        <Col xs={24} lg={8}>
          <InfoCard
            title={
              <Space>
                <CreditCardOutlined style={{ color: '#1890ff' }} />
                <span>Thông tin thanh toán</span>
              </Space>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={[
                {
                  title: 'Phương thức thanh toán',
                  value: order.paymentMethod || 'Thanh toán khi nhận hàng',
                  icon: <CreditCardOutlined style={{ color: '#1890ff' }} />
                },
                {
                  title: 'Trạng thái thanh toán',
                  value: (
                    <Tag color={order.paymentStatus?.toLowerCase() === 'paid' ? 'success' : 'warning'}>
                      {order.paymentStatus?.toLowerCase() === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </Tag>
                  ),
                  icon: order.paymentStatus?.toLowerCase() === 'paid' ? 
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                    <ClockCircleOutlined style={{ color: '#faad14' }} />
                },
                {
                  title: 'Ngày đặt hàng',
                  value: new Date(order.orderDate).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric'
                  }),
                  icon: <CalendarOutlined style={{ color: '#1890ff' }} />
                }
              ].filter(item => item.value)}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <ListIconWrapper>{item.icon}</ListIconWrapper>
                    <div>
                      <Text type="secondary">{item.title}</Text>
                      <div><Text strong>{item.value}</Text></div>
                    </div>
                  </Space>
                </List.Item>
              )}
            />
          </InfoCard>

          <InfoCard
            title={
              <Space>
                <CarOutlined style={{ color: '#1890ff' }} />
                <span>Thông tin giao hàng</span>
              </Space>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={[
                {
                  title: 'Người nhận',
                  value: order.recipientName,
                  icon: <UserOutlined style={{ color: '#1890ff' }} />
                },
                {
                  title: 'Số điện thoại',
                  value: order.recipientPhone,
                  icon: <PhoneOutlined style={{ color: '#1890ff' }} />
                },
                {
                  title: 'Địa chỉ giao hàng',
                  value: order.shippingAddress,
                  icon: <HomeOutlined style={{ color: '#1890ff' }} />
                },
                order.note && {
                  title: 'Ghi chú',
                  value: <Text italic>{order.note}</Text>,
                  icon: <MessageOutlined style={{ color: '#1890ff' }} />
                }
              ].filter(Boolean)}
              renderItem={(item) => (
                <List.Item>
                  <Space align="start">
                    <ListIconWrapper>{item.icon}</ListIconWrapper>
                    <div>
                      <Text type="secondary">{item.title}</Text>
                      <div><Text>{item.value}</Text></div>
                    </div>
                  </Space>
                </List.Item>
              )}
            />
          </InfoCard>

          <InfoCard
            title={
              <Space>
                <CalendarOutlined style={{ color: '#1890ff' }} />
                <span>Lịch sử đơn hàng</span>
              </Space>
            }
          >
            <OrderTimeline>
              <Timeline.Item color="green" dot={<CheckCircleOutlined style={{ fontSize: '16px' }} />}>
                <Text strong>Đơn hàng đã được tạo</Text>
                <span className="timeline-date">
                  {new Date(order.orderDate).toLocaleDateString('vi-VN', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </Timeline.Item>
              
              {statusInfo.step >= 1 && (
                <Timeline.Item color="blue" dot={<InboxOutlined style={{ fontSize: '16px' }} />}>
                  <Text strong>Đơn hàng đã được xác nhận</Text>
                  <span className="timeline-date">
                    {new Date(Date.now() - 3600000).toLocaleDateString('vi-VN', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </Timeline.Item>
              )}
              
              {statusInfo.step >= 2 && (
                <Timeline.Item color="purple" dot={<CarOutlined style={{ fontSize: '16px' }} />}>
                  <Text strong>Đơn hàng đang được giao</Text>
                  <span className="timeline-date">
                    {new Date(Date.now() - 1800000).toLocaleDateString('vi-VN', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </Timeline.Item>
              )}
              
              {statusInfo.step >= 3 && (
                <Timeline.Item color="green" dot={<CheckCircleOutlined style={{ fontSize: '16px' }} />}>
                  <Text strong>Đơn hàng đã giao thành công</Text>
                  <span className="timeline-date">
                    {new Date().toLocaleDateString('vi-VN', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </Timeline.Item>
              )}
              
              {order.status.toLowerCase() === 'cancelled' && (
                <Timeline.Item color="red" dot={<CloseCircleOutlined style={{ fontSize: '16px' }} />}>
                  <Text strong>Đơn hàng đã bị hủy</Text>
                  <span className="timeline-date">
                    {new Date().toLocaleDateString('vi-VN', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </Timeline.Item>
              )}
            </OrderTimeline>
          </InfoCard>

          {/* Order Summary Card */}
          <InfoCard
            title={
              <Space>
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                <span>Tóm tắt đơn hàng</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row justify="space-between">
                <Col>
                  <Statistic 
                    title="Tổng sản phẩm" 
                    value={order.orderItems?.length || 0}
                    valueStyle={{ fontSize: 16 }}
                    prefix={<ShoppingCartOutlined />}
                  />
                </Col>
                <Col>
                  <Statistic
                    title="Tổng thanh toán"
                    value={formatCurrency(order.totalAmount)}
                    valueStyle={{ color: '#f5222d', fontSize: 16 }}
                    prefix={<DollarOutlined />}
                  />
                </Col>
              </Row>
              
              <TotalPriceRow justify="center" style={{ marginTop: 16 }}>
                <Statistic 
                  value={formatCurrency(order.totalAmount)}
                  valueStyle={{ color: '#1890ff', fontWeight: 600 }}
                  prefix={<DollarOutlined />}
                />
              </TotalPriceRow>
              
              <div style={{ marginTop: 16 }}>
                <Paragraph>
                  <Text strong style={{ fontSize: 14 }}>Cảm ơn bạn đã mua hàng tại cửa hàng của chúng tôi!</Text>
                </Paragraph>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Vui lòng kiểm tra email để biết thêm thông tin đơn hàng.
                </Text>
              </div>
            </Space>
          </InfoCard>
        </Col>
      </ResponsiveRow>

      <SummaryBanner>
        <div className="banner-content">
          <Title level={4} style={{ marginBottom: 8, color: '#52c41a' }}>
            Cảm ơn bạn đã mua sắm tại cửa hàng thú cưng của chúng tôi!
          </Title>
          <Text>
            Đội ngũ nhân viên của chúng tôi đang nỗ lực xử lý đơn hàng của bạn trong thời gian sớm nhất.
          </Text>
        </div>
        <div className="banner-actions">
          <Space size="middle">
            <AnimatedButton 
              type="primary" 
              icon={<ShoppingCartOutlined />}
              size="large"
              onClick={() => navigate('/products')}
            >
              Tiếp tục mua sắm
            </AnimatedButton>
          </Space>
        </div>
      </SummaryBanner>

      {/* Additional Actions */}
      <Card
        style={{ 
          marginTop: 24, 
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
          background: 'linear-gradient(to right, #ffffff, #f9fcff)'
        }}
        bodyStyle={{ padding: 24 }}
      >
        <ResponsiveRow justify="space-between" align="middle">
          <Col xs={24} md={12} style={{ marginBottom: '16px' }}>
            <Space size="middle" align="start">
              <Avatar size={48} icon={<MessageOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <div>
                <Text strong style={{ fontSize: 16 }}>Cần giúp đỡ với đơn hàng này?</Text>
                <div><Text type="secondary">Đội ngũ hỗ trợ của chúng tôi sẵn sàng giúp đỡ bạn 24/7</Text></div>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={12}>
            <ResponsiveSpace size="middle">
              <ActionButton icon={<PhoneOutlined />} size="large">
                Hotline: 1900 1234
              </ActionButton>
              <ActionButton type="primary" icon={<MessageOutlined />} size="large">
                Chat với hỗ trợ viên
              </ActionButton>
            </ResponsiveSpace>
          </Col>
        </ResponsiveRow>
      </Card>
    </PageContainer>
  );
};

export default OrderDetailPage;