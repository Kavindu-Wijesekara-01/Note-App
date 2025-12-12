import { Archive, Trash2, Star, MoreVertical, Copy, Edit, Tag } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  isArchived: boolean
  isDeleted: boolean
  isPinned: boolean
  color: string
  tags: string[]
}

interface NoteCardProps {
  note: Note
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onPin: (id: string) => void
  onEdit: (note: Note) => void
  onDuplicate: (note: Note) => void
  viewMode?: 'grid' | 'list'
}

export default function NoteCard({ note, onDelete, onArchive, onPin, onEdit, onDuplicate, viewMode = 'grid' }: NoteCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const colors: Record<string, string> = {
    white: 'bg-white',
    red: 'bg-red-100',
    orange: 'bg-orange-100',
    yellow: 'bg-yellow-100',
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    pink: 'bg-pink-100',
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: diffDays > 365 ? 'numeric' : undefined
    })
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const cardClasses = viewMode === 'list' 
    ? 'flex items-start gap-4 p-4' 
    : 'flex flex-col h-full'

  return (
    <div 
      className={`${colors[note.color] || 'bg-white'} ${cardClasses} rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer relative group`}
      onClick={() => onEdit(note)}
    >
      {/* Pin indicator */}
      {note.isPinned && (
        <div className="absolute top-2 right-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        </div>
      )}

      <div className={viewMode === 'list' ? 'flex-1 min-w-0' : 'flex-1 p-4 pb-2'}>
        <h3 className="font-semibold text-gray-900 mb-2 truncate pr-6">
          {note.title || 'Untitled'}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3 whitespace-pre-wrap">
          {note.content}
        </p>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.slice(0, 3).map(tag => (
              <span 
                key={tag}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
              >
                <Tag className="h-3 w-3" />
                <span>{tag}</span>
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className={`flex items-center ${viewMode === 'list' ? 'gap-2' : 'justify-between px-4 pb-3'} text-xs text-gray-500`}>
        <span className="flex-shrink-0">{formatDate(note.updatedAt)}</span>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onPin(note.id)
            }}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title={note.isPinned ? "Unpin" : "Pin"}
          >
            <Star className={`h-4 w-4 ${note.isPinned ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onArchive(note.id)
            }}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title={note.isArchived ? "Unarchive" : "Archive"}
          >
            <Archive className={`h-4 w-4 ${note.isArchived ? 'text-blue-600' : 'text-gray-400'}`} />
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onDelete(note.id)
            }}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
          </button>

          <div className="relative" ref={menuRef}>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
              title="More options"
            >
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(note)
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicate(note)
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Copy className="h-4 w-4" />
                  <span>Duplicate</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}