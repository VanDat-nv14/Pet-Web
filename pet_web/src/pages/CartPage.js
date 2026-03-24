import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import {
  Layout,
  Typography,
  Table,
  Button,
  Card,
  Image,
  InputNumber,
  Row,
  Col,
  Alert,
  Space,
  Divider,
  Empty,
  Modal,
  Result,
  Tag,
  Tooltip,
  Badge,
  Statistic,
  Steps,
  Input,
  Form,
  notification,
  Skeleton,
  ConfigProvider,
  theme
} from 'antd';
import {
  DeleteOutlined,
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  ExclamationCircleOutlined,
  GiftOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  HeartOutlined,
  TagOutlined,
  DollarOutlined,
  CarOutlined,
  LockOutlined,
  BookOutlined,
  HomeOutlined,
  SafetyOutlined,
  PercentageOutlined,
  TrophyOutlined,
  StarOutlined,
  ThunderboltOutlined,
  FireOutlined,
  SyncOutlined
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;
const { Step } = Steps;
const { Content } = Layout;
const { useToken } = theme;

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const shine = keyframes`
  0% {
    background-position: -100px;
  }
  40%, 100% {
    background-position: 320px;
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
  100% {
    transform: translateY(0px);
  }
`;

// Pet Paw Icon for branding elements
const PawIcon = () => (
  <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
    <path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5.3-86.2 32.6-96.8 70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3-14.3-70.1 10.2-84.1 59.7.9 78.5 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2-25.8 0-46.7-20.9-46.7-46.7v-1.6c0-10.4 1.6-20.8 5.2-30.5zM411.6 198.6c-18.9 32.4-14.3 70.1 10.2 84.1s59.7-.9 78.5-33.3 14.3-70.1-10.2-84.1-59.7.9-78.5 33.3zM285.5 92.9c-14.3 42.9.3 86.2 32.6 96.8s70.1-15.6 84.4-58.5-.3-86.2-32.6-96.8-70.1 15.6-84.4 58.5z"/>
  </svg>
);

// Styled Components with enhanced animations and styling
const StyledContent = styled(Content)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 40px;
  text-align: center;
  position: relative;
  
  &:after {
    content: "";
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, 
      ${props => props.$colorPrimary}aa, 
      ${props => props.$colorPrimaryActive});
    border-radius: 3px;
  }
  
  .page-title {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    background: linear-gradient(135deg, 
      ${props => props.$colorPrimary}, 
      ${props => props.$colorPrimaryActive});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    position: relative;
    
    .anticon {
      margin-right: 16px;
      font-size: 32px;
    }
  }
  
  .breadcrumb-text {
    font-size: 15px;
    opacity: 0.8;
  }
