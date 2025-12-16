'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Save,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ControlLotes({ onLog, onIniciarOperacion, onFinalizarOperacion, onErrorOperacion }) {
  const [configuracion, setConfiguracion] = useState({
    tamañoLoteNombres: 10,
    tamañoLoteUbicaciones: 5,
    pausaEntreLotes: 1000,
    maxReintentos: 3,
    timeout: 30000
  });
  const [estadoLotes, setEstadoLotes] = useState({
    nombres: { activo: false, loteActual: 0, totalLotes: 0, pausado: false },
    ubicaciones: { activo: false, loteActual: 0, totalLotes: 0, pausado: false }
  });
  const [historialLotes, setHistorialLotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargarConfiguracion = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin-a3/configuracion-lotes');
      if (response.ok) {
        const data = await response.json();
        setConfiguracion(data.configuracion);
        setEstadoLotes(data.estadoLotes);
        setHistorialLotes(data.historialLotes || []);
      }
    } catch (error) {
      if (onErrorOperacion) {
        onErrorOperacion('Carga de configuración', error.message);
      }
      console.error('Error cargando configuración:', error.message);
      throw error; // Re-lanzar para el mecanismo de conteo de errores
    } finally {
      setIsLoading(false);
    }
  }, []); // Sin dependencias para evitar loops

  const guardarConfiguracion = async () => {
    try {
      const response = await fetch('/api/admin-a3/configuracion-lotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configuracion })
      });

      if (response.ok) {
        onLog('success', 'Configuración guardada correctamente');
        toast.success('Configuración guardada');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error guardando configuración');
      }
    } catch (error) {
      onErrorOperacion('Guardar configuración', error.message);
      toast.error(`Error: ${error.message}`);
    }
  };

  const iniciarOperacion = async (tipo) => {
    try {
      const response = await fetch(`/api/admin-a3/iniciar-operacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tipo,
          configuracion 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setEstadoLotes(prev => ({
          ...prev,
          [tipo]: { ...prev[tipo], activo: true, loteActual: 0, pausado: false }
        }));
        onLog('info', `Operación ${tipo} iniciada`);
        toast.success(`Operación ${tipo} iniciada`);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error iniciando operación');
      }
    } catch (error) {
      onErrorOperacion(`Iniciar ${tipo}`, error.message);
      toast.error(`Error: ${error.message}`);
    }
  };

  const pausarOperacion = async (tipo) => {
    try {
      const response = await fetch(`/api/admin-a3/pausar-operacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo })
      });

      if (response.ok) {
        setEstadoLotes(prev => ({
          ...prev,
          [tipo]: { ...prev[tipo], pausado: true }
        }));
        onLog('warning', `Operación ${tipo} pausada`);
        toast.warning(`Operación ${tipo} pausada`);
      }
    } catch (error) {
      onErrorOperacion(`Pausar ${tipo}`, error.message);
      toast.error(`Error: ${error.message}`);
    }
  };

  const reanudarOperacion = async (tipo) => {
    try {
      const response = await fetch(`/api/admin-a3/reanudar-operacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo })
      });

      if (response.ok) {
        setEstadoLotes(prev => ({
          ...prev,
          [tipo]: { ...prev[tipo], pausado: false }
        }));
        onLog('info', `Operación ${tipo} reanudada`);
        toast.success(`Operación ${tipo} reanudada`);
      }
    } catch (error) {
      onErrorOperacion(`Reanudar ${tipo}`, error.message);
      toast.error(`Error: ${error.message}`);
    }
  };

  const detenerOperacion = async (tipo) => {
    try {
      const response = await fetch(`/api/admin-a3/detener-operacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo })
      });

      if (response.ok) {
        setEstadoLotes(prev => ({
          ...prev,
          [tipo]: { ...prev[tipo], activo: false, pausado: false, loteActual: 0 }
        }));
        onLog('warning', `Operación ${tipo} detenida`);
        toast.warning(`Operación ${tipo} detenida`);
      }
    } catch (error) {
      onErrorOperacion(`Detener ${tipo}`, error.message);
      toast.error(`Error: ${error.message}`);
    }
  };

  const limpiarHistorial = async () => {
    try {
      const response = await fetch('/api/admin-a3/limpiar-historial', {
        method: 'POST'
      });

      if (response.ok) {
        setHistorialLotes([]);
        onLog('info', 'Historial limpiado');
        toast.success('Historial limpiado');
      }
    } catch (error) {
      onErrorOperacion('Limpiar historial', error.message);
      toast.error(`Error: ${error.message}`);
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'activo':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'pausado':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completado':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEstadoBadge = (estado) => {
    const variants = {
      activo: 'default',
      pausado: 'secondary',
      completado: 'outline',
      error: 'destructive'
    };
    
    return (
      <Badge variant={variants[estado] || 'outline'}>
        {estado}
      </Badge>
    );
  };

  useEffect(() => {
    let interval;
    let consecutiveErrors = 0;
    const MAX_ERRORS = 3;

    const cargarConReintentos = async () => {
      try {
        await cargarConfiguracion();
        consecutiveErrors = 0;
      } catch (error) {
        consecutiveErrors++;
        if (consecutiveErrors >= MAX_ERRORS) {
          if (interval) clearInterval(interval);
          if (onLog) {
            onLog('error', `Polling detenido tras ${MAX_ERRORS} errores consecutivos`);
          }
          toast.error('Polling de configuración detenido por errores. Recarga la página.');
        }
      }
    };

    cargarConReintentos();
    interval = setInterval(cargarConReintentos, 30000); // Aumentado a 30 segundos
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      {/* Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Configuración de Lotes
          </CardTitle>
          <CardDescription>
            Configura los parámetros para el procesamiento por lotes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tamañoLoteNombres">Tamaño de lote - Nombres</Label>
              <Input
                id="tamañoLoteNombres"
                type="number"
                min="1"
                max="100"
                value={configuracion.tamañoLoteNombres}
                onChange={(e) => setConfiguracion(prev => ({
                  ...prev,
                  tamañoLoteNombres: Number(e.target.value)
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tamañoLoteUbicaciones">Tamaño de lote - Ubicaciones</Label>
              <Input
                id="tamañoLoteUbicaciones"
                type="number"
                min="1"
                max="50"
                value={configuracion.tamañoLoteUbicaciones}
                onChange={(e) => setConfiguracion(prev => ({
                  ...prev,
                  tamañoLoteUbicaciones: Number(e.target.value)
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pausaEntreLotes">Pausa entre lotes (ms)</Label>
              <Input
                id="pausaEntreLotes"
                type="number"
                min="0"
                max="10000"
                value={configuracion.pausaEntreLotes}
                onChange={(e) => setConfiguracion(prev => ({
                  ...prev,
                  pausaEntreLotes: Number(e.target.value)
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxReintentos">Máximo reintentos</Label>
              <Input
                id="maxReintentos"
                type="number"
                min="0"
                max="10"
                value={configuracion.maxReintentos}
                onChange={(e) => setConfiguracion(prev => ({
                  ...prev,
                  maxReintentos: Number(e.target.value)
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                min="5000"
                max="120000"
                value={configuracion.timeout}
                onChange={(e) => setConfiguracion(prev => ({
                  ...prev,
                  timeout: Number(e.target.value)
                }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={guardarConfiguracion} className="flex items-center">
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estado de Operaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Sincronización de Nombres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getEstadoIcon(estadoLotes.nombres.activo ? (estadoLotes.nombres.pausado ? 'pausado' : 'activo') : 'inactivo')}
                {getEstadoBadge(estadoLotes.nombres.activo ? (estadoLotes.nombres.pausado ? 'pausado' : 'activo') : 'inactivo')}
              </div>
              <div className="text-sm text-muted-foreground">
                Lote {estadoLotes.nombres.loteActual} / {estadoLotes.nombres.totalLotes}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {!estadoLotes.nombres.activo && (
                <Button 
                  onClick={() => iniciarOperacion('nombres')}
                  size="sm"
                  className="flex items-center"
                >
                  <Play className="mr-1 h-4 w-4" />
                  Iniciar
                </Button>
              )}
              
              {estadoLotes.nombres.activo && !estadoLotes.nombres.pausado && (
                <Button 
                  onClick={() => pausarOperacion('nombres')}
                  size="sm"
                  variant="outline"
                  className="flex items-center"
                >
                  <Pause className="mr-1 h-4 w-4" />
                  Pausar
                </Button>
              )}
              
              {estadoLotes.nombres.pausado && (
                <Button 
                  onClick={() => reanudarOperacion('nombres')}
                  size="sm"
                  className="flex items-center"
                >
                  <Play className="mr-1 h-4 w-4" />
                  Reanudar
                </Button>
              )}
              
              {estadoLotes.nombres.activo && (
                <Button 
                  onClick={() => detenerOperacion('nombres')}
                  size="sm"
                  variant="destructive"
                  className="flex items-center"
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Detener
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actualización de Ubicaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getEstadoIcon(estadoLotes.ubicaciones.activo ? (estadoLotes.ubicaciones.pausado ? 'pausado' : 'activo') : 'inactivo')}
                {getEstadoBadge(estadoLotes.ubicaciones.activo ? (estadoLotes.ubicaciones.pausado ? 'pausado' : 'activo') : 'inactivo')}
              </div>
              <div className="text-sm text-muted-foreground">
                Lote {estadoLotes.ubicaciones.loteActual} / {estadoLotes.ubicaciones.totalLotes}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {!estadoLotes.ubicaciones.activo && (
                <Button 
                  onClick={() => iniciarOperacion('ubicaciones')}
                  size="sm"
                  className="flex items-center"
                >
                  <Play className="mr-1 h-4 w-4" />
                  Iniciar
                </Button>
              )}
              
              {estadoLotes.ubicaciones.activo && !estadoLotes.ubicaciones.pausado && (
                <Button 
                  onClick={() => pausarOperacion('ubicaciones')}
                  size="sm"
                  variant="outline"
                  className="flex items-center"
                >
                  <Pause className="mr-1 h-4 w-4" />
                  Pausar
                </Button>
              )}
              
              {estadoLotes.ubicaciones.pausado && (
                <Button 
                  onClick={() => reanudarOperacion('ubicaciones')}
                  size="sm"
                  className="flex items-center"
                >
                  <Play className="mr-1 h-4 w-4" />
                  Reanudar
                </Button>
              )}
              
              {estadoLotes.ubicaciones.activo && (
                <Button 
                  onClick={() => detenerOperacion('ubicaciones')}
                  size="sm"
                  variant="destructive"
                  className="flex items-center"
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Detener
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historial de Lotes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Operaciones</CardTitle>
              <CardDescription>
                Registro de operaciones realizadas por lotes
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={cargarConfiguracion} 
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button 
                onClick={limpiarHistorial}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Lotes</TableHead>
                  <TableHead>Procesados</TableHead>
                  <TableHead>Exitosos</TableHead>
                  <TableHead>Errores</TableHead>
                  <TableHead>Duración</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historialLotes.slice(0, 20).map((operacion, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(operacion.fecha).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{operacion.tipo}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getEstadoIcon(operacion.estado)}
                        {getEstadoBadge(operacion.estado)}
                      </div>
                    </TableCell>
                    <TableCell>{operacion.lotes}</TableCell>
                    <TableCell>{operacion.procesados}</TableCell>
                    <TableCell className="text-green-600">{operacion.exitosos}</TableCell>
                    <TableCell className="text-red-600">{operacion.errores}</TableCell>
                    <TableCell>{operacion.duracion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {historialLotes.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No hay operaciones registradas
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
