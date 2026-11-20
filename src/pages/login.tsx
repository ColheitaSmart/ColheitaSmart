
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, Mail, Sprout } from 'lucide-react'

const API_URL = 'https://colheitasmart-api-cgir.onrender.com'

type CsrfResponse = {
  token: string
  headerName: string
}

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')

    if (!email.trim() || !senha) {
      setErro('Preencha seu e-mail e sua senha.')
      return
    }

    setCarregando(true)

    try {
      // Busca o token CSRF e cria/recupera a sessão.
      const csrfResposta = await fetch(`${API_URL}/csrf`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!csrfResposta.ok) {
        throw new Error('Não foi possível iniciar a sessão.')
      }

      const csrf: CsrfResponse = await csrfResposta.json()

      // Envia as credenciais ao backend Java.
      const resposta = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          [csrf.headerName]: csrf.token,
        },
        body: JSON.stringify({
          email: email.trim(),
          senha,
        }),
      })

      if (resposta.status === 401) {
        setErro('E-mail ou senha incorretos.')
        return
      }

      if (!resposta.ok) {
        throw new Error(
          `Não foi possível entrar. Código: ${resposta.status}`
        )
      }

      // Confirma que a sessão autenticada foi mantida.
      const sessao = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
      })

      if (!sessao.ok) {
        setErro(
          'O login foi recebido, mas o navegador não conseguiu manter a sessão. Verifique as permissões de cookies.'
        )
        return
      }

      navigate('/colheitas')
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível conectar ao servidor.'
      )
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main
      className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-[#123d2c] bg-cover bg-center px-4 py-12 lg:justify-end lg:pr-[10%]"
      style={{
        backgroundImage: "url('/images/login-trator.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#05291b]/35 via-[#05291b]/40 to-[#05291b]/75" />

      <section className="relative z-10 w-full max-w-md rounded-[28px] border border-white/60 bg-white/95 p-7 shadow-2xl backdrop-blur-md sm:p-10">
        <div className="mb-7 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Sprout className="h-9 w-9 text-[#145c3a]" />
            <span className="text-3xl font-extrabold tracking-tight text-[#145c3a]">
              Colheita<span className="text-[#78b72e]">Smart</span>
            </span>
          </div>

          <p className="text-sm text-[#59705e]">
            Tecnologia para valorizar cada colheita.
          </p>
        </div>

        <div className="mb-6 border-t border-[#e2e9df] pt-6">
          <h1 className="text-2xl font-bold text-[#153e2c]">
            Bem-vindo de volta!
          </h1>
          <p className="mt-1 text-sm text-[#64746a]">
            Entre na sua conta para acompanhar sua colheita.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-semibold text-[#244b36]"
            >
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#73917c]" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full rounded-xl border border-[#d9e4d9] bg-[#f8faf7] py-3 pl-12 pr-4 text-[#173e2a] outline-none transition focus:border-[#3d925d] focus:ring-2 focus:ring-[#3d925d]/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-senha"
              className="mb-2 block text-sm font-semibold text-[#244b36]"
            >
              Senha
            </label>

            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#73917c]" />
              <input
                id="login-senha"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full rounded-xl border border-[#d9e4d9] bg-[#f8faf7] py-3 pl-12 pr-12 text-[#173e2a] outline-none transition focus:border-[#3d925d] focus:ring-2 focus:ring-[#3d925d]/20"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#73917c] hover:text-[#145c3a]"
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {erro && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-xl bg-[#145c3a] py-3.5 font-bold text-white shadow-md transition hover:bg-[#0c472b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando ? 'Entrando...' : 'Entrar na minha conta'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-[#64746a]">
          Ainda não tem uma conta?{' '}
          <Link
            to="/cadastro"
            className="font-bold text-[#167342] hover:underline"
          >
            Cadastre-se gratuitamente
          </Link>
        </p>

        <p className="mt-5 text-center text-xs text-[#849186]">
          ColheitaSmart — Sua colheita, nosso cuidado.
        </p>
      </section>
    </main>
  )
}