`;

const StepsContainer = styled.div`
  margin-bottom: 40px;
  padding: 24px;
  background: linear-gradient(to right bottom, 
    rgba(255, 255, 255, 0.9), 
    rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
  
  .ant-steps-item-title {
    font-weight: 600;
    font-size: 15px;
  }
  
  .ant-steps-item-icon {
    background: white;
    border-color: ${props => props.$colorPrimary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    
    .anticon {
      animation: ${float} 3s ease-in-out infinite;
    }
  }
  
  .ant-steps-item-active .ant-steps-item-icon {
    background: ${props => props.$colorPrimary};
    box-shadow: 0 6px 16px ${props => props.$colorPrimary}50;
  }
`;

const CartItemsCard = styled(Card)`
  margin-bottom: 28px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  border: none;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  .ant-card-head {
    background: linear-gradient(120deg, 
      ${props => props.$colorPrimaryBg}, 
      #f9f9ff);
    border-bottom: 1px solid #e6f0fa;
    padding: 0 24px;
    height: 64px;
    
    .ant-card-head-title {
      padding: 16px 0;
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  .ant-card-body {
    padding: 0;
  }
  
  .ant-table {
    background: transparent;
  }
  
  .ant-table-thead > tr > th {
    background: #f7fafd;
    padding: 18px 24px;
    font-weight: 600;
    color: #666;
    font-size: 15px;
    border-bottom: 2px solid #edf1f7;
  }
  
  .ant-table-tbody > tr > td {
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
    transition: all 0.3s ease;
  }
  
  .ant-table-tbody > tr:last-child > td {
    border-bottom: none;
  }
  
  .ant-table-tbody > tr:hover > td {
    background: linear-gradient(to right, #f8fbff, #f5f8ff);
  }
`;

const ProductCell = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  
  .product-image {
    flex-shrink: 0;
    
    img {
      border-radius: 12px;
      object-fit: cover;
      border: 1px solid #f5f5f5;
      transition: all 0.3s ease;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
      
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
      }
    }
  }
  
  .product-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .product-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
      display: inline-block;
      font-size: 16px;
      position: relative;
      transition: all 0.3s ease;
      
      &:hover {
        color: ${props => props.$colorPrimary};
        transform: translateX(3px);
      }
      
      &:after {
        content: "";
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 2px;
        background-color: ${props => props.$colorPrimary};
        transition: width 0.3s ease;
      }
      
      &:hover:after {
        width: 100%;
      }
    }
    
    .ant-tag {
      margin: 0;
      font-size: 12px;
      border-radius: 6px;
      
      &.discount-tag {
        display: flex;
        align-items: center;
        gap: 4px;
        background: #fff2e8;
        border-color: #ffbb96;
        padding: 4px 8px;
        font-weight: 600;
      }
      
      &.product-option {
        background: #e6f7ff;
        color: #1890ff;
        border-color: #91d5ff;
        padding: 4px 8px;
        font-weight: 600;
      }
    }
  }
`;

const PriceCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  
  .current-price {
    font-weight: 700;
    color: #333;
    font-size: 16px;
  }
  
  .original-price {
    font-size: 13px;
  }
`;

const QuantityWrapper = styled(InputNumber)`
  width: 110px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #eee;
  
  .ant-input-number-handler-wrap {
    opacity: 1;
    background: white;
  }
  
  input {
    text-align: center;
    font-weight: 600;
    font-size: 15px;
    padding: 8px 0;
  }
  
  &:hover {
    border-color: ${props => props.$colorPrimary};
  }
`;

const DeleteButton = styled(Button)`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  .anticon {
    font-size: 16px;
  }
  
  &:hover {
    background: #fff1f0;
    color: #ff4d4f;
    transform: rotate(90deg);
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  margin-bottom: 28px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 12px;
  }
  
  .continue-shopping-button {
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 30px;
    padding: 0 20px;
    height: 44px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #eee;
    transition: all 0.3s ease;
    
    .anticon {
      transition: transform 0.3s ease;
    }
    
    &:hover {
      border-color: ${props => props.$colorPrimary};
      color: ${props => props.$colorPrimary};
      transform: translateX(-3px);
      
      .anticon {
        transform: translateX(-4px);
      }
    }
  }
  
  .save-cart-button {
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 30px;
    height: 44px;
    padding: 0 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    color: #ff4d4f;
    border: 1px solid #eee;
    transition: all 0.3s ease;
    
    .anticon {
      transition: transform 0.3s ease;
    }
    
    &:hover {
      border-color: #ff4d4f;
      background: #fff1f0;
      transform: translateY(-3px);
      
      .anticon {
        transform: scale(1.2);
      }
    }
  }
`;

const OrderSummaryCard = styled(Card)`
  border-radius: 16px;
  overflow: hidden;
  border: none;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.07);
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.09);
    transform: translateY(-3px);
  }
  
  .ant-card-head {
    background: linear-gradient(135deg, 
      ${props => props.$colorPrimaryBg}, 
      #f9f9ff);
    border-bottom: 1px solid #e6f0fa;
    padding: 0 24px;
    height: 64px;
    
    .ant-card-head-title {
      padding: 16px 0;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 18px;
      font-weight: 600;
      
      .anticon {
        font-size: 20px;
        color: ${props => props.$colorPrimary};
      }
    }
  }
  
  .ant-card-body {
    padding: 28px 24px;
  }
  
  &:before {
    content: "";
    position: absolute;
    top: 64px;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, 
      #ffcf85, #ff9f74, #ffcf85, #ff9f74);
    opacity: 0;
    background-size: 300% 100%;
    animation: ${shine} 3s infinite linear;
    transition: opacity 0.3s ease;
  }
  
  &:hover:before {
    opacity: 0.7;
  }
`;

const CouponSection = styled.div`
  margin-bottom: 24px;
  
  .coupon-form {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    
    .ant-input {
      border-radius: 8px;
      border: 1px solid #eee;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      height: 44px;
      
      &:hover, &:focus {
        border-color: ${props => props.$colorPrimary};
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
      }
    }
    
    .ant-btn {
      border-radius: 8px;
      height: 44px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
    }
  }
`;

const SummaryContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(3px);
  }
  
  .row-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-weight: 500;
    
    .anticon {
      color: ${props => props.$colorPrimary};
      font-size: 16px;
    }
  }
  
  .row-value {
    font-weight: 600;
  }
`;

const SummaryTotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
  padding: 16px 0;
  border-top: 2px dashed #f0f0f0;
  border-bottom: 2px dashed #f0f0f0;
  
  .total-label {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: #333;
  }
  
  .total-amount {
    background: linear-gradient(135deg, #ff4d4f, #f5222d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
    margin: 0;
    position: relative;
    
    &:after {
      content: "";
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, #ff4d4f, transparent);
      border-radius: 2px;
    }
  }
`;

const CheckoutButton = styled(Button)`
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  margin: 24px 0 16px;
  background: linear-gradient(135deg, 
    ${props => props.$colorPrimary}, 
    ${props => props.$colorPrimaryActive});
  border: none;
  box-shadow: 0 8px 16px ${props => props.$colorPrimary}40;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  
  .anticon {
    font-size: 18px;
    margin-right: 8px;
  }
  
  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.2), 
      transparent);
    transition: all 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 20px ${props => props.$colorPrimary}60;
    
    &:before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 5px 10px ${props => props.$colorPrimary}40;
  }
`;

const SecureCheckout = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px 16px;
  background-color: #f6ffed;
  border-radius: 8px;
  border: 1px solid #b7eb8f;
  
  .anticon {
    color: #52c41a;
  }
  
  .secure-text {
    font-weight: 500;
    color: #52c41a;
  }
`;

const PolicyAlert = styled(Alert)`
  border-radius: 10px;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  .ant-alert-message {
    font-weight: 600;
  }
  
  .ant-alert-description {
    font-size: 13px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const PromotionCard = styled(Card)`
  background: #fffbe6;
  border: 1px solid #ffe7ba;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(250, 140, 22, 0.1);
  transition: all 0.3s ease;
  
  .ant-card-body {
    padding: 12px 16px;
  }
  
  .anticon {
    color: #fa8c16;
    font-size: 18px;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(250, 140, 22, 0.15);
  }
`;

const BenefitsSection = styled.div`
  margin: 24px 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: ${props => props.color || '#f9f9f9'};
  border-radius: 12px;
  transition: all 0.3s ease;
  
  .benefit-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
    color: ${props => props.iconColor || '#1890ff'};
    flex-shrink: 0;
  }
  
  .benefit-content {
    color: ${props => props.textColor || '#666'};
    font-size: 13px;
    font-weight: 500;
  }
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  }
`;

const EmptyCartContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease-out;
`;

