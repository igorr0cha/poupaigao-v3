
import { useEffect } from 'react';

interface UseAutoRefreshProps {
  onRefresh: () => void;
  interval?: number;
}

export const useAutoRefresh = ({ onRefresh, interval = 30000 }: UseAutoRefreshProps) => {
  useEffect(() => {
    const intervalId = setInterval(onRefresh, interval);
    
    // Também atualizar quando a aba se torna ativa novamente
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        onRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onRefresh, interval]);
};
