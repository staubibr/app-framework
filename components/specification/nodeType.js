'use strict';

export class NodeType { 

	get name() { return this._json.name; }
	set name(value) { this._json.name = value; }
	
	get type() {  return this._json.type; }
	set type(value) { this._json.type = value; }
	
	get message_type() { return this._json.message_type; }
	set message_type(value) { this._json.message_type = value; }
	
	get template() { return this.message_type.template; }
	set template(value) { this.message_type.template = value; }
	
	constructor(name, type, message_type) {
		this._json = {}
		
		this.name = name ?? null;
		this.type = type ?? null;
		this.message_type = message_type ?? null;
	}
	
	Template(values) {
		if (!this.message_type || !this.template) return values;
		
		if (this.template.length != values.length) {
			throw new Error("length mismatch between message type fields and message content. Check that your output function returns a comma delimited string the same length as your message_type fields property. ");			
		}
		var out = {};
		
		for (var i = 0; i < this.template.length; i++) {
			var f = this.template[i];
			var v = values[i];
			
			if (v != "") out[f] = isNaN(v) ? v : +v;
		}
		
		return out;
	}
	
	Template0() {
		if (!this.message_type || !this.template) return 0;
		
		var d = {};
		
		this.template.forEach(f => d[f] = 0);
		
		return d;
	}
}

export class ModelType extends NodeType { 
	
	get id() {  return this._json.id; }
	set id(value) { this._json.id = value; }
	
	get ports() {  return this._json.ports; }
	set ports(value) { 
		this._json.ports = []; 
		this._port_index = {};
		
		value.forEach(p => this.AddPort(p));
	}
	
	get models() {  return this._json.models; }
	set models(value) { 
		this._json.models = []; 
		this._model_index = {};
		
		value.forEach(m => this.AddModel(m));
	}
	
	get links() {  return this._json.links; }
	set links(value) { this._json.links = value; }
	
	get metadata() {  return this._json.metadata; }
	set metadata(value) { this._json.metadata = value; }
	
	constructor(id, name, type, message_type, ports, models, links, metadata) {
		super(name, type, message_type);
		
		this.id = id ?? null;
		this.ports = ports ?? [];
		this.models = models ?? [];
		this.links = links ?? [];
		this.metadata = metadata ?? null;
	}
	
	AddModel(model) {
		this.models.push(model);
		
		this._model_index[model.id] = model;
	}
	
	AddPort(port) {
		this._json.ports.push(port);
		
		this._port_index[port.name] = port;
	}
	
	Model(id) {
		return this._model_index[id] || null;
	}
	
	Port(name) {
		return this._port_index[name] || null;
	}
}

export class ModelTypeCA extends ModelType {
	
	get dim() {  return this._json.dim; }
	set dim(value) { this._json.dim = value; }
	
	constructor(id, name, type, message_type, ports, models, links, metadata, dim) {
		super(id, name, type, message_type, ports, models, links, metadata);
		
		this.dim = dim ?? null;
	}
}

export class PortType extends NodeType { 
	
	constructor(name, type, message_type) {
		super(name, type, message_type);
	}
}