
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

// Limites ilustrativos para triagem inicial.
// Não representam prazos garantidos de conservação.
const limites: Record<string, number> = {
  tomate: 7,
  banana: 7,
  alface: 3,
  morango: 3,
  manga: 7,
  batata: 14,
}

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
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
  const produto = normalizar(item.produto || '')
  const limite = limites[produto]

  if (colheita === null || limite === undefined) {
    return {
      ...base,
      status: 'Aguardando avaliação',
      avaliacaoMotivo:
        'Data ou alimento não reconhecido para a triagem.',
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

  const armazenamento = normalizar(
    item.armazenamento || ''
  )

  if (
    !armazenamento ||
    armazenamento === 'outro' ||
    armazenamento === 'nao informado'
  ) {
    return {
      ...base,
      status: 'Aguardando avaliação',
      avaliacaoMotivo:
        'Armazenamento não informado ou insuficiente.',
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

  if (
    temperatura !== null &&
    !Number.isFinite(temperatura)
  ) {
    return {
      ...base,
      status: 'Aguardando avaliação',
      avaliacaoMotivo:
        'Temperatura informada inválida.',
    }
  }

  // Tempo muito acima do limite ilustrativo.
  if (dias > limite * 2) {
    return {
      ...base,
      status: 'Alto risco',
      avaliacaoMotivo:
        'Tempo desde a colheita muito acima do limite preliminar.',
    }
  }

  // Tempo acima do limite ilustrativo.
  if (dias > limite) {
    return {
      ...base,
      status: 'Atenção',
      avaliacaoMotivo:
        'Tempo desde a colheita acima do limite preliminar.',
    }
  }

  // Temperatura extrema registrada.
  if (
    temperatura !== null &&
    (temperatura < 0 || temperatura > 30)
  ) {
    return {
      ...base,
      status: 'Atenção',
      avaliacaoMotivo:
        'Temperatura fora da faixa geral de triagem.',
    }
  }

  // Lote próximo do limite de tempo.
  if (dias >= limite * 0.75) {
    return {
      ...base,
      status: 'Atenção',
      avaliacaoMotivo:
        'Tempo desde a colheita próximo do limite preliminar.',
    }
  }

  // Sem temperatura, a triagem continua possível,
  // mas o resultado tem informações limitadas.
  return {
    ...base,
    status: 'Bom',
    avaliacaoMotivo:
      temperatura === null
        ? 'Nenhum alerta identificado por tempo e armazenamento. Temperatura não informada; avaliação preliminar limitada.'
        : 'Nenhum alerta identificado pelas regras preliminares. A classificação não garante a conservação do alimento.',
  }
}

// Preserva avaliações previamente identificadas.
// Reavalia lotes pendentes com os dados disponíveis.
export function avaliarLoteLegado<
  T extends DadosAvaliacao & {
    status?: string
    avaliacaoTipo?: string
    avaliacaoMotivo?: string
  }
>(lote: T): T {
  if (
    lote.avaliacaoTipo &&
    lote.status &&
    lote.status !== 'Aguardando avaliação'
  ) {
    return lote
  }

  return {
    ...lote,
    ...avaliarLote(lote),
  }
}
