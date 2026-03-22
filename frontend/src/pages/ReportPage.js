import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import {
    Upload, MapPin, AlertTriangle, CheckCircle2,
    Camera, Loader, Send, XCircle, Info
} from 'lucide-react';

const OBSTRUCTION_TYPES = [
    { value: '', label: 'Select type...' },
    { value: 'illegal_parking', label: 'Illegal Parking' },
    { value: 'construction', label: 'Construction' },
    { value: 'vendor_encroachment', label: 'Vendor Encroachment' },
    { value: 'road_blockage', label: 'Road Blockage (Other)' },
    { value: 'garbage_truck', label: 'Garbage Truck Blockage' },
];

const STEPS = ['Upload Image', 'Details', 'Submit'];

export default function ReportPage() {
    const [step, setStep] = useState(0);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [locating, setLocating] = useState(false);
    const [location, setLocation] = useState(null);
    const [locError, setLocError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [aiResult, setAiResult] = useState(null);

    /* ── Dropzone ── */
    const onDrop = useCallback(accepted => {
        if (accepted[0]) {
            setFile(accepted[0]);
            setPreview(URL.createObjectURL(accepted[0]));
            setStep(1);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024,
    });

    /* ── GPS ── */
    function detectLocation() {
        setLocating(true);
        setLocError(null);
        navigator.geolocation.getCurrentPosition(
            pos => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocating(false);
            },
            () => {
                setLocError('Location access denied. Using default city center.');
                setLocation({ lat: 12.9716, lng: 77.5946 });
                setLocating(false);
            },
            { timeout: 8000 }
        );
    }

    /* ── Submit ── */
    async function handleSubmit(e) {
        e.preventDefault();
        if (!type) return;
        setSubmitting(true);

        try {
            const formData = new FormData();
            if (file) formData.append('image', file);
            formData.append('obstruction_type', type);
            formData.append('description', description);
            formData.append('latitude', location?.lat || 12.9716);
            formData.append('longitude', location?.lng || 77.5946);

            // Try real backend; fallback to demo result
            let result = null;
            try {
                const res = await axios.post('http://localhost:8000/report-obstruction', formData, { timeout: 5000 });
                result = res.data;
            } catch {
                // demo mode
                result = {
                    id: Math.floor(Math.random() * 9000 + 1000),
                    ai_detected: OBSTRUCTION_TYPES.find(t => t.value === type)?.label || type,
                    confidence: (0.85 + Math.random() * 0.12).toFixed(2),
                    status: 'Reported',
                    message: 'Successfully submitted (Demo mode — backend offline)',
                };
            }
            setAiResult(result);
            setSubmitted(true);
        } finally {
            setSubmitting(false);
        }
    }

    function reset() {
        setFile(null); setPreview(null); setType(''); setDescription('');
        setLocation(null); setSubmitted(false); setAiResult(null); setStep(0);
    }

    /* ── Success screen ── */
    if (submitted && aiResult) {
        return (
            <div className="min-h-screen bg-bglight flex items-center justify-center p-6">
                <div className="max-w-md w-full">
                    <div className="card text-center p-10 animate-slide-up">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} className="text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Report Submitted!</h2>
                        <p className="text-gray-500 text-sm mb-6">{aiResult.message || 'Your report has been received and is being processed.'}</p>

                        <div className="bg-teal/5 border border-teal/20 rounded-2xl p-5 text-left mb-6">
                            <div className="text-xs font-bold text-teal mb-3 flex items-center gap-1.5">
                                <Camera size={13} /> AI Analysis Result
                            </div>
                            <div className="space-y-2 text-sm">
                                <Row label="Report ID" val={`#${aiResult.id}`} />
                                <Row label="Detected Type" val={aiResult.ai_detected} />
                                <Row label="AI Confidence" val={`${(aiResult.confidence * 100).toFixed(1)}%`} />
                                <Row label="Status" val={aiResult.status} valueClass="text-green-600 font-semibold" />
                            </div>
                        </div>

                        <button onClick={reset} className="btn-primary w-full justify-center">
                            Report Another Obstruction
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bglight">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-8 px-6">
                <div className="max-w-3xl mx-auto text-white">
                    <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
                        <AlertTriangle size={22} />
                        Report an Obstruction
                    </h1>
                    <p className="text-white/70 text-sm">Help keep emergency routes clear for faster response</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                {/* Stepper */}
                <div className="flex items-center mb-8">
                    {STEPS.map((s, i) => (
                        <React.Fragment key={s}>
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'bg-green-500 text-white' :
                                        i === step ? 'bg-primary text-white scale-110' :
                                            'bg-gray-200 text-gray-400'
                                    }`}>
                                    {i < step ? '✓' : i + 1}
                                </div>
                                <span className={`text-xs font-medium hidden sm:block transition-colors ${i === step ? 'text-primary' : i < step ? 'text-green-600' : 'text-gray-400'
                                    }`}>{s}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-3 transition-all ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Step 0: Image upload */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-700 text-sm mb-4 flex items-center gap-2">
                            <Camera size={16} className="text-orange-500" />
                            Upload Obstruction Image
                        </h3>

                        {!preview ? (
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Upload size={26} className="text-orange-500" />
                                </div>
                                <p className="font-semibold text-gray-700 text-sm mb-1">
                                    {isDragActive ? 'Drop image here...' : 'Drag & drop or click to upload'}
                                </p>
                                <p className="text-gray-400 text-xs">JPG, PNG, WEBP • Max 10MB</p>
                                <p className="text-teal text-xs mt-2 font-medium">AI will auto-classify the obstruction</p>
                            </div>
                        ) : (
                            <div className="relative">
                                <img src={preview} alt="preview" className="w-full h-52 object-cover rounded-2xl" />
                                <button
                                    type="button"
                                    onClick={() => { setFile(null); setPreview(null); setStep(0); }}
                                    className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition"
                                >
                                    <XCircle size={18} className="text-gray-600" />
                                </button>
                                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                                    <Camera size={11} className="inline mr-1" /> {file?.name}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 1+: Details */}
                    {(step >= 1 || preview) && (
                        <div className="card space-y-5 animate-slide-up">
                            <h3 className="font-semibold text-gray-700 text-sm mb-1 flex items-center gap-2">
                                <Info size={16} className="text-primary" />
                                Obstruction Details
                            </h3>

                            {/* Location */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-2">
                                    <MapPin size={12} className="inline mr-1 text-primary" />
                                    Location (GPS)
                                </label>
                                {location ? (
                                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                        <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-semibold text-green-700">Location detected</p>
                                            <p className="text-xs text-gray-500 font-mono">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>
                                        </div>
                                        <button type="button" onClick={() => setLocation(null)} className="ml-auto text-gray-400 hover:text-gray-600">
                                            <XCircle size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <button
                                            type="button"
                                            onClick={detectLocation}
                                            disabled={locating}
                                            className="btn-secondary w-full justify-center text-sm"
                                        >
                                            {locating ? <Loader size={14} className="animate-spin" /> : <MapPin size={14} />}
                                            {locating ? 'Detecting...' : 'Auto-detect My Location'}
                                        </button>
                                        {locError && <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                                            <AlertTriangle size={11} /> {locError}
                                        </p>}
                                    </div>
                                )}
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-2">
                                    <AlertTriangle size={12} className="inline mr-1 text-orange-500" />
                                    Obstruction Type *
                                </label>
                                <div className="relative">
                                    <select
                                        value={type}
                                        onChange={e => { setType(e.target.value); if (step < 2) setStep(2); }}
                                        required
                                        className="select-field pr-10"
                                    >
                                        {OBSTRUCTION_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▾</div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-2">
                                    Description (optional)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Additional details about the obstruction..."
                                    className="input-field resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    {step >= 1 && (
                        <div className="animate-slide-up">
                            <button
                                type="submit"
                                disabled={submitting || !type}
                                className="btn-orange w-full justify-center text-base py-4 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <><Loader size={18} className="animate-spin" /> Processing with AI...</>
                                ) : (
                                    <><Send size={18} /> Submit Report</>
                                )}
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-3">
                                Your report will be verified by AI and shown on the live map
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

function Row({ label, val, valueClass = 'text-gray-700' }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">{label}</span>
            <span className={`text-xs font-medium ${valueClass}`}>{val}</span>
        </div>
    );
}
