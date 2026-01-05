import { Plus, Trash2, Image, Save, X, Edit3, Copy, Settings, PlusCircle } from 'lucide-react';
import { useState } from 'react';

export const MenuView = ({ 
    base, config, setConfig, activeCategories, uniqueCategories, toggleCategory, currentTheme, 
    addP, uploading, newPizzaName, setNewPizzaName, isDarkMode, handleImageUpload, newPizzaImg, 
    newPizzaDesc, setNewPizzaDesc, newPizzaIngredients, removeFromNewPizzaRecipe, newPizzaSelectedIng, 
    setNewPizzaSelectedIng, ingredients, newPizzaRecipeQty, setNewPizzaRecipeQty, addToNewPizzaRecipe, 
    newPizzaCat, setNewPizzaCat, newPizzaPortions, setNewPizzaPortions, stockEstimadoNueva, newPizzaTime, 
    setNewPizzaTime, pizzas, edits, recetas, updateP, savePizzaChanges, cancelChanges, delP, duplicateP, 
    tempRecipeIng, setTempRecipeIng, tempRecipeQty, setTempRecipeQty, addToExistingPizza, removeFromExistingPizza, 
    reservedState, calcularStockDinamico, updateLocalRecipe, newPizzaType, setNewPizzaType, typeFilter, 
    setTypeFilter, sortOrder, setSortOrder,
    // PROPS DE ADICIONALES
    adicionales, addAdicional, delAdicional
}: any) => {

    const [expandedPizza, setExpandedPizza] = useState<string | null>(null);
    const [showNewForm, setShowNewForm] = useState(false);

    // Estados locales para crear nuevo adicional
    const [newAdiIng, setNewAdiIng] = useState('');
    const [newAdiQty, setNewAdiQty] = useState('');
    const [newAdiName, setNewAdiName] = useState('');

    const toggleExpand = (id: string) => setExpandedPizza(expandedPizza === id ? null : id);

    // Filtrar y ordenar
    let filteredPizzas = [...pizzas];
    if (typeFilter !== 'all') {
        filteredPizzas = filteredPizzas.filter((p: any) => p.tipo === typeFilter);
    }
    
    if (sortOrder === 'alpha') {
        filteredPizzas.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
    } else if (sortOrder === 'date') {
        filteredPizzas.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOrder === 'type') {
        filteredPizzas.sort((a: any, b: any) => a.tipo.localeCompare(b.tipo));
    }

    return (
        <div className="space-y-6">
            
             {/* CABECERA Y FILTROS */}
             <div className={`p-4 rounded-3xl border ${base.card} space-y-4`}>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Edit3 /> Gestión del Menú
                    </h2>
                    <button onClick={() => setShowNewForm(!showNewForm)} className={`p-2 rounded-xl font-bold text-xs flex items-center gap-2 ${showNewForm ? 'bg-red-500 text-white' : 'bg-black text-white'}`}>
                        {showNewForm ? <X size={16}/> : <Plus size={16}/>} {showNewForm ? 'Cerrar' : 'Nuevo Item'}
                    </button>
                </div>

                {/* FORMULARIO NUEVO ITEM */}
                {showNewForm && (
                    <div className="animate-in fade-in slide-in-from-top-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <div className={`w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:bg-black/5 transition ${base.uploadBox}`}>
                                        {newPizzaImg ? <img src={newPizzaImg} className="w-full h-full object-cover" /> : <Image className="opacity-20"/>}
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                                        {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] font-bold">Subiendo...</div>}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input value={newPizzaName} onChange={e => setNewPizzaName(e.target.value)} placeholder="Nombre del plato..." className={`w-full p-2 rounded-lg text-sm border outline-none ${base.input}`} />
                                        <select value={newPizzaType} onChange={e => setNewPizzaType(e.target.value)} className={`w-full p-2 rounded-lg text-sm border outline-none ${base.input}`}>
                                            <option value="pizza">Pizza</option>
                                            <option value="burger">Hamburguesa</option>
                                            <option value="other">Otro</option>
                                        </select>
                                    </div>
                                </div>
                                <textarea value={newPizzaDesc} onChange={e => setNewPizzaDesc(e.target.value)} placeholder="Descripción..." className={`w-full p-2 rounded-lg text-sm border outline-none resize-none h-20 ${base.input}`} />
                            </div>

                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <input type="text" value={newPizzaCat} onChange={e => setNewPizzaCat(e.target.value)} placeholder="Categoría (ej: Clásicas)" className={`flex-1 p-2 rounded-lg text-sm border outline-none ${base.input}`} />
                                    <input type="number" value={newPizzaPortions} onChange={e => setNewPizzaPortions(Number(e.target.value))} placeholder="Porciones (Unidades)" className={`w-24 p-2 rounded-lg text-sm border outline-none ${base.input}`} />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <input type="number" value={newPizzaTime} onChange={e => setNewPizzaTime(Number(e.target.value))} className={`w-20 p-2 rounded-lg text-sm border outline-none ${base.input}`} />
                                    <span className="text-xs opacity-50">minutos cocción</span>
                                </div>

                                {/* RECETA DEL NUEVO ITEM */}
                                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5">
                                    <div className="flex gap-2 mb-2">
                                        <select value={newPizzaSelectedIng} onChange={e => setNewPizzaSelectedIng(e.target.value)} className={`flex-1 p-2 rounded-lg text-xs border outline-none ${base.input}`}>
                                            <option value="">Agregar ingrediente...</option>
                                            {ingredients.map((i: any) => <option key={i.id} value={`${i.id}|${i.nombre}`}>{i.nombre} ({i.unidad})</option>)}
                                        </select>
                                        <input type="number" value={newPizzaRecipeQty} onChange={e => setNewPizzaRecipeQty(e.target.value)} placeholder="Cant." className={`w-16 p-2 rounded-lg text-xs border outline-none ${base.input}`} />
                                        <button onClick={addToNewPizzaRecipe} className="bg-blue-500 text-white p-2 rounded-lg"><Plus size={16}/></button>
                                    </div>
                                    <div className="space-y-1 max-h-24 overflow-y-auto">
                                        {newPizzaIngredients.map((ing: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center text-xs p-1 bg-white dark:bg-black/20 rounded px-2">
                                                <span>{ing.nombre} ({ing.cantidad})</span>
                                                <button onClick={() => removeFromNewPizzaRecipe(idx)} className="text-red-500"><X size={12}/></button>
                                            </div>
                                        ))}
                                        {newPizzaIngredients.length === 0 && <p className="text-[10px] opacity-40 text-center">Sin ingredientes</p>}
                                    </div>
                                    <p className="text-[10px] mt-2 text-right opacity-60 font-bold">Stock est: {stockEstimadoNueva} u.</p>
                                </div>
                            </div>
                         </div>
                         <button onClick={addP} disabled={!newPizzaName} className="w-full py-3 bg-black text-white font-bold rounded-xl hover:opacity-80 disabled:opacity-50">CREAR ITEM</button>
                    </div>
                )}
                
                {/* FILTROS Y ORDEN */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center text-xs">
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
                        <button onClick={() => setTypeFilter('all')} className={`px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${typeFilter === 'all' ? 'bg-black text-white border-black' : base.buttonSec}`}>Todos</button>
                        <button onClick={() => setTypeFilter('pizza')} className={`px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${typeFilter === 'pizza' ? 'bg-black text-white border-black' : base.buttonSec}`}>Pizzas</button>
                        <button onClick={() => setTypeFilter('burger')} className={`px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${typeFilter === 'burger' ? 'bg-black text-white border-black' : base.buttonSec}`}>Burgers</button>
                        <button onClick={() => setTypeFilter('other')} className={`px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${typeFilter === 'other' ? 'bg-black text-white border-black' : base.buttonSec}`}>Otros</button>
                    </div>
                    <div className="flex gap-2 items-center bg-black/5 p-1 rounded-lg">
                        <span className="px-2 opacity-50 font-bold">Ordenar:</span>
                        <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className="bg-transparent outline-none font-bold cursor-pointer">
                            <option value="alpha">A-Z</option>
                            <option value="type">Tipo</option>
                            <option value="date">Creado</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {/* LISTA DE PLATOS */}
            <div className="space-y-4">
                {filteredPizzas.map((pizza: any) => {
                    const isEditing = edits[pizza.id];
                    const currentRecipe = isEditing?.local_recipe || recetas.filter((r: any) => r.pizza_id === pizza.id);
                    const stockReal = calcularStockDinamico(currentRecipe, ingredients);
                    const hasChanges = isEditing && (Object.keys(isEditing).length > 0);
                    // Filtramos los adicionales de esta pizza
                    const currentAdicionales = adicionales ? adicionales.filter((a:any) => a.pizza_id === pizza.id) : [];
                    
                    return (
                        <div key={pizza.id} className={`${base.card} rounded-3xl overflow-hidden border shadow-sm transition-all`}>
                            
                            {/* VISTA RESUMIDA */}
                            <div className="flex p-4 gap-4 cursor-pointer hover:bg-black/5 transition-colors" onClick={() => toggleExpand(pizza.id)}>
                                <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                                    {pizza.imagen_url ? <img src={pizza.imagen_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center opacity-20"><Image/></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight truncate">{pizza.nombre}</h3>
                                            <p className={`text-xs mt-0.5 opacity-60`}>{pizza.categoria || 'General'} • {pizza.tipo === 'burger' ? 'Hamburguesa' : pizza.tipo === 'pizza' ? 'Pizza' : 'Otro'}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-[10px] font-bold ${pizza.activa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {pizza.activa ? 'ACTIVO' : 'INACTIVO'}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-2 text-xs font-mono opacity-70">
                                        <span>Stock: {stockReal}</span>
                                        <span>Tiempo: {pizza.tiempo_coccion}m</span>
                                        <span>{currentRecipe.length} ings.</span>
                                    </div>
                                </div>
                            </div>

                            {/* ZONA EXPANDIDA DE EDICIÓN */}
                            {expandedPizza === pizza.id && (
                                <div className={`p-4 border-t ${base.divider} bg-neutral-50/50 dark:bg-black/20 space-y-6 animate-in slide-in-from-top-2`}>
                                    
                                    {/* 1. DATOS BÁSICOS */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase opacity-50 block">Información</label>
                                            <input value={isEditing?.nombre ?? pizza.nombre} onChange={e => updateP(pizza.id, 'nombre', e.target.value)} className={`w-full p-2 rounded-lg text-sm border outline-none ${base.input}`} />
                                            <textarea value={isEditing?.descripcion ?? pizza.descripcion} onChange={e => updateP(pizza.id, 'descripcion', e.target.value)} className={`w-full p-2 rounded-lg text-sm border outline-none resize-none h-20 ${base.input}`} />
                                            <div className="flex gap-2">
                                                 <input type="text" value={isEditing?.categoria ?? pizza.categoria} onChange={e => updateP(pizza.id, 'categoria', e.target.value)} className={`flex-1 p-2 rounded-lg text-sm border outline-none ${base.input}`} />
                                                 <div className="flex items-center gap-2 border px-2 rounded-lg bg-white dark:bg-black/20">
                                                     <span className="text-xs">Activa</span>
                                                     <input type="checkbox" checked={isEditing?.activa ?? pizza.activa} onChange={e => updateP(pizza.id, 'activa', e.target.checked)} />
                                                 </div>
                                            </div>
                                        </div>

                                        {/* 2. RECETA */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase opacity-50 block">Receta (Ingredientes Base)</label>
                                            <div className="bg-white dark:bg-black/20 border rounded-xl p-2 max-h-40 overflow-y-auto">
                                                {currentRecipe.map((r: any, idx: number) => {
                                                    const ing = ingredients.find((i: any) => i.id === r.ingrediente_id);
                                                    return (
                                                        <div key={idx} className="flex justify-between items-center text-xs p-2 border-b last:border-0 border-dashed border-gray-200 dark:border-white/10">
                                                            <span>{ing?.nombre || r.nombre}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono opacity-50">{r.cantidad_requerida} {ing?.unidad}</span>
                                                                <button onClick={() => removeFromExistingPizza(pizza.id, idx, currentRecipe)} className="text-red-400 hover:text-red-600"><X size={12}/></button>
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
                                                    <option value="">Ingrediente...</option>
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
                                                    className="bg-blue-500 text-white p-2 rounded-lg"
                                                ><Plus size={16}/></button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. SECCIÓN ADICIONALES (NUEVO PUNTO 12) */}
                                    <div className="pt-4 border-t border-dashed border-gray-300 dark:border-white/10">
                                        <h4 className="text-sm font-bold uppercase opacity-70 mb-3 flex items-center gap-2">
                                            <PlusCircle size={16}/> Adicionales / Extras
                                        </h4>

                                        {/* Lista de Adicionales Actuales */}
                                        {currentAdicionales.length > 0 ? (
                                            <div className="grid gap-2 mb-4">
                                                {currentAdicionales.map((adi: any) => {
                                                    const ingName = ingredients.find((i:any) => i.id === adi.ingrediente_id)?.nombre || '???';
                                                    return (
                                                        <div key={adi.id} className={`flex justify-between items-center p-2 rounded-lg border ${base.innerCard} text-xs`}>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold">{adi.nombre_visible}</span>
                                                                <span className="opacity-60">{ingName} ({adi.cantidad_requerida})</span>
                                                            </div>
                                                            <button onClick={() => delAdicional(adi.id)} className="text-red-500 p-1 hover:bg-red-100 rounded">
                                                                <Trash2 size={14}/>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-xs opacity-40 italic mb-4">No hay adicionales configurados para este plato.</p>
                                        )}

                                        {/* Formulario Agregar Adicional */}
                                        <div className="flex flex-col gap-2 bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5">
                                            <span className="text-[10px] font-bold uppercase opacity-50">Nuevo Adicional</span>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input 
                                                    placeholder="Nombre visible (ej: Extra Bacon)" 
                                                    className={`p-2 rounded-lg text-xs ${base.input}`}
                                                    value={newAdiName}
                                                    onChange={e => setNewAdiName(e.target.value)}
                                                />
                                                <input 
                                                    type="number" 
                                                    placeholder="Cant. a descontar" 
                                                    className={`p-2 rounded-lg text-xs ${base.input}`}
                                                    value={newAdiQty}
                                                    onChange={e => setNewAdiQty(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <select 
                                                    className={`flex-1 p-2 rounded-lg text-xs ${base.input}`}
                                                    value={newAdiIng}
                                                    onChange={e => setNewAdiIng(e.target.value)}
                                                >
                                                    <option value="">Ingrediente del inventario...</option>
                                                    {ingredients.map((i:any) => <option key={i.id} value={i.id}>{i.nombre} ({i.unidad})</option>)}
                                                </select>
                                                <button 
                                                    onClick={() => {
                                                        addAdicional(pizza.id, newAdiIng, Number(newAdiQty), newAdiName);
                                                        setNewAdiName(''); setNewAdiQty(''); setNewAdiIng('');
                                                    }}
                                                    disabled={!newAdiName || !newAdiQty || !newAdiIng}
                                                    className="bg-green-600 text-white p-2 rounded-lg font-bold text-xs hover:bg-green-500 disabled:opacity-50"
                                                >
                                                    <Plus size={16}/> Agregar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* ----------------------------------- */}

                                    {/* BOTONES ACCIÓN FOOTER */}
                                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-white/10 mt-4">
                                        <button onClick={() => duplicateP(pizza)} className={`p-3 rounded-xl border ${base.buttonSec}`} title="Duplicar"><Copy size={18}/></button>
                                        <button onClick={() => delP(pizza.id)} className="p-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50" title="Eliminar"><Trash2 size={18}/></button>
                                        
                                        <div className="flex-1 flex gap-3 justify-end">
                                            {hasChanges && (
                                                <>
                                                    <button onClick={() => cancelChanges(pizza.id)} className={`px-6 py-3 rounded-xl border font-bold ${base.buttonSec}`}>Cancelar</button>
                                                    <button onClick={() => savePizzaChanges(pizza.id)} className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold shadow-lg flex items-center gap-2 hover:bg-green-500"><Save size={18}/> Guardar</button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* CAMBIO DE IMAGEN */}
                                    <div className="relative group cursor-pointer w-full h-32 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors flex items-center justify-center bg-gray-50 dark:bg-black/20">
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 z-10 cursor-pointer" onChange={(e) => handleImageUpload(e, pizza.id)} />
                                        <div className="text-center opacity-50">
                                            <Image className="mx-auto mb-1"/>
                                            <span className="text-xs font-bold">Cambiar Foto</span>
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