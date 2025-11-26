import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, message, Space, Card } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import axios from 'axios'

const { TextArea } = Input

const Categories = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [form] = Form.useForm()

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const res = await axios.get('/api/categories')
            setCategories(res.data.data || [])
        } catch (error) {
            message.error('Lỗi khi tải danh sách danh mục')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (values) => {
        try {
            if (editingCategory) {
                await axios.put(`/api/categories/${editingCategory.id}`, values)
                message.success('Cập nhật danh mục thành công')
            } else {
                await axios.post('/api/categories', values)
                message.success('Tạo danh mục thành công')
            }
            setModalVisible(false)
            form.resetFields()
            setEditingCategory(null)
            fetchCategories()
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi lưu danh mục')
        }
    }

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/categories/${id}`)
            message.success('Xóa danh mục thành công')
            fetchCategories()
        } catch (error) {
            message.error('Lỗi khi xóa danh mục')
        }
    }

    const columns = [
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description'
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
                            setEditingCategory(record)
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
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Danh mục</h1>
                    <p className="text-gray-600">Quản lý các danh mục tài liệu trong hệ thống</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingCategory(null)
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
                    Thêm danh mục
                </Button>
            </div>

            <Card className="shadow-md border-0 rounded-xl">
                <Table
                    columns={columns}
                    dataSource={categories}
                    rowKey="id"
                    loading={loading}
                />
            </Card>

            <Modal
                title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false)
                    form.resetFields()
                    setEditingCategory(null)
                }}
                onOk={() => form.submit()}
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
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

export default Categories

