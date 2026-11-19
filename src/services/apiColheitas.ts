export const API_BASE = (
  import.meta.env.VITE_API_URL || 'https://colheitasmart-api.onrender.com'
).replace(/\/+$/, '')

export type CulturaAPI = {
  cdCultura: number
  nmCultura: string
  dsCategoria: string
}

export type LoteAPI = {
  cdLote: number
  cdAgricultor: number
  cdCultura: number
  qtPesoInicialKg: number
  qtPesoDisponivelKg: number
  dtColheita: string
  dsArmazenamento: string
  vlPrecoKg: number
  dsStatus: 'DISPONIVEL' | 'ESGOTADO' | 'ENCERRADO'
}

async function solicitar<T>(rota: string, opcoes: RequestInit = {}): Promise<T> {
  const resposta = await fetch(`${API_BASE}${rota}`, opcoes)
  if (!resposta.ok) {
    const detalhe: { mensagem?: string; campos?: Record<string, string> } =
      await resposta.json().catch(() => ({}))
    const campos = Object.entries(detalhe.campos || {})
      .map(([nome, mensagem]) => `${nome}: ${mensagem}`)
      .join('; ')
    throw new Error(
      `${detalhe.mensagem || 'Falha na API'} (HTTP ${resposta.status})${campos ? ` — ${campos}` : ''}`
    )
  }
  return resposta.json() as Promise<T>
}

export function listarCulturas(signal?: AbortSignal) {
  return solicitar<CulturaAPI[]>('/culturas', { signal })
}

export function listarLotes(signal?: AbortSignal) {
  return solicitar<LoteAPI[]>('/lotes', { signal })
}

export function criarLote(corpo: Omit<LoteAPI, 'cdLote'>) {
  return solicitar<LoteAPI>('/lotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  })
}

export const nomeNormalizado = (nome: string) =>
  nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()

export const EMOJIS: Record<string, string> = {
  tomate: '🍅', banana: '🍌', alface: '🥬', morango: '🍓', manga: '🥭',
  batata: '🥔', cenoura: '🥕', abobora: '🎃',
}

export function criarCultura(nome: string, categoria: string) {
  return solicitar<CulturaAPI>('/culturas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nmCultura: nome, dsCategoria: categoria }),
  })
}
