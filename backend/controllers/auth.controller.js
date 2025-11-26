const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { createAuditLog } = require('../utils/auditLog.helper');

// Register
const register = async (req, res) => {
    try {
        const { email, username, password, fullName, roleId, departmentId } = req.body;

        // Nếu không có roleId, tìm role "user" làm mặc định
        let finalRoleId = roleId;
        if (!finalRoleId) {
            const defaultRole = await prisma.role.findUnique({
                where: { name: 'user' }
            });
            if (!defaultRole) {
                return res.status(400).json({
                    success: false,
                    message: 'Không tìm thấy role mặc định. Vui lòng liên hệ quản trị viên.'
                });
            }
            finalRoleId = defaultRole.id;
        } else {
            // Kiểm tra role hợp lệ
            const role = await prisma.role.findUnique({
                where: { id: roleId }
            });
            if (!role) {
                return res.status(400).json({
                    success: false,
                    message: 'Vai trò không hợp lệ'
                });
            }
            // Chỉ chặn đăng ký với role admin nếu không phải admin đang tạo
            // req.user sẽ có khi được gọi từ route có authenticate middleware
            const isAdminCreating = req.user && req.user.role && req.user.role.name === 'admin';
            if (role.name === 'admin' && !isAdminCreating) {
                return res.status(403).json({
                    success: false,
                    message: 'Không thể đăng ký với quyền admin. Chỉ admin mới có thể tạo tài khoản admin.'
                });
            }
        }

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email hoặc tên đăng nhập đã tồn tại'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                fullName,
                roleId: finalRoleId,
                departmentId: departmentId || null
            },
            include: {
                role: true,
                department: true
            }
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        await createAuditLog(user.id, 'user_registered', null, `User ${username} registered`, req);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email và mật khẩu là bắt buộc'
            });
        }

        // Find user by email or username (cho phép đăng nhập bằng email hoặc username)
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username: email }
                ]
            },
            include: {
                role: true,
                department: true
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        await createAuditLog(user.id, 'user_login', null, `User ${user.username} logged in`, req);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                role: true,
                department: true
            }
        });

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            data: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser
};

