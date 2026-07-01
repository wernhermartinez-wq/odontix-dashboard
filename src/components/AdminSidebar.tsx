import odontixLogo from "@/assets/odontixsinfondo.png";

export type AdminPage = 'overview' | 'clinicas' | 'pipeline';

interface AdminSidebarProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  viewingAs: { id: string; nombre: string } | null;
  onExitViewAs: () => void;
  onSignOut: () => void;
}

const navItems = [
  {
    id: 'overview' as AdminPage,
    label: 'Vision global',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'clinicas' as AdminPage,
    label: 'Clinicas',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'pipeline' as AdminPage,
    label: 'Pipeline',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
];

const activeStyle = {
  background: 'rgba(19,122,140,0.18)',
  color: '#1a9db5',
  boxShadow: 'inset 0 0 0 1px rgba(19,122,140,0.25)',
};
const inactiveStyle = { color: 'rgba(240,240,245,0.45)' };

export default function AdminSidebar({ currentPage, onNavigate, viewingAs, onExitViewAs, onSignOut }: AdminSidebarProps) {
  return (
    <aside style={{ background: '#071a1f', borderRight: '1px solid rgba(19,122,140,0.12)' }} className="w-64 flex-shrink-0 flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(19,122,140,0.12)' }}>
        <div className="flex items-center gap-3">
          <img
            src={odontixLogo}
            alt="Odontix"
            style={{ height: '36px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(59,110,232,0.4))' }}
          />
          <span style={{ color: 'rgba(255,187,0,0.9)', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(255,187,0,0.12)', border: '1px solid rgba(255,187,0,0.2)', borderRadius: '0.375rem', padding: '0.15rem 0.5rem' }}>
            Admin
          </span>
        </div>
      </div>

      {/* Viewing as banner */}
      {viewingAs && (
        <div className="mx-3 mt-3 rounded-lg px-3 py-2.5" style={{ background: 'rgba(255,187,0,0.07)', border: '1px solid rgba(255,187,0,0.2)' }}>
          <p style={{ color: '#FFBB00', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.2rem' }}>Viendo como:</p>
          <p className="text-white text-sm font-semibold truncate">{viewingAs.nombre}</p>
          <button onClick={onExitViewAs} style={{ color: '#FFBB00', fontSize: '0.72rem', marginTop: '0.4rem', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
            Volver al admin
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p style={{ color: 'rgba(19,122,140,0.5)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }} className="px-3 mb-3">Gestion</p>
        {navItems.slice(0, 2).map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all"
            style={currentPage === item.id ? activeStyle : inactiveStyle}
            onMouseEnter={(e) => { if (currentPage !== item.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(240,240,245,0.85)'; } }}
            onMouseLeave={(e) => { if (currentPage !== item.id) { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(240,240,245,0.45)'; } }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <div className="pt-4">
          <p style={{ color: 'rgba(19,122,140,0.5)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }} className="px-3 mb-3">Ventas</p>
          {navItems.slice(2).map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all"
              style={currentPage === item.id ? activeStyle : inactiveStyle}
              onMouseEnter={(e) => { if (currentPage !== item.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(240,240,245,0.85)'; } }}
              onMouseLeave={(e) => { if (currentPage !== item.id) { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(240,240,245,0.45)'; } }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(19,122,140,0.12)' }}>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all"
          style={{ color: 'rgba(240,240,245,0.35)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(240,240,245,0.8)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(240,240,245,0.35)'; }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
