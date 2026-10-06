import { useEffect, useMemo, useRef, useState } from 'react';

const API = '/api/notes';
const NOTE_COLORS = [
  { name: 'paper', label: 'Chalk', value: '#f5f1e8' },
  { name: 'blue', label: 'Tide', value: '#dce8ef' },
  { name: 'rose', label: 'Clay', value: '#f1dfd9' },
  { name: 'sage', label: 'Moss', value: '#e2e9df' },
  { name: 'amber', label: 'Honey', value: '#f1e8d1' },
];

async function request(url, options) {
  const response = await fetch(url, options);
  if (response.status === 204) return null;

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || 'That didn’t work. Please try again.');
  }
  return result;
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function getInitials(title) {
  return title.trim().slice(0, 1).toUpperCase() || 'N';
}

export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('paper');
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const searchRef = useRef(null);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const savedNotes = await request(API);
      setNotes(savedNotes);
      setStatus((current) => current.type === 'error' ? { type: '', message: '' } : current);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const visibleNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return notes;
    return notes.filter((note) =>
      note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query)
    );
  }, [notes, search]);

  const resetEditor = () => {
    setTitle('');
    setContent('');
    setColor('paper');
    setEditingId(null);
    setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setStatus({ type: 'error', message: 'Add a title before saving your note.' });
      return;
    }

    setIsSaving(true);
    setStatus({ type: '', message: '' });
    const wasEditing = Boolean(editingId);
    try {
      const url = editingId ? `${API}/${editingId}` : API;
      const method = editingId ? 'PUT' : 'POST';
      await request(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content, color }),
      });
      resetEditor();
      await loadNotes();
      setStatus({ type: 'success', message: wasEditing ? 'Your changes are saved.' : 'A new note is on the page.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color || 'paper');
    setEditingId(note._id);
    setStatus({ type: '', message: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (note) => {
    if (!window.confirm(`Remove “${note.title}” from your notes?`)) return;

    setDeletingId(note._id);
    setStatus({ type: '', message: '' });
    try {
      await request(`${API}/${note._id}`, { method: 'DELETE' });
      if (editingId === note._id) resetEditor();
      await loadNotes();
      setStatus({ type: 'success', message: 'That note has been removed.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setDeletingId('');
    }
  };

  const selectedColor = NOTE_COLORS.find((item) => item.name === color) || NOTE_COLORS[0];
  const pageTitle = editingId ? 'Pick up the thread.' : 'Leave yourself a note.';

  return (
    <div className="desk-shell">
      <aside className="side-rail">
        <a className="wordmark" href="/" onClick={(event) => event.preventDefault()}>
          <span className="wordmark-icon" aria-hidden="true">f</span>
          <span>folio<span className="wordmark-period">.</span></span>
        </a>

        <div className="rail-label">YOUR DESK</div>
        <button className="rail-link rail-link-active" type="button" onClick={() => { setSearch(''); resetEditor(); }}>
          <span className="rail-glyph" aria-hidden="true">▤</span>
          <span>All notes</span>
          <span className="rail-count">{notes.length}</span>
        </button>
        <div className="rail-rule" />
        <div className="rail-label">A FEW DETAILS</div>
        <div className="rail-note"><span className="rail-dot dot-moss" /> Saved in MongoDB</div>
        <div className="rail-note"><span className="rail-dot dot-clay" /> Yours to edit</div>
        <div className="rail-note"><span className="rail-dot dot-sky" /> Search any word</div>

        <div className="rail-bottom">
          <div className="rail-monogram">F.</div>
          <div><strong>A small space</strong><span>for things to remember</span></div>
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-bar">
          <div className="breadcrumb"><span>YOUR DESK</span><span className="crumb-divider">/</span><strong>ALL NOTES</strong></div>
          <label className="search-box">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <span className="sr-only">Search notes</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find a thought..."
              ref={searchRef}
            />
            <kbd>Ctrl K</kbd>
          </label>
        </header>

        <div className="workspace-content">
          <section className="page-heading">
            <div>
              <p className="date-line">{new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</p>
              <h1>Thoughts, <em>collected.</em></h1>
              <p className="heading-subtitle">A place to leave the ideas you don’t want to lose.</p>
            </div>
            <div className="note-total" aria-label={`${notes.length} notes`}>
              <span>{String(notes.length).padStart(2, '0')}</span>
              <small>{notes.length === 1 ? 'NOTE' : 'NOTES'}<br />ON YOUR DESK</small>
            </div>
          </section>

          {status.message && (
            <p className={`status-banner status-${status.type}`} role={status.type === 'error' ? 'alert' : 'status'}>
              <span aria-hidden="true">{status.type === 'error' ? '!' : '✓'}</span>{status.message}
              {status.type === 'error' && <button type="button" onClick={loadNotes}>Try again</button>}
            </p>
          )}

          <div className="desk-grid">
            <section className="notes-section" aria-labelledby="notes-heading">
              <div className="section-bar">
                <div><span className="section-marker">A</span><h2 id="notes-heading">{search ? 'Matching thoughts' : 'On the desk'}</h2></div>
                <span className="sort-caption">MOST RECENT FIRST <span aria-hidden="true">↓</span></span>
              </div>

              {isLoading ? (
                <div className="empty-state"><span className="loading-mark" aria-hidden="true">◌</span><p>Opening your notebook…</p></div>
              ) : visibleNotes.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-mark" aria-hidden="true">{search ? '⌕' : '✳'}</span>
                  <h3>{search ? 'Nothing by that name.' : 'A clean page.'}</h3>
                  <p>{search ? 'Try a different word or phrase.' : 'Your first note is just a thought away. Write one in the panel.'}</p>
                  {search && <button className="text-button" type="button" onClick={() => setSearch('')}>Clear the search</button>}
                </div>
              ) : (
                <div className="note-list">
                  {visibleNotes.map((note, index) => {
                    const noteColor = NOTE_COLORS.find((item) => item.name === note.color) || NOTE_COLORS[0];
                    return (
                      <article className="note-row" key={note._id} style={{ '--note-tint': noteColor.value }}>
                        <span className="note-index">{String(index + 1).padStart(2, '0')}</span>
                        <span className="note-initial" aria-hidden="true">{getInitials(note.title)}</span>
                        <div className="note-copy">
                          <h3>{note.title}</h3>
                          <p>{note.content || 'A title, and room for more later.'}</p>
                          <time dateTime={note.updatedAt || note.createdAt}>{formatDate(note.updatedAt || note.createdAt)}</time>
                        </div>
                        <div className="note-actions">
                          <button className="icon-button" type="button" aria-label={`Edit ${note.title}`} onClick={() => handleEdit(note)}>↗</button>
                          <button className="icon-button icon-button-delete" type="button" aria-label={`Delete ${note.title}`} onClick={() => handleDelete(note)} disabled={deletingId === note._id}>
                            {deletingId === note._id ? '…' : '×'}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
              <p className="list-footnote"><span aria-hidden="true">✳</span> Saved as you go — well, as soon as you press the button.</p>
            </section>

            <aside className="editor-panel" aria-labelledby="editor-heading">
              <div className="editor-topline"><span>{editingId ? 'BACK TO IT' : 'A NEW ENTRY'}</span><span className="editor-spark" aria-hidden="true">✳</span></div>
              <p className="editor-index">{editingId ? 'EDITING A NOTE' : 'MAKE A LITTLE SPACE'}</p>
              <h2 id="editor-heading">{pageTitle}</h2>
              <p className="editor-intro">{editingId ? 'Make a change, then save your note again.' : 'Catch an idea before it wanders off.'}</p>

              <form className="note-form" onSubmit={handleSubmit}>
                <label htmlFor="note-title">Give it a title</label>
                <input
                  id="note-title"
                  type="text"
                  placeholder="A name for this thought..."
                  value={title}
                  onChange={(event) => setTitle(event.target.value.slice(0, 100))}
                  maxLength={100}
                  required
                />
                <div className="character-count">{title.length}<span> / 100</span></div>

                <label htmlFor="note-content">The details</label>
                <textarea
                  id="note-content"
                  rows="7"
                  placeholder="Type a thought, a list, a reminder... whatever you want to keep."
                  value={content}
                  onChange={(event) => setContent(event.target.value.slice(0, 10000))}
                />
                <div className="character-count">{content.length}<span> / 10,000</span></div>

                <fieldset className="color-picker">
                  <legend>Pick a paper</legend>
                  <div className="color-options">
                    {NOTE_COLORS.map((option) => (
                      <button
                        className={`color-swatch${color === option.name ? ' selected' : ''}`}
                        key={option.name}
                        type="button"
                        style={{ '--swatch-color': option.value }}
                        aria-label={`${option.label} paper`}
                        aria-pressed={color === option.name}
                        onClick={() => setColor(option.name)}
                      />
                    ))}
                  </div>
                </fieldset>

                <div className="editor-actions">
                  {editingId && <button className="cancel-button" type="button" onClick={resetEditor}>Never mind</button>}
                  <button className="save-button" type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving…' : editingId ? 'Save changes' : 'Pin this note'} <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </form>
              <div className="editor-footer"><span className="color-preview" style={{ backgroundColor: selectedColor.value }} />{selectedColor.label} paper <span>·</span> Stored with MongoDB</div>
            </aside>
          </div>

          <footer className="workspace-footer"><span>FOLIO NOTEBOOK</span><span>A little order for all those thoughts.</span></footer>
        </div>
      </main>
    </div>
  );
}
