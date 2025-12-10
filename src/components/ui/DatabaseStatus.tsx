import { Database, DatabaseZap, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatabaseStatusProps {
  isConnected: boolean;
  isLoading: boolean;
  error?: string | null;
  className?: string;
}

export function DatabaseStatus({ 
  isConnected, 
  isLoading, 
  error,
  className 
}: DatabaseStatusProps) {
  return (
    <div 
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
        isLoading && 'bg-warning/20 text-warning',
        isConnected && !isLoading && 'bg-success/20 text-success',
        !isConnected && !isLoading && 'bg-danger/20 text-danger',
        className
      )}
      title={error || (isConnected ? 'Connected to SQLite Database' : 'Using Local Storage')}
    >
      {isLoading ? (
        <>
          <DatabaseZap className="w-3.5 h-3.5 animate-pulse" />
          <span>Connecting...</span>
        </>
      ) : isConnected ? (
        <>
          <Database className="w-3.5 h-3.5" />
          <span>SQLite</span>
          <Wifi className="w-3 h-3 opacity-70" />
        </>
      ) : (
        <>
          <Database className="w-3.5 h-3.5" />
          <span>Local</span>
          <WifiOff className="w-3 h-3 opacity-70" />
        </>
      )}
    </div>
  );
}
