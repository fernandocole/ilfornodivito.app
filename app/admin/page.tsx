'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, LogOut, LayoutDashboard, List, ChefHat, BarChart3, ShoppingBag, Settings, 
  Palette, Sun, Moon, ArrowUpNarrowWide, ArrowDownAZ, Maximize2, Minimize2, ShieldAlert,
  Flame, Clock, CheckCircle, Hourglass, Eye, EyeOff, X, Layers, Trash2, Plus, Copy, ExternalLink, Calendar, RefreshCcw, Edit2
} from 'lucide-react';

import { KitchenView } from '../components/admin/views/KitchenView';
import { OrdersView } from '../components/admin/views/OrdersView';
import { InventoryView } from '../components/admin/views/InventoryView';
import { MenuView } from '../components/admin/views/MenuView';
import { RankingView } from '../components/admin/views/RankingView';
import { UsersView } from '../components/admin/views/UsersView';
import { ConfigView } from '../components/admin/views/ConfigView';
import { LogsView } from '../components/admin/views/LogsView';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- HELPERS ---
const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.readAsDataURL(file);
        reader.onload = (event) => { const img = new Image(); img.src = event.target?.result as string; img.onload = () => { const canvas = document.createElement('canvas'); const MAX_WIDTH = 800; const MAX_HEIGHT = 800; let width = img.width; let height = img.height; if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } } canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx?.drawImage(img, 0, 0, width, height); canvas.toBlob((blob) => { if(blob) resolve(blob); else reject(new Error('Canvas error')); }, 'image/jpeg', 0.8); }; }; reader.onerror = (error) => reject(error);
    });
};

const calcularStockDinamico = (receta: any[], inventario: any[]) => {
    if (!receta || receta.length === 0) return 0;
    let min = Infinity;
    receta.forEach(item => {
        const ing = inventario.find(i => i.id === item.ingrediente_id);
        if (ing) {
            const requerida = Number(item.cantidad || item.cantidad_requerida || 0);
            if (requerida > 0) {
                const posible = Math.floor(ing.cantidad_disponible / requerida);
                if (posible < min) min = posible;
            }
        } else {
            min = 0;
        }
    });
    return min === Infinity ? 0 : min;
};

