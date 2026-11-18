import { useState, type FormEvent } from 'react'
import { ArrowUpRight, Mail, MessageSquareText, Send, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

const EMAIL_CONTATO = 'colheitasmart42@gmail.com'

export default function Contato() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [assunto, setAssunto] = useState('')
  const [mensagem, setMensagem] = useState('')

  function enviarEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const corpo = `Nome: ${nome.trim()}\nE-mail: ${email.trim()}\n\nMensagem:\n${mensagem.trim()}`
    const url = `mailto:${EMAIL_CONTATO}?subject=${encodeURIComponent(`[ColheitaSmart] ${assunto.trim()}`)}&body=${encodeURIComponent(corpo)}`
    window.location.href = url
  }

  const campo = 'mt-2 w-full rounded-xl border border-[#D8E5D9] bg-white px-4 py-3 text-[#17392C] outline-none transition placeholder:text-[#91A398] focus:border-[#3B8A5A] focus:ring-4 focus:ring-[#3B8A5A]/10'

  return (
    <main className="min-h-screen bg-[#F6F8F2] text-[#17392C]">
      <section className="bg-[#123D2C] px-6 pb-16 pt-24 text-white sm:pb-20 sm:pt-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-[#D5F2D5]">
            <MessageSquareText size={16} aria-hidden="true" /> Fale com a gente
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Entre em contato<span className="text-[#B8E4A5]">.</span></h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#E0EBE2] sm:text-lg">
            Tem alguma dúvida, sugestão ou quer saber mais sobre o ColheitaSmart? Nossa equipe está à disposição para ouvir você.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-14 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)] lg:gap-10 lg:py-20">
        <div className="rounded-[26px] border border-[#DFEADF] bg-white p-6 shadow-[0_12px_40px_rgba(19,58,39,0.05)] sm:p-9">
          <h2 className="text-2xl font-bold sm:text-3xl">Envie sua mensagem</h2>
          <p className="mt-2 text-[#5D7566]">Preencha os campos abaixo para preparar seu e-mail.</p>

          <form onSubmit={enviarEmail} className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold" htmlFor="contato-nome">
                Nome completo
                <input id="contato-nome" className={campo} type="text" autoComplete="name" placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} required maxLength={120} />
              </label>
              <label className="block text-sm font-semibold" htmlFor="contato-email">
                E-mail
                <input id="contato-email" className={campo} type="email" autoComplete="email" placeholder="seuemail@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} />
              </label>
            </div>
            <label className="block text-sm font-semibold" htmlFor="contato-assunto">
              Assunto
              <input id="contato-assunto" className={campo} type="text" placeholder="Sobre o que deseja conversar?" value={assunto} onChange={e => setAssunto(e.target.value)} required maxLength={140} />
            </label>
            <label className="block text-sm font-semibold" htmlFor="contato-mensagem">
              Mensagem
              <textarea id="contato-mensagem" className={`${campo} min-h-40 resize-y`} placeholder="Escreva sua mensagem aqui..." value={mensagem} onChange={e => setMensagem(e.target.value)} required maxLength={4000} />
            </label>
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17643D] px-6 py-3.5 font-semibold text-white transition hover:bg-[#104E30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17643D] sm:w-auto">
              <Send size={18} aria-hidden="true" /> Preparar e-mail
            </button>
            <p className="text-sm leading-6 text-[#62786B]">
              Ao clicar, seu aplicativo de e-mail será aberto com a mensagem preenchida. Confira as informações e clique em enviar no próprio aplicativo.
            </p>
          </form>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[26px] border border-[#DCE8DA] bg-[#EAF3E7] p-7 sm:p-8">
            <div className="mb-5 inline-flex rounded-xl bg-white p-3 text-[#17643D] shadow-sm"><Mail size={23} aria-hidden="true" /></div>
            <h2 className="text-xl font-bold">Nosso e-mail</h2>
            <p className="mt-2 text-sm leading-6 text-[#5D7566]">Prefere escrever diretamente? Entre em contato pelo endereço abaixo.</p>
            <a href={`mailto:${EMAIL_CONTATO}`} className="mt-5 block break-all font-semibold text-[#17643D] underline decoration-[#B2D4BA] underline-offset-4 hover:text-[#0E4B2D]">{EMAIL_CONTATO}</a>
          </div>
          <div className="rounded-[26px] border border-[#DFEADF] bg-white p-7 sm:p-8">
            <div className="mb-4 inline-flex rounded-xl bg-[#EAF3E7] p-3 text-[#17643D]"><ShieldCheck size={23} aria-hidden="true" /></div>
            <h2 className="text-xl font-bold">Conheça o projeto</h2>
            <p className="mt-2 text-sm leading-7 text-[#5D7566]">Saiba como o ColheitaSmart busca apoiar pequenos agricultores no acompanhamento de suas colheitas.</p>
            <Link to="/sobre" className="mt-5 inline-flex items-center gap-2 font-semibold text-[#17643D] hover:underline">Sobre o ColheitaSmart <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
          <div className="rounded-[26px] bg-[#123D2C] p-7 text-white sm:p-8">
            <h2 className="text-xl font-bold">Quem está por trás?</h2>
            <p className="mt-2 text-sm leading-7 text-[#D9E9DE]">Conheça os estudantes responsáveis pelo desenvolvimento do ColheitaSmart.</p>
            <Link to="/integrantes" className="mt-5 inline-flex items-center gap-2 font-semibold text-[#B8E4A5] hover:underline">Conheça a equipe <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
        </aside>
      </section>
    </main>
  )
}
