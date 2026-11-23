import { avaliarLoteLegado } from '../utils/avaliacaoLote'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, CalendarDays, CircleAlert, ClipboardList, Package,
  Sprout, Thermometer, Warehouse, Scale, ArrowRight, History,
  Megaphone, ShoppingCart,
} from 'lucide-react'

type Lote = {
  id: string | number
  produto: string
  emoji?: string
  quantidade: number
  data: string
  armazenamento: string
  temperatura?: string | number | null
  status?: string
  avaliacaoTipo?: string
  avaliacaoMotivo?: string
  criadoEm?: string
  createdAt?: string
}

type Registro = Record<string, unknown>
type Evento = {
  id: string
  tipo: 'cadastro' | 'anuncio' | 'venda'
  titulo: string
  descricao: string
  data: string | null
  instante: number | null
  ordem: number
}

const CHAVE_LOTES = 'colheitasmart_lotes'
const CHAVE_ANUNCIOS = 'colheitasmart_anuncios'
const CHAVE_VENDAS = 'colheitasmart_vendas'

function lerLista(chave: string): Registro[] {
  try {
    const valor: unknown = JSON.parse(localStorage.getItem(chave) || '[]')
    return Array.isArray(valor)
      ? valor.filter((item): item is Registro => item !== null && typeof item === 'object' && !Array.isArray(item))
      : []
  } catch {
    return []
  }
}

function texto(valor: unknown): string {
  return typeof valor === 'string' || typeof valor === 'number' ? String(valor) : ''
}

function numero(valor: number) {
  return Number(valor || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

function moeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function primeiraData(registro: Registro, campos: string[]): string | null {
  for (const campo of campos) {
    const valor = registro[campo]
    if (typeof valor === 'string' && valor.trim()) return valor.trim()
  }
  return null
}

function instanteData(valor: string | null): number | null {
  if (!valor) return null
  const br = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+.*)?$/)
  if (br) {
    const data = new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]))
    return data.getFullYear() === Number(br[3]) && data.getMonth() === Number(br[2]) - 1 && data.getDate() === Number(br[1]) ? data.getTime() : null
  }
  const iso = Date.parse(valor)
  return Number.isFinite(iso) ? iso : null
}

function exibirData(valor: string | null): string {
  if (!valor) return 'Data não registrada'
  const br = valor.match(/^\d{2}\/\d{2}\/\d{4}/)
  if (br) return valor
  const instante = instanteData(valor)
  return instante === null ? valor : new Date(instante).toLocaleDateString('pt-BR')
}

function carregarPagina(id: string | undefined) {
  const lotes = lerLista(CHAVE_LOTES)
  const anuncios = lerLista(CHAVE_ANUNCIOS)
  const vendas = lerLista(CHAVE_VENDAS)
  const registro = id ? lotes.find(item => texto(item.id) === id) : undefined
  return { lote: (registro as unknown as Lote | undefined) ?? null, anuncios, vendas }
}

function montarEventos(lote: Lote, anuncios: Registro[], vendas: Registro[]): Evento[] {
  const loteId = String(lote.id)
  const relacionados = anuncios.filter(anuncio => texto(anuncio.loteId) === loteId)
  const idsAnuncios = new Set(relacionados.map(anuncio => texto(anuncio.id)).filter(Boolean))
  const vendasDoLote = vendas.filter(venda =>
    (venda.loteId !== undefined && texto(venda.loteId) === loteId) ||
    (venda.anuncioId !== undefined && idsAnuncios.has(texto(venda.anuncioId)))
  )
  const eventos: Evento[] = []
  const cadastro = primeiraData(lote as unknown as Registro, ['criadoEm', 'createdAt', 'dataCadastro', 'dataCriacao'])
  eventos.push({
    id: `cadastro-${loteId}`,
    tipo: 'cadastro',
    titulo: 'Lote cadastrado',
    descricao: `${numero(Number(lote.quantidade))} kg de ${lote.produto} registrados. Data da colheita: ${lote.data || 'não informada'}.`,
    data: cadastro,
    instante: instanteData(cadastro),
    ordem: 0,
  })

  relacionados.forEach((anuncio, indice) => {
    const data = primeiraData(anuncio, ['criadoEm', 'createdAt', 'dataCriacao', 'dataCadastro', 'data'])
    const quantidade = Number(anuncio.quantidade)
    const preco = Number(anuncio.preco)
    const temPreco = anuncio.preco !== undefined && anuncio.preco !== null && anuncio.preco !== '' && Number.isFinite(preco)
    eventos.push({
      id: `anuncio-${texto(anuncio.id) || indice}`,
      tipo: 'anuncio',
      titulo: 'Anúncio criado',
      descricao: `${Number.isFinite(quantidade) ? `${numero(quantidade)} kg anunciados` : 'Quantidade não registrada'}${temPreco ? ` por ${moeda(preco)}/kg` : ''}. Situação atual: ${texto(anuncio.status) || 'não informada'}.`,
      data,
      instante: instanteData(data),
      ordem: indice + 1,
    })
  })

  vendasDoLote.forEach((venda, indice) => {
    const data = primeiraData(venda, ['criadoEm', 'createdAt', 'dataVenda', 'dataRegistro', 'data'])
    const quantidade = Number(venda.quantidade)
    const anuncio = relacionados.find(item => texto(item.id) === texto(venda.anuncioId))
    const valorDireto = [venda.valorTotal, venda.total, venda.valor].find(valor => valor !== undefined && valor !== null && valor !== '')
    const valorNumerico = Number(valorDireto)
    const precoUnitario = Number(venda.preco ?? anuncio?.preco)
    const total = valorDireto !== undefined && Number.isFinite(valorNumerico)
      ? valorNumerico
      : Number.isFinite(precoUnitario) && (venda.preco !== undefined || anuncio?.preco !== undefined) && Number.isFinite(quantidade)
        ? precoUnitario * quantidade
        : null
    eventos.push({
      id: `venda-${texto(venda.id) || indice}`,
      tipo: 'venda',
      titulo: 'Venda registrada',
      descricao: `${Number.isFinite(quantidade) ? `${numero(quantidade)} kg vendidos` : 'Quantidade não registrada'}${total !== null ? ` • ${moeda(total)}` : ''}.`,
      data,
      instante: instanteData(data),
      ordem: relacionados.length + indice + 1,
    })
  })

  // Registros sem data ficam depois dos datados; sua ordem cronológica não é presumida.
  return eventos.sort((a, b) => {
    if (a.instante !== null && b.instante !== null) return b.instante - a.instante || b.ordem - a.ordem
    if (a.instante !== null) return -1
    if (b.instante !== null) return 1
    return b.ordem - a.ordem
  })
}

