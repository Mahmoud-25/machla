'use client'

import { useState, useEffect } from 'react'

type GroceryItem = { name: string; amount: string | null; recipe_name: string }
type BasketItem = { id: string; ingredient_name: string; amount: string | null; is_bought: boolean }

export function GroceryListTab({ weekStart }: { weekStart: string }) {
  const [ingredients, setIngredients] = useState<GroceryItem[]>([])
  const [basketItems, setBasketItems] = useState<BasketItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/planner/shopping-list?week=${weekStart}`).then((r) => r.json()),
      fetch(`/api/planner/basket?week=${weekStart}`).then((r) => r.json()),
    ]).then(([ing, bas]) => {
      setIngredients(ing.ingredients ?? [])
      setBasketItems(bas.items ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [weekStart])

  const basketNames = new Set(basketItems.map((b) => b.ingredient_name))
  const notInBasket = ingredients.filter((i) => !basketNames.has(i.name))
  const boughtCount = basketItems.filter((b) => b.is_bought).length

  async function addToBasket(ing: GroceryItem) {
    const temp: BasketItem = { id: 'temp-' + ing.name, ingredient_name: ing.name, amount: ing.amount, is_bought: false }
    setBasketItems((prev) => [...prev, temp])
    const res = await fetch('/api/planner/basket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_start: weekStart, ingredient_name: ing.name, amount: ing.amount }),
    })
    const data = await res.json()
    if (data.item) {
      setBasketItems((prev) => prev.map((b) => b.id === temp.id ? data.item : b))
    }
  }

  async function addAllToBasket() {
    const toAdd = notInBasket
    const temps = toAdd.map((ing) => ({ id: 'temp-' + ing.name, ingredient_name: ing.name, amount: ing.amount, is_bought: false }))
    setBasketItems((prev) => [...prev, ...temps])
    await Promise.all(toAdd.map((ing) =>
      fetch('/api/planner/basket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week_start: weekStart, ingredient_name: ing.name, amount: ing.amount }),
      }).then((r) => r.json()).then((data) => {
        if (data.item) setBasketItems((prev) => prev.map((b) => b.id === 'temp-' + ing.name ? data.item : b))
      })
    ))
  }

  async function removeFromBasket(item: BasketItem) {
    setBasketItems((prev) => prev.filter((b) => b.ingredient_name !== item.ingredient_name))
    await fetch(`/api/planner/basket?week=${weekStart}&name=${encodeURIComponent(item.ingredient_name)}`, { method: 'DELETE' })
  }

  async function toggleBought(item: BasketItem) {
    setBasketItems((prev) => prev.map((b) => b.ingredient_name === item.ingredient_name ? { ...b, is_bought: !b.is_bought } : b))
    await fetch('/api/planner/basket', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_start: weekStart, ingredient_name: item.ingredient_name, is_bought: !item.is_bought }),
    })
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-sm">جاري تحميل المكونات...</div>
  }

  if (ingredients.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">🛒</div>
        <p className="text-gray-500 text-sm">أضف وجبات للأسبوع أولاً لتظهر المكونات هنا</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* ── LEFT: Ingredients from meal plan ── */}
      <div className="bg-white rounded-2xl overflow-hidden flex flex-col" style={{ border: '1px solid #f0e4e1' }}>
        <div className="px-4 py-3 flex items-center justify-between flex-shrink-0" style={{ background: 'var(--soft-coral)', borderBottom: '1px solid #f0e4e1' }}>
          <h2 className="font-bold text-sm" style={{ fontFamily: 'Amiri, serif', color: 'var(--primary-coral)' }}>
            🧾 مكونات الأسبوع
          </h2>
          {notInBasket.length > 0 && (
            <button
              onClick={addAllToBasket}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
              style={{ background: 'white', color: 'var(--primary-coral)', border: '1px solid #f0c4bb' }}
            >
              إضافة الكل ←
            </button>
          )}
        </div>
        <ul className="overflow-y-auto divide-y flex-1" style={{ borderColor: '#f5f0ed', maxHeight: '60vh' }}>
          {notInBasket.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-gray-400">تمت إضافة جميع المكونات ✓</li>
          ) : notInBasket.map((ing) => (
            <li key={ing.name} className="flex items-center gap-2 px-4 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{ing.name}</p>
                {ing.amount && (
                  <span className="text-xs px-2 py-0.5 rounded-lg font-medium mt-0.5 inline-block"
                    style={{ background: 'var(--soft-coral)', color: 'var(--primary-coral)' }}>
                    {ing.amount}
                  </span>
                )}
              </div>
              <button
                onClick={() => addToBasket(ing)}
                className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm transition-all hover:shadow-sm"
                style={{ background: 'var(--primary-coral)', color: 'white' }}
                title="أضف لقائمة التسوق"
              >
                ←
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ── RIGHT: Shopping basket ── */}
      <div className="bg-white rounded-2xl overflow-hidden flex flex-col" style={{ border: '1px solid #d1fae5' }}>
        <div className="px-4 py-3 flex items-center justify-between flex-shrink-0" style={{ background: '#f0fdf4', borderBottom: '1px solid #d1fae5' }}>
          <h2 className="font-bold text-sm" style={{ fontFamily: 'Amiri, serif', color: '#15803d' }}>
            🛒 قائمة التسوق
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#dcfce7', color: '#15803d' }}>
            {boughtCount} / {basketItems.length} ✓
          </span>
        </div>
        <ul className="overflow-y-auto divide-y flex-1" style={{ borderColor: '#f5f0ed', maxHeight: '60vh' }}>
          {basketItems.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-gray-400">
              <div className="text-2xl mb-2">🛒</div>
              اضغط ← على أي مكوّن لإضافته هنا
            </li>
          ) : basketItems.map((item) => (
            <li
              key={item.ingredient_name}
              className="flex items-center gap-2 px-4 py-2.5 transition-colors"
              style={{ background: item.is_bought ? '#f9fafb' : 'white' }}
            >
              <button
                onClick={() => toggleBought(item)}
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                style={{ borderColor: item.is_bought ? '#16a34a' : '#d1d5db', background: item.is_bought ? '#16a34a' : 'transparent' }}
              >
                {item.is_bought && <span className="text-white text-xs font-bold">✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate"
                  style={{ color: item.is_bought ? '#9ca3af' : '#1a1a1a', textDecoration: item.is_bought ? 'line-through' : 'none' }}>
                  {item.ingredient_name}
                </p>
                {item.amount && (
                  <span className="text-xs px-2 py-0.5 rounded-lg font-medium mt-0.5 inline-block"
                    style={{ background: item.is_bought ? '#f3f4f6' : '#dcfce7', color: item.is_bought ? '#9ca3af' : '#15803d' }}>
                    {item.amount}
                  </span>
                )}
              </div>
              <button
                onClick={() => removeFromBasket(item)}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-red-50 transition-colors text-xs"
                style={{ color: '#d1d5db' }}
                title="إزالة"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        {boughtCount === basketItems.length && basketItems.length > 0 && (
          <div className="px-4 py-3 text-center text-sm font-medium text-green-600 flex-shrink-0" style={{ background: '#f0fdf4', borderTop: '1px solid #d1fae5' }}>
            🎉 تم شراء جميع المكونات!
          </div>
        )}
      </div>
    </div>
  )
}
