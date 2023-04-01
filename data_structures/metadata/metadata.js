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
	
	get root() { return this.models[0]; }
	
	get models() { return this._models; }
	
	get types() { return this._types; }
	
	get coupled_types() { return this.types.filter(t => t instanceof ModelCoupled); }
	
	get atomic_types() { return this.types.filter(t => t instanceof ModelAtomic); }
	
	get grid_types() { return this.types.filter(t => t instanceof ModelGrid); }
	
	get atomic_models() { return this.models.filter(m => m.type instanceof ModelAtomic); }
		
    /**
	 * The metadata for the simulation (list of model types)
     */
	constructor(top_type_id, top_id) {				
		this._models = [];
		this._types = new List(t => t.id);	

		if (!top_type_id || !top_id) return;

		var top = new ModelCoupled(ModelCoupled.make(top_type_id, top_type_id));
		var sub = new Subcomponent(Subcomponent.make(top_id, top));
		
		this.types.add(top);
		this.add_model(sub);
	}
	
	add_model(subcomponent) {
		subcomponent.position = this.models.length;
		
		this.models.push(subcomponent);
		
		return subcomponent;
	}
	
	get_model(id) {
		return this.models.find(m => m.id == id);
	}
	
	add_type(type) {
		return this.types.add(type);
	}
	
	add_subcomponent(coupled, subcomponent) {
		subcomponent.type = this.types.get(subcomponent.type);
		//THROW ERROR IF NOT MODEL TYPE
		coupled?.add_subcomponent(subcomponent);
		
		return this.add_model(subcomponent);
	}
	
	add_coupling(coupled, c) {	// subcomponent, coupling	
		c.from_model = c.from_model ? this.get_model(c.from_model) : coupled;
		c.from_port = c.from_model.port.get(c.from_port);
		
		c.to_model = c.to_model ? this.get_model(c.to_model) : coupled;
		c.to_port = c.to_model.port.get(c.to_port);
		
		return coupled.add_coupling(c);
	}

	toJSON() {
		return this.types;
	}
}