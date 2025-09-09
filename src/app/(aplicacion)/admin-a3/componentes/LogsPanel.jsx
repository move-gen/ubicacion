'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  Download,
  Trash2,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LogsPanel({ logs }) {
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollAreaRef = useRef(null);

  const tiposLog = [
    { value: 'todos', label: 'Todos', icon: Info, color: 'text-gray-500' },
    { value: 'info', label: 'Info', icon: Info, color: 'text-blue-500' },
    { value: 'success', label: 'Éxito', icon: CheckCircle, color: 'text-green-500' },
    { value: 'warning', label: 'Advertencia', icon: AlertTriangle, color: 'text-yellow-500' },
    { value: 'error', label: 'Error', icon: XCircle, color: 'text-red-500' }
  ];

  const filtrarLogs = () => {
    return logs.filter(log => {
      const coincideTipo = filtroTipo === 'todos' || log.tipo === filtroTipo;
      const coincideTexto = filtroTexto === '' || 
        log.mensaje.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        (log.detalles && JSON.stringify(log.detalles).toLowerCase().includes(filtroTexto.toLowerCase()));
      
      return coincideTipo && coincideTexto;
    });
  };

  const logsFiltrados = filtrarLogs();

  const getTipoIcon = (tipo) => {
    const tipoConfig = tiposLog.find(t => t.value === tipo) || tiposLog[0];
    const IconComponent = tipoConfig.icon;
    return <IconComponent className={`h-4 w-4 ${tipoConfig.color}`} />;
  };

  const getTipoBadge = (tipo) => {
    const variants = {
      info: 'outline',
      success: 'default',
      warning: 'secondary',
      error: 'destructive'
    };
    
    return (
      <Badge variant={variants[tipo] || 'outline'}>
        {tipo}
      </Badge>
    );
  };

  const exportarLogs = () => {
    const csvContent = [
      ['Timestamp', 'Tipo', 'Mensaje', 'Detalles'],
      ...logsFiltrados.map(log => [
        new Date(log.timestamp).toISOString(),
        log.tipo,
        log.mensaje,
        log.detalles ? JSON.stringify(log.detalles) : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-admin-a3-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Logs exportados correctamente');
  };

  const limpiarLogs = () => {
    // Esta función se pasaría desde el componente padre para limpiar los logs
    toast.info('Función de limpiar logs debe implementarse en el componente padre');
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [logs, autoScroll]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDetalles = (detalles) => {
    if (!detalles) return null;
    
    if (typeof detalles === 'string') {
      return detalles;
    }
    
    if (typeof detalles === 'object') {
      return JSON.stringify(detalles, null, 2);
    }
    
    return String(detalles);
  };

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <select 
              value={filtroTipo} 
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              {tiposLog.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar en logs..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm w-64"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            <span>Auto-scroll</span>
          </label>
          
          <Button onClick={exportarLogs} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          
          <Button onClick={limpiarLogs} variant="outline" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {tiposLog.map(tipo => {
          const count = logs.filter(log => log.tipo === tipo.value).length;
          const IconComponent = tipo.icon;
          return (
            <Card key={tipo.value} className="p-3">
              <div className="flex items-center space-x-2">
                <IconComponent className={`h-4 w-4 ${tipo.color}`} />
                <div>
                  <div className="text-sm font-medium">{tipo.label}</div>
                  <div className="text-lg font-bold">{count}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Panel de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs en Tiempo Real</CardTitle>
          <CardDescription>
            {logsFiltrados.length} de {logs.length} logs mostrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea ref={scrollAreaRef} className="h-96 w-full">
            <div className="space-y-2">
              {logsFiltrados.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No hay logs que coincidan con los filtros aplicados.
                  </AlertDescription>
                </Alert>
              ) : (
                logsFiltrados.map((log, index) => (
                  <div key={log.id || index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTipoIcon(log.tipo)}
                        {getTipoBadge(log.tipo)}
                        <span className="text-sm font-medium">{log.mensaje}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    
                    {log.detalles && (
                      <div className="ml-6">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            Ver detalles
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {formatDetalles(log.detalles)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Los logs se actualizan en tiempo real. Usa los filtros para encontrar información específica.
          El auto-scroll mantiene los logs más recientes visibles automáticamente.
        </AlertDescription>
      </Alert>
    </div>
  );
}
