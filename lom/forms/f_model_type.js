'use strict';

import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Templated from '../../components/templated.js';
import eModelType from '../entities/e_model_type.js';
import TagsInput from '../../ui/tags-input.js';
import MetadataAtomic from './metadata-atomic.js';
import MetadataCoupled from './metadata-coupled.js';
import FilesTable from './files-table.js';

import Select from '../../ui/select.js';

export default Core.Templatable("Widget.Forms.ModelType", class ModelType extends Templated { 

	set files(value) { this._files = value; }
	get files() { return this._files; }

	set authors(value) {
		this.Widget("u_author").Reload(value, d => [d.full_name, null, d]);
	}

	get entity() {
		var date = new Date(this.Elem("u_date_created").value);
		
		return new eModelType({
			id: this.id,
			name: this.Elem("u_name").value,
			type: this.Widget("u_type").selected,
			formalism: this.Widget("u_formalism").selected,
			simulator: this.Widget("u_simulator").selected,
			description: this.Elem("u_description").value,
			date_created: date.getTime(),
			author_id: this.Widget("u_author").selected.id,
			tags: this.Widget("u_tags").value,
			src_files: this.Widget("u_files").value.src_files
		});
	}

	get id() {
		return parseInt(this.Elem("u_id").innerHTML) || null;
	}

	constructor(node) {
		super(node);
		
		this.Widget("u_type").Add(this.nls.Ressource("type_atomic"), null, "Atomic");
		this.Widget("u_type").Add(this.nls.Ressource("type_coupled"), null, "Coupled");
		this.Widget("u_type").Add(this.nls.Ressource("type_top"), null, "Top");
		this.Widget("u_formalism").Add(this.nls.Ressource("formalism_DEVS"), null, "DEVS");
		this.Widget("u_formalism").Add(this.nls.Ressource("formalism_Cell_DEVS"), null, "Cell-DEVS");
		this.Widget("u_formalism").Add(this.nls.Ressource("formalism_GIS_DEVS"), null, "GIS-DEVS");
		this.Widget("u_simulator").Add(this.nls.Ressource("simulator_Cadmium"), null, "Cadmium");
		
		this.Widget("u_type").placeholder = this.nls.Ressource("ph_type");
		this.Widget("u_formalism").placeholder = this.nls.Ressource("ph_formalism");
		this.Widget("u_simulator").placeholder = this.nls.Ressource("ph_simulator");
		this.Widget("u_author").placeholder = this.nls.Ressource("ph_author");
		
		this.files = this.Widget("u_files");
	}
	
	Clear() {
		this.Elem("u_id").innerHTML = null;
		this.Elem("u_name").value = null;
		this.Widget("u_type").value = null;
		this.Widget("u_formalism").value = null;
		this.Widget("u_simulator").value = null;
		this.Elem("u_description").value = null;
		this.Elem("u_date_created").value = null;
		this.Widget("u_author").value = null;
		this.Widget("u_tags").value = null;
		this.Widget("u_files").value = null;
	}
	
	Show(data) {
		this.Elem("u_id").innerHTML = data.id;
		this.Elem("u_name").value = data.name;
		this.Widget("u_type").Select(i => i == data.type);
		this.Widget("u_formalism").Select(i => i == data.formalism);
		this.Widget("u_simulator").Select(i => i == data.simulator);
		this.Elem("u_description").value = data.description;
		this.Elem("u_date_created").value = data.date_created.toISOString().split("T")[0];
		this.Widget("u_author").Select(i => i.id == data.author_id);
		this.Widget("u_tags").value = data.tags;
		
		this.Widget("u_files").value = { "src_files": data.src_files }
		
		Dom.AddCss(this.Elem("u_atomic"), "hidden");
		Dom.AddCss(this.Elem("u_coupled"), "hidden");
		
		if (data.type == "Atomic") this.ShowMetadata("u_atomic", data);
		
		if (data.type == "Coupled" || data.type == "Top") this.ShowMetadata("u_coupled", data);
	}
	
	ShowMetadata(meta_id, data) {
		Dom.RemoveCss(this.Elem(meta_id), "hidden");
		this.Widget(meta_id).value = data.meta;
	}
		
	Template() {
		return `<div class='form form-contributor'>
					<div class=''>
						<label handle='id'>nls(label_id)</label>
						<label handle='u_id'></label>
					</div>
					<div class=''>
						<label handle='name'>nls(label_name)</label>
						<input handle='u_name' />
					</div>
					<div class=''>
						<label handle='type'>nls(label_type)</label>
						<div handle='u_type' class='select' widget='Basic.UI.Select'></div>
					</div>
					<div class=''>
						<label handle='formalism'>nls(label_formalism)</label>
						<div handle='u_formalism' class='select' widget='Basic.UI.Select'></div>
					</div>
					<div class=''>
						<label handle='simulator'>nls(label_simulator)</label>
						<div handle='u_simulator' class='select' widget='Basic.UI.Select'></div>
					</div>
					<div class=''>
						<label handle='description'>nls(label_description)</label>
						<textarea handle='u_description'></textarea>
					</div>
					<div class=''>
						<label handle='date_created'>nls(label_date_created)</label>
						<input handle='u_date_created' type='date' />
					</div>
					<div class=''>
						<label handle='author'>nls(label_author)</label>
						<div handle='u_author' class='select' widget='Basic.UI.Select'></div>
					</div>
					<div class=''>
						<label handle='tags'>nls(label_tags)</label>
						<div handle='u_tags' widget='Basic.LoM.Forms.TagsInput'></div>
					</div>
					<hr>
					<div handle='u_atomic' widget='Basic.LoM.Forms.MetadataAtomic' class='hidden'></div>
					<div handle='u_coupled' widget='Basic.LoM.Forms.MetadataCoupled' class='hidden'></div>
					<hr>
					<div handle='u_files' widget='Basic.LoM.Forms.FilesTable'></div>
		       </div>`;
	}
	
	static Nls() {
		return {
			"label_id": { "en": "ID" },
			"label_name": { "en": "Name" },
			"label_type": { "en": "Type" },
			"label_formalism": { "en": "Formalism" },
			"label_simulator": { "en": "Simulator" },
			"label_description": { "en": "Description" },
			"label_date_created": { "en": "Date created" },
			"label_author": { "en": "Author" },
			"label_tags": { "en": "Tags (split by ;)" },
			"type_atomic": { "en": "Atomic" },
			"type_coupled": { "en": "Coupled" },
			"type_top": { "en": "Top" },
			"formalism_DEVS": { "en": "DEVS" },
			"formalism_Cell_DEVS": { "en": "Cell-DEVS" },
			"formalism_GIS_DEVS": { "en": "GIS-DEVS" },
			"simulator_Cadmium": { "en": "Cadmium" },
			"ph_type": { "en": "Select a type of model..." },
			"ph_formalism": { "en": "Select a formalism..." },
			"ph_simulator": { "en": "Select a simulator..." },
			"ph_author": { "en": "Select an author..." },
			"table_col_name" : { "en": "File name" },
			"table_col_date" : { "en": "Modified" },
			"table_col_description" : { "en": "Description" }
		}
	}
});