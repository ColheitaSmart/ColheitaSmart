
 // Triagem demonstrativa; não substitui avaliação profissional ou IA.

export type StatusLote =
  | 'Bom'
  | 'Atenção'
  | 'Alto risco'
  | 'Aguardando avaliação'

export type DadosAvaliacao = {
  produto: string
  data: string
  armazenamento: string
  temperatura?: string | number | null
}

export type ResultadoAvaliacao = {
  status: StatusLote
  avaliacaoTipo: 'regras_preliminares'
  avaliacaoMotivo: string
}

const limites: Record<string, number> = {
  Tomate: 7,
  Banana: 7,
  Alface: 3,
  Morango: 3,
  Manga: 7,
  Batata: 14,
}

function dataUTC(valor: string): number | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor)

  if (!iso && !br) return null

  const ano = Number(iso ? iso[1] : br![3])
  const mes = Number(iso ? iso[2] : br![2])
  const dia = Number(iso ? iso[3] : br![1])

  const utc = Date.UTC(ano, mes - 1, dia)
  const checagem = new Date(utc)

  if (
    checagem.getUTCFullYear() !== ano ||
    checagem.getUTCMonth() !== mes - 1 ||
    checagem.getUTCDate() !== dia
  ) {
    return null
  }

  return utc
}

export function avaliarLote(
  item: DadosAvaliacao
): ResultadoAvaliacao {
  const base = {
    avaliacaoTipo: 'regras_preliminares' as const,
  }

  const colheita = dataUTC(item.data)
  const limite = limites[item.produto]

  if (colheita === null || limite === undefined) {
    return {
      ...base,
      status: 'Aguardando avaliação',
      avaliacaoMotivo:
        'Data ou alimento inválido para a triagem preliminar.',
    }
  }

  const hoje = new Date()
  const hojeUTC = Date.UTC(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate()
  )

  const dias = Math.floor(
    (hojeUTC - colheita) / 86400000
  )

  if (dias < 0) {
    return {
      ...base,
      status: 'Aguardando avaliação',
      avaliacaoMotivo:
        'A data da colheita está no futuro.',
    }
  }

  const textoTemperatura =
    item.temperatura == null
      ? ''
      : String(item.temperatura).trim()

  const temperatura =
    textoTemperatura === ''
      ? null
      : Number(textoTemperatura)

  if (dias > limite) {
    return {
      ...base,
      status: 'Atenção',
      avaliacaoMotivo:
        'Tempo desde a colheita acima do limite ilustrativo de triagem.',
    }
  }

  if (
    temperatura !== null &&
    Number.isFinite(temperatura) &&
    (temperatura < 0 || temperatura > 30)
  ) {
    return {
      ...base,
      status: 'Atenção',
      avaliacaoMotivo:
        'Temperatura informada fora da faixa geral de triagem.',
    }
  }

  if (
    temperatura === null ||
    !Number.isFinite(temperatura) ||
    !item.armazenamento ||
    item.armazenamento === 'Outro'
  ) {
    return {
      ...base,
      status: 'Aguardando avaliação',
      avaliacaoMotivo:
        'Dados insuficientes para a triagem inicial.',
    }
  }

  return {
    ...base,
    status: 'Bom',
    avaliacaoMotivo:
      'Nenhum alerta identificado pelas regras preliminares; não é garantia de conservação.',
  }
}

// Avalia lotes antigos sem sobrescrever avaliações identificadas.
export function avaliarLoteLegado<
  T extends DadosAvaliacao & {
    status?: string
    avaliacaoTipo?: string
    avaliacaoMotivo?: string
  }
>(lote: T): T {
  if (
    lote.avaliacaoTipo ||
    (lote.status && lote.status !== 'Aguardando avaliação')
  ) {
    return lote
  }

  return {
    ...lote,
    ...avaliarLote(lote),
  }
}
