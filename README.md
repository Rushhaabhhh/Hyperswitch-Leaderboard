# Hyperswitch Leaderboard System 🏆

## Overview

The Hyperswitch Leaderboard System is an advanced platform designed to recognize and incentivize external contributors by tracking their GitHub contributions in real-time. This dynamic system automates contribution tracking, assigns points, and provides comprehensive insights into community engagement.

## 🚀 Key Features

- **Automated GitHub Contribution Tracking**
- **Real-Time Leaderboard Updates**
- **Customizable Contributor Filtering**
- **Detailed User Profiles**
- **Admin Management Dashboard**

## 💻 Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: Redis, Airtable
- **Authentication**: GitHub OAuth
- **Containerization**: Docker

## 🗂️ Project Architecture

```
Hyperswitch-Leaderboard/
│
├── Frontend/
│   ├── src/
│   │   ├── Components/
│   │   ├── Pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│
├── Backend/
│   ├── config/
│   │   ├── airtableConfig.js
│   │   └── PassportConfig.js
│   ├── Controllers/
│   │   ├── LeaderboardController.js
│   │   └── UserController.js
│   ├── Routes/
│   │   ├── LeaderboardRoute.js
│   │   └── UserRoute.js
│   └── index.js
│
└── docker-compose.yaml
```

## 🔧 Quick Setup

### Prerequisites

- Node.js (v14+)
- Docker & Docker Compose
- GitHub Personal Access Token
- Airtable Account

### Installation Steps

1. Clone the repository
```bash
git clone https://github.com/Rushhaabhhh/Hyperswitch-Leaderboard.git
cd Hyperswitch-Leaderboard
```

2. Build and start containers
```bash
docker-compose up --build
```

3. Run the application
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## 🔒 Environment Configuration

### Backend Environment Variables

Create a `.env` file in the Backend directory with the following variables:

```env
PORT=5000
REDIS_URL=redis://localhost:6379
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
GITHUB_TOKEN=your_github_token
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
SESSION_SECRET=your_session_secret
```

### Frontend Environment Variables

Create a `.env` file in the Frontend directory:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_GITHUB_OWNER=your_github_owner
REACT_APP_GITHUB_REPO=your_github_repo
```

## 🌐 API Endpoints

### Leaderboard Endpoints

1. **Fetch Repository Data**
   - **GET** `/leaderboard/:owner/:repo/:userType`
   - Query Parameters: `startDate`, `endDate`, `sort`

2. **Update User Points**
   - **PATCH** `/leaderboard/points/:username`
   - Request Body: `{ "points": 50 }`

### User Endpoints

1. **GitHub Login**
   - **GET** `/user/github`

2. **Get User Profile**
   - **GET** `/user/profile`

3. **Update User Profile**
   - **PUT** `/user/profile`

### Admin Endpoints

1. **Get Admins**
   - **GET** `/auth/get-admin`

2. **Assign Admin Role**
   - **POST** `/auth/assign-admin`
   - Request Body: `{ "username": "user123" }`

3. **Remove Admin Role**
   - **DELETE** `/auth/remove-admin`
   - Request Body: `{ "username": "user123" }`

## 📊 Airtable Database Structure

### Contributors Table
- **GithubId**: Unique GitHub identifier
- **Username**: Contributor username
- **Profile Link**: GitHub profile URL
- **Role**: User role (Admin/Contributor)

### Leaderboard Table
- **Username**: User's username
- **UserType**: User type
- **ContributionType**: Contribution category
- **Points**: Awarded points
- **Date**: Contribution date
