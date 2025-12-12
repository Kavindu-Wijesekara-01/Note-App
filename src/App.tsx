import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Home, Archive, Trash2, Plus, Search, X, Menu, Star, Tag, Palette, Grid, List, SortAsc, Filter } from 'lucide-react'
import NoteCard from './components/NoteCard'

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
}

type ViewMode = 'grid' | 'list'
type SortBy = 'updated' | 'created' | 'title'

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [search, setSearch] = useState('')
  const [newNote, setNewNote] = useState({ title: '', content: '', color: 'white', tags: '' })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('updated')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const location = useLocation()

  const colors = [
    { name: 'white', class: 'bg-white' },
    { name: 'red', class: 'bg-red-100' },
    { name: 'orange', class: 'bg-orange-100' },
    { name: 'yellow', class: 'bg-yellow-100' },
    { name: 'green', class: 'bg-green-100' },
    { name: 'blue', class: 'bg-blue-100' },
    { name: 'purple', class: 'bg-purple-100' },
    { name: 'pink', class: 'bg-pink-100' },
  ]

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes')
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
        isPinned: note.isPinned || false,
        color: note.color || 'white',
        tags: note.tags || []
      })))
    }
  }, [])

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const addNote = () => {
    if (!newNote.title.trim() && !newNote.content.trim()) return
    
    const tags = newNote.tags.split(',').map(t => t.trim()).filter(t => t)
    
    if (editingNote) {
      setNotes(notes.map(note => 
        note.id === editingNote.id 
          ? { ...note, title: newNote.title, content: newNote.content, updatedAt: new Date(), color: newNote.color, tags }
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
        tags
      }
      setNotes([note, ...notes])
    }
    
    setNewNote({ title: '', content: '', color: 'white', tags: '' })
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

  const editNote = (note: Note) => {
    setEditingNote(note)
    setNewNote({ 
      title: note.title, 
      content: note.content, 
      color: note.color,
      tags: note.tags.join(', ')
    })
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

  const getAllTags = () => {
    const tagSet = new Set<string>()
    notes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)))
    return Array.from(tagSet).sort()
  }

  const sortNotes = (notesToSort: Note[]) => {
    return [...notesToSort].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'created') return b.createdAt.getTime() - a.createdAt.getTime()
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

  const pinnedNotes = filteredNotes.filter(n => n.isPinned)
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-40">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Notes</h1>
        <button onClick={() => setShowEditor(true)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-5 w-5" />
        </button>
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
        <h1 className="text-2xl font-bold text-gray-800 mb-8 hidden lg:block">Notes</h1>
        
        <nav className="space-y-2 mt-16 lg:mt-0">
          <Link to="/" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}>
            <Home className="h-5 w-5" />
            <span>All Notes</span>
            <span className="ml-auto text-sm text-gray-500">
              {notes.filter(n => !n.isArchived && !n.isDeleted).length}
            </span>
          </Link>
          
          <Link to="/archive" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/archive' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}>
            <Archive className="h-5 w-5" />
            <span>Archive</span>
            <span className="ml-auto text-sm text-gray-500">
              {notes.filter(n => n.isArchived && !n.isDeleted).length}
            </span>
          </Link>
          
          <Link to="/trash" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/trash' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}>
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
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    selectedTag === tag ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={() => setShowEditor(true)}
          className="mt-8 w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 hidden lg:flex"
        >
          <Plus className="h-5 w-5" />
          <span>New Note</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0 p-4 sm:p-6">
        {/* Search and Controls Bar */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* View Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm">Sort</span>
            </button>

            {selectedTag && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm">
                <span>#{selectedTag}</span>
                <button onClick={() => setSelectedTag('')}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Sort Options */}
          {showFilters && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Sort by</h3>
              <div className="space-y-2">
                {[
                  { value: 'updated', label: 'Last Updated' },
                  { value: 'created', label: 'Date Created' },
                  { value: 'title', label: 'Title' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value as SortBy)
                      setShowFilters(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      sortBy === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notes Display */}
        <Routes>
          <Route path="/" element={
            <div>
              {pinnedNotes.length > 0 && (
                <>
                  <div className="flex items-center space-x-2 mb-4">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <h2 className="text-lg font-semibold text-gray-800">Pinned</h2>
                  </div>
                  <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8'
                    : 'space-y-3 mb-8'
                  }>
                    {pinnedNotes.map(note => (
                      <NoteCard 
                        key={note.id} 
                        note={note}
                        onDelete={deleteNote}
                        onArchive={archiveNote}
                        onPin={togglePin}
                        onEdit={editNote}
                        onDuplicate={duplicateNote}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                </>
              )}

              {unpinnedNotes.length > 0 && (
                <>
                  {pinnedNotes.length > 0 && (
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Other Notes</h2>
                  )}
                  <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'space-y-3'
                  }>
                    {unpinnedNotes.map(note => (
                      <NoteCard 
                        key={note.id} 
                        note={note}
                        onDelete={deleteNote}
                        onArchive={archiveNote}
                        onPin={togglePin}
                        onEdit={editNote}
                        onDuplicate={duplicateNote}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          } />
          
          <Route path="/archive" element={
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Archived Notes</h2>
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
                    onEdit={editNote}
                    onDuplicate={duplicateNote}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </div>
          } />
          
          <Route path="/trash" element={
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Trash</h2>
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'
              }>
                {filteredNotes.map(note => (
                  <div key={note.id} className={`${colors.find(c => c.name === note.color)?.class || 'bg-white'} p-4 rounded-lg border border-gray-200 opacity-60 hover:opacity-100 transition-opacity`}>
                    <h3 className="font-semibold text-gray-900 mb-2">{note.title || 'Untitled'}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => restoreNote(note.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Restore
                      </button>
                      <button 
                        onClick={() => deleteNote(note.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete Forever
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          } />
        </Routes>

        {/* No Notes Message */}
        {filteredNotes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {search || selectedTag ? (
              <div>
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No notes found matching your search</p>
              </div>
            ) : location.pathname === '/archive' ? (
              'No archived notes'
            ) : location.pathname === '/trash' ? (
              'Trash is empty'
            ) : (
              <div>
                <p className="text-lg mb-2">No notes yet</p>
                <p className="text-sm">Create your first note to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Note Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{editingNote ? 'Edit Note' : 'New Note'}</h3>
                <button 
                  onClick={() => {
                    setShowEditor(false)
                    setEditingNote(null)
                    setNewNote({ title: '', content: '', color: 'white', tags: '' })
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <input
                type="text"
                placeholder="Title"
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                className="w-full text-xl font-semibold mb-4 p-2 border-b border-gray-200 focus:outline-none focus:border-blue-500"
              />
              
              <textarea
                placeholder="Start typing..."
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                className="w-full h-48 sm:h-64 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={newNote.tags}
                onChange={(e) => setNewNote({...newNote, tags: e.target.value})}
                className="w-full mt-4 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Color Picker */}
              <div className="mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Palette className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Color</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setNewNote({...newNote, color: color.name})}
                      className={`w-8 h-8 rounded-full border-2 ${color.class} ${
                        newNote.color === color.name ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                <button 
                  onClick={() => {
                    setShowEditor(false)
                    setEditingNote(null)
                    setNewNote({ title: '', content: '', color: 'white', tags: '' })
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={addNote}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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