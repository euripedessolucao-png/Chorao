// components/index.ts

/**
 * BARREL EXPORT - COMPONENTES E UTILITÁRIOS
 * 
 * Exporta todos os componentes e utilitários principais para importação simplificada
 * Use: import { HookGenerator, InspirationManager, SyllableEnforcer } from '@/components'
 */

// Componentes principais
export { HookGenerator } from './hook-generator'
export { InspirationManager } from './inspiration-manager'

// Re-exporta TODOS os validadores do barrel de validação
export * from '../lib/validation'
