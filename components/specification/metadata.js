'use strict';

export class Metadata {

	get author() {  return this._json.author; }
	set author(value) { this._json.author = value; }
	
	get created() { return this._json.created; }
	set created(value) { this._json.created = value; }
	
	get description() { return this._json.description; }
	set description(value) { this._json.description = value; }
	
	get tags() { return this._json.tags; }
	set tags(value) { this._json.tags = value; }
	
	constructor(author, created, description, tags) {		
		this._json = {}
		
		this.author = author ?? null;
		this.created = created ?? null;
		this.description = description ?? null;
		this.tags = tags ?? [];
	}
}