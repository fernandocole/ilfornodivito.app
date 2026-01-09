import { 
    Users, Bell, BellOff, Languages, Shield, LogOut, Sun, Moon, 
    Maximize2, Minimize2, ArrowUpNarrowWide, ArrowDownAZ, Type, 
    Palette, Download, User 
} from 'lucide-react';
import Link from 'next/link';

export const TopBar = ({ 
    base, notifEnabled, toggleNotificaciones, rotarIdioma, lang, onlineUsers, config, 
    isDarkMode, getBtnClass, cycleTextSize, orden, toggleOrden, 
    isCompact, toggleCompact, toggleDarkMode, showThemeSelector, setShowThemeSelector, 
    THEMES, changeTheme, isInstallable, handleInstallClick, onLogout, userAvatar, onAvatarClick 
}: any) => {

    return (
        <div className={`fixed top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none`}>
            
            {/* LADO IZQUIERDO: LOGO Y USUARIOS */}
            <div className={`p-2 rounded-full shadow-lg backdrop-blur-md border flex items-center gap-3 pointer-events-auto cursor-pointer ${base.bar}`} onClick={onAvatarClick}>
                {userAvatar ? (
                    <img src={userAvatar} className="w-8 h-8 rounded-full object-cover border border-white/20" alt="Avatar" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User size={16} className="opacity-50"/>
                    </div>
                )}
                <div className="leading-tight pr-2">
                    <h1 className="font-bold text-xs">Il Forno di Vito</h1>
                    <p className="text-[10px] opacity-70 flex items-center gap-1">
                        <Users size={10} className="text-green-500 animate-pulse"/> {onlineUsers} / {config.total_invitados}
                    </p>
                </div>
            </div>

            {/* LADO DERECHO: HERRAMIENTAS */}
            <div className="flex flex-col items-end gap-2 pointer-events-auto">
                
                {/* FILA 1: HERRAMIENTAS DE VISUALIZACIÓN */}
                <div className="flex gap-2">
                    {/* TEMA */}
                    <div className="relative">
                        <button onClick={() => setShowThemeSelector(!showThemeSelector)} className={`p-2 rounded-full border shadow-lg ${base.bar} ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            <Palette size={18} />
                        </button>
                        {showThemeSelector && (
                            <div className={`absolute top-12 right-0 p-3 rounded-2xl shadow-xl border grid grid-cols-5 gap-2 w-64 ${base.card}`}>
                                {THEMES.map((t: any) => (
                                    <button key={t.name} onClick={() => changeTheme(t)} className={`w-8 h-8 rounded-full ${t.color} border-2 border-transparent hover:scale-110 transition-transform`} title={t.name}></button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* MODO OSCURO */}
                    <button onClick={toggleDarkMode} className={`p-2 rounded-full border shadow-lg ${base.bar}`}>
                        {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
                    </button>

                    {/* NOTIFICACIONES */}
                    <button onClick={toggleNotificaciones} className={`p-2 rounded-full border shadow-lg ${base.bar} ${notifEnabled ? 'text-yellow-500' : 'opacity-50'}`}>
                        {notifEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                    </button>
                    
                    {/* IDIOMA */}
                    <button onClick={rotarIdioma} className={`p-2 rounded-full border shadow-lg font-bold text-[10px] w-9 h-9 flex items-center justify-center ${base.bar}`}>
                        {lang.toUpperCase()}
                    </button>

                     {/* INSTALL PWA (Si disponible) */}
                     {isInstallable && (
                        <button onClick={handleInstallClick} className={`p-2 rounded-full border shadow-lg text-blue-500 ${base.bar} animate-bounce`}>
                            <Download size={18} />
                        </button>
                    )}
                </div>

                {/* FILA 2: FILTROS EXTRA (Opcionales, ocultos en móvil pequeño si se desea) y ACCIONES PRINCIPALES */}
                <div className="flex gap-2">
                    {/* HERRAMIENTAS DE ORDEN/VISTA (Pequeñas) */}
                    <div className="flex gap-2 mr-2">
                        <button onClick={cycleTextSize} className={`p-1.5 rounded-full border shadow-lg ${base.bar}`}>
                            <Type size={16}/>
                        </button>
                        <button onClick={toggleCompact} className={`p-1.5 rounded-full border shadow-lg ${base.bar}`}>
                            {isCompact ? <Maximize2 size={16}/> : <Minimize2 size={16}/>}
                        </button>
                        <button onClick={toggleOrden} className={`p-1.5 rounded-full border shadow-lg ${base.bar}`}>
                            {orden === 'estado' ? <ArrowUpNarrowWide size={16}/> : <ArrowDownAZ size={16}/>}
                        </button>
                    </div>

                    {/* --- BOTONES DE NAVEGACIÓN (TAMAÑO ADMIN) --- */}
                    
                    {/* 1. CAMBIO A ADMIN (IZQUIERDA) */}
                    <Link href="/admin" className={`p-1.5 rounded-full border shadow-lg flex items-center justify-center ${base.bar} text-blue-500`}>
                        <Shield size={18}/>
                    </Link>

                    {/* 2. CERRAR SESIÓN (DERECHA) */}
                    <button onClick={onLogout} className={`p-1.5 rounded-full border shadow-lg flex items-center justify-center ${base.bar} text-red-500`}>
                        <LogOut size={18}/>
                    </button>
                </div>
            </div>
        </div>
    );
};