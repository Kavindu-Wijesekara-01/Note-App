import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Home, Archive, Trash2, Plus, Search, X, Menu, Tag, Palette, Grid, List, Paperclip, LogOut } from 'lucide-react'
import NoteCard from './components/NoteCard'
import NotePreview from './components/NotePreview'
import Login from './components/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'

export interface NoteFile {
  id: string
  name: string
  type: string
  url: string
  size: number
}

export interface Note {
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

type ViewMode = 'grid' | 'list'

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewNote, setPreviewNote] = useState<Note | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [search, setSearch] = useState('')
  const [newNote, setNewNote] = useState({ title: '', content: '', color: 'white', tags: '' })
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const location = useLocation()
  const { user, logout } = useAuth()

  const colors = [
    { name: 'white', class: 'bg-white' },
    { name: 'red', class: 'bg-red-50' },
    { name: 'orange', class: 'bg-orange-50' },
    { name: 'yellow', class: 'bg-yellow-50' },
    { name: 'green', class: 'bg-green-50' },
    { name: 'blue', class: 'bg-blue-50' },
    { name: 'purple', class: 'bg-purple-50' },
    { name: 'pink', class: 'bg-pink-50' },
  ]

  // Load notes from localStorage for current user
  useEffect(() => {
    if (!user) {
      setNotes([])
      return
    }

    const savedNotes = localStorage.getItem(`notes_${user.id}`)
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes)
        setNotes(parsedNotes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          isPinned: note.isPinned || false,
          color: note.color || 'white',
          tags: note.tags || [],
          files: note.files || []
        })))
      } catch (error) {
        console.error('Error parsing notes:', error)
        setNotes([])
      }
    }
  }, [user])

  // Save notes to localStorage for current user
  useEffect(() => {
    if (!user) return
    localStorage.setItem(`notes_${user.id}`, JSON.stringify(notes))
  }, [notes, user])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isPdf = file.type === 'application/pdf'
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      return (isImage || isPdf) && isValidSize
    })
    setNewFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const addNote = async () => {
    if (!user) return
    
    if (!newNote.title.trim() && !newNote.content.trim() && newFiles.length === 0) return
    
    const tags = newNote.tags.split(',').map(t => t.trim()).filter(t => t)
    
    // Convert files to base64
    const noteFiles: NoteFile[] = await Promise.all(
      newFiles.map(async (file) => ({
        id: Date.now().toString() + Math.random().toString(36),
        name: file.name,
        type: file.type,
        url: await fileToBase64(file),
        size: file.size
      }))
    )
    
    if (editingNote) {
      setNotes(notes.map(note => 
        note.id === editingNote.id 
          ? { 
              ...note, 
              title: newNote.title, 
              content: newNote.content, 
              updatedAt: new Date(), 
              color: newNote.color, 
              tags,
              files: [...(note.files || []), ...noteFiles]
            }
          : note
      ))
    } else {
      const note: Note = {
        id: Date.now().toString(),
        title: newNote.title,
        content: newNote.content,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        isDeleted: false,
        isPinned: false,
        color: newNote.color,
        tags,
        files: noteFiles
      }
      setNotes([note, ...notes])
    }
    
    setNewNote({ title: '', content: '', color: 'white', tags: '' })
    setNewFiles([])
    setShowEditor(false)
    setEditingNote(null)
  }

  const deleteNote = (id: string) => {
    const note = notes.find(n => n.id === id)
    if (note && !note.isDeleted) {
      setNotes(notes.map(n => n.id === id ? { ...n, isDeleted: true } : n))
    } else {
      setNotes(notes.filter(n => n.id !== id))
    }
  }

  const archiveNote = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isArchived: !note.isArchived } : note
    ))
  }

  const togglePin = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() } : note
    ))
  }

  const restoreNote = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isDeleted: false, isArchived: false } : note
    ))
  }

  const previewNoteFunc = (note: Note) => {
    setPreviewNote(note)
    setShowPreview(true)
  }

  const editNote = (note: Note) => {
    setEditingNote(note)
    setNewNote({ 
      title: note.title, 
      content: note.content, 
      color: note.color,
      tags: note.tags.join(', ')
    })
    setNewFiles([])
    setShowEditor(true)
  }

  const duplicateNote = (note: Note) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      title: note.title + ' (Copy)',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false
    }
    setNotes([newNote, ...notes])
  }

  const removeFileFromNote = (noteId: string, fileId: string) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, files: note.files.filter(f => f.id !== fileId) }
        : note
    ))
  }

  const getAllTags = () => {
    const tagSet = new Set<string>()
    notes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)))
    return Array.from(tagSet).sort()
  }

  const sortNotes = (notesToSort: Note[]) => {
    return [...notesToSort].sort((a, b) => {
      // First sort by pinned status
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      // Then by updated date
      return b.updatedAt.getTime() - a.updatedAt.getTime()
    })
  }

  const filteredNotes = sortNotes(notes.filter(note => {
    const matchesPath = 
      location.pathname === '/archive' ? note.isArchived && !note.isDeleted :
      location.pathname === '/trash' ? note.isDeleted :
      !note.isArchived && !note.isDeleted

    const matchesSearch = 
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))

    const matchesTag = !selectedTag || note.tags.includes(selectedTag)

    return matchesPath && matchesSearch && matchesTag
  }))

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleLogout = () => {
    logout()
    setNotes([])
  }

  // If user is not logged in, show login page
  if (!user) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-50">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">NoteSync</h1>
        <div className="flex items-center space-x-2">
          <button onClick={() => setShowEditor(true)} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white border-r border-gray-200 p-4 z-50 transition-transform duration-300
        w-64 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">
            NoteSync
          </h1>
          
          {/* User Info */}
          <div className="mt-4 p-3 bg-gray-100 rounded-lg flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <nav className="space-y-2">
          <Link to="/" className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${location.pathname === '/' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Home className="h-5 w-5" />
            <span>All Notes</span>
            <span className="ml-auto text-sm text-gray-500">
              {notes.filter(n => !n.isArchived && !n.isDeleted).length}
            </span>
          </Link>
          
          <Link to="/archive" className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${location.pathname === '/archive' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Archive className="h-5 w-5" />
            <span>Archive</span>
            <span className="ml-auto text-sm text-gray-500">
              {notes.filter(n => n.isArchived && !n.isDeleted).length}
            </span>
          </Link>
          
          <Link to="/trash" className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${location.pathname === '/trash' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Trash2 className="h-5 w-5" />
            <span>Trash</span>
            <span className="ml-auto text-sm text-gray-500">
              {notes.filter(n => n.isDeleted).length}
            </span>
          </Link>
        </nav>

        {/* Tags Section */}
        {getAllTags().length > 0 && (
          <div className="mt-8">
            <div className="flex items-center space-x-2 px-3 mb-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">Tags</span>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {getAllTags().map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedTag === tag 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <button 
            onClick={() => setShowEditor(true)}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors hidden lg:flex"
          >
            <Plus className="h-5 w-5" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0 p-4 sm:p-6 min-h-screen flex flex-col">
        {/* Search and Controls Bar */}
        <div className="mb-6 mt-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* View Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {selectedTag && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm">
                  <span>#{selectedTag}</span>
                  <button onClick={() => setSelectedTag('')} className="hover:text-blue-900 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes Display */}
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <div>
                  {filteredNotes.length > 0 ? (
                    <div className={viewMode === 'grid' 
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                      : 'space-y-3'
                    }>
                      {filteredNotes.map(note => (
                        <NoteCard 
                          key={note.id} 
                          note={note}
                          onDelete={deleteNote}
                          onArchive={archiveNote}
                          onPin={togglePin}
                          onPreview={previewNoteFunc}
                          onEdit={editNote}
                          onDuplicate={duplicateNote}
                          onRemoveFile={removeFileFromNote}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <Plus className="h-12 w-12 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">No notes yet</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        {search || selectedTag 
                          ? 'No notes found matching your search criteria'
                          : 'Start by creating your first note to organize your thoughts and ideas'}
                      </p>
                      <button 
                        onClick={() => setShowEditor(true)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                      >
                        Create Your First Note
                      </button>
                    </div>
                  )}
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/archive" element={
              <ProtectedRoute>
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Archived Notes</h2>
                      <p className="text-gray-600 mt-1">Notes you've archived for later</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {filteredNotes.length > 0 ? (
                    <div className={viewMode === 'grid' 
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                      : 'space-y-3'
                    }>
                      {filteredNotes.map(note => (
                        <NoteCard 
                          key={note.id} 
                          note={note}
                          onDelete={deleteNote}
                          onArchive={archiveNote}
                          onPin={togglePin}
                          onPreview={previewNoteFunc}
                          onEdit={editNote}
                          onDuplicate={duplicateNote}
                          onRemoveFile={removeFileFromNote}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Archive className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">No archived notes</h3>
                      <p className="text-gray-600">Archive notes to keep them organized and out of your main view</p>
                    </div>
                  )}
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/trash" element={
              <ProtectedRoute>
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Trash</h2>
                      <p className="text-gray-600 mt-1">Deleted notes will be removed permanently after 30 days</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {filteredNotes.length > 0 ? (
                    <div className={viewMode === 'grid' 
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                      : 'space-y-3'
                    }>
                      {filteredNotes.map(note => (
                        <div key={note.id} className={`${colors.find(c => c.name === note.color)?.class || 'bg-white'} p-4 rounded-lg border border-gray-200 opacity-70 hover:opacity-100 transition-all duration-200`}>
                          <h3 className="font-semibold text-gray-900 mb-2">{note.title || 'Untitled'}</h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>
                          {note.files && note.files.length > 0 && (
                            <div className="mb-4 flex items-center text-xs text-gray-500">
                              <Paperclip className="h-3 w-3 mr-1" />
                              <span>{note.files.length} file{note.files.length > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => restoreNote(note.id)}
                              className="px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                            >
                              Restore
                            </button>
                            <button 
                              onClick={() => deleteNote(note.id)}
                              className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                            >
                              Delete Forever
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Trash2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Trash is empty</h3>
                      <p className="text-gray-600">Deleted notes will appear here</p>
                    </div>
                  )}
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/login" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-500">
                {notes.length} total notes • {user.email}
              </span>
            </div>

            <div className="text-gray-600 text-sm flex items-center">
              <p className="font-medium text-gray-800">Notes App - </p>
              <p className="ml-1">Developed By Kavindu Wijesekara</p>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>© {new Date().getFullYear()} Notes App Version 1.0. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Note Preview Modal */}
      {showPreview && previewNote && (
        <NotePreview
          note={previewNote}
          onClose={() => {
            setShowPreview(false)
            setPreviewNote(null)
          }}
          onEdit={(note) => {
            setShowPreview(false)
            setPreviewNote(null)
            editNote(note)
          }}
          onDelete={deleteNote}
          onArchive={archiveNote}
          onPin={togglePin}
          onDuplicate={duplicateNote}
        />
      )}

      {/* Note Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto border border-gray-200">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{editingNote ? 'Edit Note' : 'New Note'}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingNote ? 'Update your note' : 'Add a new note to your collection'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowEditor(false)
                    setEditingNote(null)
                    setNewNote({ title: '', content: '', color: 'white', tags: '' })
                    setNewFiles([])
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter note title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    placeholder="Start typing your note content..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    className="w-full h-48 sm:h-56 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    placeholder="Add tags separated by commas (e.g., work, personal, ideas)"
                    value={newNote.tags}
                    onChange={(e) => setNewNote({...newNote, tags: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments
                  </label>
                  <div className="space-y-4">
                    <label className="flex items-center justify-center space-x-2 text-sm text-gray-700 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Paperclip className="h-5 w-5" />
                      <span>Click to attach files (Images/PDFs, max 10MB each)</span>
                    </label>

                    {/* File Preview */}
                    {newFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">New attachments:</p>
                        {newFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3 overflow-hidden">
                              <Paperclip className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Existing Files (when editing) */}
                    {editingNote && editingNote.files && editingNote.files.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Existing attachments:</p>
                        <div className="space-y-2">
                          {editingNote.files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3 overflow-hidden">
                                <Paperclip className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => removeFileFromNote(editingNote.id, file.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Palette className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Note Color</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colors.map(color => (
                      <button
                        key={color.name}
                        onClick={() => setNewNote({...newNote, color: color.name})}
                        className={`w-10 h-10 rounded-lg border-2 ${color.class} ${
                          newNote.color === color.name 
                            ? 'border-blue-600 ring-2 ring-blue-200' 
                            : 'border-gray-300 hover:border-gray-400'
                        } transition-all duration-200`}
                        title={color.name.charAt(0).toUpperCase() + color.name.slice(1)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => {
                    setShowEditor(false)
                    setEditingNote(null)
                    setNewNote({ title: '', content: '', color: 'white', tags: '' })
                    setNewFiles([])
                  }}
                  className="px-6 py-3 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={addNote}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  {editingNote ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App