A leaderboard system designed to incentivize and recognize top external contributors by tracking and displaying their contributions. This application integrates seamlessly with GitHub and Airtable to automate contribution tracking, enable real-time point assignment, and provide customizable filtering options for administrators and users.

---

## Table of Contents

1. [Tech Stack](https://www.notion.so/Hyperswitch-Leaderboard-System-15a003e596a68036a1b0c79f2b59f4dd?pvs=21)
2. [Features](https://www.notion.so/Hyperswitch-Leaderboard-System-15a003e596a68036a1b0c79f2b59f4dd?pvs=21)
3. [Installation / Setup](https://www.notion.so/Hyperswitch-Leaderboard-System-15a003e596a68036a1b0c79f2b59f4dd?pvs=21)
4. [Running the Application](https://www.notion.so/Hyperswitch-Leaderboard-System-15a003e596a68036a1b0c79f2b59f4dd?pvs=21)
5. [Environment Setup](https://www.notion.so/Hyperswitch-Leaderboard-System-15a003e596a68036a1b0c79f2b59f4dd?pvs=21)
6. [Project Architecture](https://www.notion.so/Hyperswitch-Leaderboard-System-15a003e596a68036a1b0c79f2b59f4dd?pvs=21)
7. [API Documentation](https://www.notion.so/Hyperswitch-Leaderboard-System-15a003e596a68036a1b0c79f2b59f4dd?pvs=21)
8. [Database in Airtable](https://www.notion.so/Hyperswitch-Leaderboard-System-15a003e596a68036a1b0c79f2b59f4dd?pvs=21)
9. [Potential Issues and Fixes](https://www.notion.so/Hyperswitch-Leaderboard-System-15a003e596a68036a1b0c79f2b59f4dd?pvs=21)
10. [Contribution Guidelines](https://www.notion.so/Hyperswitch-Leaderboard-System-15a003e596a68036a1b0c79f2b59f4dd?pvs=21)

---

# 1. Tech Stack

- **Frontend** : React.js , Tailwind CSS
- **Backend** : Node.js, Express.js
- **Database** : Redis, Airtable
- **Tools** : Docker
- **APIs** : GitHub API

---

# 2. Features

- **Automated Contribution Tracking**: Automatically fetches contributions from GitHub repositories.
- **Real-Time Updates**: Scores dynamically update based on user activity.
- **Customizable Filters**: Admins can filter results by date, user type, or repositories.
- **User Profiles**: Displays individual contributor statistics.
- **Admin Panel**: Enables role management, manual point adjustments, and comprehensive filtering.

# 3. Installation / Setup

### Prerequisites

Make sure you have the following installed :

- Node.js (v14 or higher)
- npm or yarn
- Redis installed locally or accessible remotely
- Airtable acount with API access
- Github Personal Access Token
- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)

## Steps

### 1. Clone the repository :

```
git clone https://github.com/Rushhaabhhh/Hyperswitch-Leaderboard.git
cd Hyperswitch-Leaderboard
```

### 2. Build and start the containers :

```
docker-compose up --build
```

### 3. Run the application :

- **Frontend (React App)** : [http://localhost:5173](http://localhost:5173/)
    
    ```jsx
    cd Frontend
    npm run dev
    ```
    
- **Backend (API)** : [http://localhost:5000](http://localhost:5000/)
    
    ```jsx
    cd Backend
    node index.js
    ```
    
- **Redis** : localhost:6379 (Note : Redis doesn't have a frontend interface, but it runs as a service for the backend.)
    
    ```jsx
    redis-server
    ```
    

### 4. Stop the containers :

```
docker-compose down
```

---

# 5. Environment Setup

## Backend

Details of environment variables and their purpose :

| **Variable Name** | **Description** | **Example Value** |
| --- | --- | --- |
| `PORT` | Port on which the backend runs | `5000` |
| `REDIS_URL` | URL for connecting to the Redis instance | `redis://localhost:6379` |
| `AIRTABLE_API_KEY` | API key for Airtable | `your_airtable_api_key` |
| `AIRTABLE_BASE_ID` | Base ID for Airtable | `your_airtable_base_id` |
| `AIRTABLE_CONTRIBUTORS_TABLE` | Airtable table name for contributors | `your_contributors_table` |
| `AIRTABLE_LEADERBOARD_TABLE` | Airtable table name for leaderboard | `your_leaderboard_table` |
| `GITHUB_TOKEN` | GitHub API token for authentication | `your_github_token` |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | `your_github_client_id` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | `your_github_client_secret` |
| `GITHUB_CALLBACK_URL` | GitHub OAuth callback URL | `your_github_callback_url` |
| `GITHUB_ACCESS_TOKEN` | GitHub access token | `your_github_access_token` |
| `SESSION_SECRET` | Secret key for session management | `your_session_secret` |
| `REDIS_HOST` | Redis server hostname | `your_redis_host` |
| `REDIS_PORT` | Redis server port | `your_redis_port` |
| `REDIS_PASSWORD` | Password for Redis | `your_redis_password` |

## Frontend

Details of environment variables and their purpose :

| **Variable Name** | **Description** | **Example Value** |
| --- | --- | --- |
| `REACT_APP_API_BASE_URL` | Base URL for the API | `http://localhost:5000` |
| `REACT_APP_OWNER` | GitHub repository owner | `your_github_owner` |
| `REACT_APP_REPO` | GitHub repository name | `your_github_repo` |

---

# 6. Project Architecture

### Backend

```
├── config
│   ├── airtableConfig.js
│   ├── PassportConfig.js
├── Controllers
│   ├── LeaderboardController.js
│   ├── UserController.js
├── Routes
│   ├── LeaderboardRoute.js
│   ├── UserRoute.js
├── .env
├── index.js
```

### Frontend

```
├── src
│   ├── assets
│   ├── Components
│   │   ├── AdminManagementModal.jsx
│   │   ├── AdminNavbar.jsx
│   │   ├── DateRangePicker.jsx
│   │   ├── Footer.jsx
│   │   ├── Leaderboard.jsx
│   │   ├── LoginModal.jsx
│   │   ├── PointsUpdateModal.jsx
│   ├── Pages
│   │   ├── AdminPage.jsx
│   │   ├── LandingPage.jsx
│   │   ├── SuperAdminPage.jsx
│   │   ├── UserPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
├── .env
```

### Other Files

```
├── License.txt
├── docker-compose.yaml
```

---

### Key Modules

### Backend

- **`config`**
    - Contains configuration files for essential integrations and services.
        - `airtableConfig.js`: Manages Airtable API integration for fetching and updating data.
        - `PassportConfig.js`: Handles authentication using GitHub OAuth.
- **Controllers**
    - Business logic for different application features.
        - `LeaderboardController.js`:
            - Manages leaderboard operations, such as retrieving, updating, and filtering contributor data.
        - `UserController.js`:
            - **`githubLogin`**: This function initiates the GitHub login process by redirecting the user to GitHub's authentication page with the necessary permissions to access the user's email and profile.
            - **`githubCallback`**: This function handles the callback from GitHub after the user authenticates. It processes the user's profile data, checks if the user already exists in Airtable, updates or creates the user record, and then redirects the user to the appropriate page based on their role (admin, super-admin, or user).
            - **`getUserProfile`**: This function retrieves and returns the profile data of the authenticated user, excluding sensitive fields like GithubId, and ensures the user is authenticated before returning the profile.
            - **`logout`**: This function logs out the user by clearing the session and removing the authentication cookies, ensuring the user is logged out successfully.
            - **`updateProfile`**: This function allows the authenticated user to update their profile, including fields like username, rank, total points, and profile link. It performs validation on the fields and updates the user record in Airtable.
            - **`getAdmins`**: This function fetches and returns a list of all users who have the 'admin' role in the system, querying Airtable for the records that match this role.
            - **`assignAdminRole`**: This function allows a super-admin to assign the 'admin' role to a user by creating a new record in Airtable with the role set to 'admin' and linking the user's GitHub profile.
            - **`removeAdminRole`**: This function allows a super-admin to remove the 'admin' role from a user by updating the user's record in Airtable and setting their role to 'user'.
- **Routes**
    - Defines API endpoints for the backend.
        - `LeaderboardRoute.js`:
            - Exposes routes for leaderboard operations like fetching top contributors and updating scores.
        - `UserRoute.js`:
            - **`/github`**: This route triggers the GitHub login process by invoking the `githubLogin` function from the `UserController`, redirecting the user to GitHub's authentication page.
            - **`/github/callback`**: This route handles the callback from GitHub after authentication. It invokes the `githubCallback` function from the `UserController`, processes the user's profile data, and redirects the user based on their role.
            - **`/logout`**: This route logs out the authenticated user by calling the `logout` function from the `UserController`, which clears the session and authentication cookies.
            - **`/profile` (GET)**: This route fetches the profile data of the authenticated user by calling the `getUserProfile` function from the `UserController`. It returns the user's profile information in the response.
            - **`/profile` (PUT)**: This route allows the authenticated user to update their profile. It invokes the `updateProfile` function from the `UserController`, which updates the user's profile data in Airtable.
            - **`/get-admin`**: This route retrieves a list of users who have the 'admin' role. It calls the `getAdmins` function from the `UserController` and returns the admin users in the response.
            - **`/assign-admin`**: This route assigns the 'admin' role to a user. It triggers the `assignAdminRole` function from the `UserController`, allowing a super-admin to grant the admin role to a user.
            - **`/remove-admin`**: This route removes the 'admin' role from a user. It invokes the `removeAdminRole` function from the `UserController`, allowing a super-admin to revoke the admin role from a user.
- **Redis**
    - Provides a caching layer to improve performance by storing frequently accessed data like leaderboard scores and user sessions.

### Frontend

### **Component :** Reusable UI elements

- **`AdminManagementModal.jsx`** : A modal component that allows adding a new admin by inputting a GitHub username present in the super-admin page.
    - **`isOpen`**: Determines if the modal should be visible. If `false`, the modal is hidden.
    - **`onClose`**: A function to close the modal, triggered by the "Cancel" button.
    - **`onAddAdmin`**: A function that gets called when the "Add Admin" button is clicked, sending the entered username to the parent component.
    - The modal contains :
        - A text input field to enter the GitHub username.
        - A "Cancel" button to close the modal without making changes.
        - An "Add Admin" button that sends the username to the parent component and then closes the modal.
- `DateRangePicker.jsx` : A query component to select any start date and end date to filter the contributors’ table.
    - **State**:
        - `currentMonth`: Tracks the displayed month.
        - `selectedStart` and `selectedEnd`: Store confirmed dates.
        - `tempStart` and `tempEnd`: Hold temporary selected dates.
    - **Month Navigation**:
        - Functions `nextMonth` and `prevMonth` allow navigating between months.
    - **Date Selection**:
        - Clicking a date sets `tempStart` or `tempEnd`, highlighting the selected range.
    - **Range Feedback**:
        - Displays selected dates and a confirmation button when both start and end dates are selected.
    - **Helper Functions**:
        - `getDaysInMonth`: Gets the number of days in the current month.
        - `getFirstDayOfMonth`: Determines the weekday of the first day.
        - `isDateInRange`: Checks if a date is within the selected range.
        - `isStartOrEnd`: Checks if a date is the start or end of the range.
    - **Actions**:
        - `confirmRange`: Finalizes the selection and triggers `onConfirm`.
        - `clearSelection`: Resets the selected dates.
- **`LoginModal.jsx`** : A modal component for logging in using GitHub authentication.
    - **`isOpen`**: Determines if the modal should be visible. If `false`, the modal is hidden.
    - **`onClose`**: A function to close the modal, triggered by the "Close" button (icon).
    - **`handleGitHubLogin`**: A function that redirects the user to the GitHub authentication endpoint (`/auth/github`).
- `Leaderboard.jsx`: This component displays a leaderboard of contributors, allowing users to filter, search, sort, and view detailed contributions.
    - **State Variables**
        - `contributors`: List of all contributors fetched from the backend.
        - `filteredContributors`: A filtered version of `contributors` based on search input.
        - `isLoading`: Boolean to manage loading state.
        - `errorMessage`: Stores error messages, if any.
        - `searchText`: Holds the search query for filtering contributors.
        - `sortOrder`: Manages sorting order, either by points in ascending or descending order.
        - `dateRange`: Stores the selected date range for filtering contributions.
        - `expandedContributor`: Tracks the contributor whose details are expanded.
        - `isCalendarVisible`: Boolean for showing or hiding the date range picker.
    - **API Call (fetchContributors)**
        - **Trigger**: On component load (`useEffect`), and when date range or sort order changes.
        - **Response**: Fetches leaderboard data from the backend API based on the selected `dateRange` and `sortOrder`.
    - **Sorting :** Sorts contributors by points, toggling between `points_desc` (highest points) and `points_asc` (lowest points).
    - **Search :** Flters the contributors list based on `searchText`.
    - **Date Range Picker :** Allows users to select a custom date range using the `DateRangePicker` component. This updates the leaderboard data accordingly.

### Pages : The main views of the application

- `AdminPage.jsx` : An admin dashboard for managing contributors with features like sorting, searching, and updating points.
    - **State Variables**
        - **`isLoading`**: Loading state for fetching data.
        - **`showModal`**: Controls modal visibility for updating points.
        - **`searchQuery`**: Filters contributors by username.
        - **`fetchError`**: Displays any fetch errors.
        - **`contributors`**: List of contributors.
        - **`sortMethod`**: Sorting order for the leaderboard (`points_desc` or `points_asc`).
    - **Functions**
        - **`fetchContributorData`**: Fetches sorted contributor data.
        - **`handleRemoveContributor`**: Removes a contributor.
        - **`handlePointsUpdate`**: Updates a contributor's points.
    - **UI Features**
        - **Search Bar**: Filters contributors by username.
        - **Sorting**: Toggle between highest/lowest points.
        - **Table**: Displays contributor info (username, points, contributions, actions).
        - **Points Update Modal**: For updating points
    - `LandingPage.jsx`: A homepage that features a navigation bar, hero section, features, contributor stats, leaderboard, and footer, with animations powered by GSAP and Framer Motion.
    - **State and Refs**
        - **`isModalOpen`**: Controls modal visibility for login.
        - **`featuresRef`**: Reference for the Features section.
        - **`contributorsRef`**: Reference for Contributor Stats section.
    - **Sections**
        1. **Navbar** : Navigation bar with links and login button.
        2. **HeroSection** : A hero section with background image, heading, and rotating GitHub icon.
        3. **FeaturesSection**: Displays features with animations on scroll.
        4. **ContributorStatsSection**: Displays contributor stats with animations on scroll.
        5. **LeaderboardSection**: Displays a leaderboard.
        6. **FooterSection**: Contains contact info and links to email and GitHub.
    - `UserPage.jsx`: This component displays a user profile page with GitHub statistics, contribution details, and an editable username feature.
        - State Variables:
            - **`user`**: Stores user data (username, email, profile image, GitHub data).
            - **`backgroundImage`**: Stores and manages the background image for the profile.
            - **`isEditingName`**: Boolean that determines if the username is being edited.
            - **`newUsername`**: Holds the updated username input value.
            - **`isNameHovered`**: Boolean for hover state to show the pencil icon.
            - **`sortOrder`**: Controls the sorting order of contributions (newest or oldest).
            - **`selectedType`**: Filters contributions by type (e.g., Documentation, Bug Fixes, Features).
        - Effect Hooks:
            - **`useEffect`**: Updates the `newUsername` whenever the `user` data changes.
        - Functions:
            - **`handleBackgroundImageUpload`**: Handles the background image file upload, saving it to `localStorage`.
            - **`handleUsernameChange`**: Updates the username and toggles editing mode.
            - **`getStatusColor`**: Returns a color class based on the status of a contribution.
            - **`filteredContributions`**: Filters and sorts contributions based on type and sort order.
        - Sections:
            - **Navbar**: A fixed navigation bar at the top with the logo.
            - **Profile Background & Avatar**: Displays the user's background image and profile avatar. Username is editable with a pencil icon on hover.
            - **GitHub Stats**: Displays the number of public repos, followers, and following.
            - **Contributions**: Displays a list of contributions, sortable by date and filterable by type. Each contribution shows status, points, and labels.
    
    ### `App.jsx` :
    
    - This code sets up routing for a React application using React Router.
    - **`/`** (LandingPage)
        - **Description :** Renders the landing page.
        - **URL :** http://localhost:5173/
    - **`/user`** (UserPage)
        - **Description :** Renders the user dashboard.
        - **URL :** http://localhost:5173/user
    - **`/admin`** (AdminPage)
        - **Description :** Renders the admin page for management tasks.
        - **URL :** http://localhost:5173/admin
    - **`/super-admin`** (SuperAdminPage)
        - **Description :** Renders the super admin page for advanced settings.
        - **URL :** http://localhost:5173/super-admin
    

---

# 7. API Documentation

### Leaderboard Endpoints

- **Fetch and Store Repository Data**
    - **Method** : `GET`
    - **URL** : `/leaderboard/:owner/:repo/:userType`
    - **Request Parameters** :
        - `owner` : Owner of the GitHub repository.
        - `repo` : Name of the GitHub repository.
        - `userType` : Type of user (e.g., "contributor", "admin").
    - **Request Queries :**
        - **`startDate`** : Filters the data to include only records starting from this date.
        - **`endDate`** : Filters the data to include only records up to this date.
        - **`sort`** : Sorts the data based on points in descending order with `points_desc` or ascending order with `points_asc` .
    - **Response Format** :
        
        ```
        
        ```
        
- **Update User Type**
    - **Method** : `PATCH`
    - **URL** : `/leaderboard/users/:username`
    - **Request Parameters** :
        - `username`  : GitHub username of the user.
    - **Request Body** :
        
        ```
        {
          "userType": "newUserType"
        }
        ```
        
    - **Response Format**:
        
        ```
        {
          "success": true,
          "message": "User type updated successfully."
        }
        ```
        
- **Update User Points**
    - **Method** : `PATCH`
    - **URL** : `/leaderboard/points/:username`
    - **Request Parameters** :
        - `username` : GitHub username of the user.
    - **Request Body** :
        
        ```
        {
          "points": 50
        }
        ```
        
    - **Response Format** :
        
        ```
        {
          "success": true,
          "message": "User points updated successfully."
        }
        ```
        

### User Endpoints

- **GitHub Login**
    - **Method** : `GET`
    - **URL** : `/user/github`
    - **Response Format** :
    Redirects to GitHub for user authentication.
- **GitHub Callback**
    - **Method** : `GET`
    - **URL** : `/user/github/callback`
    - **Response Format** :
        
        ```
        
        ```
        
- **Logout**
    - **Method** : `POST`
    - **URL** : `/user/logout`
    - **Response Format** :
        
        ```
        {
          "message": "Logged out successfully."
        }
        ```
        
- **Get User Profile**
    - **Method**: `GET`
    - **URL**: `/user/profile`
    - **Response Format**:
        
        ```
        
        ```
        
- **Update User Profile**
    - **Method**: `PUT`
    - **URL**: `/user/profile`
    - **Request Body**:
        
        ```
        
        ```
        
    - **Response Format**:
        
        ```
        
        ```
        

### Admin Management Endpoints

- **Get Admins**
    - **Method**: `GET`
    - **URL**: `/auth/get-admin`
    - **Response Format**:
        
        ```
        [
            {
                "_table": {
                    "_base": {
                        "_airtable": {},
                        "_id": "appoSaXMstnOzrTQY"
                    },
                    "id": null,
                    "name": "Contributors"
                },
                "id": "rec8tlkT9WF1I1zbl",
                "_rawJson": {
                    "id": "rec8tlkT9WF1I1zbl",
                    "createdTime": "2024-11-15T12:42:03.000Z",
                    "fields": {
                        "Username": "DummyAdmin",
                        "ProfileLink": "https://github.com/DummyAdmin",
                        "Role": "admin"
                    }
                }
            }
        ]        
        ```
        
- **Assign Admin Role**
    - **Method**: `POST`
    - **URL**: `/auth/assign-admin`
    - **Request Body**:
        
        ```
        {
            "username" : "user123"   
        }
        ```
        
    - **Response Format**:
        
        ```
        {
            "message": "Admin assigned successfully",
        }
        ```
        
- **Remove Admin Role**
    - **Method**: `DELETE`
    - **URL**: `/auth/remove-admin`
    - **Request Body**:
        
        ```
        {
          "username: "user123"
        }
        ```
        
    - **Response Format**:
        
        ```
        {
          "success": true,
          "message": "Admin role removed successfully."
        }
        ```
        

# 8. Database in Airtable

### **1. Contributors Table**

- **GithubId**: Unique identifier for the contributor's GitHub account.
- **Username**: The username of the contributor.
- **Profile Link**: URL link to the contributor's GitHub profile.
- **Role**: Role of the contributor (e.g., "Admin," "Contributor").

### **2. Leaderboard Table**

- **Username**: The username of the user.
- **UserType**: The type of user (e.g., "Contributor," "Admin").
- **ContributionType**: Type of contribution (e.g., "Code," "Documentation").
- **ContributionID**: Unique identifier for the contribution.
- **Points**: Points awarded for the contribution.
- **Date**: Date of the contribution (formatted as `YYYY-MM-DD`).
- **Description**: Detailed description of the contribution.
- **PointsHistory**: Historical record of points changes for the user.

# 9. Potential Issues and Fixes