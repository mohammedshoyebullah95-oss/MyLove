import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Clock, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: any;
}

interface NotificationsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}

export function NotificationsPopup({ isOpen, onClose, notifications }: NotificationsPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-eid-dark/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm max-h-[85vh] popup-glass rounded-[32px] p-6 flex flex-col relative overflow-hidden iridescent-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-eid-accent to-eid-accent2 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(110,193,228,0.3)]">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                  <p className="text-sm text-gray-600 font-medium">Updates from the admin</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 text-gray-500 hover:text-gray-900 hover:bg-black/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 relative z-10 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-gray-500">
                  <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center">
                    <Bell className="w-10 h-10" />
                  </div>
                  <p className="font-medium">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="liquid-glass-subtle bg-white/40 rounded-2xl p-5 border border-black/5 group hover:border-eid-accent/30 transition-colors shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 text-lg">{notif.title}</h3>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-black/5 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        {notif.timestamp?.toDate ? formatDistanceToNow(notif.timestamp.toDate(), { addSuffix: true }) : "Just now"}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{notif.message}</p>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-black/5 relative z-10">
              <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                End of notifications
              </p>
            </div>

            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-eid-accent/5 via-transparent to-eid-accent2/5 pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
