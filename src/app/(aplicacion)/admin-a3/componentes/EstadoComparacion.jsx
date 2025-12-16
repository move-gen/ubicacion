'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Database,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function EstadoComparacion({ onLog, onIniciarOperacion, onFinalizarOperacion, onErrorOperacion }) {
  const [comparacion, setComparacion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filtro, setFiltro] = useState('todos'); // todos, diferencias, sincronizados, errores

  const cargarComparacion = async () => {
    setIsLoading(true);
    if (onIniciarOperacion) {
      onIniciarOperacion('Comparación de estado');
    }
    
    try {
      const response = await fetch('/api/admin-a3/comparar-estado');
      if (response.ok) {
        const data = await response.json();
        setComparacion(data);
        if (onFinalizarOperacion) {
          onFinalizarOperacion('Comparación de estado', {
            total: data.total,
            sincronizados: data.sincronizados,
            diferencias: data.diferencias,
            errores: data.errores
          });
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error en la comparación');
      }
    } catch (error) {
      if (onErrorOperacion) {
        onErrorOperacion('Comparación de estado', error.message);
      }
      toast.error(`Error en comparación: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'sincronizado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'diferencia':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEstadoBadge = (estado) => {
    const variants = {
      sincronizado: 'default',
      diferencia: 'secondary',
      error: 'destructive'
    };
    
    const labels = {
      sincronizado: 'Sincronizado',
      diferencia: 'Diferencia',
      error: 'Error'
    };

    return (
      <Badge variant={variants[estado] || 'outline'}>
        {labels[estado] || estado}
      </Badge>
    );
  };

  const filtrarVehiculos = () => {
    if (!comparacion?.vehiculos) return [];
    
    switch (filtro) {
      case 'diferencias':
        return comparacion.vehiculos.filter(v => v.estado === 'diferencia');
      case 'sincronizados':
        return comparacion.vehiculos.filter(v => v.estado === 'sincronizado');
      case 'errores':
        return comparacion.vehiculos.filter(v => v.estado === 'error');
      default:
        return comparacion.vehiculos;
    }
  };

  const vehiculosFiltrados = filtrarVehiculos();

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={cargarComparacion} 
            disabled={isLoading}
            className="flex items-center"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Comparar Estado
          </Button>
          
          {comparacion && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Filtrar:</span>
              <select 
                value={filtro} 
                onChange={(e) => setFiltro(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="todos">Todos ({comparacion.total})</option>
                <option value="sincronizados">Sincronizados ({comparacion.sincronizados})</option>
                <option value="diferencias">Diferencias ({comparacion.diferencias})</option>
                <option value="errores">Errores ({comparacion.errores})</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Resumen */}
      {comparacion && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{comparacion.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-600">Sincronizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{comparacion.sincronizados}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-yellow-600">Diferencias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{comparacion.diferencias}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-600">Errores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{comparacion.errores}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla de vehículos */}
      {comparacion && (
        <Card>
          <CardHeader>
            <CardTitle>Vehículos ({vehiculosFiltrados.length})</CardTitle>
            <CardDescription>
              Comparación entre estado local y A3
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
                    <TableHead>Nombre Local</TableHead>
                    <TableHead>Nombre A3</TableHead>
                    <TableHead>Última Actualización</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehiculosFiltrados.map((vehiculo) => (
                    <TableRow key={vehiculo.matricula}>
                      <TableCell className="font-medium">{vehiculo.matricula}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getEstadoIcon(vehiculo.estado)}
                          {getEstadoBadge(vehiculo.estado)}
                        </div>
                      </TableCell>
                      <TableCell>{vehiculo.ubicacionLocal || 'N/A'}</TableCell>
                      <TableCell>{vehiculo.ubicacionA3 || 'N/A'}</TableCell>
                      <TableCell>{vehiculo.nombreLocal || 'N/A'}</TableCell>
                      <TableCell>{vehiculo.nombreA3 || 'N/A'}</TableCell>
                      <TableCell>
                        {vehiculo.ultimaActualizacion 
                          ? new Date(vehiculo.ultimaActualizacion).toLocaleString()
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // Aquí se podría implementar una acción específica para el vehículo
                            toast.info(`Acción para ${vehiculo.matricula}`);
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando no hay datos */}
      {!comparacion && !isLoading && (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            Haz clic en &quot;Comparar Estado&quot; para ver la comparación entre tu base de datos local y A3.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
