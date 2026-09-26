import { useEffect, useState } from "react";
import "./Livros.css";

import {
  livroService,
  type Livro,
  type NovoLivroPayload,
} from "../../services/livroService";

function Livros() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [formulario, setFormulario] = useState<NovoLivroPayload>({
    titulo: "",
    autor: "",
    genero: "",
    anoPublicacao: new Date().getFullYear(),
  });

  async function carregarLivros() {
    try {
      setCarregando(true);

      const dados = await livroService.listar();

      setLivros(dados);
    } catch (error) {
      console.error("Erro ao carregar livros:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarLivros();
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: name === "anoPublicacao" ? Number(value) : value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSalvando(true);

      const novoLivro = await livroService.criar(formulario);

      setLivros((anterior) => [...anterior, novoLivro]);

      setFormulario({
        titulo: "",
        autor: "",
        genero: "",
        anoPublicacao: new Date().getFullYear(),
      });
    } catch (error) {
      console.error("Erro ao cadastrar livro:", error);
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemover(id: number) {
    try {
      await livroService.remover(id);

      setLivros((anterior) => anterior.filter((livro) => livro.id !== id));
    } catch (error) {
      console.error("Erro ao remover livro:", error);
    }
  }

  if (carregando) {
    return (
      <main className="livros-page">
        <p>Carregando livros...</p>
      </main>
    );
  }

  return (
    <main className="livros-page">
      <section className="livros-container">
        <header className="livros-header">
          <div>
            <h1>Livros</h1>
            <p>Gerencie os livros cadastrados na biblioteca.</p>
          </div>
        </header>

        <section className="livro-form-section">
          <h2>Cadastrar livro</h2>

          <form onSubmit={handleSubmit} className="livro-form">
            <div className="campo">
              <label htmlFor="titulo">Título</label>

              <input
                id="titulo"
                name="titulo"
                type="text"
                value={formulario.titulo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="autor">Autor</label>

              <input
                id="autor"
                name="autor"
                type="text"
                value={formulario.autor}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="genero">Gênero</label>

              <input
                id="genero"
                name="genero"
                type="text"
                value={formulario.genero}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="anoPublicacao">Ano de publicação</label>

              <input
                id="anoPublicacao"
                name="anoPublicacao"
                type="number"
                value={formulario.anoPublicacao}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Cadastrar livro"}
            </button>
          </form>
        </section>

        <section className="livros-lista-section">
          <h2>Livros cadastrados</h2>

          {livros.length === 0 ? (
            <p>Nenhum livro cadastrado.</p>
          ) : (
            <div className="livros-lista">
              {livros.map((livro) => (
                <article key={livro.id} className="livro-card">
                  <div>
                    <h3>{livro.titulo}</h3>

                    <p>
                      <strong>Autor:</strong> {livro.autor}
                    </p>

                    <p>
                      <strong>Gênero:</strong> {livro.genero}
                    </p>

                    <p>
                      <strong>Ano:</strong> {livro.anoPublicacao}
                    </p>
                  </div>

                  <button type="button" onClick={() => handleRemover(livro.id)}>
                    Excluir
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default Livros;
