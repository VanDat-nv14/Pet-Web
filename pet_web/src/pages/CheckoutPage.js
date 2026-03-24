import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import {
  Typography,
  Form,
  Input,
  Button,
  Card,
  Table,
  Row,
  Col,
  Alert,
  Space,
  Divider,
  Steps,
  Result,
  message,
  Tag,
  Avatar,
  Badge,
  theme,
  Layout,
  Tooltip,
  ConfigProvider
} from 'antd';
import {
  ShoppingCartOutlined,
  InfoCircleOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  MessageOutlined,
  CarOutlined,
  SecurityScanOutlined,
  ShopOutlined,
  LockOutlined,
  ArrowRightOutlined,
  RightOutlined,
  SafetyOutlined,
  GiftOutlined,
  HeartOutlined,
  StarOutlined,
  SmileOutlined,
  CalendarOutlined,
  RocketOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;
const { Content } = Layout;
const { useToken } = theme;

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

const fadeInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
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

const shine = keyframes`
  0% {
    background-position: -100px;
  }
  40%, 100% {
    background-position: 320px;
  }
`;

// Pet Paw Icon for pet-themed branding
const PawIcon = () => (
  <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
    <path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5.3-86.2 32.6-96.8 70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3-14.3-70.1 10.2-84.1 59.7.9 78.5 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2-25.8 0-46.7-20.9-46.7-46.7v-1.6c0-10.4 1.6-20.8 5.2-30.5zM411.6 198.6c-18.9 32.4-14.3 70.1 10.2 84.1s59.7-.9 78.5-33.3 14.3-70.1-10.2-84.1-59.7.9-78.5 33.3zM285.5 92.9c-14.3 42.9.3 86.2 32.6 96.8s70.1-15.6 84.4-58.5-.3-86.2-32.6-96.8-70.1 15.6-84.4 58.5z"/>
  </svg>
);

// Enhanced Styled Components with animations and luxurious styling
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
    margin-bottom: 12px;
    background: linear-gradient(135deg, 
      ${props => props.$colorPrimary}, 
      ${props => props.$colorPrimaryActive});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    position: relative;
    
    .anticon, svg {
      margin-right: 16px;
      font-size: 32px;
    }
  }
  
  .breadcrumb-text {
    font-size: 15px;
    opacity: 0.8;
    
    a {
      position: relative;
      color: rgba(0, 0, 0, 0.65);
      transition: all 0.3s;
      
      &:after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 1px;
        background: ${props => props.$colorPrimary};
        transition: width 0.3s ease;
      }
      
      &:hover {
        color: ${props => props.$colorPrimary};
        
        &:after {
          width: 100%;
        }
      }
    }
    
    .separator {
      margin: 0 8px;
    }
  }
