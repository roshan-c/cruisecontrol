# 🍺 CruiseControl

A modern, Spotify-inspired bar crawl tracking application designed specifically for cruise ships. Keep track of your bar-hopping journey, complete challenges, and compete with friends - all without relying on the ship's Wi-Fi.

## 🌟 Features

- **Modern UI**: Spotify-inspired dark theme with mobile-first design
- **Event System**: Create and join timed bar crawl events
- **Event Progress**: Track bars visited and goals completed within events
- **Event Results**: View event rankings and podium displays
- **Admin Controls**: Create events, manage users, and track progress
- **Offline-First**: Works through local network, no ship Wi-Fi needed

## 🚀 Quick Start

1. Clone the repository:
```bash
git clone https://github.com/roshan-c/cruisecontrol.git
cd cruisecontrol
```

2. Install dependencies:
```bash
bundle install
```

3. Set up the database:
```bash
rails db:create
rails db:migrate
rails db:seed
```

4. Start the server:
```bash
rails server
```

5. Access the application at `http://localhost:3000`

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. Make sure you have Docker and Docker Compose installed
2. Clone the repository and navigate to the project directory
3. Build and start the containers:
```bash
docker-compose up -d
```
4. Access the application at `http://localhost:3000`

To stop the application:
```bash
docker-compose down
```

### Manual Docker Build

If you prefer to run Docker commands manually:

1. Build the Docker image:
```bash
docker build -t cruisecontrol .
```

2. Run the container:
```bash
docker run -p 3000:3000 -d cruisecontrol
```

## 🛳️ Cruise Ship Deployment

### Method 1: Using Android Phone with Termux

1. Install Termux from F-Droid (preferred) or Google Play Store
2. Set up Ruby and Rails environment in Termux:
```bash
pkg update
pkg install ruby
gem install rails bundler
```

3. Clone and set up the application:
```bash
git clone https://github.com/roshan-c/cruisecontrol.git
cd cruisecontrol
bundle install
rails db:setup
```

4. Start the server:
```bash
rails server -b 0.0.0.0
```

5. Enable phone's hotspot
6. Connect other devices to the hotspot
7. Access the app using the phone's hotspot IP (usually `192.168.43.1:3000`)

### Method 2: Using iPhone

Due to iOS limitations, deploying Rails apps on iPhone requires specialized apps or cloud solutions. Consider using cloud hosting services instead.

## 💻 Development

### Prerequisites

- Ruby (v3.2 or higher)
- Rails (v8.0 or higher)
- SQLite3

### Environment Setup

1. Fork and clone the repository
2. Install dependencies: `bundle install`
3. Set up database: `rails db:setup`
4. Start development server: `rails server`

### Project Structure

```
cruisecontrol/
├── app/
│   ├── controllers/    # Rails controllers
│   │   ├── admin_controller.rb
│   │   ├── auth_controller.rb
│   │   └── users_controller.rb
│   └── models/        # Rails models
│       ├── user.rb
│       ├── bar.rb
│       ├── event.rb
│       └── goal.rb
├── config/            # Rails configuration
│   ├── routes.rb      # API routes
│   └── database.yml   # Database configuration
├── db/               # Database files
│   ├── migrate/      # Database migrations
│   └── seeds.rb      # Sample data
├── public/          # Static files
│   ├── css/        # Stylesheets
│   └── js/         # Client-side JavaScript
├── views/          # HTML templates
│   ├── admin.html
│   ├── home.html
│   ├── index.html
│   ├── login.html
│   └── signup.html
├── Gemfile         # Ruby dependencies
└── README.md
```

## 🎯 Features in Detail

### User Features
- Account creation and authentication
- Join and participate in bar crawl events
- Track event-specific progress and points
- Complete event challenges and goals
- View event rankings and results
- Mobile-responsive interface

### Admin Features
- User management
- Create and manage timed events
- Set available bars and goals for events
- End events and view detailed results
- Adjust user points and manage accounts

## 🎨 UI/UX

- Spotify-inspired dark theme
- Mobile-first responsive design
- Smooth animations and transitions
- Intuitive navigation
- Clear visual feedback

## 🔒 Security Notes

- This is a local network application
- Uses Rails session-based authentication
- Passwords are stored in plaintext (suitable for casual use)
- For enhanced security in production:
  - Implement password hashing with bcrypt
  - Add HTTPS
  - Implement rate limiting
  - Add input validation

## 🧪 Testing

Run the test suite:
```bash
rails test
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- My Dad for giving me the idea

## 📧 Contact

- My Twitter - [@r09han](https://twitter.com/r09han)
