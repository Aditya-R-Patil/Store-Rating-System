\# Store Rating System



A Full Stack Web Application built using \*\*React.js, Node.js, Express.js, and MySQL\*\* that allows users to explore stores, submit ratings, and manage store-related activities through role-based dashboards.



\## Project Overview



The Store Rating System provides a centralized platform where users can discover stores, view store information, and share their experiences through ratings.



The application supports three different roles:



\- \*\*System Administrator:\*\* Manages users, stores, and the overall platform.

\- \*\*Normal User:\*\* Browses stores, views store details, and submits or updates ratings.

\- \*\*Store Owner:\*\* Monitors store performance and views customer ratings.



\## Key Features



\### 1. System Administrator



\- Dashboard with overall platform statistics.

\- Add, view, and manage users.

\- Add and manage stores.

\- Assign store owners to stores.

\- Search and filter users and stores.

\- Sort records in ascending and descending order.

\- View detailed user information.

\- View store owner information and rating details.

\- Delete users.



\### 2. Normal User



\- User registration and login.

\- Browse available stores.

\- Search stores.

\- View complete store details.

\- View overall store ratings.

\- Submit ratings from 1 to 5 stars.

\- Update previously submitted ratings.

\- View personal ratings.

\- Change password.



\### 3. Store Owner



\- Owner dashboard.

\- View assigned stores.

\- View average store ratings.

\- View total ratings.

\- View customers who rated their stores.

\- View customer rating details.

\- Change password.



\## Technology Stack



\### Frontend

\- React.js

\- Vite

\- JavaScript (JSX)

\- Tailwind CSS

\- Axios

\- React Router DOM

\- Framer Motion

\- Lucide React

\- React Toastify



\### Backend

\- Node.js

\- Express.js

\- JavaScript

\- MySQL2

\- JSON Web Token (JWT)

\- Bcrypt

\- Express Validator

\- Multer



\### Database

\- MySQL



\### Development Tools

\- Visual Studio Code

\- Git

\- GitHub

\- MySQL Workbench

\- Postman



\## Project Structure



```text

Store-Rating-System/

│

├── backend/

│   ├── config/

│   ├── controllers/

│   ├── middleware/

│   ├── models/

│   ├── routes/

│   ├── uploads/

│   ├── .env

│   ├── package.json

│   └── server.js

│

├── frontend/

│   ├── public/

│   ├── src/

│   │   ├── assets/

│   │   ├── components/

│   │   ├── constants/

│   │   ├── pages/

│   │   │   ├── admin/

│   │   │   ├── owner/

│   │   │   └── user/

│   │   ├── services/

│   │   ├── App.jsx

│   │   └── main.jsx

│   ├── package.json

│   └── index.html

│

├── database/

│   └── database.sql

│

├── .gitignore

└── README.md

```



\## Installation and Setup



Follow these steps to run the project on your local machine.



\### Prerequisites



Install the following software before starting:



\- Node.js and npm

\- MySQL Server

\- MySQL Workbench (recommended)

\- Git



\### Step 1: Clone the Repository



Open PowerShell or Terminal and execute:



```bash

git clone https://github.com/Aditya-R-Patil/Store-Rating-System.git

```



Navigate to the project directory:



```bash

cd Store-Rating-System

```



\### Step 2: Database Setup



1\. Start your MySQL Server.

2\. Open MySQL Workbench.

3\. Connect to your local MySQL server.

4\. Open the `database/database.sql` file from the cloned project.

5\. Execute the complete SQL script.



The script creates the database:



```sql

store\_rating\_system

```



It also creates the following tables:



| Table | Description |

|---|---|

| users | Stores user accounts and roles |

| stores | Stores store information and owner assignments |

| ratings | Stores user ratings for stores |



The database includes foreign key relationships and constraints to maintain data integrity.



\### Step 3: Backend Setup



Open a terminal in the project directory and navigate to the backend:



```bash

cd backend

```



Install backend dependencies:



```bash

npm install

```



Create a `.env` file inside the `backend` folder.



Configure your local database credentials:



```env

PORT=5000

DB\_HOST=localhost

DB\_USER=root

DB\_PASSWORD=your\_mysql\_password

DB\_NAME=store\_rating\_system

JWT\_SECRET=your\_secret\_key

```



Replace the example values with your own MySQL password and a secure JWT secret.



Start the backend server:



```bash

npm run dev

```



Backend URL:



`http://localhost:5000`



\### Step 4: Frontend Setup



Open a \*\*new terminal\*\* and navigate to the frontend folder from the project root:



```bash

cd frontend

```



Install frontend dependencies:



```bash

npm install

```



Start the frontend development server:



```bash

npm run dev

```



Frontend URL:



`http://localhost:5173`



\### Step 5: Access the Application



Open your browser and visit:



`http://localhost:5173`



The Login page will appear.



\### Step 6: Create the First Administrator



The first administrator account must be created manually.



1\. Open the application.

2\. Register a new Normal User account.

3\. Open MySQL Workbench.

4\. Execute the following query using the email registered in the application:



```sql

USE store\_rating\_system;



UPDATE users

SET role = 'admin'

WHERE email = 'your-admin-email@example.com';

```



5\. Log in using that account again.



The account will now have Administrator access.



After the first administrator is created, additional users and Store Owner accounts can be managed through the Admin Dashboard.



\## Application URLs



| Service | URL |

|---|---|

| Frontend | http://localhost:5173 |

| Backend | http://localhost:5000 |

| API Base URL | http://localhost:5000/api |



\## API Modules



The backend provides the following API modules:



| Module | Base Endpoint |

|---|---|

| Authentication | `/api/auth` |

| Administrator | `/api/admin` |

| Store Management | `/api/admin/stores` |

| Normal User | `/api/user` |

| Store Owner | `/api/owner` |

| Ratings | `/api/ratings` |



Protected routes use JWT authentication and role-based authorization.



\## Database Design



The application uses three main relational database tables:



\*\*Users\*\*

\- Stores user details, email, password hash, address, and role.

\- Supports Admin, Normal User, and Store Owner roles.



\*\*Stores\*\*

\- Stores store details, contact information, category, description, and image path.

\- Each store can be assigned to a Store Owner.



\*\*Ratings\*\*

\- Stores ratings submitted by Normal Users.

\- Each user can submit one rating per store and update it later.

\- Rating values are restricted to 1–5.



\## Security and Validation



\- JWT-based authentication.

\- Role-based access control.

\- Password hashing using Bcrypt.

\- Request validation using Express Validator.

\- Protected backend routes.

\- Environment variables for sensitive configuration.

\- Store image upload validation.

\- Unique user email addresses.

\- One rating per user per store.



\## Important Notes



\- Both frontend and backend servers must run simultaneously.

\- MySQL Server must be running before starting the backend.

\- The backend `.env` file must be configured before starting the server.

\- Import the database SQL script before using the application.

\- Never upload `.env` files or expose database credentials.

\- The `backend/uploads` directory contains store images used by the application.



\## Author



\*\*Aditya Patil\*\*



MCA Student | Full Stack Developer



GitHub: \[Aditya-R-Patil](https://github.com/Aditya-R-Patil)



\## Repository



\[Store Rating System – GitHub](https://github.com/Aditya-R-Patil/Store-Rating-System)



\---



\*\*Thank you for exploring the Store Rating System!\*\*

