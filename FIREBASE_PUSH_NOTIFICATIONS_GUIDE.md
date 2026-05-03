# Firebase Push Notifications Integration Guide

## Project Structure Overview
Your app uses:
- React Native with Expo
- Firebase as backend
- Redux/Zustand for state management (useAuthStore)
- Node.js backend server
- Custom config at `utils/config.ts` (ipv4)

---

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable these services:
   - Cloud Messaging
   - Cloud Firestore (for storing tokens)
   - Authentication

### 1.2 Get Firebase Credentials

**For Android:**
1. Go to Project Settings → Service Accounts
2. Download `google-services.json`
3. Place in `android/app/google-services.json`

**For iOS:**
1. Go to Project Settings → Service Accounts
2. Download `GoogleService-Info.plist`
3. Place in `ios/GoogleService-Info.plist`

---

## Step 2: Install Required Packages

```bash
# React Native Firebase
npm install @react-native-firebase/app @react-native-firebase/messaging

# Expo modules (if using Expo)
expo install @react-native-firebase/app
expo install @react-native-firebase/messaging

# For notifications UI
npm install react-native-toast-message
# or
npm install @react-navigation/native @react-native-community/hooks
```

---

## Step 3: Android Configuration

### 3.1 Update `android/app/build.gradle`

```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services'  // ← Add this line

dependencies {
    // ... other dependencies
    implementation platform('com.google.firebase:firebase-bom:32.2.0')
    implementation 'com.google.firebase:firebase-messaging'
}
```

### 3.2 Update `android/build.gradle`

```gradle
buildscript {
    dependencies {
        // ... other dependencies
        classpath 'com.google.gms:google-services:4.3.15'  // Add this
    }
}
```

### 3.3 Update `AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Add these permissions -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.INTERNET" />
    
    <application>
        <!-- ... existing code ... -->
        
        <!-- Add notification channel -->
        <service
            android:name=".services.MyFirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>
    </application>
</manifest>
```

---

## Step 4: iOS Configuration

### 4.1 Update Podfile

```ruby
# ios/Podfile

target 'YourApp' do
  # ... existing pods ...
  
  pod 'Firebase/Messaging'
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= [
        '$(inherited)',
        'FIREBASE_ANALYTICS_COLLECTION_ENABLED=1'
      ]
    end
  end
end
```

Run `cd ios && pod install && cd ..`

### 4.2 Enable Push Notifications

1. Open `ios/YourApp.xcworkspace` in Xcode
2. Select your project
3. Go to Signing & Capabilities
4. Click "+ Capability"
5. Add "Push Notifications"
6. Add "Background Modes"
   - Check "Remote notifications"

---

## Step 5: Create Notification Service

Create `services/NotificationService.ts`:

```typescript
import messaging from '@react-native-firebase/messaging';
import { ipv4 } from '../utils/config';
import useAuthStore from '../store/useAuthStore';

// Request user permission for notifications
export const requestNotificationPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Notification permission granted');
      return true;
    } else {
      console.log('Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
};

// Get FCM Token
export const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
};

// Save FCM Token to Backend
export const saveFCMTokenToBackend = async (token: string, userId: string) => {
  try {
    const authStore = useAuthStore.getState();
    const response = await fetch(`${ipv4}users/${userId}/fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${authStore.token}`,
      },
      body: JSON.stringify({
        fcmToken: token,
        platform: Platform.OS, // 'android' or 'ios'
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('FCM Token saved successfully');
      return true;
    } else {
      console.error('Failed to save FCM token:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return false;
  }
};

// Handle foreground notifications
export const setupForegroundNotificationHandler = () => {
  return messaging().onMessage(async (remoteMessage) => {
    console.log('Notification received in foreground:', remoteMessage);

    // Display notification in your app
    handleNotification(remoteMessage);
  });
};

// Handle background notifications
export const setupBackgroundNotificationHandler = () => {
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('Notification opened app:', remoteMessage);
    handleNotificationNavigation(remoteMessage);
  });

  // Check if app was opened from a notification
  messaging().getInitialNotification().then((remoteMessage) => {
    if (remoteMessage) {
      console.log('App opened from notification:', remoteMessage);
      handleNotificationNavigation(remoteMessage);
    }
  });
};

// Handle notification when app is quit
export const setupQuittedAppNotificationHandler = async () => {
  const initialNotification = await messaging().getInitialNotification();
  if (initialNotification) {
    handleNotificationNavigation(initialNotification);
  }
};

// Process notification (shows toast or modal)
const handleNotification = (remoteMessage: any) => {
  const { notification, data } = remoteMessage;

  // You can use react-native-toast-message here
  // Or display a custom component
  
  console.log('Notification Title:', notification?.title);
  console.log('Notification Body:', notification?.body);
  console.log('Notification Data:', data);
};

// Navigate based on notification data
const handleNotificationNavigation = (remoteMessage: any) => {
  const { data, notification } = remoteMessage;

  // Extract type and navigate accordingly
  const { type, userId, postId, chatId } = data;

  // This will be called from your navigation
  return {
    type,
    userId,
    postId,
    chatId,
  };
};

// Listen to token refresh
export const setupTokenRefreshListener = (userId: string) => {
  return messaging().onTokenRefresh((token) => {
    console.log('FCM Token refreshed:', token);
    saveFCMTokenToBackend(token, userId);
  });
};
```

---

## Step 6: Integrate with App.tsx

```typescript
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {
  requestNotificationPermission,
  getFCMToken,
  saveFCMTokenToBackend,
  setupForegroundNotificationHandler,
  setupBackgroundNotificationHandler,
  setupTokenRefreshListener,
} from './services/NotificationService';
import useAuthStore from './store/useAuthStore';

// Set background message handler before any other calls
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in the background!', remoteMessage);
});

