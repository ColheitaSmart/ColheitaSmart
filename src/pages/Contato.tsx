export default function Contato() {
  return (
    <main className="min-h-screen bg-green-50 px-6 py-16 text-slate-800">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <span className="font-semibold text-green-700">
            FALE CONOSCO
          </span>

          <h1 className="mt-4 text-4xl font-bold md:text-5xl">
            Entre em Contato
          </h1>

          <p className="mt-5 text-slate-600">
            Tem alguma dúvida ou sugestão sobre o projeto?
          </p>
        </header>

        <section className="mt-12 rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">
            Envie sua mensagem
          </h2>

          <p className="mt-3 text-slate-600">
            Estamos preparando um formulário para
            receber dúvidas e sugestões.
          </p>

          <div className="mt-8 rounded-xl bg-green-100 p-5 text-green-800">
            🌱 ColheitaSmart — FIAP Global Solution
          </div>
        </section>
      </div>
    </main>
  );
}
