
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Sprout,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react'

export default function Cadastro() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')

    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      setErro('Preencha todos os campos para continuar.')
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

    // Vamos conectar este formulário à API Java.
    // Por enquanto, não cria contas nem salva senhas.
    setErro('O cadastro estará disponível após a integração com a API.')
  }

  return (
    <main
      className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-[#123d2c] bg-cover bg-center px-4 py-12"
      style={{
        backgroundImage: "url('/images/cadastro-bananas.jpg')",
      }}
    >
      {/* Camada para melhorar o contraste */}
      <div className="absolute inset-0 bg-[#05291b]/45" />

      <section className="relative z-10 w-full max-w-lg rounded-[28px] border border-white/60 bg-white/95 p-7 shadow-2xl backdrop-blur-md sm:p-10">
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
            Crie sua conta gratuitamente
          </h1>

          <p className="mt-2 text-sm text-[#64746a]">
            Comece a organizar sua produção de maneira simples e segura.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Digite seu nome completo"
                className="w-full rounded-xl border border-[#d9e4d9] bg-[#f8faf7] py-3 pl-12 pr-4 text-[#173e2a] outline-none transition focus:border-[#3d925d] focus:ring-2 focus:ring-[#3d925d]/20"
              />
            </div>
          </div>

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
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full rounded-xl border border-[#d9e4d9] bg-[#f8faf7] py-3 pl-12 pr-4 text-[#173e2a] outline-none transition focus:border-[#3d925d] focus:ring-2 focus:ring-[#3d925d]/20"
              />
            </div>
          </div>

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
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="Mínimo de 8 caracteres"
                className="w-full rounded-xl border border-[#d9e4d9] bg-[#f8faf7] py-3 pl-12 pr-12 text-[#173e2a] outline-none transition focus:border-[#3d925d] focus:ring-2 focus:ring-[#3d925d]/20"
              />

              <button
                type="button"
                onClick={() => setMostrarSenha(valor => !valor)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#73917c] hover:text-[#145c3a]"
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

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
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                placeholder="Digite sua senha novamente"
                className="w-full rounded-xl border border-[#d9e4d9] bg-[#f8faf7] py-3 pl-12 pr-4 text-[#173e2a] outline-none transition focus:border-[#3d925d] focus:ring-2 focus:ring-[#3d925d]/20"
              />
            </div>
          </div>

          <p className="flex items-center gap-2 text-xs text-[#64746a]">
            <CheckCircle2 size={16} className="shrink-0 text-[#16834a]" />
            A plataforma é 100% gratuita para agricultores.
          </p>

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
            className="w-full rounded-xl bg-[#145c3a] py-3.5 font-bold text-white shadow-md transition hover:bg-[#0c472b]"
          >
            Criar minha conta gratuitamente
          </button>
        </form>

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
