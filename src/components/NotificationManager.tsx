import React, { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";

export function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const { user } = useAuth();

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Listen for new notifications from Firestore
  useEffect(() => {
    if (permission !== "granted") return;

    const q = query(
      collection(db, "notifications"),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          // Only show if it's a new notification (less than 1 minute old)
          const now = Date.now();
          const ts = (data.timestamp as Timestamp)?.toMillis() || 0;
          if (now - ts < 60000) {
            new Notification(data.title || "New Update!", {
              body: data.message || "Check the app for details ❤️",
              icon: "https://picsum.photos/seed/love/192/192"
            });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [permission]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      new Notification("Notifications Enabled!", {
        body: "You will now receive updates from the admin ❤️",
        icon: "https://picsum.photos/seed/love/192/192"
      });
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        onClick={requestPermission}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${permission === "granted"
          ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
          : "bg-eid-accent text-white"
          }`}
        title={permission === "granted" ? "Notifications Enabled" : "Enable Notifications"}
      >
        {permission === "granted" ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
      </button>
    </div>
  );
}
