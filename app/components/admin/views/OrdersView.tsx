import { User, CheckCircle, Clock, Flame, RotateCcw, X, Trash2, Calendar, ZoomIn } from 'lucide-react';

export const OrdersView = ({ 
    pedidosAgrupados, base, isDarkMode, eliminarPedidosGusto, eliminarUnidad,
    eliminarUnidadPorEstado, openCleanModal, avatarMap, setImageToView
}: any) => {
    
    return (
        <div className="pb-24 space-y-6">
            
            {/* CABECERA: BOTÓN DE LIMPIEZA AVANZADA (SINGLE BUTTON) */}
            <div className={`p-4 rounded-3xl border ${base.card} shadow-sm flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    <div className="bg-red-500/10 p-3 rounded-xl">
                        <Trash2 size={24} className="text-red-500"/>
                    </div>
                    <div>
                        <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Limpieza de Pedidos</h2>
                        <p className={`text-xs opacity-60 ${base.subtext}`}>Borrar por fecha, estado y reponer stock</p>
                    </div>
                </div>
                <button 
                    onClick={openCleanModal}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2 text-sm"
                >
                    <Calendar size={18} />
                    ABRIR HERRAMIENTA
                </button>
            </div>

            <div className="flex justify-between items-center mb-2 px-1">
                <h2 className="text-xl font-bold flex items-center gap-2"><User /> Pedidos por Usuario</h2>
            </div>

            {pedidosAgrupados.length === 0 ? (
                <div className={`p-8 rounded-3xl text-center border-2 border-dashed ${base.divider} opacity-50`}>
                    <p>No hay pedidos activos.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pedidosAgrupados.map((u: any) => {
                        const avatarUrl = avatarMap ? avatarMap[u.nombre.toLowerCase().trim()] : null;

                        return (
                        <div key={u.nombre} className={`p-4 rounded-2xl border ${base.card} shadow-sm animate-in fade-in slide-in-from-bottom-2`}>
                            <div className="flex justify-between items-start mb-3 border-b border-gray-200 dark:border-white/10 pb-2">
                                <div className="flex items-center gap-3">
                                    {/* AVATAR O ICONO */}
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (avatarUrl && setImageToView) setImageToView(avatarUrl);
                                        }}
                                        className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white overflow-hidden border border-white/10 ${avatarUrl ? 'bg-black cursor-pointer hover:opacity-80' : 'bg-neutral-500'}`}
                                    >
                                        {avatarUrl ? (
                                            <img src={avatarUrl} className="w-full h-full object-cover pointer-events-none" alt={u.nombre}/>
                                        ) : (
                                            <User size={20}/>
                                        )}
                                    </button>

                                    <h3 className="font-bold text-lg">{u.nombre}</h3>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold opacity-60 block">Total Pendiente</span>
                                    <span className="text-xl font-black">{u.totalPendienteGeneral}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {u.detalle.map((d: any) => (
                                    <div key={d.id} className={`flex flex-col p-3 rounded-xl ${isDarkMode ? 'bg-black/20' : 'bg-gray-50'}`}>
                                        <div className="font-bold text-sm mb-2 flex justify-between items-center">
                                            <span>{d.nombre}</span>
                                            {/* Botón de eliminación genérica */}
                                            <button 
                                                onClick={() => eliminarUnidad(u.nombre, d.id)}
                                                className="text-[10px] text-red-400 underline hover:text-red-600 opacity-60 hover:opacity-100"
                                            >
                                                Borrar (Auto)
                                            </button>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            {/* BOTÓN: ENTREGADAS */}
                                            {d.entregada > 0 && (
                                                <button 
                                                    onClick={() => eliminarUnidadPorEstado(u.nombre, d.id, 'entregado')}
                                                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 rounded-lg hover:bg-green-500 hover:text-white transition-all group"
                                                    title="Eliminar 1 entregada"
                                                >
                                                    <CheckCircle size={10}/> {d.entregada} Listas <X size={10} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"/>
                                                </button>
                                            )}

                                            {/* BOTÓN: EN HORNO */}
                                            {d.enHorno > 0 && (
                                                <button 
                                                    onClick={() => eliminarUnidadPorEstado(u.nombre, d.id, 'cocinando')}
                                                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-1 rounded-lg hover:bg-orange-500 hover:text-white transition-all group"
                                                    title="Eliminar 1 en horno"
                                                >
                                                    <Flame size={10}/> {d.enHorno} Horno <X size={10} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"/>
                                                </button>
                                            )}

                                            {/* BOTÓN: EN ESPERA */}
                                            {d.enEspera > 0 && (
                                                <button 
                                                    onClick={() => eliminarUnidadPorEstado(u.nombre, d.id, 'pendiente')}
                                                    className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border px-2 py-1 rounded-lg transition-all group ${isDarkMode ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-red-500 hover:border-red-500 hover:text-white' : 'bg-gray-200 border-gray-300 text-gray-600 hover:bg-red-500 hover:border-red-500 hover:text-white'}`}
                                                    title="Eliminar 1 en espera"
                                                >
                                                    <Clock size={10}/> {d.enEspera} Espera <X size={10} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"/>
                                                </button>
                                            )}
                                        </div>
                                        
                                        {d.oldestPending && (
                                            <div className="text-[9px] opacity-30 font-mono text-right mt-1">
                                                {new Date(d.oldestPending).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-white/5 flex justify-end">
                                <button 
                                    onClick={() => eliminarPedidosGusto(u.nombre)}
                                    className={`text-[10px] font-bold flex items-center gap-1 ${base.subtext} hover:text-red-500 transition-colors`}
                                >
                                    <RotateCcw size={12} /> Limpiar Pendientes
                                </button>
                            </div>
                        </div>
                    );})}
                </div>
            )}
        </div>
    );
};