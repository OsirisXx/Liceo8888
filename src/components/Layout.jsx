import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, 
  FileText, 
  Search, 
  LogOut, 
  Shield, 
  Building2,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const Layout = ({ children }) => {
  const { user, userRole, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  const publicLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/submit', label: 'Submit Complaint', icon: FileText },
    { path: '/track', label: 'Track Status', icon: Search },
  ]

  const adminLinks = [
    { path: '/admin', label: 'Admin Dashboard', icon: Shield },
  ]

  const departmentLinks = [
    { path: '/department', label: 'Department Dashboard', icon: Building2 },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-maroon-800 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
                <span className="text-maroon-800 font-bold text-lg">L</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold">Liceo 8888</h1>
                <p className="text-xs text-gold-300">Complaint Management System</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {publicLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-gold-500 text-maroon-800 font-semibold'
                      : 'hover:bg-maroon-700 text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}

              {user && userRole === 'admin' && adminLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-gold-500 text-maroon-800 font-semibold'
                      : 'hover:bg-maroon-700 text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}

              {user && userRole === 'department' && departmentLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-gold-500 text-maroon-800 font-semibold'
                      : 'hover:bg-maroon-700 text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}

              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-maroon-700 transition-all duration-200"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive('/login')
                      ? 'bg-gold-500 text-maroon-800 font-semibold'
                      : 'hover:bg-maroon-700 text-white border border-gold-500'
                  }`}
                >
                  <span>Staff Login</span>
                </Link>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-maroon-700 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-maroon-900 border-t border-maroon-700">
            <nav className="px-4 py-3 space-y-1">
              {publicLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-gold-500 text-maroon-800 font-semibold'
                      : 'hover:bg-maroon-700 text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}

              {user && userRole === 'admin' && adminLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-gold-500 text-maroon-800 font-semibold'
                      : 'hover:bg-maroon-700 text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}

              {user && userRole === 'department' && departmentLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-gold-500 text-maroon-800 font-semibold'
                      : 'hover:bg-maroon-700 text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}

              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-maroon-700 transition-all duration-200 w-full text-left"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-maroon-700 transition-all duration-200 border border-gold-500"
                >
                  <span>Staff Login</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-maroon-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center">
                <span className="text-maroon-800 font-bold text-sm">L</span>
              </div>
              <div>
                <p className="font-semibold">Liceo de Cagayan University</p>
                <p className="text-sm text-gray-400">Complaint Management System</p>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} Liceo 8888. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
