import { ShoppingCart, Shield, User, ExternalLink, Monitor, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Launcher = () => {
  const openWindow = (role: string, title: string) => {
    const width = 1200;
    const height = 800;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
    
    window.open(`/?role=${role}`, `easymart-${role}`, features);
  };

  const openAllWindows = () => {
    // Open Manager window - top left
    window.open('/?role=manager', 'easymart-manager', 
      `width=900,height=700,left=50,top=50,resizable=yes,scrollbars=yes`
    );
    
    // Open Cashier window - top right
    setTimeout(() => {
      window.open('/?role=cashier', 'easymart-cashier', 
        `width=900,height=700,left=${window.screen.width - 950},top=50,resizable=yes,scrollbars=yes`
      );
    }, 300);
    
    // Open Customer window - bottom center
    setTimeout(() => {
      window.open('/?role=customer', 'easymart-customer', 
        `width=1000,height=600,left=${(window.screen.width - 1000) / 2},top=${window.screen.height - 700},resizable=yes,scrollbars=yes`
      );
    }, 600);
  };

  const roles = [
    {
      role: 'manager',
      title: 'Manager',
      icon: <Shield className="w-8 h-8" />,
      description: 'Manage inventory, view alerts, and update stock levels',
      gradient: 'gradient-primary',
    },
    {
      role: 'cashier',
      title: 'Cashier',
      icon: <ShoppingCart className="w-8 h-8" />,
      description: 'Process sales and scan product barcodes',
      gradient: 'gradient-success',
    },
    {
      role: 'customer',
      title: 'Customer Display',
      icon: <User className="w-8 h-8" />,
      description: 'View stock availability and product information',
      gradient: 'gradient-warning',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary mb-6">
            <ShoppingCart className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Easy Mart</h1>
          <p className="text-xl text-muted-foreground">
            Real-Time Supermarket Inventory Management System
          </p>
        </div>

        {/* Launch All Button */}
        <div className="text-center mb-8">
          <Button
            onClick={openAllWindows}
            size="xl"
            variant="gradientPrimary"
            className="shadow-lg"
          >
            <Maximize2 className="w-6 h-6" />
            Launch All Interfaces
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Opens all three interfaces in separate windows for simultaneous display
          </p>
        </div>

        {/* Individual Interface Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map(({ role, title, icon, description, gradient }) => (
            <div
              key={role}
              className="bg-card rounded-2xl border border-border p-6 hover:border-primary/50 transition-all group"
            >
              <div className={`w-16 h-16 rounded-xl ${gradient} flex items-center justify-center mb-4 text-primary-foreground`}>
                {icon}
              </div>
              <h2 className="text-xl font-bold mb-2">{title}</h2>
              <p className="text-sm text-muted-foreground mb-4">{description}</p>
              <Button
                onClick={() => openWindow(role, title)}
                variant="secondary"
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Window
              </Button>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Monitor className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Multi-Display Setup</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            For the best experience, open each interface on a separate monitor:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <strong>Manager Interface:</strong> Office computer for inventory management
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              <strong>Cashier Interface:</strong> POS terminal at checkout counter
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning" />
              <strong>Customer Display:</strong> Large screen facing customers
            </li>
          </ul>
          <div className="mt-4 p-3 rounded-lg bg-muted text-sm">
            <strong>Real-time Sync:</strong> All interfaces automatically update when sales are made or stock changes.
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p className="font-medium mb-2">Demo Credentials:</p>
          <div className="flex justify-center gap-6">
            <span><code className="bg-muted px-2 py-1 rounded">Manager: manager123</code></span>
            <span><code className="bg-muted px-2 py-1 rounded">Cashier: cashier123</code></span>
            <span><code className="bg-muted px-2 py-1 rounded">Customer: customer123</code></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Launcher;
