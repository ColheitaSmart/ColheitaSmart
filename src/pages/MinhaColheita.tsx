import { avaliarLoteLegado } from '../utils/avaliacaoLote'

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Package,
  Plus,
  Search,
  Sprout,
  Scale,
  Thermometer,
  Warehouse,
  ShoppingBasket,
  CheckCircle2,
  ArrowUpRight,
  Leaf,
  Sparkles,
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
  disponivelKg?: number
  statusApi?: string
  origem?: 'api' | 'local'
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

const API_LOTES = 'https://colheitasmart-api.onrender.com/lotes'

// IDs conforme a ordem observada no GET; confirmar com a equipe Java.
const CULTURAS: Record<number, { produto: string; emoji: string }> = {
  1: { produto: 'Tomate', emoji: '🍅' },
  2: { produto: 'Banana', emoji: '🍌' },
  3: { produto: 'Alface', emoji: '🥬' },
  4: { produto: 'Morango', emoji: '🍓' },
  5: { produto: 'Manga', emoji: '🥭' },
  6: { produto: 'Batata', emoji: '🥔' },
}

type LoteApi = {
  cdLote: number
  cdAgricultor: number
  cdCultura: number
  qtPesoInicialKg: number
  qtPesoDisponivelKg: number
  dtColheita: string
  dsArmazenamento: string
  vlPrecoKg?: number
  dsStatus?: string
}

