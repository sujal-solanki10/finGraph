# FinGraph

FinGraph is a full-stack web application designed for stock market research, portfolio management, and advanced risk analysis.

## Project Structure

This repository is organized into two main directories:
- `FinGraph/`: The Spring Boot backend service.
- `frontend/`: The React + Vite frontend application.

## Features

- **Authentication**: Secure registration and login using JWT and Google OAuth2.
- **User Profiles**: Manage optional user details separately from financial data.
- **Market Data Integration**: Connects to the AlphaVantage API to retrieve historical prices and stock information, caching data in MySQL to optimize performance.
- **Research & Discovery**: Search for stocks without owning them, view current prices, historical trends, and explore top gainers/losers. 

## Tech Stack

### Backend (`/FinGraph`)
- **Framework**: Java, Spring Boot
- **Security**: Spring Security (JWT, OAuth2)
- **Database**: MySQL, Spring Data JPA
- **Market Data API**: AlphaVantage

### Frontend (`/frontend`)
- **Framework**: React, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- **Java 17+**
- **Node.js 18+**
- **MySQL Database**
- **AlphaVantage API Key**
- **Google OAuth Credentials** (Optional, for Google Login)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd FinGraph
   ```
2. Update your database configuration and API keys in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/fingraph_db
   spring.datasource.username=root
   spring.datasource.password=your_password
   
   # Add your API keys and secrets
   alphavantage.api.key=YOUR_API_KEY
   spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
   spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
   jwt.secret=YOUR_JWT_SECRET
   ```
3. Run the backend:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder with your backend URL:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Roadmap / Next Steps
- Implement side-by-side stock comparison functionality.
- Integrate FinGraph community relationship metrics into the research view.
- Complete the portfolio and holdings dashboard.
