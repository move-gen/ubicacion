'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { Upload, FileText, CheckCircle, XCircle, Clock, Trash2, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    const [selectedDeleteFile, setSelectedDeleteFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [deleteResult, setDeleteResult] = useState(null);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [loadingUbicaciones, setLoadingUbicaciones] = useState(false);
    const [validationResult, setValidationResult] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [conversionResult, setConversionResult] = useState(null);
    const [isConverting, setIsConverting] = useState(false);

    useEffect(() => {
        fetchUbicaciones();
    }, []);

    const fetchUbicaciones = async () => {
        setLoadingUbicaciones(true);
        try {
            const response = await fetch('/api/ubicaciones-disponibles');
            if (response.ok) {
                const data = await response.json();
                setUbicaciones(data.ubicaciones || []);
            }
        } catch (error) {
            console.error('Error al cargar ubicaciones:', error);
        } finally {
            setLoadingUbicaciones(false);
        }
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setValidationResult(null);
        setImportResult(null);
    };

    const handleValidate = async () => {
        if (!selectedFile) {
            toast.error('Por favor, selecciona un archivo CSV.');
            return;
        }

        setIsValidating(true);
        setValidationResult(null);
        const formData = new FormData();
        formData.append('csvFile', selectedFile);

        try {
            const response = await fetch('/api/validar-csv', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setValidationResult(data);
                toast.success('CSV validado correctamente');
            } else {
                const errorData = await response.json();
                setValidationResult(errorData);
                toast.error('Error al validar el CSV');
            }
        } catch (error) {
            console.error('Error al validar el CSV:', error);
            toast.error('Error de red al validar el CSV');
        } finally {
            setIsValidating(false);
        }
    };

    const handleConvert = async () => {
        if (!selectedFile) {
            toast.error('Por favor, selecciona un archivo CSV.');
            return;
        }

        setIsConverting(true);
        setConversionResult(null);
        const formData = new FormData();
        formData.append('csvFile', selectedFile);

        try {
            const response = await fetch('/api/convertir-csv', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setConversionResult(data);
                toast.success(`CSV convertido: ${data.procesados} registros procesados`);
            } else {
                const errorData = await response.json();
                setConversionResult(errorData);
                toast.error('Error al convertir el CSV');
            }
        } catch (error) {
            console.error('Error al convertir el CSV:', error);
            toast.error('Error de red al convertir el CSV');
        } finally {
            setIsConverting(false);
        }
    };

    const downloadConvertedCSV = () => {
        if (!conversionResult || !conversionResult.csvContent) {
            toast.error('No hay CSV convertido para descargar');
            return;
        }

        const blob = new Blob([conversionResult.csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'convertido.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV descargado');
    };

    const handleDeleteFileChange = (event) => {
        setSelectedDeleteFile(event.target.files[0]);
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

    const handleDelete = async () => {
        if (!selectedDeleteFile) {
            toast.error('Por favor, selecciona un archivo CSV.');
            return;
        }

        setIsDeleteLoading(true);
        setDeleteResult(null);
        const formData = new FormData();
        formData.append('csvFile', selectedDeleteFile);

        try {
            const response = await fetch('/api/eliminar-csv', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setDeleteResult(data);
                toast.success(data.message || 'CSV procesado exitosamente.');
                setSelectedDeleteFile(null);
            } else {
                const errorData = await response.json();
                setDeleteResult(errorData);
                toast.error(errorData.error || 'Error al procesar el CSV.');
            }
        } catch (error) {
            console.error('Error al procesar el CSV:', error);
            setDeleteResult({ error: 'Error de red o del servidor al procesar el CSV.', details: error.message });
            toast.error('Error de red o del servidor al procesar el CSV.');
        } finally {
            setIsDeleteLoading(false);
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
            <Tabs defaultValue="upload" className="w-full max-w-4xl">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Subir Vehículos</TabsTrigger>
                    <TabsTrigger value="delete">Eliminar Vehículos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-8">
                    {/* Sección de Carga de CSV */}
                    <Card className="w-full max-w-md mx-auto">
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
                                disabled={isLoading || isValidating || isConverting}
                            />
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleValidate}
                                        disabled={!selectedFile || isValidating || isLoading || isConverting}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        {isValidating ? 'Validando...' : 'Validar CSV'}
                                    </Button>
                                    <Button
                                        onClick={handleConvert}
                                        disabled={!selectedFile || isConverting || isLoading || isValidating}
                                        variant="secondary"
                                        className="flex-1"
                                    >
                                        {isConverting ? 'Convirtiendo...' : 'Convertir Formato'}
                                    </Button>
                                </div>
                                <Button
                                    onClick={handleUpload}
                                    disabled={!selectedFile || isLoading || isValidating || isConverting}
                                    className="w-full"
                                >
                                    {isLoading ? 'Procesando...' : 'Importar CSV'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="delete" className="space-y-8">
                    {/* Sección de Eliminación de CSV */}
                    <Card className="w-full max-w-md mx-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Trash2 className="mr-2 h-6 w-6" /> 
                                Eliminar Vehículos por CSV
                            </CardTitle>
                            <CardDescription>
                                Sube un archivo CSV con matrículas para eliminar vehículos del sistema.
                                <br />
                                <strong>Formato esperado del CSV:</strong> matricula
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                id="deleteCsvFile"
                                type="file"
                                accept=".csv"
                                onChange={handleDeleteFileChange}
                                disabled={isDeleteLoading}
                            />
                            <Button
                                onClick={handleDelete}
                                disabled={!selectedDeleteFile || isDeleteLoading}
                                className="w-full bg-red-600 hover:bg-red-700"
                            >
                                {isDeleteLoading ? 'Procesando...' : 'Eliminar Vehículos'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Resultados de Conversión */}
            {conversionResult && (
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FileText className="mr-2 h-6 w-6" /> 
                            Resultado de la Conversión
                        </CardTitle>
                        <CardDescription>
                            Tu archivo ha sido convertido al formato correcto
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {conversionResult.error ? (
                            <div className="text-red-600">
                                <p className="font-semibold">Error: {conversionResult.error}</p>
                                {conversionResult.details && <p className="text-sm">{conversionResult.details}</p>}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Total líneas:</p>
                                        <p className="font-semibold">{conversionResult.totalLineas}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Procesados:</p>
                                        <p className="font-semibold text-green-600">{conversionResult.procesados}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Errores:</p>
                                        <p className="font-semibold text-red-600">{conversionResult.errores}</p>
                                    </div>
                                </div>

                                {conversionResult.csvContent && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Vista previa del CSV convertido:</p>
                                        <div className="bg-gray-100 p-3 rounded text-sm font-mono max-h-60 overflow-auto">
                                            {conversionResult.csvContent.split('\n').slice(0, 10).map((line, idx) => (
                                                <div key={idx}>{line}</div>
                                            ))}
                                            {conversionResult.csvContent.split('\n').length > 10 && (
                                                <div className="text-gray-500">... y {conversionResult.csvContent.split('\n').length - 10} líneas más</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Button onClick={downloadConvertedCSV} className="w-full">
                                    Descargar CSV Convertido
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Resultados de Validación */}
            {validationResult && (
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FileText className="mr-2 h-6 w-6" /> 
                            Validación del CSV
                        </CardTitle>
                        <CardDescription>
                            Información detectada del archivo CSV
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {validationResult.error ? (
                            <div className="text-red-600">
                                <p className="font-semibold">Error: {validationResult.error}</p>
                                {validationResult.details && <p className="text-sm">{validationResult.details}</p>}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Nombre archivo:</p>
                                        <p className="font-semibold">{validationResult.fileName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Delimitador:</p>
                                        <p className="font-semibold">{validationResult.delimiter}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total registros:</p>
                                        <p className="font-semibold">{validationResult.totalRecords}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Columnas detectadas:</p>
                                        <p className="font-semibold">{validationResult.columns?.length || 0}</p>
                                    </div>
                                </div>

                                {validationResult.columns && validationResult.columns.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Nombres de columnas:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {validationResult.columns.map((col, idx) => (
                                                <Badge key={idx} variant="secondary">{col}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {validationResult.firstLines && validationResult.firstLines.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Primeras líneas del archivo:</p>
                                        <div className="bg-gray-100 p-3 rounded text-sm font-mono max-h-40 overflow-auto">
                                            {validationResult.firstLines.map((line, idx) => (
                                                <div key={idx} className="whitespace-pre-wrap break-all">
                                                    {line || '(línea vacía)'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {validationResult.sampleRecords && validationResult.sampleRecords.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Registros de muestra (primeros 5):</p>
                                        <div className="border rounded p-2 max-h-60 overflow-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        {validationResult.columns.map((col, idx) => (
                                                            <TableHead key={idx}>{col}</TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {validationResult.sampleRecords.map((record, idx) => (
                                                        <TableRow key={idx}>
                                                            {validationResult.columns.map((col, colIdx) => (
                                                                <TableCell key={colIdx} className="text-sm">
                                                                    {record[col] || '(vacío)'}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}

                                {validationResult.parseError && (
                                    <div className="text-red-600">
                                        <p className="font-semibold">Error al parsear:</p>
                                        <p className="text-sm">{validationResult.parseError}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Resultados de Importación */}
            {importResult && (
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FileText className="mr-2 h-6 w-6" /> 
                            Resultados de la Importación
                        </CardTitle>
                        <CardDescription>
                            {importResult.message}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
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

                                {/* Listado de actualizados */}
                                {importResult.updatedList && importResult.updatedList.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-green-700">Actualizados ({importResult.updatedList.length}):</h4>
                                        <div className="max-h-40 overflow-y-auto border border-green-300 p-2 rounded bg-green-50">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Matrícula</TableHead>
                                                        <TableHead>Ubicación</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {importResult.updatedList.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.matricula}</TableCell>
                                                            <TableCell>{item.ubicacion}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}

                                {/* Listado de creados */}
                                {importResult.createdList && importResult.createdList.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-blue-700">Creados ({importResult.createdList.length}):</h4>
                                        <div className="max-h-40 overflow-y-auto border border-blue-300 p-2 rounded bg-blue-50">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Matrícula</TableHead>
                                                        <TableHead>Ubicación</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {importResult.createdList.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.matricula}</TableCell>
                                                            <TableCell>{item.ubicacion}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}

                                {/* Listado de sin cambios */}
                                {importResult.noChangeList && importResult.noChangeList.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-gray-700">Sin cambios ({importResult.noChangeList.length}):</h4>
                                        <div className="max-h-40 overflow-y-auto border border-gray-300 p-2 rounded bg-gray-50">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Matrícula</TableHead>
                                                        <TableHead>Ubicación</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {importResult.noChangeList.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.matricula}</TableCell>
                                                            <TableCell>{item.ubicacion}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}

                                {/* Listado de errores */}
                                {importResult.errors && importResult.errors.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-red-500">
                                            Errores en filas ({importResult.errors.length}):
                                        </h4>
                                        <div className="max-h-40 overflow-y-auto border border-red-300 p-2 rounded bg-red-50">
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

            {/* Resultados de Eliminación */}
            {deleteResult && (
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Trash2 className="mr-2 h-6 w-6" /> 
                            Resultados de la Eliminación
                        </CardTitle>
                        <CardDescription>
                            {deleteResult.message}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {deleteResult.error ? (
                            <div className="text-red-600 font-medium">
                                Error: {deleteResult.error}
                                {deleteResult.details && (
                                    <p className="text-sm">Detalles: {deleteResult.details}</p>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <span>Estado:</span>
                                    {renderStatusBadge(deleteResult.errors?.length > 0)}
                                </div>
                                <p>Total de Registros: <span className="font-semibold">{deleteResult.totalRecords}</span></p>
                                <p>Vehículos Eliminados: <span className="font-semibold">{deleteResult.deletedCount}</span></p>

                                {/* Listado de eliminados */}
                                {deleteResult.deletedList && deleteResult.deletedList.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-red-700">Eliminados ({deleteResult.deletedList.length}):</h4>
                                        <div className="max-h-40 overflow-y-auto border border-red-300 p-2 rounded bg-red-50">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Matrícula</TableHead>
                                                        <TableHead>Marca</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {deleteResult.deletedList.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.matricula}</TableCell>
                                                            <TableCell>{item.marca}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}

                                {/* Listado de no encontrados */}
                                {deleteResult.notFoundList && deleteResult.notFoundList.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-gray-700">No encontrados ({deleteResult.notFoundList.length}):</h4>
                                        <div className="max-h-40 overflow-y-auto border border-gray-300 p-2 rounded bg-gray-50">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Matrícula</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {deleteResult.notFoundList.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.matricula}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}

                                {/* Listado de errores */}
                                {deleteResult.errors && deleteResult.errors.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-red-500">
                                            Errores en filas ({deleteResult.errors.length}):
                                        </h4>
                                        <div className="max-h-40 overflow-y-auto border border-red-300 p-2 rounded bg-red-50">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Matrícula</TableHead>
                                                        <TableHead>Error</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {deleteResult.errors.map((err, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{err.row?.matricula || 'N/A'}</TableCell>
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

            {/* Ubicaciones Disponibles */}
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <MapPin className="mr-2 h-6 w-6" /> 
                        Ubicaciones Disponibles
                    </CardTitle>
                    <CardDescription>
                        Estas son las ubicaciones que puedes usar en tu archivo CSV
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingUbicaciones ? (
                        <p className="text-gray-500">Cargando ubicaciones...</p>
                    ) : ubicaciones.length === 0 ? (
                        <p className="text-gray-500">No se encontraron ubicaciones</p>
                    ) : (
                        <div className="max-h-60 overflow-y-auto border rounded p-2">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre Original</TableHead>
                                        <TableHead>Usar en CSV</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ubicaciones.map((ub) => (
                                        <TableRow key={ub.id}>
                                            <TableCell className="font-medium">{ub.original}</TableCell>
                                            <TableCell className="text-sm text-gray-600 font-mono">
                                                {ub.original}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Sección de Información */}
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Clock className="mr-2 h-6 w-6" /> 
                        Información sobre CSV
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="upload-info" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload-info">Información Subida</TabsTrigger>
                            <TabsTrigger value="delete-info">Información Eliminación</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="upload-info" className="space-y-4 mt-4">
                            <div>
                                <h4 className="font-semibold mb-2">Formato del CSV para subir:</h4>
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
                        </TabsContent>
                        
                        <TabsContent value="delete-info" className="space-y-4 mt-4">
                            <div>
                                <h4 className="font-semibold mb-2">Formato del CSV para eliminar:</h4>
                                <p className="text-sm text-gray-600">
                                    El archivo CSV debe tener una columna: <strong>matricula</strong>.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Ejemplo de CSV:</h4>
                                <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                                    matricula<br/>
                                    1234ABC<br/>
                                    5678DEF<br/>
                                    9012GHI
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Comportamiento:</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• <strong>⚠️ CUIDADO: Esta acción es irreversible</strong></li>
                                    <li>• Si la matrícula existe, se elimina el vehículo completamente</li>
                                    <li>• Se eliminan todos los registros relacionados (historial, envíos)</li>
                                    <li>• Si la matrícula no existe, se marca como &quot;no encontrada&quot;</li>
                                    <li>• Se recomienda hacer una copia de seguridad antes de eliminar</li>
                                </ul>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
} 