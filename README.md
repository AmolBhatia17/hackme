# 🔐 WikiVault – Ethical Hacking Encyclopedia

> A simple static web application built for **educational and ethical hacking practice** purposes.

---

## ⚠️ Disclaimer

This project is intended **strictly for ethical hacking, CTF (Capture The Flag) challenges, and cybersecurity education**.  
Do **NOT** use this application or any techniques practiced on it for unauthorized or malicious purposes.  
Always have explicit permission before testing any system you do not own.

---

## 📖 About

**WikiVault** is a standalone single-page HTML application that simulates a login-protected encyclopedia portal.  
It is designed to help students and security researchers practice:

- **Authentication bypass techniques** (client-side only login)
- **JavaScript source code analysis**
- **Front-end security awareness**
- **Basic web application structure understanding**

---

## 🚀 How to Run

No server or dependencies needed. Just open the file in any browser:

```bash
# Windows
start encyclopedia.html

# macOS
open encyclopedia.html

# Linux
xdg-open encyclopedia.html
```

---

## 🔑 Default Credentials

| Username | Password |
|----------|----------|
| `admin`  | `admin`  |

> 💡 **Ethical Hacking Note:** The login is handled entirely client-side in JavaScript.  
> Can you find the credentials by reading the source code? Try inspecting the page!

---

## 🛠️ Tech Stack

- Pure **HTML5**, **CSS3**, **Vanilla JavaScript**
- No frameworks, no backend, no dependencies
- Single self-contained file: `encyclopedia.html`

---

## 📁 Project Structure

```
hack/
└── encyclopedia.html   # Complete standalone web app
└── README.md           # This file
```

---

## 🎯 Learning Objectives

1. Understand how **client-side authentication** is insecure
2. Practice **source code review** to extract credentials
3. Explore how **JavaScript controls page visibility** instead of server-side sessions
4. Appreciate why real apps must use **server-side authentication**

---

## 📜 License

For **educational use only**. Use responsibly and ethically.
