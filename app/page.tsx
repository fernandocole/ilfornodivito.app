'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  User, ArrowRight, Lock, AlertCircle, X, PartyPopper, Star, Clock, Eye, EyeOff, Crown, Shield, Globe, Languages, Camera, Edit2, Check, Minus, Plus, Maximize2, ChefHat, Flame, Pizza, Utensils
} from 'lucide-react';
import Link from 'next/link';

import { dictionary } from './utils/dictionary';
import { OnboardingOverlay } from './components/guest/OnboardingOverlay';
import { TopBar } from './components/guest/TopBar';
import { FoodCard } from './components/guest/FoodCard';
import { BottomSheet } from './components/guest/BottomSheet';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const THEMES = [
  { name: 'Carbone', color: 'bg-neutral-600', gradient: 'from-neutral-700 to-neutral-900', border: 'border-neutral-600/40', text: 'text-neutral-400' },
  { name: 'Turquesa', color: 'bg-cyan-600', gradient: 'from-cyan-600 to-teal-900', border: 'border-cyan-600/40', text: 'text-cyan-400' },
  { name: 'Pistacho', color: 'bg-lime-600', gradient: 'from-lime-600 to-green-900', border: 'border-lime-600/40', text: 'text-lime-400' },
  { name: 'Fuego', color: 'bg-red-600', gradient: 'from-red-600 to-rose-900', border: 'border-red-600/40', text: 'text-red-500' },
  { name: 'Violeta', color: 'bg-violet-600', gradient: 'from-violet-600 to-purple-900', border: 'border-violet-600/40', text: 'text-violet-400' },
  { name: 'Insta', color: 'bg-pink-600', gradient: 'from-purple-600 via-pink-600 to-orange-500', border: 'border-pink-600/40', text: 'text-pink-500' },
  { name: 'Aurora', color: 'bg-indigo-600', gradient: 'from-blue-500 via-indigo-500 to-purple-500', border: 'border-indigo-600/40', text: 'text-indigo-400' },
  { name: 'Sunset', color: 'bg-orange-500', gradient: 'from-rose-500 via-orange-500 to-yellow-500', border: 'border-orange-500/40', text: 'text-orange-500' },
  { name: 'Oceanic', color: 'bg-cyan-600', gradient: 'from-cyan-500 via-blue-600 to-indigo-600', border: 'border-cyan-600/40', text: 'text-cyan-500' },
  { name: 'Berry', color: 'bg-fuchsia-600', gradient: 'from-fuchsia-600 via-purple-600 to-pink-600', border: 'border-fuchsia-600/40', text: 'text-fuchsia-500' },
];

type LangType = 'es' | 'en' | 'it';
type MensajeTipo = { texto: string, tipo: 'info' | 'alerta' | 'exito' };

const landingTexts: Record<string, { sub: string, btn: string, admin: string }> = {
    es: { sub: "¡Espero que la pases lindo hoy!", btn: "Invitados de Honor", admin: "Acceso Admin" },
    en: { sub: "Hope you have a great time today!", btn: "Guests of Honor", admin: "Admin Access" },
    it: { sub: "Spero che ti diverta oggi!", btn: "Ospiti d'Onore", admin: "Accesso Admin" }
};

const getCookingText = (tipo: string, context: 'ing' | 'ed' | 'short' = 'ing') => {
    const isPizza = tipo === 'pizza';
    if (context === 'ing') return isPizza ? 'al horno' : 'en preparación';
    if (context === 'ed') return isPizza ? 'horneada' : 'lista';
    if (context === 'short') return isPizza ? 'Horno' : 'Cocina';
    return isPizza ? 'cocinando' : 'preparando';
};

const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.readAsDataURL(file);
        reader.onload = (event) => { 
            const img = new Image(); 
            img.src = event.target?.result as string; 
            img.onload = () => { 
                const canvas = document.createElement('canvas'); 
                const TARGET_SIZE = 400; 
                canvas.width = TARGET_SIZE; 
                canvas.height = TARGET_SIZE; 
                const ctx = canvas.getContext('2d');
                if (!ctx) { reject(new Error('Canvas error')); return; }
                const minSide = Math.min(img.width, img.height);
                const sx = (img.width - minSide) / 2;
                const sy = (img.height - minSide) / 2;
                ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, TARGET_SIZE, TARGET_SIZE);
                canvas.toBlob((blob) => { if(blob) resolve(blob); else reject(new Error('Canvas error')); }, 'image/jpeg', 0.85); 
            }; 
        }; 
        reader.onerror = (error) => reject(error);
    });
};

