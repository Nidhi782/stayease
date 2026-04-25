// ── Services.jsx ─────────────────────────────────────────────────────────────
// Hostel services page: Laundry, Transport, and fee structure overview.

const FEE_PLANS = [
  { type: 'Double AC',        fee: 145000, icon: '❄️', popular: true },
  { type: 'Double Non-AC',    fee: 130000, icon: '🌬️', popular: false },
  { type: 'Triple AC',        fee: 135000, icon: '❄️', popular: false },
  { type: 'Triple Non-AC',    fee: 115000, icon: '🌬️', popular: false },
]

const TRANSPORT_ROUTES = [
  { route: 'City Center ↔ Hostel',     time: '7:00 AM & 6:00 PM',   days: 'Mon–Sat' },
  { route: 'Railway Station ↔ Hostel', time: '8:00 AM & 8:00 PM',   days: 'Daily' },
  { route: 'Market / Mall Shuttle',    time: '11:00 AM & 5:00 PM',  days: 'Sat–Sun' },
  { route: 'College / University',     time: '8:30 AM & 4:30 PM',   days: 'Mon–Fri' },
]

const LAUNDRY_PLANS = [
  { plan: 'Basic',    items: '10 items/week',  price: '₹500/month',  features: ['Wash & Dry', 'Folding', '48h turnaround'] },
  { plan: 'Standard', items: '20 items/week',  price: '₹900/month',  features: ['Wash, Dry & Iron', 'Folding', '24h turnaround', 'Stain treatment'] },
  { plan: 'Premium',  items: 'Unlimited',      price: '₹1,400/month',features: ['Wash, Dry & Iron', 'Dry cleaning', 'Same-day delivery', 'Wardrobe management'] },
]

function fmt(n) {
  return '₹' + n.toLocaleString('en-IN')
}

