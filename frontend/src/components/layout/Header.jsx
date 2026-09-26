import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Menu, Shield } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Common navigation links for all users
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/disasters', label: 'Disasters' },
    { to: '/shelters', label: 'Shelters' },
    { to: '/reports', label: 'Reports' },
    { to: '/disaster-history', label: 'History' },
    { to: '/resource-demand', label: 'Resources' },
  ];

  // Admin-only links
  const adminLinks = [
    { to: '/admin/reports', label: 'Verify Reports' },
    { to: '/admin/shelters', label: 'Manage Shelters' },
    { to: '/admin/resources', label: 'Post Resources' },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/dlogo2.png" 
                alt="DURJOG Logo" 
                className="h-8 w-auto" 
              />
        
            <span className="font-bold text-xl text-gray-900">DURJOG</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </button>
                {adminDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                    {adminLinks.map(link => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setAdminDropdownOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="hidden sm:inline text-sm">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Login
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 border-t border-gray-200">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <div className="border-t mt-2 pt-2">
                <div className="px-3 py-1 text-xs text-gray-500 uppercase">Admin</div>
                {adminLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;