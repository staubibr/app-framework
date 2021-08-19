'use strict';

export class MessageType { 

	get id() { return this._json.id; }
	set id(value) { this._json.id = value; }
	
	get name() {  return this._json.name; }
	set name(value) { this._json.name = value; }
	
	get template() {  return this._json.template; }
	set template(value) { this._json.template = value; }
	
	get description() {  return this._json.description; }
	set description(value) { this._json.description = value; }
	
	constructor(id, name, template, description) {		
		this._json = {}
		
		this.id = id ?? null;
		this.name = name ?? null;
		this.template = template ?? null;
		this.description = description ?? null;
	}
}