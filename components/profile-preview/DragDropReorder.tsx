'use client'

import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface DragDropReorderProps {
  images: string[]
  onReorder: (images: string[]) => void
}

function SortableImage({ imageUrl, index }: { imageUrl: string; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: imageUrl })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-bg-primary border-2 border-border-primary rounded-xl hover:border-red-primary/50 transition-colors"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-text-tertiary" />
      </div>

      <div className="w-8 h-8 bg-red-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
        <span className="text-white text-sm font-bold">{index + 1}</span>
      </div>

      <img src={imageUrl} alt={`Image ${index + 1}`} className="w-14 h-14 object-cover rounded-lg" />

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">Image {index + 1}</p>
        <p className="text-text-tertiary text-xs">{index === 0 ? 'Photo principale' : `Photo ${index + 1}`}</p>
      </div>
    </div>
  )
}

export function DragDropReorder({ images, onReorder }: DragDropReorderProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string)
      const newIndex = images.indexOf(over.id as string)
      onReorder(arrayMove(images, oldIndex, newIndex))
    }
  }

  return (
    <div className="space-y-3">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images} strategy={verticalListSortingStrategy}>
          {images.map((imageUrl, index) => (
            <SortableImage key={imageUrl} imageUrl={imageUrl} index={index} />
          ))}
        </SortableContext>
      </DndContext>

      <div className="flex items-start gap-3 px-4 py-3 bg-red-primary/8 border border-red-primary/25 rounded-xl">
        <span className="text-red-light text-base shrink-0 mt-0.5">💡</span>
        <p className="text-text-secondary text-xs leading-relaxed">
          La première image sera votre <strong className="text-red-light">photo principale</strong>
        </p>
      </div>
    </div>
  )
}
