# FileShare - Secure File Sharing Platform

A comprehensive file-sharing platform built with React that allows users to upload, store, and share files securely. The system supports file organization, sharing permissions, real-time notifications, and usage analytics.

## Features

### 🔐 Authentication & Security
- User registration and login system
- Secure session management
- Protected routes and components
- Password protection for shared files

### 📁 File Management
- **Drag & Drop Upload**: Intuitive file upload with progress tracking
- **File Organization**: Create and manage folders
- **File Previews**: Preview images, PDFs, text files, and more
- **File Versioning**: Track file history and changes
- **Large File Support**: Handle files of any size with chunked uploads

### 🔗 Sharing & Collaboration
- **Secure Link Generation**: Create shareable links with expiration dates
- **Permission Control**: Set read, write, delete, and share permissions
- **Public/Private Sharing**: Control access levels
- **Email Invitations**: Share with specific users via email
- **Password Protection**: Add passwords to shared links

### 📊 Analytics & Monitoring
- **Usage Analytics**: Track file downloads, shares, and storage usage
- **Storage Breakdown**: Monitor storage by file type
- **Activity Tracking**: View recent file activities
- **Performance Metrics**: Monitor system performance

### 🔔 Real-time Features
- **Live Notifications**: Real-time updates for file activities
- **Notification Center**: Centralized notification management
- **Activity Feed**: Track all file-related activities

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Customizable appearance
- **Intuitive Navigation**: Easy-to-use interface
- **Accessibility**: WCAG compliant design

## Technology Stack

- **Frontend**: React 19, React Router, Tailwind CSS
- **State Management**: React Context API
- **File Handling**: React Dropzone
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd filesharing-fd
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Demo Credentials
For testing purposes, you can use any email and password combination to sign in (demo mode).

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── FileUpload.jsx   # Drag & drop file upload
│   ├── FilePreview.jsx  # File preview modal
│   ├── ShareModal.jsx   # File sharing interface
│   ├── Navigation.jsx   # Main navigation
│   └── ...
├── contexts/            # React contexts
│   ├── AuthContext.jsx  # Authentication state
│   └── NotificationContext.jsx # Notifications
├── pages/               # Page components
│   ├── Dashboard.jsx    # Main dashboard
│   ├── Login.jsx        # Login page
│   ├── Register.jsx     # Registration page
│   └── Analytics.jsx    # Analytics dashboard
├── types/               # Type definitions
├── services/            # API services
├── hooks/               # Custom React hooks
└── utils/               # Utility functions
```

## Key Components

### FileUpload Component
- Drag and drop file upload
- Progress tracking
- File type validation
- Multiple file support
- Large file handling

### ShareModal Component
- Permission management
- Link generation
- Expiration settings
- Password protection
- Email invitations

### FilePreview Component
- Image preview with zoom/rotate
- PDF viewer
- Text file display
- Download functionality
- File information display

### Analytics Dashboard
- Storage usage visualization
- File activity charts
- Download statistics
- User activity tracking

## Features in Detail

### File Upload
- Supports all major file types (images, documents, videos, audio, archives)
- Drag and drop interface
- Progress tracking with visual indicators
- File size validation
- Multiple file selection

### Sharing System
- **Private**: Only people with the link can access
- **Restricted**: Only specific people can access
- **Public**: Anyone with the link can access
- Permission levels: Read, Write, Delete, Share
- Link expiration dates
- Password protection

### File Previews
- **Images**: Full preview with zoom and rotate controls
- **PDFs**: Embedded PDF viewer
- **Text Files**: Syntax-highlighted text display
- **Videos**: Video player integration
- **Audio**: Audio player controls

### Notifications
- Real-time file activity notifications
- Notification center with unread count
- Mark as read functionality
- Notification history
- Action buttons for quick access

## Customization

### Styling
The application uses Tailwind CSS for styling. You can customize the appearance by modifying the Tailwind configuration in `tailwind.config.js`.

### Theme Colors
Primary colors are defined in the Tailwind config:
- Primary: Blue (#3b82f6)
- Success: Green
- Warning: Yellow
- Error: Red

### Adding New File Types
To add support for new file types, update the `FileUpload` component's `accept` prop and add corresponding preview logic in `FilePreview`.

## Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel/Netlify
The application is ready for deployment to modern hosting platforms. Simply connect your repository and deploy.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

---

**Note**: This is a demo application. In a production environment, you would need to implement proper backend services, database integration, and security measures.