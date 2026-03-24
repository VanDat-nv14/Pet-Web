import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import {
  Row,
  Col,
  Typography,
  Input,
  Select,
  Button,
  Card,
  Breadcrumb,
  Spin,
  Alert,
  Tag,
  Slider,
  Divider,
  Pagination,
  Empty,
  message,
  Tooltip,
  Space,
  Badge,
  Statistic,
  Layout,
  theme
} from 'antd';
import {
  SearchOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  HomeOutlined,
  ShoppingOutlined,
  ReloadOutlined,
  TagsOutlined,
  ShopOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  AppstoreOutlined,
  GiftOutlined
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import ProductCardComponent from '../components/ProductCard';
import productService from '../services/productService';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Content } = Layout;

// Styled components for better UI without CSS file
const StyledContent = styled(Content)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 60px;
  background: #fff;

  @media (max-width: 768px) {
    padding: 16px 16px 60px;
  }
`;

const StyledBreadcrumb = styled(Breadcrumb)`
  margin-bottom: 24px;
  font-size: 15px;
  
  .ant-breadcrumb-link {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;

  .page-title {
    color: #1890ff;
    margin-bottom: 8px;
    font-weight: 700;
    font-size: 32px;

    @media (max-width: 768px) {
      font-size: 26px;
    }
  }

  .page-description {
    font-size: 16px;
    color: rgba(0, 0, 0, 0.65);
    max-width: 700px;
    margin: 0 auto;
  }

  .title-divider {
    margin: 24px auto;
    width: 60%;
    min-width: 200px;
  }
`;

const SearchSection = styled.div`
  margin-bottom: 24px;
  background: linear-gradient(to right, #e6f7ff, #f0f5ff);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  .ant-input-search {
    .ant-input {
      height: 48px;
      border-radius: 8px 0 0 8px;
    }
    
    .ant-input-group-addon {
      .ant-btn {
        height: 48px;
        border-radius: 0 8px 8px 0;
      }
    }
  }
`;

const FilterTags = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;

  .filter-label {
    margin-right: 12px;
  }

  .ant-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    font-size: 14px;
    margin: 0;
  }
`;

const FilterCard = styled(Card)`
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);

  .ant-card-head {
    background-color: #f0f5ff;
    border-bottom: 1px solid #e6f7ff;
  }

  .filter-section {
    margin-bottom: 24px;
  }

  .ant-slider {
    margin: 16px 8px 40px;
  }

  .ant-select {
    .ant-select-selector {
      border-radius: 6px;
      height: 40px;
      display: flex;
      align-items: center;
    }
  }
`;

const ProductGrid = styled(Row)`
  margin-bottom: 32px;
`;

const ProductCountBadge = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 12px 16px;
  background: #f9f9f9;
  border-radius: 8px;

  .ant-badge-count {
    padding: 0 8px;
    height: 24px;
    line-height: 24px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: bold;
    margin-right: 12px;
  }
`;

const BackToTopButton = styled(Button)`
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 48px;
  height: 48px;
  z-index: 10;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.15);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  
  transition: all 0.3s ease;
`;

const StyledEmpty = styled(Empty)`
  margin: 40px 0;
  padding: 32px;
  background-color: #fafafa;
  border-radius: 8px;
