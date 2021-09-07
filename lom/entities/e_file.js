'use strict';

import Entity from "./entity.js";
import FileType from "./e_file_type.js";
import Contributor from "./e_contributor.js";

export default class File extends Entity { 
	
    get name() { return this._json.name; };
    get file_type_id() { return this._json.file_type_id; };
    get file_type() { return this._json.file_type; };
    get last_modification() { return this._json.last_modification; };
    get last_author_id() { return this._json.last_author_id; };
    get last_author() { return this._json.last_author; };
    get path() { return this._json.path; };
	
    set name(value) { this._json.name = value; };
    set file_type_id(value) { this._json.file_type_id = value; };
    set file_type(value) { this._json.file_type = value; };
    set last_modification(value) { this._json.last_modification = value; };
    set last_author_id(value) { this._json.last_author_id = value; };
    set last_author(value) { this._json.last_author = value; };
    set path(value) { this._json.path = value; };
	
	get label() { return this.name; }
	
	constructor(json, complex) {
		super(json);
		
		json.last_modification = new Date(json.last_modification);
		
		if (complex) {
			json.last_author = new Contributor(json.last_author, false);
			json.file_type = new FileType(json.file_type, false);
		}
	}
}