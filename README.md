# Liceo 8888 - Complaint Management System

A modern web application for Liceo de Cagayan University to manage and track complaints from students and the Liceo community.

## Features

- **Public Complaint Submission** - Students can submit complaints with optional anonymity
- **Reference Number Tracking** - Track complaint status using unique reference numbers
- **Admin Dashboard** - VP Admin can verify, approve, or reject complaints
- **Department Dashboard** - Department officers can manage and resolve assigned complaints
- **Audit Trail** - Complete history of all actions taken on complaints
- **File Attachments** - Support for uploading supporting documents

## Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL commands from `supabase-schema.sql` to create the database tables

### 3. Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket named `attachments`
3. Set it to **Public**

### 4. Create Users

1. Go to **Authentication** > **Users** in Supabase
2. Create an admin user (e.g., admin@liceo.edu.ph)
3. After creating, copy the user's UUID
4. Run the following SQL to set up the admin role:

```sql
INSERT INTO users (id, email, role, full_name)
VALUES ('YOUR_ADMIN_UUID', 'admin@liceo.edu.ph', 'admin', 'VP Admin');
```

5. For department users:

```sql
INSERT INTO users (id, email, role, department, full_name)
VALUES ('YOUR_DEPT_UUID', 'academic@liceo.edu.ph', 'department', 'academic', 'Academic Affairs Officer');
```

### 5. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## User Roles

| Role | Access |
|------|--------|
| **Public** | Submit complaints, track status |
| **Admin** | Verify complaints, assign to departments |
| **Department** | Process and resolve assigned complaints |

## Complaint Flow

1. **Submit** → User submits complaint (Status: `submitted`)
2. **Verify** → Admin reviews and approves/rejects (Status: `verified` or `rejected`)
3. **Assign** → Admin assigns to appropriate department
4. **Process** → Department starts working (Status: `in_progress`)
5. **Resolve** → Department marks as resolved (Status: `resolved`)

## Department Codes

- `academic` - Academic Affairs
- `facilities` - Facilities Management
- `finance` - Finance Office
- `hr` - Human Resources
- `security` - Security Office
- `registrar` - Registrar
- `student_affairs` - Student Affairs

## Color Theme

The application uses Liceo de Cagayan University's official colors:
- **Maroon** (#800020) - Primary color
- **Gold** (#D4AF37) - Accent color
- **White** - Background and text

## License

© 2024 Liceo de Cagayan University. All rights reserved.
