import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import axiosClient from '../../utils/axiosClient';
import { getApiOrigin } from '../../config/apiConfig';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  TagOutlined,
  DollarOutlined,
  ShopOutlined,
  InboxOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  CloseOutlined,
  SaveOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { 
  Table,
  Button,
  Input,
  Select,
  Form,
  InputNumber,
  Upload,
  Typography,
  Space,
  Divider,
  Card,
  Tag,
  Modal,
  message,
  Badge,
  Spin,
  Image
} from 'antd';
import productService from '../../services/productService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

// Keyframes 
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Styled Components
const ProductManagementContainer = styled.div`
  width: 100%;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.04);
  animation: ${fadeIn} 0.5s ease;
  overflow: hidden;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  .ant-input-affix-wrapper {
    width: 300px;
  @media (max-width: 768px) {
    width: 100%;
    }
  }
  
  .ant-select {
    min-width: 180px;
    @media (max-width: 768px) {
    width: 100%;
    }
  }

  @media (max-width: 768px) {
    width: 100%;
  flex-direction: column;
  }
`;

const StyledCard = styled(Card)`
  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
  }
  
  .ant-card-body {
    padding: 24px;
  }
  
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
      border-radius: 8px;
        overflow: hidden;
`;

const ProductStatus = styled(Tag)`
  padding: 4px 8px;
  border-radius: 4px;
    font-weight: 500;
    font-size: 12px;
`;

const EmptyStateWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  padding: 60px 0;
  text-align: center;
  background: #f9fafc;
      border-radius: 8px;
  border: 1px dashed #d9d9d9;
  margin: 20px 0;
  
  .anticon {
    font-size: 48px;
    color: #1890ff;
    margin-bottom: 16px;
  }
