import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, X, Moon, Sun, Store } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <Store size={16} />
              </span>
              <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-xl">LocalConnect</span>
            </Link>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 p-2 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {user ? (
              <>
                <Link to="/" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                  Home
                </Link>
                {user.role === 'seller' ? (
                  <>
                    <Link to="/seller/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                      Seller Dashboard
                    </Link>
                    <Link to="/community" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                      Community
                    </Link>
                    <Link to="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                      Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/marketplace" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                      Marketplace
                    </Link>
                    <Link to="/community" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                      Community
                    </Link>
                    <Link to="/wishlist" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                      Wishlist
                    </Link>
                    <Link to="/cart" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                      Cart
                    </Link>
                    <Link to="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                      Profile
                    </Link>
                  </>
                )}
                <div className="relative ml-3 flex items-center gap-3 border-l border-zinc-200 pl-3 dark:border-zinc-700">
                  <div className="flex items-center gap-2">
                    {user.profileImage || user.avatar ? (
                      <img
                        src={user.profileImage || user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
                      />
                    ) : (
                      <div className="rounded-full bg-indigo-100 p-1 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                        <User size={20} />
                      </div>
                    )}
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-zinc-500 transition-colors hover:text-rose-500 dark:text-zinc-400"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/community" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                  Community
                </Link>
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                  Login
                </Link>
                <Link to="/register" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">
                  Sign up
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleTheme}
              className="mr-2 inline-flex items-center justify-center rounded-lg border border-zinc-300 p-2 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" aria-hidden="true" /> : <Menu className="block h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 border-t border-zinc-200/80 px-3 pb-3 pt-2 dark:border-zinc-800">
            {user ? (
              <>
                <div className="flex items-center space-x-3 border-b border-zinc-200 px-1 py-3 dark:border-zinc-800">
                  {user.profileImage || user.avatar ? (
                    <img
                      src={user.profileImage || user.avatar}
                      alt={user.name}
                      className="h-10 w-10 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
                    />
                  ) : (
                    <div className="rounded-full bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                      <User size={24} />
                    </div>
                  )}
                  <div>
                    <div className="text-base font-medium text-zinc-800 dark:text-zinc-100">{user.name}</div>
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{user.email}</div>
                  </div>
                </div>
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                >
                  Home
                </Link>
                <Link
                  to="/community"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                >
                  Community
                </Link>
                {user.role === 'seller' ? (
                  <>
                    <Link
                      to="/seller/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    >
                      Seller Dashboard
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    >
                      Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/marketplace"
                      onClick={() => setIsOpen(false)}
                      className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    >
                      Marketplace
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setIsOpen(false)}
                      className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    >
                      Wishlist
                    </Link>
                    <Link
                      to="/cart"
                      onClick={() => setIsOpen(false)}
                      className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    >
                      Cart
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    >
                      Profile
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-base font-medium text-rose-500 hover:bg-zinc-100 hover:text-rose-600 dark:hover:bg-zinc-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/community"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                >
                  Community
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg bg-zinc-900 px-3 py-2 text-base font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
