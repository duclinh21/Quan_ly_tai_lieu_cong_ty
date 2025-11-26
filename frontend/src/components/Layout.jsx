import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout as AntLayout, Menu, Avatar, Dropdown, Space } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  FolderOutlined,
  TeamOutlined,
  UserOutlined,
  HistoryOutlined,
  LogoutOutlined,
  UploadOutlined
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const getMenuItems = (userRole) => {
  const allItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    },
    {
      key: '/documents',
      icon: <FileTextOutlined />,
      label: 'Tài liệu'
    },
    {
      key: '/documents/upload',
      icon: <UploadOutlined />,
      label: 'Tải lên tài liệu'
    },
    {
      key: '/categories',
      icon: <FolderOutlined />,
      label: 'Danh mục'
    },
    {
      key: '/departments',
      icon: <TeamOutlined />,
      label: 'Phòng ban'
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Người dùng'
    },
    {
      key: '/audit-logs',
      icon: <HistoryOutlined />,
      label: 'Nhật ký kiểm toán'
    }
  ]

  // Chỉ admin mới thấy Users, Categories, Departments, Audit Logs
  if (userRole === 'admin') {
    return allItems
  }

  // User thường chỉ thấy Dashboard, Documents, Upload
  return allItems.filter(item => 
    ['/dashboard', '/documents', '/documents/upload'].includes(item.key)
  )
}

const { Header, Sider, Content } = AntLayout

const Layout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const menuItems = getMenuItems(user?.role?.name)

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      icon: <UserOutlined />
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => {
        logout()
        navigate('/login')
      }
    }
  ]

  return (
    <AntLayout className="min-h-screen">
      <Sider
        theme="dark"
        width={260}
        className="fixed left-0 top-0 bottom-0 shadow-lg"
        style={{
          background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
          zIndex: 100
        }}
      >
        <div className="h-16 flex items-center justify-center text-white text-xl font-bold border-b border-blue-700 bg-blue-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">D</span>
            </div>
            <span>DMS</span>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="mt-4"
          style={{
            background: 'transparent',
            border: 'none'
          }}
        />
      </Sider>
      <AntLayout className="ml-[260px]">
        <Header className="bg-white shadow-md flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="text-lg font-semibold text-gray-800">
            Document Management System
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space className="cursor-pointer hover:bg-gray-100 px-3 py-1 rounded-lg transition-all">
              <Avatar 
                style={{ 
                  backgroundColor: '#667eea',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                }} 
                icon={<UserOutlined />} 
              />
              <span className="font-medium text-gray-700">{user?.fullName || user?.username}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {user?.role?.name || 'user'}
              </span>
            </Space>
          </Dropdown>
        </Header>
        <Content className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen" style={{ position: 'relative', zIndex: 1 }}>
          <div className="fade-in" style={{ minHeight: '100%' }}>
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout

