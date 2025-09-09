'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  Database, 
  Sync, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Play,
  Pause,
  RotateCcw,
  FileText,
  MapPin
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import EstadoComparacion from './componentes/EstadoComparacion';
import SincronizacionNombres from './componentes/SincronizacionNombres';
import ActualizacionUbicaciones from './componentes/ActualizacionUbicaciones';
import LogsPanel from './componentes/LogsPanel';
import ControlLotes from './componentes/ControlLotes';

export default function AdminA3Page() {
  const [estadoGeneral, setEstadoGeneral] = useState({
    totalCoches: 0,
    sincronizados: 0,
    pendientes: 0,
    errores: 0,
    ultimaSincronizacion: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [operacionActiva, setOperacionActiva] = useState(null);

  // Cargar estado general al montar el componente
  useEffect(() => {
    cargarEstadoGeneral();
  }, []);

  const cargarEstadoGeneral = async () => {
    try {
      const response = await fetch('/api/admin-a3/estado-general');
      if (response.ok) {
        const data = await response.json();
        setEstadoGeneral(data);
      }
    } catch (error) {
      console.error('Error cargando estado general:', error);
      toast.error('Error cargando estado general');
    }
  };

  const agregarLog = (tipo, mensaje, detalles = null) => {
    const nuevoLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      tipo,
      mensaje,
      detalles
    };
    setLogs(prev => [nuevoLog, ...prev.slice(0, 99)]); // Mantener últimos 100 logs
  };

  const iniciarOperacion = (tipo) => {
    setOperacionActiva(tipo);
    agregarLog('info', `Iniciando operación: ${tipo}`);
  };

  const finalizarOperacion = (tipo, resultado) => {
    setOperacionActiva(null);
    agregarLog('success', `Operación completada: ${tipo}`, resultado);
  };

  const errorOperacion = (tipo, error) => {
    setOperacionActiva(null);
    agregarLog('error', `Error en operación: ${tipo}`, error);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administración A3</h1>
          <p className="text-muted-foreground">
            Gestión y sincronización de vehículos con sistema A3
          </p>
        </div>
        <Button 
          onClick={cargarEstadoGeneral} 
          disabled={isLoading}
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar Estado
        </Button>
      </div>

      {/* Estado General */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehículos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadoGeneral.totalCoches}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sincronizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estadoGeneral.sincronizados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{estadoGeneral.pendientes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Errores</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estadoGeneral.errores}</div>
          </CardContent>
        </Card>
      </div>

      {/* Operación Activa */}
      {operacionActiva && (
        <Alert>
          <Sync className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Operación en curso: <strong>{operacionActiva}</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs principales */}
      <Tabs defaultValue="comparacion" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="comparacion">Comparación</TabsTrigger>
          <TabsTrigger value="nombres">Sincronizar Nombres</TabsTrigger>
          <TabsTrigger value="ubicaciones">Actualizar Ubicaciones</TabsTrigger>
          <TabsTrigger value="lotes">Control de Lotes</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="comparacion">
          <EstadoComparacion 
            onLog={agregarLog}
            onIniciarOperacion={iniciarOperacion}
            onFinalizarOperacion={finalizarOperacion}
            onErrorOperacion={errorOperacion}
          />
        </TabsContent>

        <TabsContent value="nombres">
          <SincronizacionNombres 
            onLog={agregarLog}
            onIniciarOperacion={iniciarOperacion}
            onFinalizarOperacion={finalizarOperacion}
            onErrorOperacion={errorOperacion}
          />
        </TabsContent>

        <TabsContent value="ubicaciones">
          <ActualizacionUbicaciones 
            onLog={agregarLog}
            onIniciarOperacion={iniciarOperacion}
            onFinalizarOperacion={finalizarOperacion}
            onErrorOperacion={errorOperacion}
          />
        </TabsContent>

        <TabsContent value="lotes">
          <ControlLotes 
            onLog={agregarLog}
            onIniciarOperacion={iniciarOperacion}
            onFinalizarOperacion={finalizarOperacion}
            onErrorOperacion={errorOperacion}
          />
        </TabsContent>

        <TabsContent value="logs">
          <LogsPanel logs={logs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
