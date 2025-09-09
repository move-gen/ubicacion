'use client';

import { useState, useEffect } from 'react';
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
  MapPin,
  Upload,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ActualizacionUbicaciones({ onLog, onIniciarOperacion, onFinalizarOperacion, onErrorOperacion }) {
  const [vehiculosPendientes, setVehiculosPendientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActualizando, setIsActualizando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [loteActual, setLoteActual] = useState(0);
  const [tamañoLote, setTamañoLote] = useState(5); // Más pequeño para ubicaciones
  const [pausado, setPausado] = useState(false);
  const [filtro, setFiltro] = useState('todos'); // todos, pendientes, actualizados, errores

  const cargarVehiculosPendientes = async () => {
    setIsLoading(true);
    onIniciarOperacion('Carga de vehículos pendientes');
    
    try {
      const response = await fetch('/api/admin-a3/vehiculos-pendientes-ubicacion');
      if (response.ok) {
        const data = await response.json();
        setVehiculosPendientes(data.vehiculos);
        onFinalizarOperacion('Carga de vehículos pendientes', {
          total: data.total,
          pendientes: data.vehiculos.length
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error cargando vehículos');
      }
    } catch (error) {
      onErrorOperacion('Carga de vehículos pendientes', error.message);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const actualizarUbicaciones = async (iniciarDesde = 0) => {
    if (isActualizando) return;
    
    setIsActualizando(true);
    setPausado(false);
    setProgreso(0);
    setResultado(null);
    
    onIniciarOperacion('Actualización de ubicaciones a A3');
    
    try {
      const vehiculosParaActualizar = vehiculosPendientes.slice(iniciarDesde);
      const totalLotes = Math.ceil(vehiculosParaActualizar.length / tamañoLote);
      
      let procesados = 0;
      let exitosos = 0;
      let errores = 0;
      const detalles = [];

      for (let i = 0; i < totalLotes; i++) {
        if (pausado) {
          onLog('info', 'Actualización pausada por el usuario');
          break;
        }

        const inicioLote = iniciarDesde + (i * tamañoLote);
        const finLote = Math.min(inicioLote + tamañoLote, vehiculosPendientes.length);
        const lote = vehiculosParaActualizar.slice(0, finLote - iniciarDesde);
        
        setLoteActual(i + 1);
        onLog('info', `Procesando lote ${i + 1}/${totalLotes} (${lote.length} vehículos)`);

        try {
          const response = await fetch('/api/admin-a3/actualizar-ubicaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              vehiculos: lote.map(v => ({
                matricula: v.matricula,
                ubicacionA3: v.ubicacionA3
              })),
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
        
        // Pausa más larga entre lotes para ubicaciones (más crítico)
        if (i < totalLotes - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
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
        onLog('warning', 'Actualización pausada');
        toast.warning('Actualización pausada');
      } else {
        onFinalizarOperacion('Actualización de ubicaciones a A3', resultadoFinal);
        toast.success(`Actualización completada: ${exitosos} exitosos, ${errores} errores`);
        // Recargar la lista después de la actualización
        cargarVehiculosPendientes();
      }

    } catch (error) {
      onErrorOperacion('Actualización de ubicaciones a A3', error.message);
      toast.error(`Error en actualización: ${error.message}`);
    } finally {
      setIsActualizando(false);
    }
  };

  const pausarActualizacion = () => {
    setPausado(true);
    onLog('warning', 'Actualización pausada por el usuario');
  };

  const reanudarActualizacion = () => {
    const vehiculosRestantes = vehiculosPendientes.length - (loteActual * tamañoLote);
    if (vehiculosRestantes > 0) {
      actualizarUbicaciones(loteActual * tamañoLote);
    }
  };

  const reiniciarActualizacion = () => {
    setProgreso(0);
    setLoteActual(0);
    setResultado(null);
    setPausado(false);
  };

  const exportarResultado = () => {
    if (!resultado) return;
    
    const csvContent = [
      ['Matrícula', 'Estado', 'Ubicación Local', 'Ubicación A3', 'Error'],
      ...resultado.detalles.map(d => [
        d.matricula,
        d.estado,
        d.ubicacionLocal || '',
        d.ubicacionA3 || '',
        d.error || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `actualizacion-ubicaciones-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filtrarVehiculos = () => {
    if (!vehiculosPendientes) return [];
    
    switch (filtro) {
      case 'pendientes':
        return vehiculosPendientes.filter(v => !v.actualizadoA3);
      case 'actualizados':
        return vehiculosPendientes.filter(v => v.actualizadoA3);
      case 'errores':
        return vehiculosPendientes.filter(v => v.error);
      default:
        return vehiculosPendientes;
    }
  };

  const vehiculosFiltrados = filtrarVehiculos();

  useEffect(() => {
    cargarVehiculosPendientes();
  }, []);

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={cargarVehiculosPendientes} 
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
              disabled={isActualizando}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm">Filtrar:</label>
            <select 
              value={filtro} 
              onChange={(e) => setFiltro(e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="todos">Todos</option>
              <option value="pendientes">Pendientes</option>
              <option value="actualizados">Actualizados</option>
              <option value="errores">Con Errores</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isActualizando && !pausado && (
            <Button 
              onClick={() => actualizarUbicaciones()} 
              disabled={vehiculosPendientes.length === 0}
              className="flex items-center"
            >
              <Upload className="mr-2 h-4 w-4" />
              Actualizar a A3
            </Button>
          )}
          
          {isActualizando && !pausado && (
            <Button 
              onClick={pausarActualizacion}
              variant="outline"
              className="flex items-center"
            >
              <Pause className="mr-2 h-4 w-4" />
              Pausar
            </Button>
          )}
          
          {pausado && (
            <Button 
              onClick={reanudarActualizacion}
              className="flex items-center"
            >
              <Play className="mr-2 h-4 w-4" />
              Reanudar
            </Button>
          )}
          
          <Button 
            onClick={reiniciarActualizacion}
            variant="outline"
            className="flex items-center"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reiniciar
          </Button>
        </div>
      </div>

      {/* Progreso */}
      {isActualizando && (
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Vehículos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehiculosPendientes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-600">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {vehiculosPendientes.filter(v => !v.actualizadoA3).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-600">Actualizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {vehiculosPendientes.filter(v => v.actualizadoA3).length}
            </div>
          </CardContent>
        </Card>
        
        {resultado && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-600">Errores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{resultado.errores}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Resultado */}
      {resultado && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Resultado de Actualización</CardTitle>
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
                    <TableHead>Ubicación Local</TableHead>
                    <TableHead>Ubicación A3</TableHead>
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
                      <TableCell>{detalle.ubicacionLocal || 'N/A'}</TableCell>
                      <TableCell>{detalle.ubicacionA3 || 'N/A'}</TableCell>
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

      {/* Lista de vehículos pendientes */}
      <Card>
        <CardHeader>
          <CardTitle>Vehículos Pendientes de Actualización</CardTitle>
          <CardDescription>
            Vehículos que necesitan actualizar su ubicación en A3
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ubicación Local</TableHead>
                  <TableHead>Ubicación A3</TableHead>
                  <TableHead>Última Actualización</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehiculosFiltrados.slice(0, 20).map((vehiculo) => (
                  <TableRow key={vehiculo.matricula}>
                    <TableCell className="font-medium">{vehiculo.matricula}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {vehiculo.actualizadoA3 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <Badge variant={vehiculo.actualizadoA3 ? 'default' : 'secondary'}>
                          {vehiculo.actualizadoA3 ? 'Actualizado' : 'Pendiente'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{vehiculo.ubicacionLocal}</TableCell>
                    <TableCell>{vehiculo.ubicacionA3 || 'N/A'}</TableCell>
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
            {vehiculosFiltrados.length > 20 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Mostrando 20 de {vehiculosFiltrados.length} vehículos
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
