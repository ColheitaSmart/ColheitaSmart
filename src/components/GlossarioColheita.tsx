export default function GlossarioColheita() {
  return (
    <section className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-green-900">Palavras do dia a dia</h2>
      <p className="mt-2 text-slate-600">Entenda palavras usadas no acompanhamento da colheita.</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2"><li className="rounded-xl bg-green-50 p-4"><strong>Colheita:</strong> alimentos retirados do campo.</li><li className="rounded-xl bg-green-50 p-4"><strong>Conservação:</strong> cuidados para manter os alimentos em boas condições.</li></ul>
    </section>
  )
}