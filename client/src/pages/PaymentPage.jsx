import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Building2, CheckCircle2, CreditCard, Landmark, Plus, ShieldCheck, Smartphone, WalletCards, X } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const METHODS = ['Card', 'Bank Transfer', 'Chowly Wallet', 'Apple Pay Demo', 'Google Pay Demo'];

function methodIcon(method) {
  if (method === 'Card') return <CreditCard size={19} />;
  if (method === 'Bank Transfer') return <Landmark size={19} />;
  if (method === 'Chowly Wallet') return <WalletCards size={19} />;
  return <Smartphone size={19} />;
}

export default function PaymentPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState('Card');
  const [savedMethods, setSavedMethods] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedId, setSelectedId] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [addForm, setAddForm] = useState({ cardholder: '', cardNumber: '', expiry: '', cvv: '', bankName: '', accountName: '', accountNumber: '', label: '', email: '' });

  const loadPaymentMethods = async () => {
    const { data } = await api.get('/payments/methods');
    setSavedMethods(data.paymentMethods || []);
    setWalletBalance(Number(data.walletBalance || 0));
  };

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data));
    loadPaymentMethods().catch(() => setError('Could not load your saved payment methods.'));
  }, [id]);

  const currentMethods = useMemo(() => savedMethods.filter(item => item.type === method), [savedMethods, method]);

  useEffect(() => {
    setSelectedId(currentMethods[0]?._id || '');
    setShowAdd(currentMethods.length === 0);
    setError('');
  }, [method, savedMethods]);

  if (user?.type !== 'customer') return <Navigate to="/login" replace />;
  if (!order) return <main className="container page"><div className="empty">Loading payment…</div></main>;

  const total = order.grandTotal + Number(tipAmount || 0);

  const updateAdd = (key, value) => setAddForm(prev => ({ ...prev, [key]: value }));

  const addMethod = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { type: method, ...addForm };
      const { data } = await api.post('/payments/methods', payload);
      setSavedMethods(data.paymentMethods || []);
      setShowAdd(false);
      setSelectedId(data.paymentMethod?._id || '');
      setAddForm({ cardholder: '', cardNumber: '', expiry: '', cvv: '', bankName: '', accountName: '', accountNumber: '', label: '', email: '' });
    } catch (err) { setError(err.response?.data?.message || 'Could not save this payment method.'); }
  };

  const pay = async () => {
    setError('');
    setBusy(true);
    try {
      await api.post('/payments', {
        orderId: order._id,
        method,
        paymentMethodId: selectedId || null,
        tipAmount: Number(tipAmount),
        tipStaffId: order.waiter?._id || null
      });
      setSuccess(true);
    } catch (err) { setError(err.response?.data?.message || 'Payment failed'); }
    finally { setBusy(false); }
  };

  const canConfirm = method === 'Bank Transfer' || Boolean(selectedId);

  return (
    <main className="container page narrow">
      <div className="page-title">
        <span className="eyebrow">Make payment</span>
        <h1>Choose how you want to pay.</h1>
        <p className="warning"><ShieldCheck /> This is a simulated academic payment. No real money or bank credentials are processed.</p>
      </div>

      <section className="form-card payment-flow">
        <div className="summary-row grand"><span>Order total</span><strong>₦{order.grandTotal.toLocaleString()}</strong></div>

        <label>Payment method
          <select value={method} onChange={e => setMethod(e.target.value)}>
            {METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </label>

        <div className="payment-method-panel">
          <div className="payment-method-heading">
            <div className="payment-method-title">{methodIcon(method)}<span>{method}</span></div>
            {currentMethods.length > 0 && <span className="muted small-text">Saved for this account</span>}
          </div>

          {method === 'Bank Transfer' ? (
            <>
              <div className="bank-transfer-box">
                <div><small>Bank</small><strong>{order.restaurant?.bankName || 'Chowly Demo Bank'}</strong></div>
                <div><small>Account name</small><strong>{order.restaurant?.bankAccountName || `${order.restaurant?.name || 'Restaurant'} Payments`}</strong></div>
                <div><small>Account number</small><strong className="account-number">{order.restaurant?.bankAccountNumber || '1012345678'}</strong></div>
                <p className="muted small-text">Transfer exactly ₦{total.toLocaleString()} to the account above, then click “I have transferred”.</p>
              </div>
              {currentMethods.length > 0 && <div className="saved-method-list">{currentMethods.map(item => <button type="button" className={`saved-method ${selectedId === item._id ? 'selected' : ''}`} key={item._id} onClick={() => setSelectedId(item._id)}>{methodIcon(method)}<span>{item.label}</span></button>)}</div>}
              <button type="button" className="btn ghost full add-method" onClick={() => setShowAdd(v => !v)}><Plus size={17}/> {showAdd ? 'Cancel adding bank account' : 'Add another bank account'}</button>
            </>
          ) : (
            <>
              {currentMethods.length > 0 && !showAdd && (
                <div className="saved-method-list">
                  {currentMethods.map(item => <button type="button" className={`saved-method ${selectedId === item._id ? 'selected' : ''}`} key={item._id} onClick={() => setSelectedId(item._id)}>
                    {methodIcon(method)}<span>{item.label}</span><strong>{selectedId === item._id ? 'Selected' : 'Use'}</strong>
                  </button>)}
                </div>
              )}
              {method === 'Chowly Wallet' && <div className="wallet-balance"><span>Available Chowly Wallet balance</span><strong>₦{walletBalance.toLocaleString()}</strong>{walletBalance < total && <small>Insufficient balance for this order.</small>}</div>}
              {currentMethods.length > 0 && <button type="button" className="btn ghost full add-method" onClick={() => setShowAdd(v => !v)}><Plus size={17}/> {showAdd ? 'Cancel' : method === 'Card' ? 'Add another card' : `Connect another ${method.replace(' Demo', '')} account`}</button>}
            </>
          )}

          {showAdd && (
            <form className="payment-add-form" onSubmit={addMethod}>
              <h3>{currentMethods.length ? 'Add another payment method' : `Add your ${method}`}</h3>
              {method === 'Card' && <>
                <label>Cardholder name<input value={addForm.cardholder} onChange={e => updateAdd('cardholder', e.target.value)} placeholder="Name on card" required /></label>
                <label>Card number<input inputMode="numeric" value={addForm.cardNumber} onChange={e => updateAdd('cardNumber', e.target.value)} placeholder="1234 5678 9012 3456" maxLength="19" required /></label>
                <div className="payment-two-col"><label>Expiry<input value={addForm.expiry} onChange={e => updateAdd('expiry', e.target.value)} placeholder="MM/YY" maxLength="5" required /></label><label>CVV<input type="password" inputMode="numeric" value={addForm.cvv} onChange={e => updateAdd('cvv', e.target.value)} placeholder="•••" maxLength="4" required /></label></div>
                <p className="muted small-text">For this demo, the full card number and CVV are never saved. Only the card brand, last four digits and expiry are remembered.</p>
              </>}
              {method === 'Bank Transfer' && <><label>Bank name<input value={addForm.bankName} onChange={e => updateAdd('bankName', e.target.value)} placeholder="Your bank" required /></label><label>Account name<input value={addForm.accountName} onChange={e => updateAdd('accountName', e.target.value)} placeholder="Account holder name" required /></label><label>Account number<input inputMode="numeric" value={addForm.accountNumber} onChange={e => updateAdd('accountNumber', e.target.value)} placeholder="10-digit account number" maxLength="10" required /></label></>}
              {method === 'Chowly Wallet' && <label>Wallet name<input value={addForm.label} onChange={e => updateAdd('label', e.target.value)} placeholder="e.g. My Chowly Wallet" required /></label>}
              {(method === 'Apple Pay Demo' || method === 'Google Pay Demo') && <label>Connected account email<input type="email" value={addForm.email} onChange={e => updateAdd('email', e.target.value)} placeholder="you@example.com" required /></label>}
              <button className="btn full" type="submit">Save and use this {method === 'Card' ? 'card' : 'payment method'}</button>
            </form>
          )}
        </div>

        <label>Tip for staff (optional)
          <input type="number" min="0" step="100" value={tipAmount} onChange={e => setTipAmount(e.target.value)} />
        </label>
        <div className="summary-row"><span>Amount to pay</span><strong>₦{total.toLocaleString()}</strong></div>
        {error && <p className="error">{error}</p>}
        <button className="btn big full" disabled={busy || !canConfirm || (method === 'Chowly Wallet' && walletBalance < total)} onClick={pay}>
          {busy ? 'Processing…' : method === 'Bank Transfer' ? 'I have transferred' : 'Confirm and make payment'}
        </button>
      </section>

      {success && <div className="payment-success-overlay" role="dialog" aria-modal="true">
        <div className="payment-success-modal">
          <button className="icon-btn success-close" onClick={() => navigate(`/orders/${order._id}`)} aria-label="Close"><X size={18}/></button>
          <CheckCircle2 size={64} className="success-icon" />
          <h2>Payment successful!</h2>
          <p>₦{total.toLocaleString()} has been recorded for order <strong>#{order._id.slice(-6).toUpperCase()}</strong>.</p>
          <div className="success-actions"><button className="btn big full" onClick={() => navigate('/explore')}>Make another order</button><button className="btn ghost big full" onClick={() => navigate('/')}>Exit app</button></div>
        </div>
      </div>}
    </main>
  );
}
