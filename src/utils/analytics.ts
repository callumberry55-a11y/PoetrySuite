declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

export const initGA = () => {
  if (process.env.NODE_ENV === 'production') {
    // Initialize Google Analytics
  }
};

export const trackPageView = (path: string) => {
  if (process.env.NODE_ENV === 'production' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
    });
  }
};

export const trackEvent = (action: string, category: string, label: string, value?: number) => {
  if (process.env.NODE_ENV === 'production' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