// CORRECCION 1: COLORES BRILLANTES IGUAL A INVITADOS
const THEMES = [
  { name: 'Carbone', color: 'bg-neutral-900', gradient: 'from-neutral-800 to-black', text: 'text-white' },
  { name: 'Turquesa', color: 'bg-cyan-500', gradient: 'from-cyan-400 to-teal-600', text: 'text-cyan-500' },
  { name: 'Pistacho', color: 'bg-lime-500', gradient: 'from-lime-400 to-green-600', text: 'text-lime-500' },
  { name: 'Fuego', color: 'bg-red-600', gradient: 'from-red-500 to-orange-600', text: 'text-red-500' },
  { name: 'Violeta', color: 'bg-violet-600', gradient: 'from-violet-500 to-purple-800', text: 'text-violet-500' },
  { name: 'Insta', color: 'bg-pink-600', gradient: 'from-purple-500 via-pink-500 to-orange-400', text: 'text-pink-500' },
  { name: 'Aurora', color: 'bg-indigo-600', gradient: 'from-blue-500 via-indigo-600 to-purple-600', text: 'text-indigo-500' },
  { name: 'Sunset', color: 'bg-orange-500', gradient: 'from-rose-500 via-orange-500 to-yellow-500', text: 'text-orange-500' },
  { name: 'Oceanic', color: 'bg-blue-600', gradient: 'from-cyan-500 via-blue-600 to-indigo-600', text: 'text-blue-500' },
  { name: 'Berry', color: 'bg-fuchsia-600', gradient: 'from-fuchsia-500 via-purple-600 to-pink-600', text: 'text-fuchsia-500' },
];

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<'cocina' | 'pedidos' | 'menu' | 'ingredientes' | 'usuarios' | 'config' | 'ranking' | 'logs'>('cocina');
  const [sessionDuration, setSessionDuration] = useState(24 * 60 * 60 * 1000); 

  // DATA
  const [pedidos, setPedidos] = useState<any[]>([]); 
  const [pizzas, setPizzas] = useState<any[]>([]);
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [recetas, setRecetas] = useState<any[]>([]);
  const [adicionales, setAdicionales] = useState<any[]>([]); 
  const [reservedState, setReservedState] = useState<Record<string, number>>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [invitadosDB, setInvitadosDB] = useState<any[]>([]); 
  const [valoraciones, setValoraciones] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ porciones_por_pizza: 4, total_invitados: 10, password_invitados: '', categoria_activa: '["General"]', mensaje_bienvenida: '', tiempo_recordatorio_minutos: 10 });
  
  // UI
  const [menuTypeFilter, setMenuTypeFilter] = useState<'all' | 'pizza' | 'burger' | 'other'>('all');
  const [menuSortOrder, setMenuSortOrder] = useState<'alpha' | 'type' | 'date'>('alpha');
  const [inventoryFilterCategory, setInventoryFilterCategory] = useState<string>('Todos');
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({});
  const [imageToView, setImageToView] = useState<string | null>(null);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [onlineGuestList, setOnlineGuestList] = useState<string[]>([]);
  const [edits, setEdits] = useState<Record<string, any>>({});
  const [invitadosCount, setInvitadosCount] = useState(0);
  const prevPedidosCount = useRef(0);

  // FORMULARIOS
  const [newPizzaName, setNewPizzaName] = useState('');
  const [newPizzaDesc, setNewPizzaDesc] = useState('');
  const [newPizzaImg, setNewPizzaImg] = useState('');
  const [newPizzaTime, setNewPizzaTime] = useState(90);
  const [newPizzaCat, setNewPizzaCat] = useState(''); 
  const [newPizzaPortions, setNewPizzaPortions] = useState(4); 
  const [newPizzaType, setNewPizzaType] = useState<'pizza' | 'burger' | 'other'>('pizza');
  const [uploading, setUploading] = useState(false);
  const [newPizzaIngredients, setNewPizzaIngredients] = useState<{ingrediente_id: string, nombre: string, cantidad: number}[]>([]);
  const [newPizzaSelectedIng, setNewPizzaSelectedIng] = useState('');
  const [newPizzaRecipeQty, setNewPizzaRecipeQty] = useState<string | number>('');
  
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkMode, setBulkMode] = useState<'SET' | 'REMOVE'>('SET');
  const [bulkIngId, setBulkIngId] = useState('');
  const [bulkQty, setBulkQty] = useState<string | number>('');
  const [bulkSelectedPizzas, setBulkSelectedPizzas] = useState<string[]>([]);
  
  const [newIngName, setNewIngName] = useState('');
  const [newIngQty, setNewIngQty] = useState<string | number>('');
  const [newIngUnit, setNewIngUnit] = useState('g');
  const [newIngCat, setNewIngCat] = useState('General');
  const [editingIngId, setEditingIngId] = useState<string | null>(null);
  const [editIngForm, setEditIngForm] = useState<any>({});
  const [newGuestName, setNewGuestName] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [tempMotivos, setTempMotivos] = useState<Record<string, string>>({});

  const [showCleanModal, setShowCleanModal] = useState(false);
  const [cleanForm, setCleanForm] = useState({ from: '', to: '', status: 'all', restock: false });
  const [tempRecipeIng, setTempRecipeIng] = useState<Record<string, string>>({});
  const [tempRecipeQty, setTempRecipeQty] = useState<Record<string, string|number>>({});

  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [orden, setOrden] = useState<'estado' | 'nombre'>('estado');
  const [isCompact, setIsCompact] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const base = isDarkMode ? { bg: "bg-neutral-950 text-white", card: "bg-neutral-900 border-neutral-800", input: "bg-black border-neutral-700 text-white placeholder-neutral-600", header: "bg-neutral-900/90 border-neutral-800", subtext: "text-neutral-500", textHead: "text-neutral-300", buttonSec: "bg-neutral-800 text-neutral-400 hover:text-white border-white/10", buttonIcon: "bg-neutral-800 text-neutral-400 hover:text-white", divider: "border-neutral-800", metric: "bg-neutral-900 border-neutral-800", blocked: "bg-red-900/10 border-red-900/30", bar: "bg-neutral-900/50 backdrop-blur-md border-white/10 shadow-lg text-white border", innerCard: "bg-neutral-800 border-neutral-700 text-white", uploadBox: "bg-neutral-800 border-neutral-600 hover:bg-neutral-700" } : { bg: "bg-gray-100 text-gray-900", card: "bg-white border-gray-200 shadow-sm", input: "bg-white border-gray-300 text-gray-900 placeholder-gray-400", header: "bg-white/90 border-gray-200", subtext: "text-gray-500", textHead: "text-gray-800", buttonSec: "bg-white text-gray-600 hover:text-black border-gray-300", buttonIcon: "bg-gray-200 text-gray-600 hover:text-black", divider: "border-gray-200", metric: "bg-white border-gray-200 shadow-sm", blocked: "bg-red-50 border-red-200", bar: "bg-white/50 backdrop-blur-md border-gray-300 shadow-lg text-gray-900 border", innerCard: "bg-neutral-100 border-neutral-200 text-gray-900", uploadBox: "bg-neutral-100 border-neutral-300 hover:bg-neutral-200" };

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  // AUTH
  useEffect(() => {
    const session = localStorage.getItem('vito-admin-session');
    if (session) {
        try { const parsed = JSON.parse(session); if (Date.now() < parsed.expiry) setAutenticado(true); else localStorage.removeItem('vito-admin-session'); } catch (e) { localStorage.removeItem('vito-admin-session'); }
    }
  }, []);

  // REALTIME
  useEffect(() => {
      if (autenticado) {
          cargarDatos();
          const channel = supabase.channel('admin-realtime')
            .on('postgres_changes', { event: '*', schema: 'public' }, () => { setTimeout(() => cargarDatos(), 1000); })
            .subscribe();
          return () => { supabase.removeChannel(channel); };
      }
  }, [autenticado]);

  // STOCK LOCAL RECALC
  useEffect(() => {
      if (autenticado && pizzas.length > 0 && ingredientes.length > 0) {
          recalcularStockLocal();
      }
  }, [ingredientes, recetas, pedidos, adicionales]); 

  const recalcularStockLocal = () => {
       const reservedStock: Record<string, number> = {};
       const pedidosActivos = pedidos.filter(p => p.estado === 'pendiente'); 
       
       pedidosActivos.forEach((pedido: any) => {
           const pizza = pizzas.find((p:any) => p.id === pedido.pizza_id);
           const portions = pizza?.porciones_individuales || config.porciones_por_pizza || 8;
           const fraccion = pedido.cantidad_porciones / portions;
           
           const rec = recetas.filter((r: any) => r.pizza_id === pedido.pizza_id);
           rec.forEach((item: any) => {
               reservedStock[item.ingrediente_id] = (reservedStock[item.ingrediente_id] || 0) + (item.cantidad_requerida * fraccion);
           });

           if(pedido.detalles_adicionales && pedido.detalles_adicionales.length > 0) {
              pedido.detalles_adicionales.forEach((extraName: string) => {
                  const adiDef = adicionales.find(a => a.pizza_id === pedido.pizza_id && a.nombre_visible === extraName);
                  if(adiDef) {
                       reservedStock[adiDef.ingrediente_id] = (reservedStock[adiDef.ingrediente_id] || 0) + adiDef.cantidad_requerida;
                  }
              });
           }
       });
       setReservedState(reservedStock);

       setPizzas(prevPizzas => prevPizzas.map(p => {
           const pRecetas = recetas.filter((r: any) => r.pizza_id === p.id);
           let stockVirtual = 999;
           if (pRecetas.length > 0) {
               let minP = Infinity;
               pRecetas.forEach((item: any) => {
                   const ing = ingredientes.find((i: any) => i.id === item.ingrediente_id);
                   if (ing) {
                       const fisico = ing.cantidad_disponible || 0;
                       const reservado = reservedStock[ing.id] || 0;
                       const disp = Math.max(0, fisico - reservado);
                       const posibles = item.cantidad_requerida > 0 ? Math.floor(disp / item.cantidad_requerida) : 999;
                       if (posibles < minP) minP = posibles;
                   } else { minP = 0; }
               });
               stockVirtual = minP === Infinity ? 0 : minP;
           } else { stockVirtual = 0; }
           return { ...p, stock: stockVirtual };
       }));
  };

  useEffect(() => {
    if (autenticado && 'serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then((registration) => { registration.update(); Notification.requestPermission(); }).catch(err => console.log('Admin SW failed', err));
    }
  }, [autenticado]);

  // --- ONLINE USERS TRACKING (ADMIN) ---
  useEffect(() => {
    if (!autenticado) return;
    const presenceChannel = supabase.channel('online-users', { config: { presence: { key: 'admin' }, }, });
    presenceChannel.on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const allPresences = Object.values(state).flat() as any[];
        const guests = allPresences.filter((p: any) => p.role === 'guest');
        setOnlineUsers(guests.length);
        setOnlineGuestList(guests.map((g: any) => g.name || 'Invitado').filter((n: string) => n));
    }).subscribe(async (status) => { if (status === 'SUBSCRIBED') await presenceChannel.track({ online_at: new Date().toISOString(), role: 'admin' }); });
    return () => { supabase.removeChannel(presenceChannel); };
  }, [autenticado]);

  const stockEstimadoNueva = useMemo(() => calcularStockDinamico(newPizzaIngredients, ingredientes), [newPizzaIngredients, ingredientes]);
  const activeCategories: string[] = useMemo(() => { try { const parsed = JSON.parse(config.categoria_activa); if (parsed === 'Todas' || (Array.isArray(parsed) && parsed.length === 0)) return []; return Array.isArray(parsed) ? parsed : ['General']; } catch { return ['General']; } }, [config.categoria_activa]);
  const uniqueCategories = useMemo(() => { const cats = new Set<string>(); pizzas.forEach(p => { if(p.categoria) cats.add(p.categoria.trim()); }); return Array.from(cats).sort(); }, [pizzas]);

  const metricas = useMemo(() => { let lista = pizzas.filter(p => p.activa); if (activeCategories.length > 0 && !activeCategories.includes('Todas')) { lista = lista.filter(p => activeCategories.includes(p.categoria || 'General') || p.cocinando || (pedidos.some(ped => ped.pizza_id === p.id)) ); } const listaProcesada = lista.map(pizza => { const activeOrders = pedidos.filter(p => p.pizza_id === pizza.id && p.estado !== 'entregado'); const deliveredOrders = pedidos.filter(p => p.pizza_id === pizza.id && p.estado === 'entregado'); const enEspera = activeOrders.filter(p => p.estado === 'pendiente').reduce((acc:number, c:any) => acc + c.cantidad_porciones, 0); const enHorno = activeOrders.filter(p => p.estado === 'cocinando').reduce((acc:number, c:any) => acc + c.cantidad_porciones, 0); const entregadas = deliveredOrders.reduce((acc:number, c:any) => acc + c.cantidad_porciones, 0); const totalPendientes = enEspera + enHorno; const target = pizza.porciones_individuales || config.porciones_por_pizza; return { ...pizza, totalPendientes, enEspera, enHorno, entregadas, completas: Math.floor(enHorno / target), faltan: target - (enHorno % target), target, percent: ((enHorno % target) / target) * 100, pedidosPendientes: activeOrders, stockRestante: pizza.stock }; }); return listaProcesada.sort((a, b) => { if (a.cocinando && !b.cocinando) return -1; if (!a.cocinando && b.cocinando) return 1; if (orden === 'nombre') return a.nombre.localeCompare(b.nombre); return b.totalPendientes - a.totalPendientes; }); }, [pizzas, pedidos, config, orden, activeCategories]); 
  const stats = useMemo(() => { let waiting = 0; let cooking = 0; let delivered = 0; const hungryPeople = new Set(); pedidos.forEach(p => { if (p.estado === 'pendiente') { hungryPeople.add(p.invitado_nombre.toLowerCase()); waiting += p.cantidad_porciones; } else if (p.estado === 'cocinando') { hungryPeople.add(p.invitado_nombre.toLowerCase()); cooking += p.cantidad_porciones; } else if (p.estado === 'entregado') { delivered += p.cantidad_porciones; } }); return { waiting, cooking, delivered, hungryPeople: hungryPeople.size }; }, [pedidos, pizzas]);
  const pedidosAgrupados = useMemo(() => { return Array.from(new Set(pedidos.map(p => p.invitado_nombre.toLowerCase()))).map(nombre => { const susPedidos = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nombre); const nombreReal = susPedidos[0]?.invitado_nombre || nombre; const detalle = pizzas.map(pz => { const ped = susPedidos.filter(p => p.pizza_id === pz.id); if (ped.length === 0) return null; const entr = ped.filter(p => p.estado === 'entregado').reduce((acc, c) => acc + c.cantidad_porciones, 0); const pendientesArr = ped.filter(p => p.estado === 'pendiente'); const pend = pendientesArr.reduce((acc, c) => acc + c.cantidad_porciones, 0); const oldestPending = pendientesArr.length > 0 ? pendientesArr.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0].created_at : null; const enHorno = ped.filter(p => p.estado === 'cocinando').reduce((acc, c) => acc + c.cantidad_porciones, 0); const ads: string[] = []; ped.forEach(p => { if(p.detalles_adicionales) ads.push(...p.detalles_adicionales); }); return { id: pz.id, nombre: pz.nombre, entregada: entr, enHorno, enEspera: pend, oldestPending: oldestPending, adicionales: ads }; }).filter(Boolean); const totalEnHorno = detalle.reduce((acc, d) => acc + (d?.enHorno || 0), 0); const totalEnEspera = detalle.reduce((acc, d) => acc + (d?.enEspera || 0), 0); const totalPendienteGeneral = totalEnHorno + totalEnEspera; return { nombre: nombreReal, detalle, totalPendienteGeneral, totalEnHorno, totalEnEspera }; }).sort((a, b) => b.totalPendienteGeneral - a.totalPendienteGeneral); }, [pedidos, pizzas]);
  const ranking = useMemo(() => { return pizzas.map(p => { const vals = valoraciones.filter(v => v.pizza_id === p.id); const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b.rating, 0) / vals.length) : 0; const orders = pedidos.filter(ped => ped.pizza_id === p.id).reduce((acc, c) => acc + c.cantidad_porciones, 0); return { ...p, avg: parseFloat(avg.toFixed(1)), count: vals.length, totalOrders: orders }; }).sort((a, b) => b.avg - a.avg); }, [pizzas, valoraciones, pedidos]);
  const allUsersList = useMemo(() => { const orderCounts: Record<string, number> = {}; pedidos.forEach(p => { const k = p.invitado_nombre.toLowerCase(); orderCounts[k] = (orderCounts[k] || 0) + p.cantidad_porciones; }); const map = new Map(); invitadosDB.forEach(u => { const k = u.nombre.toLowerCase(); const isWebOrigin = u.origen === 'web'; map.set(k, { ...u, totalOrders: orderCounts[k] || 0, source: isWebOrigin ? 'ped' : 'db', origen: u.origen || 'admin' }); }); Object.keys(orderCounts).forEach(key => { if (!map.has(key)) { const realName = pedidos.find(p => p.invitado_nombre.toLowerCase() === key)?.invitado_nombre || key; map.set(key, { id: null, nombre: realName, bloqueado: false, source: 'ped', totalOrders: orderCounts[key], origen: 'web' }); } }); return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre)); }, [invitadosDB, pedidos]);

  // --- HELPER FUNCTIONS ---
  const toggleDarkMode = () => { setIsDarkMode(!isDarkMode); localStorage.setItem('vito-dark-mode', String(!isDarkMode)); };
  const toggleOrden = () => setOrden(o => o==='estado'?'nombre':'estado');
  const toggleCompact = () => setIsCompact(!isCompact);
  const selectTheme = (t:any) => { setCurrentTheme(t); setShowThemeSelector(false); window.dispatchEvent(new Event('storage')); };
  
  const updateLogName = async (id:string, n:string) => { await supabase.from('access_logs').update({invitado_nombre: n}).eq('id', id); refreshLogsOnly(); };
  
  const handleImageUpload = async (event: any, pizzaId: string | null = null) => { 
      const file = event.target.files?.[0]; if (!file) return; setUploading(true); 
      try { 
          const compressedBlob = await compressImage(file); const fileName = `${Date.now()}.jpg`; 
          const { error } = await supabase.storage.from('pizzas').upload(fileName, new File([compressedBlob], file.name, { type: 'image/jpeg' })); 
          if (error) throw error; 
          const { data } = supabase.storage.from('pizzas').getPublicUrl(fileName); 
          if(pizzaId) handleLocalEdit(pizzaId, 'imagen_url', data.publicUrl); else setNewPizzaImg(data.publicUrl); 
      } catch (e: any) { alert('Error: ' + e.message); } finally { setUploading(false); } 
  };

  const handleLocalEdit = (id: string, field: string, value: any) => { setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } })); };
  const updateLocalRecipe = (pizzaId: string, newRecipeList: any[]) => { handleLocalEdit(pizzaId, 'local_recipe', newRecipeList); };

  const ingresar = async (e?: React.FormEvent) => { 
    if (e) e.preventDefault(); 
    let { data } = await supabase.from('configuracion_dia').select('*').single(); 
    if (!data) { const { data: n } = await supabase.from('configuracion_dia').insert([{ password_admin: 'admin' }]).select().single(); data = n; } 
    if (data && data.password_admin === password) { setAutenticado(true); setConfig(data); const expiry = Date.now() + sessionDuration; localStorage.setItem('vito-admin-session', JSON.stringify({ expiry })); cargarDatos(); } 
    else alert('Incorrecto'); 
  };

  const logout = () => { if(confirm("¿Cerrar sesión de administrador?")) { localStorage.removeItem('vito-admin-session'); setAutenticado(false); } };
  const refreshLogsOnly = async () => { const { data } = await supabase.from('access_logs').select('*').order('created_at', { ascending: false }).limit(100); if (data) setLogs(data); };
  const sendAdminNotification = async (title: string, body: string) => { if ('serviceWorker' in navigator && navigator.serviceWorker.ready) { try { const registration = await navigator.serviceWorker.ready; registration.showNotification(title, { body, icon: '/icon.png' } as any); return; } catch (e) {} } if (Notification.permission === 'granted') new Notification(title, { body, icon: '/icon.png' }); };

  const actualizarStockGlobal = async () => { const now = new Date(); if (now.getHours() < 6) now.setDate(now.getDate() - 1); now.setHours(6, 0, 0, 0); const iso = now.toISOString(); const [ { data: allRecetas }, { data: allIngs }, { data: allPizzas }, { data: allPendientes }, { data: configDia } ] = await Promise.all([ supabase.from('recetas').select('*'), supabase.from('ingredientes').select('*'), supabase.from('menu_pizzas').select('*'), supabase.from('pedidos').select('*').neq('estado', 'entregado').gte('created_at', iso), supabase.from('configuracion_dia').select('*').single() ]); if(!allRecetas || !allIngs || !allPizzas || !allPendientes || !configDia) return; setRecetas(allRecetas); setIngredientes(allIngs); setPizzas(allPizzas); };
  
  const cargarDatos = async () => { const now = new Date(); if (now.getHours() < 6) now.setDate(now.getDate() - 1); now.setHours(6, 0, 0, 0); const iso = now.toISOString(); const [piz, ing, rec, ped, inv, conf, val, logsData, adi] = await Promise.all([ supabase.from('menu_pizzas').select('*').order('created_at', { ascending: true }), supabase.from('ingredientes').select('*').order('nombre'), supabase.from('recetas').select('*'), supabase.from('pedidos').select('*').gte('created_at', iso).order('created_at', { ascending: true }), supabase.from('lista_invitados').select('*').order('nombre'), supabase.from('configuracion_dia').select('*').single(), supabase.from('valoraciones').select('*').gte('created_at', iso).order('created_at', { ascending: false }), supabase.from('access_logs').select('*').order('created_at', { ascending: false }).limit(100), supabase.from('menu_adicionales').select('*') ]); if(piz.data) setPizzas(piz.data); if(ing.data) setIngredientes(ing.data); if(rec.data) setRecetas(rec.data); if(adi.data) setAdicionales(adi.data); if(ped.data) { setPedidos(ped.data); setInvitadosCount(new Set(ped.data.map((p: any) => p.invitado_nombre.toLowerCase())).size); if (prevPedidosCount.current > 0 && ped.data.length > prevPedidosCount.current) { sendAdminNotification("¡Nuevos Pedidos!", `Han entrado ${ped.data.length - prevPedidosCount.current} pedidos nuevos.`); } prevPedidosCount.current = ped.data.length; } if(inv.data) { setInvitadosDB(inv.data); const map: Record<string, string> = {}; inv.data.forEach((u: any) => { if(u.avatar_url) map[u.nombre.toLowerCase().trim()] = u.avatar_url; }); setAvatarMap(map); } if(conf.data) setConfig(conf.data); if(val.data) setValoraciones(val.data); if(logsData.data) setLogs(logsData.data); if(piz.data && ing.data && rec.data && ped.data) recalcularStockLocal(); };

  // --- ACTIONS ---
  const addAdicional = async (pizzaId: string, ingId: string, qty: number, nombre: string) => { if (!pizzaId || !ingId || qty <= 0 || !nombre) return alert("Datos incompletos"); const { error } = await supabase.from('menu_adicionales').insert([{ pizza_id: pizzaId, ingrediente_id: ingId, cantidad_requerida: qty, nombre_visible: nombre }]); if (error) alert("Error creando adicional"); else { alert("Adicional agregado"); cargarDatos(); } };
  const delAdicional = async (id: string) => { if (!confirm("¿Borrar este adicional?")) return; await supabase.from('menu_adicionales').delete().eq('id', id); cargarDatos(); };
  
  // 1. MOVER AL HORNO: Descuenta Receta Base + Descuenta Extras de DB
  const moverAlHorno = async (p: any, idsSeleccionados?: string[]) => { 
      const pendientes = p.pedidosPendientes.filter((ped: any) => ped.estado === 'pendiente'); 
      if (pendientes.length === 0) return; 
      
      const target = p.porciones_individuales || config.porciones_por_pizza || 4; 
      let finalTargets = [];
      let unitsToCook = 0;

      if (idsSeleccionados && idsSeleccionados.length > 0) {
          finalTargets = pendientes.filter((x:any) => idsSeleccionados.includes(x.id));
          const totalP = finalTargets.reduce((a:number,b:any) => a+b.cantidad_porciones,0);
          unitsToCook = Math.ceil(totalP / target);
      } else {
          let cupo = target;
          for(const pd of pendientes) { if(cupo<=0) break; finalTargets.push(pd); cupo -= pd.cantidad_porciones; }
          unitsToCook = 1;
      }

      if(finalTargets.length === 0) return;
      const ids = finalTargets.map((x:any) => x.id);

      setPedidos(prev => prev.map(o => ids.includes(o.id) ? { ...o, estado: 'cocinando' } : o));
      const updates = [];
      updates.push(supabase.from('pedidos').update({ estado: 'cocinando' }).in('id', ids));

      const totalDeductions: Record<string, number> = {};
      
      // Base
      const rec = recetas.filter(r => r.pizza_id === p.id);
      rec.forEach(r => { totalDeductions[r.ingrediente_id] = (totalDeductions[r.ingrediente_id] || 0) + (r.cantidad_requerida * unitsToCook); });
      
      // Extras
      finalTargets.forEach((ord: any) => {
          if(ord.detalles_adicionales) ord.detalles_adicionales.forEach((n:string) => {
              const adi = adicionales.find(a => a.pizza_id === p.id && a.nombre_visible === n);
              if(adi) totalDeductions[adi.ingrediente_id] = (totalDeductions[adi.ingrediente_id] || 0) + adi.cantidad_requerida;
          });
      });

      // Aplicar descuentos
      for (const ingId in totalDeductions) {
          const ing = ingredientes.find(i => i.id === ingId);
          if (ing) {
              const deduct = totalDeductions[ingId];
              const newQ = ing.cantidad_disponible - deduct;
              setIngredientes(prev => prev.map(i => i.id === ingId ? {...i, cantidad_disponible: newQ} : i));
              updates.push(supabase.from('ingredientes').update({cantidad_disponible: newQ}).eq('id', ingId));
          }
      }

      if(!p.cocinando) updates.push(supabase.from('menu_pizzas').update({ cocinando: true, cocinando_inicio: new Date().toISOString() }).eq('id', p.id));
      await Promise.all(updates);
  };

  // 2. REVERTIR ESTADO
  const revertirEstado = async (p: any, accion: 'sacar_horno' | 'cancelar_espera', idsSeleccionados: string[] = []) => {
      let targets = [];
      const source = accion === 'sacar_horno' ? p.pedidosPendientes.filter((o:any) => o.estado === 'cocinando') : p.pedidosPendientes.filter((o:any) => o.estado === 'pendiente');
      if (idsSeleccionados.length > 0) targets = source.filter((x:any) => idsSeleccionados.includes(x.id));
      else targets = source;

      if(targets.length === 0) return;
      const ids = targets.map((x:any) => x.id);

      if (accion === 'sacar_horno') {
          if(!confirm("¿Devolver de horno a espera? (Se repondrá stock)")) return;
          
          setPedidos(prev => prev.map(o => ids.includes(o.id) ? { ...o, estado: 'pendiente' } : o));
          await supabase.from('pedidos').update({ estado: 'pendiente' }).in('id', ids);
          
          const remainingInOven = p.pedidosPendientes.filter((x:any) => x.estado === 'cocinando' && !ids.includes(x.id));
          if(remainingInOven.length === 0) {
              await supabase.from('menu_pizzas').update({ cocinando: false, cocinando_inicio: null }).eq('id', p.id);
          }

          // DEVOLVER STOCK BASE
          const rec = recetas.filter(r => r.pizza_id === p.id);
          const portions = p.porciones_individuales || config.porciones_por_pizza || 1;
          const totalPorciones = targets.reduce((a:number, b:any) => a + b.cantidad_porciones, 0);
          const unitsToReturn = Math.ceil(totalPorciones / portions);

          const updates = [];
          for (const item of rec) {
              const ing = ingredientes.find(i => i.id === item.ingrediente_id);
              if (ing) {
                  const newQty = ing.cantidad_disponible + (item.cantidad_requerida * unitsToReturn);
                  setIngredientes(prev => prev.map(i => i.id === ing.id ? { ...i, cantidad_disponible: newQty } : i));
                  updates.push(supabase.from('ingredientes').update({ cantidad_disponible: newQty }).eq('id', ing.id));
              }
          }
          
          // Devolver Extras
          const extrasToReturn: Record<string, number> = {};
          targets.forEach((ord: any) => {
              if(ord.detalles_adicionales) {
                   ord.detalles_adicionales.forEach((n:string) => {
                      const adi = adicionales.find(a => a.pizza_id === p.id && a.nombre_visible === n);
                      if(adi) extrasToReturn[adi.ingrediente_id] = (extrasToReturn[adi.ingrediente_id] || 0) + adi.cantidad_requerida;
                  });
              }
          });
          
          for (const ingId in extrasToReturn) {
              const ing = ingredientes.find(i => i.id === ingId);
              if (ing) {
                 const toAdd = extrasToReturn[ingId];
                 const newQty = ing.cantidad_disponible + toAdd;
                 setIngredientes(prev => prev.map(i => i.id === ingId ? { ...i, cantidad_disponible: newQty } : i));
                 updates.push(supabase.from('ingredientes').update({ cantidad_disponible: newQty }).eq('id', ingId));
              }
          }
          await Promise.all(updates);

      } else {
          // CANCELAR ESPERA -> SOLO BORRAR
          if(!confirm("¿Eliminar pedidos en espera?")) return;
          setPedidos(prev => prev.filter(o => !ids.includes(o.id)));
          await supabase.from('pedidos').delete().in('id', ids);
      }
      setTimeout(() => cargarDatos(), 500);
  };

  const entregar = async (p: any, idsSeleccionados?: string[]) => { 
    const enHorno = p.pedidosPendientes.filter((ped: any) => ped.estado === 'cocinando'); 
    if (enHorno.length === 0) return; 

    let idsToUpdate: string[] = [];

    if (idsSeleccionados && idsSeleccionados.length > 0) {
        idsToUpdate = idsSeleccionados;
    } else {
        const target = p.porciones_individuales || config.porciones_por_pizza || 4; 
        let cupo = target;
        // FIFO: Ordenar por fecha creación ascendente (más viejos primero)
        const ordenados = [...enHorno].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        for(const pd of ordenados){ 
            if(cupo <= 0) break; 
            idsToUpdate.push(pd.id); 
            cupo -= pd.cantidad_porciones; 
        } 
    }

    if(idsToUpdate.length > 0) { 
        const entregas = enHorno.filter((e:any) => idsToUpdate.includes(e.id));
        const counts: Record<string, number> = {};
        entregas.forEach((e:any) => { const name = e.invitado_nombre; counts[name] = (counts[name] || 0) + 1; });
        const nombres = Object.entries(counts).map(([name, count]) => `${name} (${count})`).join(', ');

        if(!confirm(`¿Entregar pedidos de: ${nombres}?`)) return; 
        
        setPedidos(prev => prev.map(ped => idsToUpdate.includes(ped.id) ? { ...ped, estado: 'entregado' } : ped)); 
        
        await supabase.from('pedidos').update({ estado: 'entregado' }).in('id', idsToUpdate); 
        
        const quedanEnHorno = enHorno.filter((x:any) => !idsToUpdate.includes(x.id)).length; 
        if (quedanEnHorno === 0) { 
            await supabase.from('menu_pizzas').update({ cocinando: false, cocinando_inicio: null }).eq('id', p.id); 
            setPizzas(prev => prev.map(pz => pz.id === p.id ? { ...pz, cocinando: false } : pz));
        } 
    } 
  };

  const eliminarUnidad = async (nombre: string, pizzaId: string) => {
      const cand = pedidos.find(p => p.invitado_nombre === nombre && p.pizza_id === pizzaId && p.estado !== 'entregado') 
                   || pedidos.find(p => p.invitado_nombre === nombre && p.pizza_id === pizzaId && p.estado === 'entregado');
      
      if(cand) {
          if(!confirm("¿Eliminar?")) return;
          if(cand.estado === 'cocinando') {
             alert("Por favor, devuelve el pedido al estado 'En Espera' desde el panel de Cocina antes de eliminarlo.");
             return; 
          }
          setPedidos(prev => prev.filter(p => p.id !== cand.id));
          await supabase.from('pedidos').delete().eq('id', cand.id);
      }
  };
  
  // FUNCION NUEVA PARA ACTUALIZAR TOTAL INVITADOS
  const updateTotalGuests = async (n: number) => {
     const val = Math.max(0, n);
     setConfig({ ...config, total_invitados: val });
     await supabase.from('configuracion_dia').update({ total_invitados: val }).eq('id', config.id);
  };

  const eliminarUnidadPorEstado = async (nombre: string, pizzaId: string, estado: string) => { const candidate = pedidos.find(p => p.invitado_nombre === nombre && p.pizza_id === pizzaId && p.estado === estado); if (candidate) { if (!confirm(`¿Eliminar?`)) return; if (estado === 'cocinando') { alert("Devuelve stock primero."); return; } await supabase.from('pedidos').delete().eq('id', candidate.id); setPedidos(prev => prev.filter(p => p.id !== candidate.id)); cargarDatos(); } };
  const cleanOrdersByState = async (status: string) => { if(confirm("¿Borrar?")) await supabase.from('pedidos').delete().eq('estado', status); cargarDatos(); };
  const openCleanModal = () => setShowCleanModal(true);
  const handleAdvancedClean = async () => { const { from, to, status, restock, user } = cleanForm as any; if (!from || !to) return alert("Faltan fechas"); if(!confirm("Confirmar limpieza?")) return; let q = supabase.from('pedidos').select('*').gte('created_at', new Date(from).toISOString()).lte('created_at', new Date(to).toISOString()); if (status !== 'all') q = q.eq('estado', status); if (user && user !== 'all') q = q.eq('invitado_nombre', user); const { data: dels } = await q; if(!dels?.length) return alert("Nada que borrar"); const ids = dels.map(x=>x.id); await supabase.from('pedidos').delete().in('id', ids); alert(`Borrados ${ids.length}`); setShowCleanModal(false); cargarDatos(); };
  const resetAllOrders = async () => { if(confirm("¿Reset Todo?")) { await supabase.from('pedidos').delete().neq('id', '0000'); await supabase.from('menu_pizzas').update({cocinando:false}).neq('id','0000'); cargarDatos(); }};
  const delAllVal = async () => { await supabase.from('valoraciones').delete().neq('id','0000'); cargarDatos(); };
  const delValPizza = async (id:string) => { await supabase.from('valoraciones').delete().eq('pizza_id', id); cargarDatos(); };
  const eliminarPedidosGusto = async (nom: string, pid: string) => { if(!confirm(`¿Borrar pendientes?`)) return; const ids = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nom.toLowerCase() && p.pizza_id === pid && p.estado === 'pendiente').map(p => p.id); if(ids.length) await supabase.from('pedidos').delete().in('id', ids); cargarDatos(); };
  const forceStopCooking = async (pizzaId: string) => { if(!confirm("¿Forzar detención?")) return; await supabase.from('menu_pizzas').update({ cocinando: false, cocinando_inicio: null }).eq('id', pizzaId); await cargarDatos(); };
  const addToNewPizzaRecipe = () => { if(newPizzaSelectedIng) { const [id,n]=newPizzaSelectedIng.split('|'); setNewPizzaIngredients(p=>[...p,{ingrediente_id:id,nombre:n,cantidad:Number(newPizzaRecipeQty)}]); } };
  const removeFromNewPizzaRecipe = (i:number) => setNewPizzaIngredients(p=>p.filter((_,idx)=>idx!==i));
  const addP = async (ex?:any[]) => { 
      if(!newPizzaName)return; 
      const {data} = await supabase.from('menu_pizzas').insert([{nombre:newPizzaName, descripcion:newPizzaDesc, stock:0, imagen_url:newPizzaImg, tiempo_coccion:newPizzaTime, categoria:newPizzaCat, activa:true, porciones_individuales:newPizzaPortions, tipo:newPizzaType}]).select().single();
      if(data) {
          if(newPizzaIngredients.length) await supabase.from('recetas').insert(newPizzaIngredients.map(r=>({pizza_id:data.id, ingrediente_id:r.ingrediente_id, cantidad_requerida:r.cantidad})));
          if(ex?.length) await supabase.from('menu_adicionales').insert(ex.map(x=>({pizza_id:data.id, ingrediente_id:x.ingrediente_id, cantidad_requerida:x.cantidad, nombre_visible:x.nombre_visible})));
      }
      setNewPizzaName(''); setNewPizzaIngredients([]); cargarDatos();
  };
  const updateP = (id:string, f:string, v:any) => { supabase.from('menu_pizzas').update({[f]:v}).eq('id',id); setPizzas(p=>p.map(x=>x.id===id?{...x,[f]:v}:x)); };
  const duplicateP = async(p:any) => { 
      if(!confirm("Duplicar?")) return;
      const {data} = await supabase.from('menu_pizzas').insert([{...p, id: undefined, nombre: p.nombre + ' (Copia)', created_at: undefined}]).select().single();
      if(data) {
          const rec = recetas.filter(r=>r.pizza_id === p.id);
          if(rec.length) await supabase.from('recetas').insert(rec.map(r=>({pizza_id:data.id, ingrediente_id:r.ingrediente_id, cantidad_requerida:r.cantidad_requerida})));
      }
      cargarDatos();
  };
  const delP = async(id:string) => { if(confirm("Borrar?")) { await supabase.from('menu_pizzas').delete().eq('id', id); cargarDatos(); } };
  const changePass = async() => { await supabase.from('configuracion_dia').update({password_admin:newPass}).eq('id',config.id); };
  const toggleCategory = async(c:string) => { const s = new Set(activeCategories); if(s.has(c))s.delete(c); else s.add(c); setConfig({...config, categoria_activa: JSON.stringify(Array.from(s))}); supabase.from('configuracion_dia').update({categoria_activa: JSON.stringify(Array.from(s))}).eq('id',config.id); };
  const addU = async() => { await supabase.from('lista_invitados').insert([{nombre:newGuestName}]); cargarDatos(); };
  const toggleB = async(u:any) => { await supabase.from('lista_invitados').update({bloqueado:!u.bloqueado}).eq('id',u.id); cargarDatos(); };
  const guardarMotivo = async(n:string, u:any) => { await supabase.from('lista_invitados').update({motivo_bloqueo:tempMotivos[n]}).eq('id',u.id); };
  const resetU = async(n:string) => { if(confirm("Borrar?")) await supabase.from('pedidos').delete().eq('invitado_nombre',n); cargarDatos(); };
  const eliminarUsuario = async(n:string, u:any) => { if(confirm("Eliminar?")) { await supabase.from('pedidos').delete().eq('invitado_nombre',n); await supabase.from('lista_invitados').delete().eq('id',u.id); cargarDatos(); } };
  const savePizzaChanges = async(id:string) => { 
      const e = edits[id]; if(!e)return; 
      if(e.local_recipe) { await supabase.from('recetas').delete().eq('pizza_id',id); await supabase.from('recetas').insert(e.local_recipe.map((r:any)=>({pizza_id:id, ingrediente_id:r.ingrediente_id, cantidad_requerida:r.cantidad_requerida}))); }
      const {local_recipe, ...rest} = e; await supabase.from('menu_pizzas').update(rest).eq('id',id);
      setEdits(prev=>{const n={...prev}; delete n[id]; return n;}); cargarDatos();
  };
  const cancelChanges = (id:string) => setEdits(prev=>{const n={...prev}; delete n[id]; return n;});
  const addToExistingPizza = (pid:string, iid:string, n:string, q:any, cur:any) => updateLocalRecipe(pid, [...cur, {ingrediente_id: iid, nombre: n, cantidad_requerida: q}]);
  const removeFromExistingPizza = (pid:string, idx:number, cur:any) => updateLocalRecipe(pid, cur.filter((_:any,i:number)=>i!==idx));
  const addIng = async() => { await supabase.from('ingredientes').insert([{nombre:newIngName, cantidad_disponible:newIngQty, unidad:newIngUnit, categoria:newIngCat}]); cargarDatos(); };
  const delIng = async(id:string) => { await supabase.from('ingredientes').delete().eq('id',id); cargarDatos(); };
  const saveEditIng = async(id:string) => { await supabase.from('ingredientes').update({nombre:editIngForm.nombre, cantidad_disponible:editIngForm.cantidad}).eq('id',id); setEditingIngId(null); cargarDatos(); };
  
  // CORRECCIÓN 5: START EDIT INGREDIENT FIX
  const startEditIng = (i:any) => { 
      setEditingIngId(i.id); 
      setEditIngForm({ nombre: i.nombre, cantidad: i.cantidad_disponible, unidad: i.unidad, categoria: i.categoria || 'General' }); 
  };
  
  const cancelEditIng = () => setEditingIngId(null);
  const quickUpdateStock = async(id:string, c:number, a:number) => { await supabase.from('ingredientes').update({cantidad_disponible:c+a}).eq('id',id); cargarDatos(); };
  const saveBulkIngredient = async () => { if (!bulkIngId || bulkSelectedPizzas.length === 0) { alert("Selecciona ingrediente y al menos una pizza."); return; } if (bulkMode === 'SET' && Number(bulkQty) <= 0) { alert("Ingresa una cantidad válida."); return; } const actionText = bulkMode === 'REMOVE' ? 'ELIMINAR ingrediente de' : 'Aplicar cambios a'; const confirmText = `¿${actionText} ${bulkSelectedPizzas.length} items?`; if (!confirm(confirmText)) return; try { if (bulkMode === 'REMOVE') { for (const pid of bulkSelectedPizzas) { await supabase.from('recetas').delete().eq('pizza_id', pid).eq('ingrediente_id', bulkIngId); } alert("¡Ingrediente eliminado de la selección!"); } else { for (const pid of bulkSelectedPizzas) { const { data: existingRecipe } = await supabase.from('recetas').select('*').eq('pizza_id', pid).eq('ingrediente_id', bulkIngId).single(); if (existingRecipe) await supabase.from('recetas').update({ cantidad_requerida: Number(bulkQty) }).eq('id', existingRecipe.id); else await supabase.from('recetas').insert([{ pizza_id: pid, ingrediente_id: bulkIngId, cantidad_requerida: Number(bulkQty) }]); } alert("¡Aplicado correctamente!"); } setShowBulkModal(false); setBulkSelectedPizzas([]); setBulkQty(''); setBulkIngId(''); await cargarDatos(); await actualizarStockGlobal(); } catch (error: any) { alert("Error aplicando cambios masivos: " + error.message); } };
  const toggleBulkPizza = (pid: string) => { setBulkSelectedPizzas(prev => prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]); };


  // CORRECCIÓN 4: LOGIN COMPLETO
  if (!autenticado) {
      return (
          <div className={`min-h-screen flex items-center justify-center p-4 pb-40 ${base.bg}`}>
            <div className={`w-full max-w-md p-8 rounded-3xl border shadow-xl ${base.card}`}>
              <div className="flex justify-center mb-6"><img src="/logo.png" alt="Logo" className="h-48 w-auto object-contain drop-shadow-xl" /></div>
              <form onSubmit={ingresar} className="flex flex-col gap-4">
                  <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className={`w-full p-4 rounded-xl border outline-none ${base.input}`} placeholder="Contraseña..." autoFocus />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={24} /> : <Eye size={24} />}</button>
                  </div>
                  <button type="submit" className={`w-full ${currentTheme.color} text-white font-bold py-4 rounded-xl hover:opacity-90 transition`}>ENTRAR</button>
              </form>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                  <button onClick={() => window.location.href='/'} className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 font-bold ${base.buttonSec}`}><Users size={20} /> MODO INVITADOS</button>
              </div>
            </div>
          </div>
      );
  }

  return (
    <div className={`min-h-screen font-sans pb-28 w-full ${base.bg}`}>
       {/* FONDO GRADIENTE (Z-INDEX 0) - CORREGIDO */}
       <div className={`absolute top-0 left-0 right-0 h-64 bg-gradient-to-b ${currentTheme.gradient} opacity-20 z-0 rounded-b-[3rem] pointer-events-none`}></div>

       {/* HEADER (Z-INDEX 50) */}
       <div className={`fixed top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none`}>
          <div className={`p-2 rounded-full shadow-lg backdrop-blur-md border flex items-center gap-3 pointer-events-auto cursor-pointer ${base.bar}`} onClick={() => setShowOnlineModal(true)}>
              <img src="/logo.png" className="h-10 w-auto" />
              <div className="leading-tight">
                  <h1 className="font-bold text-sm">Modo Pizzaiolo</h1>
                  <p className="text-[10px] opacity-70 flex items-center gap-1">
                      <Users size={10} className="text-green-500 animate-pulse"/> {onlineUsers} / {config.total_invitados || 0}
                  </p>
              </div>
          </div>
          
          {/* CORRECCIÓN 2 y 3: HEADER EN DOS LINEAS Y BOTONES PEQUEÑOS */}
          <div className="flex flex-col items-end gap-2 pointer-events-auto">
              <div className="flex gap-2">
                  <div className="relative">
                      <button onClick={() => setShowThemeSelector(!showThemeSelector)} className={`p-2 rounded-full border shadow-lg ${base.bar} ${currentTheme.text}`}>
                          <Palette size={20} />
                      </button>
                      {showThemeSelector && (
                          <div className={`absolute top-12 right-0 p-3 rounded-2xl shadow-xl border grid grid-cols-5 gap-2 w-64 ${base.card}`}>
                              {THEMES.map(t => (
                                  <button key={t.name} onClick={() => selectTheme(t)} className={`w-8 h-8 rounded-full ${t.color} border-2 ${currentTheme.name === t.name ? 'border-white shadow-lg scale-110' : 'border-transparent opacity-80'}`} title={t.name}></button>
                              ))}
                          </div>
                      )}
                  </div>
                  <button onClick={toggleDarkMode} className={`p-2 rounded-full border shadow-lg ${base.bar}`}>
                      {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
                  </button>
                  <button onClick={toggleCompact} className={`p-2 rounded-full border shadow-lg ${base.bar}`}>
                      {isCompact ? <Maximize2 size={20}/> : <Minimize2 size={20}/>}
                  </button>
                  <button onClick={toggleOrden} className={`p-2 rounded-full border shadow-lg ${base.bar}`}>
                      {orden === 'estado' ? <ArrowUpNarrowWide size={20}/> : <ArrowDownAZ size={20}/>}
                  </button>
              </div>

              <div className="flex gap-2">
                  <button onClick={()=>window.location.href='/'} className={`p-1.5 rounded-full border shadow-lg ${base.bar} text-green-500`}><Users size={18}/></button>
                  <button onClick={logout} className={`p-1.5 rounded-full border shadow-lg ${base.bar} text-red-500`}><LogOut size={18}/></button>
              </div>
          </div>
       </div>

       {/* CONTENIDO (Z-INDEX 10 RELATIVO) */}
       <div className="pt-32 px-4 pb-36 max-w-4xl mx-auto relative z-10">
           {view === 'cocina' && (
                <>
                <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className={`p-2 rounded-xl border flex flex-col items-center justify-center ${base.metric}`}>
                         <div className="flex items-center gap-1 opacity-60"><Users size={12}/><span className="text-[8px] font-bold uppercase">Espera</span></div>
                         <p className="text-xl font-black">{stats.hungryPeople}</p>
                    </div>
                    <div className={`p-2 rounded-xl border flex flex-col items-center justify-center ${base.metric}`}>
                         <div className="flex items-center gap-1 opacity-60"><Hourglass size={12}/><span className="text-[8px] font-bold uppercase">Cola</span></div>
                         <p className="text-xl font-black">{stats.waiting}</p>
                    </div>
                    <div className={`p-2 rounded-xl border flex flex-col items-center justify-center ${base.metric}`}>
                         <div className="flex items-center gap-1 opacity-60"><Flame size={12}/><span className="text-[8px] font-bold uppercase">Horno</span></div>
                         <p className="text-xl font-black">{stats.cooking}</p>
                    </div>
                    <div className={`p-2 rounded-xl border flex flex-col items-center justify-center ${base.metric}`}>
                         <div className="flex items-center gap-1 opacity-60"><CheckCircle size={12}/><span className="text-[8px] font-bold uppercase">Listo</span></div>
                         <p className="text-xl font-black">{stats.delivered}</p>
                    </div>
                </div>
                <KitchenView metricas={metricas} base={base} isCompact={isCompact} isDarkMode={isDarkMode} currentTheme={currentTheme} toggleCocinando={moverAlHorno} entregar={entregar} forceStopCooking={forceStopCooking} revertirEstado={revertirEstado} />
                </>
           )}
           {view === 'pedidos' && <OrdersView pedidosAgrupados={pedidosAgrupados} base={base} isDarkMode={isDarkMode} eliminarPedidosGusto={eliminarPedidosGusto} resetAllOrders={resetAllOrders} eliminarUnidad={eliminarUnidad} eliminarUnidadPorEstado={eliminarUnidadPorEstado} cleanOrdersByState={cleanOrdersByState} openCleanModal={openCleanModal} avatarMap={avatarMap} setImageToView={setImageToView} usersList={allUsersList} />}
           {view === 'menu' && <MenuView base={base} config={config} setConfig={setConfig} activeCategories={activeCategories} uniqueCategories={uniqueCategories} toggleCategory={toggleCategory} currentTheme={currentTheme} addP={addP} uploading={uploading} newPizzaName={newPizzaName} setNewPizzaName={setNewPizzaName} isDarkMode={isDarkMode} handleImageUpload={handleImageUpload} newPizzaImg={newPizzaImg} newPizzaDesc={newPizzaDesc} setNewPizzaDesc={setNewPizzaDesc} newPizzaIngredients={newPizzaIngredients} removeFromNewPizzaRecipe={removeFromNewPizzaRecipe} newPizzaSelectedIng={newPizzaSelectedIng} setNewPizzaSelectedIng={setNewPizzaSelectedIng} ingredients={ingredientes} newPizzaRecipeQty={newPizzaRecipeQty} setNewPizzaRecipeQty={setNewPizzaRecipeQty} addToNewPizzaRecipe={addToNewPizzaRecipe} newPizzaCat={newPizzaCat} setNewPizzaCat={setNewPizzaCat} newPizzaPortions={newPizzaPortions} setNewPizzaPortions={setNewPizzaPortions} stockEstimadoNueva={stockEstimadoNueva} newPizzaTime={newPizzaTime} setNewPizzaTime={setNewPizzaTime} pizzas={pizzas} edits={edits} recetas={recetas} updateP={updateP} savePizzaChanges={savePizzaChanges} cancelChanges={cancelChanges} delP={delP} duplicateP={duplicateP} tempRecipeIng={tempRecipeIng} setTempRecipeIng={setTempRecipeIng} tempRecipeQty={tempRecipeQty} setTempRecipeQty={setTempRecipeQty} addToExistingPizza={addToExistingPizza} removeFromExistingPizza={removeFromExistingPizza} reservedState={reservedState} calcularStockDinamico={calcularStockDinamico} updateLocalRecipe={updateLocalRecipe} newPizzaType={newPizzaType} typeFilter={menuTypeFilter} setTypeFilter={setMenuTypeFilter} sortOrder={menuSortOrder} setSortOrder={setMenuSortOrder} adicionales={adicionales} addAdicional={addAdicional} delAdicional={delAdicional} />}
           {view === 'ingredientes' && <InventoryView base={base} currentTheme={currentTheme} ingredients={ingredientes} newIngName={newIngName} setNewIngName={setNewIngName} newIngQty={newIngQty} setNewIngQty={setNewIngQty} newIngUnit={newIngUnit} setNewIngUnit={setNewIngUnit} newIngCat={newIngCat} setNewIngCat={setNewIngCat} addIng={addIng} editingIngId={editingIngId} editIngForm={editIngForm} setEditIngForm={setEditIngForm} saveEditIng={saveEditIng} saveBulkIngredient={saveBulkIngredient} cancelEditIng={cancelEditIng} delIng={delIng} startEditIng={startEditIng} reservedState={reservedState} quickUpdateStock={quickUpdateStock} inventoryFilterCategory={inventoryFilterCategory} setInventoryFilterCategory={setInventoryFilterCategory} />}
           {view === 'usuarios' && <UsersView base={base} newGuestName={newGuestName} setNewGuestName={setNewGuestName} addU={addU} allUsersList={allUsersList} resetU={resetU} toggleB={toggleB} eliminarUsuario={eliminarUsuario} tempMotivos={tempMotivos} setTempMotivos={setTempMotivos} guardarMotivo={guardarMotivo} currentTheme={currentTheme} resetAllOrders={resetAllOrders} avatarMap={avatarMap} setImageToView={setImageToView} />}
           {view === 'config' && <ConfigView base={base} config={config} setConfig={setConfig} isDarkMode={isDarkMode} resetAllOrders={resetAllOrders} newPass={newPass} setNewPass={setNewPass} confirmPass={confirmPass} setConfirmPass={setConfirmPass} changePass={changePass} currentTheme={currentTheme} sessionDuration={sessionDuration} setSessionDuration={setSessionDuration} updateTotalGuests={updateTotalGuests} />}
           {view === 'logs' && <LogsView base={base} logs={logs} isDarkMode={isDarkMode} currentTheme={currentTheme} updateLogName={updateLogName} onRefresh={refreshLogsOnly} avatarMap={avatarMap} setImageToView={setImageToView} />}
           {view === 'ranking' && <RankingView base={base} delAllVal={delAllVal} ranking={ranking} delValPizza={delValPizza} />}
       </div>

       {/* BARRA INFERIOR */}
       <div className={`fixed bottom-4 left-4 right-4 z-50 rounded-full p-3 flex justify-around items-center ${base.bar}`}>
          <button onClick={() => setView('cocina')} className={`flex flex-col items-center gap-1 ${view === 'cocina' ? currentTheme.text : base.subtext}`}><LayoutDashboard size={20} /><span className="text-[9px] font-bold">COCINA</span></button>
          <button onClick={() => setView('pedidos')} className={`flex flex-col items-center gap-1 ${view === 'pedidos' ? currentTheme.text : base.subtext}`}><List size={20} /><span className="text-[9px] font-bold">PEDIDOS</span></button>
          <button onClick={() => setView('menu')} className={`flex flex-col items-center gap-1 ${view === 'menu' ? currentTheme.text : base.subtext}`}><ChefHat size={20} /><span className="text-[9px] font-bold">MENU</span></button>
          <button onClick={() => setView('ranking')} className={`flex flex-col items-center gap-1 ${view === 'ranking' ? currentTheme.text : base.subtext}`}><BarChart3 size={20} /><span className="text-[9px] font-bold">RANK</span></button>
          <button onClick={() => setView('usuarios')} className={`flex flex-col items-center gap-1 ${view === 'usuarios' ? currentTheme.text : base.subtext}`}><Users size={20} /><span className="text-[9px] font-bold">USERS</span></button>
          <button onClick={() => setView('ingredientes')} className={`flex flex-col items-center gap-1 ${view === 'ingredientes' ? currentTheme.text : base.subtext}`}><ShoppingBag size={20} /><span className="text-[9px] font-bold">INV</span></button>
          <button onClick={() => setView('logs')} className={`flex flex-col items-center gap-1 ${view === 'logs' ? currentTheme.text : base.subtext}`}><ShieldAlert size={20} /><span className="text-[9px] font-bold">Logs</span></button>
          <button onClick={() => setView('config')} className={`flex flex-col items-center gap-1 ${view === 'config' ? currentTheme.text : base.subtext}`}><Settings size={20} /><span className="text-[9px] font-bold">CONF</span></button>
       </div>

       {/* CORRECCIÓN 6: MODAL ONLINE USERS SIN EDITAR */}
       {showOnlineModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowOnlineModal(false)}>
            <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${base.card} relative`} onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowOnlineModal(false)} className="absolute top-4 right-4 text-gray-500"><X size={20}/></button>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Users size={20} className="text-green-500"/> En Línea ({onlineUsers})</h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                    {onlineGuestList.length > 0 ? onlineGuestList.map((u, i) => (
                        <div key={i} className={`p-3 rounded-xl border ${base.innerCard} flex items-center gap-2`}>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-medium text-sm">{u}</span>
                        </div>
                    )) : <p className="text-sm opacity-50 text-center py-4">Nadie por aquí...</p>}
                </div>
            </div>
        </div>
       )}
       
       {/* MODAL DE LIMPIEZA */}
       {showCleanModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowCleanModal(false)}>
            <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border ${base.card} flex flex-col`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-red-500"><Trash2 size={24}/> Limpieza Avanzada</h3>
                    <button onClick={() => setShowCleanModal(false)}><X size={24} className="opacity-50 hover:opacity-100"/></button>
                </div>
                <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold uppercase opacity-60 mb-1 block">Desde</label><input type="datetime-local" value={cleanForm.from} onChange={e => setCleanForm({...cleanForm, from: e.target.value})} className={`w-full p-3 rounded-xl border outline-none text-xs ${base.input}`}/></div>
                        <div><label className="text-xs font-bold uppercase opacity-60 mb-1 block">Hasta</label><input type="datetime-local" value={cleanForm.to} onChange={e => setCleanForm({...cleanForm, to: e.target.value})} className={`w-full p-3 rounded-xl border outline-none text-xs ${base.input}`}/></div>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase opacity-60 mb-1 block">Estado</label>
                        <select value={cleanForm.status} onChange={e => setCleanForm({...cleanForm, status: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${base.input}`}>
                            <option value="all">TODOS</option><option value="pendiente">Solo Pendientes</option><option value="cocinando">Solo En Horno</option><option value="entregado">Solo Entregados</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase opacity-60 mb-1 block">Usuario</label>
                        <select value={(cleanForm as any).user || 'all'} onChange={e => setCleanForm({...cleanForm, user: e.target.value} as any)} className={`w-full p-3 rounded-xl border outline-none ${base.input}`}>
                            <option value="all">TODOS LOS USUARIOS</option>
                            {allUsersList.map((u:any) => <option key={u.nombre} value={u.nombre}>{u.nombre}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-3 bg-neutral-500/10 p-3 rounded-xl border border-neutral-500/20 cursor-pointer" onClick={() => setCleanForm({...cleanForm, restock: !cleanForm.restock})}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${cleanForm.restock ? 'bg-blue-500 border-blue-500' : 'border-gray-500'}`}>{cleanForm.restock && <CheckCircle size={14} className="text-white"/>}</div>
                        <span className="text-sm font-bold">Reponer Stock (NO RECOMENDADO)</span>
                    </div>
                </div>
                <div className="flex gap-3"><button onClick={() => setShowCleanModal(false)} className={`flex-1 py-3 font-bold rounded-xl border ${base.buttonSec}`}>Cancelar</button><button onClick={handleAdvancedClean} className="flex-1 py-3 font-bold rounded-xl shadow-lg text-white bg-red-600 hover:bg-red-500">ELIMINAR</button></div>
            </div>
        </div>
       )}

       {/* MODAL BULK EDIT */}
       {showBulkModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowBulkModal(false)}>
            <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border ${base.card} flex flex-col max-h-[90vh]`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2"><Layers size={24}/> Edición Masiva</h3>
                    <button onClick={() => setShowBulkModal(false)}><X size={24}/></button>
                </div>
                <div className="flex gap-2 mb-4 bg-neutral-800/50 p-1 rounded-xl">
                    <button onClick={() => setBulkMode('SET')} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${bulkMode === 'SET' ? 'bg-blue-600 text-white' : 'opacity-60'}`}><Plus size={16}/> Fijar</button>
                    <button onClick={() => setBulkMode('REMOVE')} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${bulkMode === 'REMOVE' ? 'bg-red-600 text-white' : 'opacity-60'}`}><Trash2 size={16}/> Eliminar</button>
                </div>
                <div className="space-y-4 mb-4 overflow-y-auto flex-1 pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2"><label className="text-xs font-bold uppercase opacity-60 mb-1 block">Ingrediente</label><select value={bulkIngId} onChange={(e) => setBulkIngId(e.target.value)} className={`w-full p-3 rounded-xl border outline-none ${base.input}`}><option value="">Seleccionar...</option>{ingredientes.map(ing => (<option key={ing.id} value={ing.id}>{ing.nombre}</option>))}</select></div>
                        {bulkMode === 'SET' && <div className="col-span-2"><label className="text-xs font-bold uppercase opacity-60 mb-1 block">Cantidad</label><input type="number" value={bulkQty} onChange={(e) => setBulkQty(e.target.value)} placeholder="0" className={`w-full p-3 rounded-xl border outline-none ${base.input}`}/></div>}
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-2 border-b border-gray-700 pb-2"><label className="text-xs font-bold uppercase opacity-60">Pizzas ({bulkSelectedPizzas.length})</label><div className="flex gap-2"><button onClick={() => setBulkSelectedPizzas(pizzas.map(p => p.id))} className="text-[10px] underline text-blue-400">Todas</button><button onClick={() => setBulkSelectedPizzas([])} className="text-[10px] underline text-red-400">Ninguna</button></div></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{pizzas.map(p => (<div key={p.id} onClick={() => setBulkSelectedPizzas(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])} className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${bulkSelectedPizzas.includes(p.id) ? 'bg-blue-500/20 border-blue-500' : base.innerCard}`}><div className={`w-5 h-5 rounded border flex items-center justify-center ${bulkSelectedPizzas.includes(p.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-500'}`}>{bulkSelectedPizzas.includes(p.id) && <CheckCircle size={14} className="text-white"/>}</div><span className="text-sm font-medium truncate">{p.nombre}</span></div>))}</div>
                    </div>
                </div>
                <button onClick={saveBulkIngredient} className={`w-full py-3 font-bold rounded-xl text-white ${bulkMode === 'SET' ? 'bg-blue-600' : 'bg-red-600'}`}>{bulkMode === 'SET' ? 'APLICAR' : 'ELIMINAR'}</button>
            </div>
        </div>
       )}

       {/* ZOOM MODAL */}
       {imageToView && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in" onClick={() => setImageToView(null)}>
            <button onClick={(e) => { e.stopPropagation(); setImageToView(null); }} className="absolute top-28 right-5 text-white/70 hover:text-white"><X size={24}/></button>
            <img src={imageToView} className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}