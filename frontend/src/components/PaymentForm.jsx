import React, { useState } from 'react'
import { CreditCard } from 'lucide-react'

function CardVisual({ number, holder, expiry }) {
  const displayNum = number ? number.replace(/\s/g, '').padEnd(16, '•').match(/.{1,4}/g).join(' ') : '•••• •••• •••• ••••'
  return (
    <div className="cc-visual">
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 20 }}>
        <CreditCard style={{ width: 20, height: 20 }} />
      </div>
      <div className="cc-num">{displayNum}</div>
      <div className="cc-meta">
        <div>
          <div style={{ fontSize: 9, opacity: 0.7, textTransform: 'uppercase', marginBottom: 2 }}>Card Holder</div>
          <div className="cc-holder">{holder || 'YOUR NAME'}</div>
        </div>
        <div>
          <div style={{ fontSize: 9, opacity: 0.7, textTransform: 'uppercase', marginBottom: 2 }}>Expires</div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>{expiry || 'MM/YY'}</div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentForm({ onSubmit }) {
  const [tab, setTab] = useState('single')
  const [card, setCard] = useState({ number: '', holder: '', expiry: '', cvv: '' })
  const [card2, setCard2] = useState({ number: '', holder: '', expiry: '', cvv: '', amount: '' })
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')

  const formatCardNumber = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const formatExpiry = (val) => {
    const d = val.replace(/\D/g, '').slice(0, 4)
    return d.length >= 2 ? d.slice(0, 2) + '/' + d.slice(2) : d
  }
  const formatCvv = (val) => val.replace(/\D/g, '').slice(0, 3)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!agree) { setError('Please agree to the terms to continue.'); return }
    if (!card.number || !card.holder || !card.expiry || !/^\d{3}$/.test(card.cvv)) {
      setError('CVV must be 3 digits.')
      return
    }
    if (tab === 'multi' && (!card2.number || !card2.holder || !card2.expiry || !/^\d{3}$/.test(card2.cvv))) {
      setError('CVV must be 3 digits.')
      return
    }
    if (tab === 'multi' && !card2.amount) {
      setError('Please fill in all card details.')
      return
    }
    setError('')
    const payload = { card, tab }
    if (tab === 'multi') payload.card2 = card2
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bcard-title" style={{ marginBottom: 14 }}>Payment Method</div>
      <div className="pay-tabs">
        <button type="button" className={`pay-tab ${tab === 'single' ? 'active' : ''}`} onClick={() => setTab('single')}>
          Single Card
        </button>
        <button type="button" className={`pay-tab ${tab === 'multi' ? 'active' : ''}`} onClick={() => setTab('multi')}>
          Split Payment
        </button>
      </div>

      <div className="cc-layout">
        <div className="cc-fields">
          <input
            className="form-inp"
            placeholder="Card number"
            value={card.number}
            onChange={e => setCard(c => ({ ...c, number: formatCardNumber(e.target.value) }))}
            maxLength={19}
          />
          <input
            className="form-inp"
            placeholder="Cardholder name"
            value={card.holder}
            onChange={e => setCard(c => ({ ...c, holder: e.target.value }))}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input
              className="form-inp"
              placeholder="MM/YY"
              value={card.expiry}
              onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
              maxLength={5}
            />
            <input
              className="form-inp"
              placeholder="CVV"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={card.cvv}
              onChange={e => setCard(c => ({ ...c, cvv: formatCvv(e.target.value) }))}
              maxLength={3}
            />
          </div>
        </div>
        <CardVisual number={card.number} holder={card.holder} expiry={card.expiry} />
      </div>

      {tab === 'multi' && (
        <div className="multi-card" style={{ marginTop: 16 }}>
          <div className="multi-card-head">Second Card</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="form-inp" placeholder="Card number" value={card2.number} onChange={e => setCard2(c => ({ ...c, number: formatCardNumber(e.target.value) }))} maxLength={19} />
            <input className="form-inp" placeholder="Cardholder name" value={card2.holder} onChange={e => setCard2(c => ({ ...c, holder: e.target.value }))} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <input className="form-inp" placeholder="MM/YY" value={card2.expiry} onChange={e => setCard2(c => ({ ...c, expiry: formatExpiry(e.target.value) }))} maxLength={5} />
              <input className="form-inp" placeholder="CVV" type="password" inputMode="numeric" pattern="[0-9]*" value={card2.cvv} onChange={e => setCard2(c => ({ ...c, cvv: formatCvv(e.target.value) }))} maxLength={3} />
              <input className="form-inp" placeholder="Amount $" type="number" value={card2.amount} onChange={e => setCard2(c => ({ ...c, amount: e.target.value }))} />
            </div>
          </div>
        </div>
      )}

      <label className="agree-row" style={{ marginTop: 16 }}>
        <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
        I agree to the Terms of Service and Privacy Policy. I confirm the booking details are correct.
      </label>

      {error && <div className="payment-error show">{error}</div>}

      <button type="submit" className="btn-proceed" style={{ marginTop: 18 }}>
        <CreditCard style={{ width: 18, height: 18 }} />
        Complete Payment
      </button>
    </form>
  )
}