`;

const StepsContainer = styled.div`
  margin-bottom: 40px;
  padding: 32px 24px;
  background: linear-gradient(to right bottom, 
    rgba(255, 255, 255, 0.9), 
    rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
  
  .ant-steps-item-title {
    font-weight: 600;
    font-size: 15px;
  }
  
  .ant-steps-item-description {
    font-size: 13px;
    max-width: none !important;
  }
  
  .ant-steps-item-icon {
    background: white;
    border-color: ${props => props.$colorPrimary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    
    .anticon {
      animation: ${float} 3s ease-in-out infinite;
      animation-delay: calc(var(--i) * 0.5s);
    }
  }
  
  .ant-steps-item-active .ant-steps-item-icon {
    background: ${props => props.$colorPrimary};
    box-shadow: 0 6px 16px ${props => props.$colorPrimary}50;
    transform: scale(1.1);
  }
  
  .ant-steps-item-container {
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-3px);
    }
  }
  
  /* Decorative background elements */
  &:before {
    content: "";
    position: absolute;
    top: 20%;
    left: 5%;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: radial-gradient(circle, 
      ${props => props.$colorPrimaryBg}50, 
      transparent 70%);
    z-index: 0;
  }
  
  &:after {
    content: "";
    position: absolute;
    bottom: 10%;
    right: 10%;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: radial-gradient(circle, 
      ${props => props.$colorPrimaryBg}30, 
      transparent 70%);
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const StyledForm = styled(Form)`
  width: 100%;
`;

const EmptyContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding: 40px 0;
  animation: ${fadeIn} 0.6s ease-out;
  
  .ant-result {
    padding: 40px 32px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
    border: none;
  }
  
  .ant-result-icon {
    .anticon, svg {
      font-size: 80px;
      color: ${props => props.$colorPrimary}40;
      animation: ${float} 3s ease-in-out infinite;
    }
  }
  
  .ant-result-title {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #333, #666);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .ant-result-subtitle {
    font-size: 17px;
    color: #666;
    margin-bottom: 32px;
    max-width: 500px;
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

const ErrorAlert = styled(Alert)`
  margin-bottom: 24px;
  border-radius: 10px;
  animation: ${pulse} 0.5s ease-in-out;
  box-shadow: 0 6px 16px rgba(255, 77, 79, 0.2);
  
  .ant-alert-message {
    font-weight: 600;
  }
`;

const ShippingInfoCard = styled(Card)`
  border-radius: 16px;
  overflow: hidden;
  border: none;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.07);
  margin-bottom: 28px;
  animation: ${fadeIn} 0.6s ease-out;
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
  
  .field-icon {
    color: ${props => props.$colorPrimary};
    transition: all 0.3s ease;
  }
  
  .ant-input-prefix {
    margin-right: 10px;
  }
  
  .ant-form-item-label > label {
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
    font-size: 15px;
  }
  
  .ant-input {
    border-radius: 10px;
    padding: 12px 16px;
    border: 1px solid #eee;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    transition: all 0.3s ease;
    
    &:hover, &:focus {
      border-color: ${props => props.$colorPrimary};
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
    }
  }
  
  .ant-input-affix-wrapper {
    border-radius: 10px;
    padding: 0 16px;
    border: 1px solid #eee;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    transition: all 0.3s ease;
    
    &:hover, &:focus, &-focused {
      border-color: ${props => props.$colorPrimary};
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
      
      .field-icon {
        transform: scale(1.1);
      }
    }
    
    input {
      padding: 12px 0;
    }
  }
  
  .ant-input-textarea {
    border-radius: 10px;
  }
  
  .ant-input-textarea-show-count::after {
    color: rgba(0, 0, 0, 0.45);
  }
  
  .ant-form-item-has-error .ant-input-affix-wrapper,
  .ant-form-item-has-error .ant-input {
    animation: ${pulse} 0.5s ease-in-out;
  }
`;

const OrderSummaryCard = styled(Card)`
  border-radius: 16px;
  overflow: hidden;
  border: none;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.07);
  margin-bottom: 28px;
  position: relative;
  transition: all 0.3s ease;
  animation: ${fadeInRight} 0.6s ease-out;
  
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
      
      .ant-badge {
        margin-left: auto;
        
        .ant-badge-count {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }
      }
    }
  }
  
  .ant-card-body {
    padding: 28px 24px;
  }
  
  .ant-table {
    background: transparent;
  }
  
  .ant-table-tbody > tr > td {
    border-bottom: 1px dashed #f0f0f0;
    padding: 16px 8px;
    transition: all 0.3s ease;
  }
  
  .ant-table-tbody > tr:hover > td {
    background: linear-gradient(to right, #f8fbff, #f5f8ff);
  }
  
  .ant-table-tbody > tr:last-child > td {
    border-bottom: none;
  }
  
  /* Decorative accent line */
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

const ProductSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  
  .ant-avatar {
    flex-shrink: 0;
    border-radius: 12px;
    border: 1px solid #f5f5f5;
    background: #f9f9f9;
    object-fit: cover;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
    }
  }
  
  .product-summary-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    
    .ant-typography {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: all 0.3s ease;
      font-weight: 600;
      font-size: 15px;
      
      &:hover {
        color: ${props => props.$colorPrimary};
      }
    }
  }
  
  .product-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .ant-tag {
      margin: 0;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      font-weight: 600;
      border: none;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    }
  }
  
  &:hover {
    transform: translateX(5px);
  }
`;

const OrderTotals = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OrderTotalRow = styled.div`
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
  
  &.order-final-total {
    margin-top: 8px;
    
    .ant-typography {
      margin: 0;
    }
    
    .total-amount {
      background: linear-gradient(135deg, #ff4d4f, #f5222d);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 700;
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
  }
`;

const CheckoutActions = styled.div`
  margin-top: 24px;
`;

const PlaceOrderButton = styled(Button)`
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  margin-bottom: 16px;
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
    transition: transform 0.3s ease;
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
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 12px 20px ${props => props.$colorPrimary}60;
    
    &:before {
      left: 100%;
    }
    
    .anticon {
      transform: translateX(4px);
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 5px 10px ${props => props.$colorPrimary}40;
  }
  
  &:disabled {
    opacity: 0.7;
    background: linear-gradient(135deg, #bfbfbf, #d9d9d9);
    box-shadow: none;
  }
`;

const SecureCheckoutBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px 16px;
  background-color: #f6ffed;
  border-radius: 8px;
  border: 1px solid #b7eb8f;
  transition: all 0.3s ease;
  
  .anticon {
    color: #52c41a;
  }
  
  .secure-text {
    font-weight: 500;
    color: #52c41a;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(82, 196, 26, 0.15);
  }
`;

const SecurityCard = styled(Card)`
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.07);
  margin-top: 24px;
  background: linear-gradient(145deg, #f6ffed, #e6f7ff);
  border: none;
  animation: ${fadeInRight} 0.8s ease-out;
  transition: all 0.3s ease;
  
  .ant-card-body {
    padding: 20px;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  }
`;

const SecurityFeatures = styled.div`
  .security-list {
    width: 100%;
  }
`;

const SecurityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  transition: all 0.3s ease;
  
  .security-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
    color: #52c41a;
    font-size: 16px;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }
  
  .security-content {
    font-weight: 600;
    font-size: 15px;
  }
  
  &:hover {
    transform: translateX(5px);
    
    .security-icon {
      transform: scale(1.1);
      box-shadow: 0 6px 12px rgba(82, 196, 26, 0.2);
    }
  }
`;

const PolicyAlert = styled(Alert)`
  border-radius: 10px;
  margin: 16px 0;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  
  .ant-alert-message {
    font-weight: 600;
  }
  
  .ant-alert-description {
    font-size: 13px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  }
`;

const SparkleIcon = styled.div`
  position: absolute;
  top: ${props => props.top || '10%'};
  left: ${props => props.left || 'auto'};
  right: ${props => props.right || 'auto'};
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.color || '#FFD700'};
  box-shadow: 0 0 10px 2px ${props => props.color || '#FFD700'};
  opacity: 0.7;
  animation: ${pulse} 2s infinite ease-in-out;
  animation-delay: ${props => props.delay || '0s'};
  z-index: 1;
`;

const FeatureHighlight = styled.div`
  position: absolute;
  top: ${props => props.top};
  right: ${props => props.right};
  background: linear-gradient(135deg, #fff8e6, #fff1f0);
  border-radius: 30px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #ffe7ba;
  animation: ${float} 3s ease-in-out infinite;
  z-index: 10;
  
  .highlight-icon {
    color: #fa8c16;
    font-size: 14px;
  }
  
  .highlight-text {
    font-size: 12px;
    font-weight: 600;
    color: #fa8c16;
  }
`;

const glow = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(24, 144, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(24, 144, 255, 0.8);
  }
  100% {
    box-shadow: 0 0 5px rgba(24, 144, 255, 0.5);
  }
`;

const AddressTag = styled(Tag)`
  margin: 0 0 8px 0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  
  &.saved-address {
    background: #e6f7ff;
    color: #1890ff;
    animation: ${glow} 2s infinite;
  }
`;

const CheckoutPage = () => {
  const [form] = Form.useForm();
  const { currentUser } = useContext(AuthContext);
  const { cartItems, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();
  const { token } = useToken();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formTouched, setFormTouched] = useState(false);
  const [useSavedAddress, setUseSavedAddress] = useState(true);

  // Phí vận chuyển cố định
  const shippingFee = cartItems && cartItems.length > 0 ? 30000 : 0;
  
  // Thời gian giao hàng dự kiến
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    // Kiểm tra nếu giỏ hàng trống thì chuyển về trang giỏ hàng
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
    }
    
    // Set giá trị mặc định từ thông tin user
    form.setFieldsValue({
      recipientName: currentUser?.fullName || '',
      recipientPhone: currentUser?.phone || '',
      shippingAddress: currentUser?.address || '',
      note: ''
    });
  }, [cartItems, navigate, currentUser, form]);

  // Hàm xử lý khi người dùng submit form
  const handleSubmit = (values) => {
    setLoading(true);
    
    try {
      // Kiểm tra dữ liệu đầu vào
      const { recipientName, recipientPhone, shippingAddress } = values;
      
      if (!recipientName || !recipientPhone || !shippingAddress) {
        message.error('Vui lòng điền đầy đủ thông tin giao hàng!');
        setLoading(false);
        return;
      }
      
      // Lưu lại thời gian hoàn thành đơn hàng
      setTimeout(() => {
        // Chuyển đến trang thanh toán kèm theo dữ liệu đơn hàng
        navigate('/payment', {
          state: {
            orderData: values
          }
        });
      }, 1500);
    } catch (err) {
      // Hiển thị thông báo lỗi
      const errorMessage = err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setError(errorMessage);
      message.error(errorMessage);
      setLoading(false);
    }
  };
  
  const toggleSavedAddress = () => {
    setUseSavedAddress(!useSavedAddress);
    
    if (!useSavedAddress && currentUser) {
      // Nếu bật lại địa chỉ đã lưu, cập nhật form với dữ liệu người dùng
      form.setFieldsValue({
        recipientName: currentUser.fullName || '',
        recipientPhone: currentUser.phone || '',
        shippingAddress: currentUser.address || '',
      });
    } else if (useSavedAddress) {
      // Nếu tắt địa chỉ đã lưu, xóa các trường địa chỉ
      form.setFieldsValue({
        recipientName: '',
        recipientPhone: '',
        shippingAddress: '',
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };
  
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date);
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <StyledContent>
        <EmptyContainer $colorPrimary={token.colorPrimary} $colorPrimaryActive={token.colorPrimaryActive}>
          <Result
            icon={<PawIcon />}
            title="Giỏ hàng của bạn đang trống"
            subTitle="Vui lòng thêm sản phẩm vào giỏ hàng để tiến hành thanh toán. Khám phá các sản phẩm tuyệt vời cho thú cưng của bạn."
            extra={
              <Button 
                type="primary" 
                icon={<ShoppingCartOutlined />}
                onClick={() => navigate('/products')}
                size="large"
              >
                Khám phá sản phẩm
              </Button>
            }
          />
        </EmptyContainer>
      </StyledContent>
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
        <ProductSummary $colorPrimary={token.colorPrimary}>
          <Avatar 
            shape="square" 
            size={60} 
            src={record.image} 
            icon={<ShopOutlined />}
          />
          <div className="product-summary-info">
            <Text strong>{record.name}</Text>
            <div className="product-meta">
              <Text type="secondary">SL: {record.quantity}</Text>
              {record.option && (
                <Tag color="blue" className="option-tag">
                  <StarOutlined /> {record.option}
                </Tag>
              )}
            </div>
          </div>
        </ProductSummary>
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (total) => (
        <Text strong style={{ fontSize: '16px' }}>{formatCurrency(total)}</Text>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Steps: {
            titleLineHeight: 1.5,
            descriptionMaxWidth: 200
          }
        }
      }}
    >
      <StyledContent>
        <PageHeader 
          $colorPrimary={token.colorPrimary} 
          $colorPrimaryActive={token.colorPrimaryActive}
        >
          <Title level={2} className="page-title">
            <PawIcon /> Thông tin đặt hàng
          </Title>
          <Text type="secondary" className="breadcrumb-text">
            <Link to="/">Trang chủ</Link>
            <RightOutlined className="separator" style={{ fontSize: '10px' }}/>
            <Link to="/cart">Giỏ hàng</Link>
            <RightOutlined className="separator" style={{ fontSize: '10px' }}/>
            Thông tin đặt hàng
          </Text>
        </PageHeader>
        
        <StepsContainer 
          $colorPrimary={token.colorPrimary} 
          $colorPrimaryActive={token.colorPrimaryActive}
          $colorPrimaryBg={token.colorPrimaryBg}
        >
          <SparkleIcon top="15%" left="5%" delay="0.2s" color="#1890ff" />
          <SparkleIcon top="70%" left="20%" delay="0.5s" color="#52c41a" />
          <SparkleIcon top="30%" right="10%" delay="0.8s" color="#fa8c16" />
          
          <Steps 
            current={1} 
            labelPlacement="vertical"
            responsive={true}
            style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}
            progressDot
          >
            <Step 
              title="Giỏ hàng" 
              description="Xem lại giỏ hàng" 
              icon={<ShoppingCartOutlined style={{ '--i': 0 }} />} 
            />
            <Step 
              title="Thông tin đặt hàng" 
              description="Điền thông tin giao hàng" 
              icon={<InfoCircleOutlined style={{ '--i': 1 }} />} 
            />
            <Step 
              title="Thanh toán" 
              description="Chọn phương thức thanh toán" 
              icon={<CreditCardOutlined style={{ '--i': 2 }} />} 
            />
            <Step 
              title="Hoàn tất" 
              description="Đặt hàng thành công" 
              icon={<CheckCircleOutlined style={{ '--i': 3 }} />} 
            />
          </Steps>
          
          <FeatureHighlight top="-15px" right="20px">
            <ThunderboltOutlined className="highlight-icon" />
            <Text className="highlight-text">Giao nhanh chỉ từ 2-3 ngày</Text>
          </FeatureHighlight>
        </StepsContainer>
        
        {error && (
          <ErrorAlert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}
        
        <StyledForm
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onFieldsChange={() => setFormTouched(true)}
        >
          <Row gutter={32}>
            <Col xs={24} lg={15}>
              <ShippingInfoCard 
                title={
                  <Space>
                    <UserOutlined />
                    <span>Thông tin giao hàng</span>
                  </Space>
                } 
                $colorPrimary={token.colorPrimary}
                $colorPrimaryBg={token.colorPrimaryBg}
              >
                {currentUser && (
                  <div style={{ marginBottom: 20 }}>
                    <AddressTag 
                      className={useSavedAddress ? 'saved-address' : ''}
                      onClick={toggleSavedAddress}
                      style={{ cursor: 'pointer' }}
                    >
                      <HomeOutlined /> 
                      {useSavedAddress ? 'Đang sử dụng địa chỉ đã lưu' : 'Sử dụng địa chỉ đã lưu'}
                    </AddressTag>
                    
                    {useSavedAddress && currentUser.address && (
                      <div style={{ 
                        padding: '10px 15px', 
                        background: 'rgba(24, 144, 255, 0.05)', 
                        borderRadius: '10px',
                        marginTop: '10px',
                        marginBottom: '10px',
                        border: '1px solid rgba(24, 144, 255, 0.2)',
                        animation: `${fadeIn} 0.3s ease-out`
                      }}>
                        <Text strong style={{ display: 'block', marginBottom: 5 }}>
                          <UserOutlined style={{ marginRight: 5, color: token.colorPrimary }} />
                          {currentUser.fullName}
                        </Text>
                        <Text style={{ display: 'block', marginBottom: 5 }}>
                          <PhoneOutlined style={{ marginRight: 5, color: token.colorPrimary }} />
                          {currentUser.phone}
                        </Text>
                        <Text style={{ display: 'block' }}>
                          <HomeOutlined style={{ marginRight: 5, color: token.colorPrimary }} />
                          {currentUser.address}
                        </Text>
                      </div>
                    )}
                  </div>
                )}
                
                <Divider style={{ margin: '16px 0 24px' }} />
                
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="recipientName"
                      label="Họ tên người nhận"
                      rules={[
                        { required: true, message: 'Vui lòng nhập họ tên người nhận!' }
                      ]}
                    >
                      <Input 
                        prefix={<UserOutlined className="field-icon" />} 
                        placeholder="Nhập họ tên người nhận"
                        size="large"
                        disabled={useSavedAddress && currentUser?.fullName}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="recipientPhone"
                      label="Số điện thoại"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                        { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                      ]}
                    >
                      <Input 
                        prefix={<PhoneOutlined className="field-icon" />} 
                        placeholder="Nhập số điện thoại"
                        size="large"
                        disabled={useSavedAddress && currentUser?.phone}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item
                  name="shippingAddress"
                  label="Địa chỉ giao hàng"
                  rules={[
                    { required: true, message: 'Vui lòng nhập địa chỉ giao hàng!' }
                  ]}
                >
                  <TextArea 
                    placeholder="Nhập địa chỉ giao hàng chi tiết"
                    autoSize={{ minRows: 3, maxRows: 5 }}
                    showCount
                    maxLength={200}
                    disabled={useSavedAddress && currentUser?.address}
                    style={{ padding: '12px 16px' }}
                  />
                </Form.Item>
                
                <Form.Item
                  name="note"
                  label="Ghi chú đơn hàng"
                >
                  <TextArea 
                    prefix={<MessageOutlined className="field-icon" />}
                    placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    showCount
                    maxLength={200}
                    style={{ padding: '12px 16px' }}
                  />
                </Form.Item>
                
                <Alert
                  message={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CalendarOutlined style={{ color: token.colorSuccess }} />
                      <Text strong>Thời gian giao hàng dự kiến</Text>
                    </div>
                  }
                  description={
                    <Text>
                      Đơn hàng của bạn sẽ được giao vào <Text strong>{formatDate(estimatedDelivery)}</Text>
                    </Text>
                  }
                  type="success"
                  showIcon={false}
                  style={{
                    borderRadius: 10,
                    marginTop: 16,
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.06)',
                    border: `1px solid ${token.colorSuccessBorder}`
                  }}
                />
              </ShippingInfoCard>
            </Col>
            
            <Col xs={24} lg={9}>
              <OrderSummaryCard 
                title={
                  <React.Fragment>
                    <ShoppingCartOutlined />
                    <span>Tóm tắt đơn hàng</span>
                    <Badge count={cartItems.length} style={{ backgroundColor: token.colorPrimary }} />
                  </React.Fragment>
                }
                $colorPrimary={token.colorPrimary}
                $colorPrimaryBg={token.colorPrimaryBg}
              >
                <Table 
                  dataSource={cartItemsData}
                  columns={orderColumns}
                  pagination={false}
                  showHeader={false}
                  rowKey="key"
                />
                
                <Divider style={{ margin: '20px 0' }} />
                
                <OrderTotals>
                  <OrderTotalRow $colorPrimary={token.colorPrimary}>
                    <div className="row-label">
                      <ShoppingCartOutlined />
                      <span>Tạm tính:</span>
                    </div>
                    <Text className="row-value">{formatCurrency(cartTotal)}</Text>
                  </OrderTotalRow>
                  
                  <OrderTotalRow $colorPrimary={token.colorPrimary}>
                    <div className="row-label">
                      <CarOutlined />
                      <span>Phí vận chuyển:</span>
                    </div>
                    <Text className="row-value">{formatCurrency(shippingFee)}</Text>
                  </OrderTotalRow>
                  
                  <Divider style={{ margin: '20px 0' }} dashed />
                  
                  <OrderTotalRow className="order-final-total">
                    <Title level={4}>Tổng cộng:</Title>
                    <Title level={3} className="total-amount">
                      {formatCurrency(cartTotal + shippingFee)}
                    </Title>
                  </OrderTotalRow>
                </OrderTotals>
                
                <CheckoutActions>
                  <PlaceOrderButton 
                    type="primary" 
                    htmlType="submit" 
                    block 
                    size="large"
                    loading={loading}
                    icon={<ArrowRightOutlined />}
                    $colorPrimary={token.colorPrimary}
                    $colorPrimaryActive={token.colorPrimaryActive}
                  >
                    {loading ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
                  </PlaceOrderButton>
                  
                  <SecureCheckoutBadge>
                    <LockOutlined />
                    <Text className="secure-text">Thanh toán an toàn & bảo mật</Text>
                  </SecureCheckoutBadge>
                  
                  <PolicyAlert
                    message="Chính sách mua hàng"
                    description="Bằng cách tiến hành đặt hàng, bạn đồng ý với các điều khoản và điều kiện, chính sách đổi trả của chúng tôi."
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                  />
                </CheckoutActions>
              </OrderSummaryCard>
              
              <SecurityCard>
                <SecurityFeatures>
                  <Space direction="vertical" className="security-list" size={16}>
                    <SecurityItem>
                      <div className="security-icon">
                        <LockOutlined />
                      </div>
                      <Text className="security-content">Thanh toán an toàn 100%</Text>
                    </SecurityItem>
                    <SecurityItem>
                      <div className="security-icon">
                        <RocketOutlined />
                      </div>
                      <Text className="security-content">Giao hàng nhanh chóng</Text>
                    </SecurityItem>
                    <SecurityItem>
                      <div className="security-icon">
                        <CheckCircleOutlined />
                      </div>
                      <Text className="security-content">Đảm bảo chất lượng</Text>
                    </SecurityItem>
                    <SecurityItem>
                      <div className="security-icon">
                        <HeartOutlined />
                      </div>
                      <Text className="security-content">Hỗ trợ đổi trả 7 ngày</Text>
                    </SecurityItem>
                  </Space>
                </SecurityFeatures>
              </SecurityCard>
            </Col>
          </Row>
        </StyledForm>
      </StyledContent>
    </ConfigProvider>
  );
};

export default CheckoutPage;