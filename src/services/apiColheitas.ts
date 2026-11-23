
export const API_BASE = (
  import.meta.env.VITE_API_URL ||
  'https://colheitasmart-api-cgir.onrender.com'
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

// Busca o token CSRF na API original.
async function obterTokenCsrf(): Promise<string> {
  const resposta = await fetch(`${API_BASE}/csrf`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!resposta.ok) {
    throw new Error(
      `Não foi possível obter o token CSRF (HTTP ${resposta.status})`
    )
  }

  const dados: { token: string } = await resposta.json()

  if (!dados.token) {
    throw new Error('A API não retornou um token CSRF válido.')
  }

  return dados.token
}

// Centraliza as requisições para a API Java.
async function solicitar<T>(
  rota: string,
  opcoes: RequestInit = {}
): Promise<T> {
  const metodo = (opcoes.method || 'GET').toUpperCase()
  const headers = new Headers(opcoes.headers)

  // POST, PUT, PATCH e DELETE exigem proteção CSRF.
  if (!['GET', 'HEAD', 'OPTIONS'].includes(metodo)) {
    const token = await obterTokenCsrf()
    headers.set('X-CSRF-TOKEN', token)
  }

  const resposta = await fetch(`${API_BASE}${rota}`, {
    ...opcoes,
    credentials: 'include',
    headers,
  })

  if (!resposta.ok) {
    const detalhe: {
      mensagem?: string
      erro?: string
      campos?: Record<string, string>
    } = await resposta.json().catch(() => ({}))

    const campos = Object.entries(detalhe.campos || {})
      .map(([nome, mensagem]) => `${nome}: ${mensagem}`)
      .join('; ')

    throw new Error(
      `${detalhe.mensagem || detalhe.erro || 'Falha na API'} ` +
      `(HTTP ${resposta.status})` +
      (campos ? ` — ${campos}` : '')
    )
  }

  return resposta.json() as Promise<T>
}

// Lista as culturas cadastradas.
export function listarCulturas(signal?: AbortSignal) {
  return solicitar<CulturaAPI[]>('/culturas', {
    signal,
  })
}

// Lista os lotes cadastrados.
export function listarLotes(signal?: AbortSignal) {
  return solicitar<LoteAPI[]>('/lotes', {
    signal,
  })
}

// Cadastra uma nova colheita.
export function criarLote(
  corpo: Omit<LoteAPI, 'cdLote'>
) {
  return solicitar<LoteAPI>('/lotes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(corpo),
  })
}

// Normaliza os nomes dos alimentos.
export const nomeNormalizado = (nome: string) =>
  nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

// Emojis dos alimentos.
export const EMOJIS: Record<string, string> = {
  tomate: '🍅',
  banana: '🍌',
  alface: '🥬',
  morango: '🍓',
  manga: '🥭',
  batata: '🥔',
  cenoura: '🥕',
  abobora: '🎃',
}

// Cadastra uma nova cultura.
export function criarCultura(
  nome: string,
  categoria: string
) {
  return solicitar<CulturaAPI>('/culturas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nmCultura: nome,
      dsCategoria: categoria,
    }),
  })
}
