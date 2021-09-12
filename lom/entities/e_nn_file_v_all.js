'use strict';

import Entity from "./entity.js";
import File from "./e_file.js";

export default class NNFileVAll extends Entity { 
	
    get file_id() { return this._json.file_id; };
    get file() { return this._json.file; };
    get document_id() { return this._json.document_id; };
    get source_id() { return this._json.source_id; };
    get experiment_id() { return this._json.experiment_id; };
    get raw_result_id() { return this._json.raw_result_id; };
    get converted_result_id() { return this._json.converted_result_id; };
    get visualization_id() { return this._json.visualization_id; };
	
    set file_id(value) { this._json.file_id = value; };
    set file(value) { this._json.file = value; };
    set document_id(value) { this._json.document_id = value; };
    set source_id(value) { this._json.source_id = value; };
    set experiment_id(value) { this._json.experiment_id = value; };
    set raw_result_id(value) { this._json.raw_result_id = value; };
    set converted_result_id(value) { this._json.converted_result_id = value; };
    set visualization_id(value) { this._json.visualization_id = value; };
	
	get label() { return null; }
	
	constructor(json, complex) {
		super(json);
		
		if (complex) {
			json.file = new File(json.file, false);
		}
	}
}