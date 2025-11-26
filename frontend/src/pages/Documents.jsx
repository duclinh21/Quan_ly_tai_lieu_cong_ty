import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Card,
  message,
  Popconfirm
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const { Search } = Input
const { Option } = Select

const Documents = () => {
  const [documents, setDocuments] = useState([])
  const [categories, setCategories] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    departmentId: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
    fetchDepartments()
    fetchDocuments()
  }, [pagination.current, filters])

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories')
      setCategories(res.data.data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/departments')
      setDepartments(res.data.data || [])
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...(filters.search && { search: filters.search }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.departmentId && { departmentId: filters.departmentId })
      }

      const res = await axios.get('/api/documents', { params })
      setDocuments(res.data.data || [])
      setPagination({
        ...pagination,
        total: res.data.pagination?.total || 0
      })
    } catch (error) {
      message.error('Lỗi khi tải danh sách tài liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/documents/${id}`)
      message.success('Xóa tài liệu thành công')
      fetchDocuments()
    } catch (error) {
      message.error('Lỗi khi xóa tài liệu')
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
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      render: (department) => department?.name || '-'
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
      title: 'Thẻ',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => (
        <Space>
          {tags?.map((tag) => (
            <Tag key={tag.tag.id}>{tag.tag.name}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/documents/${record.id}`)}
          >
            Xem
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa tài liệu này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

    return (
        <div className="fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Tài liệu</h1>
                    <p className="text-gray-600">Quản lý và tìm kiếm tài liệu trong hệ thống</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/documents/upload')}
                    size="large"
                    className="shadow-lg hover:shadow-xl transition-all"
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        height: '40px'
                    }}
                >
                    Tải lên tài liệu
                </Button>
            </div>

            <Card className="mb-4 shadow-md border-0 rounded-xl">
                <Space direction="vertical" className="w-full" size="middle">
                    <Search
                        placeholder="Tìm kiếm tài liệu..."
                        allowClear
                        size="large"
                        onSearch={(value) => {
                            setFilters({ ...filters, search: value })
                            setPagination({ ...pagination, current: 1 })
                        }}
                        style={{ width: '100%' }}
                        className="rounded-lg"
                    />
                    <Space>
                        <Select
                            placeholder="Lọc theo danh mục"
                            allowClear
                            style={{ width: 200 }}
                            size="large"
                            onChange={(value) => {
                                setFilters({ ...filters, categoryId: value || '' })
                                setPagination({ ...pagination, current: 1 })
                            }}
                        >
                            {categories.map((cat) => (
                                <Option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </Option>
                            ))}
                        </Select>
                        <Select
                            placeholder="Lọc theo phòng ban"
                            allowClear
                            style={{ width: 200 }}
                            size="large"
                            onChange={(value) => {
                                setFilters({ ...filters, departmentId: value || '' })
                                setPagination({ ...pagination, current: 1 })
                            }}
                        >
                            {departments.map((dept) => (
                                <Option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </Option>
                            ))}
                        </Select>
                    </Space>
                </Space>
            </Card>

            <Card className="shadow-md border-0 rounded-xl">
                <Table
                    columns={columns}
                    dataSource={documents}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} tài liệu`
                    }}
                    onChange={(pagination) => {
                        setPagination({
                            ...pagination,
                            current: pagination.current,
                            pageSize: pagination.pageSize
                        })
                    }}
                />
            </Card>
    </div>
  )
}

export default Documents

