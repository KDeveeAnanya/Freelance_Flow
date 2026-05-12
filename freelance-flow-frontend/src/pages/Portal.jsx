import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

export default function Portal() {
  const { token } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    api.get(`/portal/${token}`)
      .then(res => {
        setData(res.data);
        setConfirmed(res.data.confirmed);
      })
      .catch(() => setError('This link is invalid or has expired.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await api.post(`/portal/${token}/confirm`);
      setConfirmed(true);
      setData(prev => ({ ...prev, confirmed: true, status: 'SENT' }));
    } catch (e) {
      alert('Already confirmed or something went wrong.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return (
    <div style={s.center}>
      <div style={s.loadingText}>Loading your project details...</div>
    </div>
  );

  if (error) return (
    <div style={s.center}>
      <div style={s.errorBox}>
        <div style={s.errorIcon}>⚠</div>
        <div style={s.errorTitle}>Link Not Found</div>
        <div style={s.errorSub}>{error}</div>
      </div>
    </div>
  );

  return (
    <div style={s.shell}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.wordmark}>Freelance<span style={s.gold}>Flow</span></div>
        <div style={s.headerSub}>Project Agreement</div>
      </div>

      <div style={s.body}>
        {/* Confirmed banner */}
        {confirmed && (
          <div style={s.confirmedBanner}>
            ✓ You have confirmed this project agreement
          </div>
        )}

        {/* From / To */}
        <div style={s.metaRow}>
          <div style={s.metaBlock}>
            <div style={s.metaLabel}>From</div>
            <div style={s.metaValue}>{data.freelancerName}</div>
            <div style={s.metaSub}>Freelancer</div>
          </div>
          <div style={s.arrow}>→</div>
          <div style={s.metaBlock}>
            <div style={s.metaLabel}>To</div>
            <div style={s.metaValue}>{data.clientName}</div>
            <div style={s.metaSub}>Client</div>
          </div>
        </div>

        {/* Project details */}
        <div style={s.card}>
          <div style={s.cardLabel}>Project</div>
          <div style={s.cardTitle}>{data.projectTitle}</div>
          <div style={s.cardDesc}>{data.projectDesc}</div>
        </div>

        {/* Invoice details */}
        <div style={s.card}>
          <div style={s.cardLabel}>Invoice Details</div>
          <div style={s.row}>
            <div style={s.rowLabel}>Invoice Number</div>
            <div style={s.rowValue}>{data.invoiceNumber}</div>
          </div>
          <div style={s.row}>
            <div style={s.rowLabel}>Total Amount</div>
            <div style={s.rowValueBold}>₹{data.totalAmount?.toLocaleString('en-IN')}</div>
          </div>
          {data.dueDate && (
            <div style={s.row}>
              <div style={s.rowLabel}>Due Date</div>
              <div style={s.rowValue}>{data.dueDate}</div>
            </div>
          )}
          <div style={s.row}>
            <div style={s.rowLabel}>Status</div>
            <div style={s.rowValue}>{data.status?.replace('_', ' ')}</div>
          </div>
        </div>

        {/* Agreement text */}
        <div style={s.agreementBox}>
          <div style={s.agreementTitle}>Project Agreement</div>
          <div style={s.agreementText}>
            By confirming below, <strong>{data.clientName}</strong> agrees to engage{' '}
            <strong>{data.freelancerName}</strong> for the project{' '}
            <strong>"{data.projectTitle}"</strong> as described above, for a total amount of{' '}
            <strong>₹{data.totalAmount?.toLocaleString('en-IN')}</strong>
            {data.dueDate ? `, due by ${data.dueDate}` : ''}.
            This confirmation serves as acknowledgment of the project scope and payment terms.
          </div>
        </div>

        {/* Confirm button */}
        {!confirmed ? (
          <button style={s.confirmBtn} onClick={handleConfirm} disabled={confirming}>
            {confirming ? 'Confirming...' : '✓ I Agree — Confirm Project'}
          </button>
        ) : (
          <div style={s.doneBox}>
            <div style={s.doneIcon}>🎉</div>
            <div style={s.doneTitle}>Agreement Confirmed!</div>
            <div style={s.doneSub}>
              Thank you, {data.clientName}. {data.freelancerName} has been notified.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  shell: { minHeight: '100vh', background: '#f5f4f0', fontFamily: "'Inter', sans-serif" },
  center: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f4f0', fontFamily: "'Inter', sans-serif" },
  loadingText: { fontSize: '14px', color: '#999' },
  errorBox: { textAlign: 'center', padding: '40px' },
  errorIcon: { fontSize: '32px', marginBottom: '12px' },
  errorTitle: { fontSize: '20px', fontWeight: '500', color: '#0d0d0d', marginBottom: '8px' },
  errorSub: { fontSize: '14px', color: '#999' },

  header: { background: '#0d0d0d', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { fontSize: '14px', fontWeight: '500', color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase' },
  gold: { color: '#f9c84a' },
  headerSub: { fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase' },

  body: { maxWidth: '600px', margin: '0 auto', padding: '40px 20px' },

  confirmedBanner: { background: '#E1F5EE', color: '#0F6E56', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', marginBottom: '24px', textAlign: 'center' },

  metaRow: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  metaBlock: { flex: 1, background: '#fff', borderRadius: '10px', padding: '16px', border: '0.5px solid rgba(0,0,0,0.06)' },
  metaLabel: { fontSize: '10px', fontWeight: '500', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: '4px' },
  metaValue: { fontSize: '15px', fontWeight: '500', color: '#0d0d0d' },
  metaSub: { fontSize: '11px', color: '#bbb', marginTop: '2px' },
  arrow: { fontSize: '20px', color: '#ccc' },

  card: { background: '#fff', borderRadius: '12px', padding: '20px 24px', marginBottom: '16px', border: '0.5px solid rgba(0,0,0,0.06)' },
  cardLabel: { fontSize: '10px', fontWeight: '500', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: '8px' },
  cardTitle: { fontSize: '18px', fontWeight: '500', color: '#0d0d0d', marginBottom: '6px' },
  cardDesc: { fontSize: '13px', color: '#666', lineHeight: '1.6' },

  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.04)' },
  rowLabel: { fontSize: '13px', color: '#999' },
  rowValue: { fontSize: '13px', color: '#0d0d0d' },
  rowValueBold: { fontSize: '15px', fontWeight: '600', color: '#0d0d0d' },

  agreementBox: { background: '#FAEEDA', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', border: '0.5px solid rgba(249,200,74,0.3)' },
  agreementTitle: { fontSize: '12px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#854F0B', marginBottom: '10px' },
  agreementText: { fontSize: '13px', color: '#5C3A0A', lineHeight: '1.7' },

  confirmBtn: { width: '100%', background: '#0d0d0d', color: '#f9c84a', padding: '16px', borderRadius: '10px', fontSize: '15px', fontWeight: '500', border: 'none', cursor: 'pointer', letterSpacing: '0.02em' },

  doneBox: { textAlign: 'center', padding: '32px', background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.06)' },
  doneIcon: { fontSize: '36px', marginBottom: '12px' },
  doneTitle: { fontSize: '20px', fontWeight: '500', color: '#0d0d0d', marginBottom: '8px' },
  doneSub: { fontSize: '13px', color: '#999', lineHeight: '1.6' },
};