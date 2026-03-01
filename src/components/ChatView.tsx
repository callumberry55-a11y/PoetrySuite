import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';

interface ChatViewProps {
  onBack?: () => void;
}

export default function ChatView({ onBack }: ChatViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const webViewUrl = 'https://chat-design--callumberry55.replit.app/';

  useEffect(() => {
    setIsLoading(true);
    setError(false);
  }, []);

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
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-on-surface" />
            </button>
          )}
          <h1 className="text-xl font-semibold text-on-surface">Chat</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
            aria-label="Refresh"
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 text-on-surface ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenExternal}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
            aria-label="Open in new tab"
          >
            <ExternalLink className="w-5 h-5 text-on-surface" />
          </button>
        </div>
      </div>

      {/* Web View Content */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-on-surface-muted">Loading chat...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="flex flex-col items-center gap-4 text-center px-6">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-error" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-on-surface mb-2">
                  Failed to Load
                </h3>
                <p className="text-on-surface-muted mb-4">
                  Unable to load the chat interface. Please check your connection and try again.
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors"
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
          className="w-full h-full border-0"
          title="Chat"
          onLoad={handleLoad}
          onError={handleError}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
}
