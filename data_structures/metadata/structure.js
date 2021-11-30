'use strict';

import Info from './info.js';

import Model from './model.js';
import ModelCA from './model_ca.js';
import TypeModel from './type_model.js';
import TypeModelCA from './type_model_ca.js';
import TypePort from './type_port.js';
import MessageType from './message_type.js';
import Link from './link.js';
import Metadata from './metadata.js';
 
/** 
* The structure class holds all the structural elements of a simulation models. 
* Structural elements include models, ports, submodels, links, etc. This class 
* is instantiated from a json file that follows the metadata specification.
*/
export default class Structure { 
	
	/** 
	* Gets the size of the simulation model. The size returned varies according 
	* to the simulation specialization (DEVS, Cell-DEVS)
	* @type {object} 
	*/
	get size() { return this.models.length; }
	
	/** 
	* Gets the type of the simulation model (DEVS, Cell-DEVS)
	* @type {string} 
	*/
	get type() { return this.info.type; }
	
	/** 
	* Gets the context info associated to the simulation structure
	* @type {Info} 
	*/
	get info() { return this._json.info; }
	
	/** 
	* Sets the context info associated to the simulation structure
	* @type {Info} 
	*/
	set info(value) { this._json.info = value; }

	/** 
	* Gets all models in the simulation structure
	* @type {Model[]} 
	*/
	get models() { return this._json.models; }
	
	/** 
	* Sets all models in the simulation structure
	* @type {Model[]} 
	*/
	set models(value) { 
		this._json.models = []; 
		this._model_index = {};
		
		value.forEach(m => this.add_model(m));
	}
	
	/** 
	* Gets all model types in the simulation structure
	* @type {Model[]} 
	*/
	get model_types() { return this._json.model_types; }
	
	/** 
	* Sets all model types in the simulation structure
	* @type {Model[]} 
	*/
	set model_types(value) { this._json.model_types = value; }
	
	/** 
	* Gets all message types in the simulation structure
	* @type {Model[]} 
	*/
	get message_types() { return this._json.message_types; }
	
	/** 
	* Sets all message types in the simulation structure
	* @type {Model[]} 
	*/
	set message_types(value) { this._json.message_types = value; }
	
    /**
     * @param {Info} info - the context info associated to the simulation structure
     * @param {Model[]} models - all models in the simulation structure
     * @param {TypeModel[]} model_types - all model types in the simulation structure
     * @param {MessageType[]} message_types - all message types in the simulation structure
     */	
	 constructor(info, models, model_types, message_types) {		
		this._json = {};
		
		this.info = info || null;
		this.models = models || [];
		this.model_types = model_types || [];
		this.message_types = message_types || [];
	}
	
    /**
     * Adds a model to the simulation structure.
     * @param {Model} model - the model to add to the simulation structure
     */
	add_model(model) {
		this.models.push(model);
		
		this._model_index[model.id] = model;
	}
	
    /**
     * Retrieve a model from the simulation structure by id
     * @param {string} id - the id of the model to retrieve
	 * @return {Model} the model corresponding to the id
     */
	get_model(id) {
		return this._model_index[id] || null;
	}
	
    /**
     * Retrieve a port type from a model 
     * @param {string} model_id - the id of the model the port belongs to
     * @param {string} port_name - the port name to retrieve
	 * @return {TypePort} The port type corresponding to the model id and port name
     */
	get_port(model_id, port_name) {
		return this.get_model(model_id).get_port(port_name);
	}
	
    /**
     * Retrieve a list of links outgoing from a port 
     * @param {Model} model - The mode to which the port belongs to
     * @param {TypePort} port - The port to which the links belong to
	 * @return {Link[]} the outgoing links from the port provided
     */
	get_port_links(model, port) {
		return model.get_port_links(port);
	}
	
    /**
     * Builds a simulation structure from a json file that follows the model
	 * metadata specification
     * @param {object} json - the contents of the metadata model specification
	 * @return {Structure} the simulation structure built from the file
     */
	static from_json(json) {
		// build all message types from json
		var message_types = json.message_types.map(m => new MessageType(m.id, m.name, m.template, m.description));
		
		// build all node types from json
		var model_types = json.model_types.map(t => {
			// build model type metadata from json
			var metadata = null;
			
			if (t.metadata) metadata = new Metadata(t.metadata.author, t.metadata.created, t.metadata.description, t.metadata.tags);
			
			// build model type ports from json
			var ports = t.ports.map(p => {
				var message_type = message_types[p.message_type] || null;
				
				return new TypePort(p.name, p.type, message_type);
			});
			
			// build model type from json
			var message_type = message_types[t.message_type] || null;

			if ("dim" in t) return new TypeModelCA(t.id, t.name, t.type, message_type, ports, null, metadata, t.dim);

			else return new TypeModel(t.id, t.name, t.type, message_type, ports, null, metadata);
		});
		
		// build subcomponents from json
		var models = json.components.map(c => {
			var model_type = model_types[c.model_type];
			
			if (model_type instanceof TypeModelCA) return new ModelCA(c.id, model_type, null);
			
			else return new Model(c.id, model_type, null); 
		});
		
		// build info object from json		
		var info = new Info(models[json.top].name, json.simulator, json.formalism);

		// Link model type couplings and components to proper objects 
		json.model_types.forEach((t, i) => {			
			if (t.components) model_types[i].submodels = t.components.map(c => models[c]);
			
			if (t.couplings) t.couplings.forEach(l => {
				var mA = models[l[0]];
				var mB = models[l[2]];
				var pA = mA.ports[l[1]];
				var pB = mB.ports[l[3]];
				
				mA.add_link(new Link(mA, pA, mB, pB));
			});
		});
		
		return new Structure(info, models, model_types, message_types);
	}
}