function Services() {
  return (
    <div className="min-h-screen bg-[#f0faf5]">

      {/* ── Header ── */}
      <div className="bg-[#0d1f17] py-14 px-6 text-center">
        <p className="text-[#5DCAA5] text-sm font-semibold tracking-widest uppercase mb-2">Everything Included</p>
        <h1 className="text-4xl font-bold text-white mb-3">🏨 Hostel Services</h1>
        <p className="text-[#a0d4be] max-w-xl mx-auto text-sm leading-relaxed">
          StayEase provides a complete living experience — comfortable rooms, transport,
          laundry, mess, and 24/7 support. Everything you need, in one place.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">

        {/* ── Fee Structure ── */}
        <section>
          <SectionHeader icon="💰" title="Fee Structure" subtitle="10-month academic session · Pre-booking: ₹10,000 (adjusted in 1st installment)" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
            {FEE_PLANS.map(p => (
              <div
                key={p.type}
                className={`rounded-2xl p-6 shadow-sm border-2 relative ${
                  p.popular ? 'border-[#1D9E75] bg-white' : 'border-gray-100 bg-white'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1D9E75] text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="font-bold text-[#1a1a2e] text-sm mb-1">{p.type}</h3>
                <p className="text-2xl font-extrabold text-[#1D9E75]">{fmt(p.fee)}</p>
                <p className="text-xs text-gray-400 mt-1">per session (10 months)</p>
                <div className="mt-4 space-y-2 text-xs text-[#2d4a3e]">
                  <div className="flex justify-between border-t pt-2">
                    <span>Full payment (5% off)</span>
                    <span className="font-bold text-[#1D9E75]">{fmt(Math.round(p.fee * 0.95 - 10000))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Installment 1 (Day 1)</span>
                    <span className="font-bold">{fmt(Math.round(p.fee / 3) - 10000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Installment 2 (Day 46)</span>
                    <span className="font-bold">{fmt(Math.round(p.fee / 3))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Installment 3 (Day 91)</span>
                    <span className="font-bold">{fmt(Math.round(p.fee / 3))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Referral & Pre-booking callout */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-[#1D9E75] to-[#0d6e52] rounded-2xl p-5 text-white">
              <p className="text-2xl mb-2">🎁</p>
              <h4 className="font-bold text-lg">Referral Bonus</h4>
              <p className="text-sm opacity-90 mt-1">
                Refer a friend who takes admission and earn <strong>₹2,000 credit</strong> 
                adjusted in your next installment. No limit on referrals!
              </p>
            </div>
            <div className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] rounded-2xl p-5 text-white">
              <p className="text-2xl mb-2">🔐</p>
              <h4 className="font-bold text-lg">Pre-Booking</h4>
              <p className="text-sm opacity-90 mt-1">
                Secure your room with a <strong>₹10,000 pre-booking amount</strong>.
                This is fully adjusted in your first installment — no extra cost!
              </p>
            </div>
          </div>
        </section>

        {/* ── Laundry ── */}
        <section>
          <SectionHeader icon="👕" title="Laundry Service" subtitle="In-house professional laundry — never worry about washing clothes again" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            {LAUNDRY_PLANS.map((p, i) => (
              <div key={p.plan} className={`rounded-2xl p-6 shadow-sm bg-white border-2 ${i === 1 ? 'border-[#1D9E75]' : 'border-gray-100'}`}>
                {i === 1 && <span className="bg-[#1D9E75] text-white text-xs font-bold px-3 py-1 rounded-full">Recommended</span>}
                <h3 className="font-bold text-[#1a1a2e] text-xl mt-3">{p.plan}</h3>
                <p className="text-sm text-gray-500 mb-2">{p.items}</p>
                <p className="text-2xl font-extrabold text-[#1D9E75] mb-4">{p.price}</p>
                <ul className="space-y-2">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#2d4a3e]">
                      <span className="text-[#1D9E75]">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-sm text-blue-800">
            📌 Laundry bags are collected from your room door. Clean clothes are returned to your room. 
            Special care for delicate fabrics available on request.
          </div>
        </section>

        {/* ── Transport ── */}
        <section>
          <SectionHeader icon="🚌" title="Transport Service" subtitle="Scheduled shuttles to key locations — never miss a trip" />
          <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#0d1f17] text-white">
                <tr>
                  <th className="py-3 px-5 text-left">Route</th>
                  <th className="py-3 px-5 text-left">Timings</th>
                  <th className="py-3 px-5 text-left">Days</th>
                  <th className="py-3 px-5 text-left">Fare</th>
                </tr>
              </thead>
              <tbody>
                {TRANSPORT_ROUTES.map((r, i) => (
                  <tr key={r.route} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-3 px-5 font-medium text-[#1a1a2e]">{r.route}</td>
                    <td className="py-3 px-5 text-[#2d4a3e]">{r.time}</td>
                    <td className="py-3 px-5 text-[#2d4a3e]">{r.days}</td>
                    <td className="py-3 px-5">
                      <span className="bg-[#f0faf5] text-[#1D9E75] font-bold px-3 py-1 rounded-full text-xs">Included</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-sm text-green-800">
            🚌 Transport is included in the hostel fee. Book your seat 1 day in advance via the hostel office.
            Private cab arrangements available at extra cost.
          </div>
        </section>

        {/* ── Other Amenities ── */}
        <section>
          <SectionHeader icon="✨" title="Other Amenities" subtitle="Everything to make your stay comfortable" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
            {[
              { icon: '📶', name: 'High-Speed WiFi', note: '100 Mbps · 24/7' },
              { icon: '🔒', name: 'CCTV Security',   note: '24/7 surveillance' },
              { icon: '💧', name: 'RO Water',         note: 'Purified drinking water' },
              { icon: '⚡', name: 'Power Backup',     note: 'Uninterrupted supply' },
              { icon: '🏋️', name: 'Gym',              note: 'Fully equipped' },
              { icon: '📚', name: 'Study Room',       note: 'Quiet study area' },
              { icon: '🎮', name: 'Recreation Room',  note: 'Games & relaxation' },
              { icon: '🏥', name: 'Medical Support',  note: 'On-call doctor' },
              { icon: '🧹', name: 'Housekeeping',     note: 'Daily room cleaning' },
              { icon: '☕', name: 'Common Kitchen',   note: '24/7 access' },
            ].map(a => (
              <div key={a.name} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100 hover:border-[#1D9E75] transition-colors">
                <div className="text-3xl mb-2">{a.icon}</div>
                <p className="font-semibold text-[#1a1a2e] text-sm">{a.name}</p>
                <p className="text-xs text-gray-400 mt-1">{a.note}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}

// ── Reusable section header ───────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-[#1D9E75] flex items-center justify-center text-2xl flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[#1a1a2e]">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  )
}

export default Services
