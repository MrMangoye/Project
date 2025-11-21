Family Tree & Business Directory Application
Overview
This project is a full-stack web application designed to help users create and manage family trees while also maintaining a searchable directory of family members’ businesses. It combines a React frontend with an Express/MongoDB backend to deliver a secure, interactive, and user-friendly experience.

Features
User Authentication
- Secure registration and login with hashed passwords.
- JWT-based authentication for protected routes.
- Profile management with sensitive data excluded from responses.
Family Tree Management
- Create a new family linked to a user account.
- Add members with personal details such as name, date of birth, gender, and occupation.
- Define relationships including parents, children, siblings, and spouses.
- Automatically update related members when new relationships are added.
- Visualize the family structure using an interactive tree view powered by react-d3-tree.
Business Directory
- Add business information for family members including name, industry, and contact details.
- Search and filter businesses by name or industry.
- Provides a quick overview of entrepreneurial activities within the family.
Dashboard
- Central hub for managing the family tree.
- Includes components for adding members, viewing the tree, and browsing the business directory.
Backend API
- RESTful endpoints for user registration and login.
- Endpoints for creating, updating, and deleting families and members.
- Endpoints for fetching families and members with populated relationships.
- Middleware for authentication and error handling.

Tech Stack
Frontend
- React (functional components and hooks)
- react-router-dom (navigation)
- react-d3-tree (tree visualization)
- Axios (API communication)
Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- CORS and Helmet for security

Getting Started
Prerequisites
- Node.js (v16 or higher recommended)
- MongoDB (local installation or cloud service such as MongoDB Atlas)
Installation
- Clone the repository:
git clone https://github.com/your-repo/family-tree-app.git
cd family-tree-app
- Install dependencies:
npm install
- Set up environment variables in a .env file:
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key
PORT=5000
- Start the backend:
npm run server
- Start the frontend:
npm start



Project Structure
/client        # React frontend
  /components  # UI components (AddMember, TreeView, BusinessDirectory, etc.)
  /pages       # Pages (Dashboard, Login, Register)
  /services    # Axios API setup

/server        # Express backend
  /models      # Mongoose schemas (User, Family, Person)
  /routes      # Auth and Family routes
  /middleware  # Authentication middleware
  app.js       # Express app setup
  server.js    # MongoDB connection and server start



Future Enhancements
- Role-based permissions (e.g., admin vs member).
- File uploads for profile pictures or business logos.
- Advanced search and filtering in the business directory.
- Export family tree as PDF or image.
- Improved mobile responsiveness.

Contributing
Contributions are welcome. To contribute:
- Fork the repository
- Create a feature branch
- Submit a pull request

License
This project is licensed under the MIT License.
