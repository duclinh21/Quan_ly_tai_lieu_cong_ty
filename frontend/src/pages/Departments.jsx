import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, message, Space, Card } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import axios from 'axios'

const { TextArea } = Input

const Departments = () => {
    const [departments, setDepartments] = useState([])
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [editingDepartment, setEditingDepartment] = useState(null)
    const [form] = Form.useForm()

    useEffect(() => {
        fetchDepartments()
    }, [])

    const fetchDepartments = async () => {
        setLoading(true)
        try {
            const res = await axios.get('/api/departments')
            setDepartments(res.data.data || [])
        } catch (error) {
            message.error('Lỗi khi tải danh sách phòng ban')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (values) => {
        try {
            if (editingDepartment) {
                await axios.put(`/api/departments/${editingDepartment.id}`, values)
                message.success('Cập nhật phòng ban thành công')
            } else {
                await axios.post('/api/departments', values)
                message.success('Tạo phòng ban thành công')
            }
            setModalVisible(false)
            form.resetFields()
            setEditingDepartment(null)
            fetchDepartments()
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi lưu phòng ban')
        }
    }

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/departments/${id}`)
            message.success('Xóa phòng ban thành công')
            fetchDepartments()
        } catch (error) {
            message.error('Lỗi khi xóa phòng ban')
        }
    }

    const columns = [
        {
            title: 'Tên phòng ban',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: 'Số người dùng',
            dataIndex: ['_count', 'users'],
            key: 'users'
        },
        {
            title: 'Số tài liệu',
            dataIndex: ['_count', 'documents'],
            key: 'documents'
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
                            setEditingDepartment(record)
                            form.setFieldsValue(record)
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
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Phòng ban</h1>
                    <p className="text-gray-600">Quản lý các phòng ban trong hệ thống</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingDepartment(null)
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
                    Thêm phòng ban
                </Button>
            </div>

            <Card className="shadow-md border-0 rounded-xl">
                <Table
                    columns={columns}
                    dataSource={departments}
                    rowKey="id"
                    loading={loading}
                />
            </Card>

            <Modal
                title={editingDepartment ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false)
                    form.resetFields()
                    setEditingDepartment(null)
                }}
                onOk={() => form.submit()}
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên phòng ban"
                        rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default Departments