export default function App() {
  const user = useAuthStore((state: any) => state.user);
  const token = useAuthStore((state: any) => state.token);

  useEffect(() => {
    if (!user || !token) return;

    const initializeNotifications = async () => {
      try {
        // 1. Request permission
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) return;

        // 2. Get FCM token
        const fcmToken = await getFCMToken();
        if (!fcmToken) return;

        // 3. Save to backend
        await saveFCMTokenToBackend(fcmToken, user._id);

        // 4. Setup handlers
        setupForegroundNotificationHandler();
        setupBackgroundNotificationHandler();
        
        // 5. Listen to token refresh
        setupTokenRefreshListener(user._id);

      } catch (error) {
        console.error('Notification initialization error:', error);
      }
    };

    initializeNotifications();
  }, [user, token]);

  return (
    <NavigationContainer>
      {/* Your navigation stack */}
    </NavigationContainer>
  );
}
```

---

## Step 7: Backend Integration (Node.js)

### 7.1 Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### 7.2 Initialize Firebase Admin

Create `config/firebase-admin.js`:

```javascript
const admin = require('firebase-admin');
const path = require('path');

// Download service account key from Firebase Console
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project.firebaseio.com',
});

module.exports = admin;
```

**Get Service Account Key:**
1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `serviceAccountKey.json` in your backend root

### 7.3 Save FCM Token Endpoint

```javascript
const admin = require('../config/firebase-admin');
const User = require('../models/User');