function converterLoteApi(item: LoteApi): Lote {
  const cultura = CULTURAS[Number(item.cdCultura)]
  const data = String(item.dtColheita || '')
  const [ano, mes, dia] = data.split('-')
  const quantidade = Number(item.qtPesoInicialKg)
  const disponivel = Number(item.qtPesoDisponivelKg)
  const loteBase: Lote = {
    id: item.cdLote,
    produto: cultura?.produto ?? `Cultura #${item.cdCultura}`,
    emoji: cultura?.emoji ?? '🌱',
    quantidade: Number.isFinite(quantidade) ? quantidade : 0,
    disponivelKg: Number.isFinite(disponivel) ? Math.max(0, disponivel) : 0,
    data: ano && mes && dia ? `${dia}/${mes}/${ano}` : data,
    armazenamento: item.dsArmazenamento || 'Não informado',
    statusApi: item.dsStatus,
    origem: 'api',
  }
  // A API indica disponibilidade de estoque, não o risco pós-colheita.
  // A avaliação abaixo é preliminar, baseada nos campos disponíveis.
  return avaliarLoteLegado(loteBase)
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

function lerDadosLocais(): Dados {
  return {
    lotes: carregar<Lote>(CHAVE_LOTES).filter(
      lote =>
        lote != null &&
        typeof lote.produto === 'string' &&
        (typeof lote.id === 'string' ||
          typeof lote.id === 'number') &&
        Number.isFinite(Number(lote.quantidade)) &&
        Number(lote.quantidade) >= 0
    ).map(lote => avaliarLoteLegado(lote)),
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
  const [dados, setDados] = useState<Dados>(() => ({ ...lerDadosLocais(), lotes: [] }))
  const [carregando, setCarregando] = useState(true)
  const [erroApi, setErroApi] = useState('')
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('Todos')

  const { lotes, anuncios, vendas } = dados

  useEffect(() => {
    let ativo = true
    const controlador = new AbortController()

    async function atualizar() {
      try {
        setCarregando(true)
        const resposta = await fetch(API_LOTES, {
          signal: controlador.signal,
          headers: { Accept: 'application/json' },
        })
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`)
        const json: unknown = await resposta.json()
        if (!Array.isArray(json)) throw new Error('Formato inesperado da API')
        const lotesApi = (json as LoteApi[]).map(converterLoteApi)
        if (!ativo) return
        const locais = lerDadosLocais()
        setDados({ ...locais, lotes: lotesApi })
        setErroApi('')
      } catch (erro) {
        if (!ativo) return
        setErroApi(`Não foi possível carregar os lotes da API Java: ${erro instanceof Error ? erro.message : 'erro desconhecido'}.`)
        // Não exibir dados locais como se tivessem sido persistidos na API.
        setDados({ ...lerDadosLocais(), lotes: [] })
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    void atualizar()
    return () => { ativo = false; controlador.abort() }
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

      const fisico = lote.origem === 'api'
        ? Math.max(0, arredondar(Number(lote.disponivelKg ?? 0)))
        : Math.max(0, arredondar(Number(lote.quantidade) - vendido))

      const reservadoLocal = arredondar(
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

      const reservado = lote.origem === 'api' ? 0 : reservadoLocal

      resultado.set(id, {
        // Vendas do navegador não são vendas confirmadas pela API.
        vendido: lote.origem === 'api' ? 0 : vendido,
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

  const porProduto = Object.entries(lotes.reduce<Record<string, number>>((acc, lote) => {
    const nome = lote.produto.trim() || 'Outro alimento'
    acc[nome] = (acc[nome] || 0) + (estoque.get(String(lote.id))?.fisico || 0)
    return acc
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maiorProduto = Math.max(1, ...porProduto.map(([, valor]) => valor))

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
      titulo: 'Vendas locais (não sincronizadas)',
      valor: numero(totalVendido),
      unidade: 'kg',
      icone: CheckCircle2,
    },
    {
      titulo: 'Reservas locais (não sincronizadas)',
      valor: numero(totalReservado),
      unidade: 'kg',
      icone: ShoppingBasket,
    },
  ]

  return (
    <main className="min-h-screen min-w-0 bg-[#F5F7F1] text-[#123B2A]">
      <section className="relative isolate overflow-hidden bg-[#08291D] px-4 py-12 text-white sm:px-6 sm:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-36 h-96 w-96 rounded-full bg-[#B8F34B]/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at center, #D9F6A2 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[-110px] left-[-80px] h-72 w-72 rounded-full border-[45px] border-[#B8F34B]/10" />
        <div className="relative mx-auto flex max-w-7xl min-w-0 flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#F5C76D]/35 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-[#F5C76D] backdrop-blur-md">
              <Sprout size={18} />
              SEU PAINEL
            </p>

            <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.8rem)] font-black leading-[1.03] tracking-[-.055em]">
              Minha <span className="text-[#F5C76D]">Colheita.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              Organize seus lotes e acompanhe sua produção
              após a colheita.
            </p>
          </div>

          <Link
            to="/colheitas/nova"
            className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#F5C76D] px-7 py-4 text-center font-extrabold text-[#123B2A] shadow-[0_14px_38px_rgba(0,0,0,.2)] transition duration-300 hover:-translate-y-1 hover:bg-[#FFE3A0] sm:w-auto"
          >
            <Plus size={20} />
            Nova colheita
              <ArrowUpRight size={19} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl min-w-0 px-4 py-9 sm:px-6 sm:py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.2em] text-[#49814C]"><Sparkles size={15} /> Visão geral</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#123B2A] sm:text-3xl">Sua produção em números</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D8E8D0] bg-white px-4 py-2 text-xs font-bold text-[#52735B]"><Leaf size={15} /> Acompanhamento pós-colheita</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {indicadores.map(item => {
            const Icone = item.icone

            return (
              <div
                key={item.titulo}
                className="group relative min-w-0 overflow-hidden rounded-[26px] border border-[#DEE8D9] bg-white p-5 shadow-[0_10px_35px_rgba(17,52,32,.05)] transition duration-300 hover:-translate-y-1 hover:border-[#B7D69D] hover:shadow-[0_18px_40px_rgba(17,52,32,.1)] sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#607467]">
                    {item.titulo}
                  </p>

                  <Icone
                    className="shrink-0 rounded-xl bg-[#EAF5DD] p-2 text-[#22613D]"
                    size={39}
                  />
                </div>

                <p className="mt-7 flex min-w-0 flex-wrap items-baseline gap-2">
                  <strong className="min-w-0 break-all text-3xl font-black tracking-tight text-[#123B2A] sm:text-4xl">
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
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#D7E6CA] bg-[#EDF5E6] px-5 py-4 text-sm text-[#295239]">
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

        {porProduto.length > 0 && (
          <section aria-label="Estoque por alimento" className="mt-10 min-w-0 rounded-[30px] border border-[#DFE9DA] bg-white p-5 shadow-[0_12px_40px_rgba(17,52,32,.05)] sm:p-7 md:p-9">
            <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-2xl font-black tracking-tight text-[#103B2A]">Estoque por alimento</h2><span className="text-xs text-slate-500">Quantidade atual em kg</span></div>
            <div className="mt-6 space-y-4">
              {porProduto.map(([nome, valor]) => (
                <div key={nome}>
                  <div className="mb-2 flex justify-between gap-3 text-sm"><span className="min-w-0 break-words font-semibold text-[#244735]">{nome}</span><span className="shrink-0 font-bold tabular-nums text-[#244735]">{numero(valor)} kg</span></div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#E7F0E4]"><div className="h-full rounded-full bg-gradient-to-r from-[#327D49] to-[#B8F34B] transition-all duration-500" style={{width: `${Math.max(0, valor / maiorProduto * 100)}%`}} /></div>
                </div>
              ))}
            </div>
          </section>
        )}
        {carregando && (
          <p role="status" className="mt-6 rounded-xl bg-white p-4 text-sm text-slate-700">
            Carregando lotes da API Java...
          </p>
        )}
        {erroApi && (
          <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {erroApi} Verifique a conexão e atualize a página.
          </p>
        )}
        <section id="seus-lotes" className="mt-10 min-w-0 scroll-mt-28 rounded-[30px] border border-[#DFE9DA] bg-white p-5 shadow-[0_12px_40px_rgba(17,52,32,.05)] sm:p-7 md:p-9">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-[#103B2A]">
                Seus lotes
              </h2>

              <p className="mt-1 text-slate-500">
                Consulte as informações das suas colheitas.
              </p>
            </div>

            {lotes.length > 0 && (
              <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row">
                <label className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-[#DAE5D6] bg-[#F8FAF6] px-3 py-3 transition focus-within:border-[#65A24B] focus-within:ring-2 focus-within:ring-[#B8F34B]/30 sm:w-auto sm:px-4">
                  <Search
                    size={18}
                    className="text-slate-400"
                  />

                  <input
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    aria-label="Buscar alimento"
                    placeholder="Buscar alimento..."
                    className="min-w-0 w-full bg-transparent text-sm outline-none"
                  />
                </label>

                <select
                  value={filtro}
                  onChange={e => setFiltro(e.target.value)}
                  aria-label="Filtrar situação"
                  className="w-full min-w-0 rounded-2xl border border-[#DAE5D6] bg-[#F8FAF6] px-3 py-3 text-sm outline-none focus:border-[#65A24B] focus:ring-2 focus:ring-[#B8F34B]/30 sm:w-auto sm:px-4"
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

          {carregando ? (
            <p className="py-12 text-center text-slate-600">Consultando a API Java...</p>
          ) : erroApi ? (
            <p className="py-12 text-center text-red-700">Não foi possível exibir os lotes. Tente atualizar a página.</p>
          ) : lotes.length === 0 ? (
            <div className="flex min-w-0 flex-col items-center px-1 py-12 text-center sm:px-4 sm:py-16">
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
                className="mt-7 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-xl bg-[#073B2C] px-4 py-4 text-center text-sm font-bold text-white hover:bg-green-800 sm:px-6 sm:text-base"
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
                    className="group relative min-w-0 overflow-hidden rounded-[25px] border border-[#DDE8D8] bg-[#FCFDFB] p-5 shadow-[0_6px_20px_rgba(17,52,32,.035)] transition duration-300 hover:-translate-y-1 hover:border-[#A5C994] hover:shadow-[0_18px_40px_rgba(17,52,32,.1)] sm:p-6"
                  >
                    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#276B44] via-[#B8F34B] to-[#F5C76D]" />
                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#DDEACF] bg-gradient-to-br from-[#F2F9E9] to-[#DDEFCB] text-3xl shadow-inner">
                          {lote.emoji || '🌱'}
                        </span>

                        <div className="min-w-0">
                          <h3 className="break-words text-lg font-extrabold text-[#103B2A]">
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
                      <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Scale size={15} />
                          Quantidade inicial
                        </span>

                        <strong>
                          {numero(Number(lote.quantidade))} kg
                        </strong>
                      </div>

                      <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1 text-slate-500">
                          <CheckCircle2 size={15} />
                          Vendido
                        </span>

                        <strong>
                          {numero(saldo.vendido)} kg
                        </strong>
                      </div>

                      <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-1 rounded-xl border border-[#DCECCF] bg-[#EDF7E5] px-3 py-3">
                        <span className="font-semibold text-green-800">
                          Estoque atual
                        </span>

                        <strong className="text-green-900">
                          {numero(saldo.fisico)} kg
                        </strong>
                      </div>

                      {saldo.reservado > 0 && (
                        <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-1">
                          <span className="flex items-center gap-1 text-slate-500">
                            <ShoppingBasket size={15} />
                            Em anúncios
                          </span>

                          <strong>
                            {numero(saldo.reservado)} kg
                          </strong>
                        </div>
                      )}

                      <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-1">
                        <span className="text-slate-500">
                          Livre para anunciar
                        </span>

                        <strong>
                          {numero(saldo.livre)} kg
                        </strong>
                      </div>

                      <div className="border-t border-slate-100 pt-3" />

                      <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1 text-slate-500">
                          <CalendarDays size={15} />
                          Colheita
                        </span>

                        <span>{lote.data}</span>
                      </div>

                      <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Warehouse size={15} />
                          Armazenamento
                        </span>

                        <span className="min-w-0 break-words text-right">
                          {lote.armazenamento}
                        </span>
                      </div>

                      {lote.temperatura !== undefined &&
                        lote.temperatura !== null &&
                        lote.temperatura !== '' && (
                          <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-1">
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
                      className="mt-6 flex items-center justify-between border-t border-[#DFE9DA] pt-5 text-sm font-extrabold text-[#21633D] transition group-hover:text-[#418D3E]"
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

        <p className="mt-10 text-center text-xs text-[#7A8C7E]">
          ColheitaSmart — Sua colheita vale mais.
        </p>
      </div>
    </main>
  )
}
