import { Flame, CheckCircle, Clock, X, RotateCcw, Trash2, AlertCircle } from 'lucide-react';

export const KitchenView = ({ 
    metricas, base, isCompact, isDarkMode, currentTheme, 
    toggleCocinando, entregar, forceStopCooking, revertirEstado 
}: any) => {
    
    // Función auxiliar para calcular tiempo transcurrido
    const getTimeElapsed = (dateString: string) => {
        if(!dateString) return '';
        const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000);
        return `${diff} min`;
    };

    if (metricas.length === 0) return (<div className={`text-center py-20 opacity-50 ${base.subtext}`}>No hay items activos en el menú.</div>);

    return (
        <div className="pb-24 space-y-4">
            {metricas.map((p: any) => {
                const tienePendientes = p.totalPendientes > 0;
                
                // FILTRAR PEDIDOS CON EXTRAS (ADICIONALES)
                const ordersInWait = p.pedidosPendientes?.filter((o:any) => o.estado === 'pendiente') || [];
                const ordersInOven = p.pedidosPendientes?.filter((o:any) => o.estado === 'cocinando') || [];

                return (
                <div key={p.id} className={`relative overflow-hidden rounded-3xl border shadow-sm transition-all ${base.card} ${p.cocinando ? 'border-orange-500/50 ring-1 ring-orange-500/20' : ''}`}>
                    {/* Barra de progreso de lote */}
                    {p.cocinando && (<div className="absolute top-0 left-0 right-0 h-1 bg-orange-500 animate-pulse"></div>)}
                    
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className={`font-black text-2xl leading-none ${currentTheme.text}`}>{p.nombre}</h3>
                                <p className={`text-xs mt-1 ${base.subtext}`}>Lote de {p.target} unidades</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-3xl font-black ${p.totalPendientes > 0 ? (isDarkMode ? 'text-white' : 'text-black') : 'text-gray-400'}`}>{p.totalPendientes}</span>
                                <span className="text-[10px] uppercase font-bold block opacity-50">Pendientes</span>
                            </div>
                        </div>

                        {/* ESTADO ACTUAL */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            
                            {/* --- COLUMNA: EN ESPERA --- */}
                            <div className={`p-3 rounded-2xl border relative flex flex-col ${base.innerCard}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Clock size={16}/> <span className="text-xs font-bold uppercase">En Espera</span>
                                    </div>
                                    <p className="text-2xl font-black leading-none">{p.enEspera}</p>
                                </div>
                                
                                {/* DETALLE DE EXTRAS EN ESPERA */}
                                <div className="space-y-1 mt-1 max-h-32 overflow-y-auto pr-1">
                                    {ordersInWait.map((ord: any) => (
                                        (ord.detalles_adicionales && ord.detalles_adicionales.length > 0) ? (
                                            <div key={ord.id} className="text-[10px] bg-red-500/10 border border-red-500/20 p-1.5 rounded flex flex-col">
                                                <span className="font-bold text-red-500">{ord.invitado_nombre}</span>
                                                <span className="opacity-80">+ {ord.detalles_adicionales.join(', + ')}</span>
                                            </div>
                                        ) : null
                                    ))}
                                </div>

                                {/* BOTÓN CANCELAR ESPERA */}
                                {p.enEspera > 0 && (
                                    <button 
                                        onClick={() => revertirEstado(p, 'cancelar_espera')}
                                        className="absolute bottom-2 right-2 p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                        title="Eliminar pedidos en espera"
                                    >
                                        <Trash2 size={14}/>
                                    </button>
                                )}
                            </div>

                            {/* --- COLUMNA: EN HORNO --- */}
                            <div className={`p-3 rounded-2xl border relative flex flex-col ${p.cocinando ? 'bg-orange-500 text-white border-orange-600' : base.innerCard}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`flex items-center gap-2 ${p.cocinando ? 'text-white/80' : 'text-gray-500'}`}>
                                        <Flame size={16} className={p.cocinando ? 'animate-bounce' : ''}/> <span className="text-xs font-bold uppercase">En Horno</span>
                                    </div>
                                    <p className="text-2xl font-black leading-none">{p.enHorno}</p>
                                </div>
                                {p.cocinando && p.cocinando_inicio && <span className="text-[10px] font-mono opacity-80 absolute top-3 right-10">{getTimeElapsed(p.cocinando_inicio)}</span>}
                                
                                {/* DETALLE DE EXTRAS EN HORNO */}
                                <div className="space-y-1 mt-1 max-h-32 overflow-y-auto pr-1">
                                    {ordersInOven.map((ord: any) => (
                                        (ord.detalles_adicionales && ord.detalles_adicionales.length > 0) ? (
                                            <div key={ord.id} className={`text-[10px] p-1.5 rounded flex flex-col border ${p.cocinando ? 'bg-white/20 border-white/30 text-white' : 'bg-orange-500/10 border-orange-500/20 text-orange-600'}`}>
                                                <span className="font-bold">{ord.invitado_nombre}</span>
                                                <span className="opacity-90">+ {ord.detalles_adicionales.join(', + ')}</span>
                                            </div>
                                        ) : null
                                    ))}
                                </div>

                                {/* BOTÓN VOLVER ATRÁS */}
                                {p.enHorno > 0 && (
                                    <button 
                                        onClick={() => revertirEstado(p, 'sacar_horno')}
                                        className="absolute bottom-2 right-2 p-1.5 bg-white/20 text-white rounded-lg hover:bg-white/40 transition-colors"
                                        title="Devolver a espera"
                                    >
                                        <RotateCcw size={14}/>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* ACCIONES */}
                        <div className="flex gap-2">
                            {/* BOTÓN COCINAR */}
                            <button 
                                onClick={() => toggleCocinando(p, 'una')} 
                                disabled={p.enEspera === 0}
                                className={`flex-1 py-4 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${p.enEspera > 0 ? 'bg-neutral-800 text-white hover:bg-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                                <Flame size={20} />
                                <span>AL HORNO (1)</span>
                            </button>

                            {/* BOTÓN ENTREGAR */}
                            <button 
                                onClick={() => entregar(p, 'una')} 
                                disabled={p.enHorno === 0}
                                className={`flex-1 py-4 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${p.enHorno > 0 ? 'bg-green-600 text-white shadow-lg shadow-green-500/30 hover:bg-green-500' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                                <CheckCircle size={20} />
                                <span>LISTA (1)</span>
                            </button>
                        </div>
                        
                        {/* Botones secundarios masivos */}
                         <div className="flex gap-2 mt-2">
                            <button onClick={() => toggleCocinando(p, 'todas')} disabled={p.enEspera === 0} className="flex-1 py-2 text-[10px] font-bold uppercase opacity-50 hover:opacity-100">Todo al Horno</button>
                            {p.cocinando && <button onClick={() => forceStopCooking(p.id)} className="flex-1 py-2 text-[10px] font-bold uppercase text-red-500 opacity-50 hover:opacity-100">Stop Forzoso</button>}
                            <button onClick={() => entregar(p, 'todas')} disabled={p.enHorno === 0} className="flex-1 py-2 text-[10px] font-bold uppercase opacity-50 hover:opacity-100">Todo Listo</button>
                         </div>

                    </div>
                </div>
            )})}
        </div>
    );
};