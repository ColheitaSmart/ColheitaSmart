
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  Package,
  Plus,
  Search,
  Sprout,
  Scale,
  Thermometer,
  Warehouse,
  ShoppingBasket,
  CheckCircle2,
} from 'lucide-react'

type Lote = {
  id: string | number
  produto: string
  emoji?: string
  quantidade: number
  data: string
  armazenamento: string
  temperatura?: number | string | null
  status?: string
}

type Anuncio = {
  id: string
  loteId?: string | number
  quantidade: number
  status: 'Ativo' | 'Encerrado'
}

type Venda = {
  id: string
  anuncioId: string
  loteId?: string | number
  quantidade: number
}

type Dados = {
  lotes: Lote[]
  anuncios: Anuncio[]
  vendas: Venda[]
}

const CHAVE_LOTES = 'colheitasmart_lotes'
const CHAVE_ANUNCIOS = 'colheitasmart_anuncios'
const CHAVE_VENDAS = 'colheitasmart_vendas'

function carregar<T>(chave: string): T[] {
  try {
    const dados: unknown = JSON.parse(
      localStorage.getItem(chave) || '[]'
    )
    return Array.isArray(dados) ? dados as T[] : []
  } catch {
    return []
  }
}

function lerDados(): Dados {
  return {
    lotes: carregar<Lote>(CHAVE_LOTES).filter(
      lote =>
        lote != null &&
        typeof lote.produto === 'string' &&
        (typeof lote.id === 'string' ||
          typeof lote.id === 'number') &&
        Number.isFinite(Number(lote.quantidade)) &&
        Number(lote.quantidade) >= 0
    ),
    anuncios: carregar<Anuncio>(CHAVE_ANUNCIOS),
    vendas: carregar<Venda>(CHAVE_VENDAS),
  }
}

function situacao(status?: string) {
  if (status === 'Bom') {
    return {
      nome: 'Boas condições',
      classe: 'bg-green-100 text-green-800',
    }
  }

  if (status === 'Atenção') {
    return {
      nome: 'Atenção',
      classe: 'bg-amber-100 text-amber-800',
    }
  }

  if (status === 'Alto risco') {
    return {
      nome: 'Alto risco',
      classe: 'bg-red-100 text-red-800',
    }
  }

  return {
    nome: 'Aguardando avaliação',
    classe: 'bg-amber-50 text-amber-800',
  }
}

function numero(valor: number) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
  })
}

function arredondar(valor: number) {
  return Math.round(
    (valor + Number.EPSILON) * 100
  ) / 100
}

