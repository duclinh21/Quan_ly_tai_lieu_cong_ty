import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Table,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Tabs,
  Select,
  Checkbox
} from 'antd'
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  EditOutlined,
  HistoryOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const { TextArea } = Input
const { TabPane } = Tabs
const { Option } = Select

const DocumentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [document, setDocument] = useState(null)
  const [versions, setVersions] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [versionModalVisible, setVersionModalVisible] = useState(false)
  const [permissionModalVisible, setPermissionModalVisible] = useState(false)
  const [checkoutStatus, setCheckoutStatus] = useState(null)
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [departments, setDepartments] = useState([])
  const [form] = Form.useForm()
  const [versionForm] = Form.useForm()
  const [permissionForm] = Form.useForm()

  const isAdmin = user?.role?.name === 'admin'

  useEffect(() => {
    fetchDocument()
    fetchCheckoutStatus()
    fetchUsers()
    fetchRoles()
    fetchDepartments()
  }, [id])

  const fetchDocument = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/documents/${id}`)
      setDocument(res.data.data)
      setVersions(res.data.data.versions || [])
      setPermissions(res.data.data.permissions || [])
    } catch (error) {
      if (error.response?.status === 403) {
        // Tài liệu bị khóa
        const lockedBy = error.response?.data?.data?.lockedBy
        message.error(
          lockedBy 
            ? `Tài liệu đang bị khóa bởi ${lockedBy.fullName || lockedBy.username}. Chỉ admin mới có thể truy cập.`
            : error.response?.data?.message || 'Tài liệu đang bị khóa. Chỉ admin mới có thể truy cập.'
        )
        setDocument(null) // Không hiển thị document
      } else {
        message.error('Lỗi khi tải thông tin tài liệu')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchCheckoutStatus = async () => {
    try {
      const res = await axios.get(`/api/checkouts/${id}/status`)
      setCheckoutStatus(res.data.data)
    } catch (error) {
      // Document might not be checked out
      setCheckoutStatus(null)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users')
      setUsers(res.data.data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await axios.get('/api/roles')
      setRoles(res.data.data || [])
    } catch (error) {
      console.error('Error fetching roles:', error)
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

  const handleCheckout = async () => {
    try {
      await axios.post(`/api/checkouts/${id}/checkout`)
      message.success('Đã khóa tài liệu để chỉnh sửa')
      fetchCheckoutStatus()
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi khóa tài liệu')
    }
  }

  const handleCheckin = async () => {
    try {
      await axios.post(`/api/checkouts/${id}/checkin`)
      message.success('Đã mở khóa tài liệu')
      fetchCheckoutStatus()
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi mở khóa tài liệu')
    }
  }

  const handleUpdate = async (values) => {
    try {
      await axios.put(`/api/documents/${id}`, values)
      message.success('Cập nhật tài liệu thành công')
      setEditModalVisible(false)
      fetchDocument()
    } catch (error) {
      message.error('Lỗi khi cập nhật tài liệu')
    }
  }

  const handleVersionUpload = async (values) => {
    try {
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

      const formData = new FormData()
      formData.append('file', fileToUpload)
      if (values.changeNote) {
        formData.append('changeNote', values.changeNote)
      }

      await axios.post(`/api/versions/document/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      message.success('Tạo phiên bản mới thành công')
      setVersionModalVisible(false)
      versionForm.resetFields()
      fetchDocument()
    } catch (error) {
      console.error('Error uploading version:', error)
      message.error(error.response?.data?.message || 'Lỗi khi tạo phiên bản mới')
    }
  }

  const handleDownload = async () => {
    // Kiểm tra nếu tài liệu bị khóa
    if (checkoutStatus) {
      // Nếu không phải admin và không phải người đã khóa
      if (!isAdmin && checkoutStatus.userId !== user?.id) {
        message.error('Tài liệu đang bị khóa. Chỉ admin hoặc người đã khóa mới có thể tải xuống')
        return
      }
    }

    if (document?.fileUrl) {
      window.open(document.fileUrl, '_blank')
    }
  }

  const handleCreatePermission = async (values) => {
    // Validate: phải chọn ít nhất một trong userId, roleId, hoặc departmentId
    if (!values.userId && !values.roleId && !values.departmentId) {
      message.error('Vui lòng chọn ít nhất một trong: Người dùng, Vai trò, hoặc Phòng ban')
      return
    }

    try {
      await axios.post('/api/permissions', {
        documentId: id,
        userId: values.userId || null,
        roleId: values.roleId || null,
        departmentId: values.departmentId || null,
        canRead: values.canRead || false,
        canWrite: values.canWrite || false,
        canDelete: values.canDelete || false
      })
      message.success('Thêm quyền truy cập thành công')
      setPermissionModalVisible(false)
      permissionForm.resetFields()
      fetchDocument()
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi thêm quyền truy cập')
    }
  }

  const handleDeletePermission = async (permissionId) => {
    try {
      await axios.delete(`/api/permissions/${permissionId}`)
      message.success('Xóa quyền truy cập thành công')
      fetchDocument()
    } catch (error) {
      message.error('Lỗi khi xóa quyền truy cập')
    }
  }

  const versionColumns = [
    {
      title: 'Phiên bản',
      dataIndex: 'version',
      key: 'version'
    },
    {
      title: 'Ghi chú thay đổi',
      dataIndex: 'changeNote',
      key: 'changeNote'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          onClick={async () => {
            try {
              await axios.post(`/api/versions/${record.id}/restore`)
              message.success('Đã khôi phục phiên bản')
              fetchDocument()
            } catch (error) {
              message.error('Lỗi khi khôi phục phiên bản')
            }
          }}
        >
          Khôi phục
        </Button>
      )
    }
  ]

  if (loading && !document) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg text-gray-600">Đang tải...</div>
        </div>
      </div>
    )
  }

  if (!document && !loading) {
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
        <Card className="shadow-lg border-0 rounded-xl">
          <div className="text-center py-8">
            <LockOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Tài liệu đang bị khóa</h2>
            <p className="text-gray-600 mb-4">
              Tài liệu này đang được khóa bởi admin và chỉ admin mới có thể truy cập.
            </p>
            <p className="text-gray-500 text-sm">
              Vui lòng liên hệ admin để được hỗ trợ.
            </p>
          </div>
        </Card>
      </div>
    )
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
                title={<span className="text-xl font-semibold">{document?.title}</span>}
                className="shadow-lg border-0 rounded-xl"
                extra={
                    <Space>
                        {isAdmin && (
                            <>
                                {checkoutStatus ? (
                                    <Button
                                        icon={<UnlockOutlined />}
                                        onClick={handleCheckin}
                                        size="large"
                                    >
                                        Mở khóa
                                    </Button>
                                ) : (
                                    <Button 
                                        icon={<LockOutlined />} 
                                        onClick={handleCheckout}
                                        size="large"
                                    >
                                        Khóa để chỉnh sửa
                                    </Button>
                                )}
                            </>
                        )}
                        <Button 
                            icon={<DownloadOutlined />} 
                            onClick={handleDownload}
                            size="large"
                            type="primary"
                            disabled={checkoutStatus && !isAdmin}
                            style={{
                                background: checkoutStatus && !isAdmin 
                                  ? '#ccc' 
                                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none'
                            }}
                        >
                            Tải xuống
                        </Button>
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => {
                                form.setFieldsValue({
                                    title: document?.title,
                                    description: document?.description
                                })
                                setEditModalVisible(true)
                            }}
                            size="large"
                        >
                            Chỉnh sửa
                        </Button>
                    </Space>
        }
      >
        <Tabs defaultActiveKey="info">
          <TabPane tab="Thông tin" key="info">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Tiêu đề">
                {document?.title}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {document?.description || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                {document?.category?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng ban">
                {document?.department?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">
                {document?.owner?.fullName || document?.owner?.username}
              </Descriptions.Item>
              <Descriptions.Item label="Phiên bản hiện tại">
                {document?.version}
              </Descriptions.Item>
              <Descriptions.Item label="Thẻ">
                <Space>
                  {document?.tags?.map((tag) => (
                    <Tag key={tag.tag.id}>{tag.tag.name}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {new Date(document?.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>
          <TabPane tab="Lịch sử phiên bản" key="versions">
            <div className="mb-4">
              <Button
                type="primary"
                icon={<HistoryOutlined />}
                onClick={() => setVersionModalVisible(true)}
              >
                Tạo phiên bản mới
              </Button>
            </div>
            <Table
              columns={versionColumns}
              dataSource={versions}
              rowKey="id"
              pagination={false}
            />
          </TabPane>
          {isAdmin && (
            <TabPane tab="Quyền truy cập" key="permissions">
            <div className="mb-4">
              <Button
                type="primary"
                onClick={() => {
                  permissionForm.resetFields()
                  setPermissionModalVisible(true)
                }}
              >
                Thêm quyền truy cập
              </Button>
            </div>
            <Table
              columns={[
                { 
                  title: 'Người dùng', 
                  dataIndex: ['user', 'fullName'],
                  render: (text) => text || '-'
                },
                { 
                  title: 'Vai trò', 
                  dataIndex: ['role', 'name'],
                  render: (text) => text || '-'
                },
                { 
                  title: 'Phòng ban', 
                  dataIndex: ['department', 'name'],
                  render: (text) => text || '-'
                },
                {
                  title: 'Quyền đọc',
                  dataIndex: 'canRead',
                  render: (val) => val ? <Tag color="green">✓</Tag> : <Tag color="red">✗</Tag>
                },
                {
                  title: 'Quyền ghi',
                  dataIndex: 'canWrite',
                  render: (val) => val ? <Tag color="green">✓</Tag> : <Tag color="red">✗</Tag>
                },
                {
                  title: 'Quyền xóa',
                  dataIndex: 'canDelete',
                  render: (val) => val ? <Tag color="green">✓</Tag> : <Tag color="red">✗</Tag>
                },
                {
                  title: 'Thao tác',
                  key: 'action',
                  render: (_, record) => (
                    <Button
                      type="link"
                      danger
                      onClick={() => handleDeletePermission(record.id)}
                    >
                      Xóa
                    </Button>
                  )
                }
              ]}
              dataSource={permissions}
              rowKey="id"
            />
          </TabPane>
          )}
        </Tabs>
      </Card>

      <Modal
        title="Chỉnh sửa tài liệu"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleUpdate} layout="vertical">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Tạo phiên bản mới"
        open={versionModalVisible}
        onCancel={() => setVersionModalVisible(false)}
        onOk={() => versionForm.submit()}
      >
        <Form form={versionForm} onFinish={handleVersionUpload} layout="vertical">
          <Form.Item
            name="file"
            label="File mới"
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
              if (e?.fileList) {
                return e.fileList
              }
              if (e?.file) {
                return [e.file]
              }
              return []
            }}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button>Chọn file</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="changeNote" label="Ghi chú thay đổi">
            <TextArea rows={3} placeholder="Nhập ghi chú về thay đổi trong phiên bản này..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm quyền truy cập"
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        onOk={() => permissionForm.submit()}
        width={600}
      >
        <Form 
          form={permissionForm} 
          onFinish={handleCreatePermission} 
          layout="vertical"
        >
          <Form.Item
            name="userId"
            label="Người dùng"
            help="Chọn một trong: Người dùng, Vai trò, hoặc Phòng ban"
          >
            <Select 
              placeholder="Chọn người dùng (tùy chọn)" 
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.fullName} ({user.username})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="roleId" label="Vai trò">
            <Select 
              placeholder="Chọn vai trò (tùy chọn)" 
              allowClear
              showSearch
            >
              {roles.map((role) => (
                <Option key={role.id} value={role.id}>
                  {role.name} {role.description ? `- ${role.description}` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="departmentId" label="Phòng ban">
            <Select 
              placeholder="Chọn phòng ban (tùy chọn)" 
              allowClear
              showSearch
            >
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <div style={{ color: '#999', fontSize: '12px', marginBottom: '16px' }}>
            * Phải chọn ít nhất một trong: Người dùng, Vai trò, hoặc Phòng ban
          </div>
          <Form.Item label="Quyền">
            <Form.Item name="canRead" valuePropName="checked" noStyle>
              <Checkbox>Quyền đọc</Checkbox>
            </Form.Item>
            <br />
            <Form.Item name="canWrite" valuePropName="checked" noStyle>
              <Checkbox>Quyền ghi</Checkbox>
            </Form.Item>
            <br />
            <Form.Item name="canDelete" valuePropName="checked" noStyle>
              <Checkbox>Quyền xóa</Checkbox>
            </Form.Item>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DocumentDetail

