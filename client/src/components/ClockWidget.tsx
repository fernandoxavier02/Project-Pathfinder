import { useState, useEffect } from 'react';
import { Clock, Calendar } from '@phosphor-icons/react';
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import { useTimezone } from '@/hooks/useTimezone';

/**
 * Componente de relógio em tempo real com data
 * Exibe horas, minutos, segundos e data atualizados em tempo real
 * Usa o timezone do dispositivo do usuário
 */
export function ClockWidget() {
  const { timezone } = useTimezone();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Atualiza o relógio a cada segundo
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Formata hora, minuto e segundo
  const timeStr = formatInTimeZone(
    currentTime,
    timezone,
    'HH:mm:ss',
    { locale: ptBR }
  );

  // Formata a data completa
  const dateStr = formatInTimeZone(
    currentTime,
    timezone,
    "EEEE, dd 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  );

  // Formata data curta para mobile
  const dateShortStr = formatInTimeZone(
    currentTime,
    timezone,
    'dd/MM/yyyy',
    { locale: ptBR }
  );

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-blue-100 dark:border-blue-900/50 shadow-sm">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Ícone do relógio */}
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 flex-shrink-0">
          <Clock weight="fill" className="h-5 w-5 text-white" />
        </div>

        {/* Relógio */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-2">
            <span 
              className="text-2xl font-bold tabular-nums text-blue-700 dark:text-blue-300 font-mono tracking-tight"
              suppressHydrationWarning
            >
              {timeStr}
            </span>
          </div>
          
          {/* Data - Desktop */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" weight="duotone" />
            <span className="capitalize">{dateStr}</span>
          </div>
          
          {/* Data - Mobile */}
          <div className="flex sm:hidden items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" weight="duotone" />
            <span>{dateShortStr}</span>
          </div>
        </div>
      </div>

      {/* Timezone badge */}
      <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800">
        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
          {timezone}
        </span>
      </div>
    </div>
  );
}
