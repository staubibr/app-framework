'use strict';

import Entity from "./entity.js";
import Contributor from "./e_contributor.js";
import ModelType from "./e_model_type.js";
import File from "./e_file.js";

export default class Experiment extends Entity { 
	
    get project_name() { return this._json.project_name; };
    get name() { return this._json.name; };
    get description() { return this._json.description; };
    get date_created() { return this._json.date_created; };
    get author_id() { return this._json.author_id; };
    get author() { return this._json.author; };
    get top_model_type_id() { return this._json.top_model_type_id; };
    get top_model_type() { return this._json.top_model_type; };
    get exp_files() { return this._json.exp_files; };
    get doc_files() { return this._json.doc_files; };
    get raw_res_files() { return this._json.raw_res_files; };
    get conv_res_files() { return this._json.conv_res_files; };
    get viz_files() { return this._json.viz_files; };
	
    set project_name(value) { this._json.project_name = value; };
    set name(value) { this._json.name = value; };
    set description(value) { this._json.description = value; };
    set date_created(value) { this._json.date_created = value; };
    set author_id(value) { this._json.author_id = value; };
    set author(value) { this._json.author = value; };
    set top_model_type(value) { this._json.top_model_type = value; };
    set exp_files(value) { this._json.exp_files = value; };
    set doc_files(value) { this._json.doc_files = value; };
    set raw_res_files(value) { this._json.raw_res_files = value; };
    set conv_res_files(value) { this._json.conv_res_files = value; };
    set viz_files(value) { this._json.viz_files = value; };
	
	
	
	get label() { return this.name; }
	
	// need to add the files
	
	constructor(json, complex) {
		super(json);
		
		json.date_created = new Date(json.date_created);
		
		if (complex) {
			json.author = new Contributor(json.author, false);
			json.top_model_type = new ModelType(json.top_model_type, false);
			json.exp_files = json.exp_files.map(f => new File(f, true));
			json.doc_files = json.doc_files.map(f => new File(f, true));
			json.raw_res_files = json.raw_res_files.map(f => new File(f, true));
			json.conv_res_files = json.conv_res_files.map(f => new File(f, true));
			json.viz_files = json.viz_files.map(f => new File(f, true));
		}
	}
}