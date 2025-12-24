import { formatInTimeZone } from 'date-fns-tz';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Locale } from 'date-fns';

/**
 * Converte um valor desconhecido para Date, considerando timezone
 */
export function toDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === "object" && typeof (value as any).toDate === "function") {
    const parsed = (value as any).toDate();
    return parsed instanceof Date && !isNaN(parsed.getTime()) ? parsed : null;
  }

  return null;
}

/**
 * Formata uma data usando o timezone do usuário
 * @param value - Valor a ser formatado (Date, string, number, ou objeto Firestore)
 * @param formatStr - String de formato do date-fns (padrão: "MMM dd, yyyy")
 * @param locale - Locale para formatação (padrão: ptBR)
 * @returns String formatada ou "-" se inválido
 */
export function formatDate(
  value: unknown,
  formatStr: string = "dd/MM/yyyy",
  locale: Locale = ptBR
): string {
  const date = toDate(value);
  if (!date) return "-";

  try {
    // Obtém o timezone do navegador
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Formata usando o timezone do usuário
    return formatInTimeZone(date, timeZone, formatStr, { locale });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    try {
      // Fallback para formatação simples sem timezone
      return format(date, formatStr, { locale });
    } catch {
      return "-";
    }
  }
}

/**
 * Formata uma data com hora usando o timezone do usuário
 * @param value - Valor a ser formatado
 * @param formatStr - String de formato (padrão: "dd/MM/yyyy HH:mm:ss")
 * @returns String formatada ou "-" se inválido
 */
export function formatDateTime(
  value: unknown,
  formatStr: string = "dd/MM/yyyy HH:mm:ss"
): string {
  return formatDate(value, formatStr);
}

/**
 * Formata apenas a hora usando o timezone do usuário
 * @param value - Valor a ser formatado
 * @param formatStr - String de formato (padrão: "HH:mm:ss")
 * @returns String formatada ou "-" se inválido
 */
export function formatTime(
  value: unknown,
  formatStr: string = "HH:mm:ss"
): string {
  return formatDate(value, formatStr);
}

/**
 * Obtém a data atual no timezone do usuário
 */
export function getCurrentDate(): Date {
  return new Date();
}

/**
 * Obtém o timezone do navegador
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

/**
 * Obtém o offset do timezone em minutos
 */
export function getTimezoneOffset(): number {
  return -new Date().getTimezoneOffset();
}
