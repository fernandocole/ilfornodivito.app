import { useState, useMemo } from 'react';
import { 
  CheckSquare, Square, Plus, Image as ImageIcon, UploadCloud, X, Calculator, Save, 
  Eye, EyeOff, Trash2, Pizza, Utensils, ChevronDown, ChevronUp, Copy, ArrowDownAZ, Calendar, Filter,
  AlertCircle, ChefHat, Edit3
} from 'lucide-react';
import { TimeControl } from '../../ui/TimeControl';
import { BurgerIcon } from '../../ui/BurgerIcon'; 

export const MenuView = ({
    base, config, setConfig, activeCategories, uniqueCategories, toggleCategory, currentTheme,
    addP, uploading, newPizzaName, setNewPizzaName, isDarkMode, handleImageUpload, newPizzaImg,
    newPizzaDesc, setNewPizzaDesc, newPizzaIngredients, removeFromNewPizzaRecipe, newPizzaSelectedIng,
    setNewPizzaSelectedIng, ingredients, newPizzaRecipeQty, setNewPizzaRecipeQty, addToNewPizzaRecipe,
    newPizzaCat, setNewPizzaCat, newPizzaPortions, setNewPizzaPortions, stockEstimadoNueva, newPizzaTime,
    setNewPizzaTime, pizzas, edits, recetas, updateP, savePizzaChanges, cancelChanges, delP, duplicateP,
    tempRecipeIng, setTempRecipeIng, tempRecipeQty, setTempRecipeQty, addToExistingPizza, removeFromExistingPizza,
    reservedState, calcularStockDinamico, updateLocalRecipe, 
    newPizzaType, setNewPizzaType,
    typeFilter, setTypeFilter, sortOrder, setSortOrder
}: any) => {

    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [showNewForm, setShowNewForm] = useState(false);

    const toggleExpand = (id: string, forceState?: boolean) => {
        setExpanded(prev => ({ ...prev, [id]: forceState !== undefined ? forceState : !prev[id] }));
    };

    const startEditing = (id: string) => {
        toggleExpand(id, true);
        updateP(id, 'editing', true); 
    };

    const getMissingIngredients = (pizzaId: string) => {
        const recipe = recetas.filter((r: any) => r.pizza_id === pizzaId);
        if (recipe.length === 0) return [];
        const missing: string[] = [];
        recipe.forEach((r: any) => {
            const ing = ingredients.find((i: any) => i.id === r.ingrediente_id);
            if (!ing || ing.cantidad_disponible < r.cantidad_requerida) {
                missing.push(ing ? ing.nombre : 'Ing. desconocido');
            }
        });
        return missing;
    };

    const processedPizzas = useMemo(() => {
        let list = [...pizzas];
        if (typeFilter !== 'all') { list = list.filter(p => (p.tipo || 'pizza') === typeFilter); }
        list.sort((a, b) => {
            if (sortOrder === 'alpha') return a.nombre.localeCompare(b.nombre);
            if (sortOrder === 'type') return (a.tipo || 'pizza').localeCompare(b.tipo || 'pizza');
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); 
        });
        return list;
    }, [pizzas, typeFilter, sortOrder]);

    const cycleSort = () => {
        if (sortOrder === 'alpha') setSortOrder('type');
        else if (sortOrder === 'type') setSortOrder('date');
        else setSortOrder('alpha');
    };

    return (
        <div className="space-y-6 pb-24">
            
            {/* CONTROLES VISTA */}
            <div className={`${base.card} p-4 rounded-3xl border flex flex-col gap-3 shadow-sm`}>
                <div className="flex justify-between items-center">
                    <label className={`text-[10px] font-bold uppercase tracking-wider opacity-60 ${base.subtext}`}>VISTA DEL MENÚ</label>
                    <button onClick={cycleSort} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${base.buttonSec}`}>
                        {sortOrder === 'alpha' && <><ArrowDownAZ size={14}/> A-Z</>}
                        {sortOrder === 'type' && <><Filter size={14}/> TIPO</>}
                        {sortOrder === 'date' && <><Calendar size={14}/> RECIENTES</>}
                    </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {['all','pizza','burger','other'].map(t => (
                        <button key={t} onClick={() => setTypeFilter(t as any)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap capitalize ${typeFilter === t ? `${currentTheme.color} text-white border-transparent` : `${base.subtext} border-gray-500/20`}`}>
                            {t === 'all' ? 'Todos' : t === 'pizza' ? 'Pizzas' : t === 'burger' ? 'Burgers' : 'Otros'}
                        </button>
                    ))}
                </div>
            </div>

            {/* FILTROS APP */}
            <div className={`${base.card} p-5 rounded-3xl border flex flex-col gap-3 shadow-sm`}>
                <label className={`text-xs font-bold uppercase tracking-wider opacity-60 ${base.subtext}`}>CATEGORIAS A MOSTRAR EN APP:</label>
                <div className="flex flex-wrap gap-2">
                      <button onClick={async () => {
                          const isAll = activeCategories.includes('Todas');
                          const newVal = isAll ? ['General'] : ['Todas'];
                          setConfig({...config, categoria_activa: JSON.stringify(newVal)});
                      }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${activeCategories.includes('Todas') ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-neutral-100 dark:bg-white/5 border-transparent text-gray-500'}`}>
                          {activeCategories.includes('Todas') ? <CheckSquare size={14}/> : <Square size={14}/>} Todas
                      </button>
                      {uniqueCategories.map((cat: string) => {
                          const isActive = activeCategories.includes(cat);
                          return (
                              <button key={cat} onClick={() => toggleCategory(cat)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isActive ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-neutral-100 dark:bg-white/5 border-transparent text-gray-500'}`}>
                                  {isActive ? <CheckSquare size={14}/> : <Square size={14}/>} {cat}
                              </button>
                          )
                      })}
                </div>
            </div>

            <button onClick={() => setShowNewForm(!showNewForm)} className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 ${showNewForm ? 'bg-red-500 text-white' : `${currentTheme.color} text-white`}`}>
                {showNewForm ? <><X size={20}/> CANCELAR</> : <><Plus size={20}/> NUEVO PRODUCTO</>}
            </button>

            {/* FORMULARIO NUEVO */}
            {showNewForm && (
            <div className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden group animate-in fade-in slide-in-from-top-4 ${base.card}`}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className={`font-bold flex items-center gap-2 text-xl ${base.subtext}`}><Plus size={24}/> Nuevo Item</h3>
                    <div className="flex bg-neutral-100 dark:bg-black/30 rounded-xl p-1 border border-neutral-200 dark:border-white/10">
                        {['pizza','burger','other'].map(t => (
                            <button key={t} onClick={() => { setNewPizzaType(t); setNewPizzaPortions(t === 'pizza' ? 4 : 1); setNewPizzaCat(t === 'pizza' ? 'Pizzas' : t === 'burger' ? 'Hamburguesas' : ''); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${newPizzaType === t ? 'bg-white dark:bg-neutral-800 shadow text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                                {t === 'pizza' ? <Pizza size={14}/> : t === 'burger' ? <BurgerIcon className="w-4 h-4"/> : <Utensils size={14}/>}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex flex-col gap-4">
                    <input className={`w-full text-2xl font-bold bg-transparent outline-none placeholder-opacity-30 ${isDarkMode ? 'placeholder-white' : 'placeholder-black'}`} placeholder="Nombre..." value={newPizzaName} onChange={(e: any) => setNewPizzaName(e.target.value)} />
                    <div className="flex gap-4">
                        <label className={`flex-shrink-0 cursor-pointer w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed ${base.uploadBox} flex items-center justify-center transition-colors group relative`}>
                            {newPizzaImg ? <img src={newPizzaImg} className="w-full h-full object-cover"/> : <ImageIcon size={24} className="opacity-30"/>}
                            <input type="file" accept="image/*" className="hidden" onChange={(e: any) => handleImageUpload(e)} disabled={uploading}/>
                        </label>
                        <textarea className={`flex-1 p-0 bg-transparent text-sm leading-relaxed outline-none resize-none h-24 placeholder-opacity-40 ${isDarkMode ? 'placeholder-white' : 'placeholder-black'}`} placeholder="Descripción..." value={newPizzaDesc} onChange={(e: any) => setNewPizzaDesc(e.target.value)} />
                    </div>

                    <div className={`${base.innerCard} p-3 rounded-2xl`}>
                        <div className="flex flex-wrap gap-2 mb-3">
                             {newPizzaIngredients.map((ing: any, i: number) => (
                                 <span key={i} className="text-xs bg-white shadow-sm dark:bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold text-black dark:text-white">
                                     {ing.nombre} <span className="opacity-50 text-[10px]">{ing.cantidad}</span> <button onClick={() => removeFromNewPizzaRecipe(i)}><X size={12}/></button>
                                 </span>
                             ))}
                        </div>
                        <div className="flex gap-2">
                            <select className={`flex-1 w-0 min-w-0 p-2 text-sm rounded-xl font-bold outline-none bg-white dark:bg-black/20 text-black dark:text-white`} value={newPizzaSelectedIng} onChange={(e: any) => setNewPizzaSelectedIng(e.target.value)}>
                                <option value="">+ Ingrediente</option>
                                {ingredients.map((i: any) => <option key={i.id} value={`${i.id}|${i.nombre}`}>{i.nombre} (Disp: {i.cantidad_disponible})</option>)}
                            </select>
                            <input type="number" placeholder="Cant" className={`w-14 p-2 text-sm rounded-xl text-center font-bold outline-none bg-white dark:bg-black/20 text-black dark:text-white`} value={newPizzaRecipeQty} onChange={(e: any) => setNewPizzaRecipeQty(Number(e.target.value) || '')} />
                            <button onClick={addToNewPizzaRecipe} className="bg-neutral-800 dark:bg-white text-white dark:text-black px-4 rounded-xl text-sm font-bold shadow-sm flex-shrink-0">OK</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                        <div className={`${base.innerCard} p-3 rounded-2xl flex flex-col items-center justify-center text-center`}>
                            <span className="text-[10px] uppercase font-bold opacity-50 tracking-wider mb-1">Categoria</span>
                            <input list="categories" className="w-full text-center font-bold bg-transparent outline-none text-sm" value={newPizzaCat} onChange={(e: any) => setNewPizzaCat(e.target.value)} placeholder={newPizzaType === 'other' ? 'Ej: Bebidas' : ''} />
                            <datalist id="categories">{uniqueCategories.map((c: string) => <option key={c} value={c}/>)}</datalist>
                        </div>
                        <div className={`${base.innerCard} p-3 rounded-2xl flex flex-col items-center justify-center text-center`}>
                            <span className="text-[10px] uppercase font-bold opacity-50 tracking-wider mb-1">Porciones</span>
                            <input type="number" className="w-full text-center font-bold bg-transparent outline-none text-sm" value={newPizzaPortions} onChange={(e: any) => setNewPizzaPortions(Number(e.target.value))} disabled={newPizzaType === 'burger'}/>
                        </div>
                        <div className={`${base.innerCard} p-3 rounded-2xl flex flex-col items-center justify-center text-center`}>
                            <span className="text-[10px] uppercase font-bold opacity-50 tracking-wider mb-1">Stock Est.</span>
                            <span className="text-xl font-bold">{stockEstimadoNueva}</span>
                        </div>
                        <div className={`${base.innerCard} p-3 rounded-2xl flex flex-col items-center justify-center text-center`}>
                            <span className="text-[10px] uppercase font-bold opacity-50 tracking-wider mb-1">Timer</span>
                            <TimeControl value={newPizzaTime} onChange={setNewPizzaTime} isDarkMode={isDarkMode}/>
                        </div>
                    </div>
                    <button onClick={addP} disabled={uploading || !newPizzaName} className={`${currentTheme.color} w-full py-4 rounded-xl text-white font-bold shadow-lg mt-2`}>GUARDAR PLATO</button>
                </div>
            </div>
            )}
            
            {/* LISTA ITEMS */}
            <div className="space-y-3">
                {processedPizzas.map((p: any) => {
                const isEditing = !!edits[p.id];
                const isOpen = expanded[p.id]; 
                const display = { ...p, ...edits[p.id] }; 
                const isNewRecipe = !!edits[p.id]?.local_recipe;
                const currentRecipe = isNewRecipe ? edits[p.id].local_recipe : recetas.filter((r: any) => r.pizza_id === p.id).map((r: any) => ({...r, nombre: ingredients.find((i: any) => i.id === r.ingrediente_id)?.nombre || '?'}));
                
                const dynamicStock = calcularStockDinamico(currentRecipe, ingredients);
                const currentType = display.tipo || 'pizza';
                const stockToShow = currentRecipe.length > 0 ? dynamicStock : (display.stock || 0);
                const missingIngredients = stockToShow === 0 ? getMissingIngredients(p.id) : [];

                return (
                <div key={p.id} className={`p-4 rounded-3xl border flex flex-col relative overflow-hidden transition-all ${base.card} ${isEditing ? 'border-yellow-500/50' : ''}`}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 flex-1 mr-2 min-w-0">
                            <button onClick={() => toggleExpand(p.id)} className={`p-1.5 rounded-lg flex-shrink-0 ${base.buttonSec}`}>
                                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                            {currentType === 'burger' ? <BurgerIcon className="text-orange-500 w-5 h-5 flex-shrink-0" /> : currentType === 'other' ? <Utensils size={20} className="text-blue-500 flex-shrink-0" /> : <Pizza size={20} className="text-red-500 flex-shrink-0" />}
                            
                            <div className="flex-1 overflow-x-auto no-scrollbar flex flex-col">
                                <input value={display.nombre} onChange={(e: any) => updateP(p.id, 'nombre', e.target.value)} className="bg-transparent font-bold text-base outline-none w-full min-w-[150px] border-b border-transparent focus:border-white/20 pb-1" disabled={!isEditing} />
                                {missingIngredients.length > 0 && <span className="text-[9px] font-bold text-red-500 flex items-center gap-1 mt-1 animate-pulse"><AlertCircle size={10} /> Falta: {missingIngredients.join(', ')}</span>}
                            </div>
                            <div className={`px-2 py-0.5 rounded-lg text-xs font-black flex-shrink-0 ${stockToShow > 0 ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>{stockToShow}</div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                            {isEditing ? (
                                <>
                                    <button onClick={() => savePizzaChanges(p.id)} className={`p-2 ${currentTheme.color} text-white rounded-xl animate-pulse shadow-lg hover:scale-105 transition-transform`} title="Guardar"><Save size={16}/></button>
                                    <button onClick={() => cancelChanges(p.id)} className={`p-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-xl shadow-sm hover:scale-105 transition-transform`} title="Cancelar"><X size={16}/></button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => updateP(p.id, 'activa', !p.activa)} className={`p-2 rounded-xl transition-colors ${p.activa ? 'bg-white/10 hover:bg-white/20' : 'bg-black/50 text-neutral-500'}`}>{p.activa ? <Eye size={16}/> : <EyeOff size={16}/>}</button>
                                    <button onClick={() => startEditing(p.id)} className={`p-2 rounded-xl transition-colors bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white`} title="Editar"><Edit3 size={16}/></button>
                                    <button onClick={() => duplicateP(p)} className={`p-2 rounded-xl transition-colors bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white`} title="Duplicar"><Copy size={16}/></button>
                                    <button onClick={() => delP(p.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={16}/></button>
                                </>
                            )}
                        </div>
                    </div>

                    {isOpen && (
                        <div className="flex flex-col gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-200 border-t border-dashed border-gray-500/20 pt-4">
                            <div className="flex gap-4">
                                <label className={`cursor-pointer relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-900 group flex-shrink-0 shadow-inner ${!isEditing ? 'pointer-events-none' : ''}`}>
                                    {display.imagen_url ? <img src={display.imagen_url} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-neutral-600"><ImageIcon size={20}/></div>}
                                    {isEditing && <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"><UploadCloud size={16}/></div>}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e: any) => handleImageUpload(e, p.id)} disabled={!isEditing}/>
                                </label>
                                <textarea value={display.descripcion || ''} onChange={(e: any) => updateP(p.id, 'descripcion', e.target.value)} className={`flex-1 p-0 bg-transparent text-sm leading-relaxed outline-none resize-none h-20 opacity-80 placeholder-opacity-30 ${isDarkMode ? 'placeholder-white' : 'placeholder-black'}`} placeholder="Descripción..." disabled={!isEditing} />
                            </div>
                            
                            <div className={`${base.innerCard} p-3 rounded-2xl`}>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[10px] font-bold uppercase opacity-50 tracking-wider">Receta</p>
                                    <span className="text-[10px] font-bold bg-black/20 px-2 py-0.5 rounded-full">{currentRecipe.length} Ingredientes</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {currentRecipe.map((r: any, idx: number) => {
                                        const ing = ingredients.find((i: any) => i.id === r.ingrediente_id);
                                        const isMissing = ing && ing.cantidad_disponible < r.cantidad_requerida;
                                        return (
                                            <span key={idx} className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1 border font-medium ${isMissing ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-white dark:bg-white/10 border-black/5 dark:border-white/5 text-black dark:text-white'}`}>
                                                {r.nombre}: {r.cantidad_requerida}
                                                {isEditing && <button onClick={() => removeFromExistingPizza(p.id, idx, currentRecipe)} className="text-red-400 hover:text-red-300 ml-1"><X size={12}/></button>}
                                            </span>
                                        );
                                    })}
                                </div>
                                {isEditing && (
                                <div className="flex gap-2">
                                    <select className={`flex-1 w-0 min-w-0 p-1.5 text-xs rounded-lg font-bold outline-none bg-white dark:bg-black/20 text-black dark:text-white`} value={tempRecipeIng[p.id] || ''} onChange={(e: any) => setTempRecipeIng({...tempRecipeIng, [p.id]: e.target.value})}>
                                        <option value="">+ Ingrediente</option>
                                        {ingredients.map((i: any) => <option key={i.id} value={`${i.id}|${i.nombre}`}>{i.nombre} (Disp: {i.cantidad_disponible})</option>)}
                                    </select>
                                    <input type="number" placeholder="Cant" className={`w-12 p-1.5 text-xs rounded-lg text-center font-bold outline-none bg-white dark:bg-black/20 text-black dark:text-white`} value={tempRecipeQty[p.id] || ''} onChange={(e: any) => setTempRecipeQty({...tempRecipeQty, [p.id]: Number(e.target.value) || ''})} />
                                    <button onClick={() => {
                                        if(!tempRecipeIng[p.id]) return;
                                        const [ingId, name] = tempRecipeIng[p.id].split('|');
                                        addToExistingPizza(p.id, ingId, name, tempRecipeQty[p.id] || 0, currentRecipe);
                                        setTempRecipeIng({...tempRecipeIng, [p.id]: ''}); 
                                        setTempRecipeQty({...tempRecipeQty, [p.id]: ''});
                                    }} className="bg-neutral-800 dark:bg-white text-white dark:text-black px-3 rounded-lg text-xs font-bold flex-shrink-0">OK</button>
                                </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className={`${base.innerCard} p-2 rounded-2xl flex flex-col items-center justify-center text-center`}>
                                    <span className="text-[9px] uppercase font-bold opacity-50 tracking-wider mb-1">Tipo & Cat.</span>
                                    <div className="flex gap-1 bg-black/10 dark:bg-white/5 p-1 rounded-lg mb-1">
                                        <button disabled={!isEditing} onClick={() => { updateP(p.id, 'tipo', 'pizza'); updateP(p.id, 'categoria', 'Pizzas'); updateP(p.id, 'porciones_individuales', 4); }} className={`p-1.5 rounded-md transition-all ${currentType === 'pizza' ? 'bg-white dark:bg-neutral-700 text-red-500 shadow' : 'text-gray-400 hover:text-gray-500'} ${!isEditing ? 'opacity-50' : ''}`}><Pizza size={16}/></button>
                                        <button disabled={!isEditing} onClick={() => { updateP(p.id, 'tipo', 'burger'); updateP(p.id, 'categoria', 'Hamburguesas'); updateP(p.id, 'porciones_individuales', 1); }} className={`p-1.5 rounded-md transition-all ${currentType === 'burger' ? 'bg-white dark:bg-neutral-700 text-orange-500 shadow' : 'text-gray-400 hover:text-gray-500'} ${!isEditing ? 'opacity-50' : ''}`}><BurgerIcon className="w-4 h-4"/></button>
                                        <button disabled={!isEditing} onClick={() => { updateP(p.id, 'tipo', 'other'); }} className={`p-1.5 rounded-md transition-all ${currentType === 'other' ? 'bg-white dark:bg-neutral-700 text-blue-500 shadow' : 'text-gray-400 hover:text-gray-500'} ${!isEditing ? 'opacity-50' : ''}`}><Utensils size={16}/></button>
                                    </div>
                                    <input list="categories" value={display.categoria || ''} onChange={(e: any) => updateP(p.id, 'categoria', e.target.value)} className={`w-full text-center bg-transparent outline-none text-[10px] font-bold opacity-80`} placeholder="Categoría..." disabled={!isEditing} />
                                </div>
                                <div className={`${base.innerCard} p-2 rounded-2xl flex flex-col items-center justify-center text-center ${currentType === 'burger' ? 'opacity-50' : ''}`}>
                                    <span className="text-[9px] uppercase font-bold opacity-50 tracking-wider mb-1">Porciones</span>
                                    <input type="number" disabled={!isEditing || currentType === 'burger'} value={display.porciones_individuales || ''} onChange={(e: any) => updateP(p.id, 'porciones_individuales', e.target.value ? parseInt(e.target.value) : null)} className={`w-full text-center bg-transparent outline-none text-sm font-bold`} />
                                </div>
                                <div className={`${base.innerCard} p-2 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden text-center`}>
                                    <span className="text-[9px] uppercase font-bold opacity-50 tracking-wider mb-1">Stock</span>
                                    {currentRecipe.length > 0 ? <div className="flex items-center gap-1 font-bold text-xl"><Calculator size={14} className="opacity-30"/> {dynamicStock}</div> : <input type="number" value={display.stock || 0} onChange={(e: any) => updateP(p.id, 'stock', parseInt(e.target.value))} disabled={!isEditing} className={`w-full text-center bg-transparent outline-none text-sm font-bold`} />}
                                </div>
                                <div className={`${base.innerCard} p-2 rounded-2xl flex flex-col items-center justify-center text-center`}>
                                    <span className="text-[9px] uppercase font-bold opacity-50 tracking-wider mb-1">Timer</span>
                                    {isEditing ? <TimeControl value={display.tiempo_coccion || 60} onChange={(val: number) => updateP(p.id, 'tiempo_coccion', val)} isDarkMode={isDarkMode} /> : <span className="text-xl font-bold">{display.tiempo_coccion || 60}m</span>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                );})}
            </div>
        </div>
    );
};