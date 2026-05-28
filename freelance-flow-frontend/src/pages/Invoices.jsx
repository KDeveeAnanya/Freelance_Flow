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
  DRAFT:          { bg: '#f5f4f0', color: '#999' },
  SENT:           { bg: '#FAEEDA', color: '#854F0B' },
  PARTIALLY_PAID: { bg: '#EEEDFE', color: '#534AB7' },
  PAID:           { bg: '#E1F5EE', color: '#0F6E56' },
};

export default function Invoices() {
  const [projects, setProjects]               = useState([]);
  const [invoices, setInvoices]               = useState([]);
  const [showForm, setShowForm]               = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(null);
  const [editingInvoice, setEditingInvoice]   = useState(null);
  const [payments, setPayments]               = useState({});
  const [loading, setLoading]                 = useState(false);
  const [copiedId, setCopiedId]               = useState(null); // ← for copy feedback
  const [form, setForm]       = useState({ projectId: '', totalAmount: '', dueDate: '' });
  const [payForm, setPayForm] = useState({ amount: '', paymentMode: 'UPI', referenceId: '', note: '' });
  const [editForm, setEditForm] = useState({ totalAmount: '', dueDate: '', status: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const clientsRes = await api.get('/clients');
    const allProjects = await Promise.all(
      clientsRes.data.map(c => api.get(`/projects/client/${c.id}`).then(r => r.data))
    );
    const flat = allProjects.flat();
    setProjects(flat);
    const allInvoices = await Promise.all(
      flat.map(p => api.get(`/invoices/project/${p.id}`).then(r => r.data))
    );
    setInvoices(allInvoices.flat());
  };

  const fetchPayments = async (invoiceId) => {
    const res = await api.get(`/invoices/${invoiceId}/payments`);
    setPayments(prev => ({ ...prev, [invoiceId]: res.data }));
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/invoices', {
        projectId:   parseInt(form.projectId),
        totalAmount: parseFloat(form.totalAmount),
        dueDate:     form.dueDate || null
      });
      setForm({ projectId: '', totalAmount: '', dueDate: '' });
      setShowForm(false);
      fetchAll();
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e, invoiceId) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/invoices/${invoiceId}/payments`, {
        amount:      parseFloat(payForm.amount),
        paymentMode: payForm.paymentMode,
        referenceId: payForm.referenceId,
        note:        payForm.note
      });
      setPayForm({ amount: '', paymentMode: 'UPI', referenceId: '', note: '' });
      setShowPaymentForm(null);
      fetchAll();
      fetchPayments(invoiceId);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (inv) => {
    setEditingInvoice(inv.id);
    setEditForm({
      totalAmount: inv.totalAmount,
      dueDate:     inv.dueDate || '',
      status:      inv.status,
    });
    setShowPaymentForm(null);
  };

  const handleEditInvoice = async (e, invoiceId) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/invoices/${invoiceId}`, {
        totalAmount: parseFloat(editForm.totalAmount),
        dueDate:     editForm.dueDate || null,
        status:      editForm.status,
      });
      setEditingInvoice(null);
      fetchAll();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Delete this invoice? This cannot be undone.')) return;
    await api.delete(`/invoices/${invoiceId}`);
    fetchAll();
  };

  // ── NEW: Copy portal link ────────────────────────────────────────────────
  const handleCopyLink = (inv) => {
    const link = `${window.location.origin}/portal/${inv.portalToken}`;
    navigator.clipboard.writeText(link);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2000); // reset after 2s
  };

  return (
    <div style={s.shell}>
      <Sidebar />
      <div style={s.main}>
        <div style={s.topBar}>
          <div>
            <div style={s.pageTitle}>Invoices</div>
            <div style={s.pageDate}>{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total</div>
          </div>
          <button style={s.ctaBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ New Invoice'}
          </button>
        </div>

        {showForm && (
          <div style={s.formCard}>
            <div style={s.formTitle}>New Invoice</div>
            <form onSubmit={handleCreateInvoice}>
              <div style={s.formGrid}>
                <div style={s.field}>
                  <label style={s.label}>Project</label>
                  <select style={s.input} value={form.projectId}
                    onChange={e => setForm({...form, projectId: e.target.value})} required>
                    <option value="">Select project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title} — {p.client?.name}</option>
                    ))}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Total Amount (₹)</label>
                  <input style={s.input} type="number" placeholder="15000"
                    value={form.totalAmount}
                    onChange={e => setForm({...form, totalAmount: e.target.value})} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Due Date</label>
                  <input style={s.input} type="date"
                    value={form.dueDate}
                    onChange={e => setForm({...form, dueDate: e.target.value})} />
                </div>
              </div>
              <button style={s.submitBtn} type="submit" disabled={loading}>
                {loading ? 'Creating...' : '→ Create Invoice'}
              </button>
            </form>
          </div>
        )}

        {invoices.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyTitle}>No invoices yet</div>
            <div style={s.emptySub}>Create your first invoice to start tracking payments</div>
          </div>
        ) : (
          <div style={s.list}>
            {invoices.map(inv => (
              <div key={inv.id} style={s.card}>
                <div style={s.cardTop}>
                  <div style={s.cardLeft}>
                    <div style={s.invNumber}>{inv.invoiceNumber}</div>
                    <div style={s.invProject}>{inv.project?.title} · {inv.project?.client?.name}</div>
                    {inv.dueDate && <div style={s.invDate}>Due: {inv.dueDate}</div>}
                  </div>
                  <div style={s.cardRight}>
                    <div style={s.amountBlock}>
                      <div style={s.amountPaid}>₹{inv.amountPaid?.toLocaleString('en-IN')} paid</div>
                      <div style={s.amountTotal}>of ₹{inv.totalAmount?.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{...s.statusBadge, ...statusColors[inv.status]}}>
                      {inv.status.replace('_', ' ')}
                    </div>

                    {/* ── Copy portal link ── */}
                    <button style={{
                      ...s.copyBtn,
                      ...(copiedId === inv.id ? s.copyBtnDone : {})
                    }} onClick={() => handleCopyLink(inv)}>
                      {copiedId === inv.id ? '✓ Copied!' : '🔗 Copy Link'}
                    </button>

                    <button style={s.editBtn} onClick={() =>
                      editingInvoice === inv.id ? setEditingInvoice(null) : handleEditClick(inv)
                    }>
                      {editingInvoice === inv.id ? '✕' : '✎ Edit'}
                    </button>

                    <button style={s.payBtn} onClick={() => {
                      setShowPaymentForm(showPaymentForm === inv.id ? null : inv.id);
                      fetchPayments(inv.id);
                    }}>
                      {showPaymentForm === inv.id ? '✕' : '+ Payment'}
                    </button>

                    <button style={s.deleteBtn} onClick={() => handleDeleteInvoice(inv.id)}>
                      🗑
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={s.progressBg}>
                  <div style={{
                    ...s.progressFill,
                    width: `${Math.min(100, (inv.amountPaid / inv.totalAmount) * 100)}%`
                  }} />
                </div>

                {/* Edit form */}
                {editingInvoice === inv.id && (
                  <div style={s.payFormWrap}>
                    <div style={s.payHistoryTitle}>Edit Invoice</div>
                    <form onSubmit={e => handleEditInvoice(e, inv.id)}>
                      <div style={s.editGrid}>
                        <div style={s.field}>
                          <label style={s.label}>Total Amount (₹)</label>
                          <input style={s.input} type="number"
                            value={editForm.totalAmount}
                            onChange={e => setEditForm({...editForm, totalAmount: e.target.value})} required />
                        </div>
                        <div style={s.field}>
                          <label style={s.label}>Due Date</label>
                          <input style={s.input} type="date"
                            value={editForm.dueDate}
                            onChange={e => setEditForm({...editForm, dueDate: e.target.value})} />
                        </div>
                        <div style={s.field}>
                          <label style={s.label}>Status</label>
                          <select style={s.input} value={editForm.status}
                            onChange={e => setEditForm({...editForm, status: e.target.value})}>
                            <option value="DRAFT">Draft</option>
                            <option value="SENT">Sent</option>
                            <option value="PARTIALLY_PAID">Partially Paid</option>
                            <option value="PAID">Paid</option>
                          </select>
                        </div>
                      </div>
                      <button style={s.submitBtn} type="submit" disabled={loading}>
                        {loading ? 'Saving...' : '→ Save Changes'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Payment form */}
                {showPaymentForm === inv.id && (
                  <div style={s.payFormWrap}>
                    <form onSubmit={e => handleAddPayment(e, inv.id)}>
                      <div style={s.payGrid}>
                        <div style={s.field}>
                          <label style={s.label}>Amount (₹)</label>
                          <input style={s.input} type="number" placeholder="5000"
                            value={payForm.amount}
                            onChange={e => setPayForm({...payForm, amount: e.target.value})} required />
                        </div>
                        <div style={s.field}>
                          <label style={s.label}>Payment Mode</label>
                          <select style={s.input} value={payForm.paymentMode}
                            onChange={e => setPayForm({...payForm, paymentMode: e.target.value})}>
                            <option value="UPI">UPI</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="CHEQUE">Cheque</option>
                          </select>
                        </div>
                        <div style={s.field}>
                          <label style={s.label}>Reference ID</label>
                          <input style={s.input} placeholder="UPI123456"
                            value={payForm.referenceId}
                            onChange={e => setPayForm({...payForm, referenceId: e.target.value})} required />
                        </div>
                        <div style={s.field}>
                          <label style={s.label}>Note</label>
                          <input style={s.input} placeholder="First installment"
                            value={payForm.note}
                            onChange={e => setPayForm({...payForm, note: e.target.value})} />
                        </div>
                      </div>
                      <button style={s.submitBtn} type="submit" disabled={loading}>
                        {loading ? 'Saving...' : '→ Record Payment'}
                      </button>
                    </form>

                    {payments[inv.id]?.length > 0 && (
                      <div style={s.payHistory}>
                        <div style={s.payHistoryTitle}>Payment History</div>
                        {payments[inv.id].map(p => (
                          <div key={p.id} style={s.payRow}>
                            <div>
                              <div style={s.payAmount}>₹{p.amount?.toLocaleString('en-IN')}</div>
                              <div style={s.payRef}>{p.paymentMode} · Ref: {p.referenceId}</div>
                            </div>
                            <div style={s.payDate}>{p.paymentDate}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' },
  editGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' },
  field: {},
  label: { display: 'block', fontSize: '11px', fontWeight: '500', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#666', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', background: '#f5f4f0', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '13px', color: '#0d0d0d', outline: 'none', boxSizing: 'border-box' },
  submitBtn: { background: '#0d0d0d', color: '#f9c84a', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', border: 'none', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '80px 0' },
  emptyTitle: { fontSize: '18px', fontWeight: '500', color: '#0d0d0d', marginBottom: '8px' },
  emptySub: { fontSize: '13px', color: '#999' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { background: '#fff', borderRadius: '12px', padding: '20px 24px', border: '0.5px solid rgba(0,0,0,0.06)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  cardLeft: {},
  invNumber: { fontSize: '13px', fontWeight: '600', color: '#0d0d0d', marginBottom: '2px' },
  invProject: { fontSize: '12px', color: '#7F77DD', marginBottom: '2px' },
  invDate: { fontSize: '11px', color: '#bbb' },
  cardRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  amountBlock: { textAlign: 'right' },
  amountPaid: { fontSize: '15px', fontWeight: '500', color: '#0d0d0d' },
  amountTotal: { fontSize: '11px', color: '#999' },
  statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' },
  copyBtn: { background: '#EEEDFE', color: '#534AB7', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', border: 'none', cursor: 'pointer', transition: 'all 0.2s' },
  copyBtnDone: { background: '#E1F5EE', color: '#0F6E56' },
  editBtn: { background: '#f5f4f0', color: '#0d0d0d', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', border: '0.5px solid rgba(0,0,0,0.1)', cursor: 'pointer' },
  payBtn: { background: '#0d0d0d', color: '#f9c84a', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', border: 'none', cursor: 'pointer' },
  deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px' },
  progressBg: { height: '4px', background: '#f0f0f0', borderRadius: '2px', overflow: 'hidden' },
  progressFill: { height: '100%', background: '#0d0d0d', borderRadius: '2px', transition: 'width 0.3s ease' },
  payFormWrap: { marginTop: '16px', paddingTop: '16px', borderTop: '0.5px solid rgba(0,0,0,0.06)' },
  payGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' },
  payHistory: { marginTop: '16px', paddingTop: '16px', borderTop: '0.5px solid rgba(0,0,0,0.06)' },
  payHistoryTitle: { fontSize: '11px', fontWeight: '500', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', marginBottom: '10px' },
  payRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.04)' },
  payAmount: { fontSize: '13px', fontWeight: '500', color: '#0d0d0d' },
  payRef: { fontSize: '11px', color: '#999', marginTop: '2px' },
  payDate: { fontSize: '11px', color: '#bbb' },
};