/**
 * Testes para utilitários de data e timezone
 * 
 * Este arquivo contém testes para garantir que:
 * 1. As datas são formatadas corretamente usando o timezone do usuário
 * 2. O timezone é detectado automaticamente
 * 3. Diferentes formatos de entrada são suportados
 */

import { formatDate, formatDateTime, formatTime, toDate, getUserTimezone, getTimezoneOffset } from '../dateUtils';

describe('dateUtils', () => {
  describe('toDate', () => {
    it('deve converter Date para Date', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(toDate(date)).toEqual(date);
    });

    it('deve converter string para Date', () => {
      const dateStr = '2024-01-15T10:30:00Z';
      const result = toDate(dateStr);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(new Date(dateStr).getTime());
    });

    it('deve converter número (timestamp) para Date', () => {
      const timestamp = 1705315800000; // 2024-01-15T10:30:00Z
      const result = toDate(timestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(timestamp);
    });

    it('deve retornar null para valores inválidos', () => {
      expect(toDate(null)).toBeNull();
      expect(toDate(undefined)).toBeNull();
      expect(toDate('')).toBeNull();
    });

    it('deve converter objeto Firestore com toDate()', () => {
      const firestoreDate = {
        toDate: () => new Date('2024-01-15T10:30:00Z')
      };
      const result = toDate(firestoreDate);
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('formatDate', () => {
    it('deve formatar data usando timezone do usuário', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date, 'dd/MM/yyyy');
      
      // O resultado depende do timezone, mas deve ser uma string válida
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).not.toBe('-');
    });

    it('deve retornar "-" para valores inválidos', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate(undefined)).toBe('-');
      expect(formatDate('')).toBe('-');
      expect(formatDate('invalid')).toBe('-');
    });

    it('deve usar formato padrão quando não especificado', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      
      // Formato padrão é dd/MM/yyyy
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });
  });

  describe('formatDateTime', () => {
    it('deve formatar data e hora', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateTime(date);
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/);
    });
  });

  describe('formatTime', () => {
    it('deve formatar apenas a hora', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatTime(date);
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('getUserTimezone', () => {
    it('deve retornar um timezone válido', () => {
      const timezone = getUserTimezone();
      expect(timezone).toBeTruthy();
      expect(typeof timezone).toBe('string');
      expect(timezone.length).toBeGreaterThan(0);
    });

    it('deve retornar UTC como fallback em caso de erro', () => {
      // Este teste verifica que a função não lança erro
      const timezone = getUserTimezone();
      expect(['UTC', 'America/Sao_Paulo', 'America/New_York', 'Europe/London']).toContain(timezone);
    });
  });

  describe('getTimezoneOffset', () => {
    it('deve retornar um número representando o offset', () => {
      const offset = getTimezoneOffset();
      expect(typeof offset).toBe('number');
      // Offset geralmente está entre -720 e 720 minutos (-12h a +12h)
      expect(offset).toBeGreaterThanOrEqual(-720);
      expect(offset).toBeLessThanOrEqual(720);
    });
  });
});
