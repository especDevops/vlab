import { useState, useId } from 'react'
import './App.css'

interface BookItem {
  id: string
  titulo: string
  autor: string
  genero: string
  ano: string
  dataCadastro: string
}

const LIVROS_INICIAIS: BookItem[] = [
  {
    id: '1',
    titulo: 'Dom Casmurro',
    autor: 'Machado de Assis',
    genero: 'Romance / Realismo',
    ano: '1899',
    dataCadastro: '12/09/2026',
  },
  {
    id: '2',
    titulo: 'O Hobbit',
    autor: 'J.R.R. Tolkien',
    genero: 'Fantasia',
    ano: '1937',
    dataCadastro: '12/09/2026',
  },
  {
    id: '3',
    titulo: 'Duna',
    autor: 'Frank Herbert',
    genero: 'Ficção Científica',
    ano: '1965',
    dataCadastro: '12/09/2026',
  },
]

function App() {
  const [livros, setLivros] = useState<BookItem[]>(LIVROS_INICIAIS)
  const [titulo, setTitulo] = useState('')
  const [autor, setAutor] = useState('')
  const [genero, setGenero] = useState('')
  const [ano, setAno] = useState('')
  const [filtro, setFiltro] = useState('')
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null)

  const tituloId = useId()
  const autorId = useId()
  const generoId = useId()
  const anoId = useId()
  const filtroId = useId()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!titulo.trim() || !autor.trim() || !genero.trim() || !ano.trim()) {
      return
    }

    const novoLivro: BookItem = {
      id: Date.now().toString(),
      titulo: titulo.trim(),
      autor: autor.trim(),
      genero: genero.trim(),
      ano: ano.trim(),
      dataCadastro: new Date().toLocaleDateString('pt-BR'),
    }

    setLivros((prev) => [novoLivro, ...prev])
    setTitulo('')
    setAutor('')
    setGenero('')
    setAno('')

    setMensagemSucesso(`"${novoLivro.titulo}" cadastrado com sucesso!`)
    setTimeout(() => {
      setMensagemSucesso(null)
    }, 4000)
  }

  const handleRemover = (id: string) => {
    setLivros((prev) => prev.filter((item) => item.id !== id))
  }

  const livrosFiltrados = livros.filter((livro) => {
    const termo = filtro.toLowerCase()
    return (
      livro.titulo.toLowerCase().includes(termo) ||
      livro.autor.toLowerCase().includes(termo) ||
      livro.genero.toLowerCase().includes(termo) ||
      livro.ano.includes(termo)
    )
  })

  return (
    <main className="catalog-wrapper">
      {/* Header Banner */}
      <header className="catalog-header">
        <div className="badge-pill">
          <span className="dot"></span> Biblioteca &amp; Catálogo
        </div>
        <h1 className="main-title">Cadastro de Obras</h1>
        <p className="subtitle">
          Gerencie e organize seu acervo com informações de título, autor, gênero e ano de publicação.
        </p>
      </header>

      {mensagemSucesso && (
        <div className="toast-notification" role="status">
          <svg className="toast-icon" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{mensagemSucesso}</span>
        </div>
      )}

      <div className="catalog-content">
        {/* Formulário com os 4 inputs */}
        <section className="form-card">
          <div className="card-header">
            <div className="icon-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-0.5-.05" />
                <path d="M6 6h10" />
                <path d="M6 10h10" />
              </svg>
            </div>
            <div>
              <h2 className="card-title">Novo Registro</h2>
              <p className="card-desc">Preencha os campos abaixo para adicionar à base</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="entry-form">
            {/* 1. TÍTULO */}
            <div className="form-group">
              <label htmlFor={tituloId} className="input-label">
                <span className="label-text">Título</span>
                <span className="required-star">*</span>
              </label>
              <div className="input-field-wrapper">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <input
                  id={tituloId}
                  name="titulo"
                  type="text"
                  className="modern-input"
                  placeholder="Ex: Grande Sertão: Veredas"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 2. AUTOR */}
            <div className="form-group">
              <label htmlFor={autorId} className="input-label">
                <span className="label-text">Autor</span>
                <span className="required-star">*</span>
              </label>
              <div className="input-field-wrapper">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id={autorId}
                  name="autor"
                  type="text"
                  className="modern-input"
                  placeholder="Ex: Guimarães Rosa"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row-dual">
              {/* 3. GÊNERO */}
              <div className="form-group">
                <label htmlFor={generoId} className="input-label">
                  <span className="label-text">Gênero</span>
                  <span className="required-star">*</span>
                </label>
                <div className="input-field-wrapper">
                  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  <input
                    id={generoId}
                    name="genero"
                    type="text"
                    className="modern-input"
                    placeholder="Ex: Literatura Brasileira"
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* 4. ANO */}
              <div className="form-group">
                <label htmlFor={anoId} className="input-label">
                  <span className="label-text">Ano</span>
                  <span className="required-star">*</span>
                </label>
                <div className="input-field-wrapper">
                  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <input
                    id={anoId}
                    name="ano"
                    type="number"
                    min="0"
                    max="2100"
                    className="modern-input"
                    placeholder="Ex: 1956"
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setTitulo('')
                  setAutor('')
                  setGenero('')
                  setAno('')
                }}
              >
                Limpar
              </button>
              <button type="submit" className="btn btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-icon">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Cadastrar Obra
              </button>
            </div>
          </form>
        </section>

        {/* Listagem e Estatísticas */}
        <section className="list-section">
          <div className="list-controls">
            <div className="stats-box">
              <span className="stats-number">{livros.length}</span>
              <span className="stats-label">{livros.length === 1 ? 'item cadastrado' : 'itens cadastrados'}</span>
            </div>

            <div className="search-input-wrapper">
              <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id={filtroId}
                type="text"
                className="search-input"
                placeholder="Filtrar por título, autor, gênero ou ano..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
              {filtro && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setFiltro('')}
                  aria-label="Limpar filtro"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {livrosFiltrados.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>Nenhum registro encontrado</h3>
              <p>
                {filtro
                  ? 'Tente buscar com outros termos ou limpe o filtro.'
                  : 'Cadastre sua primeira obra usando o formulário ao lado.'}
              </p>
            </div>
          ) : (
            <div className="books-grid">
              {livrosFiltrados.map((item) => (
                <article key={item.id} className="book-card">
                  <div className="book-card-header">
                    <span className="genre-badge">{item.genero}</span>
                    <span className="year-pill">{item.ano}</span>
                  </div>

                  <h3 className="book-title" title={item.titulo}>
                    {item.titulo}
                  </h3>
                  <p className="book-author">
                    <svg className="author-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {item.autor}
                  </p>

                  <div className="book-card-footer">
                    <span className="added-date">Adicionado em {item.dataCadastro}</span>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleRemover(item.id)}
                      title="Excluir obra"
                      aria-label={`Excluir ${item.titulo}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
