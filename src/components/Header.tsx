
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Sprout,
  Menu,
  X,
  ArrowUpRight,
  House,
  LogIn,
  UserPlus,
  LogOut,
  Leaf,
} from 'lucide-react'
import { API_BASE } from '../services/apiColheitas'

const linksInstitucionais = [
  { nome: 'Início', rota: '/' },
  { nome: 'Sobre', rota: '/sobre' },
  { nome: 'Integrantes', rota: '/integrantes' },
  { nome: 'FAQ', rota: '/faq' },
  { nome: 'Contato', rota: '/contato' },
]

const linksPainel = [
  { nome: 'Minha Colheita', rota: '/colheitas' },
  { nome: 'O que fazer hoje?', rota: '/tarefas' },
  { nome: 'Vender Colheita', rota: '/vendas' },
  { nome: 'Carteira', rota: '/financeiro' },
]

export default function Header() {
  const [aberto, setAberto] = useState(false)
  const [autenticado, setAutenticado] = useState(false)
  const [verificando, setVerificando] = useState(true)

  const { pathname } = useLocation()
  const navigate = useNavigate()

  const estaNoPainel = linksPainel.some(
    link =>
      pathname === link.rota ||
      pathname.startsWith(`${link.rota}/`)
  ) || pathname.startsWith('/colheitas/')

  const navegacao = estaNoPainel
    ? linksPainel
    : linksInstitucionais

  useEffect(() => {
    setAberto(false)
  }, [pathname])

  // Confere a sessão real na API original.
  useEffect(() => {
    const controller = new AbortController()

    async function verificarLogin() {
      setVerificando(true)

      try {
        const resposta = await fetch(`${API_BASE}/auth/me`, {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
        })

        if (!controller.signal.aborted) {
          setAutenticado(resposta.ok)
        }
      } catch {
        if (!controller.signal.aborted) {
          setAutenticado(false)
        }
      } finally {
        if (!controller.signal.aborted) {
          setVerificando(false)
        }
      }
    }

    void verificarLogin()

    return () => controller.abort()
  }, [pathname])

  async function sair() {
    try {
      const csrfResposta = await fetch(`${API_BASE}/csrf`, {
        credentials: 'include',
      })

      if (!csrfResposta.ok) {
        throw new Error('Não foi possível obter o CSRF.')
      }

      const csrf: {
        token: string
        headerName: string
      } = await csrfResposta.json()

      const resposta = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          [csrf.headerName || 'X-CSRF-TOKEN']: csrf.token,
        },
      })

      if (!resposta.ok) {
        throw new Error('Não foi possível encerrar a sessão.')
      }

      setAutenticado(false)
      setAberto(false)
      navigate('/')
    } catch {
      window.alert(
        'Não foi possível sair da conta. Tente novamente.'
      )
    }
  }

  const botaoClaro =
    'inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 px-4 py-3 text-sm font-semibold text-[#073B2C] transition hover:bg-green-50'

  const botaoVerde =
    'inline-flex items-center justify-center gap-2 rounded-xl bg-[#073B2C] px-4 py-3 text-sm font-bold text-white transition hover:bg-green-800'

  return (
    <header className="sticky top-0 z-50 w-full min-w-0 border-b border-green-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl min-w-0 items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">

        {/* Logo */}
        <Link
          to="/"
          onClick={() => setAberto(false)}
          className="flex min-w-0 items-center gap-2 text-[1.05rem] font-extrabold tracking-tight text-[#073B2C] sm:text-xl"
        >
          <span className="shrink-0 rounded-xl bg-[#073B2C] p-2 text-[#B8F34B]">
            <Sprout size={21} />
          </span>

          <span className="min-w-0 truncate">
            ColheitaSmart
          </span>
        </Link>

        {/* Navegação desktop */}
        <nav
          className="hidden items-center gap-5 lg:flex xl:gap-6"
          aria-label="Navegação principal"
        >
          {navegacao.map(link => (
            <NavLink
              key={link.rota}
              to={link.rota}
              className={({ isActive }) =>
                `whitespace-nowrap text-sm font-semibold transition hover:text-green-700 ${
                  isActive
                    ? 'text-green-700'
                    : 'text-slate-600'
                }`
              }
            >
              {link.nome}
            </NavLink>
          ))}
        </nav>

        {/* Botões desktop */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {verificando ? (
            <span className="px-4 text-sm text-slate-400">
              Verificando...
            </span>
          ) : autenticado ? (
            <>
              <Link
                to="/colheitas"
                className={botaoVerde}
              >
                <Leaf size={17} />
                Minha Colheita
              </Link>

              <button
                type="button"
                onClick={sair}
                className={botaoClaro}
              >
                <LogOut size={17} />
                Sair
              </button>
            </>
          ) : estaNoPainel ? (
            <Link to="/" className={botaoClaro}>
              <House size={17} />
              Início
            </Link>
          ) : (
            <>
              <Link to="/login" className={botaoClaro}>
                <LogIn size={17} />
                Entrar
              </Link>

              <Link to="/cadastro" className={botaoVerde}>
                <UserPlus size={17} />
                Criar conta
                <ArrowUpRight size={16} />
              </Link>
            </>
          )}
        </div>

        {/* Botão do menu mobile */}
        <button
          type="button"
          className="ml-auto shrink-0 rounded-lg p-2 text-green-950 lg:hidden"
          aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={aberto}
          aria-controls="menu-mobile"
          onClick={() => setAberto(valor => !valor)}
        >
          {aberto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Navegação mobile */}
      {aberto && (
        <nav
          id="menu-mobile"
          className="max-h-[calc(100dvh-70px)] overflow-y-auto border-t border-green-100 bg-white px-4 py-4 sm:px-6 lg:hidden"
          aria-label="Navegação mobile"
        >
          {navegacao.map(link => (
            <NavLink
              key={link.rota}
              to={link.rota}
              onClick={() => setAberto(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-3 font-semibold ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-green-950 hover:bg-green-50'
                }`
              }
            >
              {link.nome}
            </NavLink>
          ))}

          <div className="mt-4 space-y-2 border-t border-green-100 pt-4">
            {verificando ? (
              <p className="py-3 text-center text-sm text-slate-500">
                Verificando sessão...
              </p>
            ) : autenticado ? (
              <>
                <Link
                  to="/colheitas"
                  onClick={() => setAberto(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#073B2C] px-4 py-3 font-bold text-white"
                >
                  <Leaf size={18} />
                  Minha Colheita
                </Link>

                <button
                  type="button"
                  onClick={sair}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-200 px-4 py-3 font-bold text-[#073B2C]"
                >
                  <LogOut size={18} />
                  Sair da conta
                </button>
              </>
            ) : estaNoPainel ? (
              <Link
                to="/"
                onClick={() => setAberto(false)}
                className="block rounded-lg bg-[#073B2C] px-4 py-3 text-center font-bold text-white"
              >
                Voltar ao início
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setAberto(false)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-green-200 px-4 py-3 font-bold text-[#073B2C]"
                >
                  <LogIn size={18} />
                  Entrar
                </Link>

                <Link
                  to="/cadastro"
                  onClick={() => setAberto(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#073B2C] px-4 py-3 font-bold text-white"
                >
                  <UserPlus size={18} />
                  Criar conta gratuitamente
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
