import React from 'react'
import { Zap, Moon, Flame, Brain, Heart } from 'lucide-react'
import Link from 'next/link'

// Define the structure for our mood types
interface MoodCategory {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  badgeText: string
  colorClass: string
}

const moodCategories: MoodCategory[] = [
  {
    id: 'calming',
    title: 'Calming',
    description: 'Atmospheric ambient and lo-fi beats designed for deep relaxation.',
    icon: Moon,
    badgeText: 'Relax',
    colorClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20'
  },
  {
    id: 'energetic',
    title: 'Energetic',
    description: 'High-BPM synthwave and eurodance to boost your adrenaline.',
    icon: Zap,
    badgeText: 'Workout',
    colorClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
  },
  {
    id: 'focus',
    title: 'Focus',
    description: 'Minimalist electronic and chillhop to eliminate daily distractions.',
    icon: Brain,
    badgeText: 'Study',
    colorClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
  },
  {
    id: 'emotional',
    title: 'Emotional',
    description: 'Melancholic shoegaze and chamber pop for deep feelings.',
    icon: Heart,
    badgeText: 'Melancholy',
    colorClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20'
  },
  {
    id: 'motivating',
    title: 'Motivating',
    description: 'Massive arena rock and anthems to conquer your biggest goals.',
    icon: Flame,
    badgeText: 'Motivation',
    colorClass: 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20'
  }
]

export function MoodCategoriesSection() {
  return (
    <section className="w-full py-12 mx-auto px-4 z-10 relative">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight font-heading">Explore Moods</h2>
      </div>
      <p className="text-sm text-muted-foreground max-md:hidden mb-8">
        Discover music tailored to your current activity, mindset, or energy level.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {moodCategories.map((mood) => {
          const Icon = mood.icon
          return (
            <Link href={`/?q=${mood.title}`}
              key={mood.id}
              className="group relative overflow-hidden border-none bg-card/30 hover:bg-card/70 transition-all duration-300 cursor-pointer rounded-xl p-4 flex flex-col gap-4"
            >
              <div className="aspect-square w-full bg-muted/40 rounded-lg flex items-center justify-center text-5xl relative shadow-md">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Icon className="h-8 w-8 text-primary" />
                </div>

                <span className={`absolute top-3 right-3 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-200 ${mood.colorClass}`}>
                  {mood.badgeText}
                </span>
              </div>

              <div className="space-y-1.5 px-1">
                <h3 className="text-base font-bold tracking-tight line-clamp-1 font-heading">{mood.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {mood.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
