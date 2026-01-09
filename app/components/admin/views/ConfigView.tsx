import { Lock, Save, Clock, Users, Type, MessageSquare } from 'lucide-react';

export const ConfigView = ({ 
    base, config, setConfig, isDarkMode, resetAllOrders, 
    newPass, setNewPass, confirmPass, setConfirmPass, changePass, 
    currentTheme, sessionDuration, setSessionDuration,
    updateTotalGuests
}: any) => {

    return (
        <div className="space-y-6 pb-10">
            <h2 className="text-2xl font-black opacity-80">Configuración</h2>

            {/* 1. CAPACIDAD DEL EVENTO */}
            <div className={`p-5 rounded-3xl border shadow-sm ${base.card}`}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Users className="text-blue-500" /> Capacidad del Evento
                </h3>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <label className="text-xs font-bold uppercase opacity-60 mb-1 block">Total Invitados Esperados</label>
                        <p className="text-[10px] opacity-50">Esto define el cálculo de "faltantes" en el panel de usuarios.</p>
                    </div>
                    <div className="w-24">
                        <input 
                            type="number" 
                            value={config.total_invitados || 0} 
                            onChange={(e) => updateTotalGuests(Number(e.target.value))} 
                            className={`w-full p-3 rounded-xl border outline-none text-center font-bold text-lg ${base.input}`} 
                        />
                    </div>
                </div>
            </div>

            {/* 2. MENSAJE DE BIENVENIDA */}
            <div className={`p-5 rounded-3xl border shadow-sm ${base.card}`}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <MessageSquare className="text-purple-500" /> Mensaje de Bienvenida
                </h3>
                <div className="space-y-3">
                    <div className="text-xs opacity-60 p-3 rounded-xl border border-dashed border-gray-500/30">
                        <p className="font-bold mb-1">Variables disponibles:</p>
                        <code className="text-[10px]">[nombre], [fecha], [hora], [pizzas]</code>
                    </div>
                    <textarea 
                        value={config.mensaje_bienvenida || ''} 
                        onChange={(e) => {
                            const val = e.target.value;
                            setConfig({...config, mensaje_bienvenida: val});
                        }}
                        className={`w-full p-4 rounded-xl border outline-none h-32 text-sm ${base.input}`} 
                        placeholder="Ej: Hola [nombre], bienvenido a mi cumple..."
                    />
                    <button 
                        onClick={async () => {
                            const { createClient } = require('@supabase/supabase-js');
                            const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
                            await supabase.from('configuracion_dia').update({ mensaje_bienvenida: config.mensaje_bienvenida }).eq('id', config.id);
                            alert("Mensaje guardado");
                        }}
                        className={`w-full py-3 rounded-xl font-bold ${base.buttonSec}`}
                    >
                        Guardar Mensaje
                    </button>
                </div>
            </div>

            {/* 3. CAMBIAR CONTRASEÑA */}
            <div className={`p-5 rounded-3xl border shadow-sm ${base.card}`}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Lock className="text-orange-500" /> Contraseña Admin
                </h3>
                <div className="space-y-3">
                    <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Nueva contraseña" className={`w-full p-3 rounded-xl border outline-none ${base.input}`} />
                    <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Confirmar contraseña" className={`w-full p-3 rounded-xl border outline-none ${base.input}`} />
                    
                    {/* BOTÓN ACTUALIZADO CON COLOR DEL TEMA */}
                    <button 
                        onClick={changePass} 
                        disabled={!newPass || newPass !== confirmPass} 
                        className={`w-full py-3 rounded-xl font-bold ${currentTheme.color} text-white disabled:opacity-50 transition-opacity`}
                    >
                        Actualizar Contraseña
                    </button>
                </div>
            </div>

            {/* 4. DURACIÓN SESIÓN */}
            <div className={`p-5 rounded-3xl border shadow-sm ${base.card}`}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Clock className="text-green-500" /> Sesión Admin
                </h3>
                <div className="flex gap-2">
                    {[1, 4, 12, 24].map(h => (
                        <button key={h} onClick={() => setSessionDuration(h * 60 * 60 * 1000)} className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${sessionDuration === h * 60 * 60 * 1000 ? 'bg-green-500 text-white border-green-500' : base.buttonSec}`}>
                            {h}h
                        </button>
                    ))}
                </div>
            </div>

            {/* 5. ZONA DE PELIGRO */}
            <div className={`p-5 rounded-3xl border border-red-500/30 bg-red-500/5`}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-500">
                    <Type className="rotate-180" /> Zona de Peligro
                </h3>
                <button onClick={resetAllOrders} className="w-full py-4 rounded-xl font-bold bg-red-600 text-white shadow-lg hover:bg-red-700 transition-colors">
                    REINICIAR TODOS LOS PEDIDOS
                </button>
                <p className="text-[10px] text-center mt-2 opacity-60">Esto borrará el historial de pedidos del día, pero mantendrá el menú e invitados.</p>
            </div>
        </div>
    );
};