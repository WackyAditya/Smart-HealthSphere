# Healthcare Management System

## 11. Security and Production Notes
For a real healthcare product, add the following before production:

* HTTPS only
* Audit logs for medical record access
* Refresh token rotation
* Encrypted fields for sensitive PHI
* Cloudinary private/authenticated delivery
* Strict CORS
* Input validation using Zod/Joi
* Request logging with correlation IDs
* Database backups
* Role-based and relationship-based access control
* HIPAA/GDPR compliance review
* File antivirus scanning
* 2FA for doctors/admins
* Admin activity logs

## 12. README Setup Instructions

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Create first admin manually in MongoDB or add a seed script:

```json
{
  "name": "Admin",
  "email": "admin@healthcare.com",
  "password": "hashed_password_here",
  "role": "admin",
  "doctorApprovalStatus": "not_applicable",
  "isActive": true
}
```

*Recommended: create a seed script that hashes password using bcrypt.*

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on:
```bash
http://localhost:5173
```

Backend runs on:
```bash
http://localhost:5000
```

## 13. Deployment

### Backend: Render/Railway
Set environment variables:
```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secure_secret
CLIENT_URL=https://your-frontend.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Build/start command:
```bash
npm install
npm start
```

### Frontend: Vercel/Netlify
Set:
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

Build command:
```bash
npm run build
```

Output directory:
```bash
dist
```

### Database: MongoDB Atlas
* Create Atlas cluster
* Create database user
* Whitelist backend IP or allow Render/Railway
* Copy connection URI into backend .env

## 14. Recommended Next Enhancements
To make the system even closer to hospital-grade production:

* Appointment calendar UI
* Real-time notifications with Socket.IO
* Video consultations
* Lab reports module
* Insurance details
* Billing/payment integration
* Multi-clinic support
* Doctor leave management
* Patient emergency contacts
* E-prescription PDF generation
* Medical record access consent workflow
* Audit log dashboard for admins
