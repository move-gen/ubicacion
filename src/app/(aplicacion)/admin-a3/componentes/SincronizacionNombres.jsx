'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SincronizacionNombres({ onLog, onIniciarOperacion, onFinalizarOperacion, onErrorOperacion }) {
  const [vehiculosSinNombre, setVehiculosSinNombre] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSincronizando, setIsSincronizando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [loteActual, setLoteActual] = useState(0);
  const [tamañoLote, setTamañoLote] = useState(10);
  const [pausado, setPausado] = useState(false);

  const cargarVehiculosSinNombre = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin-a3/vehiculos-sin-nombre');
      if (response.ok) {
        const data = await response.json();
        setVehiculosSinNombre(data.vehiculos);
        if (onFinalizarOperacion) {
          onFinalizarOperacion('Carga de vehículos sin nombre', {
            total: data.total,
            encontrados: data.vehiculos.length
          });
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error cargando vehículos');
      }
    } catch (error) {
      if (onErrorOperacion) {
        onErrorOperacion('Carga de vehículos sin nombre', error.message);
      }
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []); // Sin dependencias para evitar loops

  const sincronizarNombres = async (iniciarDesde = 0) => {
    if (isSincronizando) return;
    
    setIsSincronizando(true);
    setPausado(false);
    setProgreso(0);
    setResultado(null);
    
    onIniciarOperacion('Sincronización de nombres');
    
    try {
      const vehiculosParaSincronizar = vehiculosSinNombre.slice(iniciarDesde);
      const totalLotes = Math.ceil(vehiculosParaSincronizar.length / tamañoLote);
      
      let procesados = 0;
      let exitosos = 0;
      let errores = 0;
      const detalles = [];

      for (let i = 0; i < totalLotes; i++) {
        if (pausado) {
          onLog('info', 'Sincronización pausada por el usuario');
          break;
        }

        const inicioLote = iniciarDesde + (i * tamañoLote);
        const finLote = Math.min(inicioLote + tamañoLote, vehiculosSinNombre.length);
        const lote = vehiculosParaSincronizar.slice(0, finLote - iniciarDesde);
        
        setLoteActual(i + 1);
        onLog('info', `Procesando lote ${i + 1}/${totalLotes} (${lote.length} vehículos)`);

        try {
          const response = await fetch('/api/admin-a3/sincronizar-nombres', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              vehiculos: lote.map(v => v.matricula),
              lote: i + 1
            })
          });

          if (response.ok) {
            const resultadoLote = await response.json();
            procesados += resultadoLote.procesados;
            exitosos += resultadoLote.exitosos;
            errores += resultadoLote.errores;
            detalles.push(...resultadoLote.detalles);
            
            onLog('success', `Lote ${i + 1} completado: ${resultadoLote.exitosos} exitosos, ${resultadoLote.errores} errores`);
          } else {
            const error = await response.json();
            throw new Error(error.message || 'Error en lote');
          }
        } catch (error) {
          onLog('error', `Error en lote ${i + 1}: ${error.message}`);
          errores += lote.length;
        }

        setProgreso(((i + 1) / totalLotes) * 100);
        
        // Pausa entre lotes para evitar timeouts
        if (i < totalLotes - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const resultadoFinal = {
        procesados,
        exitosos,
        errores,
        detalles,
        pausado
      };

      setResultado(resultadoFinal);
      
      if (pausado) {
        onLog('warning', 'Sincronización pausada');
        toast.warning('Sincronización pausada');
      } else {
        onFinalizarOperacion('Sincronización de nombres', resultadoFinal);
        toast.success(`Sincronización completada: ${exitosos} exitosos, ${errores} errores`);
      }

    } catch (error) {
      onErrorOperacion('Sincronización de nombres', error.message);
      toast.error(`Error en sincronización: ${error.message}`);
    } finally {
      setIsSincronizando(false);
    }
  };

  const pausarSincronizacion = () => {
    setPausado(true);
    onLog('warning', 'Sincronización pausada por el usuario');
  };

  const reanudarSincronizacion = () => {
    const vehiculosRestantes = vehiculosSinNombre.length - (loteActual * tamañoLote);
    if (vehiculosRestantes > 0) {
      sincronizarNombres(loteActual * tamañoLote);
    }
  };

  const reiniciarSincronizacion = () => {
    setProgreso(0);
    setLoteActual(0);
    setResultado(null);
    setPausado(false);
  };

  const exportarResultado = () => {
    if (!resultado) return;
    
    const csvContent = [
      ['Matrícula', 'Estado', 'Nombre Anterior', 'Nombre Nuevo', 'Error'],
      ...resultado.detalles.map(d => [
        d.matricula,
        d.estado,
        d.nombreAnterior || '',
        d.nombreNuevo || '',
        d.error || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sincronizacion-nombres-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    cargarVehiculosSinNombre();
    // Solo cargar una vez al montar el componente
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={cargarVehiculosSinNombre} 
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Recargar
          </Button>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm">Tamaño de lote:</label>
            <select 
              value={tamañoLote} 
              onChange={(e) => setTamañoLote(Number(e.target.value))}
              disabled={isSincronizando}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isSincronizando && !pausado && (
            <Button 
              onClick={() => sincronizarNombres()} 
              disabled={vehiculosSinNombre.length === 0}
              className="flex items-center"
            >
              <Play className="mr-2 h-4 w-4" />
              Sincronizar Nombres
            </Button>
          )}
          
          {isSincronizando && !pausado && (
            <Button 
              onClick={pausarSincronizacion}
              variant="outline"
              className="flex items-center"
            >
              <Pause className="mr-2 h-4 w-4" />
              Pausar
            </Button>
          )}
          
          {pausado && (
            <Button 
              onClick={reanudarSincronizacion}
              className="flex items-center"
            >
              <Play className="mr-2 h-4 w-4" />
              Reanudar
            </Button>
          )}
          
          <Button 
            onClick={reiniciarSincronizacion}
            variant="outline"
            className="flex items-center"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reiniciar
          </Button>
        </div>
      </div>

      {/* Progreso */}
      {isSincronizando && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso: Lote {loteActual}</span>
                <span>{Math.round(progreso)}%</span>
              </div>
              <Progress value={progreso} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Vehículos sin Nombre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehiculosSinNombre.length}</div>
          </CardContent>
        </Card>
        
        {resultado && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-600">Exitosos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{resultado.exitosos}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-600">Errores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{resultado.errores}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Resultado */}
      {resultado && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Resultado de Sincronización</CardTitle>
                <CardDescription>
                  {resultado.procesados} vehículos procesados
                </CardDescription>
              </div>
              <Button onClick={exportarResultado} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Nombre Anterior</TableHead>
                    <TableHead>Nombre Nuevo</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado.detalles.slice(0, 50).map((detalle, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{detalle.matricula}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {detalle.estado === 'exitoso' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {detalle.estado === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                          <Badge variant={detalle.estado === 'exitoso' ? 'default' : 'destructive'}>
                            {detalle.estado}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{detalle.nombreAnterior || 'N/A'}</TableCell>
                      <TableCell>{detalle.nombreNuevo || 'N/A'}</TableCell>
                      <TableCell className="text-red-600">{detalle.error || ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {resultado.detalles.length > 50 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Mostrando 50 de {resultado.detalles.length} resultados
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de vehículos sin nombre */}
      <Card>
        <CardHeader>
          <CardTitle>Vehículos sin Nombre A3</CardTitle>
          <CardDescription>
            Vehículos que necesitan sincronización de nombres desde A3
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Nombre Local</TableHead>
                  <TableHead>Última Actualización</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehiculosSinNombre.slice(0, 20).map((vehiculo) => (
                  <TableRow key={vehiculo.matricula}>
                    <TableCell className="font-medium">{vehiculo.matricula}</TableCell>
                    <TableCell>{vehiculo.ubicacion}</TableCell>
                    <TableCell>{vehiculo.nombreLocal || 'N/A'}</TableCell>
                    <TableCell>
                      {vehiculo.ultimaActualizacion 
                        ? new Date(vehiculo.ultimaActualizacion).toLocaleString()
                        : 'N/A'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {vehiculosSinNombre.length > 20 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Mostrando 20 de {vehiculosSinNombre.length} vehículos
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