export default function DetalhesColheita() {
  const { id } = useParams<{ id: string }>()
  const [dados, setDados] = useState(() => carregarPagina(id))

  useEffect(() => {
    const atualizar = () => setDados(carregarPagina(id))
    atualizar()
    window.addEventListener('focus', atualizar)
    window.addEventListener('pageshow', atualizar)
    window.addEventListener('storage', atualizar)
    return () => {
      window.removeEventListener('focus', atualizar)
      window.removeEventListener('pageshow', atualizar)
      window.removeEventListener('storage', atualizar)
    }
  }, [id])

  const lote = dados.lote ? avaliarLoteLegado(dados.lote) : null
  const eventos = useMemo(
    () => lote ? montarEventos(lote, dados.anuncios, dados.vendas) : [],
    [lote, dados.anuncios, dados.vendas]
  )

  if (!lote) return (
    <main className="min-h-[75vh] bg-[#F6F8F2] px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-6 text-center shadow-sm sm:p-10">
        <Package size={45} className="mx-auto text-green-700" />
        <h1 className="mt-5 text-2xl font-extrabold text-[#073B2C] sm:text-3xl">Lote não encontrado</h1>
        <p className="mt-3 text-slate-600">Esse lote não está disponível neste navegador.</p>
        <Link to="/colheitas" className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#073B2C] px-5 py-3 font-bold text-white"><ArrowLeft size={18} /> Voltar para Minha Colheita</Link>
      </div>
    </main>
  )

  const pendente = !lote.status || lote.status === 'Aguardando avaliação'
  const nomeStatus = pendente ? 'Aguardando avaliação' : lote.status === 'Bom' ? 'Boas condições' : lote.status
  const classeStatus = pendente ? 'bg-amber-50 text-amber-800' : lote.status === 'Bom' ? 'bg-green-100 text-green-800' : lote.status === 'Alto risco' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
  const informacoes = [
    { rotulo: 'Quantidade cadastrada', valor: `${numero(Number(lote.quantidade))} kg`, icone: Scale },
    { rotulo: 'Data da colheita', valor: lote.data || 'Não informada', icone: CalendarDays },
    { rotulo: 'Armazenamento', valor: lote.armazenamento || 'Não informado', icone: Warehouse },
    { rotulo: 'Temperatura registrada', valor: lote.temperatura !== undefined && lote.temperatura !== null && lote.temperatura !== '' ? `${lote.temperatura} °C` : 'Não informada', icone: Thermometer },
  ]

  return (
    <main className="min-h-screen bg-[#F6F8F2]">
      <section className="bg-[#073B2C] px-4 py-10 text-white sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <Link to="/colheitas" className="inline-flex items-center gap-2 text-sm font-semibold text-green-100 hover:text-lime-300"><ArrowLeft size={18} /> Minha Colheita</Link>
          <p className="mt-8 flex items-center gap-2 text-sm font-bold text-lime-300"><Sprout size={17} /> DETALHES DO LOTE</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-4xl sm:h-20 sm:w-20 sm:text-5xl">{lote.emoji || '🌱'}</span>
            <div className="min-w-0"><h1 className="break-words text-3xl font-extrabold sm:text-4xl">{lote.produto}</h1><p className="mt-2 text-green-100">Lote #{String(lote.id).slice(0, 8).toUpperCase()}</p></div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="min-w-0 space-y-7">
          <section className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm sm:p-6 md:p-9">
            <div className="flex items-center gap-3"><span className="shrink-0 rounded-xl bg-green-50 p-3 text-green-800"><ClipboardList size={24} /></span><div className="min-w-0"><h2 className="text-xl font-extrabold text-[#073B2C] sm:text-2xl">Informações da colheita</h2><p className="mt-1 text-sm text-slate-500">Dados registrados para este lote.</p></div></div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">{informacoes.map(info => { const Icone = info.icone; return <div key={info.rotulo} className="min-w-0 rounded-2xl border border-slate-100 bg-[#F8FAF5] p-5"><div className="flex items-center gap-2 text-sm text-slate-500"><Icone size={18} className="shrink-0 text-green-700" /> {info.rotulo}</div><p className="mt-4 break-words text-xl font-bold text-[#073B2C]">{info.valor}</p></div> })}</div>
            <Link to="/colheitas" className="mt-8 inline-flex items-center gap-2 font-bold text-green-800 hover:text-green-600"><ArrowLeft size={18} /> Voltar aos lotes</Link>
          </section>

          <section className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm sm:p-6 md:p-9" aria-labelledby="titulo-historico">
            <div className="flex items-start gap-3">
              <span className="shrink-0 rounded-xl bg-green-50 p-3 text-green-800"><History size={24} /></span>
              <div className="min-w-0"><h2 id="titulo-historico" className="text-xl font-extrabold text-[#073B2C] sm:text-2xl">Histórico de movimentações</h2><p className="mt-1 text-sm text-slate-500">Registros de cadastro, anúncios e vendas deste lote.</p></div>
            </div>
            <ol className="mt-8 space-y-0">
              {eventos.map((evento, indice) => {
                const Icone = evento.tipo === 'cadastro' ? Package : evento.tipo === 'anuncio' ? Megaphone : ShoppingCart
                return (
                  <li key={evento.id} className="relative flex gap-4 pb-8 last:pb-0">
                    {indice < eventos.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-[19px] top-10 w-px bg-green-100" />}
                    <span className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${evento.tipo === 'venda' ? 'bg-lime-100 text-green-800' : evento.tipo === 'anuncio' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}><Icone size={19} /></span>
                    <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-[#F8FAF5] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-extrabold text-[#073B2C]">{evento.titulo}</h3><span className="text-xs font-medium text-slate-500">{exibirData(evento.data)}</span></div>
                      <p className="mt-2 break-words text-sm leading-relaxed text-slate-600">{evento.descricao}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
            <p className="mt-6 text-xs leading-relaxed text-slate-500">Histórico montado com os registros salvos neste navegador. Eventos sem data registrada não têm ordem cronológica confirmada. A data da colheita não é necessariamente a data do cadastro.</p>
          </section>
        </div>

       
<aside className="min-w-0 space-y-5">
  <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm sm:p-7">
    <div className="flex items-center gap-3">
      <CircleAlert
        size={23}
        className="shrink-0 text-green-700"
      />
      <h2 className="text-lg font-extrabold text-[#073B2C]">
        Situação do lote
      </h2>
    </div>
    <span
      className={`mt-5 inline-flex max-w-full rounded-full px-4 py-2 text-sm font-bold ${classeStatus}`}>
      {nomeStatus}
    </span>

    <p className="mt-4 text-sm leading-relaxed text-slate-600">
      {pendente
        ? 'Este lote está aguardando avaliação. Mantenha as informações de armazenamento atualizadas para acompanhar suas condições de conservação.'
        : 'Acompanhe a situação registrada deste lote e consulte as informações da colheita para auxiliar na conservação e no planejamento da comercialização.'}
    </p>
  </section>
  <section className="rounded-3xl bg-[#073B2C] p-6 text-white sm:p-7">
    <Sprout size={28} className="text-lime-300" />

    <h2 className="mt-5 text-xl font-extrabold">
      Cada lote conta.
    </h2>

    <p className="mt-3 text-sm leading-relaxed text-green-100">
      Organizar as informações após a colheita é o primeiro
      passo para reduzir perdas e planejar a comercialização.
    </p>

    <Link
      to="/colheitas/nova"
      className="mt-6 inline-flex flex-wrap items-center gap-2 rounded-xl bg-[#B8F34B] px-5 py-3 font-bold text-[#073B2C]">
      Cadastrar outro lote
      <ArrowRight size={17}/>
      </Link>
    </section>
  </aside>
</div>

      
  </main>
  )
}
