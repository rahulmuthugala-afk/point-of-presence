import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserRole } from '@/types/inventory';
import { ShoppingCart, User, Shield, Lock, ArrowRight, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
  preselectedRole?: UserRole | null;
}

// Default passwords for demo purposes
const CREDENTIALS: Record<UserRole, string> = {
  manager: 'manager123',
  cashier: 'cashier123',
  customer: 'customer123',
};

export function LoginScreen({ onLogin, preselectedRole }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(preselectedRole || null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (preselectedRole) {
      setSelectedRole(preselectedRole);
    }
  }, [preselectedRole]);

  const roles: { role: UserRole; label: string; icon: React.ReactNode; description: string }[] = [
    {
      role: 'manager',
      label: 'Manager',
      icon: <Shield className="w-8 h-8" />,
      description: 'Manage inventory, view alerts, and update stock',
    },
    {
      role: 'cashier',
      label: 'Cashier',
      icon: <ShoppingCart className="w-8 h-8" />,
      description: 'Process sales and scan barcodes',
    },
    {
      role: 'customer',
      label: 'Customer',
      icon: <User className="w-8 h-8" />,
      description: 'View stock availability and product info',
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setIsLoading(true);
    setError('');

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Customer role doesn't require password
    if (selectedRole === 'customer') {
      onLogin(selectedRole);
      setIsLoading(false);
      return;
    }

    if (password === CREDENTIALS[selectedRole]) {
      onLogin(selectedRole);
    } else {
      setError('Invalid password. Please try again.');
      setPassword('');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <ShoppingCart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Easy Mart</h1>
          <p className="text-muted-foreground mb-4">
            Real-Time Inventory Management System
          </p>
          {!preselectedRole && (
            <Link
              to="/launcher"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Maximize2 className="w-4 h-4" />
              Open Multi-Window Launcher
            </Link>
          )}
        </div>

        {/* Role Selection */}
        {!preselectedRole && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Select Your Role</h2>
            <div className="grid gap-3">
              {roles.map(({ role, label, icon, description }) => (
                <button
                  key={role}
                  onClick={() => {
                    setSelectedRole(role);
                    setPassword('');
                    setError('');
                  }}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                    selectedRole === role
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  <div
                    className={cn(
                      'p-3 rounded-lg',
                      selectedRole === role ? 'gradient-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    {icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{label}</div>
                    <div className="text-sm text-muted-foreground">{description}</div>
                  </div>
                  {selectedRole === role && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Preselected Role Banner */}
        {preselectedRole && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg gradient-primary text-primary-foreground">
                {roles.find(r => r.role === preselectedRole)?.icon}
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Logging in as</div>
                <div className="text-xl font-bold">
                  {roles.find(r => r.role === preselectedRole)?.label}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Form - Only show for manager and cashier */}
        {selectedRole && selectedRole !== 'customer' && (
          <form
            onSubmit={handleLogin}
            className="bg-card rounded-2xl border border-border p-6 animate-slide-up"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Enter Password
            </h2>

            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-danger animate-fade-in">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!password || isLoading}
              className={cn(
                'w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all',
                password && !isLoading
                  ? 'gradient-primary text-primary-foreground hover:opacity-90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Login as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Demo password: <code className="bg-muted px-2 py-1 rounded">{CREDENTIALS[selectedRole]}</code>
            </p>
          </form>
        )}

        {/* Customer Direct Login Button */}
        {selectedRole === 'customer' && (
          <form
            onSubmit={handleLogin}
            className="bg-card rounded-2xl border border-border p-6 animate-slide-up"
          >
            <p className="text-center text-muted-foreground mb-4">
              No password required for customer view
            </p>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all',
                !isLoading
                  ? 'gradient-primary text-primary-foreground hover:opacity-90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Enter Customer View
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
