import { Link, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, Plane, Building2, Route } from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/', icon: BarChart3 },
  { name: 'Flights', href: '/flights', icon: Plane },
  { name: 'Airlines', href: '/airlines', icon: Building2 },
  { name: 'Routes', href: '/routes', icon: Route },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 p-6 border-b">
            <Plane className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold">Flights Dashboard</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t text-sm text-gray-500">
            <p>Flights Dashboard v1.0</p>
            <p className="text-xs mt-1">Built with React & FastAPI</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <Outlet />
      </div>
    </div>
  );
}