const EmptyCartCard = styled(Card)`
  border-radius: 24px;
  overflow: hidden;
  text-align: center;
  border: none;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.07);
  
  .ant-result-icon {
    margin-bottom: 24px;
    
    .anticon, svg {
      font-size: 80px;
      color: ${props => props.$colorPrimary}40;
      animation: ${float} 3s ease-in-out infinite;
    }
  }
  
  .ant-result-title {
    color: #333;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #333, #666);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .ant-result-subtitle {
    color: #666;
    font-size: 17px;
    margin-bottom: 32px;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .ant-btn {
    height: 52px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 30px;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: 0 auto;
    background: linear-gradient(135deg, 
      ${props => props.$colorPrimary}, 
      ${props => props.$colorPrimaryActive});
    border: none;
    box-shadow: 0 8px 16px ${props => props.$colorPrimary}40;
    transition: all 0.3s ease;
    
    .anticon {
      font-size: 20px;
    }
    
    &:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 12px 20px ${props => props.$colorPrimary}60;
    }
  }
`;

const RecommendationSection = styled.div`
  margin-top: 48px;
  text-align: center;
  
  .recommendation-title {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 24px;
    position: relative;
    display: inline-block;
    
    &:before, &:after {
      content: "";
      position: absolute;
      top: 50%;
      width: 50px;
      height: 2px;
      background: #f0f0f0;
    }
    
    &:before {
      left: -70px;
    }
    
    &:after {
      right: -70px;
    }
  }
  
  .pet-icon {
    color: ${props => props.$colorPrimary};
    margin-right: 8px;
    font-size: 24px;
  }
`;

