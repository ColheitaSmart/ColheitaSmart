import { ArrowRight, CheckCircle2, ClipboardList, HeartHandshake, Leaf, ShieldCheck, Sprout, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'

const etapas = [
  { numero: '01', titulo: 'Cadastre sua colheita', descricao: 'Informe o alimento, a quantidade, a data da colheita e onde ele está guardado.' },
  { numero: '02', titulo: 'Acompanhe os alimentos', descricao: 'Consulte as informações de cada colheita e veja quais precisam de atenção.' },
  { numero: '03', titulo: 'Organize suas vendas', descricao: 'Prepare anúncios e acompanhe suas vendas em um só lugar.' },
]

export default function Sobre() {
  return (
    <main className="min-h-screen bg-[#F6F8F2] text-[#17382B]">
      <section className="relative overflow-hidden bg-[#073B2C] px-6 py-20 text-white sm:py-24">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block" aria-hidden="true">
          <img src="/images/sobre-agricultor.jpg" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#073B2C] via-[#073B2C]/55 to-[#073B2C]/10" />
        </div>
        <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-200/25 bg-white/10 px-4 py-2 text-sm font-semibold text-lime-200">
            <Sprout size={17} /> Sobre o ColheitaSmart
          </div>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Mais cuidado com a colheita. <span className="text-[#B8F34B]">Menos desperdício.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-green-50/90 sm:text-lg">
            O ColheitaSmart é um projeto criado para ajudar pequenos agricultores a organizar e acompanhar os alimentos depois da colheita, com informações claras e ferramentas simples de usar.
          </p>
          <Link to="/colheitas" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#B8F34B] px-6 py-3.5 font-bold text-[#073B2C] transition hover:bg-lime-200">
            Conhecer Minha Colheita <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-green-700">Por que criamos esta solução?</p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">O trabalho não termina quando o alimento é colhido.</h2>
          <p className="mt-5 leading-8 text-slate-600">
            Depois da colheita, os alimentos ainda precisam de cuidados. A forma de guardar, o tempo e a organização das vendas podem fazer diferença para evitar perdas.
          </p>
          <p className="mt-4 leading-8 text-slate-600">
            Nosso objetivo é reunir as principais informações em um só lugar, para facilitar as decisões do dia a dia e valorizar o trabalho de quem produz.
          </p>
        </div>
        <div className="space-y-5">
          <img src="/images/sobre-colheita.jpg" alt="Alimentos recém-colhidos organizados para armazenamento e venda" className="h-64 w-full rounded-3xl object-cover shadow-sm sm:h-80" loading="lazy" />
          <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
            <TrendingDown className="text-green-700" size={30} />
            <h3 className="mt-5 text-xl font-extrabold">Reduzir perdas</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">Ajudar o agricultor a perceber quais alimentos podem precisar de mais atenção.</p>
          </div>
          <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm sm:translate-y-7">
            <ClipboardList className="text-green-700" size={30} />
            <h3 className="mt-5 text-xl font-extrabold">Organizar informações</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">Manter os dados das colheitas reunidos e fáceis de consultar.</p>
          </div>
          <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
            <HeartHandshake className="text-green-700" size={30} />
            <h3 className="mt-5 text-xl font-extrabold">Apoiar quem produz</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">Oferecer uma ferramenta pensada para a rotina dos pequenos agricultores.</p>
          </div>
          <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm sm:translate-y-7">
            <Leaf className="text-green-700" size={30} />
            <h3 className="mt-5 text-xl font-extrabold">Valorizar os alimentos</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">Incentivar o cuidado com os produtos até o momento da venda.</p>
          </div>
          </div>
        </div>
      </section>

      <section className="bg-[#EAF2E3] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-green-700">Como funciona</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Simples, do cadastro ao acompanhamento.</h2>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {etapas.map(etapa => (
              <div key={etapa.numero} className="rounded-3xl border border-green-100 bg-white p-7 shadow-sm">
                <span className="text-3xl font-extrabold text-green-700">{etapa.numero}</span>
                <h3 className="mt-5 text-xl font-extrabold">{etapa.titulo}</h3>
                <p className="mt-3 leading-7 text-slate-600">{etapa.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-green-100 bg-white p-7 shadow-sm sm:p-10">
          <div className="flex items-center gap-3"><ShieldCheck className="text-green-700" size={29} /><h2 className="text-2xl font-extrabold">Uma orientação que respeita seu trabalho</h2></div>
          <p className="mt-4 max-w-4xl leading-8 text-slate-600">
            O ColheitaSmart oferece uma primeira verificação com base nas informações cadastradas. Essa orientação ajuda a identificar situações que merecem atenção e apoia o agricultor no cuidado com seus alimentos após a colheita.
          </p>
          <div className="mt-6 flex items-start gap-2 text-sm font-semibold text-green-800"><CheckCircle2 size={19} className="mt-0.5 shrink-0" /> Informações claras para apoiar decisões e valorizar cada colheita.</div>
        </div>
      </section>

      <section className="bg-[#073B2C] px-6 py-14 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold">Sua colheita merece atenção em cada etapa.</h2>
          <p className="mt-4 leading-8 text-green-100">Conheça as ferramentas do ColheitaSmart e comece a organizar seus alimentos.</p>
          <Link to="/colheitas" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#B8F34B] px-6 py-3.5 font-bold text-[#073B2C] hover:bg-lime-200">Ir para Minha Colheita <ArrowRight size={18} /></Link>
        </div>
      </section>
    </main>
  )
}
