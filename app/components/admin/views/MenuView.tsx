import { Plus, Trash2, Image, Save, X, Edit3, Copy, Clock, Power, Check, Layers } from 'lucide-react';
import { useState } from 'react';

export const MenuView = ({ 
    base, config, setConfig, activeCategories, uniqueCategories, toggleCategory, currentTheme, 
    addP, uploading, newPizzaName, setNewPizzaName, isDarkMode, handleImageUpload, newPizzaImg, 
    newPizzaDesc, setNewPizzaDesc, newPizzaIngredients, removeFromNewPizzaRecipe, newPizzaSelectedIng, 
    setNewPizzaSelectedIng, ingredients, newPizzaRecipeQty, setNewPizzaRecipeQty, addToNewPizzaRecipe, 
    newPizzaCat, setNewPizzaCat, newPizzaPortions, setNewPizzaPortions, stockEstimadoNueva, 
    setNewPizzaTime, pizzas, edits, recetas, updateP, savePizzaChanges, cancelChanges, delP, duplicateP, 
    tempRecipeIng, setTempRecipeIng, tempRecipeQty, setTempRecipeQty, addToExistingPizza, removeFromExistingPizza, 
    reservedState, calcularStockDinamico, updateLocalRecipe, newPizzaType, setNewPizzaType, typeFilter, 
    setTypeFilter, sortOrder, setSortOrder, handleLocalEdit, setShowBulkModal,
    // PROPS DE ADICIONALES
    adicionales, addAdicional, delAdicional
}: any) => {

    const [expandedPizza, setExpandedPizza] = useState<string | null>(null);
    const [showNewForm, setShowNewForm] = useState(false);

    // Estados para inputs de tiempo
    const [timeMin, setTimeMin] = useState<number>(0);
    const [timeSec, setTimeSec] = useState<number>(0);

    // Estados locales para Adicionales en "Nuevo Item"
    const [newPizzaExtras, setNewPizzaExtras] = useState<{ingrediente_id: string, nombre: string, cantidad: number, nombre_visible: string}[]>([]);
    const [newExtraIng, setNewExtraIng] = useState('');
    const [newExtraQty, setNewExtraQty] = useState('');
    const [newExtraName, setNewExtraName] = useState('');

    // Estados locales para Adicionales en "Editar Item"
    const [editAdiIng, setEditAdiIng] = useState('');
    const [editAdiQty, setEditAdiQty] = useState('');
    const [editAdiName, setEditAdiName] = useState('');

    const toggleExpand = (id: string) => setExpandedPizza(expandedPizza === id ? null : id);

    const handleTimeChange = (m: string | number, s: string | number) => {
        const min = Number(m);
        const sec = Number(s);
        setTimeMin(min);
        setTimeSec(sec);
        setNewPizzaTime((min * 60) + sec);
    };

    const addToNewExtras = () => {
        if(!newExtraIng || !newExtraQty || !newExtraName) return;
        const [id, name] = newExtraIng.split('|');
        setNewPizzaExtras(prev => [...prev, { ingrediente_id: id, nombre: name, cantidad: Number(newExtraQty), nombre_visible: newExtraName }]);
        setNewExtraName(''); setNewExtraQty('');
    };

    const handleAddP = async () => {
        await addP(newPizzaExtras);
        setNewPizzaExtras([]);
        setTimeMin(0); setTimeSec(0);
        setShowNewForm(false);
    };

    const handleSaveEdit = async (id: string) => {
        await savePizzaChanges(id);
        setExpandedPizza(null); 
    };

    const handleCancelEdit = (id: string) => {
        cancelChanges(id);
        setExpandedPizza(null);
    };

    // Esta función maneja la activación rápida (directo a BD)
    const handleQuickToggle = (e: any, id: string, currentState: boolean) => {
        e.stopPropagation();
        updateP(id, 'activa', !currentState);
    };

    let filteredPizzas = [...pizzas];
    if (typeFilter !== 'all') filteredPizzas = filteredPizzas.filter((p: any) => p.tipo === typeFilter);
    
    if (sortOrder === 'alpha') filteredPizzas.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
    else if (sortOrder === 'date') filteredPizzas.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sortOrder === 'type') filteredPizzas.sort((a: any, b: any) => a.tipo.localeCompare(b.tipo));

    return (
        <div className="space-y-6 pb-20">
             {/* CABECERA */}
             <div className={`p-4 rounded-3xl border ${base.card} space-y-4 shadow-sm`}>
                <div className="flex justify-between items-center">
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${base.text}`}>
                        <Edit3 /> Gestión del Menú
                    </h2>
                    <div className="flex gap-2">
                        {/* BOTÓN NUEVO: EDICIÓN MASIVA */}
                        <button 
                            onClick={() => setShowBulkModal(true)} 
                            className={`p-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm border ${base.buttonSec}`}
                            title="Edición Masiva"
                        >
                            <Layers size={16}/>
                        </button>
                        
                        <button 
                            onClick={() => setShowNewForm(!showNewForm)} 
                            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${showNewForm ? 'bg-red-500 text-white' : `${currentTheme.color} text-white hover:opacity-80`}`}
                        >
                            {showNewForm ? <X size={16}/> : <Plus size={16}/>} {showNewForm ? 'Cerrar' : 'Nuevo Item'}
                        </button>
                    </div>
                </div>

                {/* CATEGORÍAS */}
                <div className={`p-3 rounded-2xl border ${base.innerCard} bg-opacity-50`}>
                    <p className="text-[10px] font-bold uppercase opacity-60 mb-2">Categorías visibles para invitados:</p>
                    <div className="flex flex-wrap gap-2">
                        {uniqueCategories.map((cat: string) => (
                            <button 
                                key={cat}
                                onClick={() => toggleCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${activeCategories.includes(cat) ? `${currentTheme.color} text-white border-transparent` : base.buttonSec}`}
                            >
                                {activeCategories.includes(cat) ? <Check size={12} strokeWidth={4}/> : <div className="w-3"/>}
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* FORMULARIO NUEVO */}
                {showNewForm && (
                    <div className={`animate-in fade-in slide-in-from-top-4 p-5 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200'}`}>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase opacity-50 tracking-wider">Datos Principales</h4>
                                <div className="flex gap-4">
                                    <div className={`w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden cursor-pointer transition-colors ${base.uploadBox}`}>
                                        {newPizzaImg ? <img src={newPizzaImg} className="w-full h-full object-cover" /> : <Image className="opacity-20"/>}
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                                        {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] font-bold">...</div>}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <input value={newPizzaName} onChange={e => setNewPizzaName(e.target.value)} placeholder="Nombre del plato..." className={`w-full p-2.5 rounded-xl text-sm border outline-none ${base.input}`} />
                                        <div className="flex gap-2">
                                            <select value={newPizzaType} onChange={e => setNewPizzaType(e.target.value)} className={`flex-1 p-2.5 rounded-xl text-sm border outline-none ${base.input}`}>
                                                <option value="pizza">Pizza</option><option value="burger">Hamburguesa</option><option value="other">Otro</option>
                                            </select>
                                            <div className="flex-1 relative">
                                                <input list="categories-list" value={newPizzaCat} onChange={e => setNewPizzaCat(e.target.value)} placeholder="Categoría..." className={`w-full p-2.5 rounded-xl text-sm border outline-none ${base.input}`} />
                                                <datalist id="categories-list">{uniqueCategories.map((c: string) => <option key={c} value={c} />)}</datalist>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <textarea value={newPizzaDesc} onChange={e => setNewPizzaDesc(e.target.value)} placeholder="Descripción detallada..." className={`w-full p-3 rounded-xl text-sm border outline-none resize-none h-24 ${base.input}`} />
                                
                                <div className={`flex gap-4 items-center p-3 rounded-xl border ${base.card}`}>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold uppercase opacity-50 block mb-1">Unidades/Porciones</label>
                                        <input type="number" value={newPizzaPortions} onChange={e => setNewPizzaPortions(Number(e.target.value))} className={`w-full p-2 rounded-lg text-sm border outline-none ${base.input}`} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold uppercase opacity-50 block mb-1">Tiempo (Min : Seg)</label>
                                        <div className="flex gap-1 items-center">
                                            <input type="number" value={timeMin} onChange={e => handleTimeChange(e.target.value, timeSec)} placeholder="0" className={`w-full p-2 rounded-lg text-sm border outline-none text-center ${base.input}`} />
                                            <span className="font-bold opacity-30">:</span>
                                            <input type="number" value={timeSec} onChange={e => handleTimeChange(timeMin, e.target.value)} placeholder="00" className={`w-full p-2 rounded-lg text-sm border outline-none text-center ${base.input}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className={`p-4 rounded-2xl border ${base.card}`}>
                                    <h4 className="text-xs font-bold uppercase opacity-50 mb-2 flex justify-between"><span>Receta Base</span><span>Stock Est: {stockEstimadoNueva}</span></h4>
                                    <div className="flex gap-2 mb-2">
                                        <select value={newPizzaSelectedIng} onChange={e => setNewPizzaSelectedIng(e.target.value)} className={`flex-1 p-2 rounded-lg text-xs border outline-none ${base.input}`}>
                                            <option value="">Ingrediente...</option>
                                            {ingredients.map((i: any) => <option key={i.id} value={`${i.id}|${i.nombre}`}>{i.nombre} ({i.unidad})</option>)}
                                        </select>
                                        <input type="number" value={newPizzaRecipeQty} onChange={e => setNewPizzaRecipeQty(e.target.value)} placeholder="Cant." className={`w-16 p-2 rounded-lg text-xs border outline-none ${base.input}`} />
                                        <button onClick={addToNewPizzaRecipe} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500"><Plus size={16}/></button>
                                    </div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                                        {newPizzaIngredients.map((ing: any, idx: number) => (
                                            <div key={idx} className={`flex justify-between items-center text-xs p-2 rounded-lg shadow-sm border bg-neutral-500/10 border-neutral-500/20`}>
                                                <span>{ing.nombre} ({ing.cantidad})</span>
                                                <button onClick={() => removeFromNewPizzaRecipe(idx)} className="text-red-500"><X size={12}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className={`p-4 rounded-2xl border ${base.card}`}>
                                    <h4 className="text-xs font-bold uppercase opacity-50 mb-2 text-purple-500">Adicionales / Extras</h4>
                                    <div className="flex gap-2 mb-2">
                                        <input value={newExtraName} onChange={e => setNewExtraName(e.target.value)} placeholder="Nombre (ej: Extra Queso)" className={`flex-1 p-2 rounded-lg text-xs border outline-none ${base.input}`} />
                                        <input value={newExtraQty} onChange={e => setNewExtraQty(e.target.value)} placeholder="Cant." type="number" className={`w-14 p-2 rounded-lg text-xs border outline-none ${base.input}`} />
                                    </div>
                                    <div className="flex gap-2 mb-2">
                                        <select value={newExtraIng} onChange={e => setNewExtraIng(e.target.value)} className={`flex-1 p-2 rounded-lg text-xs border outline-none ${base.input}`}>
                                            <option value="">Ingrediente a descontar...</option>
                                            {ingredients.map((i: any) => <option key={i.id} value={`${i.id}|${i.nombre}`}>{i.nombre} ({i.unidad})</option>)}
                                        </select>
                                        <button onClick={addToNewExtras} className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-500"><Plus size={16}/></button>
                                    </div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                                        {newPizzaExtras.map((ex: any, idx: number) => (
                                            <div key={idx} className={`flex justify-between items-center text-xs p-2 rounded-lg shadow-sm border bg-purple-500/10 border-purple-500/20`}>
                                                <div className="flex flex-col"><span className="font-bold">{ex.nombre_visible}</span><span className="opacity-50 text-[10px]">{ex.nombre} ({ex.cantidad})</span></div>
                                                <button onClick={() => setNewPizzaExtras(p => p.filter((_, i) => i !== idx))} className="text-red-500"><X size={12}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                         </div>
                         <div className={`flex justify-end pt-4 border-t ${base.divider}`}>
                            <button onClick={handleAddP} disabled={!newPizzaName} className={`px-8 py-3 text-white font-bold rounded-xl hover:opacity-80 disabled:opacity-50 shadow-lg transition-transform active:scale-95 ${currentTheme.color}`}>CREAR ITEM</button>
                         </div>
                    </div>
                )}
                
                {/* FILTROS */}
                <div className={`flex flex-col md:flex-row gap-4 justify-between items-end md:items-center text-xs pt-4 border-t ${base.divider}`}>
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
                        {['all', 'pizza', 'burger', 'other'].map(type => (
                            <button key={type} onClick={() => setTypeFilter(type)} className={`px-4 py-2 rounded-full border transition-colors whitespace-nowrap font-bold uppercase ${typeFilter === type ? `${currentTheme.color} text-white border-transparent` : base.buttonSec}`}>{type === 'all' ? 'Todos' : type}</button>
                        ))}
                    </div>
                    <div className={`flex gap-2 items-center p-1 rounded-lg ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-100'}`}>
                        <span className="px-2 opacity-50 font-bold">Ordenar:</span>
                        <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className={`bg-transparent outline-none font-bold cursor-pointer pr-2 ${isDarkMode ? 'text-white' : 'text-black'}`}><option value="alpha">A-Z</option><option value="type">Tipo</option><option value="date">Creado</option></select>
                    </div>
                </div>
            </div>
            
            {/* LISTA DE PLATOS */}
            <div className="space-y-4">
                 {filteredPizzas.map((pizza: any) => {
                     const isEditing = edits[pizza.id];
                     const currentRecipe = isEditing?.local_recipe || recetas.filter((r: any) => r.pizza_id === pizza.id);
                     const stockReal = calcularStockDinamico(currentRecipe, ingredients);
                     // Detectar cambios si existe el objeto de edición
                     const hasChanges = isEditing && Object.keys(isEditing).length > 0;
                     const currentAdicionales = adicionales ? adicionales.filter((a:any) => a.pizza_id === pizza.id) : [];
                     
                     return (
                         <div key={pizza.id} className={`${base.card} rounded-3xl overflow-hidden border shadow-sm transition-all`}>
                             {/* VISTA RESUMIDA */}
                             <div className={`flex p-4 gap-4 cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-gray-50'}`} onClick={() => toggleExpand(pizza.id)}>
                                 <div className={`w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-200'}`}>
                                     {pizza.imagen_url ? <img src={pizza.imagen_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center opacity-20"><Image/></div>}
                                 </div>
                                 <div className="flex-1 min-w-0 flex flex-col justify-between">
                                     <div className="flex justify-between items-start">
                                         <div>
                                            <h3 className={`font-bold text-lg leading-tight truncate ${base.text}`}>{pizza.nombre}</h3>
                                            <p className={`text-xs mt-1 line-clamp-1 opacity-60`}>{pizza.descripcion || 'Sin descripción'}</p>
                                         </div>
                                         <button onClick={(e) => handleQuickToggle(e, pizza.id, pizza.activa)} className={`p-2 rounded-full transition-all ${pizza.activa ? `${currentTheme.color} text-white shadow-lg` : 'bg-gray-300 dark:bg-neutral-700 text-gray-500'}`} title="Activar / Desactivar"><Power size={16} /></button>
                                     </div>
                                     <div className="flex gap-3 mt-2 text-xs items-center">
                                            <div className={`flex items-center gap-1 font-mono px-2 py-1 rounded ${stockReal > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}><span className="font-bold">{stockReal}</span> <span className="opacity-70">disp.</span></div>
                                            <span className="flex items-center gap-1 opacity-60"><Clock size={12}/> {Math.floor(pizza.tiempo_coccion/60)}m {pizza.tiempo_coccion%60}s</span>
                                            <span className="opacity-40">•</span>
                                            <span className="opacity-60 uppercase font-bold text-[10px]">{pizza.tipo}</span>
                                     </div>
                                 </div>
                             </div>

                             {/* ZONA DE EDICIÓN */}
                             {expandedPizza === pizza.id && (
                                 <div className={`p-5 border-t ${base.divider} ${isDarkMode ? 'bg-neutral-950' : 'bg-neutral-50'} space-y-6 animate-in slide-in-from-top-2`}>
                                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* COLUMNA 1 */}
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold uppercase opacity-40">Nombre</label>
                                                    {/* USO DE handleLocalEdit PARA ACTIVAR LOS CAMBIOS */}
                                                    <input value={isEditing?.nombre ?? pizza.nombre} onChange={e => handleLocalEdit(pizza.id, 'nombre', e.target.value)} className={`w-full p-2.5 rounded-xl text-sm border outline-none ${base.input}`} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold uppercase opacity-40">Descripción</label>
                                                    <textarea value={isEditing?.descripcion ?? pizza.descripcion} onChange={e => handleLocalEdit(pizza.id, 'descripcion', e.target.value)} className={`w-full p-2.5 rounded-xl text-sm border outline-none resize-none h-20 ${base.input}`} />
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="flex-1 space-y-1">
                                                        <label className="text-[10px] font-bold uppercase opacity-40">Tipo</label>
                                                        <select value={isEditing?.tipo ?? pizza.tipo} onChange={e => handleLocalEdit(pizza.id, 'tipo', e.target.value)} className={`w-full p-2.5 rounded-xl text-sm border outline-none ${base.input}`}>
                                                            <option value="pizza">Pizza</option><option value="burger">Hamburguesa</option><option value="other">Otro</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <label className="text-[10px] font-bold uppercase opacity-40">Categoría</label>
                                                        <input list="categories-list-edit" value={isEditing?.categoria ?? pizza.categoria} onChange={e => handleLocalEdit(pizza.id, 'categoria', e.target.value)} className={`w-full p-2.5 rounded-xl text-sm border outline-none ${base.input}`} />
                                                        <datalist id="categories-list-edit">{uniqueCategories.map((c:string) => <option key={c} value={c} />)}</datalist>
                                                    </div>
                                                </div>
                                                <div className={`flex gap-4 p-3 rounded-xl border ${base.card}`}>
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-bold uppercase opacity-40 mb-1 block">Tiempo (Min : Seg)</label>
                                                        <div className="flex gap-1 items-center">
                                                            <input type="number" value={Math.floor((isEditing?.tiempo_coccion ?? pizza.tiempo_coccion) / 60)} onChange={e => handleLocalEdit(pizza.id, 'tiempo_coccion', (Number(e.target.value) * 60) + ((isEditing?.tiempo_coccion ?? pizza.tiempo_coccion) % 60))} className={`w-full p-2 rounded-lg text-sm border outline-none text-center ${base.input}`} />
                                                            <span className="font-bold opacity-30">:</span>
                                                            <input type="number" value={(isEditing?.tiempo_coccion ?? pizza.tiempo_coccion) % 60} onChange={e => handleLocalEdit(pizza.id, 'tiempo_coccion', (Math.floor((isEditing?.tiempo_coccion ?? pizza.tiempo_coccion) / 60) * 60) + Number(e.target.value))} className={`w-full p-2 rounded-lg text-sm border outline-none text-center ${base.input}`} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* COLUMNA 2 (RECETAS Y EXTRAS - SE MANTIENE LOGICA EXISTENTE) */}
                                            <div className="space-y-4">
                                                <div className={`border rounded-2xl p-4 ${base.card}`}>
                                                    <label className="text-xs font-bold uppercase opacity-50 block mb-3">Receta Base</label>
                                                    <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
                                                        {currentRecipe.map((r: any, idx: number) => {
                                                            const ing = ingredients.find((i: any) => i.id === r.ingrediente_id);
                                                            return (
                                                                <div key={idx} className={`flex justify-between items-center text-xs p-2 rounded-lg shadow-sm border bg-neutral-500/10 border-neutral-500/20`}>
                                                                    <span className={base.text}>{ing?.nombre || r.nombre}</span>
                                                                    <div className="flex items-center gap-3"><span className={`font-mono opacity-50 px-1.5 py-0.5 rounded border border-current ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>{r.cantidad_requerida} {ing?.unidad}</span><button onClick={() => removeFromExistingPizza(pizza.id, idx, currentRecipe)} className="text-red-400 hover:text-red-600"><X size={14}/></button></div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <select className={`flex-1 p-2 rounded-lg text-xs border outline-none ${base.input}`} value={tempRecipeIng[pizza.id] || ''} onChange={e => setTempRecipeIng({...tempRecipeIng, [pizza.id]: e.target.value})}>
                                                            <option value="">+ Ingrediente</option>{ingredients.map((i: any) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                                                        </select>
                                                        <input type="number" className={`w-16 p-2 rounded-lg text-xs border outline-none ${base.input}`} placeholder="Cant" value={tempRecipeQty[pizza.id] || ''} onChange={e => setTempRecipeQty({...tempRecipeQty, [pizza.id]: e.target.value})}/>
                                                        <button onClick={() => { const ingId = tempRecipeIng[pizza.id]; const qty = tempRecipeQty[pizza.id]; const ingName = ingredients.find((i:any) => i.id === ingId)?.nombre; if(ingId && qty && ingName) addToExistingPizza(pizza.id, ingId, ingName, qty, currentRecipe); setTempRecipeIng({...tempRecipeIng, [pizza.id]: ''}); setTempRecipeQty({...tempRecipeQty, [pizza.id]: ''}); }} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500"><Plus size={16}/></button>
                                                    </div>
                                                </div>
                                                <div className={`border rounded-2xl p-4 ${base.card}`}>
                                                    <label className="text-xs font-bold uppercase opacity-50 block mb-3 text-purple-500">Adicionales / Extras</label>
                                                    <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
                                                        {currentAdicionales.map((adi: any) => {
                                                            const ingName = ingredients.find((i:any) => i.id === adi.ingrediente_id)?.nombre || '???';
                                                            return (
                                                                <div key={adi.id} className={`flex justify-between items-center text-xs p-2 rounded-lg mb-1 bg-purple-500/10 border border-purple-500/20`}>
                                                                    <div><span className="font-bold block">{adi.nombre_visible}</span><span className="opacity-50 text-[10px]">Descuenta: {adi.cantidad_requerida} de {ingName}</span></div>
                                                                    <button onClick={() => delAdicional(adi.id)} className="text-red-500 p-1 hover:bg-red-500/10 rounded"><Trash2 size={14}/></button>
                                                                </div>
                                                            );
                                                        })}
                                                        {currentAdicionales.length === 0 && <p className="text-[10px] opacity-30 italic text-center">Sin extras configurados</p>}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                                        <input value={editAdiName} onChange={e => setEditAdiName(e.target.value)} placeholder="Nombre visible" className={`p-2 rounded-lg text-xs border outline-none ${base.input}`}/>
                                                        <input value={editAdiQty} onChange={e => setEditAdiQty(e.target.value)} placeholder="Cant." type="number" className={`p-2 rounded-lg text-xs border outline-none ${base.input}`}/>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <select value={editAdiIng} onChange={e => setEditAdiIng(e.target.value)} className={`flex-1 p-2 rounded-lg text-xs border outline-none ${base.input}`}><option value="">Ingrediente del stock...</option>{ingredients.map((i: any) => <option key={i.id} value={i.id}>{i.nombre}</option>)}</select>
                                                        <button onClick={() => { addAdicional(pizza.id, editAdiIng, Number(editAdiQty), editAdiName); setEditAdiName(''); setEditAdiQty(''); setEditAdiIng(''); }} disabled={!editAdiName || !editAdiQty || !editAdiIng} className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-500 disabled:opacity-50"><Plus size={16}/></button>
                                                    </div>
                                                </div>
                                            </div>
                                     </div>

                                     {/* FOOTER ACCIONES - AHORA SÍ CON BOTONES GUARDAR/CANCELAR */}
                                     <div className={`flex gap-3 pt-4 border-t mt-4 items-center ${base.divider}`}>
                                          <div className={`relative group cursor-pointer w-12 h-12 rounded-xl overflow-hidden border-2 border-dashed border-gray-500/30 hover:border-blue-500 transition-colors flex items-center justify-center ${base.uploadBox}`} title="Cambiar Foto">
                                              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 z-10 cursor-pointer" onChange={(e) => handleImageUpload(e, pizza.id)} />
                                              <Image size={20} className="opacity-40 group-hover:text-blue-500"/>
                                          </div>
                                          <button onClick={() => duplicateP(pizza)} className={`p-3 rounded-xl border ${base.buttonSec}`} title="Duplicar"><Copy size={18}/></button>
                                          <button onClick={() => delP(pizza.id)} className="p-3 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10" title="Eliminar"><Trash2 size={18}/></button>
                                          
                                          <div className="flex-1 flex gap-3 justify-end">
                                              {/* BOTONES VISIBLES SOLO SI HAY CAMBIOS PENDIENTES */}
                                              {hasChanges && (
                                                  <>
                                                      <button onClick={() => handleCancelEdit(pizza.id)} className={`px-4 py-3 rounded-xl border font-bold text-xs ${base.buttonSec}`}>Cancelar</button>
                                                      <button onClick={() => handleSaveEdit(pizza.id)} className={`px-6 py-3 rounded-xl ${currentTheme.color} text-white font-bold shadow-lg flex items-center gap-2 hover:opacity-90 text-sm`}>
                                                          <Save size={18}/> Guardar
                                                      </button>
                                                  </>
                                              )}
                                          </div>
                                     </div>
                                 </div>
                             )}
                         </div>
                     );
                 })}
            </div>
        </div>
    );
};