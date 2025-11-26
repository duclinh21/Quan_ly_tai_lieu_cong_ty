import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Card,
    Form,
    Input,
    Select,
    Upload,
    Button,
    message,
    Space
} from 'antd'
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import axios from 'axios'

const { TextArea } = Input
const { Option } = Select

const UploadDocument = () => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState([])
    const [departments, setDepartments] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        fetchCategories()
        fetchDepartments()
    }, [])

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

    const onFinish = async (values) => {
        // Kiểm tra file - Ant Design Upload trả về fileList (array)
        let fileToUpload = null
        if (values.file && Array.isArray(values.file) && values.file.length > 0) {
            const firstFile = values.file[0]
            // Ant Design Upload trả về originFileObj hoặc file object
            fileToUpload = firstFile.originFileObj || firstFile
        } else if (values.file && values.file.originFileObj) {
            fileToUpload = values.file.originFileObj
        } else if (values.file && values.file instanceof File) {
            fileToUpload = values.file
        }

        if (!fileToUpload) {
            message.error('Vui lòng chọn file')
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('file', fileToUpload)
            formData.append('title', values.title)
            if (values.description) formData.append('description', values.description)
            if (values.categoryId) formData.append('categoryId', values.categoryId)
            if (values.departmentId) formData.append('departmentId', values.departmentId)
            if (values.tags) formData.append('tags', values.tags)

            const res = await axios.post('/api/documents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            message.success('Tải lên tài liệu thành công')
            navigate(`/documents/${res.data.data.id}`)
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi tải lên tài liệu')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fade-in">
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/documents')}
                className="mb-4"
                size="large"
            >
                Quay lại
            </Button>

            <Card 
                title={<span className="text-xl font-semibold">Tải lên tài liệu mới</span>}
                className="shadow-lg border-0 rounded-xl max-w-3xl mx-auto"
            >
                <Form
                    form={form}
                    onFinish={onFinish}
                    layout="vertical"
                    className="max-w-2xl"
                >
                    <Form.Item
                        name="file"
                        label="File tài liệu"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng chọn file',
                                validator: (_, value) => {
                                    if (!value || (Array.isArray(value) && value.length === 0)) {
                                        return Promise.reject(new Error('Vui lòng chọn file'))
                                    }
                                    return Promise.resolve()
                                }
                            }
                        ]}
                        valuePropName="fileList"
                        getValueFromEvent={(e) => {
                            if (Array.isArray(e)) {
                                return e
                            }
                            return e?.fileList || e?.file ? [e.file] : []
                        }}
                    >
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>Chọn file</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                        <Input placeholder="Nhập tiêu đề tài liệu" />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <TextArea rows={4} placeholder="Nhập mô tả tài liệu" />
                    </Form.Item>

                    <Form.Item name="categoryId" label="Danh mục">
                        <Select placeholder="Chọn danh mục" allowClear>
                            {categories.map((cat) => (
                                <Option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="departmentId" label="Phòng ban">
                        <Select placeholder="Chọn phòng ban" allowClear>
                            {departments.map((dept) => (
                                <Option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="tags"
                        label="Thẻ (phân cách bằng dấu phẩy)"
                    >
                        <Input placeholder="Ví dụ: hợp đồng, quan trọng, 2024" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading}
                                size="large"
                                className="shadow-lg hover:shadow-xl transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none'
                                }}
                            >
                                Tải lên
                            </Button>
                            <Button 
                                onClick={() => navigate('/documents')}
                                size="large"
                            >
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default UploadDocument

