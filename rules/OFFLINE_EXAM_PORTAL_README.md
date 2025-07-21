# Offline Exam Portal - Vichar Group

A comprehensive, offline-capable exam portal that allows students to take exams even without internet connectivity. The system automatically caches exam data, saves progress locally, and syncs results when connection is restored.

## 🚀 Features

### Core Functionality
- **Offline Exam Taking**: Complete exams without internet connection
- **Automatic Data Caching**: Exam questions and details cached locally
- **Progress Saving**: Automatic save every 30 seconds + manual save option
- **Background Sync**: Automatic submission sync when online
- **Service Worker**: Handles offline functionality and caching
- **PWA Support**: Installable as a web app

### Exam Features
- **Multiple Question Types**: Single choice, multiple choice, user input
- **Timer Management**: Countdown timer with auto-submission
- **Question Navigation**: Easy navigation between questions
- **Question Marking**: Mark questions for review
- **Progress Tracking**: Visual progress indicator
- **Negative Marking**: Configurable negative marking system

### Offline Capabilities
- **Data Persistence**: Exam data stored in IndexedDB
- **Offline Submissions**: Store completed exams locally
- **Auto Sync**: Background sync when connection restored
- **Conflict Resolution**: Handle duplicate submissions
- **Storage Management**: Monitor and manage offline storage

## 🏗️ Architecture

### Frontend Components
```
components/examPortal/examPageComponents/
├── ExamHome.js          # Main exam portal interface
├── ExamInterface.js     # Exam taking interface
└── Instructions.js      # Exam instructions page
```

### Backend Services
```
server_actions/actions/examController/
├── studentExamActions.js    # Exam operations
└── examResult.js           # Result management
```

### Offline Infrastructure
```
public/
├── sw.js              # Service Worker
├── offline.html       # Offline page
└── manifest.json      # PWA manifest

src/hooks/
└── use-offline.js     # Offline functionality hook
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- MongoDB
- Next.js 13+ with App Router

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd vichargroup

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Configure your environment variables

# Run the development server
npm run dev
```

### Environment Variables
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret

# API Configuration
NEXT_PUBLIC_API_URL=your_api_url
```

## 📱 Usage

### For Students

1. **Access Exam Portal**
   - Navigate to `/exams/[examId]`
   - System checks eligibility and caches exam data

2. **Take Exam Offline**
   - Start exam when online (data gets cached)
   - Continue taking exam even when offline
   - Progress automatically saved every 30 seconds

3. **Submit Exam**
   - Submit exam (stored locally if offline)
   - Results automatically sync when connection restored

### For Administrators

1. **Create Exams**
   - Use existing admin interface
   - Set exam duration, questions, negative marking

2. **Monitor Results**
   - View exam statistics
   - Track offline vs online submissions
   - Analyze student performance

## 🔧 Technical Implementation

### Service Worker
The service worker (`public/sw.js`) handles:
- **Caching Strategy**: Network-first for exam data, cache-first for static assets
- **Background Sync**: Automatic submission sync when online
- **Offline Fallback**: Shows offline page when navigation fails

### IndexedDB Storage
```javascript
// Store exam data
await storeOfflineData(`exam_${examId}`, examData);

// Store submissions
await storeOfflineSubmission(submission);

// Retrieve data
const data = await getOfflineData(`exam_${examId}`);
```

### Offline Hook
The `useOffline` hook provides:
- Connection status monitoring
- Service worker management
- IndexedDB operations
- Background sync triggering

### API Routes
- `/api/exam/sync-offline` - Sync offline submissions
- `/api/exam/[id]/cache` - Cache exam data

## 📊 Data Models

### Exam Result Schema
```javascript
{
  exam: ObjectId,
  student: ObjectId,
  answers: Map,
  score: Number,
  totalMarks: Number,
  timeTaken: Number,
  completedAt: Date,
  isOfflineSubmission: Boolean,
  questionAnalysis: Array,
  statistics: Object
}
```

### Offline Storage
- **IndexedDB**: Exam data, submissions, progress
- **localStorage**: User preferences, session data
- **Cache API**: Static assets, exam resources

## 🔒 Security Features

- **JWT Authentication**: Secure student authentication
- **Exam Validation**: Server-side exam eligibility checks
- **Submission Verification**: Prevent duplicate submissions
- **Data Integrity**: Checksums for offline data validation

## 📈 Performance Optimizations

- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Optimized exam images
- **Code Splitting**: Separate bundles for different features
- **Caching Strategy**: Efficient caching for offline use

## 🧪 Testing

### Manual Testing
```bash
# Test offline functionality
1. Start exam when online
2. Disconnect internet
3. Continue taking exam
4. Submit exam
5. Reconnect internet
6. Verify sync
```

### Automated Testing
```bash
# Run tests
npm test

# Run specific test suite
npm test -- --testNamePattern="offline"
```

## 🐛 Troubleshooting

### Common Issues

1. **Service Worker Not Registering**
   - Check browser console for errors
   - Verify HTTPS in production
   - Clear browser cache

2. **Offline Data Not Loading**
   - Check IndexedDB permissions
   - Verify data was cached properly
   - Check browser storage limits

3. **Sync Not Working**
   - Verify network connectivity
   - Check API endpoint availability
   - Review server logs

### Debug Commands
```javascript
// Check service worker status
navigator.serviceWorker.getRegistrations()

// Check IndexedDB
indexedDB.databases()

// Check cache storage
caches.keys()
```

## 📱 PWA Features

### Installation
- **Automatic**: Browser prompts for installation
- **Manual**: Add to home screen option
- **Shortcuts**: Quick access to common actions

### Offline Capabilities
- **App-like Experience**: Full-screen mode
- **Background Sync**: Automatic data synchronization
- **Push Notifications**: Exam reminders and updates

## 🔄 Deployment

### Production Setup
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Configuration
- Set production environment variables
- Configure MongoDB connection
- Set up SSL certificates for HTTPS
- Configure CDN for static assets

## 📚 API Documentation

### Exam Endpoints

#### GET `/api/exam/[id]/cache`
Cache exam data for offline use.

#### POST `/api/exam/sync-offline`
Sync offline submissions with server.

#### POST `/api/exam/submit`
Submit exam result (online).

### Response Format
```javascript
{
  success: boolean,
  message: string,
  data?: any,
  error?: string
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Note**: This offline exam portal is designed to work seamlessly in both online and offline modes, ensuring students can complete their exams without interruption while maintaining data integrity and security. 