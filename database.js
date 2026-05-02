const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./vulnerable.db');

db.serialize(() => {
    // Create Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT,
        role TEXT,
        secret_data TEXT
    )`);

    // Create Messages Table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author TEXT,
        content TEXT
    )`);

    // Seed dummy data
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (row.count === 0) {
            db.run(`INSERT INTO users (username, password, role, secret_data) VALUES ('admin', 'super_secret_password_123', 'admin', 'FLAG{admin_privileges_acquired}')`);
            db.run(`INSERT INTO users (username, password, role, secret_data) VALUES ('johndoe', 'password123', 'employee', 'My bank pin is 1234')`);
            db.run(`INSERT INTO users (username, password, role, secret_data) VALUES ('janedoe', 'qwerty', 'employee', 'Performance review tomorrow')`);
        }
    });
});

// Vulnerable Login Function (SQL Injection)
function login(username, password, callback) {
    // Vulnerability: String concatenation allows SQL Injection
    // E.g., username = "' OR '1'='1"
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    console.log("Executing Query:", query); // For debugging during CTF

    db.get(query, (err, row) => {
        callback(err, row);
    });
}

function getUserById(id, callback) {
    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
        callback(err, row);
    });
}

function getMessages(callback) {
    db.all(`SELECT * FROM messages ORDER BY id DESC`, [], (err, rows) => {
        callback(err, rows);
    });
}

function addMessage(author, content, callback) {
    db.run(`INSERT INTO messages (author, content) VALUES (?, ?)`, [author, content], (err) => {
        callback(err);
    });
}

// Registration Function (Vulnerability: passwords stored in plaintext)
function register(username, password, callback) {
    db.get(`SELECT id FROM users WHERE username = ?`, [username], (err, row) => {
        if (err) return callback(err);
        if (row) return callback(null, null, 'Username already exists');
        db.run(`INSERT INTO users (username, password, role, secret_data) VALUES (?, ?, 'employee', 'Nothing to see here')`,
            [username, password],
            function(err) {
                callback(err, { id: this.lastID, username, role: 'employee' });
            }
        );
    });
}

module.exports = {
    login,
    getUserById,
    getMessages,
    addMessage,
    register
};
