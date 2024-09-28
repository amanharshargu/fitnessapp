# Fitness App

## Getting Started

These instructions will help you set up and run the project on your local machine.

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/amanharshargu/fitnessapp.git
   ```

2. Install dependencies:
   ```
   # Frontend (in one terminal)
   cd frontend
   npm install

   # Backend (in another terminal)
   cd backend
   npm install
   ```

3. Set up environment variables:
   - Copy `frontend/sample.env` to `frontend/.env`
   - Copy `backend/sample.env` to `backend/.env`
   - Update the values in both `.env` files as needed

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run start (npm run dev for nodemon)
   ```

2. In a new terminal, start the frontend:
   ```
   cd frontend
   npm run start
   ```

3. Open your browser and navigate to `http://localhost:3001`

## Scripts

- `npm run build`: Build the production-ready frontend
- `npm run deploy`: Deploy the application (customize this based on your deployment process)
- `npm run lint`: Run ESLint to check for code style issues
- `npm run test`: Run the test suite

## Contributing

Instructions for how to contribute to the project.

## License

This project is licensed under the [LICENSE NAME] - see the [LICENSE.md](LICENSE.md) file for details.