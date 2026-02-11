import { useNetwork } from '@/contexts/NetworkContext';
import { Wifi, WifiOff, Signal } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function NetworkIndicator() {
  const { isOnline, isSlowConnection } = useNetwork();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [showReconnectedMessage, setShowReconnectedMessage] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineMessage(true);
      setShowReconnectedMessage(false);
    } else if (showOfflineMessage && isOnline) {
      setShowOfflineMessage(false);
      setShowReconnectedMessage(true);
      setTimeout(() => setShowReconnectedMessage(false), 3000);
    }
  }, [isOnline, showOfflineMessage]);

  if (!showOfflineMessage && !showReconnectedMessage && !isSlowConnection) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      {showOfflineMessage && (
        <div className="bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <WifiOff size={16} />
          <span className="text-sm font-medium">You're offline</span>
        </div>
      )}

      {showReconnectedMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <Wifi size={16} />
          <span className="text-sm font-medium">Back online</span>
        </div>
      )}

      {!showOfflineMessage && !showReconnectedMessage && isSlowConnection && (
        <div className="bg-amber-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <Signal size={16} />
          <span className="text-sm font-medium">Slow connection</span>
        </div>
      )}
    </div>
  );
}
