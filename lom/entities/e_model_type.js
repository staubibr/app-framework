'use strict';

import Entity from "./entity.js";
import Contributor from "./e_contributor.js";
import File from './e_file.js';
import Tag from './e_tag.js';

export default class ModelType extends Entity { 
	
    get id() { return this._json.id; };
    get name() { return this._json.name; };
    get type() { return this._json.type; };
    get formalism() { return this._json.formalism; };
    get simulator() { return this._json.simulator; };
    get description() { return this._json.description; };
    get date_created() { return this._json.date_created; };
    get author_id() { return this._json.author_id; };
    get author() { return this._json.author; };
    get src_files() { return this._json.src_files; };
    get meta() { return this._json.meta; };
    get tags() { return this._json.tags; };
	
    set id(value) { this._json.id = value; };
    set name(value) { this._json.name = value; };
    set type(value) { this._json.type = value; };
    set formalism(value) { this._json.formalism = value; };
    set simulator(value) { this._json.simulator = value; };
    set description(value) { this._json.description = value; };
    set date_created(value) { this._json.date_created = value; };
    set author_id(value) { this._json.author_id = value; };
    set author(value) { this._json.author = value; };
    set src_files(value) { this._json.src_files = value; };
    set meta(value) { this._json.meta = value; };
    set tags(value) { this._json.tags = value; };
	
	get label() { return `${this.name} (${this.type.toLowerCase()})`; }
	
	constructor(json, complex) {
		super(json);
		
		json.date_created = new Date(json.date_created);
		
		if (complex) {
			json.author = new Contributor(json.author, false);
			json.src_files = json.src_files.map(f => new File(f, true));
			json.meta = json.meta;
			json.tags = json.tags.map(t => new Tag(t, false))
		}
	}
}