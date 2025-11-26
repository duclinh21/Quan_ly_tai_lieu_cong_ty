import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, Card, message, Select } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Option } = Select

const Register = () => {
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState([])
  const [departments, setDepartments] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchRoles()
    fetchDepartments()
  }, [])

  const fetchRoles = async () => {
    try {
      const res = await axios.get('/api/roles')
      console.log('Roles API response:', res.data)
      // Chỉ cho phép đăng ký với role user (không cho đăng ký admin)
      const userRoles = res.data.data?.filter(r => r.name !== 'admin') || []
      console.log('Filtered roles for registration:', userRoles)
      setRoles(userRoles)
      if (userRoles.length === 0) {
        console.warn('No roles available for registration')
        message.warning('Không có vai trò nào khả dụng để đăng ký')
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
      message.error('Không thể tải danh sách vai trò. Vui lòng thử lại sau.')
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
    setLoading(true)
    try {
      // Loại bỏ confirmPassword trước khi gửi lên server
      const { confirmPassword, ...registerData } = values
      await axios.post('/api/auth/register', registerData)
      message.success('Đăng ký thành công! Vui lòng đăng nhập.')
      navigate('/login')
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-2xl relative z-10" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <div className="text-center mb-8 pt-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">D</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Document Management System
          </h1>
          <p className="text-gray-600">Đăng ký tài khoản mới</p>
        </div>
        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Tên đăng nhập"
            />
          </Form.Item>

          <Form.Item
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input
              placeholder="Họ và tên"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu"
            />
          </Form.Item>

          <Form.Item
            name="roleId"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò" showSearch>
              {roles.length > 0 ? (
                roles.map((role) => (
                  <Option key={role.id} value={role.id}>
                    {role.name} {role.description ? `- ${role.description}` : ''}
                  </Option>
                ))
              ) : (
                <Option disabled value="">Đang tải...</Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item name="departmentId">
            <Select placeholder="Chọn phòng ban (tùy chọn)" allowClear>
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              loading={loading}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              Đăng ký
            </Button>
          </Form.Item>

          <Form.Item>
            <div className="text-center">
              <span className="text-gray-600">Đã có tài khoản? </span>
              <Link to="/login" className="text-blue-600 hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Register

