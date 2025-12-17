import React, { useState, useRef } from 'react';
import { Download, Upload, AlertTriangle, FileJson, Check, Database } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Layout } from './Layout';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { cn } from '../utils/cn';

export default function Data() {
    const { exportData, importData, verifyAdmin } = useGame();
    const [importFile, setImportFile] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }
    const fileInputRef = useRef(null);

    const handleExport = () => {
        if (!verifyAdmin()) return;
        exportData();
        setStatus({ type: 'success', message: 'Téléchargement lancé !' });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                if (json.version && Array.isArray(json.players)) {
                    setImportFile(file);
                    setPreviewData(json);
                    setStatus(null);
                } else {
                    setStatus({ type: 'error', message: "Ce fichier ne ressemble pas à une sauvegarde MultiGame valide." });
                }
            } catch (err) {
                setStatus({ type: 'error', message: "Fichier JSON invalide ou corrompu." });
            }
        };
        reader.readAsText(file);
    };

    const handleImport = (mode) => {
        if (!verifyAdmin()) return;
        if (!previewData) return;

        if (mode === 'replace') {
            if (!confirm("⚠️ ATTENTION : Cela va EFFACER toutes vos données actuelles pour les remplacer par celles du fichier. Êtes-vous sûr ?")) {
                return;
            }
        }

        const result = importData(previewData, mode);
        setStatus({ type: result.success ? 'success' : 'error', message: result.message });

        if (result.success) {
            setImportFile(null);
            setPreviewData(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <Database className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white">Gestion des Données</h1>
                        <p className="text-slate-400">Sauvegardez ou restaurez vos compétitions.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* EXPORT SECTION */}
                    <Card className="border-indigo-500/20 bg-slate-900/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="w-5 h-5 text-indigo-400" />
                                Export (Sauvegarde)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-400">
                                Téléchargez un fichier <code>.json</code> contenant tous les joueurs, courses et résultats actuels. Utile pour faire une copie de sécurité ou transférer vers un autre appareil.
                            </p>
                            <Button onClick={handleExport} className="w-full bg-indigo-600 hover:bg-indigo-500">
                                <Download className="w-4 h-4 mr-2" /> Télécharger les données
                            </Button>
                        </CardContent>
                    </Card>

                    {/* IMPORT SECTION */}
                    <Card className="border-indigo-500/20 bg-slate-900/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="w-5 h-5 text-indigo-400" />
                                Import (Restauration)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-400">
                                Chargez un fichier de sauvegarde pour récupérer vos données.
                            </p>

                            {!previewData ? (
                                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl p-8 text-center transition-colors cursor-pointer bg-slate-950/30" onClick={() => fileInputRef.current?.click()}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".json"
                                        onChange={handleFileChange}
                                    />
                                    <FileJson className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                                    <span className="text-sm font-medium text-slate-300">Cliquez pour choisir un fichier</span>
                                </div>
                            ) : (
                                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-4 animate-fade-in">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500">
                                            <FileJson className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{importFile?.name}</p>
                                            <p className="text-xs text-slate-500">
                                                Contient {previewData.players?.length || 0} joueurs et {previewData.races?.length || 0} courses.
                                            </p>
                                        </div>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-red-400" onClick={() => { setImportFile(null); setPreviewData(null); }}>×</Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="secondary" className="text-sm bg-slate-800 hover:bg-slate-700" onClick={() => handleImport('merge')}>
                                            Fusionner
                                        </Button>
                                        <Button variant="destructive" className="text-sm" onClick={() => handleImport('replace')}>
                                            Remplacer tout
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-center text-slate-500 leading-tight">
                                        <b>Fusion</b> ajoute les données manquantes.<br />
                                        <b>Remplacer</b> écrase tout (Danger ⚠️).
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {status && (
                    <div className={cn(
                        "p-4 rounded-xl border flex items-center gap-3 animate-fade-in",
                        status.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}>
                        {status.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        <span className="font-medium">{status.message}</span>
                    </div>
                )}
            </div>
        </Layout>
    );
}
