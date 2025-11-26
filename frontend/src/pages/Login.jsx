import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const onFinish = async (values) => {
        setLoading(true)
        const result = await login(values.email, values.password)
        setLoading(false)

        if (result.success) {
            message.success('Đăng nhập thành công')
            navigate('/dashboard')
        } else {
            message.error(result.message)
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
                    <p className="text-gray-600">Đăng nhập vào hệ thống</p>
                </div>
                <Form
                    name="login"
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
                            prefix={<UserOutlined />}
                            placeholder="Email"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Mật khẩu"
                        />
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
                            Đăng nhập
                        </Button>
                    </Form.Item>

                    <Form.Item>
                        <div className="text-center">
                            <span className="text-gray-600">Chưa có tài khoản? </span>
                            <Link to="/register" className="text-blue-600 hover:underline">
                                Đăng ký ngay
                            </Link>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default Login

