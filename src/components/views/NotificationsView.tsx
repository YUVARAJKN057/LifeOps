import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  CheckCheck,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    unreadNotificationCount,
    setActiveTab,
  } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#c5a059]" />;
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a059]" />;
      default:
        return <Info className="w-3.5 h-3.5 text-[#7a7a7a]" />;
    }
  };

  return (
    <div id="lifeops-notifications-view" className="space-y-8 animate-in fade-in duration-300 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <div className="text-[#7a7a7a] text-[10px] uppercase tracking-[0.35em] font-medium mb-1">
            Dispatch Log
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
            Activity & System Bulletins
          </h1>
          <p className="text-xs text-[#7a7a7a] mt-1 font-light">
            Operational alerts, deadline warnings, and ritual milestone alerts.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            id="notifications-mark-all-read-btn"
            onClick={markAllNotificationsAsRead}
            disabled={unreadNotificationCount === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-[#0e0e0e] hover:bg-[#141414] text-[10px] uppercase tracking-widest font-semibold text-[#c5a059] border border-[#1a1a1a] transition-all disabled:opacity-40 self-start sm:self-auto"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] space-y-3">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-[#555]">
            <Bell className="w-8 h-8 text-[#333] mx-auto mb-3" />
            <h4 className="text-base font-serif italic text-white">All caught up</h4>
            <p className="text-xs text-[#7a7a7a] mt-1">No pending bulletins in your dispatch queue.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              id={`notification-item-${n.id}`}
              onClick={() => {
                markNotificationAsRead(n.id);
                if (n.linkTab) setActiveTab(n.linkTab as any);
              }}
              className={`flex items-start justify-between p-4 rounded-sm border cursor-pointer transition-all ${
                !n.read
                  ? 'bg-[#0a0a0a] border-[#c5a059]/40 hover:border-[#c5a059]'
                  : 'bg-[#050505] border-[#141414] hover:border-[#222]'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2 rounded-sm bg-[#111] border border-[#222] flex-shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-medium ${!n.read ? 'text-[#c5a059]' : 'text-white'}`}>
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#7a7a7a] mt-1 font-light">{n.message}</p>
                  <span className="text-[10px] text-[#555] font-mono mt-2 block">
                    {new Date(n.createdAt).toLocaleDateString()} at{' '}
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <button
                id={`notification-delete-${n.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(n.id);
                }}
                className="p-1.5 text-[#555] hover:text-rose-400 rounded-sm hover:bg-[#111] transition-colors ml-2"
                title="Delete Notification"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