// POST /api/users/:userId/fcm-token
router.post('/users/:userId/fcm-token', async (req, res) => {
  try {
    const { userId } = req.params;
    const { fcmToken, platform } = req.body;

    // Update user document with FCM token
    await User.updateOne(
      { _id: userId },
      {
        $addToSet: {
          fcmTokens: {
            token: fcmToken,
            platform: platform,
            createdAt: new Date(),
          },
        },
      }
    );

    res.json({ success: true, message: 'FCM token saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 7.4 Send Notifications

Create `services/notificationService.js`:

```javascript
const admin = require('../config/firebase-admin');

// Send notification to single user
async function sendNotificationToUser(userId, title, body, data = {}) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log('No FCM tokens for user:', userId);
      return false;
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title,
              body,
            },
            sound: 'default',
            badge: '1',
          },
        },
      },
    };

    // Send to all tokens of the user
    const results = await Promise.all(
      user.fcmTokens.map((tokenObj) =>
        admin.messaging().send({
          ...message,
          token: tokenObj.token,
        }).catch(err => {
          console.error('Error sending to token:', tokenObj.token, err);
          // Remove invalid token
          if (err.code === 'messaging/invalid-registration-token' ||
              err.code === 'messaging/registration-token-not-registered') {
            User.updateOne(
              { _id: userId },
              { $pull: { fcmTokens: { token: tokenObj.token } } }
            );
          }
        })
      )
    );

    return results;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

// Send notification for new comment
async function notifyNewComment(postId, commentedBy, postOwnerId) {
  try {
    await sendNotificationToUser(
      postOwnerId,
      '💬 New Comment',
      `${commentedBy} commented on your post`,
      {
        type: 'comment',
        postId,
        commentedBy,
      }
    );
  } catch (error) {
    console.error('Error notifying new comment:', error);
  }
}

// Send notification for new like
async function notifyNewLike(postId, likedBy, postOwnerId) {
  try {
    await sendNotificationToUser(
      postOwnerId,
      '❤️ New Like',
      `${likedBy} liked your post`,
      {
        type: 'like',
        postId,
        likedBy,
      }
    );
  } catch (error) {
    console.error('Error notifying new like:', error);
  }
}

// Send notification for new message
async function notifyNewMessage(senderId, senderName, recipientId) {
  try {
    await sendNotificationToUser(
      recipientId,
      '💬 New Message',
      `${senderName} sent you a message`,
      {
        type: 'message',
        senderId,
        chatId: [senderId, recipientId].sort().join('_'),
      }
    );
  } catch (error) {
    console.error('Error notifying new message:', error);
  }
}

// Send notification for new follower
async function notifyNewFollower(followerId, followerName, userId) {
  try {
    await sendNotificationToUser(
      userId,
      '👥 New Follower',
      `${followerName} started following you`,
      {
        type: 'follow',
        followerId,
      }
    );
  } catch (error) {
    console.error('Error notifying new follower:', error);
  }
}

module.exports = {
  sendNotificationToUser,
  notifyNewComment,
  notifyNewLike,
  notifyNewMessage,
  notifyNewFollower,
};
```

### 7.5 Update Comment Endpoint

```javascript
const { notifyNewComment } = require('../services/notificationService');

router.post('/userpost/comment/:userId/:postId', async (req, res) => {
  try {
    const { userId, postId } = req.params;
    const { commentedBy, commentedByUserId, commentText } = req.body;

    // ... your existing comment logic ...

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: newComment } },
      { new: true }
    );

    // Send notification to post owner
    if (userId !== commentedByUserId) {
      await notifyNewComment(postId, commentedBy, userId);
    }

    res.json({ success: true, comments: updatedPost.comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Step 8: Update User Model

Add FCM tokens field to your User schema:

```javascript
// models/User.js
const userSchema = new Schema({
  // ... existing fields ...
  fcmTokens: [
    {
      token: String,
      platform: String, // 'android' or 'ios'
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

// Cleanup old tokens
userSchema.pre('save', async function (next) {
  // Keep only last 5 tokens per platform
  if (this.fcmTokens && this.fcmTokens.length > 10) {
    this.fcmTokens = this.fcmTokens.slice(-10);
  }
  next();
});

module.exports = model('User', userSchema);
```

---

## Step 9: Handle Notifications in App Navigation

Update your navigation to handle notification data:

```typescript
// navigation/RootNavigator.tsx
import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';

export function RootNavigator() {
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage?.data) {
        const { type, postId, userId, chatId } = remoteMessage.data;

        if (type === 'comment' || type === 'like') {
          navigationRef.navigate('UserProfilePosts', { postId });
        } else if (type === 'message') {
          navigationRef.navigate('Chat', { userId });
        } else if (type === 'follow') {
          navigationRef.navigate('UserProfile', { userId });
        }
      }
    });

    return unsubscribe;
  }, [navigationRef]);

  // ... rest of navigation
}
```

---

## Step 10: Test Notifications

### Test with Firebase Console

1. Go to Firebase Console → Cloud Messaging
2. Create a new campaign
3. Select your app
4. Add title and body
5. Schedule or send immediately
6. Check if notification appears on your device

### Test Programmatically

```javascript
// Backend test endpoint
router.post('/test-notification', async (req, res) => {
  try {
    const { userId } = req.body;
    const { notifyNewComment } = require('../services/notificationService');

    await notifyNewComment(
      'test_post_id',
      'Test User',
      userId
    );

    res.json({ success: true, message: 'Test notification sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Troubleshooting

### Issue: Token not received
```javascript
// Check if notifications are enabled
async function checkNotificationPermission() {
  const authStatus = await messaging().requestPermission();
  console.log('Auth Status:', authStatus);
}
```

### Issue: Notifications not working on Android
1. Ensure `google-services.json` is in correct path
2. Check `AndroidManifest.xml` has correct permissions
3. Verify `google_services.gradle` is applied

### Issue: Notifications not working on iOS
1. Ensure push certificate is uploaded to Firebase
2. Check "Push Notifications" capability is enabled
3. Verify `GoogleService-Info.plist` is in Xcode project

### Invalid FCM Token
```javascript
// Auto-cleanup invalid tokens
if (error.code === 'messaging/invalid-registration-token') {
  User.updateOne(
    { _id: userId },
    { $pull: { fcmTokens: { token: invalidToken } } }
  );
}
```

---

## Summary Checklist

- [ ] Firebase project created
- [ ] Android: `google-services.json` added
- [ ] iOS: `GoogleService-Info.plist` added & Push Notifications enabled
- [ ] NPM packages installed
- [ ] NotificationService.ts created
- [ ] App.tsx updated with notification setup
- [ ] Firebase Admin SDK installed
- [ ] Backend FCM token endpoint created
- [ ] User model updated with fcmTokens field
- [ ] Backend notification service created
- [ ] Notification endpoints integrated
- [ ] Navigation updated for notification routing
- [ ] Tested with Firebase Console
- [ ] `serviceAccountKey.json` in backend .gitignore

---

## Example Notification Types

Your app can support:
- 💬 **Comments**: "User commented on your post"
- ❤️ **Likes**: "User liked your post"
- 💬 **Messages**: "User sent you a message"
- 👥 **Follows**: "User started following you"
- ⭐ **VIP**: "You earned a VIP badge"
- 🎉 **Special Events**: Custom notifications

