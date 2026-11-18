
import { useState } from 'react'
import Alimento3D from '../components/Alimento3D'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Sprout,
  Package,
  TrendingUp,
  CheckCircle2,
  Leaf,
  Wallet,
  ClipboardList,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Sparkles,
  MoveUpRight,
  ArrowUpRight,
} from 'lucide-react'

const recursos = [
  {
    icone: Package,
    titulo: 'Minha Colheita',
    descricao: 'Todos os seus lotes organizados em um único lugar.',
    rota: '/colheitas',
  },
  {
    icone: ClipboardList,
    titulo: 'O que fazer hoje?',
    descricao: 'Saiba quais alimentos precisam da sua atenção.',
    rota: '/tarefas',
  },
  {
    icone: TrendingUp,
    titulo: 'Vender Colheita',
    descricao: 'Crie anúncios, registre vendas e acompanhe suas negociações.',
    rota: '/vendas',
  },
  {
    icone: Wallet,
    titulo: 'Carteira',
    descricao: 'Acompanhe receitas, despesas e resultados da sua produção.',
    rota: '/financeiro',
  },
]

export default function Home() {
  const [culturasAbertas, setCulturasAbertas] = useState(false)
  const [culturaAtiva, setCulturaAtiva] = useState(0)
  const culturas = [
    { nome: 'Tomate', imagem: '/images/tomate.jpg', emoji: '🍅', descricao: 'Acompanhe a conservação e as condições dos lotes.' },
    { nome: 'Banana', imagem: '/images/banana.jpg', emoji: '🍌', descricao: 'Organize os lotes e acompanhe os cuidados necessários.' },
    { nome: 'Alface', imagem: '/images/alface.jpg', emoji: '🥬', descricao: 'Registre sua produção e cuide de um alimento delicado.' },
    { nome: 'Morango', imagem: '/images/morango.jpg', emoji: '🍓', descricao: 'Acompanhe os lotes e reduza o risco de desperdício.' },
    { nome: 'Manga', imagem: '/images/manga.jpg', emoji: '🥭', descricao: 'Planeje os cuidados e acompanhe a disponibilidade.' },
    { nome: 'Batata', imagem: '/images/batata.jpg', emoji: '🥔', descricao: 'Organize o estoque e planeje a comercialização.' },
  ]
  const moverCultura = (direcao: number) => setCulturaAtiva(atual => (atual + direcao + culturas.length) % culturas.length)
  return (
    <main className="relative isolate overflow-hidden bg-[#06190f] text-white">
      {/* Fundo contínuo da Home: a imagem permanece fixa enquanto o conteúdo rola. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-[#10291b] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/images/plantacao-nova.png")' }} />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[#04150b]/35 via-[#061b11]/40 to-[#04150b]/50" />
      <style>{`@keyframes colheitaZoom { from { transform: scale(1); } to { transform: scale(1.09); } }`}</style>
      {/* HERO — imagem real visível, sobreposição controlada */}
      <section className="relative z-10 min-h-[620px] overflow-hidden text-white sm:min-h-[700px] lg:min-h-[min(820px,calc(100svh-72px))]">
        <div className="relative z-10 mx-auto grid min-h-[620px] w-full min-w-0 max-w-7xl items-center gap-8 px-4 py-14 sm:min-h-[700px] sm:gap-12 sm:px-6 sm:py-20 lg:min-h-[min(820px,calc(100svh-72px))] lg:grid-cols-[1.1fr_.9fr] lg:gap-20">
          <div className="min-w-0 max-w-[690px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-[#F6D88B] backdrop-blur-lg"><Sprout size={15} /> Sua produção merece mais</span>
            <h1 className="mt-8 text-[clamp(2.55rem,10.5vw,7.4rem)] font-black leading-[1.02] tracking-[-.055em] sm:leading-[.95] sm:tracking-[-.065em] drop-shadow-[0_10px_28px_rgba(0,0,0,.3)]">Sua colheita <span className="block text-[#FFC34C]">vale mais.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed sm:mt-8 sm:text-lg text-white/90 drop-shadow-md sm:text-xl">O cuidado não termina na colheita. Organize seus lotes, acompanhe o que importa e encontre oportunidades de venda — tudo em um só lugar.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/colheitas" className="inline-flex items-center gap-3 rounded-full bg-[#FFC34C] px-7 py-4 font-extrabold text-[#102C1F] shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-[#FFD77D]">Acessar painel <ArrowUpRight size={20}/></Link>
              <Link to="/sobre" className="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/10 px-7 py-4 font-semibold text-white backdrop-blur-lg transition hover:bg-white/20">Conhecer a solução <ArrowRight size={18}/></Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/85"><span className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-[#FFC34C]"/> Pensado para pequenos agricultores</span><span className="inline-flex items-center gap-2"><ShieldCheck size={17} className="text-[#FFC34C]"/> Foco no pós-colheita</span></div>
          </div>
          <Link to="/colheitas" className="group relative mx-auto w-full min-w-0 max-w-[470px] overflow-hidden rounded-[30px] border border-white/25 bg-[#0b271c]/65 p-5 shadow-[0_32px_100px_rgba(0,0,0,.42)] backdrop-blur-2xl transition duration-500 hover:-translate-y-2 lg:ml-auto sm:p-7">
            <div className="mb-6 flex items-center justify-between"><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#FFDC8D]"><Sparkles size={15}/> Uma prévia da plataforma</span><span className="rounded-full border border-white/20 bg-white/10 p-2"><MoveUpRight size={17}/></span></div>
            <div className="rounded-[22px] border border-white/15 bg-[#133b2b]/90 p-5">
              <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-widest text-white/55">Seu espaço de trabalho</p><h2 className="mt-2 text-2xl font-extrabold">Minha Colheita</h2></div><span className="rounded-2xl bg-[#B7F166]/15 p-3 text-[#B7F166]"><Package size={26}/></span></div>
              <div className="mt-6 grid grid-cols-3 gap-2">{[{ icon: Package, label: 'Lotes' }, { icon: ClipboardList, label: 'Cuidados' }, { icon: TrendingUp, label: 'Vendas' }].map((item) => { const Icon = item.icon; return <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[.07] px-2 py-4 text-center"><Icon size={24} className="mx-auto text-[#D6F68A]"/><p className="mt-3 text-xs font-semibold text-white/85">{item.label}</p></div> })}</div>
              <div className="mt-5 flex items-end justify-between rounded-2xl border border-white/10 bg-[#071d15]/70 px-4 py-4"><div><p className="text-xs text-white/60">Acompanhe sua produção</p><p className="mt-1 text-sm font-bold">Do cadastro à venda</p></div><BarChart3 size={33} className="text-[#B7F166]"/></div>
            </div>
            <div className="mt-5 flex items-center justify-between"><span className="text-sm text-white/75">Acesse suas ferramentas de verdade</span><span className="inline-flex items-center gap-2 text-sm font-bold text-[#FFDC8D]">Abrir painel <ArrowRight size={16} className="transition group-hover:translate-x-1"/></span></div>
          </Link>
        </div>
        <div className="pointer-events-none absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 text-center text-xs font-semibold uppercase tracking-[.3em] text-white/65 lg:block">Descubra o ColheitaSmart <ChevronDown className="mx-auto mt-2 animate-bounce" size={18}/></div>
      </section>

      {/* EDITORIAL — ritmo visual, sem excesso de cartões */}
      <section className="relative z-10 overflow-hidden border-y border-white/10 bg-[#071e14]/35 px-4 py-16 text-white backdrop sm:px-6 sm:py-20-blur-[2px] sm:py-24">
        <div aria-hidden="true" className="absolute -right-20 top-[-160px] h-[450px] w-[450px] rounded-full border-[70px] border-white/5" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_.85fr] lg:gap-24">
          <div><span className="text-xs font-bold uppercase tracking-[.25em] text-[#F5C76D]">01 / Depois da colheita</span><h2 className="mt-6 max-w-2xl text-[clamp(2rem,7vw,5rem)] font-black leading-[1.02] tracking-[-.05em] text-white">O cuidado continua <span className="text-[#B8F34B]">depois de colher.</span></h2></div>
          <div className="border-l-2 border-[#D9AE53] pl-7"><p className="text-xl leading-relaxed text-white/85">Perder alimentos significa perder trabalho e oportunidades. O ColheitaSmart ajuda pequenos agricultores a organizar a produção colhida, acompanhar cada lote e planejar o próximo passo.</p><Link to="/sobre" className="mt-8 inline-flex items-center gap-2 font-bold text-[#F5C76D] transition hover:gap-4">Entenda nossa proposta <ArrowUpRight size={18}/></Link></div>
        </div>
      </section>

      {/* Culturas: conteúdo revelado apenas por ação do visitante */}
      <section className="relative z-10 border-b border-white/10 bg-[#071e14]/45 px-4 py-14 text-white backdrop sm:px-6-blur-[3px] sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div><span className="text-xs font-bold uppercase tracking-[.2em] text-[#F5C76D]">Culturas disponíveis</span><h2 className="mt-3 text-2xl font-extrabold sm:text-4xl">Explore cada cultura em uma nova dimensão.</h2><p className="mt-3 max-w-2xl text-white/70">Uma experiência interativa com os seis alimentos acompanhados pela plataforma. Abra apenas quando quiser explorar.</p></div>
            <button type="button" aria-expanded={culturasAbertas} aria-controls="culturas-conteudo" onClick={() => setCulturasAbertas(!culturasAbertas)} className="inline-flex shrink-0 items-center gap-3 rounded-full border border-[#F5C76D]/70 px-6 py-3 font-bold text-[#F5D78F] transition hover:bg-white/10">{culturasAbertas ? 'Ocultar culturas' : 'Ver culturas disponíveis'} <ChevronDown size={19} className={`transition-transform ${culturasAbertas ? 'rotate-180' : ''}`}/></button>
          </div>
          {culturasAbertas && (
            <div id="culturas-conteudo" className="mt-10 rounded-[36px] border border-white/15 bg-gradient-to-b from-[#194b33]/70 to-[#061d13] px-4 py-10 shadow-[0_30px_100px_rgba(0,0,0,.3)] sm:px-8">
              <p className="mb-5 text-center text-sm text-white/65">Selecione uma cultura no carrossel e gire seu modelo 3D logo abaixo</p>
              <div className="relative mx-auto flex min-w-0 max-w-5xl items-center justify-center gap-1 sm:gap-5">
                <button type="button" aria-label="Alimento anterior" onClick={() => moverCultura(-1)} className="z-20 shrink-0 rounded-full border border-white/25 bg-white/10 p-2 transition hover:bg-white/20 sm:p-3"><ChevronLeft size={23}/></button>
                <div className="relative h-[310px] min-w-0 flex-1 overflow-hidden sm:h-[390px]" style={{ perspective: '1100px' }}>
                  {culturas.map((cultura, index) => {
                    const delta = (index - culturaAtiva + culturas.length) % culturas.length
                    const posicao = delta > culturas.length / 2 ? delta - culturas.length : delta
                    const visivel = Math.abs(posicao) <= 2
                    return (
                      <button
                        key={cultura.nome}
                        type="button"
                        aria-label={`Selecionar ${cultura.nome}`}
                        aria-pressed={posicao === 0}
                        tabIndex={visivel ? 0 : -1}
                        onClick={() => setCulturaAtiva(index)}
                        className="absolute left-1/2 top-1/2 h-[240px] w-[min(205px,85%)] overflow-hidden rounded-[25px] border border-white/20 bg-[#1B4532] text-left shadow-2xl transition-all duration-500 ease-out sm:h-[330px] sm:w-[260px]"
                        style={{
                          transform: `translate(-50%, -50%) translateX(${posicao * 68}%) translateZ(${Math.abs(posicao) * -115}px) rotateY(${posicao * -24}deg) scale(${posicao === 0 ? 1 : .88})`,
                          opacity: visivel ? (Math.abs(posicao) === 2 ? .42 : 1) : 0,
                          zIndex: 10 - Math.abs(posicao),
                          pointerEvents: visivel ? 'auto' : 'none',
                        }}
                      >
                        {cultura.imagem ? <img src={cultura.imagem} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#285C3C] to-[#0B2419] text-[100px] sm:text-[130px]" aria-hidden="true">{cultura.emoji}</div>}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#06190F] via-transparent to-transparent" />
                        <div className="absolute bottom-5 left-5 right-5"><span className="text-xs font-bold uppercase tracking-widest text-[#F5C76D]">{String(index + 1).padStart(2, '0')} / 06</span><h3 className="mt-1 text-2xl font-extrabold text-white">{cultura.nome}</h3></div>
                      </button>
                    )
                  })}
                </div>
                <button type="button" aria-label="Próximo alimento" onClick={() => moverCultura(1)} className="z-20 shrink-0 rounded-full border border-white/25 bg-white/10 p-2 transition hover:bg-white/20 sm:p-3"><ChevronRight size={23}/></button>
              </div>
              <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-[28px] border border-[#F5C76D]/25 bg-gradient-to-br from-[#214B34] via-[#123322] to-[#071B13] p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><span className="text-xs font-bold uppercase tracking-[.15em] text-[#F5C76D]">Visualização tridimensional</span><h3 className="mt-1 text-xl font-bold">{culturas[culturaAtiva].nome} em 3D</h3></div>
                  <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/75">Arraste para girar ↔</span>
                </div>
                <Alimento3D alimento={culturas[culturaAtiva].nome} />
                <p className="text-center text-xs text-white/60">Modelo 3D estilizado para apresentação da cultura. Não representa uma análise real do alimento.</p>
              </div>
              <div className="mx-auto mt-5 max-w-xl text-center" aria-live="polite">
                <h3 className="text-xl font-bold">{culturas[culturaAtiva].emoji} {culturas[culturaAtiva].nome}</h3>
                <p className="mt-2 text-sm text-white/70">{culturas[culturaAtiva].descricao}</p>
                <div className="mt-5 flex justify-center gap-2">{culturas.map((cultura, index) => <button key={cultura.nome} type="button" aria-label={`Ir para ${cultura.nome}`} onClick={() => setCulturaAtiva(index)} className={`h-2.5 rounded-full transition-all ${index === culturaAtiva ? 'w-8 bg-[#F5C76D]' : 'w-2.5 bg-white/30 hover:bg-white/60'}`} />)}</div>
              </div>
              <p className="mt-6 text-center text-xs text-white/50">Prévia ilustrativa das culturas disponíveis para cadastro.</p>
            </div>
          )}
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="relative z-10 border-b border-white/10 bg-[#09271a]/35 px-4 py-16 text-white backdrop sm:px-6-blur-[2px] sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#B8F34B]">Seu dia a dia, mais simples</span>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">Tudo o que você precisa, <span className="text-[#B8F34B]">em um só lugar.</span></h2>
            <p className="mt-5 text-lg text-white/80">Ferramentas para organizar, acompanhar e vender sua produção pós-colheita.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {recursos.map((recurso, index) => {
              const Icone = recurso.icone
              return (
                <Link key={recurso.titulo} to={recurso.rota} className="group relative flex min-h-[260px] flex-col rounded-[26px] border border-white/20 bg-[#08271b]/65 p-7 shadow-[0_10px_35px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-lime-400 hover:bg-[#103d2b]/85 hover:shadow-[0_20px_55px_rgba(0,0,0,0.24)]">
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F4D9] text-[#145734] transition-colors group-hover:bg-[#B8F34B]"><Icone size={27} /></div>
                    <span className="text-sm font-bold text-white/35">0{index + 1}</span>
                  </div>
                  <h3 className="mt-8 text-xl font-extrabold text-white">{recurso.titulo}</h3>
                  <p className="mt-3 flex-1 leading-relaxed text-white/75">{recurso.descricao}</p>
                  <span className="mt-7 inline-flex items-center gap-2 font-bold text-[#F5C76D] transition-all group-hover:gap-4">Explorar <ArrowRight size={18} /></span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* TECNOLOGIA NA PRÁTICA */}
      <section className="relative z-10 overflow-hidden border-b border-white/10 bg-[#061b12]/35 px-4 py-16 text-white backdrop sm:px-6-blur-[2px] sm:py-20">
        <div className="pointer-events-none absolute -right-40 top-0 h-[550px] w-[550px] rounded-full bg-lime-300/10 blur-[110px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-lime-300"><Leaf size={17} /> Tecnologia na prática</span>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">Menos complicação. <span className="text-lime-300">Mais controle.</span></h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-emerald-50/80">A tecnologia deve facilitar a rotina de quem trabalha no campo. Por isso, o ColheitaSmart reúne informações importantes em uma experiência simples e acessível.</p>
            <Link to="/colheitas" className="mt-9 inline-flex items-center gap-3 rounded-xl bg-[#B8F34B] px-7 py-4 font-bold text-[#073B2C] transition hover:bg-lime-200">Conhecer o painel <ArrowRight size={19} /></Link>
          </div>
          <div className="rounded-[30px] border border-white/15 bg-white/[0.07] p-5 shadow-[0_35px_100px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div><p className="text-xs font-bold uppercase tracking-widest text-lime-300">Sua rotina organizada</p><h3 className="mt-2 text-2xl font-bold">Como funciona</h3></div>
              <div className="rounded-2xl bg-lime-300/15 p-3 text-lime-300"><Package size={25} /></div>
            </div>
            {[
              { numero: '01', titulo: 'Cadastre sua colheita', descricao: 'Informe o alimento, a quantidade e as condições do lote.' },
              { numero: '02', titulo: 'Acompanhe seus alimentos', descricao: 'Consulte os registros e veja o que precisa de atenção.' },
              { numero: '03', titulo: 'Planeje suas vendas', descricao: 'Crie anúncios, registre vendas e acompanhe os resultados.' },
            ].map((passo) => (
              <div key={passo.numero} className="flex gap-5 border-b border-white/10 py-6 last:border-0">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime-300/15 text-lg font-black text-lime-300">{passo.numero}</span>
                <div><h4 className="text-lg font-bold">{passo.titulo}</h4><p className="mt-2 leading-relaxed text-emerald-50/70">{passo.descricao}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHAMADA FINAL — vidro sobre a mesma fotografia, sem faixa sólida */}
      <section className="relative z-10 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-[#F5C76D]/35 bg-[#092b1d]/70 p-7 shadow-[0_28px_85px_rgba(0,0,0,.28)] backdrop-blur-xl sm:p-12">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[.22em] text-[#F5C76D]">O próximo passo começa aqui</span>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-5xl">Cada colheita <span className="text-[#F5C76D]">tem valor.</span></h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">Organize seus lotes, acompanhe os cuidados e planeje suas vendas em um só lugar.</p>
            </div>
            <Link to="/colheitas" className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[#F5C76D] px-8 py-4 font-extrabold text-[#073B2C] shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#FFE3A0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Começar agora <ArrowRight size={19}/>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/15 bg-[#061b12]/45 px-4 py-9 text-white/80 sm:px-6 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 text-sm sm:flex-row sm:items-center">
          <span className="inline-flex items-center gap-2 font-extrabold text-white"><Sprout size={18} className="text-[#B8F34B]"/> ColheitaSmart</span>
          <span>Global Solution FIAP 2026 — Sua colheita vale mais.</span>
        </div>
      </footer>
    </main>
  )
}
