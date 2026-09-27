import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

import './Cadastro.css'
import { authApi } from '../../services/authService'

function Cadastro() {
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('')

  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setErro('')

    if (senha !== confirmacaoSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setCarregando(true)

    try {
      const resposta = await authApi.cadastrar({
        nome,
        email,
        senha,
        perfil: 'ADMIN',
      })

      localStorage.setItem('token', resposta.token)

      localStorage.setItem(
        'usuario',
        JSON.stringify({
          id: resposta.id,
          nome: resposta.nome,
          email: resposta.email,
          perfil: resposta.perfil,
        })
      )

      navigate('/livros')
    } catch (error) {
      console.error('Erro ao realizar cadastro:', error)

      if (axios.isAxiosError<{ erro?: string }>(error) && error.response?.status === 409) {
        setErro(error.response.data?.erro ?? 'Este e-mail já está cadastrado. Tente entrar ou use outro endereço.')
      } else {
        setErro('Não foi possível realizar o cadastro. Tente novamente.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="cadastro-page">
      <section className="cadastro-container">
        <div className="cadastro-header">
          <h1>Biblioteca</h1>
          <p>Crie sua conta</p>
        </div>

        <form
          className="cadastro-form"
          onSubmit={handleSubmit}
        >
          <div className="campo">
            <label htmlFor="nome">Nome</label>

            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>

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

          <div className="campo">
            <label htmlFor="confirmacaoSenha">
              Confirmar senha
            </label>

            <input
              id="confirmacaoSenha"
              type="password"
              value={confirmacaoSenha}
              onChange={(event) =>
                setConfirmacaoSenha(event.target.value)
              }
              placeholder="Digite a senha novamente"
              required
            />
          </div>

          {erro && (
            <p className="cadastro-erro">
              {erro}
            </p>
          )}

          <button type="submit" disabled={carregando}>
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="cadastro-login">
          Já possui uma conta?{' '}
          <Link to="/login">Entrar</Link>
        </p>
      </section>
    </main>
  )
}

export default Cadastro