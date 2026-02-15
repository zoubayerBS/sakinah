import React, { useState, useEffect } from 'react';
import { Database, Zap } from 'lucide-react';

export const DBStatusToast = () => {
    const [hit, setHit] = useState(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const handleHit = (e) => {
            setHit(e.detail);
            setShow(true);
            const timer = setTimeout(() => setShow(false), 3000);
            return () => clearTimeout(timer);
        };

        window.addEventListener('db-cache-hit', handleHit);
        return () => window.removeEventListener('db-cache-hit', handleHit);
    }, []);

    if (!show || !hit) return null;

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-[#1A1A1A] border border-white/10 text-white/90 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
                <div className="w-8 h-8 rounded-full bg-[#8B7355]/20 flex items-center justify-center">
                    <Database size={14} className="text-[#8B7355]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] opacity-50 font-bold uppercase tracking-wider">IndexedDB Proof</span>
                    <span className="text-xs font-medium">
                        {hit.type} {hit.id} chargé depuis le cache local <Zap size={10} className="inline ml-1 text-yellow-500 fill-yellow-500" />
                    </span>
                </div>
            </div>
        </div>
    );
};