export default function MinhaColheita() {
  const [dados, setDados] = useState<Dados>(lerDados)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('Todos')

  const { lotes, anuncios, vendas } = dados

  useEffect(() => {
    function atualizar() {
      setDados(lerDados())
    }

    function aoMudarStorage(evento: StorageEvent) {
      if (
        evento.key === null ||
        [
          CHAVE_LOTES,
          CHAVE_ANUNCIOS,
          CHAVE_VENDAS,
        ].includes(evento.key)
      ) {
        atualizar()
      }
    }

    window.addEventListener('focus', atualizar)
    window.addEventListener('pageshow', atualizar)
    window.addEventListener('storage', aoMudarStorage)

    return () => {
      window.removeEventListener('focus', atualizar)
      window.removeEventListener('pageshow', atualizar)
      window.removeEventListener('storage', aoMudarStorage)
    }
  }, [])

  const estoque = useMemo(() => {
    const resultado = new Map<
      string,
      {
        vendido: number
        fisico: number
        reservado: number
        livre: number
      }
    >()

    for (const lote of lotes) {
      const id = String(lote.id)

      const vendido = arredondar(
        vendas
          .filter(venda => String(venda.loteId) === id)
          .reduce(
            (soma, venda) =>
              soma + (Number(venda.quantidade) || 0),
            0
          )
      )

      const fisico = Math.max(
        0,
        arredondar(Number(lote.quantidade) - vendido)
      )

      const reservado = arredondar(
        anuncios
          .filter(
            anuncio =>
              String(anuncio.loteId) === id &&
              anuncio.status === 'Ativo'
          )
          .reduce((soma, anuncio) => {
            const vendidoNoAnuncio = vendas
              .filter(
                venda =>
                  String(venda.anuncioId) ===
                  String(anuncio.id)
              )
              .reduce(
                (total, venda) =>
                  total + (Number(venda.quantidade) || 0),
                0
              )

            const restante = Math.max(
              0,
              arredondar(
                Number(anuncio.quantidade) -
                vendidoNoAnuncio
              )
            )

            return soma + restante
          }, 0)
      )

      resultado.set(id, {
        vendido,
        fisico,
        reservado,
        livre: Math.max(
          0,
          arredondar(fisico - reservado)
        ),
      })
    }

    return resultado
  }, [lotes, anuncios, vendas])

  const filtrados = useMemo(
    () =>
      lotes.filter(lote => {
        const correspondeBusca = lote.produto
          .toLowerCase()
          .includes(busca.trim().toLowerCase())

        const correspondeFiltro =
          filtro === 'Todos' ||
          (filtro === 'Pendente'
            ? !lote.status ||
            lote.status === 'Aguardando avaliação'
            : lote.status === filtro)

        return correspondeBusca && correspondeFiltro
      }),
    [lotes, busca, filtro]
  )

  const totalRegistrado = lotes.reduce(
    (soma, lote) => soma + Number(lote.quantidade),
    0
  )

  const totalFisico = Array.from(estoque.values()).reduce(
    (soma, item) => soma + item.fisico,
    0
  )

  const totalVendido = Array.from(estoque.values()).reduce(
    (soma, item) => soma + item.vendido,
    0
  )

  const totalReservado = Array.from(estoque.values()).reduce(
    (soma, item) => soma + item.reservado,
    0
  )

  const pendentes = lotes.filter(
    lote =>
      !lote.status ||
      lote.status === 'Aguardando avaliação'
  ).length

  const indicadores = [
    {
      titulo: 'Lotes cadastrados',
      valor: numero(lotes.length),
      unidade: 'lotes',
      icone: Package,
    },
    {
      titulo: 'Estoque atual',
      valor: numero(totalFisico),
      unidade: 'kg',
      icone: Scale,
    },
    {
      titulo: 'Quantidade vendida',
      valor: numero(totalVendido),
      unidade: 'kg',
      icone: CheckCircle2,
    },
    {
      titulo: 'Reservado em anúncios',
      valor: numero(totalReservado),
      unidade: 'kg',
      icone: ShoppingBasket,
    },
  ]

  return (
    <main className="min-h-screen bg-[#F6F8F2]">
      <section className="bg-[#073B2C] px-6 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-lime-300">
              <Sprout size={18} />
              SEU PAINEL
            </p>

            <h1 className="mt-3 text-4xl font-extrabold">
              Minha Colheita
            </h1>

            <p className="mt-3 text-green-100">
              Organize seus lotes e acompanhe sua produção
              após a colheita.
            </p>
          </div>

          <Link
            to="/colheitas/nova"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B8F34B] px-6 py-4 font-bold text-[#073B2C] hover:bg-lime-200"
          >
            <Plus size={20} />
            Nova colheita
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {indicadores.map(item => {
            const Icone = item.icone

            return (
              <div
                key={item.titulo}
                className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-600">
                    {item.titulo}
                  </p>

                  <Icone
                    className="shrink-0 text-green-700"
                    size={23}
                  />
                </div>

                <p className="mt-5 flex items-baseline gap-2">
                  <strong className="text-3xl text-[#073B2C]">
                    {item.valor}
                  </strong>

                  <span className="text-sm text-slate-500">
                    {item.unidade}
                  </span>
                </p>
              </div>
            )
          })}
        </div>

        {lotes.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-green-100 bg-[#E7F5D6] px-5 py-4 text-sm text-green-900">
            <Scale size={19} />

            <span>
              <strong>{numero(totalRegistrado)} kg</strong>
              {' '}cadastrados originalmente
            </span>

            <span className="text-green-500">•</span>

            <span>
              <strong>{numero(pendentes)}</strong>
              {' '}lotes aguardando avaliação
            </span>
          </div>
        )}

        <section className="mt-10 rounded-3xl border border-green-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-extrabold text-[#073B2C]">
                Seus lotes
              </h2>

              <p className="mt-1 text-slate-500">
                Consulte as informações das suas colheitas.
              </p>
            </div>

            {lotes.length > 0 && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3">
                  <Search
                    size={18}
                    className="text-slate-400"
                  />

                  <input
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    aria-label="Buscar alimento"
                    placeholder="Buscar alimento..."
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </label>

                <select
                  value={filtro}
                  onChange={e => setFiltro(e.target.value)}
                  aria-label="Filtrar situação"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                >
                  <option value="Todos">
                    Todos os lotes
                  </option>
                  <option value="Pendente">
                    Aguardando avaliação
                  </option>
                  <option value="Bom">
                    Boas condições
                  </option>
                  <option value="Atenção">
                    Atenção
                  </option>
                  <option value="Alto risco">
                    Alto risco
                  </option>
                </select>
              </div>
            )}
          </div>

          {lotes.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-16 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#E7F5D6]">
                <Sprout
                  size={44}
                  className="text-green-800"
                />
              </div>

              <h3 className="mt-7 text-2xl font-extrabold text-[#073B2C]">
                Sua primeira colheita começa aqui.
              </h3>

              <p className="mt-3 max-w-lg text-slate-600">
                Cadastre seus alimentos para acompanhar
                as quantidades, o armazenamento e as
                próximas etapas.
              </p>

              <Link
                to="/colheitas/nova"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#073B2C] px-6 py-4 font-bold text-white hover:bg-green-800"
              >
                <Plus size={19} />
                Cadastrar primeira colheita
              </Link>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="py-16 text-center">
              <Search
                size={38}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-bold text-slate-700">
                Nenhum lote encontrado
              </h3>

              <button
                type="button"
                onClick={() => {
                  setBusca('')
                  setFiltro('Todos')
                }}
                className="mt-3 font-semibold text-green-700"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtrados.map(lote => {
                const estado = situacao(lote.status)

                const saldo = estoque.get(
                  String(lote.id)
                ) ?? {
                  vendido: 0,
                  fisico: Number(lote.quantidade),
                  reservado: 0,
                  livre: Number(lote.quantidade),
                }

                return (
                  <article
                    key={String(lote.id)}
                    className="rounded-2xl border border-slate-200 p-5 transition hover:border-green-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-green-50 text-3xl">
                          {lote.emoji || '🌱'}
                        </span>

                        <div>
                          <h3 className="font-bold text-[#073B2C]">
                            {lote.produto}
                          </h3>

                          <p className="text-xs text-slate-400">
                            Lote #
                            {String(lote.id)
                              .slice(0, 8)
                              .toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-center text-xs font-bold ${estado.classe}`}
                      >
                        {estado.nome}
                      </span>
                    </div>

                    <div className="mt-6 space-y-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Scale size={15} />
                          Quantidade inicial
                        </span>

                        <strong>
                          {numero(Number(lote.quantidade))} kg
                        </strong>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="flex items-center gap-1 text-slate-500">
                          <CheckCircle2 size={15} />
                          Vendido
                        </span>

                        <strong>
                          {numero(saldo.vendido)} kg
                        </strong>
                      </div>

                      <div className="flex justify-between gap-3 rounded-lg bg-green-50 px-3 py-2">
                        <span className="font-semibold text-green-800">
                          Estoque atual
                        </span>

                        <strong className="text-green-900">
                          {numero(saldo.fisico)} kg
                        </strong>
                      </div>

                      {saldo.reservado > 0 && (
                        <div className="flex justify-between gap-3">
                          <span className="flex items-center gap-1 text-slate-500">
                            <ShoppingBasket size={15} />
                            Em anúncios
                          </span>

                          <strong>
                            {numero(saldo.reservado)} kg
                          </strong>
                        </div>
                      )}

                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">
                          Livre para anunciar
                        </span>

                        <strong>
                          {numero(saldo.livre)} kg
                        </strong>
                      </div>

                      <div className="border-t border-slate-100 pt-3" />

                      <div className="flex justify-between gap-3">
                        <span className="flex items-center gap-1 text-slate-500">
                          <CalendarDays size={15} />
                          Colheita
                        </span>

                        <span>{lote.data}</span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Warehouse size={15} />
                          Armazenamento
                        </span>

                        <span className="text-right">
                          {lote.armazenamento}
                        </span>
                      </div>

                      {lote.temperatura !== undefined &&
                        lote.temperatura !== null &&
                        lote.temperatura !== '' && (
                          <div className="flex justify-between gap-3">
                            <span className="flex items-center gap-1 text-slate-500">
                              <Thermometer size={15} />
                              Temperatura
                            </span>

                            <span>
                              {lote.temperatura} °C
                            </span>
                          </div>
                        )}
                    </div>

                    <Link
                      to={`/colheitas/${encodeURIComponent(
                        String(lote.id)
                      )}`}
                      className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-bold text-green-800 hover:text-green-600"
                    >
                      Ver detalhes
                      <ArrowRight size={17} />
                    </Link>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <p className="mt-8 text-center text-xs text-slate-400">
          ColheitaSmart — Sua colheita vale mais.
        </p>
      </div>
    </main>
  )
}
