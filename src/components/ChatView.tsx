import { useRef, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

export default function ChatView() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const webViewUrl = 'https://chat-design--callumberry55.replit.app/';

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      setError(false);
      iframeRef.current.src = webViewUrl;
    }
  };

  const handleOpenExternal = () => {
    window.open(webViewUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Chat</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Refresh"
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 text-slate-700 dark:text-slate-300 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenExternal}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Open in new tab"
          >
            <ExternalLink className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Web View Content */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-900 z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading chat...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-900 z-10">
            <div className="flex flex-col items-center gap-4 text-center px-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Failed to Load
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Unable to load the chat interface. Please check your connection and try again.
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={webViewUrl}
          className="w-full h-full border-0 block"
          title="Chat"
          onLoad={handleLoad}
          onError={handleError}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
}
