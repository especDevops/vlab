import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Login.css";
import { authApi } from "../../services/authService";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const resposta = await authApi.login({
        email,
        senha,
      });

      localStorage.setItem("token", resposta.token);

      localStorage.setItem(
        "usuario",
        JSON.stringify({
          id: resposta.id,
          nome: resposta.nome,
          email: resposta.email,
          perfil: resposta.perfil,
        }),
      );

      navigate("/livros");
    } catch (error) {
      console.error("Erro ao realizar login:", error);

      setErro("E-mail ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-container">
        <div className="login-header">
          <h1>Biblioteca</h1>
          <p>Entre na sua conta</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="campo">
            <label htmlFor="email">E-mail</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="senha">Senha</label>

            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Sua senha"
              required
            />
          </div>

          {erro && <p className="login-erro">{erro}</p>}

          <button type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="login-cadastro">
          Não possui uma conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
