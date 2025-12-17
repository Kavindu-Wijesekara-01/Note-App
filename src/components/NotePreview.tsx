import { X, Edit, Archive, Trash2, Star, Copy, Tag, Paperclip, Download, Image, FileText } from 'lucide-react'
import { useState } from 'react'

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

interface NotePreviewProps {
  note: Note
  onClose: () => void
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onPin: (id: string) => void
  onDuplicate: (note: Note) => void
}

export default function NotePreview({ note, onClose, onEdit, onDelete, onArchive, onPin, onDuplicate }: NotePreviewProps) {
  const [showFilePreview, setShowFilePreview] = useState(false)
  const [selectedFile, setSelectedFile] = useState<NoteFile | null>(null)

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
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  return (
    <>
      {/* Full Screen Preview Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div 
          className={`${colors[note.color] || 'bg-white'} w-full h-full flex flex-col`}
        >
          {/* Close Button - Fixed in Top Right Corner */}
          <button 
            onClick={onClose}
            className="fixed top-4 right-4 z-10 p-3 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            title="Close Preview"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="border-b border-gray-200 p-4 md:p-6">
            <div className="max-w-5xl mx-auto pr-16">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">
                {note.title || 'Untitled Note'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-600">
                <span>Created: {formatDate(note.createdAt)}</span>
                <span>•</span>
                <span>Updated: {formatDate(note.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-5xl mx-auto">
              <div className="prose max-w-none">
                <p className="text-gray-800 text-base md:text-lg whitespace-pre-wrap leading-relaxed">
                  {note.content || 'No content'}
                </p>
              </div>

              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map(tag => (
                      <span 
                        key={tag}
                        className="inline-flex items-center space-x-1.5 px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 text-gray-700 rounded-lg text-xs md:text-sm font-medium"
                      >
                        <Tag className="h-3 md:h-3.5 w-3 md:w-3.5" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* File Attachments */}
              {note.files && note.files.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">
                      {note.files.length} Attachment{note.files.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {note.files.map(file => (
                      <div 
                        key={file.id} 
                        className="flex items-center justify-between p-3 md:p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {file.type.startsWith('image/') ? (
                            <div className="w-10 md:w-12 h-10 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Image className="h-5 md:h-6 w-5 md:w-6 text-blue-600" />
                            </div>
                          ) : (
                            <div className="w-10 md:w-12 h-10 md:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 md:h-6 w-5 md:w-6 text-red-600" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-3">
                          {(file.type.startsWith('image/') || file.type === 'application/pdf') && (
                            <button
                              onClick={() => openFilePreview(file)}
                              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                              title="Preview"
                            >
                              <Image className="h-4 w-4 text-gray-600" />
                            </button>
                          )}
                          <button
                            onClick={() => downloadFile(file)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions - Fixed at Bottom */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    onPin(note.id)
                  }}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm ${
                    note.isPinned 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                  title={note.isPinned ? "Unpin" : "Pin"}
                >
                  <Star className={`h-4 w-4 ${note.isPinned ? 'fill-yellow-500' : ''}`} />
                  <span className="font-medium hidden sm:inline">{note.isPinned ? 'Unpin' : 'Pin'}</span>
                </button>

                <button
                  onClick={() => {
                    onArchive(note.id)
                  }}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm ${
                    note.isArchived 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                  title={note.isArchived ? "Unarchive" : "Archive"}
                >
                  <Archive className="h-4 w-4" />
                  <span className="font-medium hidden sm:inline">{note.isArchived ? 'Unarchive' : 'Archive'}</span>
                </button>

                <button
                  onClick={() => {
                    onDuplicate(note)
                    onClose()
                  }}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors text-sm"
                  title="Duplicate"
                >
                  <Copy className="h-4 w-4" />
                  <span className="font-medium hidden sm:inline">Duplicate</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this note?')) {
                      onDelete(note.id)
                      onClose()
                    }
                  }}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors text-sm"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="font-medium">Delete</span>
                </button>

                <button
                  onClick={() => {
                    onEdit(note)
                    onClose()
                  }}
                  className="flex items-center gap-2 px-4 md:px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium text-sm"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {showFilePreview && selectedFile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]"
          onClick={() => setShowFilePreview(false)}
        >
          {/* Close Button for File Preview */}
          <button 
            onClick={() => setShowFilePreview(false)}
            className="fixed top-4 right-4 z-10 p-3 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            title="Close Preview"
          >
            <X className="h-6 w-6" />
          </button>

          <div 
            className="bg-white rounded-xl w-full h-full md:w-[95vw] md:h-[95vh] md:max-w-6xl overflow-auto shadow-2xl m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3 flex-1 min-w-0 pr-12">
                {selectedFile.type.startsWith('image/') ? (
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Image className="h-5 w-5 text-blue-600" />
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
              <button
                onClick={() => downloadFile(selectedFile)}
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4 md:p-6">
              {selectedFile.type.startsWith('image/') ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                  <img 
                    src={selectedFile.url} 
                    alt={selectedFile.name}
                    className="max-w-full max-h-[80vh] h-auto rounded-lg shadow-lg object-contain"
                  />
                </div>
              ) : selectedFile.type === 'application/pdf' ? (
                <div className="flex flex-col items-center">
                  <div className="w-full h-[70vh] md:h-[75vh]">
                    <iframe
                      src={selectedFile.url}
                      className="w-full h-full rounded-lg border border-gray-200"
                      title={selectedFile.name}
                    />
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