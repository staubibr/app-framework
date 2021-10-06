'use strict';

import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Templated from '../../components/templated.js';
import eExperiment from '../entities/e_experiment.js';
import FilesTable from './files-table.js';

export default Core.Templatable("Widget.Forms.Experiment", class Experiment extends Templated { 

	set authors(value) {
		this.Widget("u_author").Reload(value, d => [d.full_name, null, d]);
	}
	
	set model_types(value) {
		this.Widget("u_top_model_type").Reload(value, d => [d.name, null, d]);
	}

	get entity() {		
		var date = new Date(this.Elem("u_date_created").value);
		
		return new eExperiment({
			id: this.id,
			project_name: this.Elem("u_project_name").value,
			name: this.Elem("u_name").value,
			description: this.Elem("u_description").value,
			date_created: date.getTime(),
			author_id: this.Widget("u_author").selected.id,
			top_model_type_id: this.Widget("u_top_model_type").selected.id,
			exp_files: this.Widget("u_files").value.exp_files,
			doc_files: this.Widget("u_files").value.doc_files,
			raw_res_files: this.Widget("u_files").value.raw_res_files,
			conv_res_files: this.Widget("u_files").value.conv_res_files,
			viz_files: this.Widget("u_files").value.viz_files
		});
	}
	
	get id() {
		return parseInt(this.Elem("u_id").innerHTML) || null;
	}
	
	constructor(node) {
		super(node);
		
		this.Widget("u_author").placeholder = this.nls.Ressource("ph_author");
		this.Widget("u_top_model_type").placeholder = this.nls.Ressource("ph_top_model_type");
		
		this.files = this.Widget("u_files");
	}
	
	Clear() {
		this.Elem("u_id").innerHTML = null;
		this.Elem("u_project_name").value = null;
		this.Elem("u_name").value = null;
		this.Elem("u_description").value = null;
		this.Elem("u_date_created").value = null;
		this.Widget("u_author").placeholder = null;
		this.Widget("u_top_model_type").placeholder = null;
		this.Widget("u_files").value = null;
	}
	
	Show(data) {
		this.Elem("u_id").innerHTML = data.id;
		this.Elem("u_project_name").value = data.project_name;
		this.Elem("u_name").value = data.name;
		this.Elem("u_description").value = data.description;
		this.Elem("u_date_created").value = data.date_created.toISOString().split("T")[0];
		this.Widget("u_author").Select(a => a.id == data.author_id);
		this.Widget("u_top_model_type").Select(mt => mt.id == data.top_model_type_id);
		
		this.Widget("u_files").value = {
			"exp_files": data.exp_files, 
			"doc_files": data.doc_files, 
			"raw_res_files": data.raw_res_files, 
			"conv_res_files": data.conv_res_files, 
			"viz_files": data.viz_files
		};
	}
	
	Template() {
		return `<div class='form form-contributor'>
					<div class=''>
						<label handle='id'>nls(label_id)</label>
						<label handle='u_id'></label>
					</div>
					<div class=''>
						<label handle='project_name'>nls(label_project_name)</label>
						<input handle='u_project_name' />
					</div>
					<div class=''>
						<label handle='name'>nls(label_name)</label>
						<input handle='u_name' />
					</div>
					<div class=''>
						<label handle='description'>nls(label_description)</label>
						<textarea handle='u_description'></textarea>
					</div>
					<div class=''>
						<label handle='date_created'>nls(label_date_created)</label>
						<input handle='u_date_created' type="date" />
					</div>
					<div class=''>
						<label handle='author'>nls(label_author)</label>
						<div handle='u_author' widget='Basic.UI.Select'></div>
					</div>
					<div class=''>
						<label handle='top_model_type'>nls(label_top_model_type)</label>
						<div handle='u_top_model_type' widget='Basic.UI.Select'></div>
					</div>
					<hr>
					<label>nls(label_files)</label>
					<div handle='u_files' widget='Basic.LoM.Forms.FilesTable'></div>
		       </div>`;
	}
	
	static Nls() {
		return {
			"label_id": { "en": "id" },
			"label_project_name": { "en": "project name" },
			"label_name": { "en": "name" },
			"label_description": { "en": "description" },
			"label_date_created": { "en": "date created" },
			"label_author": { "en": "author" },
			"label_top_model_type": { "en": "top model type" },
			"ph_author": { "en": "Select an author..." },
			"ph_top_model_type": { "en": "Select a top model type..." },
			"label_files": { "en": "Experiment files" }
		}
	}
});