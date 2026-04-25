// ── MessMenu.jsx ─────────────────────────────────────────────────────────────
// Weekly mess menu with 4 meal slots per day.
// Fully static — update the MENU constant to change what's served.

const MENU = {
  Monday: {
    breakfast: ['Poha', 'Boiled Eggs', 'Banana', 'Milk / Tea'],
    lunch:     ['Dal Tadka', 'Jeera Rice', 'Roti', 'Mix Veg Sabzi', 'Salad', 'Curd'],
    snacks:    ['Samosa', 'Masala Chai'],
    dinner:    ['Paneer Butter Masala', 'Naan', 'Steamed Rice', 'Dal', 'Sweet'],
  },
  Tuesday: {
    breakfast: ['Idli Sambar', 'Coconut Chutney', 'Boiled Eggs', 'Tea / Coffee'],
    lunch:     ['Rajma', 'Steamed Rice', 'Roti', 'Aloo Gobi', 'Raita', 'Papad'],
    snacks:    ['Bread Pakora', 'Green Chutney', 'Tea'],
    dinner:    ['Chicken Curry / Soya Chunks Masala', 'Roti', 'Rice', 'Dal Fry', 'Ice Cream'],
  },
  Wednesday: {
    breakfast: ['Aloo Paratha', 'Curd', 'Pickle', 'Tea / Milk'],
    lunch:     ['Chana Masala', 'Puri', 'Jeera Rice', 'Boondi Raita', 'Salad'],
    snacks:    ['Maggi / Noodles', 'Tea'],
    dinner:    ['Palak Paneer', 'Roti', 'Veg Biryani', 'Raita', 'Gulab Jamun'],
  },
  Thursday: {
    breakfast: ['Upma', 'Coconut Chutney', 'Boiled Eggs', 'Tea / Coffee'],
    lunch:     ['Dal Makhani', 'Roti', 'Fried Rice', 'Aloo Fry', 'Curd', 'Salad'],
    snacks:    ['Vada Pav', 'Masala Chai'],
    dinner:    ['Egg Curry / Tofu Masala', 'Naan', 'Dal', 'Rice', 'Kheer'],
  },
  Friday: {
    breakfast: ['Puri Bhaji', 'Banana', 'Tea / Milk'],
    lunch:     ['Kadhi Pakora', 'Steamed Rice', 'Roti', 'Mixed Veg', 'Papad'],
    snacks:    ['Popcorn', 'Lemon Tea'],
    dinner:    ['Shahi Paneer', 'Butter Naan', 'Rice', 'Dal Tadka', 'Halwa'],
  },
  Saturday: {
    breakfast: ['Chole Bhature', 'Pickle', 'Tea / Coffee'],
    lunch:     ['Mutton Curry / Kofta Masala', 'Rice', 'Roti', 'Dal', 'Salad', 'Raita'],
    snacks:    ['Fruit Chaat', 'Green Tea'],
    dinner:    ['Veg Pulao', 'Raita', 'Paneer Tikka', 'Dal', 'Sewai Kheer'],
  },
  Sunday: {
    breakfast: ['Masala Dosa', 'Sambar', 'Coconut Chutney', 'Juice / Tea'],
    lunch:     ['Special Biryani (Veg / Non-Veg)', 'Raita', 'Salad', 'Papad', 'Pickle'],
    snacks:    ['Pastries / Cake', 'Cold Drink'],
    dinner:    ['Dal Makhani', 'Butter Naan', 'Roti', 'Rice', 'Gajar Halwa'],
  },
}

