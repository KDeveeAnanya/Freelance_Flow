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

const statusColors = {
  ACTIVE:    { bg: '#E1F5EE', color: '#0F6E56' },
  COMPLETED: { bg: '#EEEDFE', color: '#534AB7' },
  ON_HOLD:   { bg: '#FAEEDA', color: '#854F0B' },
};

export default function Projects() {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', totalAmount: '',
    startDate: '', dueDate: '', clientId: ''
  });

  useEffect(() => {
    api.get('/clients').then(res => setClients(res.data));
    fetchAllProjects();
  }, []);

  const fetchAllProjects = async () => {
    try {
      const clientsRes = await api.get('/clients');
      const allProjects = await Promise.all(
        clientsRes.data.map(c => api.get(`/projects/client/${c.id}`).then(r => r.data))
      );
      setProjects(allProjects.flat());
    } catch (e) {
      console.log(e);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/projects', {
        ...form,
        totalAmount: parseFloat(form.totalAmount),
        clientId: parseInt(form.clientId)
      });
      setForm({ title: '', description: '', totalAmount: '', startDate: '', dueDate: '', clientId: '' });
      setShowForm(false);
      fetchAllProjects();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    await api.put(`/projects/${id}/status?status=${status}`);
    fetchAllProjects();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this project?')) {
      await api.delete(`/projects/${id}`);
      fetchAllProjects();
    }
  };

  return (
    <div style={s.shell}>
      <Sidebar />
      <div style={s.main}>
        <div style={s.topBar}>
          <div>
            <div style={s.pageTitle}>Projects</div>
            <div style={s.pageDate}>{projects.length} project{projects.length !== 1 ? 's' : ''} total</div>
          </div>
          <button style={s.ctaBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ New Project'}
          </button>
        </div>

        {showForm && (
          <div style={s.formCard}>
            <div style={s.formTitle}>New Project</div>
            <form onSubmit={handleAdd}>
              <div style={s.formGrid}>
                <div style={s.field}>
                  <label style={s.label}>Project Title</label>
                  <input style={s.input} placeholder="Logo Design"
                    value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Client</label>
                  <select style={s.input} value={form.clientId}
                    onChange={e => setForm({...form, clientId: e.target.value})} required>
                    <option value="">Select client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Total Amount (₹)</label>
                  <input style={s.input} type="number" placeholder="15000"
                    value={form.totalAmount} onChange={e => setForm({...form, totalAmount: e.target.value})} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Description</label>
                  <input style={s.input} placeholder="Brief description"
                    value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Start Date</label>
                  <input style={s.input} type="date"
                    value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Due Date</label>
                  <input style={s.input} type="date"
                    value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
                </div>
              </div>
              <button style={s.submitBtn} type="submit" disabled={loading}>
                {loading ? 'Creating...' : '→ Create Project'}
              </button>
            </form>
          </div>
        )}

        {projects.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyTitle}>No projects yet</div>
            <div style={s.emptySub}>Create your first project to get started</div>
          </div>
        ) : (
          <div style={s.list}>
            {projects.map(project => (
              <div key={project.id} style={s.card}>
                <div style={s.cardLeft}>
                  <div style={s.projectTitle}>{project.title}</div>
                  <div style={s.projectClient}>{project.client?.name} · {project.client?.companyName}</div>
                  {project.description && <div style={s.projectDesc}>{project.description}</div>}
                  <div style={s.projectMeta}>
                    {project.startDate && <span>Start: {project.startDate}</span>}
                    {project.dueDate && <span style={{marginLeft: '12px'}}>Due: {project.dueDate}</span>}
                  </div>
                </div>
                <div style={s.cardRight}>
                  <div style={s.amount}>₹{project.totalAmount?.toLocaleString('en-IN')}</div>
                  <select style={{...s.statusBadge, ...statusColors[project.status]}}
                    value={project.status}
                    onChange={e => handleStatusChange(project.id, e.target.value)}>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                  <button style={s.deleteBtn} onClick={() => handleDelete(project.id)}>✕</button>
                </div>
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
  empty: { textAlign: 'center', padding: '80px 0' },
  emptyTitle: { fontSize: '18px', fontWeight: '500', color: '#0d0d0d', marginBottom: '8px' },
  emptySub: { fontSize: '13px', color: '#999' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { background: '#fff', borderRadius: '12px', padding: '20px 24px', border: '0.5px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardLeft: { flex: 1 },
  projectTitle: { fontSize: '15px', fontWeight: '500', color: '#0d0d0d', marginBottom: '4px' },
  projectClient: { fontSize: '12px', color: '#7F77DD', marginBottom: '4px' },
  projectDesc: { fontSize: '12px', color: '#999', marginBottom: '6px' },
  projectMeta: { fontSize: '11px', color: '#bbb' },
  cardRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  amount: { fontSize: '16px', fontWeight: '500', color: '#0d0d0d' },
  statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', border: 'none', cursor: 'pointer' },
  deleteBtn: { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '14px' },
};