const CartPage = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();
  const { token } = useToken();
  const [couponCode, setCouponCode] = useState('');
  const [isCouponValid, setIsCouponValid] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showRecentlyViewed, setShowRecentlyViewed] = useState(false);

  useEffect(() => {
    // Simulate loading recommended products after cart loads
    if (cartItems.length === 0) {
      const timer = setTimeout(() => {
        setShowRecentlyViewed(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [cartItems]);

  // Phí vận chuyển cố định
  const shippingFee = cartItems.length > 0 ? 30000 : 0;
  
  // Mã khuyến mãi (có thể thay đổi logic)
  const discount = isCouponValid ? 50000 : 0;

  const handleQuantityChange = (productId, quantity, option) => {
    if (quantity > 0) {
      updateQuantity(productId, quantity, option);
    }
  };

  const handleRemoveItem = (productId, option) => {
    confirm({
      title: 'Xác nhận xóa sản phẩm',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      okButtonProps: {
        style: {
          borderRadius: '6px',
        }
      },
      cancelButtonProps: {
        style: {
          borderRadius: '6px',
        }
      },
      onOk() {
        removeFromCart(productId, option);
      }
    });
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      notification.warning({
        message: 'Vui lòng nhập mã giảm giá',
        description: 'Bạn chưa nhập mã giảm giá để áp dụng',
        placement: 'topRight',
      });
      return;
    }
    
    setIsApplyingCoupon(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsApplyingCoupon(false);
      
      // For demo purpose, accept any code PETLOVER
      if (couponCode.toUpperCase() === 'PETLOVER') {
        setIsCouponValid(true);
        notification.success({
          message: 'Áp dụng mã giảm giá thành công',
          description: 'Bạn đã được giảm 50.000₫ cho đơn hàng này',
          placement: 'topRight',
        });
      } else {
        setIsCouponValid(false);
        notification.error({
          message: 'Mã giảm giá không hợp lệ',
          description: 'Vui lòng kiểm tra lại mã giảm giá của bạn',
          placement: 'topRight',
        });
      }
    }, 1000);
  };

  const handleSaveCart = () => {
    notification.success({
      message: 'Đã lưu giỏ hàng',
      description: 'Giỏ hàng của bạn đã được lưu thành công.',
      placement: 'topRight',
    });
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
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <ProductCell $colorPrimary={token.colorPrimary}>
          <div className="product-image">
            {record.imageUrl && (
              <Image 
                src={record.imageUrl} 
                alt={record.name} 
                width={80} 
                height={80}
                preview={false}
                fallback="data:image/png;base64,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"
              />
            )}
          </div>
          <div className="product-info">
            <Link to={`/products/${record.productId}`} className="product-name">
              {record.name}
            </Link>
            {record.option && (
              <Tag color="blue" className="product-option">
                {record.option}
              </Tag>
            )}
            {record.discount > 0 && (
              <Tag color="volcano" icon={<FireOutlined />} className="discount-tag">
                Giảm {record.discount}%
              </Tag>
            )}
          </div>
        </ProductCell>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price, record) => (
        <PriceCell>
          <Text className="current-price">{formatCurrency(price)}</Text>
          {record.originalPrice && record.originalPrice > price && (
            <Text delete type="secondary" className="original-price">
              {formatCurrency(record.originalPrice)}
            </Text>
          )}
        </PriceCell>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (_, record) => (
        <QuantityWrapper
          min={1}
          max={99}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record.productId, value, record.option)}
          controls
          $colorPrimary={token.colorPrimary}
        />
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (_, record) => (
        <Text strong style={{ color: token.colorText, fontSize: '16px', fontWeight: 700 }}>
          {formatCurrency(record.price * record.quantity)}
        </Text>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 70,
      render: (_, record) => (
        <Tooltip title="Xóa sản phẩm">
          <DeleteButton
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveItem(record.productId, record.option)}
          />
        </Tooltip>
      ),
    },
  ];

  // Chuẩn bị dữ liệu cho bảng
  const dataSource = cartItems.map(item => ({
    key: `${item.productId}-${item.option || 'default'}`,
    ...item
  }));

  if (!cartItems || cartItems.length === 0) {
    return (
      <StyledContent>
        <EmptyCartContainer>
          <PageHeader $colorPrimary={token.colorPrimary} $colorPrimaryActive={token.colorPrimaryActive}>
            <Title level={2} className="page-title">
              <ShoppingCartOutlined /> Giỏ hàng
            </Title>
            <Text type="secondary" className="breadcrumb-text">
              <Link to="/" style={{ color: 'inherit' }}><HomeOutlined /> Trang chủ</Link> / Giỏ hàng
            </Text>
          </PageHeader>
          
          <EmptyCartCard $colorPrimary={token.colorPrimary} $colorPrimaryActive={token.colorPrimaryActive}>
            <Result
              icon={<PawIcon />}
              title="Giỏ hàng của bạn đang trống"
              subTitle="Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm cho thú cưng của bạn."
              extra={
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<ShoppingOutlined />}
                  onClick={() => navigate('/products')}
                >
                  Khám phá sản phẩm
                </Button>
              }
            />
          </EmptyCartCard>
          
          {showRecentlyViewed && (
            <RecommendationSection $colorPrimary={token.colorPrimary}>
              <Title level={3} className="recommendation-title">
                <PawIcon className="pet-icon" /> Có thể bạn sẽ thích
              </Title>
              
              <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
                <Col xs={24} sm={12} md={8}>
                  <Skeleton loading active avatar paragraph={{ rows: 3 }} />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Skeleton loading active avatar paragraph={{ rows: 3 }} />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Skeleton loading active avatar paragraph={{ rows: 3 }} />
                </Col>
              </Row>
            </RecommendationSection>
          )}
        </EmptyCartContainer>
      </StyledContent>
    );
  }

  return (
    <StyledContent>
      <PageHeader $colorPrimary={token.colorPrimary} $colorPrimaryActive={token.colorPrimaryActive}>
        <Title level={2} className="page-title">
          <ShoppingCartOutlined /> Giỏ hàng của bạn
        </Title>
        <Text type="secondary" className="breadcrumb-text">
          <Link to="/" style={{ color: 'inherit' }}><HomeOutlined /> Trang chủ</Link> / Giỏ hàng
        </Text>
      </PageHeader>
      
      <StepsContainer 
        $colorPrimary={token.colorPrimary} 
        $colorPrimaryActive={token.colorPrimaryActive}
      >
        <Steps 
          current={0} 
          labelPlacement="vertical"
          responsive={true}
          progressDot
          style={{ maxWidth: 900, margin: '0 auto' }}
        >
          <Step title="Giỏ hàng" description="Xem lại giỏ hàng" icon={<ShoppingCartOutlined />} />
          <Step title="Thông tin đặt hàng" description="Nhập thông tin giao hàng" icon={<InfoCircleOutlined />} />
          <Step title="Thanh toán" description="Lựa chọn phương thức thanh toán" icon={<CreditCardOutlined />} />
          <Step title="Hoàn tất" description="Đặt hàng thành công" icon={<CheckCircleOutlined />} />
        </Steps>
      </StepsContainer>
      
      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <CartItemsCard 
            title={
              <Space>
                <BookOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />
                <span>Sản phẩm trong giỏ hàng ({cartItems.length})</span>
              </Space>
            }
            $colorPrimaryBg={token.colorPrimaryBg}
          >
            <Table 
              columns={columns} 
              dataSource={dataSource}
              pagination={false}
              rowKey="key"
              locale={{
                emptyText: <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  description="Không có sản phẩm trong giỏ hàng" 
                />
              }}
            />
          </CartItemsCard>
          
          <ActionsContainer 
            $colorPrimary={token.colorPrimary}
          >
            <Button 
              type="default" 
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/products')}
              className="continue-shopping-button"
            >
              Tiếp tục mua sắm
            </Button>
            
            <Tooltip title="Lưu giỏ hàng cho lần sau">
              <Button 
                icon={<HeartOutlined />} 
                className="save-cart-button"
                onClick={handleSaveCart}
              >
                Lưu giỏ hàng
              </Button>
            </Tooltip>
          </ActionsContainer>
        </Col>
        
        <Col xs={24} lg={8}>
          <OrderSummaryCard 
            title={
              <Space>
                <DollarOutlined />
                <span>Tóm tắt đơn hàng</span>
              </Space>
            }
            $colorPrimaryBg={token.colorPrimaryBg}
            $colorPrimary={token.colorPrimary}
          >
            <SummaryContent>
              <CouponSection $colorPrimary={token.colorPrimary}>
                <Text strong>Bạn có mã giảm giá?</Text>
                <div className="coupon-form">
                  <Input 
                    placeholder="Nhập mã giảm giá" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    prefix={<PercentageOutlined style={{ color: '#bfbfbf' }} />}
                    status={isCouponValid ? "success" : ""}
                    disabled={isCouponValid}
                  />
                  <Button 
                    type={isCouponValid ? "default" : "primary"}
                    onClick={handleApplyCoupon}
                    loading={isApplyingCoupon}
                    icon={isCouponValid ? <CheckCircleOutlined /> : <TagOutlined />}
                    disabled={isCouponValid}
                  >
                    {isCouponValid ? "Đã áp dụng" : "Áp dụng"}
                  </Button>
                </div>
                {isCouponValid && (
                  <Text type="success" style={{ display: 'block', marginTop: 8, fontSize: 13 }}>
                    <CheckCircleOutlined /> Mã giảm giá đã được áp dụng thành công!
                  </Text>
                )}
              </CouponSection>
              
              <SummaryRow $colorPrimary={token.colorPrimary}>
                <div className="row-label">
                  <ShoppingCartOutlined />
                  <span>Tạm tính ({cartItems.length} sản phẩm):</span>
                </div>
                <Text className="row-value">{formatCurrency(cartTotal)}</Text>
              </SummaryRow>
              
              <SummaryRow $colorPrimary={token.colorPrimary}>
                <div className="row-label">
                  <CarOutlined />
                  <span>Phí vận chuyển:</span>
                </div>
                <Text className="row-value">{formatCurrency(shippingFee)}</Text>
              </SummaryRow>
              
              {discount > 0 && (
                <SummaryRow $colorPrimary={token.colorPrimary}>
                  <div className="row-label">
                    <TagOutlined />
                    <span>Giảm giá:</span>
                  </div>
                  <Text type="success" className="row-value" strong>-{formatCurrency(discount)}</Text>
                </SummaryRow>
              )}
              
              <SummaryTotal>
                <Title level={4} className="total-label">Tổng cộng:</Title>
                <Title level={3} className="total-amount">
                  {formatCurrency(cartTotal + shippingFee - discount)}
                </Title>
              </SummaryTotal>
              
              <CheckoutButton 
                type="primary" 
                size="large" 
                block
                onClick={() => navigate('/checkout')}
                icon={<CreditCardOutlined />}
                $colorPrimary={token.colorPrimary}
                $colorPrimaryActive={token.colorPrimaryActive}
              >
                Tiến hành thanh toán
              </CheckoutButton>
              
              <SecureCheckout>
                <LockOutlined />
                <Text type="success" className="secure-text">Thanh toán an toàn & bảo mật</Text>
              </SecureCheckout>
              
              <BenefitsSection>
                <BenefitItem 
                  color="#e6f7ff" 
                  iconColor="#1890ff" 
                  textColor="#4a5568"
                >
                  <div className="benefit-icon">
                    <TrophyOutlined />
                  </div>
                  <div className="benefit-content">
                    Sản phẩm chính hãng
                  </div>
                </BenefitItem>
                
                <BenefitItem 
                  color="#f6ffed" 
                  iconColor="#52c41a" 
                  textColor="#4a5568"
                >
                  <div className="benefit-icon">
                    <SafetyOutlined />
                  </div>
                  <div className="benefit-content">
                    Bảo hành toàn diện
                  </div>
                </BenefitItem>
                
                <BenefitItem 
                  color="#fff2e8" 
                  iconColor="#fa8c16" 
                  textColor="#4a5568"
                >
                  <div className="benefit-icon">
                    <StarOutlined />
                  </div>
                  <div className="benefit-content">
                    Tích điểm đổi quà
                  </div>
                </BenefitItem>
                
                <BenefitItem 
                  color="#fff7e6" 
                  iconColor="#faad14" 
                  textColor="#4a5568"
                >
                  <div className="benefit-icon">
                    <SyncOutlined />
                  </div>
                  <div className="benefit-content">
                    Đổi trả trong 7 ngày
                  </div>
                </BenefitItem>
              </BenefitsSection>
              
              <PolicyAlert
                message="Chính sách mua hàng"
                description="Bằng cách tiến hành đặt hàng, bạn đồng ý với các điều khoản và điều kiện, chính sách đổi trả của chúng tôi."
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
              />
              
              <div style={{ marginTop: '24px' }}>
                <Badge.Ribbon text="Khuyến mãi đặc biệt" color="#ff7a45" style={{ fontSize: 13 }}>
                  <PromotionCard size="small">
                    <Space align="start">
                      <ThunderboltOutlined style={{ marginTop: 3 }} />
                      <div>
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>Miễn phí vận chuyển</Text>
                        <Text>cho đơn hàng từ <Text strong>{formatCurrency(500000)}</Text></Text>
                      </div>
                    </Space>
                  </PromotionCard>
                </Badge.Ribbon>
              </div>
            </SummaryContent>
          </OrderSummaryCard>
        </Col>
      </Row>
    </StyledContent>
  );
};

export default CartPage;