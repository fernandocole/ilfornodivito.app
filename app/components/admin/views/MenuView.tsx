import { Plus, Trash2, Image, Save, X, Edit3, Copy, Settings, PlusCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo } from 'react';

export const MenuView = ({ 
    base, config, setConfig, activeCategories, uniqueCategories, toggleCategory, currentTheme, 
    addP, uploading, newPizzaName, setNewPizzaName, isDarkMode, handleImageUpload, newPizzaImg, 
    newPizzaDesc, setNewPizzaDesc, newPizzaIngredients, removeFromNewPizzaRecipe, newPizzaSelectedIng, 
    setNewPizzaSelectedIng, ingredients, newPizzaRecipeQty, setNewPizzaRecipeQty, addToNewPizzaRecipe, 
    newPizzaCat, setNewPizzaCat, newPizzaPortions, setNewPizzaPortions, stockEstimadoNueva, 
    setNewPizzaTime, pizzas, edits, recetas, updateP, savePizzaChanges, cancelChanges, delP, duplicateP, 
    tempRecipeIng, setTempRecipeIng, tempRecipeQty, setTempRecipeQty, addToExistingPizza, removeFromExistingPizza, 
    reservedState, calcularStockDinamico, updateLocalRecipe, newPizzaType, setNewPizzaType, typeFilter, 
    setTypeFilter, sortOrder, setSortOrder,
    // PROPS DE ADICIONALES
    adicionales, addAdicional, delAdicional
}: any) => {

    const [expandedPizza, setExpandedPizza] = useState<string | null>(null);
    const [showNewForm, setShowNewForm] = useState(false);

    // Estados para inputs de tiempo (Minutos y Segundos separados)
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

    // Helper para manejar el tiempo en la creación
    const handleTimeChange = (m: number, s: number) => {
        setTimeMin(m);
        setTimeSec(s);
        setNewPizzaTime((m * 60) + s);
    };

    // Helper para agregar extra en "Nuevo Item" (Local)
    const addToNewExtras = () => {
        if(!newExtraIng || !newExtraQty || !newExtraName) return;
        const [id, name] = newExtraIng.split('|');
        setNewPizzaExtras(prev => [...prev, { ingrediente_id: id, nombre: name, cantidad: Number(newExtraQty), nombre_visible: newExtraName }]);
        setNewExtraName(''); setNewExtraQty(''); setNewExtraIng('');
    };
    
    // Wrapper para agregar pizza que incluya los extras
    const handleAddP = async () => {
        // Pasamos los extras al padre a través de una propiedad temporal o modificamos addP en el padre
        // Para simplificar sin romper la estructura del padre, asumimos que addP maneja newPizzaIngredients.
        // Como newPizzaExtras es nuevo, deberás pasar estos datos al padre o inyectarlos aquí.
        // SOLUCIÓN: Pasamos los extras como argumento extra a addP si lo modificaste, 
        // o llamamos a addAdicional inmediatamente después de crear la pizza.
        // Por compatibilidad con tu código actual del padre, llamaremos a addP y luego iteraremos.
        
        // NOTA: Para que esto funcione perfecto, addP debería devolver el ID de la pizza creada.
        // Si no lo hace, tendrás que modificar addP en page.tsx. 
        // ASUMIENDO QUE addP en el padre NO recibe extras, lo haremos visualmente aquí pero funcionalmente requiere update en el padre.
        // Voy a asumir que pasas `newPizzaExtras` al padre o ejecutas la lógica aquí.
        
        // *TRUCO*: Inyectamos los extras en la llamada de addP si el padre lo soporta, 
        // sino, el usuario tendrá que agregarlos al editar. 
        // PARA CUMPLIR TU PEDIDO: Vamos a usar una función wrapper que el padre debería implementar.
        // Si no quieres tocar el padre de nuevo para esto, los extras se agregarán tras crear.
        
        await addP(newPizzaExtras); // <--- Asegúrate de actualizar addP en page.tsx para recibir esto
        setNewPizzaExtras([]);
        setTimeMin(0); setTimeSec(0);
    };

    // Filtrar y ordenar
    let filteredPizzas = [...pizzas];
    if (typeFilter !== 'all') filteredPizzas = filteredPizzas.filter((p: any) => p.tipo === typeFilter);
    if (sortOrder === 'alpha') filteredPizzas.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
    else if (sortOrder === 'date') filteredPizzas.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sortOrder === 'type') filteredPizzas.sort((a: any, b: any) => a.tipo.localeCompare(b.tipo));

    return (
        <div className="space-y-6">
            
             {/* CABECERA Y FILTROS */}
             <div className={`p-4 rounded-3xl border ${base.card} space-y-4 shadow-sm`}>
                <div className="flex justify-between items-center">
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${currentTheme.text}`}>
                        <Edit3 /> Gestión del Menú
                    </h2>
                    <button onClick={() => setShowNewForm(!showNewForm)} className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${showNewForm ? 'bg-red-500 text-white' : 'bg-black text-white hover:bg-neutral-800'}`}>
                        {showNewForm ? <X size={16}/> : <Plus size={16}/>} {showNewForm ? 'Cerrar' : 'Nuevo Item'}
                    </button>
                </div>

                {/* FORMULARIO NUEVO ITEM (REDISEÑADO) */}
                {showNewForm && (
                    <div className="animate-in fade-in slide-in-from-top-4 p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-700 shadow-xl">
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            
                            {/* COLUMNA IZQUIERDA: DATOS BÁSICOS */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase opacity-50 tracking-wider">Datos Principales</h4>
                                <div className="flex gap-4">
                                    <div className={`w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden cursor-pointer transition-colors ${isDarkMode ? 'border-neutral-700 hover:bg-neutral-800' : 'border-gray-300 hover:bg-gray-50'}`}>
                                        {newPizzaImg ? <img src={newPizzaImg} className="w-full h-full object-cover" /> : <Image className="opacity-20"/>}
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                                        {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] font-bold">...</div>}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <input value={newPizzaName} onChange={e => setNewPizzaName(e.target.value)} placeholder="Nombre del plato..." className={`w-full p-2.5 rounded-xl text-sm border outline-none ${base.input}`} />
                                        <div className="flex gap-2">
                                            <select value={newPizzaType} onChange={e => setNewPizzaType(e.target.value)} className={`flex-1 p-2.5 rounded-xl text-sm border outline-none ${base.input}`}>
                                                <option value="pizza">Pizza</option>
                                                <option value="burger">Hamburguesa</option>
                                                <option value="other">Otro</option>
                                            </select>
                                            
                                            {/* CATEGORIA CON DATALIST */}
                                            <div className="flex-1 relative">
                                                <input 
                                                    list="categories-list" 
                                                    value={newPizzaCat} 
                                                    onChange={e => setNewPizzaCat(e.target.value)} 
                                                    placeholder="Categoría..." 
                                                    className={`w-full p-2.5 rounded-xl text-sm border outline-none ${base.input}`} 
                                                />
                                                <datalist id="categories-list">
                                                    {uniqueCategories.map((c: string) => <option key={c} value={c} />)}
                                                </datalist>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <textarea value={newPizzaDesc} onChange={e => setNewPizzaDesc(e.target.value)} placeholder="Descripción detallada..." className={`w-full p-3 rounded-xl text-sm border outline-none resize-none h-24 ${base.input}`} />
                                
                                <div className="flex gap-4 items-center bg-gray-50 dark:bg-neutral-800 p-3 rounded-xl border border-gray-100 dark:border-neutral-700">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold uppercase opacity-50 block mb-1">Porciones / Unidades</label>
                                        <input type="number" value={newPizzaPortions} onChange={e => setNewPizzaPortions(Number(e.target.value))} className={`w-full p-2 rounded-lg text-sm border outline-none ${base.input}`} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold uppercase opacity-50 block mb-1">Tiempo Cocción</label>
                                        <div className="flex gap-1 items-center">
                                            <input type="number" value={timeMin} onChange={e => handleTimeChange(Number(e.target.value), timeSec)} placeholder="Min" className={`w-full p-2 rounded-lg text-sm border outline-none text-center ${base.input}`} />
                                            <span className="font-bold text-gray-400">:</span>
                                            <input type="number" value={timeSec} onChange={e => handleTimeChange(timeMin, Number(e.target.value))} placeholder="Seg" className={`w-full p-2 rounded-lg text-sm border outline-none text-center ${base.input}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: RECETA Y EXTRAS */}
                            <div className="space-y-4">
                                {/* RECETA */}
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700">
                                    <h4 className="text-xs font-bold uppercase opacity-50 mb-2 flex justify-between">
                                        <span>Receta (Ingredientes Base)</span>
                                        <span>Stock Est: {stockEstimadoNueva}</span>
                                    </h4>
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
                                            <div key={idx} className="flex justify-between items-center text-xs p-2 bg-white dark:bg-neutral-700 rounded-lg shadow-sm">
                                                <span>{ing.nombre} ({ing.cantidad})</span>
                                                <button onClick={() => removeFromNewPizzaRecipe(idx)} className="text-red-500"><X size={12}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* EXTRAS (NUEVO) */}
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700">
                                    <h4 className="text-xs font-bold uppercase opacity-50 mb-2">Adicionales Posibles</h4>
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
                                            <div key={idx} className="flex justify-between items-center text-xs p-2 bg-white dark:bg-neutral-700 rounded-lg shadow-sm">
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{ex.nombre_visible}</span>
                                                    <span className="opacity-50 text-[10px]">{ex.nombre} ({ex.cantidad})</span>
                                                </div>
                                                <button onClick={() => setNewPizzaExtras(p => p.filter((_, i) => i !== idx))} className="text-red-500"><X size={12}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                         </div>
                         <div className="flex justify-end">
                            <button onClick={handleAddP} disabled={!newPizzaName} className="px-8 py-3 bg-black dark:bg-white dark:text-black text-white font-bold rounded-xl hover:opacity-80 disabled:opacity-50 shadow-lg transition-transform active:scale-95">CREAR ITEM</button>
                         </div>
                    </div>
                )}
                
                {/* FILTROS DE LISTA */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center text-xs pt-4 border-t border-gray-200 dark:border-neutral-800">
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
                        <button onClick={() => setTypeFilter('all')} className={`px-4 py-2 rounded-full border transition-colors whitespace-nowrap font-bold ${typeFilter === 'all' ? 'bg-black text-white border-black dark:bg-white dark:text-black' : base.buttonSec}`}>Todos</button>
                        <button onClick={() => setTypeFilter('pizza')} className={`px-4 py-2 rounded-full border transition-colors whitespace-nowrap font-bold ${typeFilter === 'pizza' ? 'bg-black text-white border-black dark:bg-white dark:text-black' : base.buttonSec}`}>Pizzas</button>
                        <button onClick={() => setTypeFilter('burger')} className={`px-4 py-2 rounded-full border transition-colors whitespace-nowrap font-bold ${typeFilter === 'burger' ? 'bg-black text-white border-black dark:bg-white dark:text-black' : base.buttonSec}`}>Burgers</button>
                        <button onClick={() => setTypeFilter('other')} className={`px-4 py-2 rounded-full border transition-colors whitespace-nowrap font-bold ${typeFilter === 'other' ? 'bg-black text-white border-black dark:bg-white dark:text-black' : base.buttonSec}`}>Otros</button>
                    </div>
                    <div className={`flex gap-2 items-center p-1 rounded-lg ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-100'}`}>
                        <span className="px-2 opacity-50 font-bold">Ordenar:</span>
                        <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className="bg-transparent outline-none font-bold cursor-pointer pr-2 text-inherit">
                            <option value="alpha" className="text-black">A-Z</option>
                            <option value="type" className="text-black">Tipo</option>
                            <option value="date" className="text-black">Creado</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {/* LISTA DE PLATOS EXISTENTES */}
            <div className="space-y-4">
                {filteredPizzas.map((pizza: any) => {
                    const isEditing = edits[pizza.id];
                    const currentRecipe = isEditing?.local_recipe || recetas.filter((r: any) => r.pizza_id === pizza.id);
                    const stockReal = calcularStockDinamico(currentRecipe, ingredients);
                    const hasChanges = isEditing && (Object.keys(isEditing).length > 0);
                    const currentAdicionales = adicionales ? adicionales.filter((a:any) => a.pizza_id === pizza.id) : [];
                    
                    // Calculo de tiempo visual
                    const tTotal = isEditing?.tiempo_coccion ?? pizza.tiempo_coccion;
                    const displayMin = Math.floor(tTotal / 60);
                    const displaySec = tTotal % 60;
                    
                    return (
                        <div key={pizza.id} className={`${base.card} rounded-3xl overflow-hidden border shadow-sm transition-all`}>
                            
                            {/* VISTA RESUMIDA */}
                            <div className={`flex p-4 gap-4 cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-gray-50'}`} onClick={() => toggleExpand(pizza.id)}>
                                <div className={`w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-200'}`}>
                                    {pizza.imagen_url ? <img src={pizza.imagen_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center opacity-20"><Image/></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight truncate">{pizza.nombre}</h3>
                                            <p className={`text-xs mt-0.5 opacity-60`}>{pizza.categoria || 'General'} • {pizza.tipo === 'burger' ? 'Hamburguesa' : pizza.tipo === 'pizza' ? 'Pizza' : 'Otro'}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {expandedPizza === pizza.id ? <ChevronUp size={20} className="opacity-30"/> : <ChevronDown size={20} className="opacity-30"/>}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-2 text-xs font-mono opacity-70 items-center">
                                        <span className={`px-1.5 py-0.5 rounded ${stockReal > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>Stock: {stockReal}</span>
                                        <span className="flex items-center gap-1"><Clock size={10}/> {Math.floor(pizza.tiempo_coccion/60)}m {pizza.tiempo_coccion%60}s</span>
                                        <span className={`px-1.5 py-0.5 rounded font-bold ${pizza.activa ? 'text-green-500' : 'text-red-500'}`}>{pizza.activa ? 'ACTIVO' : 'INACTIVO'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* ZONA EXPANDIDA DE EDICIÓN */}
                            {expandedPizza === pizza.id && (
                                <div className={`p-5 border-t ${base.divider} bg-neutral-50/50 dark:bg-black/20 space-y-6 animate-in slide-in-from-top-2`}>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* COLUMNA 1 */}
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase opacity-40">Nombre</label>
                                                <input value={isEditing?.nombre ?? pizza.nombre} onChange={e => updateP(pizza.id, 'nombre', e.target.value)} className={`w-full p-2.5 rounded-xl text-sm border outline-none ${base.input}`} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase opacity-40">Descripción</label>
                                                <textarea value={isEditing?.descripcion ?? pizza.descripcion} onChange={e => updateP(pizza.id, 'descripcion', e.target.value)} className={`w-full p-2.5 rounded-xl text-sm border outline-none resize-none h-20 ${base.input}`} />
                                            </div>
                                            
                                            <div className="flex gap-4">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-[10px] font-bold uppercase opacity-40">Categoría</label>
                                                    <input list="categories-list-edit" value={isEditing?.categoria ?? pizza.categoria} onChange={e => updateP(pizza.id, 'categoria', e.target.value)} className={`w-full p-2.5 rounded-xl text-sm border outline-none ${base.input}`} />
                                                    <datalist id="categories-list-edit">{uniqueCategories.map((c:string) => <option key={c} value={c} />)}</datalist>
                                                </div>
                                                <div className="w-24 space-y-1">
                                                    <label className="text-[10px] font-bold uppercase opacity-40">Activo</label>
                                                    <div 
                                                        className={`h-[42px] rounded-xl border cursor-pointer flex items-center px-3 gap-2 transition-colors ${ (isEditing?.activa ?? pizza.activa) ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}
                                                        onClick={() => updateP(pizza.id, 'activa', !(isEditing?.activa ?? pizza.activa))}
                                                    >
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${(isEditing?.activa ?? pizza.activa) ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                                                            {(isEditing?.activa ?? pizza.activa) && <Check size={10} className="text-white"/>}
                                                        </div>
                                                        <span className={`text-xs font-bold ${(isEditing?.activa ?? pizza.activa) ? 'text-green-600' : 'text-red-500'}`}>{(isEditing?.activa ?? pizza.activa) ? 'SI' : 'NO'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-4 p-3 rounded-xl bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-bold uppercase opacity-40 mb-1 block">Tiempo (Min : Seg)</label>
                                                    <div className="flex gap-1 items-center">
                                                        <input 
                                                            type="number" 
                                                            value={Math.floor((isEditing?.tiempo_coccion ?? pizza.tiempo_coccion) / 60)} 
                                                            onChange={e => updateP(pizza.id, 'tiempo_coccion', (Number(e.target.value) * 60) + ((isEditing?.tiempo_coccion ?? pizza.tiempo_coccion) % 60))} 
                                                            className={`w-full p-2 rounded-lg text-sm border outline-none text-center ${base.input}`} 
                                                        />
                                                        <span className="font-bold opacity-30">:</span>
                                                        <input 
                                                            type="number" 
                                                            value={(isEditing?.tiempo_coccion ?? pizza.tiempo_coccion) % 60} 
                                                            onChange={e => updateP(pizza.id, 'tiempo_coccion', (Math.floor((isEditing?.tiempo_coccion ?? pizza.tiempo_coccion) / 60) * 60) + Number(e.target.value))} 
                                                            className={`w-full p-2 rounded-lg text-sm border outline-none text-center ${base.input}`} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* COLUMNA 2 */}
                                        <div className="space-y-4">
                                            {/* RECETA */}
                                            <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl p-4">
                                                <label className="text-xs font-bold uppercase opacity-50 block mb-3">Receta Base</label>
                                                <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
                                                    {currentRecipe.map((r: any, idx: number) => {
                                                        const ing = ingredients.find((i: any) => i.id === r.ingrediente_id);
                                                        return (
                                                            <div key={idx} className="flex justify-between items-center text-xs p-2 border-b last:border-0 border-dashed border-gray-100 dark:border-white/5">
                                                                <span className={base.textHead}>{ing?.nombre || r.nombre}</span>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-mono opacity-50 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">{r.cantidad_requerida} {ing?.unidad}</span>
                                                                    <button onClick={() => removeFromExistingPizza(pizza.id, idx, currentRecipe)} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="flex gap-2">
                                                    <select 
                                                        className={`flex-1 p-2 rounded-lg text-xs border outline-none ${base.input}`}
                                                        value={tempRecipeIng[pizza.id] || ''}
                                                        onChange={e => setTempRecipeIng({...tempRecipeIng, [pizza.id]: e.target.value})}
                                                    >
                                                        <option value="">+ Ingrediente</option>
                                                        {ingredients.map((i: any) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                                                    </select>
                                                    <input 
                                                        type="number" 
                                                        className={`w-16 p-2 rounded-lg text-xs border outline-none ${base.input}`} 
                                                        placeholder="Cant"
                                                        value={tempRecipeQty[pizza.id] || ''}
                                                        onChange={e => setTempRecipeQty({...tempRecipeQty, [pizza.id]: e.target.value})}
                                                    />
                                                    <button 
                                                        onClick={() => {
                                                            const ingId = tempRecipeIng[pizza.id];
                                                            const qty = tempRecipeQty[pizza.id];
                                                            const ingName = ingredients.find((i:any) => i.id === ingId)?.nombre;
                                                            if(ingId && qty && ingName) addToExistingPizza(pizza.id, ingId, ingName, qty, currentRecipe);
                                                            setTempRecipeIng({...tempRecipeIng, [pizza.id]: ''});
                                                            setTempRecipeQty({...tempRecipeQty, [pizza.id]: ''});
                                                        }}
                                                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500"
                                                    ><Plus size={16}/></button>
                                                </div>
                                            </div>

                                            {/* ADICIONALES */}
                                            <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl p-4">
                                                <label className="text-xs font-bold uppercase opacity-50 block mb-3 text-purple-500">Adicionales / Extras</label>
                                                <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
                                                    {currentAdicionales.map((adi: any) => {
                                                        const ingName = ingredients.find((i:any) => i.id === adi.ingrediente_id)?.nombre || '???';
                                                        return (
                                                            <div key={adi.id} className="flex justify-between items-center text-xs p-2 bg-purple-50 dark:bg-purple-900/10 rounded-lg mb-1">
                                                                <div>
                                                                    <span className="font-bold block">{adi.nombre_visible}</span>
                                                                    <span className="opacity-50 text-[10px]">Descuenta: {adi.cantidad_requerida} de {ingName}</span>
                                                                </div>
                                                                <button onClick={() => delAdicional(adi.id)} className="text-red-500 p-1 hover:bg-red-100 rounded"><Trash2 size={14}/></button>
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
                                                    <select value={editAdiIng} onChange={e => setEditAdiIng(e.target.value)} className={`flex-1 p-2 rounded-lg text-xs border outline-none ${base.input}`}>
                                                        <option value="">Ingrediente del stock...</option>
                                                        {ingredients.map((i: any) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                                                    </select>
                                                    <button 
                                                        onClick={() => {
                                                            addAdicional(pizza.id, editAdiIng, Number(editAdiQty), editAdiName);
                                                            setEditAdiName(''); setEditAdiQty(''); setEditAdiIng('');
                                                        }} 
                                                        disabled={!editAdiName || !editAdiQty || !editAdiIng}
                                                        className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-500 disabled:opacity-50"
                                                    ><Plus size={16}/></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* FOOTER ACCIONES */}
                                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-white/10 mt-2 items-center">
                                         {/* CAMBIO FOTO */}
                                         <div className="relative group cursor-pointer w-12 h-12 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors flex items-center justify-center bg-white dark:bg-black/20" title="Cambiar Foto">
                                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 z-10 cursor-pointer" onChange={(e) => handleImageUpload(e, pizza.id)} />
                                            <Image size={20} className="opacity-40 group-hover:text-blue-500"/>
                                        </div>

                                        <button onClick={() => duplicateP(pizza)} className={`p-3 rounded-xl border ${base.buttonSec}`} title="Duplicar"><Copy size={18}/></button>
                                        <button onClick={() => delP(pizza.id)} className="p-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50" title="Eliminar"><Trash2 size={18}/></button>
                                        
                                        <div className="flex-1 flex gap-3 justify-end">
                                            {hasChanges && (
                                                <>
                                                    <button onClick={() => cancelChanges(pizza.id)} className={`px-4 py-3 rounded-xl border font-bold text-xs ${base.buttonSec}`}>Cancelar</button>
                                                    <button onClick={() => savePizzaChanges(pizza.id)} className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold shadow-lg flex items-center gap-2 hover:bg-green-500 text-sm"><Save size={18}/> Guardar Cambios</button>
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

// --- ICON COMPONENT (Check) ---
function Check({ size, className }: { size?: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    )
}