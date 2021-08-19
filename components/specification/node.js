'use strict';

export class ModelNode { 
	
	get id() { return this._json.id; }
	set id(value) { this._json.id = value; }
	
	get node_type() { return this._json.node_type; }
	set node_type(value) { this._json.node_type = value; }
	
	get name() { return this.node_type.name; }
	set name(value) { this.node_type.name = value; }
	
	get type() { return this.node_type.type; }
	set type(value) { this.node_type.type = value; }
	
	get template() { return this.node_type.template; }
	set template(value) { this.node_type.template = value; }
	
	get ports() { return this.node_type.ports; }
	
	get links() { return this._json._links; }
	set links(value) { 
		this._json._links = [];
		
		value.forEach(l => this.AddLink(l));
	}
	
	constructor(id, node_type, links) {		
		this._json = {};
		
		this.id = id ?? null;
		this.node_type = node_type ?? null;
		this.links = links ?? [];
	}
	
	Port(name) {
		return this.node_type.Port(name);
	}
	
	AddLink(link) {
		this.links.push(link);
		
		return link;
	}
	
	PortLinks(port) {
		return this.links.filter(l => l.portA.name == port.name);
	}
	
	Template(values) {
		return this.node_type.Template(values);
	}
	
	Template0() {
		this.node_type.Template0();
	}
}

export class ModelNodeCA extends ModelNode { 
	
	get dim() {  return this.node_type.dim; }
	
	constructor(id, node_type, links) {
		super(id, node_type, links);
	}
}