`;

const StatisticsCard = styled(Card)`
  border-radius: 12px;
  background: linear-gradient(135deg, #f5f5f5, #fafafa);
  border: none;
  
  .ant-statistic {
    .ant-statistic-title {
      color: rgba(0, 0, 0, 0.65);
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .ant-statistic-content {
      color: #1890ff;
      font-weight: 600;
    }
  }
`;

const PaginationContainer = styled.div`
  margin-top: 40px;
  display: flex;
  justify-content: center;
  
  .ant-pagination {
    .ant-pagination-item-active {
      background-color: #1890ff;
      border-color: #1890ff;
      a {
        color: white;
      }
    }
    
    .ant-pagination-item:hover {
      border-color: #1890ff;
      a {
        color: #1890ff;
      }
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 24px;
  
  .ant-spin {
    .ant-spin-dot-item {
      background-color: #1890ff;
    }
  }
  
  .loading-text {
    color: rgba(0, 0, 0, 0.65);
    margin-top: 24px;
  }
`;

const ErrorContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  
  .ant-alert {
    border-radius: 8px;
  }
`;

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const { token } = theme.useToken();

  // Sử dụng CartContext
  const { addToCart } = useContext(CartContext);

  // State cho danh sách sản phẩm
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho filter và search
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: 0,
    maxPrice: 5000000,
    searchText: ''
  });

  // State cho phân trang
  const [page, setPage] = useState(1);
  const productsPerPage = 12;

  // State cho hiển thị filter trên mobile
  const [showFilters, setShowFilters] = useState(!isMobile);

  // Lấy danh sách sản phẩm và danh mục
  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        setLoading(true);

        // Fetch products and categories in parallel
        const [productsData, categoriesData] = await Promise.all([
          productService.getAllProducts(),
          productService.getProductCategories()
        ]);

        setProducts(productsData);
        setFilteredProducts(productsData);
        setCategories(categoriesData);

        setError(null);
      } catch (err) {
        setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.');
        console.error('Error fetching products data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, []);

  // Filter sản phẩm khi filters thay đổi
  useEffect(() => {
    const applyFilters = () => {
      let result = [...products];

      // Apply category filter
      if (filters.category) {
        result = result.filter(product => product.category === filters.category);
      }

      // Apply brand filter
      if (filters.brand) {
        result = result.filter(product => product.brand === filters.brand);
      }

      // Apply price range filter
      result = result.filter(
        product => product.price >= filters.minPrice && product.price <= filters.maxPrice
      );

      // Apply search text
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        result = result.filter(
          product =>
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower)
        );
      }

      setFilteredProducts(result);
      // Quay về trang 1 khi filter thay đổi
      setPage(1);
    };

    applyFilters();
  }, [filters, products]);

  // Lấy danh sách brands từ sản phẩm
  const brands = [...new Set(products.map(product => product.brand))].filter(Boolean);

  // Xử lý thay đổi filter
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý thay đổi khoảng giá
  const handlePriceChange = (value) => {
    setFilters(prev => ({
      ...prev,
      minPrice: value[0],
      maxPrice: value[1]
    }));
  };

  // Xử lý search
  const handleSearch = (value) => {
    setFilters(prev => ({
      ...prev,
      searchText: value
    }));
  };

  // Reset tất cả filters
  const resetFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: 0,
      maxPrice: 5000000,
      searchText: ''
    });
    message.success({
      content: 'Đã xóa tất cả bộ lọc',
      icon: <ReloadOutlined style={{ color: token.colorPrimary }} />
    });
  };

  // Xử lý chuyển trang
  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = (product) => {
    addToCart(product, 1);
    message.success({
      content: `Đã thêm ${product.name} vào giỏ hàng`,
      icon: <ShoppingOutlined style={{ color: token.colorPrimary }} />,
    });
  };

  // Hàm xử lý mua ngay
  const handleBuyNow = (product) => {
    addToCart(product, 1);
    navigate('/checkout');
  };

  // Tính chỉ số sản phẩm bắt đầu và kết thúc cho trang hiện tại
  const startIndex = (page - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;

  // Lấy sản phẩm cho trang hiện tại
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Tính tổng số trang
  const totalProducts = filteredProducts.length;

  // Toggle hiển thị filter trên mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Định dạng giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Xóa một filter cụ thể
  const removeFilter = (filterName) => {
    if (filterName === 'price') {
      setFilters(prev => ({
        ...prev,
        minPrice: 0,
        maxPrice: 5000000
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [filterName]: ''
      }));
    }
  };

  // Component ScrollToTop
  const backToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Hiển thị thông báo loading
  if (loading) {
    return (
      <StyledContent>
        <LoadingContainer>
          <Spin size="large" />
          <Title level={3} className="loading-text">
            Đang tải sản phẩm...
          </Title>
        </LoadingContainer>
      </StyledContent>
    );
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <StyledContent>
        <ErrorContainer>
          <Alert
            message="Lỗi tải dữ liệu"
            description={error}
            type="error"
            showIcon
            action={
              <Button type="primary" onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            }
          />
        </ErrorContainer>
      </StyledContent>
    );
  }

  const filtersActive = filters.category || filters.brand || filters.searchText || filters.minPrice > 0 || filters.maxPrice < 5000000;

  return (
    <StyledContent>
      {/* Breadcrumbs */}
      <StyledBreadcrumb>
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> Trang chủ
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <ShoppingOutlined /> Sản phẩm
        </Breadcrumb.Item>
        {filters.category && (
          <Breadcrumb.Item>
            <TagsOutlined /> {filters.category}
          </Breadcrumb.Item>
        )}
      </StyledBreadcrumb>

      {/* Tiêu đề trang */}
      <PageHeader>
        <Title level={1} className="page-title">
          <GiftOutlined style={{ marginRight: 12 }} />
          Sản phẩm cho thú cưng
        </Title>
        <Paragraph className="page-description">
          Khám phá các sản phẩm chất lượng cao dành cho thú cưng yêu quý của bạn
        </Paragraph>
        <Divider className="title-divider">
          <AppstoreOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
        </Divider>
      </PageHeader>

      {/* Form tìm kiếm */}
      <SearchSection>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16} lg={18}>
            <Search
              placeholder="Tìm kiếm sản phẩm..."
              allowClear
              enterButton={<><SearchOutlined /> Tìm kiếm</>}
              size="large"
              onSearch={handleSearch}
              defaultValue={filters.searchText}
            />
          </Col>
          <Col xs={24} md={8} lg={6} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              {isMobile && (
                <Button
                  type={showFilters ? "primary" : "default"}
                  icon={<FilterOutlined />}
                  onClick={toggleFilters}
                  size="large"
                  style={{ height: 48, borderRadius: 8 }}
                >
                  {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
                </Button>
              )}
              <Button
                type="default"
                icon={<ReloadOutlined />}
                onClick={resetFilters}
                size="large"
                style={{ height: 48, borderRadius: 8 }}
                disabled={!filtersActive}
              >
                Xóa bộ lọc
              </Button>
            </Space>
          </Col>
        </Row>
      </SearchSection>

      {/* Active filters */}
      {filtersActive && (
        <FilterTags>
          <Text strong className="filter-label">Bộ lọc đang áp dụng:</Text>
          <div className="filter-tags">
            {filters.category && (
              <Tag color="blue" closable onClose={() => removeFilter('category')}>
                <TagsOutlined /> Danh mục: {filters.category}
              </Tag>
            )}

            {filters.brand && (
              <Tag color="green" closable onClose={() => removeFilter('brand')}>
                <ShopOutlined /> Thương hiệu: {filters.brand}
              </Tag>
            )}

            {filters.searchText && (
              <Tag color="magenta" closable onClose={() => removeFilter('searchText')}>
                <SearchOutlined /> Tìm kiếm: {filters.searchText}
              </Tag>
            )}

            {(filters.minPrice > 0 || filters.maxPrice < 5000000) && (
              <Tag color="orange" closable onClose={() => removeFilter('price')}>
                <DollarOutlined /> Giá: {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
              </Tag>
            )}
          </div>
        </FilterTags>
      )}

      {/* Filter and Product section */}
      <Row gutter={[24, 24]}>
        {/* Filter sidebar */}
        <Col xs={showFilters ? 24 : 0} md={showFilters ? 8 : 0} lg={showFilters ? 6 : 0}>
          <FilterCard 
            title={<><FilterOutlined /> Lọc sản phẩm</>} 
            extra={isMobile && <Button type="text" icon={<CloseCircleOutlined />} onClick={toggleFilters} />}
          >
            <div className="filter-section">
              <Title level={5}>Danh mục</Title>
              <Select
                placeholder="Chọn danh mục"
                style={{ width: '100%' }}
                value={filters.category || undefined}
                onChange={(value) => handleFilterChange('category', value)}
                allowClear
                suffixIcon={<TagsOutlined />}
              >
                {categories.map((category) => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="filter-section">
              <Title level={5}>Thương hiệu</Title>
              <Select
                placeholder="Chọn thương hiệu"
                style={{ width: '100%' }}
                value={filters.brand || undefined}
                onChange={(value) => handleFilterChange('brand', value)}
                allowClear
                suffixIcon={<ShopOutlined />}
              >
                {brands.map((brand) => (
                  <Option key={brand} value={brand}>
                    {brand}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="filter-section">
              <Title level={5}>
                Khoảng giá: {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
              </Title>
              <Slider
                range
                min={0}
                max={5000000}
                step={100000}
                value={[filters.minPrice, filters.maxPrice]}
                onChange={handlePriceChange}
                tipFormatter={value => formatPrice(value)}
                tooltip={{
                  open: true,
                  placement: 'bottom'
                }}
              />
            </div>

            <div className="filter-actions">
              <Button
                type="primary"
                block
                icon={<ReloadOutlined />}
                onClick={resetFilters}
                disabled={!filtersActive}
                style={{ height: 40, borderRadius: 6 }}
              >
                Xóa tất cả bộ lọc
              </Button>
            </div>
          </FilterCard>

          {!isMobile && (
            <StatisticsCard>
              <Statistic
                title="Tổng số sản phẩm"
                value={products.length}
                prefix={<AppstoreOutlined />}
              />
              <Divider style={{ margin: '16px 0' }} />
              <Statistic
                title="Đang hiển thị"
                value={filteredProducts.length}
                suffix={`/${products.length}`}
                prefix={<ShoppingOutlined />}
              />
            </StatisticsCard>
          )}
        </Col>

        {/* Product listing */}
        <Col xs={24} md={showFilters ? 16 : 24} lg={showFilters ? 18 : 24}>
          {/* Product count display */}
          <ProductCountBadge>
            <Badge
              count={filteredProducts.length}
              overflowCount={9999}
              showZero
              style={{
                backgroundColor: filteredProducts.length > 0 ? '#52c41a' : '#f5222d'
              }}
            />
            <Text strong style={{ fontSize: '16px' }}>
              {filteredProducts.length > 0 ? `Hiển thị ${filteredProducts.length} sản phẩm` : 'Không tìm thấy sản phẩm nào phù hợp'}
            </Text>
          </ProductCountBadge>

          {/* Product cards */}
          {filteredProducts.length > 0 ? (
            <>
              <ProductGrid gutter={[16, 24]}>
                {currentProducts.map((product) => (
                  <Col key={product.productId} xs={24} sm={12} md={12} lg={8} xl={8}>
                    <ProductCardComponent
                      product={product}
                      onAddToCart={() => handleAddToCart(product)}
                      onBuyNow={() => handleBuyNow(product)}
                    />
                  </Col>
                ))}
              </ProductGrid>

              {/* Pagination */}
              {totalProducts > productsPerPage && (
                <PaginationContainer>
                  <Pagination
                    current={page}
                    total={totalProducts}
                    pageSize={productsPerPage}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total) => `Tổng cộng ${total} sản phẩm`}
                  />
                </PaginationContainer>
              )}
            </>
          ) : (
            <StyledEmpty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Text strong style={{ fontSize: '16px' }}>Không tìm thấy sản phẩm nào phù hợp</Text>
                  <Text>Hãy thử xóa một số điều kiện lọc để xem nhiều sản phẩm hơn</Text>
                  <Button 
                    type="primary" 
                    icon={<ReloadOutlined />} 
                    onClick={resetFilters}
                    style={{ borderRadius: 6 }}
                  >
                    Xóa tất cả bộ lọc
                  </Button>
                </Space>
              }
            />
          )}
        </Col>
      </Row>

      {/* Back to top button */}
      <Tooltip title="Về đầu trang">
        <BackToTopButton
          type="primary"
          shape="circle"
          icon={<ArrowUpOutlined />}
          size="large"
          onClick={backToTop}
        />
      </Tooltip>
    </StyledContent>
  );
};

export default ProductsPage;