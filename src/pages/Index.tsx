import { useState, useEffect } from 'react';
import { UserRole } from '@/types/inventory';
import { LoginScreen } from '@/components/LoginScreen';
import { CustomerInterface } from '@/components/customer/CustomerInterface';
import { CashierInterface } from '@/components/cashier/CashierInterface';
import { ManagerInterface } from '@/components/manager/ManagerInterface';

const Index = () => {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [directRole, setDirectRole] = useState<UserRole | null>(null);

  // Check for URL parameter for direct role access - auto-login for customer
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam && ['manager', 'cashier', 'customer'].includes(roleParam)) {
      setDirectRole(roleParam as UserRole);
      // Auto-login for customer role (no password needed)
      if (roleParam === 'customer') {
        setCurrentRole('customer');
        sessionStorage.setItem('easymart-role', 'customer');
      }
    }
  }, []);

  // Check for stored session
  useEffect(() => {
    const storedRole = sessionStorage.getItem('easymart-role');
    if (storedRole && ['manager', 'cashier', 'customer'].includes(storedRole)) {
      setCurrentRole(storedRole as UserRole);
    }
  }, []);

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    sessionStorage.setItem('easymart-role', role);
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setDirectRole(null);
    sessionStorage.removeItem('easymart-role');
    // Clear URL params
    window.history.replaceState({}, '', window.location.pathname);
  };

  // If direct role is set via URL, use that (requires login still for security)
  const activeRole = currentRole || null;
  const targetRole = directRole || currentRole;

  // Show login screen with pre-selected role if coming from launcher
  if (!activeRole) {
    return <LoginScreen onLogin={handleLogin} preselectedRole={directRole} />;
  }

  // Ensure the logged in role matches the target role
  if (directRole && activeRole !== directRole) {
    return <LoginScreen onLogin={handleLogin} preselectedRole={directRole} />;
  }

  switch (activeRole) {
    case 'manager':
      return <ManagerInterface onLogout={handleLogout} />;
    case 'cashier':
      return <CashierInterface onLogout={handleLogout} />;
    case 'customer':
      return <CustomerInterface onLogout={handleLogout} />;
    default:
      return <LoginScreen onLogin={handleLogin} />;
  }
};

export default Index;
