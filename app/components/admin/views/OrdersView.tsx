import { Trash2, CheckCircle, Clock, Search, ChevronDown, ChevronUp, AlertTriangle, User } from 'lucide-react';
import { useState } from 'react';

export const OrdersView = ({
    pedidosAgrupados, base, isDarkMode, eliminarPedidosGusto, resetAllOrders,
    eliminarUnidad, eliminarUnidadPorEstado, cleanOrdersByState, openCleanModal,
    avatarMap, setImageToView, usersList
}: any) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedUser, setExpandedUser] = useState<string | null>(null);

    const filtered = pedidosAgrupados.filter((u: any) => 
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleExpand = (name: string) => {
        setExpandedUser(expandedUser === name ? null : name);
    };

    return (
        <div className="space-y-6 pb-20">
            {/* BUSCADOR */}
            <div className={`p-3 rounded-2xl border flex items-center gap-3 ${base.inputContainer} shadow-sm sticky top-0 z-10 backdrop-blur-md bg-opacity-90`}>
                <Search size={20} className="opacity-40" />
                <input 
                    type="text" 
                    placeholder="Buscar invitado..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`flex-1 bg-transparent outline-none text-sm font-medium ${base.text}`}
                />
            </div>

            {/* LISTA DE PEDIDOS */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <p>No hay pedidos activos</p>
                    </div>
                ) : (
                    filtered.map((usuario: any) => {
                        const isExpanded = expandedUser === usuario.nombre;
                        const avatarUrl = avatarMap[usuario.nombre.toLowerCase().trim()];

                        return (
                            <div key={usuario.nombre} className={`rounded-3xl border transition-all duration-300 overflow-hidden ${base.card} ${isExpanded ? 'shadow-md ring-1 ring-gray-200 dark:ring-gray-700' : 'shadow-sm'}`}>
                                {/* CABECERA USUARIO */}
                                <div onClick={() => toggleExpand(usuario.nombre)} className="p-4 flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div onClick={(e) => { e.stopPropagation(); if(avatarUrl) setImageToView(avatarUrl); }} className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-800 flex-shrink-0 bg-gray-200 dark:bg-gray-800">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} className="w-full h-full object-cover" alt={usuario.nombre}/>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-30"><User size={20}/></div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight">{usuario.nombre}</h3>
                                            <div className="flex items-center gap-2 text-xs opacity-60 font-medium">
                                                {usuario.totalEnHorno > 0 && <span className="text-orange-500 flex items-center gap-1"><Clock size={10}/> {usuario.totalEnHorno} en horno</span>}
                                                {usuario.totalEnEspera > 0 && <span>{usuario.totalEnEspera} en espera</span>}
                                                {usuario.totalPendienteGeneral === 0 && <span className="text-green-500 flex items-center gap-1"><CheckCircle size={10}/> Todo entregado</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={16} className="opacity-50"/>
                                    </div>
                                </div>

                                {/* DETALLE EXPANDIBLE */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                                        <div className={`h-px w-full mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}></div>
                                        <div className="space-y-3">
                                            {usuario.detalle.map((item: any) => (
                                                <div key={item.id} className="flex justify-between items-start text-sm">
                                                    <div className="flex-1">
                                                        <p className="font-bold flex items-center gap-2">
                                                            {item.nombre}
                                                            {item.adicionales.length > 0 && <span className="text-[9px] bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">EXTRA</span>}
                                                        </p>
                                                        {item.adicionales.length > 0 && <p className="text-xs opacity-60 italic">+ {item.adicionales.join(', ')}</p>}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        {item.entregada > 0 && <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">{item.entregada} entregadas</span>}
                                                        {item.enHorno > 0 && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">{item.enHorno} en horno</span>
                                                                <button onClick={() => eliminarUnidadPorEstado(usuario.nombre, item.id, 'cocinando')} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                                                            </div>
                                                        )}
                                                        {item.enEspera > 0 && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold opacity-50 bg-gray-500/10 px-2 py-0.5 rounded-full">{item.enEspera} en espera</span>
                                                                <button onClick={() => eliminarUnidadPorEstado(usuario.nombre, item.id, 'pendiente')} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                                                            </div>
                                                        )}
                                                        <div className="flex gap-2 mt-1">
                                                             <button onClick={() => eliminarPedidosGusto(usuario.nombre, item.id)} className="text-[10px] text-red-500 underline opacity-60 hover:opacity-100">Borrar Pendientes</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* HERRAMIENTA DE LIMPIEZA - SIMPLIFICADA */}
            <div className={`p-6 rounded-3xl border ${base.card} flex flex-col items-center text-center shadow-sm`}>
                <button 
                    onClick={openCleanModal}
                    className="bg-red-500/10 text-red-500 border border-red-500/50 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                >
                    <Trash2 size={20} /> Limpieza de pedidos
                </button>
                <p className="text-[10px] opacity-50 mt-3 font-medium">
                    Borrar por fecha, estado y usuario.
                </p>
            </div>
        </div>
    );
};