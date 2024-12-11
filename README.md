## Setup

### Prerequisties

Make sure you have the following installed :

- **Docker** : [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** : [Install Docker Compose](https://docs.docker.com/compose/install/)


1. Clone the repository

```bash
git clone https://github.com/Rushhaabhhh/Hyperswitch-Leaderboard.git
cd Hyperswitch-Leaderboard
```

2. Build and Start the Containers

```bash
docker-compose up --build
```

3. Access the Application
After the containers are up, you can access the following : 

- Frontend (React App): http://localhost:5173
- Backend (API): http://localhost:5000
- Redis: localhost:6379 (Note: Redis doesn't have a frontend interface, but it runs as a service for the backend.) 

4. Stopping the containers 

```bash
docker-compose down
```