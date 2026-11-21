
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sprout,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle2,
  LoaderCircle,
} from 'lucide-react'

const API_URL = 'https://colheitasmart-api-cgir.onrender.com'

export default function Cadastro() {
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mensagemCarregamento, setMensagemCarregamento] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (carregando || sucesso) return

    setErro('')
    setSucesso('')

    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      setErro('Preencha todos os campos para continuar.')
      return
    }

    if (nome.trim().length < 3) {
      setErro('Informe seu nome completo.')
      return
    }

    if (senha.length < 8) {
      setErro('A senha precisa ter pelo menos 8 caracteres.')
      return
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas informadas não coincidem.')
      return
    }

    setCarregando(true)

    try {
      // ETAPA 1: Solicitar o token de segurança CSRF
      setMensagemCarregamento('Conectando ao servidor...')

      const respostaCsrf = await fetch(`${API_URL}/csrf`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(60000),
      })

      if (!respostaCsrf.ok) {
        throw new Error(
          `Não foi possível iniciar uma sessão segura. Código: ${respostaCsrf.status}`
        )
      }

      const csrf = await respostaCsrf.json()

      if (!csrf.token) {
        throw new Error(
          'O servidor não retornou o token de segurança.'
        )
      }

      // ETAPA 2: Enviar os dados do cadastro
      setMensagemCarregamento('Criando sua conta...')

      const resposta = await fetch(`${API_URL}/auth/cadastro`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': csrf.token,
        },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senha,
        }),
      })

      const dados = await resposta.json().catch(() => ({}))

      if (!resposta.ok) {
        if (resposta.status === 403) {
          throw new Error(
            'O servidor bloqueou a requisição de segurança. Verifique a sessão e os cookies.'
          )
        }

        throw new Error(
          dados.erro ||
          dados.message ||
          `Não foi possível realizar o cadastro. Código: ${resposta.status}`
        )
      }

      if (resposta.status !== 201) {
        throw new Error('O servidor retornou uma resposta inesperada.')
      }

      // ETAPA 3: Cadastro concluído
      setSucesso(
        'Conta criada com sucesso! Redirecionando para o login...'
      )

      setSenha('')
      setConfirmarSenha('')

      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1500)

    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === 'TimeoutError' ||
          error.name === 'AbortError')
      ) {
        setErro(
          'O servidor demorou muito para responder. Verifique se a conta foi criada antes de tentar novamente.'
        )
      } else if (error instanceof TypeError) {
        setErro(
          'Não foi possível conectar à API. Verifique a conexão e as configurações de CORS.'
        )
      } else {
        setErro(
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro inesperado durante o cadastro.'
        )
      }
    } finally {
      setCarregando(false)
      setMensagemCarregamento('')
    }
  }

  return (
    <main
      className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-[#123d2c] bg-cover bg-center px-4 py-12"
      style={{
        backgroundImage: "url('/images/cadastro-bananas.jpg')",
      }}
    >
      {/* Camada de contraste */}
      <div className="absolute inset-0 bg-[#05291b]/45" />

      <section className="relative z-10 w-full max-w-lg rounded-[28px] border border-white/60 bg-white/95 p-7 shadow-2xl backdrop-blur-md sm:p-10">

        {/* Logo */}
        <div className="mb-7 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Sprout className="h-9 w-9 text-[#145c3a]" />

            <span className="text-3xl font-extrabold tracking-tight text-[#145c3a]">
              Colheita
              <span className="text-[#78b72e]">Smart</span>
            </span>
          </div>

          <p className="text-sm text-[#59705e]">
            Tecnologia para valorizar cada colheita.
          </p>
        </div>

        {/* Título */}
        <div className="mb-6 border-t border-[#e2e9df] pt-6">
          <h1 className="text-2xl font-bold text-[#153e2c]">
            Crie sua conta gratuitamente
          </h1>

          <p className="mt-2 text-sm text-[#64746a]">
            Comece a organizar sua produção de maneira simples e segura.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nome completo */}
          <div>
            <label
              htmlFor="cadastro-nome"
              className="mb-2 block text-sm font-semibold text-[#244b36]"
            >
              Nome completo
            </label>

            <div className="relative">
              <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#73917c]" />

              <input
                id="cadastro-nome"
                type="text"
                autoComplete="name"
                required
                minLength={3}
                disabled={carregando || !!sucesso}
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Digite seu nome completo"
                className="w-full rounded-xl border border-[#d9e4d9] bg-[#f8faf7] py-3 pl-12 pr-4 text-[#173e2a] outline-none transition focus:border-[#3d925d] focus:ring-2 focus:ring-[#3d925d]/20 disabled:opacity-60"
              />
            </div>
          </div>

          {/* E-mail */}
          <div>
            <label
              htmlFor="cadastro-email"
              className="mb-2 block text-sm font-semibold text-[#244b36]"
            >
              E-mail
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#73917c]" />

              <input
                id="cadastro-email"
                type="email"
                autoComplete="email"
                required
                disabled={carregando || !!sucesso}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full rounded-xl border border-[#d9e4d9] bg-[#f8faf7] py-3 pl-12 pr-4 text-[#173e2a] outline-none transition focus:border-[#3d925d] focus:ring-2 focus:ring-[#3d925d]/20 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label
              htmlFor="cadastro-senha"
              className="mb-2 block text-sm font-semibold text-[#244b36]"
            >
              Senha
            </label>

            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#73917c]" />

              <input
                id="cadastro-senha"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                disabled={carregando || !!sucesso}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="Mínimo de 8 caracteres"
                className="w-full rounded-xl border border-[#d9e4d9] bg-[#f8faf7] py-3 pl-12 pr-12 text-[#173e2a] outline-none transition focus:border-[#3d925d] focus:ring-2 focus:ring-[#3d925d]/20 disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => setMostrarSenha(valor => !valor)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#73917c] hover:text-[#145c3a]"
              >
                {mostrarSenha ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Confirmar senha */}
          <div>
            <label
              htmlFor="cadastro-confirmar"
              className="mb-2 block text-sm font-semibold text-[#244b36]"
            >
              Confirmar senha
            </label>

            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#73917c]" />

              <input
                id="cadastro-confirmar"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                disabled={carregando || !!sucesso}
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                placeholder="Digite sua senha novamente"
                className="w-full rounded-xl border border-[#d9e4d9] bg-[#f8faf7] py-3 pl-12 pr-4 text-[#173e2a] outline-none transition focus:border-[#3d925d] focus:ring-2 focus:ring-[#3d925d]/20 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Informação */}
          <p className="flex items-center gap-2 text-xs text-[#64746a]">
            <CheckCircle2
              size={16}
              className="shrink-0 text-[#16834a]"
            />

            A plataforma é 100% gratuita para agricultores.
          </p>

          {/* Mensagem de erro */}
          {erro && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {erro}
            </p>
          )}

          {/* Mensagem de sucesso */}
          {sucesso && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            >
              <CheckCircle2 size={20} className="shrink-0" />
              {sucesso}
            </div>
          )}

          {/* Botão de cadastro */}
          <button
            type="submit"
            disabled={carregando || !!sucesso}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#145c3a] py-3.5 font-bold text-white shadow-md transition hover:bg-[#0c472b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando ? (
              <>
                <LoaderCircle
                  size={20}
                  className="animate-spin"
                />
                {mensagemCarregamento}
              </>
            ) : sucesso ? (
              <>
                <CheckCircle2 size={20} />
                Conta criada!
              </>
            ) : (
              'Criar minha conta gratuitamente'
            )}
          </button>
        </form>

        {/* Link para login */}
        <p className="mt-7 text-center text-sm text-[#64746a]">
          Já possui uma conta?{' '}

          <Link
            to="/login"
            className="font-bold text-[#167342] hover:underline"
          >
            Entrar
          </Link>
        </p>

        <p className="mt-5 text-center text-xs text-[#849186]">
          ColheitaSmart — Sua colheita, nosso cuidado.
        </p>
      </section>
    </main>
  )
}
