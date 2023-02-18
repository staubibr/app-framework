'use strict';

import List from '../../base/list.js';
import ModelAtomic from './model-atomic.js';
import ModelCoupled from './model-coupled.js';
import ModelGrid from './model-grid.js';
import Subcomponent from './subcomponent.js';

/**
 * Metadata field element
 * @module metadata/metadata
 * @extends List
 */
export default class Metadata { 
	
	get root() { return this._root; }
	
	get models() { return this._models; }
	
	get types() { return this._types; }
	
	get coupled_types() { return this.types.filter(t => t instanceof ModelCoupled); }
	
	get atomic_types() { return this.types.filter(t => t instanceof ModelAtomic); }
	
	get grid_types() { return this.types.filter(t => t instanceof ModelGrid); }
	
	get atomic_models() { return this.models.filter(m => m.model_type instanceof ModelAtomic); }
	
	get links() { return this._links; }
		
    /**
	 * The metadata for the simulation (list of model types)
     */
	constructor(root_id, root_type, simulation_name) {		
		var type = ModelCoupled.make(root_type, simulation_name);
		var root = Subcomponent.make(root_id, type);
		
		this._models = new List(m => m.id, [root]);
		this._types = new List(t => t.id, [type]);
		
		this._root = root;
	}
	
	toJSON() {
		return this.types;
	}
}