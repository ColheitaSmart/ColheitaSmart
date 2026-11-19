import { avaliarLoteLegado } from '../utils/avaliacaoLote'
import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, Clock3, PackageCheck, Search, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'

type Prioridade = 'Alta' | 'Média' | 'Baixa'
type Lote = { id: string | number; produto: string; emoji?: string; quantidade: number; status?: string; avaliacaoTipo?: string; avaliacaoMotivo?: string; data?: string; armazenamento?: string; temperatura?: number | string | null }
type Venda = { loteId?: string | number; quantidade: number }
type Tarefa = { id: string; loteId: string; produto: string; emoji: string; titulo: string; descricao: string; prioridade: Prioridade }
const CHAVE_LOTES = 'colheitasmart_lotes'
const CHAVE_VENDAS = 'colheitasmart_vendas'
const CHAVE_CONCLUIDAS = 'colheitasmart_tarefas_concluidas_v1'

function lerArray<T>(chave: string): T[] {
  try { const valor: unknown = JSON.parse(localStorage.getItem(chave) || '[]'); return Array.isArray(valor) ? valor as T[] : [] } catch { return [] }
}
function dataLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function lerConcluidas(): string[] { return lerArray<string>(CHAVE_CONCLUIDAS).filter(x => typeof x === 'string') }
function carregar() {
  return { lotes: lerArray<Lote>(CHAVE_LOTES).filter(l => l && (typeof l.id === 'string' || typeof l.id === 'number') && typeof l.produto === 'string' && Number.isFinite(Number(l.quantidade))), vendas: lerArray<Venda>(CHAVE_VENDAS) }
}
function gerarTarefas(lotes: Lote[], vendas: Venda[]): Tarefa[] {
  const tarefas: Tarefa[] = []
  for (const lote of lotes) {
    const loteId = String(lote.id)
    const vendido = vendas.filter(v => v && v.loteId != null && String(v.loteId) === loteId).reduce((s, v) => s + Math.max(0, Number(v.quantidade) || 0), 0)
    if (Math.max(0, Number(lote.quantidade) - vendido) <= 0) continue
    const avaliado = avaliarLoteLegado({
      ...lote,
      data: typeof lote.data === 'string' ? lote.data : '',
      armazenamento: typeof lote.armazenamento === 'string' ? lote.armazenamento : '',
    })
    const status = avaliado.status || 'Aguardando avaliação'
    const prioridade: Prioridade = status === 'Alto risco' ? 'Alta' : status === 'Atenção' || status === 'Aguardando avaliação' ? 'Média' : 'Baixa'
    const titulo = status === 'Alto risco' ? 'Inspecionar este lote primeiro' : status === 'Atenção' ? 'Conferir as condições deste lote' : status === 'Bom' ? 'Acompanhar a conservação' : 'Verificar a situação deste lote'
    const descricao = status === 'Alto risco'
      ? 'A classificação registrada indica alto risco. Confira pessoalmente o estado dos alimentos e procure orientação técnica antes de decidir o destino do lote.'
      : status === 'Atenção'
        ? 'Observe sinais de deterioração e confira as condições de armazenamento. A classificação é preliminar.'
        : status === 'Bom'
          ? 'Observe o estado dos alimentos e confira as condições de armazenamento. A avaliação preliminar não substitui a inspeção.'
          : 'Este lote ainda não tem avaliação. Confira o estado dos alimentos e os dados cadastrados.'
    tarefas.push({ id: `${loteId}:inspecao`, loteId, produto: lote.produto, emoji: lote.emoji || '🌱', titulo, descricao, prioridade })
  }
  const ordem = { Alta: 0, Média: 1, Baixa: 2 }
  return tarefas.sort((a, b) => ordem[a.prioridade] - ordem[b.prioridade] || a.produto.localeCompare(b.produto, 'pt-BR'))
}
const estilo = { Alta: 'bg-red-50 text-red-700 border-red-200', Média: 'bg-amber-50 text-amber-800 border-amber-200', Baixa: 'bg-green-50 text-green-800 border-green-200' }

