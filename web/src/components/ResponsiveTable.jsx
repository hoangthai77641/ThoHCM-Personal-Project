// ResponsiveTable.jsx - Enhanced responsive table component for ThoHCM

import React, { useState, useEffect } from 'react';

const ResponsiveTable = ({ 
  data = [], 
  columns = [], 
  title = "Quản lý người dùng",
  searchable = true,
  filterable = true,
  mobileCardView = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter data based on search and filters
  const filteredData = data.filter(item => {
    const matchesSearch = !searchTerm || 
      Object.values(item).some(value => 
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesRole = filterRole === 'all' || item.role === filterRole;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Mobile card view component
  const MobileCard = ({ item, index }) => (
    <div key={index} className="card-responsive">
      <div className="card-responsive-header">
        <h3 className="card-responsive-title">{item.name}</h3>
        <div className="card-responsive-actions">
          <button className="btn small outline">Sửa</button>
          <button className="btn small danger">Xóa</button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gap: '8px' }}>
        {columns.map(col => (
          <div key={col.key} style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 0',
            borderBottom: '1px solid var(--border)'
          }}>
            <span style={{ 
              fontWeight: '500', 
              color: 'var(--text-secondary)',
              fontSize: '14px'
            }}>
              {col.label}:
            </span>
            <span style={{ color: 'var(--text)' }}>
              {col.render ? col.render(item[col.key], item) : item[col.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // Desktop table view component
  const DesktopTable = () => (
    <div className="table-responsive">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th className="desktop-only">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              {columns.map(col => (
                <td key={col.key} data-label={col.label}>
                  {col.render ? col.render(item[col.key], item) : item[col.key]}
                </td>
              ))}
              <td className="desktop-only">
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn small outline">Sửa</button>
                  <button className="btn small danger">Xóa</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="users-page">
      {/* Header */}
      <div className="users-header">
        <h1 className="text-responsive-2xl">{title}</h1>
        <div className="users-stats">
          <div className="stat-card">
            <span className="stat-number">{filteredData.length}</span>
            <span className="stat-label">Tổng số</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {filteredData.filter(item => item.status === 'active').length}
            </span>
            <span className="stat-label">Hoạt động</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="users-toolbar">
        <div className="search-filters">
          {searchable && (
            <div className="search-box">
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, SĐT, địa chỉ..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          
          {filterable && (
            <div className="filter-group">
              <select 
                className="filter-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">Tất cả vai trò</option>
                <option value="customer">Khách hàng</option>
                <option value="worker">Thợ</option>
                <option value="admin">Admin</option>
              </select>
              
              <select 
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="pending">Chờ duyệt</option>
                <option value="suspended">Tạm khóa</option>
              </select>
            </div>
          )}
        </div>
        
        <button className="btn primary">
          + Thêm mới
        </button>
      </div>

      {/* Content */}
      {filteredData.length === 0 ? (
        <div className="empty-state">
          <p>Không có dữ liệu để hiển thị</p>
        </div>
      ) : (
        <>
          {/* Mobile view */}
          {isMobile && mobileCardView ? (
            <div className="mobile-only">
              {filteredData.map((item, index) => (
                <MobileCard key={index} item={item} index={index} />
              ))}
            </div>
          ) : (
            /* Desktop view */
            <div className={isMobile ? "mobile-only" : "desktop-only"}>
              <DesktopTable />
            </div>
          )}
          
          {/* Always show table on desktop */}
          {!isMobile && <DesktopTable />}
        </>
      )}

      {/* Pagination (if needed) */}
      <div className="pagination" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '24px',
        gap: '8px' 
      }}>
        <button className="btn outline small">‹ Trước</button>
        <button className="btn primary small">1</button>
        <button className="btn outline small">2</button>
        <button className="btn outline small">3</button>
        <button className="btn outline small">Sau ›</button>
      </div>
    </div>
  );
};

export default ResponsiveTable;

// Usage example:
/*
const userData = [
  {
    name: 'Nguyễn Văn A',
    phone: '0123456789',
    role: 'customer',
    status: 'active',
    cccd: '123456789',
    createdAt: '2024-01-01'
  },
  // ... more data
];

const userColumns = [
  { key: 'name', label: 'Tên' },
  { key: 'phone', label: 'Số điện thoại' },
  { 
    key: 'role', 
    label: 'Vai trò',
    render: (value) => (
      <span className={`status-badge ${value}`}>
        {value === 'customer' ? 'Khách hàng' : 
         value === 'worker' ? 'Thợ' : 'Admin'}
      </span>
    )
  },
  { 
    key: 'status', 
    label: 'Trạng thái',
    render: (value) => (
      <span className={`status-badge ${value}`}>
        {value === 'active' ? 'Hoạt động' : 
         value === 'pending' ? 'Chờ duyệt' : 'Tạm khóa'}
      </span>
    )
  }
];

<ResponsiveTable 
  data={userData}
  columns={userColumns}
  title="Quản lý người dùng"
  searchable={true}
  filterable={true}
  mobileCardView={true}
/>
*/