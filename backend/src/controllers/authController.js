const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Signup function
exports.signup = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (username.length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters long' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Validate role
        const validRoles = ['customer', 'seller', 'admin'];
        const userRole = role && validRoles.includes(role.toLowerCase()) ? role.toLowerCase() : 'customer';

        // Check if user already exists (email or username)
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: existingUser.email === email.toLowerCase() 
                    ? 'Email already registered' 
                    : 'Username already taken' 
            });
        }

        // Create new user
        const newUser = new User({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password, // Will be hashed by pre-save hook
            role: userRole
        });

        await newUser.save();
        
        console.log('User created successfully:', {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        });

        res.status(201).json({ 
            message: 'User created successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login function
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check if account is locked
        if (user.isLocked && user.isLocked()) {
            return res.status(423).json({ 
                message: 'Account temporarily locked due to too many failed login attempts. Please try again later.' 
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({ message: 'Account has been deactivated. Please contact support.' });
        }

        console.log('Login attempt for:', email);
        console.log('User found:', user.email, 'Role:', user.role);

        // Compare password
        const isMatch = await user.comparePassword(password);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            // Increment login attempts
            if (user.incLoginAttempts) {
                await user.incLoginAttempts();
            }
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Successful login - update lastLogin and reset login attempts
        user.lastLogin = new Date();
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        console.log('Login successful for:', user.email, 'Role:', user.role);

        // Send response
        res.status(200).json({ 
            message: 'Login successful',
            token, 
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};