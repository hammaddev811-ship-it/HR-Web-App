# 🚀 Focus HR Management Web App

A modern, responsive HR management system built with Next.js, featuring employee authentication, check-in/check-out functionality, and real-time attendance tracking.

## ✨ **Features**

### 🔐 **Authentication System**
- **Secure Login**: Email/password authentication with session management
- **Persistent Sessions**: Automatic login state restoration using localStorage
- **Protected Routes**: Dashboard access only after successful authentication
- **Logout Functionality**: Secure session termination

### 📱 **Employee Dashboard**
- **Personal Information**: Employee details, ID, department, and location
- **Real-time Clock**: Live time and date display
- **Quick Actions**: One-click check-in and check-out buttons
- **Location Tracking**: GPS integration for attendance verification
- **Activity History**: Complete record of all check-ins and check-outs

### 🎨 **User Experience**
- **Responsive Design**: Works perfectly on all devices
- **Loading States**: Smooth transitions and feedback
- **Error Handling**: User-friendly error messages
- **Modern UI**: Clean, professional interface with Tailwind CSS

## 🛠️ **Technology Stack**

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React for consistent iconography
- **State Management**: React Context API for authentication
- **Storage**: Browser localStorage for session persistence
- **Deployment**: Vercel (production-ready)

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn package manager

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd hr-web-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### **Demo Credentials**
For testing purposes, use these credentials:
- **Email**: `admin@company.com`
- **Password**: `password123`

## 📁 **Project Structure**

```
hr-web-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with AuthProvider
│   │   ├── page.tsx            # Main page with auth logic
│   │   └── globals.css         # Global styles and Tailwind
│   ├── components/
│   │   ├── LoginForm.tsx       # Authentication form
│   │   ├── Dashboard.tsx       # Main HR dashboard
│   │   └── LoadingSpinner.tsx  # Reusable loading component
│   └── contexts/
│       └── AuthContext.tsx     # Authentication context
├── public/                     # Static assets
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind configuration
└── README.md                  # This file
```

## 🔐 **Authentication Flow**

### **Login Process**
1. User enters email and password
2. Form validation and submission
3. Mock API call (replace with real authentication)
4. Success: User data stored in localStorage
5. Redirect to dashboard

### **Session Management**
- **Automatic Login**: App checks localStorage on startup
- **Persistent State**: User stays logged in across browser sessions
- **Secure Logout**: Clears all session data

### **Protected Routes**
- **Unauthenticated**: Shows login form
- **Authenticated**: Shows dashboard
- **Loading State**: Shows spinner during auth check

## 🎯 **Customization**

### **Adding Real Authentication**
Replace the mock authentication in `AuthContext.tsx`:

```typescript
const login = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    if (response.ok) {
      const data = await response.json()
      // Handle successful login
      return { success: true }
    } else {
      return { success: false, error: 'Invalid credentials' }
    }
  } catch (error) {
    return { success: false, error: 'Network error' }
  }
}
```

### **Styling Customization**
- **Colors**: Modify `tailwind.config.js` primary colors
- **Components**: Update CSS classes in component files
- **Layout**: Adjust spacing and sizing in Tailwind classes

## 📱 **Mobile Integration**

This web app is designed to work seamlessly with the React Native mobile app through WebView:

- **Responsive Design**: Optimized for mobile screens
- **Touch-Friendly**: Large buttons and touch targets
- **Mobile-First**: Designed with mobile users in mind
- **WebView Compatible**: Works perfectly in React Native WebView

## 🚀 **Deployment**

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
3. Deploy automatically on every push

### **Other Platforms**
- **Netlify**: Similar to Vercel setup
- **AWS Amplify**: Full-stack deployment
- **Docker**: Containerized deployment

## 🔧 **Development**

### **Available Scripts**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### **Code Quality**
- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting (recommended)

## 📊 **Performance**

- **Fast Loading**: Optimized bundle size
- **Lazy Loading**: Components loaded on demand
- **Caching**: Efficient localStorage usage
- **Responsive**: Smooth animations and transitions

## 🔒 **Security Considerations**

### **Current Implementation**
- **Client-side Storage**: Uses localStorage for demo
- **Mock Authentication**: Simulated for development

### **Production Recommendations**
- **JWT Tokens**: Implement proper JWT authentication
- **HTTPS**: Always use secure connections
- **Input Validation**: Server-side validation
- **Rate Limiting**: Prevent brute force attacks
- **Session Timeout**: Automatic logout after inactivity

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

For questions or issues:
- Check the documentation
- Review the code structure
- Create an issue in the repository

---

**Built with ❤️ using Next.js and Tailwind CSS**
