# CruiseControl

CruiseControl is a web application designed to manage a bar crawl event on a cruise. Users can sign up, log in, and track their progress through various bars and secondary goals. Admins have additional functionalities to manage users and progress the bar crawl.

## Features

- User Signup and Login
- Track visited bars and points
- Assign and complete secondary goals
- Admin functionalities to manage users and progress the bar crawl

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/roshan-c/cruisecontrol.git
    cd cruisecontrol
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Start the server:
    ```sh
    npm start
    ```

4. Open your browser and navigate to `http://localhost:3000`.

## Usage

### User Signup

1. Navigate to the Signup page (`/signup.html`).
2. Fill in the required fields and submit the form.
3. You will be redirected to the Login page upon successful signup.

### User Login

1. Navigate to the Login page (`/login.html`).
2. Fill in your username and password and submit the form.
3. You will be redirected to the Home page upon successful login.

### Home Page

- View the current and next bars.
- Mark the current bar as visited.
- View and complete secondary goals.
- Admins can access the Admin Panel and progress to the next bar.

### Admin Panel

- View and manage all users.
- Edit user points.
- Progress to the next bar.

## API Endpoints

### User Routes

- `POST /signup`: Signup a new user.
- `POST /login`: Login an existing user.
- `POST /logout`: Logout the current user.
- `GET /home`: Get the home page data for the logged-in user.
- `POST /updateBar`: Update the current bar status for the logged-in user.
- `POST /completeGoal`: Complete the current goal for the logged-in user.

### Admin Routes

- `GET /admin/users`: Get all users (Admin only).
- `POST /admin/updatePoints`: Update user points (Admin only).
- `POST /admin/progressBar`: Progress to the next bar (Admin only).

## License

This project is licensed under the MIT License.
