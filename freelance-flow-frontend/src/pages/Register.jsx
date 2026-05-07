import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch {
      setError('Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.leftInner}>
          <div style={s.wordmark}>Freelance<span style={s.gold}>Flow</span></div>
          <div style={s.bigLine}>Start your</div>
          <div style={s.bigLine}><span style={s.gold}>journey.</span></div>
          <p style={s.leftSub}>Join freelancers who track their work and get paid on time.</p>
          <div style={s.leftFooter}>Built for freelancers who mean business.</div>
        </div>
      </div>
      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.formTitle}>Create account</h2>
          <p style={s.formSub}>Free forever. No credit card needed.</p>
          {error && <div style={s.error}>{error}</div>}
          <form onSubmit={handleSubmit}>
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Ananya K.' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { key: 'phone', label: 'Phone', type: 'text', placeholder: '9999999999' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            ].map(f => (
              <div style={s.field} key={f.key}>
                <label style={s.label}>{f.label}</label>
                <input style={s.input} type={f.type} placeholder={f.placeholder}
                  value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required />
              </div>
            ))}
            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? 'Creating account...' : '→ Create account'}
            </button>
          </form>
          <p style={s.switchLink}>
            Already have an account? <Link to="/login" style={s.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh' },
  left: { flex: 1, background: '#0d0d0d', display: 'flex', alignItems: 'center', padding: '60px' },
  leftInner: { maxWidth: '420px' },
  wordmark: { fontSize: '13px', fontWeight: '500', color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '48px', opacity: 0.6 },
  gold: { color: '#f9c84a' },
  bigLine: { fontSize: '52px', fontWeight: '500', color: '#fff', lineHeight: '1.05', letterSpacing: '-0.02em' },
  leftSub: { fontSize: '14px', color: 'rgba(255,255,255,0.35)', marginTop: '24px', lineHeight: '1.6' },
  leftFooter: { marginTop: '64px', fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em', textTransform: 'uppercase' },
  right: { width: '480px', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  card: { width: '100%', maxWidth: '360px' },
  formTitle: { fontSize: '28px', fontWeight: '500', color: '#0d0d0d', letterSpacing: '-0.02em', marginBottom: '4px' },
  formSub: { fontSize: '13px', color: '#999', marginBottom: '32px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '11px', fontWeight: '500', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#666', marginBottom: '6px' },
  input: { width: '100%', padding: '12px 14px', background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: '8px', fontSize: '14px', color: '#0d0d0d', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '13px', background: '#0d0d0d', color: '#f9c84a', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', letterSpacing: '0.02em', marginTop: '8px' },
  error: { background: '#FCEBEB', color: '#A32D2D', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  switchLink: { textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#999' },
  link: { color: '#0d0d0d', fontWeight: '500', textDecoration: 'none' },
};