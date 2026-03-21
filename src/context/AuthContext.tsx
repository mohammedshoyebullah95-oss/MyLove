import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc, collection, query, orderBy } from "firebase/firestore";
import { auth, db, OperationType, handleFirestoreError } from "../firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  coins: number;
  rewardAmount: number;
  completedActivities: string[];
  notifications: any[];
  isAuthReady: boolean;
  lastReadTimestamp: number;
  markNotificationsAsRead: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  coins: 0,
  rewardAmount: 0,
  completedActivities: [],
  notifications: [],
  isAuthReady: false,
  lastReadTimestamp: 0,
  markNotificationsAsRead: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState(0);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(() => {
    const saved = localStorage.getItem("lastReadNotifications");
    return saved ? parseInt(saved) : 0;
  });

  const markNotificationsAsRead = () => {
    const now = Date.now();
    setLastReadTimestamp(now);
    localStorage.setItem("lastReadNotifications", now.toString());
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser?.uid);
      setUser(currentUser);
      setIsAuthReady(true);
      if (!currentUser) {
        setLoading(false);
        setCoins(0);
        setRewardAmount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    if (!user) {
      setLoading(false);
      setCoins(0);
      setRewardAmount(0);
      setCompletedActivities([]);
      setNotifications([]);
      return;
    }

    let unsubSnapshot: (() => void) | null = null;
    let unsubNotifications: (() => void) | null = null;

    const initProfile = async () => {
      // Small delay to ensure auth token is ready for Firestore rules
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userRef = doc(db, "users", user.uid);
      
      try {
        console.log("Fetching user doc for:", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          console.log("Creating new user doc for:", user.uid);
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            coins: 0,
            rewardAmount: 0,
            completedActivities: [],
            lastUpdated: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Initial profile fetch error:", error);
        // Retry logic for permission propagation
        setTimeout(async () => {
          try {
            const retryDoc = await getDoc(userRef);
            if (!retryDoc.exists()) {
              await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                coins: 0,
                rewardAmount: 0,
                completedActivities: [],
                lastUpdated: new Date().toISOString(),
              });
            }
          } catch (retryError) {
            console.error("Retry profile fetch error:", retryError);
          }
        }, 2000);
      }

      // Listen for real-time updates
      unsubSnapshot = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          console.log("Real-time update for user:", user.uid, "Full Data:", JSON.stringify(data, null, 2));
          setCoins(data.coins || 0);
          setRewardAmount(data.rewardAmount || 0);
          setCompletedActivities(data.completedActivities || []);
        }
        setLoading(false);
      }, (error) => {
        console.error("Snapshot listener error:", error);
        // Don't throw here to avoid crashing the app, but log it
        if (error.message.includes("permissions")) {
          console.warn("Permission denied for user doc. This might be temporary.");
        }
      });

      // Listen for notifications
      const notificationsRef = collection(db, "notifications");
      const q = query(notificationsRef, orderBy("timestamp", "desc"));
      unsubNotifications = onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotifications(notifs);
      }, (error) => {
        console.error("Notifications listener error:", error);
      });
    };

    initProfile();

    return () => {
      if (unsubSnapshot) unsubSnapshot();
      if (unsubNotifications) unsubNotifications();
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, coins, rewardAmount, completedActivities, notifications, isAuthReady, lastReadTimestamp, markNotificationsAsRead }}>
      {children}
    </AuthContext.Provider>
  );
};