export default function Tarefas() {
  const [dados, setDados] = useState(carregar)
  const [filtro, setFiltro] = useState('Todas')
  const [busca, setBusca] = useState('')
  const [concluidas, setConcluidas] = useState<string[]>(lerConcluidas)
  const hoje = dataLocal()
  useEffect(() => {
    const atualizar = () => { setDados(carregar()); setConcluidas(lerConcluidas()) }
    const storage = (e: StorageEvent) => { if (e.key === null || [CHAVE_LOTES, CHAVE_VENDAS, CHAVE_CONCLUIDAS].includes(e.key)) atualizar() }
    window.addEventListener('focus', atualizar)
    window.addEventListener('pageshow', atualizar)
    window.addEventListener('storage', storage)
    return () => { window.removeEventListener('focus', atualizar); window.removeEventListener('pageshow', atualizar); window.removeEventListener('storage', storage) }
  }, [])
  const tarefas = useMemo(() => gerarTarefas(dados.lotes, dados.vendas), [dados])
  const chaveDia = (id: string) => `${hoje}:${id}`
  const feita = (id: string) => concluidas.includes(chaveDia(id))
  const pendentes = tarefas.filter(t => !feita(t.id))
  const filtradas = tarefas.filter(t => {
    const corresponde = `${t.produto} ${t.titulo}`.toLocaleLowerCase('pt-BR').includes(busca.trim().toLocaleLowerCase('pt-BR'))
    return corresponde && (filtro === 'Todas' || (filtro === 'Concluídas' ? feita(t.id) : filtro === 'Pendentes' ? !feita(t.id) : t.prioridade === filtro))
  })
  function alternar(id: string) {
    const chave = chaveDia(id)
    const proximo = feita(id) ? concluidas.filter(x => x !== chave) : [...concluidas, chave]
    try { localStorage.setItem(CHAVE_CONCLUIDAS, JSON.stringify(proximo)); setConcluidas(proximo) }
    catch { window.alert('Não foi possível salvar a conclusão neste navegador.') }
  }
  const cartoes = [
    { nome: 'Prioridade alta', numero: pendentes.filter(t => t.prioridade === 'Alta').length, Icone: AlertTriangle, cor: 'text-red-600' },
    { nome: 'Outras pendências', numero: pendentes.filter(t => t.prioridade !== 'Alta').length, Icone: Clock3, cor: 'text-amber-600' },
    { nome: 'Concluídas hoje', numero: tarefas.filter(t => feita(t.id)).length, Icone: CheckCircle2, cor: 'text-green-700' },
  ]
  return (
    <main className="min-h-screen bg-[#F6F8F2]">
      <section className="bg-[#073B2C] px-6 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div><p className="flex items-center gap-2 text-sm font-bold text-lime-300"><Sprout size={18}/> SEU PAINEL</p><h1 className="mt-3 text-4xl font-extrabold">O que fazer hoje?</h1><p className="mt-3 max-w-xl text-green-100">Cuidados simples para os lotes que você cadastrou.</p></div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4"><ClipboardList className="text-lime-300" size={27}/><div><p className="text-2xl font-extrabold">{pendentes.length}</p><p className="text-xs text-green-100">Tarefas pendentes</p></div></div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-4 sm:grid-cols-3">{cartoes.map(({ nome, numero, Icone, cor }) => <div key={nome} className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-2"><p className="text-sm font-medium text-slate-600">{nome}</p><Icone size={23} className={cor}/></div><p className="mt-4 text-4xl font-extrabold text-[#073B2C]">{numero}</p></div>)}</div>
        <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-[#E7F5D6] p-5 text-green-950 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm"><strong>Por onde começar?</strong> Confira primeiro os lotes com prioridade alta. As orientações são preliminares e não substituem avaliação técnica.</p><Link to="/colheitas" className="inline-flex shrink-0 items-center gap-2 font-bold text-[#073B2C]">Ver meus lotes <ArrowRight size={17}/></Link></div>
        <section className="mt-8 rounded-3xl border border-green-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div><h2 className="text-2xl font-extrabold text-[#073B2C]">Suas prioridades</h2><p className="mt-1 text-sm text-slate-500">Tarefas criadas a partir dos seus lotes. As conclusões são registradas por dia.</p></div><div className="flex flex-col gap-3 sm:flex-row"><label className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3"><Search size={18} className="text-slate-400"/><input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar alimento..." aria-label="Buscar alimento" className="w-full bg-transparent text-sm outline-none"/></label><select value={filtro} onChange={e => setFiltro(e.target.value)} aria-label="Filtrar tarefas" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"><option value="Todas">Todas</option><option value="Pendentes">Pendentes</option><option value="Alta">Prioridade alta</option><option value="Média">Prioridade média</option><option value="Baixa">Prioridade baixa</option><option value="Concluídas">Concluídas</option></select></div></div>
          {dados.lotes.length === 0 ? <div className="py-14 text-center"><Sprout size={40} className="mx-auto text-green-700"/><h3 className="mt-4 text-xl font-bold text-[#073B2C]">Você ainda não cadastrou colheitas</h3><p className="mt-2 text-slate-600">Cadastre um alimento para receber tarefas de acompanhamento.</p><Link to="/colheitas/nova" className="mt-5 inline-flex rounded-xl bg-[#073B2C] px-5 py-3 font-bold text-white">Cadastrar colheita</Link></div>
            : tarefas.length === 0 ? <div className="py-14 text-center"><PackageCheck size={40} className="mx-auto text-green-700"/><h3 className="mt-4 font-bold text-[#073B2C]">Nenhum lote com estoque disponível</h3><p className="mt-2 text-sm text-slate-600">Quando houver alimentos em estoque, as tarefas aparecerão aqui.</p></div>
            : filtradas.length === 0 ? <div className="py-14 text-center"><CheckCircle2 size={40} className="mx-auto text-green-700"/><h3 className="mt-4 font-bold text-[#073B2C]">Nenhuma tarefa encontrada</h3><p className="mt-2 text-sm text-slate-600">Tente mudar a busca ou o filtro.</p></div>
            : <div className="mt-7 grid gap-4 lg:grid-cols-2">{filtradas.map(t => <article key={t.id} className={`rounded-2xl border p-5 ${feita(t.id) ? 'border-green-200 bg-green-50/40' : 'border-slate-200'}`}><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-3xl">{t.emoji}</span><div><p className="font-bold text-[#073B2C]">{t.produto}</p><p className="text-xs text-slate-500">Lote #{t.loteId.slice(0, 8).toUpperCase()}</p></div></div><span className={`rounded-full border px-3 py-1 text-xs font-bold ${feita(t.id) ? 'border-green-200 bg-green-100 text-green-800' : estilo[t.prioridade]}`}>{feita(t.id) ? 'Concluída hoje' : `Prioridade ${t.prioridade.toLowerCase()}`}</span></div><h3 className="mt-5 text-lg font-extrabold text-[#073B2C]">{t.titulo}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{t.descricao}</p><div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row"><Link to={`/colheitas/${encodeURIComponent(t.loteId)}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-green-200 px-4 py-3 text-sm font-bold text-green-900">Ver lote <ArrowRight size={16}/></Link><button type="button" onClick={() => alternar(t.id)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#073B2C] px-4 py-3 text-sm font-bold text-white"><CheckCircle2 size={17}/>{feita(t.id) ? 'Desfazer' : 'Concluir hoje'}</button></div></article>)}</div>}
        </section>
        <p className="mt-7 text-center text-xs text-slate-500">ColheitaSmart — Sua colheita vale mais.</p>
      </div>
    </main>
  )
}
