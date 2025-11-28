Family Management Application
Overview
This project is a full-stack family management system that allows users to create, join, and manage family groups. It provides tools to add family members with detailed personal information, track relationships, and manage business details associated with family members. The application also includes a dashboard for viewing family data, a business directory, and a family tree visualization.
The purpose of this project is to make family history, relationships, and entrepreneurial activities easy to organize and accessible in one place.

Features
User Management
- Secure registration and login using JWT authentication.
- Passwords are hashed for security.
- Each user can either create a new family or join an existing one.
Family Management
- Create a new family with a name and description.
- Join an existing family using a family ID.
- Dashboard view of family details and members.
Member Management
- Add members with personal details such as name, date of birth, gender, and occupation.
- Define relationships including parents, spouses, siblings, and children.
- Add business information such as business name, industry, and contact details.
- Relationships are automatically updated bidirectionally (for example, adding a child updates parent and sibling links).
Business Directory
- Search and filter family members by their businesses or industries.
- Provides quick access to entrepreneurial information within the family.
Family Tree
- Visual representation of family hierarchy.
- Displays parent-child relationships in a tree structure.

Technology Stack
Frontend
- React.js with hooks (useState, useEffect)
- React Router for navigation
- Axios for API requests
- CSS Grid and card-based layouts for styling
Backend
- Node.js and Express.js for REST API
- MongoDB and Mongoose for data storage
- JWT authentication for secure access
- bcrypt.js for password hashing

Project Structure
Frontend
- src/pages/ contains pages such as Login, Register, Dashboard, JoinFamily, SetupFamily, and ChooseFamily.
- src/components/ contains reusable components such as AddMember, BusinessDirectory, MemberProfile, and TreeView.
- src/services/api.js defines the Axios instance with interceptors.
- src/App.jsx sets up routing.
Backend
- models/ contains Mongoose schemas for User, Family, and Person.
- routes/ contains Express routes for authentication, family, and member management.
- middleware/ contains JWT authentication middleware.
- server.js initializes the Express app and connects to MongoDB.

How It Works
- User Registration and Login
- Users create accounts and authenticate with JWT.
- After login, users can either create a new family or join an existing one.
- Family Setup
- A user can create a new family, becoming its founder.
- The family is stored in MongoDB and linked to the user.
- Adding Members
- Members are added via the dashboard.
- Relationships (parent, spouse, sibling, child) are automatically updated.
- Viewing Data
- The dashboard shows family details and members.
- The business directory allows searching by business or industry.
- The family tree visualizes parent-child relationships.

Security
- JWT-based authentication for all protected routes.
- Passwords hashed with bcrypt.
- Unauthorized requests are blocked and tokens are cleared.

Future Enhancements
- Support for multiple families per user.
- Advanced family tree visualization.
- Role-based permissions (for example, family admin).
- File uploads for member photos.
- Improved UI/UX with modern frameworks such as Material UI or TailwindCSS.

Summary
This project is a family relationship and business management system. It combines a React frontend with a Node.js/Express backend and MongoDB database to provide a secure, user-friendly way to manage family structures, member details, and entrepreneurial activities.
