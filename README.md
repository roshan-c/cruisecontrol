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

## History/Backstory

The CruiseControl application was designed to manage a bar crawl event on a cruise. However, one of the challenges faced during the cruise is the lack of reliable Wi-Fi. The cruise staff are also strict about bringing devices like Raspberry Pi on board, as they can be used to circumvent the paywall behind the Wi-Fi.

To overcome this challenge, the idea was to host the site on an old Android phone using Termux. By setting up a personal hotspot on the phone, other devices can connect to it and access the site without needing the ship's Wi-Fi. This solution ensures that everyone can participate in the bar crawl event seamlessly.

## Hosting the Site on an Android Phone Using Termux

To host this site on an old Android phone using Termux and access it via a personal hotspot, follow these steps:

### Step 1: Set up Termux on your Android phone
1. Install Termux from the Google Play Store.
2. Open Termux and update the package list:
   ```sh
   pkg update
   ```

### Step 2: Install a web server on Termux
You can use `lighttpd` or the built-in Python HTTP server. Here are instructions for both:

**Using lighttpd**:
1. Install `lighttpd`:
   ```sh
   pkg install lighttpd
   ```
2. Configure `lighttpd` to serve your site. Create a configuration file (`lighttpd.conf`) if needed.

**Using Python HTTP server**:
1. Install Python (if not already installed):
   ```sh
   pkg install python
   ```
2. Navigate to the directory containing your site files:
   ```sh
   cd /path/to/your/site
   ```
3. Start the Python HTTP server:
   ```sh
   python3 -m http.server 8080
   ```

### Step 3: Start the web server
Start the web server using the chosen method. For example, if using the Python HTTP server:
```sh
python3 -m http.server 8080
```

### Step 4: Connect devices to the personal hotspot
1. Enable the personal hotspot on your Android phone.
2. Connect other devices (e.g., family members' phones, tablets) to the hotspot.

### Step 5: Access the site
1. Find the IP address assigned to your device (Android or iPhone) while it is hosting the personal hotspot. You can do this by connecting another device to the hotspot and checking the IP address assigned to the connected device. The IP address of the hosting device is typically the gateway address for the connected device. For example, on a connected device:
   - On Android: Go to Settings > Wi-Fi, tap on the connected network, and look for the gateway IP address.
   - On iPhone: Go to Settings > Wi-Fi, tap on the connected network, and look for the router IP address.
2. On the connected devices, open a web browser and enter the IP address followed by the port number. For example:
   ```
   http://192.168.43.1:8080
   ```

This should allow everyone connected to the personal hotspot to access the site hosted on your device.

## Hosting the Site on an iPhone

To host this site on an iPhone, you can use a web server app available on the App Store. Follow these steps:

### Step 1: Install a web server app
1. Download and install a web server app such as "Web Server for Chrome" or "KSWEB" from the App Store.

### Step 2: Configure the web server app
1. Open the web server app and configure it to serve your site files. This usually involves selecting the directory containing your site files and setting the port number (e.g., 8080).

### Step 3: Start the web server
1. Start the web server within the app.

### Step 4: Enable the personal hotspot
1. Go to Settings > Personal Hotspot on your iPhone and enable it.

### Step 5: Connect devices to the personal hotspot
1. Connect other devices (e.g., family members' phones, tablets) to the hotspot.

### Step 6: Access the site
1. Find the IP address assigned to your iPhone. You can do this by connecting another device to the hotspot and checking the IP address assigned to the connected device. The IP address of the hosting device is typically the gateway address for the connected device. For example, on a connected device:
   - On Android: Go to Settings > Wi-Fi, tap on the connected network, and look for the gateway IP address.
   - On iPhone: Go to Settings > Wi-Fi, tap on the connected network, and look for the router IP address.
2. On the connected devices, open a web browser and enter the IP address followed by the port number. For example:
   ```
   http://192.168.43.1:8080
   ```

This should allow everyone connected to the personal hotspot to access the site hosted on your device.

## License

This project is licensed under the MIT License.
