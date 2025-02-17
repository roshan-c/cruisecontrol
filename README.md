# 🍺 CruiseControl

A modern, Spotify-inspired bar crawl tracking application designed specifically for cruise ships. Keep track of your bar-hopping journey, complete challenges, and compete with friends - all without relying on the ship's Wi-Fi.

## 🌟 Features

- **Modern UI**: Spotify-inspired dark theme with mobile-first design
- **Bar Tracking**: Check off bars as you visit them and earn points
- **Secondary Goals**: Complete random challenges for bonus points
- **Leaderboard**: Compete with other participants
- **Admin Controls**: Manage users and control bar progression
- **Offline-First**: Works through local network, no ship Wi-Fi needed

## 🚀 Quick Start

1. Clone the repository:
```bash
git clone https://github.com/roshan-c/cruisecontrol.git
cd cruisecontrol
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Access the application at `http://localhost:3000`

## 🛳️ Cruise Ship Deployment

### Method 1: Using Android Phone with Termux

1. Install Termux from F-Droid (preferred) or Google Play Store
2. Set up Node.js environment in Termux:
```bash
pkg update
pkg install nodejs
```

3. Clone and set up the application:
```bash
git clone https://github.com/yourusername/cruisecontrol.git
cd cruisecontrol
npm install
```

4. Start the server:
```bash
npm start
```

5. Enable phone's hotspot
6. Connect other devices to the hotspot
7. Access the app using the phone's hotspot IP (usually `192.168.43.1:3000`)

### Method 2: Using iPhone

1. Install a Node.js server app from the App Store (like "Server for Node")
2. Import the project files
3. Start the server through the app
4. Enable personal hotspot
5. Connect other devices to the hotspot
6. Access using the iPhone's hotspot IP address

## 💻 Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Environment Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

### Project Structure

```
cruisecontrol/
├── config/             # Configuration files
│   └── db.json        # JSON database file
├── middleware/        # Express middleware
│   └── auth.js       # Authentication middleware
├── models/           # Data models
│   └── db.js        # Database operations
├── public/          # Static files
│   ├── css/        # Stylesheets
│   └── js/         # Client-side JavaScript
├── routes/         # Express routes
│   ├── admin.js   # Admin routes
│   ├── auth.js    # Authentication routes
│   └── user.js    # User routes
├── views/         # HTML templates
│   ├── admin.html
│   ├── home.html
│   ├── index.html
│   ├── login.html
│   └── signup.html
├── package.json
├── README.md
└── server.js      # Application entry point
```

## 🎯 Features in Detail

### User Features
- Account creation and authentication
- Bar visit tracking with points
- Secondary goals/challenges
- Real-time point updates
- Mobile-responsive interface

### Admin Features
- User management
- Point adjustment
- Bar progression control
- Goal assignment

## 🎨 UI/UX

- Spotify-inspired dark theme
- Mobile-first responsive design
- Smooth animations and transitions
- Intuitive navigation
- Clear visual feedback

## 🔒 Security Notes

- This is a local network application
- Uses basic session-based authentication
- Passwords are stored in plaintext (suitable for casual use)
- For enhanced security in production:
  - Implement password hashing
  - Add HTTPS
  - Implement rate limiting
  - Add input validation

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- My Dad for giving me the idea

## 📧 Contact

Your Name - [@r09han](https://twitter.com/r09han)
Project Link: [https://github.com/roshan-c/cruisecontrol](https://github.com/roshan-c/cruisecontrol)
