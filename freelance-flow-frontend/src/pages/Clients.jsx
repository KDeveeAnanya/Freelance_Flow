import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Sidebar = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem('name');
  return (
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
          }}>{item.label}</Link>
        ))}
      </div>
      <div style={s.sideBottom}>
        <div style={s.avatar}>{name?.[0]?.toUpperCase()}</div>
        <div>
          <div style={s.userName}>{name}</div>
          <div style={s.logoutBtn} onClick={() => { localStorage.clear(); navigate('/login'); }}>Sign out</div>
        </div>
      </div>
    </div>
  );
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', companyName: '' });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', companyName: '' });

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = () => {
    api.get('/clients').then(res => setClients(res.data));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/clients', form);
      setForm({ name: '', email: '', phone: '', companyName: '' });
      setShowForm(false);
      fetchClients();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e, id) => {
    e.preventDefault();
    await api.put(`/clients/${id}`, editForm);
    setEditingId(null);
    fetchClients();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this client?')) {
      await api.delete(`/clients/${id}`);
      fetchClients();
    }
  };

  return (
    <div style={s.shell}>
      <Sidebar />
      <div style={s.main}>
        <div style={s.topBar}>
          <div>
            <div style={s.pageTitle}>Clients</div>
            <div style={s.pageDate}>{clients.length} client{clients.length !== 1 ? 's' : ''} in your network</div>
          </div>
          <button style={s.ctaBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Client'}
          </button>
        </div>

        {showForm && (
          <div style={s.formCard}>
            <div style={s.formTitle}>New Client</div>
            <form onSubmit={handleAdd}>
              <div style={s.formGrid}>
                {[
                  { key: 'name', label: 'Full Name', placeholder: 'Rahul Kumar' },
                  { key: 'email', label: 'Email', placeholder: 'rahul@studio.com' },
                  { key: 'phone', label: 'Phone', placeholder: '8888888888' },
                  { key: 'companyName', label: 'Company', placeholder: 'Rahul Studio' },
                ].map(f => (
                  <div key={f.key} style={s.field}>
                    <label style={s.label}>{f.label}</label>
                    <input style={s.input} placeholder={f.placeholder}
                      value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required />
                  </div>
                ))}
              </div>
              <button style={s.submitBtn} type="submit" disabled={loading}>
                {loading ? 'Adding...' : '→ Add Client'}
              </button>
            </form>
          </div>
        )}

        {clients.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyTitle}>No clients yet</div>
            <div style={s.emptySub}>Add your first client to get started</div>
          </div>
        ) : (
          <div style={s.grid}>
            {clients.map(client => (
              <div key={client.id} style={s.card}>
                {editingId === client.id ? (
                  <form onSubmit={e => handleEdit(e, client.id)}>
                    {[
                      { key: 'name', placeholder: 'Full Name' },
                      { key: 'email', placeholder: 'Email' },
                      { key: 'phone', placeholder: 'Phone' },
                      { key: 'companyName', placeholder: 'Company' },
                    ].map(f => (
                      <div key={f.key} style={{ marginBottom: '8px' }}>
                        <input style={s.input} placeholder={f.placeholder}
                          value={editForm[f.key]} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} />
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button style={s.submitBtn} type="submit">Save</button>
                      <button style={s.cancelBtn} type="button" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div style={s.cardTop}>
                      <div style={s.clientAvatar}>{client.name?.[0]?.toUpperCase()}</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={s.editBtn} onClick={() => {
                          setEditingId(client.id);
                          setEditForm({ name: client.name, email: client.email, phone: client.phone, companyName: client.companyName });
                        }}>✎</button>
                        <button style={s.deleteBtn} onClick={() => handleDelete(client.id)}>✕</button>
                      </div>
                    </div>
                    <div style={s.clientName}>{client.name}</div>
                    <div style={s.clientCompany}>{client.companyName}</div>
                    <div style={s.clientInfo}>{client.email}</div>
                    <div style={s.clientInfo}>{client.phone}</div>
                  </>
                )}
              </div>
            ))}
          </div>
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
  topBar: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' },
  pageTitle: { fontSize: '28px', fontWeight: '500', color: '#0d0d0d', letterSpacing: '-0.02em' },
  pageDate: { fontSize: '12px', color: '#999', marginTop: '4px' },
  ctaBtn: { background: '#0d0d0d', color: '#f9c84a', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', border: 'none', cursor: 'pointer' },
  formCard: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '0.5px solid rgba(0,0,0,0.06)' },
  formTitle: { fontSize: '15px', fontWeight: '500', color: '#0d0d0d', marginBottom: '16px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' },
  field: {},
  label: { display: 'block', fontSize: '11px', fontWeight: '500', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#666', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', background: '#f5f4f0', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '13px', color: '#0d0d0d', outline: 'none', boxSizing: 'border-box' },
  submitBtn: { background: '#0d0d0d', color: '#f9c84a', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', border: 'none', cursor: 'pointer' },
  cancelBtn: { background: '#f5f4f0', color: '#666', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', border: 'none', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '80px 0' },
  emptyTitle: { fontSize: '18px', fontWeight: '500', color: '#0d0d0d', marginBottom: '8px' },
  emptySub: { fontSize: '13px', color: '#999' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  card: { background: '#fff', borderRadius: '12px', padding: '20px', border: '0.5px solid rgba(0,0,0,0.06)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  clientAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: '#534AB7' },
  editBtn: { background: 'none', border: 'none', color: '#7F77DD', cursor: 'pointer', fontSize: '14px' },
  deleteBtn: { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '14px' },
  clientName: { fontSize: '14px', fontWeight: '500', color: '#0d0d0d', marginBottom: '2px' },
  clientCompany: { fontSize: '12px', color: '#7F77DD', marginBottom: '8px' },
  clientInfo: { fontSize: '12px', color: '#999', marginBottom: '2px' },
};