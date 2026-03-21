import { Bell, User, Moon, LogOut, LogIn, Shield, X, Users, Edit2, RotateCcw, Save, Play, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { signInWithGoogle, logout, db } from "@/firebase";
import { useAudio } from "@/hooks/useAudio";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationsPopup } from "@/components/NotificationsPopup";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";

export function Header({ className }: { className?: string }) {
  const { user, notifications, lastReadTimestamp, markNotificationsAsRead } = useAuth();
  const { playClick, playSuccess, toggleAmbient, isAmbientPlaying } = useAudio();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [adminTitle, setAdminTitle] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editCoins, setEditCoins] = useState(0);
  const [editReward, setEditReward] = useState(0);

  const isAdmin = user?.email === "mohammedshoyebullah95@gmail.com";

  const hasUnread = notifications.some(n => {
    const ts = n.timestamp?.toDate ? n.timestamp.toDate().getTime() : Date.now();
    return ts > lastReadTimestamp;
  });

  useEffect(() => {
    if (isAdmin && showUserManagement) {
      const usersRef = collection(db, "users");
      const unsubscribe = onSnapshot(usersRef, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllUsers(users);
      });
      return () => unsubscribe();
    }
  }, [isAdmin, showUserManagement]);

  const handleSendNotification = async () => {
    if (!adminTitle || !adminMessage) return;
    try {
      await addDoc(collection(db, "notifications"), {
        title: adminTitle,
        message: adminMessage,
        timestamp: serverTimestamp()
      });
      setAdminTitle("");
      setAdminMessage("");
      setShowAdmin(false);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, {
        coins: Number(editCoins),
        rewardAmount: Number(editReward),
        lastUpdated: serverTimestamp()
      });
      setEditingUser(null);
      playSuccess();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleResetActivities = async () => {
    if (!editingUser) return;

    console.log("Attempting to reset activities for user:", editingUser.id);
    try {
      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, {
        completedActivities: [],
        lastUpdated: serverTimestamp()
      });
      console.log("Successfully reset activities for user:", editingUser.id);
      playSuccess();
      setEditingUser(null); // Close the modal to show it worked
    } catch (error) {
      console.error("Error resetting activities:", error);
    }
  };

  return (
    <header
      className={cn(
        "flex items-center justify-between px-5 py-4 sticky top-0 z-50",
        "liquid-glass-subtle",
        "border-b border-white/10",
        className
      )}
    >
      {/* User Management Modal */}
      <AnimatePresence>
        {showUserManagement && (
          <div className="fixed inset-0 z-[110] flex items-start justify-center p-6 bg-eid-dark/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUserManagement(false)}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md popup-glass rounded-[32px] p-6 relative z-10 max-h-[85vh] flex flex-col overflow-hidden border border-white/20 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-bold text-eid-dark">User Management</h2>
                <button
                  onClick={() => setShowUserManagement(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 text-eid-dark/40 hover:text-eid-dark hover:bg-black/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar">
                {allUsers.map((u) => (
                  <div
                    key={u.id}
                    className="liquid-glass-subtle bg-white/40 p-4 rounded-2xl border border-black/5 flex items-start justify-between gap-4 shadow-sm hover:border-eid-accent/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "font-bold truncate",
                          u.uid === user?.uid ? "text-eid-accent" : "text-eid-dark"
                        )}>
                          {u.displayName || "Anonymous"}
                        </p>
                        {u.uid === user?.uid && (
                          <span className="text-[8px] font-bold bg-eid-accent/10 text-eid-accent px-1.5 py-0.5 rounded-full uppercase tracking-tighter">You</span>
                        )}
                      </div>
                      <p className="text-[10px] text-eid-dark/60 truncate">{u.email}</p>
                      <p className="text-[9px] font-mono text-eid-dark/40 truncate">ID: {u.uid}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] font-bold text-eid-gold">Coins: {u.coins || 0}</span>
                        <span className="text-[10px] font-bold text-eid-accent">Reward: ${u.rewardAmount || 0}</span>
                        <span className="text-[10px] font-bold text-eid-rose">Done: {u.completedActivities?.length || 0}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingUser(u);
                        setEditCoins(u.coins || 0);
                        setEditReward(u.rewardAmount || 0);
                      }}
                      className="p-2 bg-black/5 hover:bg-black/10 transition-colors rounded-xl text-eid-accent"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {editingUser && (
          <div className="fixed inset-0 z-[120] flex items-start justify-center p-6 bg-eid-dark/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm popup-glass rounded-[32px] p-8 relative z-10 border border-white/20 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-eid-dark mb-6 text-center">Edit User Data</h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-eid-dark/60 uppercase tracking-widest">Coins</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={editCoins}
                      onChange={(e) => setEditCoins(parseInt(e.target.value) || 0)}
                      className="flex-1 bg-black/5 border border-black/10 rounded-xl p-3 text-eid-dark font-bold"
                    />
                    <button
                      onClick={() => setEditCoins(0)}
                      className="p-3 bg-black/5 hover:bg-black/10 transition-colors rounded-xl text-eid-rose"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-eid-dark/60 uppercase tracking-widest">Reward Amount ($)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={editReward}
                      onChange={(e) => setEditReward(parseInt(e.target.value) || 0)}
                      className="flex-1 bg-black/5 border border-black/10 rounded-xl p-3 text-eid-dark font-bold"
                    />
                    <button
                      onClick={() => setEditReward(0)}
                      className="p-3 bg-black/5 hover:bg-black/10 transition-colors rounded-xl text-eid-rose"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleResetActivities}
                    className="w-full py-3 liquid-glass-subtle border border-eid-rose/20 text-eid-rose rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-eid-rose/5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All Activities
                  </button>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-4 bg-black/5 hover:bg-black/10 transition-colors rounded-2xl font-bold text-eid-dark/70"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateUser}
                    className="flex-1 py-4 bg-eid-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <NotificationsPopup
        isOpen={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          markNotificationsAsRead();
        }}
        notifications={notifications}
      />

      {/* Admin Panel */}
      <AnimatePresence>
        {showAdmin && (
          <div className="fixed inset-0 z-[110] flex items-start justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdmin(false)}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm popup-glass rounded-3xl p-6 relative z-10 border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-eid-dark">
                  <Shield className="w-5 h-5 text-eid-accent" />
                  Admin Control
                </h3>
                <button
                  onClick={() => setShowAdmin(false)}
                  className="text-eid-dark/40 hover:text-eid-dark"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => { playClick(); setShowUserManagement(true); setShowAdmin(false); }}
                  className="w-full py-4 bg-eid-dark text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
                >
                  <Users className="w-5 h-5" />
                  User Management
                </button>

                <div className="h-px bg-eid-dark/10 my-2" />

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-eid-dark/60 uppercase tracking-widest">Broadcast Message</label>
                  <input
                    type="text"
                    placeholder="Title"
                    value={adminTitle}
                    onChange={(e) => setAdminTitle(e.target.value)}
                    className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-eid-accent/50 text-eid-dark placeholder-eid-dark/30"
                  />
                  <textarea
                    placeholder="Message"
                    value={adminMessage}
                    onChange={(e) => setAdminMessage(e.target.value)}
                    className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-eid-accent/50 text-eid-dark placeholder-eid-dark/30"
                  />
                </div>
                <button
                  onClick={handleSendNotification}
                  className="w-full bg-eid-accent text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Send to All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        {/* Moon logo with inner glow */}
        <div className="w-10 h-10 liquid-glass rounded-2xl flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-eid-gold/20 to-eid-accent/10 opacity-60" />
          <Moon className="w-5 h-5 text-eid-gold-light fill-eid-gold-light relative z-10 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex flex-col">
          <h1 className="font-bold text-lg text-eid-dark/90 tracking-tight leading-none">
            Love Hub ❤️
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        {/* Music Toggle */}
        <button
          onClick={() => { playClick(); toggleAmbient(); }}
          className={`w-10 h-10 liquid-glass rounded-2xl flex items-center justify-center transition-all active:scale-90 ${isAmbientPlaying
              ? "text-love-pink shadow-[0_0_12px_rgba(255,107,157,0.3)] animate-pulse-glow"
              : "text-eid-dark/60 hover:text-eid-dark"
            }`}
        >
          <Music2 className="w-[18px] h-[18px]" />
        </button>
        {isAdmin && (
          <button
            onClick={() => { playClick(); setShowAdmin(true); }}
            className="w-10 h-10 liquid-glass rounded-2xl flex items-center justify-center text-eid-dark/60 hover:text-eid-gold transition-all active:scale-90"
          >
            <Shield className="w-[18px] h-[18px]" />
          </button>
        )}
        <button
          onClick={() => { playClick(); setShowNotifications(true); }}
          className="w-10 h-10 liquid-glass rounded-2xl flex items-center justify-center text-eid-dark/60 hover:text-eid-dark transition-all active:scale-90 relative"
        >
          <Bell className="w-[18px] h-[18px]" />
          {hasUnread && (
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-eid-rose rounded-full shadow-[0_0_6px_rgba(244,114,182,0.6)]" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => { playClick(); setShowProfile(!showProfile); }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-eid-gold via-eid-gold-dark to-eid-accent2/40 opacity-90" />
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover relative z-10" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-5 h-5 relative z-10" />
            )}
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-48 liquid-glass-strong rounded-2xl p-2 iridescent-border z-50"
              >
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-bold text-eid-dark truncate">{user.displayName}</p>
                      <p className="text-[10px] text-eid-gray truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { playClick(); logout(); setShowProfile(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-eid-rose hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { playClick(); signInWithGoogle(); setShowProfile(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-eid-accent hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Login with Google
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
