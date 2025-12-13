import { Archive, Trash2, Star, MoreVertical, Copy, Edit, Tag, Paperclip, X, FileText, Image as ImageIcon, Download } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface NoteFile {
  id: string
  name: string
  type: string
  url: string
  size: number
}

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
  files: NoteFile[]
}

interface NoteCardProps {
  note: Note
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onPin: (id: string) => void
  onEdit: (note: Note) => void
  onDuplicate: (note: Note) => void
  onRemoveFile: (noteId: string, fileId: string) => void
  viewMode?: 'grid' | 'list'
}

export default function NoteCard({ note, onDelete, onArchive, onPin, onEdit, onDuplicate, onRemoveFile, viewMode = 'grid' }: NoteCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showFilePreview, setShowFilePreview] = useState(false)
  const [selectedFile, setSelectedFile] = useState<NoteFile | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const colors: Record<string, string> = {
    white: 'bg-white',
    red: 'bg-red-50',
    orange: 'bg-orange-50',
    yellow: 'bg-yellow-50',
    green: 'bg-green-50',
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    pink: 'bg-pink-50',
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const downloadFile = (file: NoteFile) => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openFilePreview = (file: NoteFile) => {
    setSelectedFile(file)
    setShowFilePreview(true)
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
    ? 'flex items-start gap-4 p-4 hover:shadow-lg' 
    : 'flex flex-col h-full hover:shadow-xl'

  return (
    <>
      <div 
        className={`${colors[note.color] || 'bg-white'} ${cardClasses} rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 cursor-pointer relative group`}
        onClick={() => onEdit(note)}
      >
        {/* Pin indicator */}
        {note.isPinned && (
          <div className="absolute top-3 right-3 z-10">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          </div>
        )}

        <div className={viewMode === 'list' ? 'flex-1 min-w-0' : 'flex-1 p-5 pb-3'}>
          <h3 className="font-semibold text-gray-900 mb-3 truncate pr-8 text-lg">
            {note.title || 'Untitled Note'}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-4 whitespace-pre-wrap leading-relaxed">
            {note.content}
          </p>

          {/* File Attachments */}
          {note.files && note.files.length > 0 && (
            <div className="mb-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">{note.files.length} attachment{note.files.length > 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2">
                {note.files.slice(0, 2).map(file => (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {file.type.startsWith('image/') ? (
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="h-4 w-4 text-blue-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openFilePreview(file)
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <ImageIcon className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadFile(file)
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
                {note.files.length > 2 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(note)
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 pl-3 transition-colors"
                  >
                    +{note.files.length - 2} more file{note.files.length - 2 > 1 ? 's' : ''}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {note.tags.slice(0, 4).map(tag => (
                <span 
                  key={tag}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium"
                >
                  <Tag className="h-3 w-3" />
                  <span>{tag}</span>
                </span>
              ))}
              {note.tags.length > 4 && (
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                  +{note.tags.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className={`flex items-center ${viewMode === 'list' ? 'gap-4 mt-2' : 'justify-between px-5 pb-4'} text-xs text-gray-500`}>
          <span className="flex-shrink-0 font-medium">{formatDate(note.updatedAt)}</span>
          
          <div className="flex items-center space-x-1 transition-opacity duration-300" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onPin(note.id)
              }}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title={note.isPinned ? "Unpin" : "Pin"}
            >
              <Star className={`h-5 w-5 ${note.isPinned ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onArchive(note.id)
              }}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title={note.isArchived ? "Unarchive" : "Archive"}
            >
              <Archive className={`h-5 w-5 ${note.isArchived ? 'text-blue-600' : 'text-gray-600'}`} />
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onDelete(note.id)
              }}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="h-5 w-5 text-gray-600 hover:text-red-600" />
            </button>

            <div className="relative" ref={menuRef}>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="More options"
              >
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(note)
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg mx-2 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Note</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicate(note)
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg mx-2 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Duplicate Note</span>
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Remove all files from this note?')) {
                        note.files.forEach(file => onRemoveFile(note.id, file.id))
                      }
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg mx-2 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Remove All Files</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {showFilePreview && selectedFile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowFilePreview(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-5xl max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {selectedFile.type.startsWith('image/') ? (
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => downloadFile(selectedFile)}
                  className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setShowFilePreview(false)}
                  className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {selectedFile.type.startsWith('image/') ? (
                <div className="flex items-center justify-center">
                  <img 
                    src={selectedFile.url} 
                    alt={selectedFile.name}
                    className="max-w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              ) : selectedFile.type === 'application/pdf' ? (
                <div className="flex flex-col items-center">
                  <div className="w-full h-[70vh]">
                    <iframe
                      src={selectedFile.url}
                      className="w-full h-full rounded-lg"
                      title={selectedFile.name}
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => downloadFile(selectedFile)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Preview Not Available</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    This file type cannot be previewed in the browser
                  </p>
                  <button
                    onClick={() => downloadFile(selectedFile)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}