export default function VitoPizzaApp() {
  const [lang, setLang] = useState<LangType>('es');
  // @ts-ignore
  const t = dictionary[lang];

  // --- ESTADOS ---
  const [flowStep, setFlowStep] = useState<'loading' | 'landing' | 'name' | 'password' | 'onboarding' | 'app'>('loading');
  const [guestPassInput, setGuestPassInput] = useState(''); 
  const [showPassword, setShowPassword] = useState(true); 

  const [loadingConfig, setLoadingConfig] = useState(true); 
  const [accessGranted, setAccessGranted] = useState(false);
  const [dbPass, setDbPass] = useState('');

  const [pizzas, setPizzas] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]); 
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [recetas, setRecetas] = useState<any[]>([]);
  const [adicionales, setAdicionales] = useState<any[]>([]);

  const [allRatings, setAllRatings] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  
  const [nombreInvitado, setNombreInvitado] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [mensaje, setMensaje] = useState<MensajeTipo | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [orden, setOrden] = useState<'estado' | 'nombre' | 'ranking'>('nombre');
  const [filter, setFilter] = useState<'all' | 'top' | 'to_rate' | 'ordered' | 'new' | 'stock'>('all');
  const [isCompact, setIsCompact] = useState(false);
  const [imageToView, setImageToView] = useState<string | null>(null);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [summarySheet, setSummarySheet] = useState<'total' | 'wait' | 'oven' | 'ready' | null>(null);
  const [orderToConfirm, setOrderToConfirm] = useState<any>(null);
  const [selectedAdicionales, setSelectedAdicionales] = useState<string[]>([]);

  const [showLateRatingModal, setShowLateRatingModal] = useState(false);
  const [lateRatingPizza, setLateRatingPizza] = useState<any>(null);
  const processedOrderIds = useRef<Set<string>>(new Set());
  const [zoomLevel, setZoomLevel] = useState(0);
  const DESC_SIZES = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'];
  const STOCK_SIZES = ['text-[10px]', 'text-xs', 'text-sm', 'text-base', 'text-lg'];
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [currentTheme, setCurrentTheme] = useState(THEMES[1]);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [pizzaToRate, setPizzaToRate] = useState<any>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [commentValue, setCommentValue] = useState('');
  const [misValoraciones, setMisValoraciones] = useState<string[]>([]);
  const [autoTranslations, setAutoTranslations] = useState<Record<string, Record<string, { name: string, desc: string }>>>({});
  const [translatedWelcome, setTranslatedWelcome] = useState<string>('');
  const [config, setConfig] = useState<{
      porciones_por_pizza: number;
      total_invitados: number;
      modo_estricto: boolean;
      categoria_activa: string;
      mensaje_bienvenida?: string;
      tiempo_recordatorio_minutos?: number;
      password_invitados?: string;
  }>({ 
      porciones_por_pizza: 4, 
      total_invitados: 10, 
      modo_estricto: false, 
      categoria_activa: '["General"]' 
  });
  const [invitadosActivos, setInvitadosActivos] = useState(0);
  const [miHistorial, setMiHistorial] = useState<Record<string, { pendientes: number, comidos: number, enHorno: number, enEspera: number }>>({});
  const [invitadosLista, setInvitadosLista] = useState<any[]>([]);
  const [usuarioBloqueado, setUsuarioBloqueado] = useState(false);
  const [motivoBloqueo, setMotivoBloqueo] = useState('');
  const prevPendingPerPizzaRef = useRef<Record<string, number>>({});
  const prevComidosPerPizza = useRef<Record<string, number>>({});
  const prevCocinandoData = useRef<Record<string, boolean>>({});
  const firstLoadRef = useRef(true);

  // --- HELPERS ---
  const mostrarMensaje = (txt: string, tipo: 'info' | 'alerta' | 'exito') => { setMensaje({ texto: txt, tipo }); if (tipo !== 'alerta') { setTimeout(() => setMensaje(null), 2500); } };
  const getBtnClass = (isActive: boolean) => { const common = "p-2 rounded-full transition-all duration-300 flex items-center justify-center bg-transparent "; const scale = isActive ? "scale-110" : "hover:scale-105"; return isDarkMode ? `${common} ${scale} ${isActive ? 'text-white' : 'text-neutral-200 hover:text-white'}` : `${common} ${scale} ${isActive ? 'text-black' : 'text-neutral-800 hover:text-black'}`; };
  const formatTime = (seconds: number) => { 
      const m = Math.floor(seconds / 60); 
      const s = seconds % 60; 
      return `${m}m ${s > 0 ? s + 's' : ''}`; 
  };
  
  const getWelcomeMessage = () => { 
      let msg = (lang !== 'es' && translatedWelcome) ? translatedWelcome : config.mensaje_bienvenida; 
      if (!msg) return null; 
      msg = msg.replace(/\[nombre\]/gi, nombreInvitado || 'Invitado'); 
      msg = msg.replace(/\[fecha\]/gi, new Date().toLocaleDateString()); 
      msg = msg.replace(/\[hora\]/gi, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })); 
      msg = msg.replace(/\[pizzas\]/gi, String(pizzas.length)); 
      return msg; 
  };
  
  const getEmptyStateMessage = () => { switch(filter) { case 'stock': return t.emptyStock; case 'top': return t.emptyTop; case 'to_rate': return t.emptyRate; case 'ordered': return t.emptyOrdered; case 'new': return t.emptyNew; default: return t.emptyDefault; } };
  const sendNotification = async (title: string, body: string, url: string = '/') => { if ('serviceWorker' in navigator && navigator.serviceWorker.ready) { try { const registration = await navigator.serviceWorker.ready; registration.showNotification(title, { body: body, icon: '/icon.png', badge: '/icon.png', vibrate: [200, 100, 200], data: { url: url } } as any); return; } catch (e) { console.log("Fallo SW notification"); } } if (Notification.permission === 'granted') { new Notification(title, { body, icon: '/icon.png' }); } };
  const toggleNotificaciones = () => { if (notifEnabled) { setNotifEnabled(false); localStorage.setItem('vito-notif-enabled', 'false'); mostrarMensaje(t.notifOff, 'info'); } else { Notification.requestPermission().then(perm => { if (perm === 'granted') { setNotifEnabled(true); localStorage.setItem('vito-notif-enabled', 'true'); mostrarMensaje(t.notifOn, 'info'); sendNotification("Il Forno di Vito", "¡Notificaciones activadas correctamente!"); } else { alert("Activa las notificaciones en la configuración de tu navegador."); } }); } };
  const toggleDarkMode = () => { const n = !isDarkMode; setIsDarkMode(n); localStorage.setItem('vito-dark-mode', String(n)); };
  const toggleOrden = () => { const n = orden === 'estado' ? 'nombre' : (orden === 'nombre' ? 'ranking' : 'estado'); setOrden(n); localStorage.setItem('vito-orden', n); };
  const toggleCompact = () => { const n = !isCompact; setIsCompact(n); localStorage.setItem('vito-compact', String(n)); };
  const cycleTextSize = () => { setZoomLevel(prev => (prev + 1) % 5); };
  const changeFilter = (f: any) => { setFilter(f); localStorage.setItem('vito-filter', f); };
  const changeTheme = (t: typeof THEMES[0]) => { setCurrentTheme(t); localStorage.setItem('vito-guest-theme', t.name); setShowThemeSelector(false); };
  
  const rotarIdioma = () => { 
      let nextLang: LangType = 'es'; 
      if (lang === 'es') nextLang = 'en'; 
      else if (lang === 'en') nextLang = 'it'; 
      setLang(nextLang); 
      localStorage.setItem('vito-lang', nextLang); 
      setTranslatedWelcome('');
      setAutoTranslations({});
  };
  
  const translateText = async (text: string, targetLang: string) => { 
      if (!text) return "";
      try { const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURI(text)}`); const data = await response.json(); return data[0][0][0] || text; } catch (error) { console.error("Error traduciendo", error); return text; } 
  };

  const logoutGuest = () => { if(confirm("¿Cerrar sesión?")) { localStorage.removeItem('vito-guest-name'); localStorage.removeItem('vito-guest-pass-val'); localStorage.removeItem('vito-guest-avatar'); setNombreInvitado(''); setAvatarPreview(null); setFlowStep('landing'); } };
  const checkOnboarding = () => { const seen = localStorage.getItem('vito-onboarding-seen'); if (!seen) { setFlowStep('onboarding'); setShowOnboarding(true); } else { setFlowStep('app'); } };
  
  const handleAvatarSelect = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
          const compressed = await compressImage(file);
          const finalFile = new File([compressed], file.name, { type: 'image/jpeg' });
          const previewUrl = URL.createObjectURL(compressed);
          if (flowStep === 'app') { await uploadAvatarToDb(finalFile); } 
          else { setAvatarFile(finalFile); setAvatarPreview(previewUrl); }
      } catch(err) { alert("Error al procesar la imagen."); }
      e.target.value = '';
  };

  const handleUpdateAvatar = (e: any) => { handleAvatarSelect(e); };

  const uploadAvatarToDb = async (fileToUpload: File) => {
      setUploadingAvatar(true);
      try {
          const fileName = `avatars/${Date.now()}_${nombreInvitado.replace(/\s+/g, '_')}.jpg`;
          const { error: uploadError } = await supabase.storage.from('pizzas').upload(fileName, fileToUpload);
          if (!uploadError) {
              const { data } = supabase.storage.from('pizzas').getPublicUrl(fileName);
              const newUrl = data.publicUrl;
              await supabase.from('lista_invitados').update({ avatar_url: newUrl }).ilike('nombre', nombreInvitado.trim());
              setAvatarPreview(newUrl); localStorage.setItem('vito-guest-avatar', newUrl); mostrarMensaje("Foto actualizada", "exito"); setImageToView(null);
          } else throw uploadError;
      } catch(err) { alert("Error subiendo la foto."); } finally { setUploadingAvatar(false); }
  };

  const handleNameSubmit = async () => { 
      if (!nombreInvitado.trim()) return alert("Por favor ingresa tu nombre"); 
      setUploadingAvatar(true); let publicAvatarUrl = null;
      try {
          localStorage.setItem('vito-guest-name', nombreInvitado);
          if (avatarFile) {
              const fileName = `avatars/${Date.now()}_${nombreInvitado.replace(/\s+/g, '_')}.jpg`;
              const { error: uploadError } = await supabase.storage.from('pizzas').upload(fileName, avatarFile);
              if (!uploadError) { const { data } = supabase.storage.from('pizzas').getPublicUrl(fileName); publicAvatarUrl = data.publicUrl; localStorage.setItem('vito-guest-avatar', publicAvatarUrl); }
          }
          const { data: existingUser } = await supabase.from('lista_invitados').select('id, avatar_url').ilike('nombre', nombreInvitado.trim()).maybeSingle();
          if (existingUser) {
              const urlToUpdate = publicAvatarUrl || existingUser.avatar_url;
              await supabase.from('lista_invitados').update({ avatar_url: urlToUpdate, origen: 'web' }).eq('id', existingUser.id);
              if (!publicAvatarUrl && existingUser.avatar_url) { setAvatarPreview(existingUser.avatar_url); localStorage.setItem('vito-guest-avatar', existingUser.avatar_url); }
          } else { await supabase.from('lista_invitados').insert([{ nombre: nombreInvitado.trim(), avatar_url: publicAvatarUrl, origen: 'web' }]); }
      } catch (e) { console.error(e); } finally { setUploadingAvatar(false); if (dbPass && dbPass !== '') { setFlowStep('password'); } else { checkOnboarding(); } }
  };

  const handlePasswordSubmit = () => { if (guestPassInput === dbPass) { localStorage.setItem('vito-guest-pass-val', guestPassInput); checkOnboarding(); } else { alert("Contraseña incorrecta"); } };
  const handleInstallClick = async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; if (outcome === 'accepted') setIsInstallable(false); setDeferredPrompt(null); };
  const completeOnboarding = () => { localStorage.setItem('vito-onboarding-seen', 'true'); setShowOnboarding(false); setFlowStep('app'); };

  useEffect(() => { if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(error => console.log('SW error:', error)); } const hasSeenOnboarding = localStorage.getItem('vito-onboarding-seen'); if (!hasSeenOnboarding) setShowOnboarding(true); const savedName = localStorage.getItem('vito-guest-name'); if (savedName) setNombreInvitado(savedName); const savedAvatar = localStorage.getItem('vito-guest-avatar'); if (savedAvatar) setAvatarPreview(savedAvatar); const savedTheme = localStorage.getItem('vito-guest-theme'); if (savedTheme) setCurrentTheme(THEMES.find(t => t.name === savedTheme) || THEMES[1]); else setCurrentTheme(THEMES[1]); const savedMode = localStorage.getItem('vito-dark-mode'); if (savedMode !== null) setIsDarkMode(savedMode === 'true'); else setIsDarkMode(false); const savedLang = localStorage.getItem('vito-lang'); if (savedLang) setLang(savedLang as LangType); const savedNotif = localStorage.getItem('vito-notif-enabled'); if (savedNotif === 'true' && typeof Notification !== 'undefined' && Notification.permission === 'granted') setNotifEnabled(true); const savedOrden = localStorage.getItem('vito-orden'); if (savedOrden) setOrden(savedOrden as any); else setOrden('nombre'); const savedCompact = localStorage.getItem('vito-compact'); if (savedCompact) setIsCompact(savedCompact === 'true'); const savedFilter = localStorage.getItem('vito-filter'); if (savedFilter) setFilter(savedFilter as any); const savedPass = localStorage.getItem('vito-guest-pass-val'); if(savedPass) setGuestPassInput(savedPass); const interval = setInterval(() => { setBannerIndex((prev) => prev + 1); }, 3000); const handleBeforeInstallPrompt = (e: any) => { e.preventDefault(); setDeferredPrompt(e); setIsInstallable(true); }; window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt); const presenceChannel = supabase.channel('online-users'); presenceChannel.on('presence', { event: 'sync' }, () => { const state = presenceChannel.presenceState(); const count = Object.values(state).reduce((acc: number, presences: any) => { const isGuest = presences.some((p: any) => p.role === 'guest'); return acc + (isGuest ? 1 : 0); }, 0); setOnlineUsers(count); }).subscribe(async (status) => { if (status === 'SUBSCRIBED') { await presenceChannel.track({ online_at: new Date().toISOString(), role: 'guest' }); } }); return () => { clearInterval(interval); window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt); supabase.removeChannel(presenceChannel); }; }, []);
  useEffect(() => { const configChannel = supabase.channel('config-realtime').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'configuracion_dia' }, (payload: any) => { if (payload.new) { setConfig(prev => ({ ...prev, ...payload.new })); const newPass = payload.new.password_invitados; const storedPass = localStorage.getItem('vito-guest-pass-val'); if (newPass && newPass !== '' && newPass !== storedPass) { alert("La contraseña de acceso ha cambiado. Por favor ingresa nuevamente."); setFlowStep('password'); setGuestPassInput(''); setDbPass(newPass); } } }).subscribe(); return () => { supabase.removeChannel(configChannel); }; }, []);
  useEffect(() => { const logAccess = async () => { let sessionId = localStorage.getItem('vito-session-id'); if (!sessionId) { sessionId = crypto.randomUUID(); localStorage.setItem('vito-session-id', sessionId); } const userAgent = navigator.userAgent; let deviceType = "Desktop"; if (/Mobi|Android/i.test(userAgent)) deviceType = "Mobile"; let browserName = "Unknown"; if (userAgent.indexOf("Chrome") > -1) browserName = "Chrome"; else if (userAgent.indexOf("Safari") > -1) browserName = "Safari"; else if (userAgent.indexOf("Firefox") > -1) browserName = "Firefox"; let ipData = { ip: null, city: null, country_name: null }; try { const res = await fetch('https://ipapi.co/json/'); if (res.ok) ipData = await res.json(); } catch (e) {} const { data: existingLog } = await supabase.from('access_logs').select('id').eq('session_id', sessionId).gt('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()).single(); if (!existingLog) { await supabase.from('access_logs').insert([{ session_id: sessionId, device: deviceType, browser: browserName, ip: ipData.ip, ciudad: ipData.city, pais: ipData.country_name, invitado_nombre: nombreInvitado || null }]); } else { if (nombreInvitado) { await supabase.from('access_logs').update({ invitado_nombre: nombreInvitado }).eq('id', existingLog.id); } } }; logAccess(); }, [nombreInvitado]);
  
  useEffect(() => {
      if (lang === 'es') { setTranslatedWelcome(''); return; }
      const translateAll = async () => {
          if (config.mensaje_bienvenida) {
              let safeMsg = config.mensaje_bienvenida.replace(/\n/g, ' XX_BR_XX ').replace(/\[nombre\]/gi, 'XX_NAME_XX').replace(/\[fecha\]/gi, 'XX_DATE_XX').replace(/\[hora\]/gi, 'XX_TIME_XX').replace(/\[pizzas\]/gi, 'XX_COUNT_XX');
              let tMsg = await translateText(safeMsg, lang);
              tMsg = tMsg.replace(/XX_BR_XX/gi, '\n').replace(/XX _ BR _ XX/gi, '\n').replace(/XX_NAME_XX/gi, '[nombre]').replace(/XX _ NAME _ XX/gi, '[nombre]').replace(/XX_DATE_XX/gi, '[fecha]').replace(/XX _ DATE _ XX/gi, '[fecha]').replace(/XX_TIME_XX/gi, '[hora]').replace(/XX _ TIME _ XX/gi, '[hora]').replace(/XX_COUNT_XX/gi, '[pizzas]').replace(/XX _ COUNT _ XX/gi, '[pizzas]');
              setTranslatedWelcome(tMsg);
          }
          const newTrans = { ...autoTranslations };
          let hasChanges = false;
          for (const p of pizzas) {
              if (!newTrans[p.id]) newTrans[p.id] = {};
              if (!newTrans[p.id][lang]) {
                  const tName = await translateText(p.nombre, lang);
                  const tDesc = await translateText(p.descripcion || "", lang);
                  newTrans[p.id][lang] = { name: tName, desc: tDesc };
                  hasChanges = true;
              }
          }
          if (hasChanges) setAutoTranslations(newTrans);
      };
      translateAll();
  }, [lang, pizzas, config.mensaje_bienvenida]);
  
  const fetchConfig = useCallback(async () => { const { data } = await supabase.from('configuracion_dia').select('*').single(); if (data) { setConfig(data); setDbPass(data.password_invitados || ''); } const savedName = localStorage.getItem('vito-guest-name'); const savedPass = localStorage.getItem('vito-guest-pass-val'); if (savedName && (!data?.password_invitados || savedPass === data.password_invitados)) { setNombreInvitado(savedName); setFlowStep('app'); } else { setFlowStep('landing'); } setLoadingConfig(false); }, []);
  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const fetchDatos = useCallback(async () => {
    const now = new Date(); const corte = new Date(now); if (now.getHours() < 6) corte.setDate(corte.getDate() - 1); corte.setHours(6, 0, 0, 0); const iso = corte.toISOString();
    const [dPed, dPiz, dInv, dVal, dRec, dIng, dAdi] = await Promise.all([ 
        supabase.from('pedidos').select('*').gte('created_at', iso), 
        supabase.from('menu_pizzas').select('*').eq('activa', true).order('created_at'), 
        supabase.from('lista_invitados').select('*'), 
        supabase.from('valoraciones').select('*').gte('created_at', iso), 
        supabase.from('recetas').select('*'), 
        supabase.from('ingredientes').select('*'),
        supabase.from('menu_adicionales').select('*')
    ]);
    if (dIng.data) setIngredientes(dIng.data); if (dRec.data) setRecetas(dRec.data); if (dVal.data) setAllRatings(dVal.data); if (dAdi.data) setAdicionales(dAdi.data);
    if (dInv.data) { setInvitadosLista(dInv.data); if (nombreInvitado) { const me = dInv.data.find(u => u.nombre.toLowerCase() === nombreInvitado.toLowerCase().trim()); if (me) { if (me.bloqueado) { setUsuarioBloqueado(true); setMotivoBloqueo(me.motivo_bloqueo || ''); } else { setUsuarioBloqueado(false); setMotivoBloqueo(''); } if (me.avatar_url && me.avatar_url !== avatarPreview) { setAvatarPreview(me.avatar_url); localStorage.setItem('vito-guest-avatar', me.avatar_url); } } } }
    if (dPiz.data && dPed.data) {
      setPedidos(dPed.data); setInvitadosActivos(new Set(dPed.data.map(p => p.invitado_nombre.toLowerCase().trim())).size); setPizzas(dPiz.data);
      if (nombreInvitado) {
        const mV = dVal.data?.filter(v => v.invitado_nombre.toLowerCase() === nombreInvitado.toLowerCase()); if (mV) setMisValoraciones(mV.map(v => v.pizza_id));
        const mis = dPed.data.filter(p => p.invitado_nombre.toLowerCase() === nombreInvitado.toLowerCase().trim());
        const res: any = {}; 
        dPiz.data.forEach(pz => {
             const m = mis.filter(p => p.pizza_id === pz.id); 
             const c = m.filter(p => p.estado === 'entregado').reduce((acc, x) => acc + x.cantidad_porciones, 0); 
             const enHornoCount = m.filter(p => p.estado === 'cocinando').reduce((acc, x) => acc + x.cantidad_porciones, 0);
             const enEsperaCount = m.filter(p => p.estado === 'pendiente').reduce((acc, x) => acc + x.cantidad_porciones, 0);
             const pTotal = enHornoCount + enEsperaCount;
             res[pz.id] = { pendientes: pTotal, comidos: c, enHorno: enHornoCount, enEspera: enEsperaCount };
             if (!firstLoadRef.current && flowStep === 'app') { 
                 if (!(prevCocinandoData.current[pz.id]) && pz.cocinando && pTotal) { sendNotification(pz.tipo === 'pizza' ? "¡Al Horno!" : "¡En Marcha!", `Tu ${pz.nombre} está ${getCookingText(pz.tipo, 'ing')}.`); }
                 if (prevCocinandoData.current[pz.id] && !pz.cocinando && (prevPendingPerPizzaRef.current[pz.id] > 0)) { mostrarMensaje(`¡Tu ${pz.nombre} ESTÁ LISTA!`, 'exito'); sendNotification(`¡${pz.nombre} Lista!`, `¡Ya está ${getCookingText(pz.tipo, 'ed')}!`, `/?rate=${pz.id}`); }
             } 
             prevCocinandoData.current[pz.id] = pz.cocinando; prevComidosPerPizza.current[pz.id] = c; prevPendingPerPizzaRef.current[pz.id] = pTotal;
        });
        setMiHistorial(res); if (firstLoadRef.current) firstLoadRef.current = false;
      }
    }
    setCargando(false);
  }, [nombreInvitado, flowStep, t]); 
  useEffect(() => { fetchDatos(); const c = supabase.channel('app-realtime').on('postgres_changes', { event: '*', schema: 'public' }, () => fetchDatos()).subscribe(); return () => { supabase.removeChannel(c); }; }, [fetchDatos]);

  const activeCategories: string[] = useMemo(() => { try { const parsed = JSON.parse(config.categoria_activa); if (parsed === 'Todas') return ['Todas']; if (Array.isArray(parsed)) return parsed; return ['General']; } catch { return ['General']; } }, [config.categoria_activa]);
  
  // --- ENRICHED PIZZAS WITH ROBUST STOCK LOGIC (UNIFIED) ---
  const enrichedPizzas = useMemo(() => { 
      const globalAvg = allRatings.length > 0 ? (allRatings.reduce((a, r) => a + r.rating, 0) / allRatings.length) : 0; 
      
      return pizzas.map(pizza => { 
          const target = pizza.porciones_individuales || config.porciones_por_pizza || 1; 
          
          // --- LOGICA DE STOCK UNIFICADA ---
          // STOCK VISUAL = (FISICO DB) - (RESERVADO PENDIENTE BASE) - (RESERVADO PENDIENTE EXTRAS)
          const pRecetas = recetas.filter(r => r.pizza_id === pizza.id);
          let stockCalculado = 9999;
          let missingIngredients: string[] = [];

          if (pRecetas.length > 0) {
              let limit = Infinity;
              pRecetas.forEach(item => {
                  const ing = ingredientes.find(i => i.id === item.ingrediente_id);
                  if (ing) {
                      let qtyFisica = ing.cantidad_disponible || 0;
                      
                      // Reservado BASE de todos los pedidos pendientes de esta pizza
                      const reservadosBase = pedidos
                          .filter(p => p.estado === 'pendiente' && p.pizza_id === pizza.id)
                          .reduce((acc, p) => acc + (item.cantidad_requerida * (p.cantidad_porciones/target)), 0);
                      
                      // Reservado EXTRA de todos los pedidos pendientes (si este ingrediente es un extra)
                      const reservadosExtras = pedidos
                          .filter(p => p.estado === 'pendiente' && p.detalles_adicionales)
                          .reduce((acc, p) => {
                              let count = 0;
                              p.detalles_adicionales.forEach((name:string) => {
                                  // Buscamos si el extra usa este ingrediente
                                  const adi = adicionales.find(a => a.pizza_id === p.pizza_id && a.nombre_visible === name && a.ingrediente_id === item.ingrediente_id);
                                  if(adi) count += adi.cantidad_requerida;
                              });
                              return acc + count;
                          }, 0);

                      const totalReservado = reservadosBase + reservadosExtras;
                      const disponibleReal = Math.max(0, qtyFisica - totalReservado);
                      const posibles = Math.floor(disponibleReal / item.cantidad_requerida);
                      
                      if (posibles < limit) limit = posibles;
                      if (posibles <= 0) missingIngredients.push(ing.nombre);
                  } else { limit = 0; }
              });
              stockCalculado = limit === Infinity ? 0 : limit;
          } else { 
              stockCalculado = pizza.stock || 0; 
          }
          // --- FIN LOGICA STOCK ---

          const pen = pedidos.filter(p => p.pizza_id === pizza.id && p.estado !== 'entregado').reduce((a, c) => a + c.cantidad_porciones, 0); 
          const rats = allRatings.filter(r => r.pizza_id === pizza.id); 
          const avg = rats.length > 0 ? (rats.reduce((a, b) => a + b.rating, 0) / rats.length).toFixed(1) : null; 
          const sortR = rats.length > 0 ? (rats.reduce((a, b) => a + b.rating, 0) / rats.length) : globalAvg; 
          
          let displayName = pizza.nombre; let displayDesc = pizza.descripcion; 
          if (lang !== 'es' && autoTranslations[pizza.id] && autoTranslations[pizza.id][lang]) { displayName = autoTranslations[pizza.id][lang].name; displayDesc = autoTranslations[pizza.id][lang].desc; } 
          
          const misAdicionales = adicionales ? adicionales.filter((a:any) => a.pizza_id === pizza.id) : [];

          return { 
              ...pizza, displayName, displayDesc, stockRestante: stockCalculado, missingIngredients, target, 
              ocupadasActual: pen % target, faltanParaCompletar: target - (pen % target), 
              avgRating: avg, countRating: rats.length, sortRating: sortR, totalPendientes: pen, disponiblesAdicionales: misAdicionales 
          }; 
      }); 
  }, [pizzas, pedidos, config, allRatings, lang, autoTranslations, recetas, ingredientes, adicionales]);

  const summaryData = useMemo(() => { if(!summarySheet) return []; return enrichedPizzas.filter(p => { const h = miHistorial[p.id]; if(!h) return false; if(summarySheet === 'wait') return h.enEspera > 0; if(summarySheet === 'oven') return h.enHorno > 0; if(summarySheet === 'ready') return h.comidos > 0; if(summarySheet === 'total') return h.pendientes > 0; return false; }).map(p => { const h = miHistorial[p.id]; let count = 0; if(summarySheet === 'wait') count = h.enEspera; else if(summarySheet === 'oven') count = h.enHorno; else if(summarySheet === 'ready') count = h.comidos; else count = h.pendientes; return { ...p, count }; }); }, [summarySheet, enrichedPizzas, miHistorial]); 
  const mySummary = useMemo(() => { let t = 0, w = 0, o = 0, r = 0; pizzas.forEach(p => { const h = miHistorial[p.id]; if(h) { w += h.enEspera; o += h.enHorno; r += h.comidos; t += h.pendientes; } }); return { total: t, wait: w, oven: o, ready: r }; }, [miHistorial, pizzas]);
  const currentBannerText = useMemo(() => { if (cargando) return t.loading; const msgs = [`${invitadosActivos} ${t.status}`]; const pData = pizzas.map(p => { const vals = allRatings.filter(v => v.pizza_id === p.id); const avg = vals.length > 0 ? vals.reduce((a, b) => a + b.rating, 0) / vals.length : 0; const totS = (p.stock || 0) * (p.porciones_individuales || config.porciones_por_pizza); const us = pedidos.filter(ped => ped.pizza_id === p.id).reduce((a, c) => a + c.cantidad_porciones, 0); let dName = p.nombre; if (lang !== 'es' && autoTranslations[p.id] && autoTranslations[p.id][lang]) { dName = autoTranslations[p.id][lang].name; } return { ...p, displayName: dName, stock: Math.max(0, totS - us), avg, count: vals.length }; }); pData.forEach(p => { if (p.stock === 0) msgs.push(`${p.displayName}: ${t.soldOut} 😭`); else if (p.stock <= 5) msgs.push(`${t.only} ${p.stock} ${t.of} ${p.displayName}! 🏃`); }); const best = [...pData].sort((a,b) => b.avg - a.avg)[0]; if (best && best.avg >= 4.5 && best.count > 1) msgs.push(`${t.topRated} ${best.displayName} (${best.avg.toFixed(1)}★)`); const pop = pData.filter(p => p.avg > 4.7 && p.count > 2); pop.forEach(p => msgs.push(`${t.hotPick} ${p.displayName}!`)); return msgs[bannerIndex % msgs.length]; }, [invitadosActivos, pizzas, pedidos, bannerIndex, cargando, t, config, allRatings, lang, autoTranslations]);

  useEffect(() => { if (enrichedPizzas.length === 0) return; let lista = [...enrichedPizzas]; if (!activeCategories.includes('Todas')) { lista = lista.filter(p => activeCategories.includes(p.categoria || 'General')); } if (filter !== 'all') { lista = lista.filter(p => { if (filter === 'top') return p.avgRating && parseFloat(p.avgRating) >= 4.5; if (filter === 'to_rate') return miHistorial[p.id]?.comidos > 0 && !misValoraciones.includes(p.id); if (filter === 'ordered') return (miHistorial[p.id]?.pendientes > 0 || miHistorial[p.id]?.comidos > 0); if (filter === 'new') return (!miHistorial[p.id]?.pendientes && !miHistorial[p.id]?.comidos); if (filter === 'stock') return p.stockRestante > 0; return true; }); } lista.sort((a, b) => { const aReady = !a.cocinando && a.totalPendientes >= a.target; const bReady = !b.cocinando && b.totalPendientes >= b.target; if (aReady && !bReady) return -1; if (!aReady && bReady) return 1; if (a.cocinando && !b.cocinando) return -1; if (!a.cocinando && b.cocinando) return 1; const aStock = a.stockRestante > 0; const bStock = b.stockRestante > 0; if (aStock && !bStock) return -1; if (!aStock && bStock) return 1; if (orden === 'ranking') return b.sortRating - a.sortRating; if (orden === 'nombre') return a.displayName.localeCompare(b.displayName); const aActive = a.ocupadasActual; const bActive = b.ocupadasActual; if (aActive !== bActive) return bActive - aActive; return a.displayName.localeCompare(b.displayName); }); setOrderedIds(lista.map(p => p.id)); }, [orden, filter, pizzas.length, JSON.stringify(pizzas.map(p => ({ id: p.id, cocinando: p.cocinando, stock: p.stock }))), JSON.stringify(activeCategories)]);
  useEffect(() => { const params = new URLSearchParams(window.location.search); const rateId = params.get('rate'); if (rateId && enrichedPizzas.length > 0) { const pizza = enrichedPizzas.find(p => p.id === rateId) || pizzas.find(p => p.id === rateId); if (pizza) { openRating(pizza); const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname; window.history.replaceState({ path: newUrl }, '', newUrl); } } }, [enrichedPizzas]); 
  useEffect(() => { if(!nombreInvitado || !pizzas.length) return; const storedQueue = localStorage.getItem('vito-review-queue'); let queue: { id: string, pizzaId: string, triggerAt: number }[] = storedQueue ? JSON.parse(storedQueue) : []; let queueChanged = false; const delivered = pedidos.filter(p => p.invitado_nombre === nombreInvitado && p.estado === 'entregado'); delivered.forEach(p => { if (misValoraciones.includes(p.pizza_id)) return; if (queue.find(q => q.id === p.id)) return; if (processedOrderIds.current.has(p.id)) return; processedOrderIds.current.add(p.id); if (!firstLoadRef.current) { const delayMins = config.tiempo_recordatorio_minutos || 10; const triggerTime = Date.now() + (delayMins * 60000); queue.push({ id: p.id, pizzaId: p.pizza_id, triggerAt: triggerTime }); queueChanged = true; } }); if (queueChanged) localStorage.setItem('vito-review-queue', JSON.stringify(queue)); const checker = setInterval(() => { const currentQueueStr = localStorage.getItem('vito-review-queue'); if (!currentQueueStr) return; let currentQueue = JSON.parse(currentQueueStr); const now = Date.now(); const toNotify: any[] = []; const remaining: any[] = []; currentQueue.forEach((item: any) => { if (misValoraciones.includes(item.pizzaId)) return; if (now >= item.triggerAt) toNotify.push(item); else remaining.push(item); }); if (toNotify.length > 0) { const item = toNotify[0]; const pz = enrichedPizzas.find(z => z.id === item.pizzaId) || pizzas.find(z => z.id === item.pizzaId); if (pz) { const delay = config.tiempo_recordatorio_minutos || 10; const nameToShow = pz.displayName || pz.nombre; sendNotification(t.rateQuestion + " " + nameToShow + "?", `${t.ateTimeAgo} ${delay} ${t.minAgo}`, `/?rate=${pz.id}`); setLateRatingPizza(pz); setShowLateRatingModal(true); } localStorage.setItem('vito-review-queue', JSON.stringify(remaining)); } }, 10000); return () => clearInterval(checker); }, [pedidos, nombreInvitado, pizzas, enrichedPizzas, misValoraciones, config]);

  const openRating = (p: any) => { setPizzaToRate(p); setRatingValue(0); setCommentValue(''); setShowRatingModal(true); };
  const submitRating = async () => { if (ratingValue === 0) return; await supabase.from('valoraciones').insert([{ pizza_id: pizzaToRate.id, invitado_nombre: nombreInvitado, rating: ratingValue, comentario: commentValue }]); setMisValoraciones(prev => [...prev, pizzaToRate.id]); const storedQueue = localStorage.getItem('vito-review-queue'); if (storedQueue) { const queue = JSON.parse(storedQueue); const newQueue = queue.filter((item: any) => item.pizzaId !== pizzaToRate.id); localStorage.setItem('vito-review-queue', JSON.stringify(newQueue)); } setShowRatingModal(false); setShowLateRatingModal(false); fetchDatos(); };
  
  async function modificarPedido(p: any, acc: 'sumar' | 'restar') { 
      if (!nombreInvitado.trim()) { alert(t.errorName); return; } 
      if (usuarioBloqueado) { alert(`${t.blocked}: ${motivoBloqueo || ''}`); return; } 
      
      if (acc === 'sumar') { 
          if (p.stockRestante <= 0) { alert("Sin stock :("); return; }
          if (p.disponiblesAdicionales && p.disponiblesAdicionales.length > 0) {
              setOrderToConfirm(p); setSelectedAdicionales([]); 
          } else {
              setOrderToConfirm(p);
          }
      } else { 
          // --- NUEVA LÓGICA DE CANCELACIÓN CORREGIDA ---
          // 1. Buscamos primero si hay pedidos PENDIENTES
          const pending = pedidos.filter(pd => 
              pd.pizza_id === p.id && 
              pd.invitado_nombre.toLowerCase() === nombreInvitado.toLowerCase().trim() && 
              pd.estado === 'pendiente'
          );

          if (pending.length > 0) { 
              const toDelete = pending[0]; 
              
              // Solo borramos el pedido (no tocamos stock físico)
              const newPedidos = pedidos.filter(x => x.id !== toDelete.id); 
              setPedidos(newPedidos); 
              mostrarMensaje(`${t.successCancel} ${p.displayName}`, 'info'); 
              await supabase.from('pedidos').delete().eq('id', toDelete.id); 
              fetchDatos(); 
          } else {
              // 2. Si no hay pendientes, verificamos si hay EN HORNO para dar mensaje específico
              const cooking = pedidos.filter(pd => 
                  pd.pizza_id === p.id && 
                  pd.invitado_nombre.toLowerCase() === nombreInvitado.toLowerCase().trim() && 
                  pd.estado === 'cocinando'
              );

              if (cooking.length > 0) {
                  mostrarMensaje(`🔥 Esas unidades ya están en el horno, no se pueden cancelar.`, 'alerta');
              }
          }
      } 
  }
  
  const proceedWithOrder = async () => { 
      if(!orderToConfirm) return; 
      // Optimistic Addition
      const tempId = `temp-${Date.now()}`;
      const newOrder = { 
          id: tempId, 
          invitado_nombre: nombreInvitado, 
          pizza_id: orderToConfirm.id, 
          cantidad_porciones: 1, 
          estado: 'pendiente', 
          created_at: new Date().toISOString(), 
          detalles_adicionales: selectedAdicionales 
      }; 
      setPedidos(prev => [...prev, newOrder]); 
      
      // --- CORRECCIÓN: NO DESCONTAR STOCK FÍSICO AL PEDIR ---
      // Solo insertamos el pedido. El cálculo visual 'enrichedPizzas' se encargará de restar visualmente.

      setOrderToConfirm(null); setSelectedAdicionales([]); mostrarMensaje(`${t.successOrder} ${orderToConfirm.displayName}!`, 'exito'); 
      const { error, data } = await supabase.from('pedidos').insert([{ invitado_nombre: nombreInvitado, pizza_id: orderToConfirm.id, cantidad_porciones: 1, estado: 'pendiente', detalles_adicionales: selectedAdicionales }]).select().single(); 
      if (error) { setPedidos(prev => prev.filter(p => p.id !== tempId)); alert("Error al pedir. Intenta de nuevo."); } else { 
          // Replace temp with real
          setPedidos(prev => prev.map(p => p.id === tempId ? data : p));
      } 
  }

  const toggleAdicional = (nombre: string) => { if(selectedAdicionales.includes(nombre)) { setSelectedAdicionales(prev => prev.filter(n => n !== nombre)); } else { setSelectedAdicionales(prev => [...prev, nombre]); } };

  const base = isDarkMode ? { bg: "bg-neutral-950", text: "text-white", subtext: "text-neutral-500", card: "bg-neutral-900 border-neutral-800", innerCard: "bg-white/5 border border-white/5 text-neutral-300", input: "bg-transparent text-white placeholder-neutral-600", inputContainer: "bg-neutral-900 border-neutral-800", buttonSec: "bg-black/20 text-white hover:bg-black/40 border-white/10", progressBg: "bg-black/40 border-white/5", progressTrack: "bg-neutral-800 border-black/50", badge: "bg-white/10 text-white border border-white/10", activeChip: "bg-white text-black font-bold", inactiveChip: "bg-neutral-900 text-neutral-400 border border-neutral-800", bar: "bg-neutral-900/50 backdrop-blur-md border-white/10 shadow-lg text-white border" } : { bg: "bg-gray-50", text: "text-gray-900", subtext: "text-gray-500", card: "bg-white border-gray-200 shadow-md", innerCard: "bg-neutral-100 border border-transparent text-gray-600", input: "bg-transparent text-gray-900 placeholder-gray-400", inputContainer: "bg-white border-gray-200 shadow-sm", buttonSec: "bg-gray-200 text-gray-600 hover:text-black border-gray-300", progressBg: "bg-gray-100 border-gray-200", progressTrack: "bg-gray-300 border-white/50", badge: "bg-black/5 text-gray-700 border border-black/5", activeChip: "bg-black text-white font-bold", inactiveChip: "bg-white text-gray-500 border border-gray-200", bar: "bg-white/50 backdrop-blur-md border-gray-300 shadow-lg text-gray-900 border" };

  if (loadingConfig || flowStep === 'loading') {
      return (<div className={`min-h-screen flex items-center justify-center p-4 ${base.bg}`}><div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? 'border-white' : 'border-black'}`}></div></div>);
  }

  if (flowStep === 'landing') {
      return (
          <div className={`min-h-screen flex flex-col items-center justify-center p-6 font-sans ${base.bg}`}>
              <div className="absolute top-6 right-6 z-50">
                  <button onClick={rotarIdioma} className="bg-neutral-100 p-2 rounded-full font-bold text-xs shadow-sm border flex items-center gap-2"><Languages size={14}/> {lang.toUpperCase()}</button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm relative z-10">
                  <img src="/logo.png" alt="Logo" className="h-64 w-auto object-contain mb-8 drop-shadow-2xl animate-in fade-in zoom-in duration-700" />
                  <p className={`text-xl font-medium opacity-80 text-center mb-12 ${base.text}`}>{landingTexts[lang].sub}</p>
                  <button onClick={() => setFlowStep('name')} className={`w-full py-5 rounded-2xl text-xl font-bold shadow-2xl transition-transform active:scale-95 flex items-center justify-center gap-3 ${currentTheme.color} text-white`}><Crown size={24} /> {landingTexts[lang].btn}</button>
                  <Link href="/admin" className={`mt-8 text-sm font-bold opacity-40 hover:opacity-100 flex items-center gap-2 transition-opacity ${base.text}`}><Shield size={14} /> {landingTexts[lang].admin}</Link>
              </div>
          </div>
      );
  }

  if (flowStep === 'name') {
      return (
          <div className={`min-h-screen flex items-center justify-center p-4 ${base.bg}`}>
              <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl ${base.card} animate-in fade-in slide-in-from-bottom-10`}>
                  <h2 className={`text-2xl font-bold mb-6 text-center ${base.text}`}>Empecemos, ¿quién sos?</h2>
                  <div className="flex justify-center mb-6">
                      <label className="relative cursor-pointer group">
                          <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${isDarkMode ? 'border-neutral-700 bg-neutral-800' : 'border-gray-200 bg-gray-100'} flex items-center justify-center`}>
                              {avatarPreview ? (<img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />) : (<Camera size={32} className="opacity-30" />)}
                          </div>
                          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white" size={24}/></div>
                          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
                      </label>
                  </div>
                  <input type="text" value={nombreInvitado} onChange={e => setNombreInvitado(e.target.value)} placeholder="Tu nombre..." className={`w-full p-4 rounded-xl border outline-none text-lg text-center mb-4 ${base.inputContainer} ${base.text}`} autoFocus />
                  <button onClick={handleNameSubmit} disabled={uploadingAvatar} className={`w-full py-4 rounded-xl font-bold ${currentTheme.color} text-white shadow-lg disabled:opacity-50`}>{uploadingAvatar ? "Subiendo foto..." : <>Continuar <ArrowRight className="inline ml-2"/></>}</button>
                  <button onClick={() => setFlowStep('landing')} className={`w-full py-3 mt-2 text-sm opacity-50 ${base.text}`}>Volver</button>
              </div>
          </div>
      );
  }

  if (flowStep === 'password') {
      return (
          <div className={`min-h-screen flex items-center justify-center p-4 ${base.bg}`}>
              <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl ${base.card} animate-in fade-in slide-in-from-bottom-10`}>
                  <h2 className={`text-xl font-bold mb-6 text-center ${base.text}`}>{t.enterPass}</h2>
                  <div className="relative mb-4">
                      <input type={showPassword ? "text" : "password"} value={guestPassInput} onChange={e => setGuestPassInput(e.target.value)} className={`w-full p-4 rounded-xl border outline-none text-center text-lg tracking-widest ${base.inputContainer} ${base.text}`} placeholder="****" autoFocus />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 opacity-50">{showPassword ? <EyeOff /> : <Eye />}</button>
                  </div>
                  <button onClick={handlePasswordSubmit} className={`w-full py-4 rounded-xl font-bold ${currentTheme.color} text-white shadow-lg`}>Ingresar</button>
                  <button onClick={() => setFlowStep('name')} className={`w-full py-3 mt-2 text-sm opacity-50 ${base.text}`}>Volver</button>
              </div>
          </div>
      );
  }

  if (flowStep === 'onboarding') { return ( <OnboardingOverlay show={true} step={onboardingStep} setStep={setOnboardingStep} complete={completeOnboarding} rotarIdioma={rotarIdioma} lang={lang} t={t} userName={nombreInvitado} /> ); }

  return (
    <div className={`min-h-screen font-sans pb-28 transition-colors duration-500 overflow-x-hidden ${base.bg}`}>
      <TopBar base={base} notifEnabled={notifEnabled} toggleNotificaciones={toggleNotificaciones} rotarIdioma={rotarIdioma} lang={lang} onlineUsers={onlineUsers} config={config} isDarkMode={isDarkMode} getBtnClass={getBtnClass} cycleTextSize={cycleTextSize} orden={orden} toggleOrden={toggleOrden} isCompact={isCompact} toggleCompact={toggleCompact} toggleDarkMode={toggleDarkMode} showThemeSelector={showThemeSelector} setShowThemeSelector={setShowThemeSelector} THEMES={THEMES} changeTheme={changeTheme} isInstallable={isInstallable} handleInstallClick={handleInstallClick} onLogout={logoutGuest} userAvatar={avatarPreview} onAvatarClick={() => setImageToView(avatarPreview)} />
      <div className={`w-full p-6 pb-6 rounded-b-[40px] bg-gradient-to-br ${currentTheme.gradient} shadow-2xl relative overflow-hidden`}>
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mt-20 -mr-20 blur-3xl"></div>
         <div className="relative z-10 pt-16">
             <div className="mb-6">
                 {(() => {
                     const msg = getWelcomeMessage();
                     if (msg) {
                         const parts = msg.split('\n');
                         return (<h1 className="text-3xl font-bold leading-tight drop-shadow-md text-white whitespace-pre-wrap">{parts[0]}{parts.length > 1 && (<><br/><span className="opacity-80 font-normal text-xl">{parts.slice(1).join('\n')}</span></>)}</h1>);
                     } else {
                         return (<><h1 className="text-3xl font-bold leading-tight drop-shadow-md text-white">Bienvenido, <br/><span className="text-4xl">{nombreInvitado}</span></h1><p className="mt-2 text-lg text-white/80 font-medium">Disfruta de la mejor comida 🍕🍔</p></>);
                     }
                 })()}
             </div>
             <div className="flex items-center gap-3 text-sm font-medium bg-black/30 p-3 rounded-2xl w-max backdrop-blur-md border border-white/10 text-white animate-in fade-in duration-500 mx-auto mb-4"><span className="text-neutral-300 text-xs font-bold">{currentBannerText}</span></div>
             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-2">{['all','stock','top','to_rate','ordered','new'].map(f => (<button key={f} onClick={() => changeFilter(f as any)} className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${filter === f ? base.activeChip : base.inactiveChip}`}>{f === 'all' ? t.fAll : f === 'stock' ? t.fStock : f === 'top' ? t.fTop : f === 'to_rate' ? t.fRate : f === 'ordered' ? t.fOrdered : t.fNew}</button>))}</div>
         </div>
      </div>

      <div className="px-4 mt-6 relative z-20 max-w-lg mx-auto pb-20">
        {mensaje && (<div className={`fixed top-20 left-4 right-4 p-3 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[100] flex flex-col items-center justify-center animate-bounce-in text-center ${mensaje.tipo === 'alerta' ? 'border-4 border-neutral-900 font-bold' : 'border-2 border-neutral-200 font-bold'} bg-white text-black`}><div className="flex items-center gap-2 mb-1 text-sm">{mensaje.texto}</div>{mensaje.tipo === 'alerta' && (<button onClick={() => setMensaje(null)} className="mt-1 bg-neutral-900 text-white px-6 py-1.5 rounded-full text-xs font-bold shadow-lg active:scale-95 hover:bg-black transition-transform">{t.okBtn}</button>)}</div>)}
        
        {imageToView && (
            <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm" onClick={() => setImageToView(null)}>
                <button onClick={(e) => { e.stopPropagation(); setImageToView(null); }} className="absolute top-28 right-5 text-white/70 hover:text-white z-[10000] drop-shadow-md"><X size={24} /></button>
                <img src={imageToView} alt="Zoom" className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl object-contain mb-8 select-none" onClick={(e) => e.stopPropagation()} />
                {imageToView === avatarPreview && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <label className="bg-white text-black px-6 py-4 rounded-2xl font-bold cursor-pointer flex items-center gap-3 shadow-2xl active:scale-95 transition-transform hover:bg-gray-100 text-lg">
                            {uploadingAvatar ? <span className="animate-pulse">Subiendo...</span> : <><Edit2 size={24}/> Cambiar Foto</>}
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} disabled={uploadingAvatar} />
                        </label>
                    </div>
                )}
            </div>
        )}

        {orderToConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in zoom-in duration-300">
                <div className={`${base.card} w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative border`}>
                    <h3 className={`text-2xl font-black mb-1 ${base.text}`}>{t.confTitle}</h3>
                    <p className={`text-lg font-medium mb-4 ${currentTheme.text}`}>{orderToConfirm.displayName}</p>
                    <div className={`${base.innerCard} rounded-2xl p-4 mb-6`}>
                        <p className={`text-sm leading-relaxed mb-3 ${base.subtext}`}>{orderToConfirm.tipo === 'pizza' ? t.confPizzaDesc : t.confUnitDesc}</p>
                        
                        {/* SELECTOR ADICIONALES */}
                        {orderToConfirm.disponiblesAdicionales && orderToConfirm.disponiblesAdicionales.length > 0 && (
                            <div className="mt-4 border-t border-gray-500/20 pt-3">
                                <p className="text-xs font-bold uppercase mb-2 opacity-70">Adicionales / Extras</p>
                                <div className="space-y-2">
                                    {orderToConfirm.disponiblesAdicionales.map((adi: any) => (
                                        <label key={adi.id} className="flex items-center justify-between cursor-pointer group">
                                            <span className={`text-sm ${selectedAdicionales.includes(adi.nombre_visible) ? 'font-bold text-green-500' : 'opacity-80'}`}>+ {adi.nombre_visible}</span>
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedAdicionales.includes(adi.nombre_visible) ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>{selectedAdicionales.includes(adi.nombre_visible) && <Check size={14} className="text-white"/>}</div>
                                            <input type="checkbox" className="hidden" checked={selectedAdicionales.includes(adi.nombre_visible)} onChange={() => toggleAdicional(adi.nombre_visible)}/>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 font-bold text-sm mt-4"><Clock size={18} className={isDarkMode ? 'text-white' : 'text-black'}/><span className={base.text}>{t.confTime} {formatTime(orderToConfirm.tiempo_coccion || 60)}</span></div>
                    </div>
                    <div className="flex gap-3"><button onClick={() => { setOrderToConfirm(null); setSelectedAdicionales([]); }} className={`flex-1 py-3 rounded-xl font-bold border ${base.subtext}`}>{t.cancelBtn}</button><button onClick={proceedWithOrder} className={`flex-1 py-3 rounded-xl font-bold shadow-lg ${currentTheme.color} text-white`}>{t.confBtn}</button></div>
                </div>
            </div>
        )}

        {showRatingModal && (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"><div className={`${base.card} p-6 rounded-3xl w-full max-w-sm relative shadow-2xl border`}><button onClick={() => setShowRatingModal(false)} className={`absolute top-4 right-4 ${base.subtext} hover:${base.text}`}><X /></button><h3 className={`text-xl font-bold mb-1 ${base.text}`}>{t.rateTitle} {pizzaToRate?.displayName || pizzaToRate?.nombre}</h3><div className="flex justify-center gap-2 mb-6 mt-4">{[1, 2, 3, 4, 5].map(star => (<button key={star} onClick={() => setRatingValue(star)} className="transition-transform hover:scale-110"><Star size={32} fill={star <= ratingValue ? "#eab308" : "transparent"} className={star <= ratingValue ? "text-yellow-500" : "text-neutral-600"} /></button>))}</div><textarea className={`w-full p-3 rounded-xl border outline-none mb-4 resize-none h-24 ${base.input} ${isDarkMode ? 'border-neutral-700 bg-black/50' : 'border-gray-200 bg-gray-50'}`} placeholder="..." value={commentValue} onChange={e => setCommentValue(e.target.value)} /><button onClick={submitRating} disabled={ratingValue === 0} className={`w-full py-3 rounded-xl font-bold shadow-lg ${ratingValue > 0 ? `${currentTheme.color} text-white` : 'bg-neutral-800 text-neutral-500'}`}>{t.sendReview}</button></div></div>)}
        {showLateRatingModal && lateRatingPizza && (<div className="fixed top-24 left-4 right-4 z-[100] animate-bounce-in"><div className={`${base.card} p-4 rounded-2xl shadow-2xl border border-yellow-500/50 flex items-center justify-between gap-3`}><div className="flex items-center gap-3"><div className="bg-yellow-500 p-2 rounded-xl text-black"><Star size={20} fill="black"/></div><div><p className={`text-sm font-bold ${base.text}`}>{t.rateQuestion} {lateRatingPizza.displayName || lateRatingPizza.nombre}?</p><p className={`text-[10px] ${base.subtext}`}>{t.ateTimeAgo} {config.tiempo_recordatorio_minutos || 10} {t.minAgo}</p></div></div><div className="flex gap-2"><button onClick={() => { setShowLateRatingModal(false); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${base.subtext}`}>{t.notNow}</button><button onClick={() => { setShowLateRatingModal(false); openRating(lateRatingPizza); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-500 text-black shadow-lg`}>{t.yes}</button></div></div></div>)}

        <BottomSheet summarySheet={summarySheet} setSummarySheet={setSummarySheet} base={base} isDarkMode={isDarkMode} currentTheme={currentTheme} mySummary={mySummary} t={t} summaryData={summaryData} modificarPedido={modificarPedido} />

        <div className="space-y-3 pb-4">
           {cargando ? <p className={`text-center ${base.subtext} mt-10 animate-pulse`}>{t.loading}</p> : 
             orderedIds.length === 0 ? (<div className="text-center py-10 opacity-60"><p className="text-4xl mb-2">👻</p><p className={`text-sm font-bold ${base.subtext}`}>{getEmptyStateMessage()}</p></div>) :
             orderedIds.map(id => {
               const pizza = enrichedPizzas.find(p => p.id === id);
               if (!pizza) return null;
               return (<FoodCard key={pizza.id} pizza={pizza} base={base} isCompact={isCompact} isDarkMode={isDarkMode} currentTheme={currentTheme} zoomLevel={zoomLevel} t={t} DESC_SIZES={DESC_SIZES} STOCK_SIZES={STOCK_SIZES} setImageToView={setImageToView} miHistorial={miHistorial} misValoraciones={misValoraciones} openRating={openRating} modificarPedido={modificarPedido} />);
           })}
        </div>
      </div>
    </div>
  );
}