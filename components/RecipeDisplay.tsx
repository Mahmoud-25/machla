'use client'

import { useState } from 'react'

interface RecipeDisplayProps {
  formattedMessage: string
}

interface Ingredient {
  name: string
  amount: string | null  // null means "حسب الرغبة" — not shown
}

interface RecipeSections {
  name: string
  servings: string
  ingredients: Ingredient[]
  steps: string[]
  tips: string[]
  summary: string
}

const HАСAB_ALRАГBA = 'حسب الرغبة'
const MAX_OPTIONAL_SHOWN = 3

function parseIngredient(raw: string): Ingredient {
  const colonIdx = raw.lastIndexOf(':')
  if (colonIdx === -1) return { name: raw, amount: null }
  const name = raw.slice(0, colonIdx).trim()
  const amount = raw.slice(colonIdx + 1).trim()

  // Hide "حسب الرغبة" with or without a parenthetical context
  const isOptional = amount.startsWith(HАСAB_ALRАГBA)
  if (isOptional) {
    // Extract context from parentheses if present: "حسب الرغبة (للصلصة)" → "(للصلصة)"
    const parenMatch = amount.match(/\(([^)]+)\)/)
    return { name, amount: parenMatch ? parenMatch[1] : null }
  }

  return { name, amount: amount === '' ? null : amount }
}

function parseRecipe(text: string): RecipeSections {
  const sections: RecipeSections = {
    name: '',
    servings: '',
    ingredients: [],
    steps: [],
    tips: [],
    summary: '',
  }

  const blocks = text.split('\n\n').filter((b) => b.trim() !== '')

  blocks.forEach((block) => {
    const lines = block.split('\n').filter((l) => l.trim() !== '')
    if (lines.length === 0) return
    const firstLine = lines[0]

    if (firstLine.startsWith('🍳')) {
      const nameMatch = firstLine.match(/🍳\s+\*([^*]+)\*/)
      if (nameMatch) sections.name = nameMatch[1]
      if (lines[1] && lines[1].includes('👤')) {
        sections.servings = lines[1].replace('👤', '').trim()
      }
    } else if (firstLine.includes('🛒')) {
      lines.slice(1).forEach((line) => {
        const raw = line.replace(/^•\s*/, '').trim()
        if (raw) sections.ingredients.push(parseIngredient(raw))
      })
    } else if (firstLine.includes('👨') || firstLine.includes('طريقة')) {
      lines.slice(1).forEach((line) => {
        const step = line.replace(/^\d+[\.\-\)]\s*/, '').trim()
        if (step) sections.steps.push(step)
      })
    } else if (firstLine.includes('💡')) {
      lines.slice(1).forEach((line) => {
        const tip = line.replace(/^✨\s*/, '').trim()
        if (tip) sections.tips.push(tip)
      })
    } else if (firstLine.includes('📝')) {
      if (lines[1]) {
        sections.summary = lines[1].replace(/_/g, '').trim()
      }
    }
  })

  return sections
}

function IngredientsSection({ ingredients }: { ingredients: Ingredient[] }) {
  const [showAll, setShowAll] = useState(false)

  const withAmount = ingredients.filter((i) => i.amount !== null)
  const optional = ingredients.filter((i) => i.amount === null)

  const shownOptional = showAll ? optional : optional.slice(0, MAX_OPTIONAL_SHOWN)
  const hiddenCount = optional.length - MAX_OPTIONAL_SHOWN

  return (
    <div className="recipe-section">
      <h3>🛒 المكونات</h3>

      {/* Grid of all ingredients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Ingredients with specific amounts */}
        {withAmount.map((ing, i) => (
          <div
            key={`a-${i}`}
            className="flex flex-col gap-2 px-4 py-3 rounded-2xl"
            style={{
              background: 'white',
              border: '1px solid #f0e4e1',
              borderRight: '4px solid var(--primary-coral)',
            }}
          >
            <span className="font-semibold text-gray-800 text-sm leading-snug">{ing.name}</span>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-lg self-start"
              style={{ backgroundColor: 'var(--soft-coral)', color: 'var(--primary-coral)' }}
            >
              {ing.amount}
            </span>
          </div>
        ))}

        {/* Ingredients without specific amounts (max 3 shown) */}
        {shownOptional.map((ing, i) => (
          <div
            key={`o-${i}`}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: 'white',
              border: '1px solid #f0e4e1',
              borderRight: '4px solid var(--primary-coral)',
            }}
          >
            <span className="font-semibold text-gray-800 text-sm leading-snug">{ing.name}</span>
          </div>
        ))}
      </div>

      {/* Show more / collapse toggle */}
      {hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            border: '1.5px dashed #f0c4bb',
            color: 'var(--primary-coral)',
            background: 'transparent',
          }}
        >
          <svg
            className="w-4 h-4 transition-transform duration-200"
            style={{ transform: showAll ? 'rotate(180deg)' : 'rotate(0deg)' }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {showAll ? 'إخفاء المكونات الإضافية' : `عرض ${hiddenCount} مكونات أخرى`}
        </button>
      )}
    </div>
  )
}

export default function RecipeDisplay({ formattedMessage }: RecipeDisplayProps) {
  if (!formattedMessage) {
    return (
      <div className="text-gray-400 text-sm text-center py-8">لا يوجد محتوى للعرض</div>
    )
  }

  const recipe = parseRecipe(formattedMessage)

  return (
    <div>
      {/* Recipe Header */}
      <div className="recipe-header-card">
        <div className="name">{recipe.name || 'وصفة بدون اسم'}</div>
      </div>

      {/* Ingredients */}
      {recipe.ingredients.length > 0 && (
        <IngredientsSection ingredients={recipe.ingredients} />
      )}

      {/* Steps */}
      {recipe.steps.length > 0 && (
        <div className="recipe-section">
          <h3>👨‍🍳 طريقة التحضير</h3>
          <ol className="list-none p-0 m-0" style={{ counterReset: 'step-counter' }}>
            {recipe.steps.map((step, i) => (
              <li key={i} className="step-item">{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Tips */}
      {recipe.tips.length > 0 && (
        <div className="recipe-section">
          <h3>💡 نصائح المحترفين</h3>
          <ul className="list-none p-0 m-0">
            {recipe.tips.map((tip, i) => (
              <li key={i} className="tip-item">{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      {recipe.summary && (
        <div className="recipe-section">
          <h3>📝 ملخص الوصفة</h3>
          <div className="summary-text">{recipe.summary}</div>
        </div>
      )}
    </div>
  )
}
