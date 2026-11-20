
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  Sprout,
  Menu,
  X,
  ArrowUpRight,
  House,
  LogIn,
  UserPlus,
} from 'lucide-react'

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
  const { pathname } = useLocation()

  const estaNoPainel = linksPainel.some(
    link =>
      pathname === link.rota ||
      pathname.startsWith(`${link.rota}/`)
  )

    pathname === '/login' || pathname === '/cadastro'

  const navegacao = estaNoPainel
    ? linksPainel
    : linksInstitucionais

  useEffect(() => {
    setAberto(false)
  }, [pathname])

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

          {estaNoPainel ? (
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-green-200 px-4 py-3 text-sm font-semibold text-[#073B2C] hover:bg-green-50"
            >
              <House size={17} />
              Início
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-green-200 px-4 py-3 text-sm font-bold text-[#073B2C] transition hover:bg-green-50"
              >
                <LogIn size={17} />
                Entrar
              </Link>

              <Link
                to="/cadastro"
                className="inline-flex items-center gap-2 rounded-xl bg-[#073B2C] px-4 py-3 text-sm font-bold text-white transition hover:bg-green-800"
              >
                <UserPlus size={17} />
                Criar conta
                <ArrowUpRight size={16} />
              </Link>
            </>
          )}
        </div>

        {/* Menu mobile */}
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

            {estaNoPainel ? (
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
