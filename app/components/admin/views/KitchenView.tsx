import { useState, useEffect } from 'react';
import { Flame, Clock, CheckCircle, ChefHat, UtensilsCrossed, RotateCcw, Trash2, CheckSquare, Square } from 'lucide-react';

// HELPER PARA FORMATO TIEMPO
const formatTime = (seconds: number) => {
    if (seconds <= 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const KitchenView = ({ 
    metricas, base, isCompact, isDarkMode, currentTheme, 
    toggleCocinando, entregar, forceStopCooking, revertirEstado 
}: any) => {
    
    const [filter, setFilter] = useState<'all' | 'with_orders' | 'pending' | 'cooking' | 'ready'>('with_orders');
    
    // Estado para selección múltiple
    const [selectedOrders, setSelectedOrders] = useState<Record<string, string[]>>({});
    
    // ESTADO LOCAL PARA EL TIMER
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSelectOrder = (pizzaId: string, orderId: string) => {
        setSelectedOrders(prev => {
            const current = prev[pizzaId] || [];
            if (current.includes(orderId)) {
                return { ...prev, [pizzaId]: current.filter(id => id !== orderId) };
            } else {
                return { ...prev, [pizzaId]: [...current, orderId] };
            }
        });
    };

    const getFilterBtnClass = (isActive: boolean) => 
        `px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-colors ${
            isActive 
            ? `${currentTheme.color} text-white border-transparent shadow-md` 
            : base.buttonSec
        }`;

    const getStatusConfig = (item: any) => {
        const isPizza = item.tipo === 'pizza';
        return {
            textReady: isPizza ? 'EN HORNO' : 'PREPARANDO',
            textAction: isPizza ? 'Al Horno' : 'Cocinar',
            color: isPizza ? 'bg-red-600 border-red-600' : 'bg-orange-500 border-orange-500', 
            icon: isPizza ? <Flame size={isCompact ? 14 : 16} className={item.cocinando ? "animate-bounce" : ""} /> : <UtensilsCrossed size={isCompact ? 14 : 16} className={item.cocinando ? "animate-pulse" : ""} />
        };
    };

    const filteredMetrics = metricas.filter((p: any) => {
        const hasPending = p.totalPendientes > 0;
        const isReady = p.completas > 0;
        const isCooking = p.cocinando;
        const hasActivity = hasPending || isCooking || isReady;

        if (filter === 'all') return true; 
        if (filter === 'with_orders') return hasActivity; 
        if (filter === 'pending') return hasPending && !isCooking && !isReady;
        if (filter === 'cooking') return isCooking;
        if (filter === 'ready') return isReady;
        return true;
    });

    return (
        <div className="space-y-4 pb-24">
            {/* FILTROS SIEMPRE VISIBLES */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button onClick={() => setFilter('with_orders')} className={getFilterBtnClass(filter === 'with_orders')}>Con Pedidos</button>
                <button onClick={() => setFilter('all')} className={getFilterBtnClass(filter === 'all')}>Todas</button>
                <button onClick={() => setFilter('pending')} className={getFilterBtnClass(filter === 'pending')}>En Espera</button>
                <button onClick={() => setFilter('cooking')} className={getFilterBtnClass(filter === 'cooking')}>Cocinando</button>
                <button onClick={() => setFilter('ready')} className={getFilterBtnClass(filter === 'ready')}>Listas</button>
            </div>

            {/* CONTENIDO O MENSAJE VACÍO */}
            {filteredMetrics.length === 0 ? (
                <div className={`text-center py-20 opacity-50 ${base.subtext}`}>
                    <ChefHat size={40} className="mx-auto mb-2 opacity-30"/>
                    <p>No hay items en esta categoría</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filteredMetrics.map((p: any) => {
                        const statusConfig = getStatusConfig(p);
                        const pendingList = p.pedidosPendientes?.filter((o:any) => o.estado === 'pendiente') || [];
                        const cookingList = p.pedidosPendientes?.filter((o:any) => o.estado === 'cocinando') || [];
                        
                        const selection = selectedOrders[p.id] || [];
                        const hasSelection = selection.length > 0;

                        const selectedArePending = hasSelection && selection.every(id => pendingList.some((o:any) => o.id === id));
                        const selectedAreCooking = hasSelection && selection.every(id => cookingList.some((o:any) => o.id === id));

                        // CALCULO TIEMPO RESTANTE
                        let timeLeft = 0;
                        let progress = 0;
                        if (p.cocinando && p.cocinando_inicio) {
                            const startTime = new Date(p.cocinando_inicio).getTime();
                            const durationMs = (p.tiempo_coccion || 0) * 1000; 
                            const elapsed = now - startTime;
                            timeLeft = Math.max(0, (durationMs - elapsed) / 1000);
                            progress = p.tiempo_coccion > 0 ? ((p.tiempo_coccion - timeLeft) / p.tiempo_coccion) * 100 : 0;
                        }

                        return (
                            <div key={p.id} className={`${base.card} rounded-3xl border relative overflow-hidden transition-all ${p.cocinando ? 'ring-1 ring-opacity-20' : ''} ${isCompact ? 'p-3' : 'p-4'}`}>
                                {/* BARRA DE PROGRESO DE FONDO (COLOR DEL TEMA) */}
                                {p.cocinando && (
                                    <div className={`absolute top-0 left-0 bottom-0 ${currentTheme.color} opacity-10 transition-all duration-1000 ease-linear pointer-events-none`} style={{ width: `${progress}%` }}></div>
                                )}

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className={`font-black text-xl leading-none ${base.text}`}>{p.nombre}</h3>
                                            {p.cocinando && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs font-bold ${currentTheme.color} text-white px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1`}>
                                                        <Flame size={10} fill="white"/> {statusConfig.textReady}
                                                    </span>
                                                    <span className="text-xs font-mono font-bold opacity-60">
                                                        {formatTime(timeLeft)}
                                                    </span>
                                                </div>
                                            )}
                                            {!p.cocinando && <p className={`text-xs mt-1 ${base.subtext}`}>Lote de {p.target} u.</p>}
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-2xl font-black ${p.totalPendientes > 0 ? (isDarkMode ? 'text-white' : 'text-black') : 'text-gray-400'}`}>{p.totalPendientes}</span>
                                            {p.cocinando && <p className="text-[8px] uppercase font-bold opacity-50">Total</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        {/* EN ESPERA */}
                                        <div className={`p-2 rounded-xl border relative flex flex-col ${base.innerCard}`}>
                                            <div className="flex justify-between items-center mb-2 border-b border-gray-500/10 pb-1">
                                                <div className="flex items-center gap-1 text-gray-500 text-xs font-bold uppercase"><Clock size={12}/> Espera ({p.enEspera})</div>
                                                {p.enEspera > 0 && (
                                                    <button 
                                                        onClick={() => {
                                                            revertirEstado(p, 'cancelar_espera', selectedArePending ? selection : []);
                                                            setSelectedOrders(prev => ({...prev, [p.id]: []})); 
                                                        }} 
                                                        className="text-red-500 hover:bg-red-500/10 p-1 rounded transition-colors"
                                                        title={selectedArePending ? `Cancelar ${selection.length} seleccionados` : "Cancelar TODOS"}
                                                    >
                                                        <Trash2 size={14}/>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                                {pendingList.map((ord: any) => (
                                                    <div key={ord.id} onClick={() => handleSelectOrder(p.id, ord.id)} className={`text-xs p-1.5 rounded flex items-center justify-between cursor-pointer border ${selection.includes(ord.id) ? 'bg-blue-500/20 border-blue-500' : 'bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold">{ord.invitado_nombre}</span>
                                                            {ord.detalles_adicionales?.length > 0 && <span className="text-[10px] opacity-70 text-orange-500">+ {ord.detalles_adicionales.join(', ')}</span>}
                                                        </div>
                                                        {selection.includes(ord.id) ? <CheckSquare size={14} className="text-blue-500"/> : <Square size={14} className="opacity-30"/>}
                                                    </div>
                                                ))}
                                                {pendingList.length === 0 && <span className="text-[10px] opacity-30 italic">Vacío</span>}
                                            </div>
                                        </div>

                                        {/* EN HORNO */}
                                        <div className={`p-2 rounded-xl border relative flex flex-col ${p.cocinando ? `${currentTheme.color.replace('bg-', 'bg-opacity-10 bg-')} border-opacity-30 border-${currentTheme.color.replace('bg-', '')}` : base.innerCard}`}>
                                            <div className="flex justify-between items-center mb-2 border-b border-gray-500/10 pb-1">
                                                <div className={`flex items-center gap-1 text-xs font-bold uppercase ${p.cocinando ? currentTheme.text.replace('text-white', '') : 'text-gray-500'}`}>
                                                    <Flame size={12} className={p.cocinando ? 'animate-bounce' : ''}/> Horno ({p.enHorno})
                                                </div>
                                                {p.enHorno > 0 && (
                                                    <button 
                                                        onClick={() => {
                                                            revertirEstado(p, 'sacar_horno', selectedAreCooking ? selection : []);
                                                            setSelectedOrders(prev => ({...prev, [p.id]: []}));
                                                        }} 
                                                        className="text-gray-500 hover:bg-white/20 p-1 rounded transition-colors"
                                                        title={selectedAreCooking ? `Devolver ${selection.length} seleccionados` : "Devolver TODOS"}
                                                    >
                                                        <RotateCcw size={14}/>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                                {cookingList.map((ord: any) => (
                                                    <div key={ord.id} onClick={() => handleSelectOrder(p.id, ord.id)} className={`text-xs p-1.5 rounded flex items-center justify-between cursor-pointer border ${selection.includes(ord.id) ? 'bg-green-500/20 border-green-500' : 'bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold">{ord.invitado_nombre}</span>
                                                            {ord.detalles_adicionales?.length > 0 && <span className="text-[10px] opacity-70 text-orange-500">+ {ord.detalles_adicionales.join(', ')}</span>}
                                                        </div>
                                                        {selection.includes(ord.id) ? <CheckSquare size={14} className="text-green-500"/> : <Square size={14} className="opacity-30"/>}
                                                    </div>
                                                ))}
                                                {cookingList.length === 0 && <span className="text-[10px] opacity-30 italic">Vacío</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACCIONES */}
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => {
                                                toggleCocinando(p, selectedArePending ? selection : undefined);
                                                setSelectedOrders(prev => ({...prev, [p.id]: []}));
                                            }} 
                                            disabled={p.enEspera === 0}
                                            className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${p.enEspera > 0 ? (selectedArePending ? `${currentTheme.color} text-white shadow-lg` : `${currentTheme.color} text-white hover:brightness-110`) : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'}`}
                                        >
                                            {statusConfig.icon} {selectedArePending ? `COCINAR (${selection.length})` : `COCINAR (AUTO)`}
                                        </button>

                                        <button 
                                            onClick={() => {
                                                entregar(p, selectedAreCooking ? selection : undefined);
                                                setSelectedOrders(prev => ({...prev, [p.id]: []}));
                                            }} 
                                            disabled={p.enHorno === 0}
                                            className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${p.enHorno > 0 ? (selectedAreCooking ? `${currentTheme.color} text-white shadow-lg` : `${currentTheme.color} text-white hover:brightness-110`) : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'}`}
                                        >
                                            <CheckCircle size={14} /> {selectedAreCooking ? `ENTREGAR (${selection.length})` : `ENTREGAR (AUTO)`}
                                        </button>
                                    </div>

                                    <div className="flex gap-2 mt-2 justify-end">
                                        {p.cocinando && <button onClick={() => forceStopCooking(p.id)} className="px-3 py-1 rounded-lg border border-red-500/30 text-[10px] text-red-500 hover:bg-red-500/10">STOP FORZOSO</button>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};