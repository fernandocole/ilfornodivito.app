import { useState } from 'react';
import { Flame, Clock, CheckCircle, ChefHat, UtensilsCrossed, Zap, AlertTriangle, XCircle, RotateCcw, Trash2, CheckSquare, Square } from 'lucide-react';
import { CookingTimer } from '../../ui/CookingTimer';

export const KitchenView = ({ 
    metricas, base, isCompact, isDarkMode, currentTheme, 
    toggleCocinando, entregar, forceStopCooking, revertirEstado 
}: any) => {
    
    const [filter, setFilter] = useState<'all' | 'with_orders' | 'pending' | 'cooking' | 'ready'>('with_orders');
    
    // Estado para selección múltiple: { [pizzaId]: [pedidoId1, pedidoId2] }
    const [selectedOrders, setSelectedOrders] = useState<Record<string, string[]>>({});

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

    // Función auxiliar para calcular tiempo transcurrido
    const getTimeElapsed = (dateString: string) => {
        if(!dateString) return '';
        const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000);
        return `${diff} min`;
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

    if (filteredMetrics.length === 0) return (
        <div className={`text-center py-20 opacity-50 ${base.subtext}`}>
            <ChefHat size={40} className="mx-auto mb-2 opacity-30"/>
            <p>No hay items en esta categoría</p>
        </div>
    );

    return (
        <div className="space-y-4 pb-24">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button onClick={() => setFilter('with_orders')} className={getFilterBtnClass(filter === 'with_orders')}>Con Pedidos</button>
                <button onClick={() => setFilter('all')} className={getFilterBtnClass(filter === 'all')}>Todas</button>
                <button onClick={() => setFilter('pending')} className={getFilterBtnClass(filter === 'pending')}>En Espera</button>
                <button onClick={() => setFilter('cooking')} className={getFilterBtnClass(filter === 'cooking')}>Cocinando</button>
                <button onClick={() => setFilter('ready')} className={getFilterBtnClass(filter === 'ready')}>Listas</button>
            </div>

            <div className="grid gap-3">
                {filteredMetrics.map((p: any) => {
                    const statusConfig = getStatusConfig(p);
                    const pendingList = p.pedidosPendientes?.filter((o:any) => o.estado === 'pendiente') || [];
                    const cookingList = p.pedidosPendientes?.filter((o:any) => o.estado === 'cocinando') || [];
                    
                    const selection = selectedOrders[p.id] || [];
                    const hasSelection = selection.length > 0;

                    // Verificar selección para habilitar botones contextualmente
                    const selectedArePending = hasSelection && selection.every(id => pendingList.some((o:any) => o.id === id));
                    const selectedAreCooking = hasSelection && selection.every(id => cookingList.some((o:any) => o.id === id));

                    return (
                        <div key={p.id} className={`${base.card} rounded-3xl border relative overflow-hidden transition-all ${p.cocinando ? 'border-orange-500/50 ring-1 ring-orange-500/20' : ''} ${isCompact ? 'p-3' : 'p-4'}`}>
                             {/* Barra de progreso */}
                             {p.cocinando && (<div className="absolute top-0 left-0 right-0 h-1 bg-orange-500 animate-pulse"></div>)}

                             <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className={`font-black text-xl leading-none ${currentTheme.text}`}>{p.nombre}</h3>
                                    <p className={`text-xs mt-1 ${base.subtext}`}>Lote de {p.target} u.</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-2xl font-black ${p.totalPendientes > 0 ? (isDarkMode ? 'text-white' : 'text-black') : 'text-gray-400'}`}>{p.totalPendientes}</span>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                {/* EN ESPERA */}
                                <div className={`p-2 rounded-xl border relative flex flex-col ${base.innerCard}`}>
                                    <div className="flex justify-between items-center mb-2 border-b border-gray-500/10 pb-1">
                                        <div className="flex items-center gap-1 text-gray-500 text-xs font-bold uppercase"><Clock size={12}/> Espera ({p.enEspera})</div>
                                        {p.enEspera > 0 && <button onClick={() => revertirEstado(p, 'cancelar_espera')} className="text-red-500 hover:bg-red-500/10 p-1 rounded"><Trash2 size={12}/></button>}
                                    </div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                                        {pendingList.map((ord: any) => (
                                            <div key={ord.id} onClick={() => handleSelectOrder(p.id, ord.id)} className={`text-xs p-1.5 rounded flex items-center justify-between cursor-pointer border ${selection.includes(ord.id) ? 'bg-blue-500/20 border-blue-500' : 'bg-transparent border-transparent hover:bg-black/5'}`}>
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
                                <div className={`p-2 rounded-xl border relative flex flex-col ${p.cocinando ? 'bg-orange-500/10 border-orange-500/30' : base.innerCard}`}>
                                    <div className="flex justify-between items-center mb-2 border-b border-gray-500/10 pb-1">
                                        <div className={`flex items-center gap-1 text-xs font-bold uppercase ${p.cocinando ? 'text-orange-500' : 'text-gray-500'}`}>
                                            <Flame size={12} className={p.cocinando ? 'animate-bounce' : ''}/> Horno ({p.enHorno})
                                        </div>
                                        {p.cocinando && p.cocinando_inicio && <span className="text-[10px] font-mono opacity-80">{getTimeElapsed(p.cocinando_inicio)}</span>}
                                        {p.enHorno > 0 && <button onClick={() => revertirEstado(p, 'sacar_horno')} className="text-gray-500 hover:bg-white/20 p-1 rounded"><RotateCcw size={12}/></button>}
                                    </div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                                        {cookingList.map((ord: any) => (
                                            <div key={ord.id} onClick={() => handleSelectOrder(p.id, ord.id)} className={`text-xs p-1.5 rounded flex items-center justify-between cursor-pointer border ${selection.includes(ord.id) ? 'bg-green-500/20 border-green-500' : 'bg-transparent border-transparent hover:bg-black/5'}`}>
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
                                    onClick={() => toggleCocinando(p, selectedArePending ? selection : undefined)} 
                                    disabled={p.enEspera === 0}
                                    className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${p.enEspera > 0 ? (selectedArePending ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-white hover:bg-black') : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                >
                                    {statusConfig.icon} {selectedArePending ? `COCINAR SELECCIÓN (${selection.length})` : `COCINAR (AUTO)`}
                                </button>

                                <button 
                                    onClick={() => entregar(p, selectedAreCooking ? selection : undefined)} 
                                    disabled={p.enHorno === 0}
                                    className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${p.enHorno > 0 ? (selectedAreCooking ? 'bg-green-600 text-white' : 'bg-green-600 text-white hover:bg-green-500') : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                >
                                    <CheckCircle size={14} /> {selectedAreCooking ? `ENTREGAR SELECCIÓN (${selection.length})` : `ENTREGAR (AUTO)`}
                                </button>
                             </div>

                             {/* ACCIONES SECUNDARIAS */}
                             <div className="flex gap-2 mt-2 justify-end">
                                {p.cocinando && <button onClick={() => forceStopCooking(p.id)} className="px-3 py-1 rounded-lg border border-red-500/30 text-[10px] text-red-500 hover:bg-red-500/10">STOP FORZOSO</button>}
                             </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};