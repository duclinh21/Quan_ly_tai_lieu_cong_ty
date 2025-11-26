import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Space } from 'antd'
import {
  FileTextOutlined,
  FolderOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const [stats, setStats] = useState({
    documents: 0,
    categories: 0,
    departments: 0,
    users: 0
  })
  const [recentDocuments, setRecentDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [docsRes, catsRes, depsRes, usersRes] = await Promise.all([
        axios.get('/api/documents?limit=5'),
        axios.get('/api/categories'),
        axios.get('/api/departments'),
        axios.get('/api/users?limit=1')
      ])

      setStats({
        documents: docsRes.data.pagination?.total || 0,
        categories: catsRes.data.data?.length || 0,
        departments: depsRes.data.data?.length || 0,
        users: usersRes.data.pagination?.total || 0
      })

      setRecentDocuments(docsRes.data.data || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a onClick={() => navigate(`/documents/${record.id}`)}>{text}</a>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => category?.name || '-'
    },
    {
      title: 'Người tạo',
      dataIndex: 'owner',
      key: 'owner',
      render: (owner) => owner?.fullName || owner?.username
    },
    {
      title: 'Phiên bản',
      dataIndex: 'version',
      key: 'version'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    }
  ]

    return (
        <div className="fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
                <p className="text-gray-600">Tổng quan hệ thống quản lý tài liệu</p>
            </div>

            <Row gutter={[20, 20]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card className="card-hover border-0 shadow-md rounded-xl" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <Statistic
                            title={<span className="text-white/90">Tài liệu</span>}
                            value={stats.documents}
                            prefix={<FileTextOutlined className="text-white" />}
                            valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="card-hover border-0 shadow-md rounded-xl" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        <Statistic
                            title={<span className="text-white/90">Danh mục</span>}
                            value={stats.categories}
                            prefix={<FolderOutlined className="text-white" />}
                            valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="card-hover border-0 shadow-md rounded-xl" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        <Statistic
                            title={<span className="text-white/90">Phòng ban</span>}
                            value={stats.departments}
                            prefix={<TeamOutlined className="text-white" />}
                            valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="card-hover border-0 shadow-md rounded-xl" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                        <Statistic
                            title={<span className="text-white/90">Người dùng</span>}
                            value={stats.users}
                            prefix={<UserOutlined className="text-white" />}
                            valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card 
                title={<span className="text-lg font-semibold">Tài liệu gần đây</span>} 
                loading={loading}
                className="shadow-md border-0 rounded-xl"
            >
                <Table
                    columns={columns}
                    dataSource={recentDocuments}
                    rowKey="id"
                    pagination={false}
                    className="custom-table"
                />
            </Card>
    </div>
  )
}

export default Dashboard

