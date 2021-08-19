'use strict';

import Info from './info.js';

import { ModelNode, ModelNodeCA } from './node.js';
import { ModelType, ModelTypeCA, PortType } from './nodeType.js';
import { MessageType } from './message_type.js';
import { Link } from './link.js';
import { Metadata } from './metadata.js';
 
export default class Structure { 
	
	get size() { return this.models.length; }
	get type() { return this.info.type; }
	
	get info() { return this._json.info; }
	set info(value) { this._json.info = value; }

	get models() { return this._json.models; }
	set models(value) { 
		this._json.models = []; 
		this._model_index = {};
		
		value.forEach(m => this.AddModel(m));
	}
	
	get model_types() { return this._json.model_types; }
	set model_types(value) { this._json.model_types = value; }
	
	get message_types() { return this._json.message_types; }
	set message_types(value) { this._json.message_types = value; }
	
	// NOTE: Standard for loops are faster than forEach. Maybe replace the forEach loops by for loops.
	constructor(info, models, model_types, message_types) {
		this._json = {};
		
		this.info = info ?? null;
		this.models = models ?? [];
		this.model_types = model_types ?? [];
		this.message_types = message_types ?? [];
	}
	
	AddModel(model) {
		this.models.push(model);
		
		this._model_index[model.id] = model;
	}
	
	Model(id) {
		return this._model_index[id] || null;
	}
	
	Port(model_id, port_name) {
		return this.Model(model_id).Port(port_name);
	}
	
	PortLinks(model, port) {
		return model.PortLinks(port);
	}
	
	static FromJson(json) {
		// build all message types from json
		var message_types = json.message_types.map(m => new MessageType(m.id, m.name, m.template, m.description));
		
		// build all node types from json
		var model_types = json.model_types.map(t => {
			// build model type metadata from json
			var metadata = new Metadata(t.metadata.author, t.metadata.created, t.metadata.description, t.metadata.tags);
			
			// build model type ports from json
			var ports = t.ports.map(p => {
				var message_type = message_types[p.message_type] || null;
				
				return new PortType(p.name, p.type, message_type);
			});
			
			// build model type from json
			var message_type = message_types[t.message_type] || null;

			if ("dim" in t) return new ModelTypeCA(t.id, t.name, t.type, message_type, ports, null, null, metadata, t.dim);

			else return new ModelType(t.id, t.name, t.type, message_type, ports, null, null, metadata);
		});
		
		// build subcomponents from json
		var models = json.components.map(c => {
			var model_type = model_types[c.model_type];
			
			if (model_type instanceof ModelTypeCA) return new ModelNodeCA(c.id, model_type, null);
			
			else return new ModelNode(c.id, model_type, null); 
		});
		
		// build info object from json		
		var info = new Info(models[json.top].name, json.simulator, json.formalism);

		// Link model type couplings and components to proper objects 
		json.model_types.forEach((t, i) => {			
			if (t.components) model_types[i].models = t.components.map(c => models[c]);
			
			if (t.couplings) t.couplings.forEach(l => {
				var mA = models[l[0]];
				var mB = models[l[2]];
				var pA = mA.ports[l[1]];
				var pB = mB.ports[l[3]];
				
				mA.AddLink(new Link(mA, pA, mB, pB));
			});
		});
		
		return new Structure(info, models, model_types, message_types);
	}
}