import { Bell, BellOff, Users, Type, ArrowUpNarrowWide, ArrowDownAZ, TrendingUp, Minimize2, Maximize2, Sun, Moon, Palette, Download, Lock, LogOut, User } from 'lucide-react';
import Link from 'next/link';

export const TopBar = ({ 
    base, notifEnabled, toggleNotificaciones, rotarIdioma, lang, onlineUsers, config, 
    isDarkMode, getBtnClass, cycleTextSize, orden, toggleOrden, isCompact, toggleCompact, 
    toggleDarkMode, showThemeSelector, setShowThemeSelector, THEMES, changeTheme, isInstallable, handleInstallClick,
    onLogout, userAvatar, onAvatarClick // <--- RECIBIMOS LA FUNCIÓN DE CLICK
}: any) => {
    return (
      <div className="fixed top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
        
        <div className={`p-1 rounded-full border shadow-lg flex gap-1 pointer-events-auto items-center ${base.bar}`}>
            
            {/* FOTO DE PERFIL CLICKABLE */}
            <button 
                onClick={onAvatarClick} // <--- CLICK AQUÍ
                className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-black/20 flex-shrink-0 ml-1 flex items-center justify-center active:scale-90 transition-transform"
            >
                {userAvatar ? (
                    <img src={userAvatar} alt="Yo" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-current opacity-50"><User size={16}/></div>
                )}
            </button>

            <button onClick={toggleNotificaciones} className={getBtnClass(notifEnabled)}>
                {notifEnabled ? <Bell size={18} /> : <BellOff size={18} />}
            </button>
            <button onClick={rotarIdioma} className={getBtnClass(false) + " font-bold text-[10px] w-8 h-8 border border-current/20 flex items-center justify-center"}>
                {lang.toUpperCase()}
            </button>
            <div className="flex items-center justify-center gap-1 px-2 rounded-full text-xs font-bold transition-all">
                <Users size={14} className={isDarkMode ? "text-green-400" : "text-green-700"} />
                <span className={isDarkMode ? 'text-white' : 'text-black'}>
                    {onlineUsers}
                </span>
            </div>
        </div>

        <div className="flex flex-col items-end gap-2 pointer-events-none">
          <div className={`p-1 rounded-full border shadow-lg flex gap-1 pointer-events-auto ${base.bar} relative z-50`}>
              <button onClick={cycleTextSize} className={getBtnClass(false)}><Type size={20} /></button>
              <button onClick={toggleOrden} className={getBtnClass(false)}>{orden === 'estado' ? <ArrowUpNarrowWide size={20} /> : (orden === 'nombre' ? <ArrowDownAZ size={20} /> : <TrendingUp size={20}/>)}</button>
              <button onClick={toggleCompact} className={getBtnClass(!isCompact)}>{!isCompact ? <Minimize2 size={20}/> : <Maximize2 size={20}/>}</button>
              <button onClick={toggleDarkMode} className={getBtnClass(false)}>{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
              <button onClick={() => setShowThemeSelector(!showThemeSelector)} className={getBtnClass(false)}><Palette size={20} /></button>
              {showThemeSelector && (<div className="absolute top-14 right-0 bg-black/90 backdrop-blur p-2 rounded-xl flex gap-2 animate-in fade-in border border-white/20 shadow-xl">{THEMES.map((theme: any) => (<button key={theme.name} onClick={() => changeTheme(theme)} className={`w-6 h-6 rounded-full ${theme.color} border-2 border-white ring-2 ring-transparent hover:scale-110 transition-transform`}></button>))}</div>)}
          </div>
          <div className="flex items-center gap-2 pointer-events-auto relative z-40">
              {isInstallable && (<button onClick={handleInstallClick} className={`${base.bar} p-2 rounded-full border shadow-lg animate-bounce`}><Download size={20} /></button>)}
              <button onClick={onLogout} className={`${base.bar} p-2 rounded-full border shadow-lg text-red-500 hover:bg-red-500/10`}><LogOut size={20} /></button>
              <Link href="/admin" className={`${base.bar} p-2 rounded-full border shadow-lg`}><Lock size={20} /></Link>
          </div>
        </div>
      </div>
    );
};