const MEAL_CONFIG = [
  { key: 'breakfast', label: 'Breakfast',      time: '7:30 – 9:00 AM',  emoji: '🍳', color: '#FFF7ED', border: '#FB923C' },
  { key: 'lunch',     label: 'Lunch',           time: '12:30 – 2:00 PM', emoji: '🍛', color: '#F0FDF4', border: '#22C55E' },
  { key: 'snacks',    label: 'Evening Snacks',  time: '5:00 – 6:00 PM',  emoji: '🥨', color: '#FFF1F2', border: '#FB7185' },
  { key: 'dinner',    label: 'Dinner',          time: '8:00 – 9:30 PM',  emoji: '🌙', color: '#F5F3FF', border: '#8B5CF6' },
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function MessMenu() {
  const today     = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const activeDay = DAYS.includes(today) ? today : 'Monday'

  return (
    <div className="min-h-screen bg-[#f0faf5]">

      {/* ── Header ── */}
      <div className="bg-[#0d1f17] py-14 px-6 text-center">
        <p className="text-[#5DCAA5] text-sm font-semibold tracking-widest uppercase mb-2">Daily Meals Included</p>
        <h1 className="text-4xl font-bold text-white mb-3">🍽️ Mess Menu</h1>
        <p className="text-[#a0d4be] max-w-xl mx-auto text-sm leading-relaxed">
          Nutritious, freshly cooked meals served 4 times daily. Our chefs ensure a balanced
          diet with regional favourites and healthy variety throughout the week.
        </p>

        {/* Meal time pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {MEAL_CONFIG.map(m => (
            <div key={m.key} className="bg-[#1a3d30] rounded-full px-4 py-2 text-sm text-[#a0d4be] flex items-center gap-2">
              <span>{m.emoji}</span>
              <span className="font-semibold text-white">{m.label}</span>
              <span className="opacity-60">{m.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* ── Today's Highlight ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-[#1D9E75] rounded-full" />
            <h2 className="text-2xl font-bold text-[#1a1a2e]">
              Today — <span className="text-[#1D9E75]">{activeDay}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MEAL_CONFIG.map(m => (
              <div
                key={m.key}
                style={{ backgroundColor: m.color, borderLeft: `4px solid ${m.border}` }}
                className="rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{m.emoji}</span>
                  <div>
                    <p className="font-bold text-[#1a1a2e] text-sm">{m.label}</p>
                    <p className="text-xs text-gray-400">{m.time}</p>
                  </div>
                </div>
                <ul className="space-y-1">
                  {MENU[activeDay][m.key].map(item => (
                    <li key={item} className="text-sm text-[#2d4a3e] flex items-start gap-1">
                      <span className="mt-1 text-[#1D9E75] text-xs">●</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Full Weekly Menu ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-[#1D9E75] rounded-full" />
          <h2 className="text-2xl font-bold text-[#1a1a2e]">Full Week Schedule</h2>
        </div>

        <div className="overflow-x-auto rounded-2xl shadow-sm">
          <table className="w-full text-sm bg-white">
            <thead>
              <tr className="bg-[#0d1f17] text-white">
                <th className="py-3 px-4 text-left font-semibold w-28">Day</th>
                {MEAL_CONFIG.map(m => (
                  <th key={m.key} className="py-3 px-4 text-left font-semibold">
                    {m.emoji} {m.label}
                    <p className="text-[#a0d4be] text-xs font-normal">{m.time}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, i) => (
                <tr
                  key={day}
                  className={`border-b border-gray-100 transition-colors ${
                    day === activeDay
                      ? 'bg-[#f0faf5] font-semibold'
                      : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="py-3 px-4">
                    <span className={`font-bold ${day === activeDay ? 'text-[#1D9E75]' : 'text-[#1a1a2e]'}`}>
                      {day}
                    </span>
                    {day === activeDay && (
                      <span className="ml-2 text-xs bg-[#1D9E75] text-white px-2 py-0.5 rounded-full">Today</span>
                    )}
                  </td>
                  {MEAL_CONFIG.map(m => (
                    <td key={m.key} className="py-3 px-4 text-[#2d4a3e] align-top">
                      {MENU[day][m.key].join(', ')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Note ── */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
          <strong>📌 Note:</strong> Menu is subject to change based on seasonal availability. 
          Special dietary requirements can be discussed with the mess manager. 
          Festival specials are served on national holidays.
        </div>

      </div>
    </div>
  )
}

export default MessMenu
