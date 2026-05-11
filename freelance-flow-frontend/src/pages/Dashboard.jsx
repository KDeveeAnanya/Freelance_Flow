import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const name = localStorage.getItem('name');

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setStats(res.data))
      .catch((err) => {
        console.log('Dashboard error:', err.response?.status);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      });
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={s.shell}>
      <div style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.wordmark}>Freelance<span style={s.gold}>Flow</span></div>
          <div style={s.sideTagline}>your creative OS</div>
          <div style={s.navSection}>Main</div>
          {[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Clients',   path: '/clients' },
            { label: 'Projects',  path: '/projects' },
            { label: 'Invoices',  path: '/invoices' },
          ].map(item => (
            <Link key={item.path} to={item.path} style={{
              ...s.navItem,
              ...(location.pathname === item.path ? s.navActive : {})
            }}>
              {item.label}
            </Link>
          ))}
        </div>
        <div style={s.sideBottom}>
          <div style={s.avatar}>{name?.[0]?.toUpperCase()}</div>
          <div>
            <div style={s.userName}>{name}</div>
            <div style={s.logoutBtn} onClick={() => { localStorage.clear(); navigate('/login'); }}>
              Sign out
            </div>
          </div>
        </div>
      </div>

      <div style={s.main}>
        <div style={s.topBar}>
          <div>
            <div style={s.pageTitle}>{greeting()}, {name} 👋</div>
            <div style={s.pageDate}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <Link to="/invoices" style={s.ctaBtn}>+ New Invoice</Link>
        </div>

        {stats ? (
          <>
            <div style={s.statRow}>
              <div style={{...s.statCard, background:'#0d0d0d'}}>
                <div style={{...s.statLabel, color:'rgba(255,255,255,0.4)'}}>Total Earnings</div>
                <div style={{...s.statVal, color:'#f9c84a'}}>₹{stats.totalEarnings?.toLocaleString('en-IN')}</div>
                <div style={{...s.statSub, color:'rgba(255,255,255,0.25)'}}>received so far</div>
              </div>
              <div style={{...s.statCard, background:'#EEEDFE'}}>
                <div style={{...s.statLabel, color:'#534AB7'}}>Active Projects</div>
                <div style={{...s.statVal, color:'#26215C'}}>{stats.activeProjects}</div>
                <div style={{...s.statSub, color:'#7F77DD'}}>in progress</div>
              </div>
              <div style={{...s.statCard, background:'#E1F5EE'}}>
                <div style={{...s.statLabel, color:'#0F6E56'}}>Pending Invoices</div>
                <div style={{...s.statVal, color:'#04342C'}}>{stats.pendingInvoices}</div>
                <div style={{...s.statSub, color:'#1D9E75'}}>awaiting payment</div>
              </div>
              <div style={{...s.statCard, background:'#FAEEDA'}}>
                <div style={{...s.statLabel, color:'#854F0B'}}>Total Clients</div>
                <div style={{...s.statVal, color:'#412402'}}>{stats.totalClients}</div>
                <div style={{...s.statSub, color:'#BA7517'}}>in your network</div>
              </div>
            </div>

            <div style={s.sectionTitle}>Quick Actions</div>
            <div style={s.quickRow}>
              {[
                { label: 'Add Client', path: '/clients', bg: '#0d0d0d', color: '#f9c84a' },
                { label: 'New Project', path: '/projects', bg: '#EEEDFE', color: '#26215C' },
                { label: 'Create Invoice', path: '/invoices', bg: '#E1F5EE', color: '#04342C' },
              ].map(q => (
                <Link key={q.path} to={q.path} style={{...s.quickCard, background: q.bg, color: q.color}}>
                  {q.label} →
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div style={s.loading}>Loading your workspace...</div>
        )}
      </div>
    </div>
  );
}

const s = {
  shell: { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  sidebar: { width: '220px', background: '#0d0d0d', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 0', flexShrink: 0 },
  sideTop: { display: 'flex', flexDirection: 'column' },
  wordmark: { fontSize: '13px', fontWeight: '500', color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase', padding: '0 20px', marginBottom: '4px' },
  gold: { color: '#f9c84a' },
  sideTagline: { fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 20px', marginBottom: '28px' },
  navSection: { fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 20px', marginBottom: '6px' },
  navItem: { display: 'block', padding: '9px 20px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', borderLeft: '2px solid transparent' },
  navActive: { color: '#fff', background: 'rgba(249,200,74,0.08)', borderLeft: '2px solid #f9c84a' },
  sideBottom: { display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px 0', borderTop: '0.5px solid rgba(255,255,255,0.06)' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%', background: '#f9c84a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: '#0d0d0d', flexShrink: 0 },
  userName: { fontSize: '12px', color: 'rgba(255,255,255,0.6)' },
  logoutBtn: { fontSize: '11px', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', marginTop: '2px' },
  main: { flex: 1, background: '#f5f4f0', padding: '32px 36px', overflowY: 'auto' },
  topBar: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' },
  pageTitle: { fontSize: '28px', fontWeight: '500', color: '#0d0d0d', letterSpacing: '-0.02em' },
  pageDate: { fontSize: '12px', color: '#999', marginTop: '4px' },
  ctaBtn: { background: '#0d0d0d', color: '#f9c84a', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textDecoration: 'none', letterSpacing: '0.02em' },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' },
  statCard: { borderRadius: '10px', padding: '16px 18px' },
  statLabel: { fontSize: '10px', fontWeight: '500', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' },
  statVal: { fontSize: '28px', fontWeight: '500', letterSpacing: '-0.02em' },
  statSub: { fontSize: '10px', marginTop: '4px' },
  sectionTitle: { fontSize: '11px', fontWeight: '500', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: '12px' },
  quickRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  quickCard: { display: 'block', padding: '16px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '500', textDecoration: 'none', letterSpacing: '0.01em' },
  loading: { fontSize: '14px', color: '#999', marginTop: '40px' },
};