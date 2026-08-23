import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiGrid, 
  FiShoppingBag, 
  FiUsers, 
  FiBox, 
  FiLogOut, 
  FiExternalLink,
  FiTag,
  FiMessageSquare,
  FiSettings,
  FiRotateCcw,
  FiTruck,
  FiMapPin
} from 'react-icons/fi';

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Overview', path: '/admin', icon: <FiGrid />, end: true },
    { name: 'Products', path: '/admin/products', icon: <FiBox /> },
    { name: 'Orders', path: '/admin/orders', icon: <FiShoppingBag /> },
    { name: 'Returns', path: '/admin/returns', icon: <FiRotateCcw /> },
    { name: 'Delivery', path: '/admin/delivery', icon: <FiMapPin /> },
    { name: 'Shipping Rates', path: '/admin/shipping-rates', icon: <FiTruck /> },
    { name: 'Coupons', path: '/admin/coupons', icon: <FiTag /> },
    { name: 'Queries', path: '/admin/queries', icon: <FiMessageSquare /> },
    { name: 'Users', path: '/admin/users', icon: <FiUsers /> },
    { name: 'Settings', path: '/admin/settings', icon: <FiSettings /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: 260, 
        background: 'var(--bg2)', 
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100
      }}>
        <div style={{ padding: '32px 24px' }}>
          <h1 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 24, 
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            ODDLY <span style={{ fontSize: 10, padding: '2px 6px', background: 'rgba(232, 201, 126, 0.1)', borderRadius: 4, color: 'var(--accent)', letterSpacing: 1 }}>ADMIN</span>
          </h1>
        </div>

        <nav style={{ flex: 1, padding: '0 16px' }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 10,
                color: isActive ? 'var(--accent)' : 'var(--text2)',
                background: isActive ? 'rgba(232, 201, 126, 0.05)' : 'transparent',
                marginBottom: 4,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s'
              })}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={() => navigate('/')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              width: '100%', 
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text2)',
              fontSize: 14,
              cursor: 'pointer',
              marginBottom: 8
            }}
          >
            <FiExternalLink />
            View Store
          </button>
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              width: '100%', 
              padding: '12px 16px',
              background: 'rgba(224, 82, 82, 0.05)',
              border: 'none',
              color: 'var(--danger)',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: 260, padding: 40 }}>
        <Outlet context={{}} />
      </main>
    </div>
  );
}
