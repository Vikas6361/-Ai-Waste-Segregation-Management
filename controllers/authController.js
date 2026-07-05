const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.signup = async (req, res) => {
    try {
        const { username, password, confirm_password } = req.body;
        if (!username || !password || password !== confirm_password) {
            return res.redirect('/signup.html?error=Invalid inputs');
        }
        
        const existing = await User.findOne({ username });
        if (existing) return res.redirect('/signup.html?error=Username taken');

        const hashed = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashed });

        res.redirect('/login.html?success=Account created successfully');
    } catch (err) {
        res.redirect('/signup.html?error=Server error');
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.redirect('/login.html?error=Invalid credentials');
        }

        res.redirect(`/main_app_page?username=${encodeURIComponent(username)}`);
    } catch (err) {
        res.redirect('/login.html?error=Server error');
    }
};