`;

const ProductManagement = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Danh sách danh mục
  const PRODUCT_CATEGORIES = ['Food', 'Toy', 'Medicine', 'Accessory', 'Clothing', 'Other'];

  // Lấy URL đầy đủ của hình ảnh
  const getImageUrl = (photoPath) => {
    if (!photoPath) return 'https://via.placeholder.com/150x150?text=No+Image';
    
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    
    if (photoPath.startsWith('/')) {
      return `${getApiOrigin()}${photoPath}`;
    }
    
    return `${getApiOrigin()}/uploads/products/${photoPath}`;
  };

  // Tải lên hình ảnh sản phẩm
  const uploadProductImage = async (productId, imageFile) => {
    try {
      setUploading(true);
      
      const imageData = new FormData();
      imageData.append('file', imageFile);
      
      try {
        const uploadResponse = await axiosClient.post(
          `/api/Products/${productId}/upload-image`, 
          imageData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          }
        );
        return uploadResponse.data;
      } catch (firstErr) {
          const uploadResponse = await axiosClient.post(
            `/Products/${productId}/upload-image`, 
            imageData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              }
            }
          );
        return uploadResponse.data;
      }
    } catch (err) {
      console.error('Lỗi khi tải lên ảnh:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // Tải dữ liệu sản phẩm
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      let response;
      try {
        response = await axiosClient.get('/Products');
      } catch (apiError) {
          response = await axiosClient.get('/api/Products');
      }
      
        setProducts(response.data);
        setError(null);
      message.success('Đã tải danh sách sản phẩm thành công');
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thêm sản phẩm mới
  const handleAdd = () => {
    setCurrentProduct(null);
    setImageUrl('');
    setImageFile(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Xử lý chỉnh sửa sản phẩm
  const handleEdit = (product) => {
    setCurrentProduct(product);
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand || '',
      stockQuantity: product.stockQuantity
    });
    setImageUrl(product.photo ? getImageUrl(product.photo) : '');
    setImageFile(null);
    setIsModalVisible(true);
  };

  // Xử lý xóa sản phẩm
  const handleDelete = (product) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: `Sản phẩm "${product.name}" sẽ bị xóa và không hiển thị trong hệ thống. Sản phẩm trong đơn hàng chưa hoàn thành sẽ không thể xóa được.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          // Hiển thị thông báo đang xóa
          message.loading({ content: 'Đang xử lý...', key: 'deleteProduct', duration: 0 });
          
          console.log(`Xóa sản phẩm: ${product.productId} - ${product.name}`);
          
          // Thử xóa bằng fetch API thay vì sử dụng productService
          const response = await fetch(`${getApiOrigin()}/api/Products/${product.productId}`, {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Lỗi xóa sản phẩm (HTTP ${response.status})`);
          }
          
          // Cập nhật UI khi xóa thành công
          message.success({ content: 'Xóa sản phẩm thành công', key: 'deleteProduct', duration: 2 });
          
          // Cập nhật danh sách sản phẩm - chỉ lọc ra những sản phẩm còn hoạt động
          setProducts(prevProducts => prevProducts.filter(p => p.productId !== product.productId));
        } catch (err) {
          console.error('Lỗi xóa sản phẩm:', err);
          message.error({ 
            content: `Lỗi: ${err.message || 'Không thể xóa sản phẩm'}`, 
            key: 'deleteProduct' 
          });
        }
      }
    });
  };

  // Xử lý lưu sản phẩm
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const productData = {
        name: values.name,
        description: values.description,
        price: values.price,
        category: values.category,
        brand: values.brand || '',
        stockQuantity: values.stockQuantity,
        photo: currentProduct?.photo || ''
      };
      
      if (currentProduct) {
        // Cập nhật sản phẩm
        try {
          await axiosClient.put(`/api/Products/${currentProduct.productId}`, productData);
          
          if (imageFile) {
            await uploadProductImage(currentProduct.productId, imageFile);
          }
          
          message.success('Cập nhật sản phẩm thành công');
        } catch (err) {
          await axiosClient.put(`/Products/${currentProduct.productId}`, productData);
          
          if (imageFile) {
            await uploadProductImage(currentProduct.productId, imageFile);
          }
          
          message.success('Cập nhật sản phẩm thành công');
        }
      } else {
        // Tạo sản phẩm mới
        try {
          const response = await axiosClient.post('/api/Products', productData);
          
          if (imageFile && response.data.productId) {
            await uploadProductImage(response.data.productId, imageFile);
          }
          
          message.success('Thêm sản phẩm mới thành công');
    } catch (err) {
          const response = await axiosClient.post('/Products', productData);
          
          if (imageFile && response.data.productId) {
            await uploadProductImage(response.data.productId, imageFile);
          }
          
          message.success('Thêm sản phẩm mới thành công');
        }
      }
      
      setIsModalVisible(false);
          fetchProducts();
    } catch (validationError) {
      console.error('Lỗi kiểm tra form:', validationError);
        } finally {
          setLoading(false);
    }
  };

  // Props upload hình ảnh
  const uploadProps = {
    beforeUpload: (file) => {
      // Kiểm tra file
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Bạn chỉ có thể tải lên file hình ảnh!');
        return false;
      }
      
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Kích thước hình ảnh không được vượt quá 5MB!');
        return false;
      }
      
      // Tạo URL xem trước
      setImageUrl(URL.createObjectURL(file));
      setImageFile(file);
      return false; // Ngăn upload tự động
    },
    showUploadList: false,
  };

  // Lọc sản phẩm
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === '' || product.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Thêm một hàm test xóa trực tiếp
  const testDirectDelete = async (productId) => {
    try {
      console.log(`Thử xóa trực tiếp sản phẩm ID: ${productId}`);
      
      // Sử dụng fetch API trực tiếp
      const response = await fetch(`${getApiOrigin()}/api/Products/${productId}`, {
        method: 'DELETE'
      });
      
      console.log('Kết quả xóa:', response.status, response.ok);
      
      if (response.ok) {
        message.success('Xóa thành công!');
        // Cập nhật UI
        setProducts(prev => prev.filter(p => p.productId !== productId));
      } else {
        const errorText = await response.text();
        message.error(`Lỗi: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      message.error('Không thể xóa sản phẩm');
    }
  };

  // Định nghĩa cột cho bảng
  const columns = [
    {
      title: 'ID',
      dataIndex: 'productId',
      key: 'productId',
      width: 80,
      sorter: (a, b) => a.productId - b.productId
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'photo',
      key: 'photo',
      width: 120,
      render: (photo) => (
        <Image
          src={getImageUrl(photo)}
          alt="Product"
          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
          fallback="https://via.placeholder.com/80x80?text=No+Image"
          preview={{ src: getImageUrl(photo) }}
        />
      )
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.brand && (
            <div>
              <Text type="secondary">{record.brand}</Text>
            </div>
          )}
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        let color;
        switch (category?.toLowerCase()) {
          case 'food': color = 'blue'; break;
          case 'toy': color = 'gold'; break;
          case 'medicine': color = 'red'; break;
          case 'accessory': color = 'green'; break;
          case 'clothing': color = 'purple'; break;
          default: color = 'default';
        }
        return <Tag color={color}>{category}</Tag>;
      },
      filters: PRODUCT_CATEGORIES.map(cat => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.category === value
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <Text style={{ color: '#f50', fontWeight: 'bold' }}>
          {new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
          }).format(price)}
        </Text>
      ),
      sorter: (a, b) => a.price - b.price
    },
    {
      title: 'Số lượng',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      render: (quantity) => {
        let status, text;
        if (quantity <= 0) {
          status = 'error';
          text = 'Hết hàng';
        } else if (quantity < 10) {
          status = 'warning';
          text = `Còn ${quantity}`;
        } else {
          status = 'success';
          text = quantity;
        }
        return <Badge status={status} text={text} />;
      },
      sorter: (a, b) => a.stockQuantity - b.stockQuantity
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space style={{ display: 'flex', visibility: 'visible', zIndex: 1000 }}>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            type="primary"
            ghost
            style={{ visibility: 'visible', zIndex: 1001 }}
          >
            Sửa
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record)}
            danger
            style={{ visibility: 'visible', zIndex: 1001 }}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  const EmptyState = () => (
    <EmptyStateWrapper>
      <InboxOutlined style={{ fontSize: '54px', color: '#bfbfbf', marginBottom: '16px' }} />
      <Title level={4}>Không tìm thấy sản phẩm nào</Title>
      <Text type="secondary" style={{ marginBottom: '20px' }}>
        {searchTerm || filterCategory 
          ? 'Không tìm thấy sản phẩm nào khớp với bộ lọc của bạn. Vui lòng thử các tiêu chí tìm kiếm khác.'
          : 'Hiện chưa có sản phẩm nào trong hệ thống. Hãy thêm sản phẩm mới để bắt đầu.'}
      </Text>
      {(searchTerm || filterCategory) ? (
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={() => {setSearchTerm(''); setFilterCategory('');}}
        >
          Xóa bộ lọc
        </Button>
      ) : (
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Thêm sản phẩm mới
        </Button>
      )}
    </EmptyStateWrapper>
  );

  return (
    <ProductManagementContainer>
      <HeaderSection>
        <Title level={3}>
          <ShopOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          Quản lý sản phẩm
        </Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
            size="large"
          >
            Thêm sản phẩm
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchProducts}
            size="large"
          >
            Làm mới
          </Button>
        </Space>
      </HeaderSection>
      
      {error && (
        <StyledCard style={{ borderLeft: '4px solid #ff4d4f', marginBottom: '24px' }}>
          <Space>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
            <Text type="danger">{error}</Text>
          </Space>
        </StyledCard>
      )}

      <StyledCard bordered={false}>
        <FilterSection>
          <Input 
              placeholder="Tìm kiếm theo tên, mô tả hoặc thương hiệu"
            prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            size="large"
          />
          <Select
            placeholder="Lọc theo danh mục"
              value={filterCategory} 
            onChange={setFilterCategory}
            style={{ minWidth: '200px' }}
            allowClear
            size="large"
            >
              {PRODUCT_CATEGORIES.map((category) => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </FilterSection>

        {loading && products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
            <div style={{ marginTop: '16px' }}>Đang tải dữ liệu sản phẩm...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="productId"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} sản phẩm` 
            }}
            loading={loading}
            scroll={{ x: 'max-content' }}
            size="middle"
          />
        )}
      </StyledCard>

      <Modal
        title={
          <Space>
            {currentProduct ? (
              <><EditOutlined style={{ color: '#1890ff' }} /> Chỉnh sửa sản phẩm</>
            ) : (
              <><PlusOutlined style={{ color: '#52c41a' }} /> Thêm sản phẩm mới</>
            )}
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={loading || uploading}
            onClick={handleSave}
            icon={<SaveOutlined />}
          >
            Lưu
          </Button>,
        ]}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          name="productForm"
          initialValues={{
            name: '',
            description: '',
            price: 0,
            category: undefined,
            brand: '',
            stockQuantity: 0
          }}
        >
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
            <div style={{ width: '180px', textAlign: 'center' }}>
              <div style={{ marginBottom: '16px' }}>
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px' }}
                    fallback="https://via.placeholder.com/180x180?text=No+Image"
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '180px', 
                    background: '#f5f5f5', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '4px',
                    border: '1px dashed #d9d9d9' 
                  }}>
                    <PictureOutlined style={{ fontSize: '32px', color: '#bfbfbf' }} />
              </div>
                )}
              </div>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
              </Upload>
            </div>
            
            <div style={{ flex: 1 }}>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
              >
                <Input prefix={<TagOutlined />} placeholder="Nhập tên sản phẩm" />
              </Form.Item>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <Form.Item
                  name="category"
                  label="Danh mục"
                  rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                  style={{ flex: 1 }}
                >
                  <Select placeholder="Chọn danh mục">
                  {PRODUCT_CATEGORIES.map((category) => (
                      <Option key={category} value={category}>
                        {category}
                      </Option>
                  ))}
                  </Select>
                </Form.Item>
              
                <Form.Item
                  name="brand"
                  label="Thương hiệu"
                  style={{ flex: 1 }}
                >
                  <Input placeholder="Nhập thương hiệu (không bắt buộc)" />
                </Form.Item>
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <Form.Item
                  name="price"
                  label="Giá"
                  rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                  style={{ flex: 1 }}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    min={0}
                    placeholder="Nhập giá sản phẩm"
                    prefix={<DollarOutlined />}
                  />
                </Form.Item>
                
                <Form.Item
                  name="stockQuantity"
                  label="Số lượng"
                  rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                  style={{ flex: 1 }}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="Nhập số lượng trong kho"
                    prefix={<InboxOutlined />}
                  />
                </Form.Item>
              </div>
                </div>
              </div>
              
          <Form.Item
                  name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả sản phẩm!' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập mô tả chi tiết sản phẩm" 
              prefix={<FileTextOutlined />} 
            />
          </Form.Item>
        </Form>
      </Modal>
    </ProductManagementContainer>
  );
};

export default ProductManagement;