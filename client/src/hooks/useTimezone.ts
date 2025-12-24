import { useState, useEffect } from 'react';

export interface TimezoneInfo {
  timezone: string;
  offset: number; // offset em minutos
  timezoneName: string;
}

/**
 * Hook para detectar e gerenciar o fuso horário do usuário
 * Usa a API do navegador para detectar automaticamente o timezone
 */
export function useTimezone(): TimezoneInfo {
  const [timezoneInfo, setTimezoneInfo] = useState<TimezoneInfo>(() => {
    // Inicialização com valores padrão baseados no navegador
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    const offset = -now.getTimezoneOffset(); // offset em minutos (invertido porque getTimezoneOffset retorna o oposto)
    
    return {
      timezone: tz,
      offset,
      timezoneName: tz,
    };
  });

  useEffect(() => {
    // Atualiza informações do timezone
    const updateTimezone = () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const now = new Date();
        const offset = -now.getTimezoneOffset();
        
        setTimezoneInfo({
          timezone: tz,
          offset,
          timezoneName: tz,
        });
      } catch (error) {
        console.error('Erro ao detectar timezone:', error);
        // Fallback para UTC
        setTimezoneInfo({
          timezone: 'UTC',
          offset: 0,
          timezoneName: 'UTC',
        });
      }
    };

    updateTimezone();
    
    // Atualiza periodicamente (a cada hora) para lidar com mudanças de horário de verão
    const interval = setInterval(updateTimezone, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return timezoneInfo;
}
