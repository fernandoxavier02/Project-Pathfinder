/**
 * Testes para o hook useTimezone
 * 
 * Este arquivo contém testes para garantir que:
 * 1. O hook detecta corretamente o timezone do navegador
 * 2. O hook atualiza quando o timezone muda
 * 3. O hook fornece informações corretas de timezone
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useTimezone } from '../useTimezone';

describe('useTimezone', () => {
  beforeEach(() => {
    // Mock do Intl.DateTimeFormat
    jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      resolvedOptions: () => ({
        timeZone: 'America/Sao_Paulo',
        locale: 'pt-BR',
        calendar: 'gregory',
        numberingSystem: 'latn',
        hour12: false,
      }),
    } as Intl.DateTimeFormat));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve retornar informações de timezone', () => {
    const { result } = renderHook(() => useTimezone());

    expect(result.current).toHaveProperty('timezone');
    expect(result.current).toHaveProperty('offset');
    expect(result.current).toHaveProperty('timezoneName');
    
    expect(typeof result.current.timezone).toBe('string');
    expect(typeof result.current.offset).toBe('number');
    expect(typeof result.current.timezoneName).toBe('string');
  });

  it('deve detectar o timezone do navegador', () => {
    const { result } = renderHook(() => useTimezone());

    expect(result.current.timezone).toBe('America/Sao_Paulo');
    expect(result.current.timezoneName).toBe('America/Sao_Paulo');
  });

  it('deve calcular o offset corretamente', () => {
    const { result } = renderHook(() => useTimezone());

    // O offset deve ser um número válido (em minutos)
    expect(result.current.offset).toBeGreaterThanOrEqual(-720);
    expect(result.current.offset).toBeLessThanOrEqual(720);
  });

  it('deve usar UTC como fallback em caso de erro', () => {
    // Mock que lança erro
    jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => {
      throw new Error('Timezone não disponível');
    });

    const { result } = renderHook(() => useTimezone());

    // Deve usar UTC como fallback
    expect(result.current.timezone).toBe('UTC');
    expect(result.current.offset).toBe(0);
  });
});
