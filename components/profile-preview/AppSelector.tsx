'use client'

type AppType = 'tinder' | 'fruitz' | 'hinge' | null

interface AppSelectorProps {
  selectedApp: AppType
  onSelectApp: (app: AppType) => void
}

const APPS = [
  { id: 'tinder' as const, logo: '/logotinder.png', alt: 'Tinder' },
  { id: 'fruitz' as const, logo: '/logofruitz.png', alt: 'Fruitz' },
  { id: 'hinge'  as const, logo: '/logohinge.png',  alt: 'Hinge'  },
]

export function AppSelector({ selectedApp, onSelectApp }: AppSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {APPS.map((app) => {
        const isSelected = selectedApp === app.id
        return (
          <button
            key={app.id}
            onClick={() => onSelectApp(app.id)}
            className={`
              p-1.5 rounded-2xl aspect-square border-2 transition-all duration-200 flex items-center justify-center bg-bg-primary
              ${isSelected
                ? 'border-red-primary shadow-[0_0_12px_rgba(230,57,70,0.3)]'
                : 'border-border-primary hover:border-red-primary/50'
              }
            `}
          >
            <img
              src={app.logo}
              alt={app.alt}
              className={`object-contain ${app.id === 'tinder' ? 'w-[88%] h-[88%]' : 'w-full h-full'}`}
            />
          </button>
        )
      })}
    </div>
  )
}
