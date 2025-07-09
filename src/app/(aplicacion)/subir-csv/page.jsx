'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { Upload, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SubirCSVPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Por favor, selecciona un archivo CSV.');
            return;
        }

        setIsLoading(true);
        setImportResult(null);
        const formData = new FormData();
        formData.append('csvFile', selectedFile);

        try {
            const response = await fetch('/api/procesar-csv', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setImportResult(data);
                toast.success(data.message || 'CSV procesado exitosamente.');
                setSelectedFile(null);
            } else {
                const errorData = await response.json();
                setImportResult(errorData);
                toast.error(errorData.error || 'Error al procesar el CSV.');
            }
        } catch (error) {
            console.error('Error al subir el CSV:', error);
            setImportResult({ error: 'Error de red o del servidor al subir el CSV.', details: error.message });
            toast.error('Error de red o del servidor al subir el CSV.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStatusBadge = (hasErrors) => {
        if (hasErrors) {
            return (
                <Badge variant="destructive" className="flex items-center">
                    <XCircle className="mr-2 h-4 w-4" />
                    Con Errores
                </Badge>
            );
        }
        return (
            <Badge variant="default" className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Completado
            </Badge>
        );
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-[calc(100vh-100px)] p-4 pt-10 space-y-8">
            {/* Sección de Carga de CSV */}
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Upload className="mr-2 h-6 w-6" /> 
                        Subir CSV de Vehículos
                    </CardTitle>
                    <CardDescription>
                        Sube un archivo CSV con matrículas y ubicaciones para actualizar o crear vehículos.
                        <br />
                        <strong>Formato esperado del CSV:</strong> matricula,ubicacion
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        id="csvFile"
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || isLoading}
                        className="w-full"
                    >
                        {isLoading ? 'Procesando...' : 'Subir y Procesar CSV'}
                    </Button>
                </CardContent>
            </Card>

            {/* Sección de Resultados de la Última Importación */}
            {importResult && (
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FileText className="mr-2 h-6 w-6" /> 
                            Resultados de la Importación
                        </CardTitle>
                        <CardDescription>
                            {importResult.message}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {importResult.error ? (
                            <div className="text-red-600 font-medium">
                                Error: {importResult.error}
                                {importResult.details && (
                                    <p className="text-sm">Detalles: {importResult.details}</p>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <span>Estado:</span>
                                    {renderStatusBadge(importResult.errors?.length > 0)}
                                </div>
                                <p>Total de Registros: <span className="font-semibold">{importResult.totalRecords}</span></p>
                                <p>Vehículos Actualizados: <span className="font-semibold">{importResult.updatedCount}</span></p>
                                <p>Vehículos Creados: <span className="font-semibold">{importResult.createdCount}</span></p>
                                {importResult.errors && importResult.errors.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-red-500">
                                            Errores en filas ({importResult.errors.length}):
                                        </h4>
                                        <div className="max-h-40 overflow-y-auto border border-red-300 p-2 rounded">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Matrícula</TableHead>
                                                        <TableHead>Ubicación</TableHead>
                                                        <TableHead>Error</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {importResult.errors.map((err, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{err.row?.matricula || 'N/A'}</TableCell>
                                                            <TableCell>{err.row?.ubicacion || 'N/A'}</TableCell>
                                                            <TableCell className="text-red-500 text-sm">
                                                                {err.error}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Sección de Información */}
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Clock className="mr-2 h-6 w-6" /> 
                        Información sobre la Importación
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Formato del CSV:</h4>
                            <p className="text-sm text-gray-600">
                                El archivo CSV debe tener dos columnas: <strong>matricula</strong> y <strong>ubicacion</strong>.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Ejemplo de CSV:</h4>
                            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                                matricula,ubicacion<br/>
                                1234ABC,Taller Central<br/>
                                5678DEF,Concesionario Norte<br/>
                                9012GHI,Almacén Sur
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Comportamiento:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Si la matrícula existe, se actualiza su ubicación</li>
                                <li>• Si la matrícula no existe, se crea un nuevo vehículo</li>
                                <li>• <strong>Solo se pueden asignar coches a ubicaciones ya existentes</strong></li>
                                <li>• Si la ubicación indicada no existe, se mostrará un error y el coche no será añadido ni actualizado</li>
                                <li>• Se registra cada cambio en el historial de ubicaciones</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 