import { useState } from 'react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'

type Integrante = {
  nome: string
  rm: string
  funcao: string
  foto: string
  github: string
  linkedin: string
}

const integrantes: Integrante[] = [
  { nome: 'Leticia Felix', rm: '569138', funcao: 'Organização, Java e entrega do projeto', foto: '/images/Leticia.jpeg', github: 'https://github.com/LeticiaFelix18', linkedin: 'https://www.linkedin.com/in/leticia-felix-660253286/' },
  { nome: 'Fabricio Torres Haine', rm: '573332', funcao: 'Integrante do projeto', foto: '/images/febras.jpeg', github: 'https://github.com/FabricioHaine', linkedin: 'https://www.linkedin.com/in/fabricio-haine-1423923a5/' },
  { nome: 'Leonardo Pinto Neto', rm: '571960', funcao: 'Integrante do projeto', foto: '/images/leonardo.jpeg', github: 'https://github.com/leonardo-neto27', linkedin: 'https://www.linkedin.com/in/leonardo-neto-222b653ab' },
  { nome: 'Andre Luiz Ramos Forastieri', rm: '572203', funcao: 'Integrante do projeto', foto: '/images/andre.png', github: 'https://github.com/AndreL050690', linkedin: 'https://www.linkedin.com/in/andr%C3%A9-forastieri-a029913b1/' },
  { nome: 'Guilherme de Oliveira Alves', rm: '571683', funcao: 'Desenvolvimento front-end', foto: '/images/guilherme.jpeg', github: 'https://github.com/guilhermeeealvess10', linkedin: 'https://www.linkedin.com/in/guilherme-de-oliveira-alves-19522b363/' },
]

function FotoIntegrante({ integrante }: { integrante: Integrante }) {
  const [falhou, setFalhou] = useState(false)
  const iniciais = integrante.nome.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-[3px] border-[#6D947B] bg-[#244535] sm:h-40 sm:w-40">
      {falhou ? (
        <span className="text-4xl font-semibold text-[#D6E8D6]" aria-label={`Foto indisponível: ${integrante.nome}`}>{iniciais}</span>
      ) : (
        <img src={integrante.foto} alt={`Foto de ${integrante.nome}`} loading="lazy" onError={() => setFalhou(true)} className="h-full w-full object-cover object-center" />
      )}
    </div>
  )
}

export default function Integrantes() {
  return (
    <main className="min-h-screen bg-[#0B211A] px-5 pb-24 pt-24 text-white sm:px-8 sm:pt-28">
      <div className="mx-auto max-w-6xl">
        <header className="mb-14 text-center sm:mb-16">
          <h1 id="titulo-equipe" className="text-4xl font-bold tracking-tight sm:text-5xl">Nossa equipe</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#C4D4CB] sm:text-lg">
            Conheça os estudantes responsáveis pelo desenvolvimento do ColheitaSmart.
          </p>
        </header>

        <section aria-labelledby="titulo-equipe" className="flex flex-wrap justify-center gap-6 lg:gap-7">
          {integrantes.map(integrante => (
            <article key={integrante.rm} className="flex w-full max-w-[350px] flex-col items-center rounded-[24px] border border-[#345847] bg-[#142E24] px-6 pb-9 pt-10 text-center shadow-[0_12px_28px_rgba(0,0,0,0.12)] transition-transform duration-300 hover:-translate-y-1 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-19px)]">
              <FotoIntegrante integrante={integrante} />
              <h2 className="mt-7 flex min-h-[3.5rem] items-center justify-center text-xl font-semibold leading-7 text-[#C3E7BD]">{integrante.nome}</h2>
              <p className="mt-2 text-sm text-[#D5E2D8]">RM {integrante.rm}</p>
              <p className="mt-2 text-sm font-medium text-[#C3E7BD]">{integrante.funcao}</p>
              <div className="mt-7 flex items-center justify-center gap-4">
                <a href={integrante.github} target="_blank" rel="noopener noreferrer" aria-label={`GitHub de ${integrante.nome} (abre em nova aba)`} className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#4D705D] bg-[#234638] text-white transition-colors hover:bg-[#36674D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C3E7BD]">
                  <FaGithub size={22} aria-hidden="true" />
                </a>
                <a href={integrante.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn de ${integrante.nome} (abre em nova aba)`} className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#4D705D] bg-[#234638] text-white transition-colors hover:bg-[#36674D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C3E7BD]">
                  <FaLinkedin size={22} aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
