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

    // Clase común para botones dentro de la píldora (sin bordes, fondo transparente)
    const innerBtnClass = "p-2 rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center";
    const innerBtnSmallClass = "p-1.5 rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center";

    return (
        <div className={`fixed top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none`}>
            
            {/* LADO IZQUIERDO: LOGO Y USUARIOS (Ya es una píldora) */}
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
                
                {/* FILA 1: PÍLDORA DE CONFIGURACIÓN */}
                <div className={`flex items-center gap-1 p-1 rounded-full shadow-lg backdrop-blur-md border ${base.bar}`}>
                    {/* TEMA */}
                    <div className="relative">
                        <button onClick={() => setShowThemeSelector(!showThemeSelector)} className={`${innerBtnClass} ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            <Palette size={20} />
                        </button>
                        {showThemeSelector && (
                            <div className={`absolute top-12 right-0 p-3 rounded-2xl shadow-xl border grid grid-cols-5 gap-2 w-64 ${base.card} z-[100]`}>
                                {THEMES.map((t: any) => (
                                    <button key={t.name} onClick={() => changeTheme(t)} className={`w-8 h-8 rounded-full ${t.color} border-2 border-transparent hover:scale-110 transition-transform`} title={t.name}></button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* MODO OSCURO */}
                    <button onClick={toggleDarkMode} className={innerBtnClass}>
                        {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
                    </button>

                    {/* NOTIFICACIONES */}
                    <button onClick={toggleNotificaciones} className={`${innerBtnClass} ${notifEnabled ? '' : 'opacity-50'}`}>
                        {notifEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                    </button>
                    
                    {/* IDIOMA */}
                    <button onClick={rotarIdioma} className={`${innerBtnClass} font-bold text-[10px] w-9 h-9`}>
                        {lang.toUpperCase()}
                    </button>

                     {/* INSTALL PWA */}
                     {isInstallable && (
                        <button onClick={handleInstallClick} className={`${innerBtnClass} text-blue-500 animate-bounce`}>
                            <Download size={20} />
                        </button>
                    )}
                </div>

                {/* FILA 2: PÍLDORA DE VISTA Y NAVEGACIÓN */}
                <div className={`flex items-center gap-1 p-1 rounded-full shadow-lg backdrop-blur-md border ${base.bar}`}>
                    {/* HERRAMIENTAS DE ORDEN/VISTA */}
                    <button onClick={cycleTextSize} className={innerBtnSmallClass}>
                        <Type size={16}/>
                    </button>
                    <button onClick={toggleCompact} className={innerBtnSmallClass}>
                        {isCompact ? <Maximize2 size={16}/> : <Minimize2 size={16}/>}
                    </button>
                    <button onClick={toggleOrden} className={innerBtnSmallClass}>
                        {orden === 'estado' ? <ArrowUpNarrowWide size={16}/> : <ArrowDownAZ size={16}/>}
                    </button>

                    {/* SEPARADOR VISUAL */}
                    <div className="w-px h-4 bg-current opacity-20 mx-0.5"></div>

                    {/* NAVEGACIÓN */}
                    <Link href="/admin" className={`${innerBtnSmallClass} text-blue-500`}>
                        <Shield size={18}/>
                    </Link>

                    <button onClick={onLogout} className={`${innerBtnSmallClass} text-red-500`}>
                        <LogOut size={18}/>
                    </button>
                </div>
            </div>
        </div>
    );
};