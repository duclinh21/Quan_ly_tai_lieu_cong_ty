import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag, Card } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Option } = Select

const Users = () => {
    const [users, setUsers] = useState([])
    const [roles, setRoles] = useState([])
    const [departments, setDepartments] = useState([])
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [form] = Form.useForm()

    useEffect(() => {
        fetchUsers()
        fetchRoles()
        fetchDepartments()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await axios.get('/api/users')
            setUsers(res.data.data || [])
        } catch (error) {
            message.error('Lỗi khi tải danh sách người dùng')
        } finally {
            setLoading(false)
        }
    }

    const fetchRoles = async () => {
        try {
            const res = await axios.get('/api/roles')
            setRoles(res.data.data || [])
        } catch (error) {
            console.error('Error fetching roles:', error)
            message.error('Lỗi khi tải danh sách vai trò')
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

    const handleSubmit = async (values) => {
        try {
            if (editingUser) {
                // Kiểm tra nếu đang cấp quyền admin
                const selectedRole = roles.find(r => r.id === values.roleId)
                if (selectedRole?.name === 'admin' && editingUser.role?.name !== 'admin') {
                    // Hiển thị cảnh báo nhưng vẫn cho phép
                    message.warning('Bạn đang cấp quyền admin cho người dùng này')
                }
                await axios.put(`/api/users/${editingUser.id}`, values)
                message.success('Cập nhật người dùng thành công')
            } else {
                // Tạo user mới - cần password
                if (!values.password) {
                    message.error('Vui lòng nhập mật khẩu cho tài khoản mới')
                    return
                }
                // Admin có thể tạo user với role admin
                await axios.post('/api/auth/register-admin', values)
                message.success('Tạo người dùng thành công')
            }
            setModalVisible(false)
            form.resetFields()
            setEditingUser(null)
            fetchUsers()
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi lưu người dùng')
        }
    }

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/users/${id}`)
            message.success('Xóa người dùng thành công')
            fetchUsers()
        } catch (error) {
            message.error('Lỗi khi xóa người dùng')
        }
    }

    const columns = [
        {
            title: 'Tên đăng nhập',
            dataIndex: 'username',
            key: 'username'
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            key: 'fullName'
        },
        {
            title: 'Vai trò',
            dataIndex: ['role', 'name'],
            key: 'role',
            render: (roleName) => {
                const color = roleName === 'admin' ? 'red' : roleName === 'manager' ? 'blue' : 'default'
                return <Tag color={color}>{roleName}</Tag>
            }
        },
        {
            title: 'Phòng ban',
            dataIndex: ['department', 'name'],
            key: 'department'
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingUser(record)
                            form.setFieldsValue({
                                fullName: record.fullName,
                                roleId: record.role?.id || record.roleId,
                                departmentId: record.department?.id || record.departmentId
                            })
                            setModalVisible(true)
                        }}
                    >
                        Sửa
                    </Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    >
                        Xóa
                    </Button>
                </Space>
            )
        }
    ]

    return (
        <div className="fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Người dùng</h1>
                    <p className="text-gray-600">Quản lý tài khoản người dùng và phân quyền</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingUser(null)
                        form.resetFields()
                        setModalVisible(true)
                    }}
                    size="large"
                    className="shadow-lg hover:shadow-xl transition-all"
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                    }}
                >
                    Thêm người dùng
                </Button>
            </div>

            <Card className="shadow-md border-0 rounded-xl">
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    loading={loading}
                />
            </Card>

            <Modal
                title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false)
                    form.resetFields()
                    setEditingUser(null)
                }}
                onOk={() => form.submit()}
                width={600}
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    {!editingUser && (
                        <>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input placeholder="Email" />
                            </Form.Item>
                            <Form.Item
                                name="username"
                                label="Tên đăng nhập"
                                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                            >
                                <Input placeholder="Tên đăng nhập" />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                                rules={[
                                    { required: !editingUser, message: 'Vui lòng nhập mật khẩu!' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                ]}
                            >
                                <Input.Password placeholder="Mật khẩu" />
                            </Form.Item>
                        </>
                    )}
                    <Form.Item
                        name="fullName"
                        label="Họ tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                        <Input placeholder="Họ và tên" />
                    </Form.Item>
                    <Form.Item
                        name="roleId"
                        label="Vai trò"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                    >
                        <Select placeholder="Chọn vai trò" showSearch>
                            {roles.map((role) => (
                                <Option key={role.id} value={role.id}>
                                    {role.name} {role.description ? `- ${role.description}` : ''}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="departmentId" label="Phòng ban">
                        <Select placeholder="Chọn phòng ban (tùy chọn)" allowClear>
                            {departments.map((dept) => (
                                <Option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default Users

