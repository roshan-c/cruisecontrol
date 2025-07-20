# CruiseControl

A no-password, Tailwind-styled, SQLite-backed bar crawl tracker designed specifically for cruise ships. Track your progress through ship bars and complete fun challenges along the way.

## Features

- **No-Password Authentication**: Simple username-based login system
- **Bar Crawl Tracking**: Mark off bars as you visit them
- **Challenge Goals**: Complete fun drinking challenges at each location
- **Event Management**: Create and join timed bar crawl events
- **Real-time Progress**: Track your progress in real-time during events
- **Admin Panel**: Manage bars, goals, and events through admin interface
- **Offline-First**: Works without internet connection once loaded
- **Responsive Design**: Optimized for mobile and desktop use

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite with custom database wrapper
- **Frontend**: HTML, CSS (Tailwind), JavaScript
- **Authentication**: Session-based with express-session
- **Styling**: Tailwind CSS for modern, responsive design

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CruiseControl
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### Getting Started

1. Open your browser and navigate to `http://localhost:3000`
2. Enter a username to create an account or log in
3. Browse available events or create a new one
4. Join an event to start tracking your bar crawl progress

### Managing Bars and Goals

The application includes a management tool for customizing bars and goals:

```bash
npm run manage
```

This interactive tool allows you to:
- Remove all bars and goals
- Import bars from `bars.csv`
- Import goals from `goals.csv`
- Manage the database content

### CSV Import Format

**bars.csv**: One bar name per line
```
Blaze
Boleros
Bow & Stern Pub
Suite Lounge
```

**goals.csv**: One goal per line
```
Down your drink in under 15 seconds
Order a drink in another language
Take a selfie with the bartender
```

## Project Structure

```
CruiseControl/
├── server.js          # Main Express server
├── database.js        # SQLite database wrapper
├── manage.js          # Management CLI tool
├── package.json       # Dependencies and scripts
├── bars.csv          # Default bar locations
├── goals.csv         # Default challenge goals
├── public/           # Static frontend files
│   ├── index.html    # Main application page
│   ├── events.html   # Events management page
│   ├── progress.html # Progress tracking page
│   └── results.html  # Results and statistics page
└── cruise.db         # SQLite database file
```

## Database Schema

- **users**: User accounts with username and admin status
- **events**: Bar crawl events with duration and status
- **participants**: Event participation tracking
- **progress**: Individual progress on bars and goals
- **bars**: Available bar locations
- **goals**: Available challenge goals

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get current user info

### Events
- `GET /api/events` - Get active events
- `POST /api/events/:id/join` - Join an event
- `GET /api/events/:id/progress` - Get event progress
- `POST /api/events/:id/progress` - Update progress

### Data
- `GET /api/bars` - Get available bars
- `GET /api/goals` - Get available goals

## Development

### Running in Development Mode

```bash
npm run dev
```

### Database Management

The application automatically creates the database and tables on first run. Use the management tool for data operations:

```bash
node manage.js
```

### Adding Custom Bars and Goals

1. Create `bars.csv` and `goals.csv` files in the project root
2. Add your custom bars and goals (one per line)
3. Run the management tool to import them

## Deployment

The application is designed to run on any Node.js hosting platform:

1. Ensure Node.js is installed on your server
2. Upload the project files
3. Run `npm install` to install dependencies
4. Start the server with `npm start`
5. Configure your web server to proxy requests to port 3000

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions, please open an issue on the project repository. 