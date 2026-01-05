import { User, Shield, Lock, Unlock, Trash2, RotateCcw, Plus, ZoomIn } from 'lucide-react';

export const UsersView = ({ 
    base, newGuestName, setNewGuestName, addU, allUsersList, resetU, toggleB, eliminarUsuario, 
    tempMotivos, setTempMotivos, guardarMotivo, currentTheme, resetAllOrders,
    avatarMap, setImageToView // Nuevas props para foto y zoom
}: any) => {
    return (
        <div className="space-y-6">
            
            {/* FORMULARIO AGREGAR */}
            <div className={`p-4 rounded-3xl border ${base.card}`}>
                <h3 className="text-sm font-bold mb-3 uppercase opacity-70">Nuevo Invitado</h3>
                <div className="flex gap-2 items-center">
                    <input 
                        type="text" 
                        value={newGuestName} 
                        onChange={e => setNewGuestName(e.target.value)} 
                        placeholder="Nombre..." 
                        className={`flex-1 min-w-0 p-3 rounded-xl outline-none border ${base.input}`}
                    />
                    <button 
                        onClick={addU} 
                        className={`w-12 h-12 flex-shrink-0 rounded-xl font-bold flex items-center justify-center ${currentTheme.color} text-white shadow-lg active:scale-95`}
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>

            {/* LISTA USUARIOS */}
            <div className="grid gap-3">
                {allUsersList.map((u: any) => {
                    // Buscamos si hay foto para este usuario (normalizando minúsculas)
                    const avatarUrl = avatarMap ? avatarMap[u.nombre.toLowerCase().trim()] : null;

                    return (
                        <div key={u.nombre} className={`${base.card} rounded-2xl p-3 border flex items-center gap-3 ${u.bloqueado ? base.blocked : ''}`}>
                            
                            {/* AVATAR O INICIAL */}
                            <button 
                                type="button"
                                className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white overflow-hidden border border-white/10 cursor-pointer ${u.bloqueado ? 'bg-red-500' : (avatarUrl ? 'bg-black hover:opacity-80' : 'bg-gray-400')}`}
                                // Si hay foto, permitimos hacer zoom al hacer click
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(avatarUrl && setImageToView) setImageToView(avatarUrl);
                                }}
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} className="w-full h-full object-cover pointer-events-none" alt={u.nombre} />
                                ) : (
                                    u.nombre.charAt(0).toUpperCase()
                                )}
                            </button>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold truncate">{u.nombre}</h3>
                                    {u.origen === 'web' && <span className="text-[8px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">WEB</span>}
                                    {u.bloqueado && <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">BLOQ</span>}
                                </div>
                                <p className="text-[10px] opacity-50 flex items-center gap-1">
                                    {u.totalOrders > 0 ? `${u.totalOrders} pedidos` : 'Sin pedidos'}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-1 flex-shrink-0">
                                {/* BLOQUEAR / MOTIVO */}
                                <div className="flex flex-col items-end gap-1">
                                    <button onClick={() => toggleB(u)} className={`p-2 rounded-lg ${u.bloqueado ? 'bg-red-500 text-white' : base.buttonSec}`}>
                                        {u.bloqueado ? <Lock size={14}/> : <Unlock size={14}/>}
                                    </button>
                                    {u.bloqueado && (
                                        <input 
                                            type="text" 
                                            placeholder="Motivo..." 
                                            defaultValue={u.motivo_bloqueo || ''}
                                            onBlur={(e) => {
                                                const val = e.target.value;
                                                setTempMotivos({...tempMotivos, [u.nombre]: val});
                                                guardarMotivo(u.nombre, u);
                                            }}
                                            className="w-20 text-[10px] p-1 border rounded bg-white text-black"
                                        />
                                    )}
                                </div>

                                {/* RESETEAR PEDIDOS INDIVIDUAL */}
                                <button onClick={() => resetU(u.nombre)} className={`p-2 rounded-lg text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors`}>
                                    <RotateCcw size={16} />
                                </button>

                                {/* ELIMINAR USUARIO */}
                                <button onClick={() => eliminarUsuario(u.nombre, u)} className={`p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors`}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ZONA DE PELIGRO: RESET GLOBAL */}
            <div className={`p-4 rounded-3xl border border-red-500/30 bg-red-500/5 mt-8`}>
                <h3 className="text-red-500 font-bold text-xs uppercase mb-2 flex items-center gap-2">
                    <Shield size={14}/> Zona de Peligro
                </h3>
                <button 
                    onClick={resetAllOrders} 
                    className="w-full py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                    <Trash2 size={18} /> BORRAR TODOS LOS PEDIDOS
                </button>
                <p className="text-[10px] text-red-400 text-center mt-2 opacity-70">
                    Esto eliminará el historial de pedidos de todos los usuarios.
                </p>
            </div>
        </div>
    );
};