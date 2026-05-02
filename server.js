const express = require('express');
const cookieParser = require('cookie-parser');
const db = require('./database');
const path = require('path');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Custom middleware to check simple authentication cookie
app.use((req, res, next) => {
    res.locals.user = null;
    if (req.cookies.auth) {
        // Vulnerability: Broken Authentication (Cookie is base64 encoded JSON, easily tampered)
        try {
            const decoded = Buffer.from(req.cookies.auth, 'base64').toString('ascii');
            res.locals.user = JSON.parse(decoded);
        } catch (e) {
            console.error("Invalid cookie");
        }
    }
    next();
});

// Home/Login Route
app.get('/', (req, res) => {
    if (res.locals.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', { error: null });
});

// Vulnerable Login Route (SQL Injection)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.login(username, password, (err, user) => {
        if (err || !user) {
            return res.render('login', { error: 'Invalid credentials' });
        }
        
        // Setup vulnerable cookie
        const cookieVal = Buffer.from(JSON.stringify({ id: user.id, username: user.username, role: user.role })).toString('base64');
        res.cookie('auth', cookieVal);
        res.redirect('/dashboard');
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie('auth');
    res.redirect('/');
});

// Sign Up Route
app.get('/signup', (req, res) => {
    if (res.locals.user) {
        return res.redirect('/dashboard');
    }
    res.render('signup', { error: null, success: null });
});

app.post('/signup', (req, res) => {
    const { username, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.render('signup', { error: 'Passwords do not match', success: null });
    }
    if (!username || !password) {
        return res.render('signup', { error: 'All fields are required', success: null });
    }

    db.register(username, password, (err, user, msg) => {
        if (err) {
            return res.render('signup', { error: 'Registration failed: ' + err.message, success: null });
        }
        if (msg) {
            return res.render('signup', { error: msg, success: null });
        }
        // Auto-login after successful registration
        const cookieVal = Buffer.from(JSON.stringify({ id: user.id, username: user.username, role: user.role })).toString('base64');
        res.cookie('auth', cookieVal);
        res.redirect('/dashboard');
    });
});

// Dashboard (IDOR Vulnerability)
app.get('/dashboard', (req, res) => {
    if (!res.locals.user) {
        return res.redirect('/');
    }

    // Vulnerability: Insecure Direct Object Reference (IDOR)
    // Changing the ?id= parameter lets you view other users' data, even if it doesn't match the cookie
    const targetUserId = req.query.id || res.locals.user.id;

    db.getUserById(targetUserId, (err, targetUser) => {
        if (err || !targetUser) {
            return res.status(404).send('User not found');
        }
        res.render('dashboard', { targetUser });
    });
});

// Message Board (Stored XSS)
app.get('/messages', (req, res) => {
    db.getMessages((err, messages) => {
        res.render('messages', { messages });
    });
});

app.post('/messages', (req, res) => {
    const { message } = req.body;
    const author = res.locals.user ? res.locals.user.username : 'Guest';
    
    // Vulnerability: Stored XSS
    // The message is saved directly to the database without sanitization
    db.addMessage(author, message, (err) => {
        res.redirect('/messages');
    });
});

app.listen(port, () => {
    console.log(`Vulnerable app listening at http://localhost:${port}`);
    console.log('Ensure you only run this on local/isolated environments for educational purposes.');
});
