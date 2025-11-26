import { useEffect, useState } from 'react'
import { Table, Tag, Select, Input, Card } from 'antd'
import axios from 'axios'

const { Option } = Select
const { Search } = Input

const AuditLogs = () => {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 50,
        total: 0
    })
    const [filters, setFilters] = useState({
        action: '',
        userId: ''
    })

    useEffect(() => {
        fetchLogs()
    }, [pagination.current, filters])

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                ...(filters.action && { action: filters.action }),
                ...(filters.userId && { userId: filters.userId })
            }

            const res = await axios.get('/api/audit-logs', { params })
            setLogs(res.data.data || [])
            setPagination({
                ...pagination,
                total: res.data.pagination?.total || 0
            })
        } catch (error) {
            console.error('Error fetching audit logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const getActionColor = (action) => {
        const colors = {
            document_upload: 'green',
            document_download: 'blue',
            document_update: 'orange',
            document_delete: 'red',
            document_checkout: 'purple',
            document_checkin: 'cyan',
            user_login: 'green',
            user_registered: 'blue',
            permission_create: 'geekblue',
            permission_update: 'orange',
            permission_delete: 'red'
        }
        return colors[action] || 'default'
    }

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleString('vi-VN')
        },
        {
            title: 'Người dùng',
            dataIndex: ['user', 'fullName'],
            key: 'user',
            render: (text, record) => text || record.user?.username || '-'
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action',
            render: (action) => (
                <Tag color={getActionColor(action)}>{action}</Tag>
            )
        },
        {
            title: 'Tài liệu',
            dataIndex: ['document', 'title'],
            key: 'document',
            render: (text) => text || '-'
        },
        {
            title: 'Chi tiết',
            dataIndex: 'details',
            key: 'details'
        },
        {
            title: 'IP Address',
            dataIndex: 'ipAddress',
            key: 'ipAddress'
        }
    ]

    return (
        <div className="fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Nhật ký Kiểm toán</h1>
                <p className="text-gray-600">Theo dõi tất cả các hoạt động trong hệ thống</p>
            </div>

            <div className="mb-4 flex gap-4">
                <Select
                    placeholder="Lọc theo hành động"
                    allowClear
                    style={{ width: 200 }}
                    onChange={(value) => {
                        setFilters({ ...filters, action: value || '' })
                        setPagination({ ...pagination, current: 1 })
                    }}
                >
                    <Option value="document_upload">Tải lên tài liệu</Option>
                    <Option value="document_download">Tải xuống tài liệu</Option>
                    <Option value="document_update">Cập nhật tài liệu</Option>
                    <Option value="document_delete">Xóa tài liệu</Option>
                    <Option value="user_login">Đăng nhập</Option>
                    <Option value="permission_create">Tạo quyền</Option>
                </Select>
            </div>

            <Card className="shadow-md border-0 rounded-xl">
                <Table
                    columns={columns}
                    dataSource={logs}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} bản ghi`
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

export default AuditLogs

