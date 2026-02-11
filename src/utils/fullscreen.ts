export const requestFullscreen = async (): Promise<boolean> => {
  try {
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
      return true;
    } else if ((elem as any).webkitRequestFullscreen) {
      await (elem as any).webkitRequestFullscreen();
      return true;
    } else if ((elem as any).mozRequestFullScreen) {
      await (elem as any).mozRequestFullScreen();
      return true;
    } else if ((elem as any).msRequestFullscreen) {
      await (elem as any).msRequestFullscreen();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error requesting fullscreen:', error);
    return false;
  }
};

export const exitFullscreen = async (): Promise<boolean> => {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
      return true;
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen();
      return true;
    } else if ((document as any).mozCancelFullScreen) {
      await (document as any).mozCancelFullScreen();
      return true;
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error exiting fullscreen:', error);
    return false;
  }
};

export const toggleFullscreen = async (): Promise<boolean> => {
  if (isFullscreen()) {
    return await exitFullscreen();
  } else {
    return await requestFullscreen();
  }
};

export const isFullscreen = (): boolean => {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
};

export const addFullscreenChangeListener = (callback: (isFullscreen: boolean) => void): (() => void) => {
  const handler = () => callback(isFullscreen());

  document.addEventListener('fullscreenchange', handler);
  document.addEventListener('webkitfullscreenchange', handler);
  document.addEventListener('mozfullscreenchange', handler);
  document.addEventListener('MSFullscreenChange', handler);

  return () => {
    document.removeEventListener('fullscreenchange', handler);
    document.removeEventListener('webkitfullscreenchange', handler);
    document.removeEventListener('mozfullscreenchange', handler);
    document.removeEventListener('MSFullscreenChange', handler);
  };
};
