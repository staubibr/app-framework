'use strict';

import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Templated from '../../components/templated.js';
import eModelType from '../entities/e_model_type.js';
import TagsInput from '../../ui/tags-input.js';

import Select from '../../ui/select.js';

export default Core.Templatable("Basic.LoM.Forms.FilesTable", class FilesTable extends Templated { 

	get value() { return this._value;}

	set value(value) {
		Dom.Empty(this.Elem("files"));
		
		this._value = value;
		
		if (!value) return;
		
		for (var id in value) {			
			value[id].forEach(f => {
				var date = new Date(f.last_modification);
				
				var tr = Dom.Create("tr", {}, this.Elem("files"));
				var td = Dom.Create("td", { }, tr);
				var btn = Dom.Create("button", { className:"icon download" }, td);
				
				btn.title = this.nls.Ressource("btn_one_download", [f.name]);
				
				Dom.Create("i", { className:"fas fa-file-download" }, btn);
				Dom.Create("td", { innerHTML:f.name }, tr);
				Dom.Create("td", { innerHTML:date.toISOString().split("T")[0] }, tr);
				Dom.Create("td", { innerHTML:f.file_type.description }, tr);
				
				btn.addEventListener("click", this.OnBtnOne_Click.bind(this, f));
			});
		}
		
	}

	constructor(node) {
		super(node);
		
		this.Elem("btn_all").addEventListener('click', this.OnBtnAll_Click.bind(this));
	}
	
	OnBtnOne_Click(file, ev) {		
		this.Emit("download:one", { file:file.id, name:file.label, hierarchy:false });
	}
	
	OnBtnAll_Click(ev) {
		var files = [];

		for (var id in this.value) files = files.concat(this.value[id]);
		
		this.Emit("download:all", { files:files.map(v => v.id), hierarchy:true });
	}
	
	Template() {
		return `<table class='files-container'>
					<thead>
						<tr>
							<th>
								<button handle='btn_all' title='nls(btn_all_download)' class='icon download'>
									<i class='fas fa-file-download'></i>
								</button>
							</th>
							<th>nls(table_col_name)</th>
							<th>nls(table_col_date)</th>
							<th>nls(table_col_description)</th>
						</tr>
					</thead>
					<tbody handle='files'><tbody>
				</table>`;
	}
	
	static Nls() {
		return {
			"table_col_name" : { "en": "File name" },
			"table_col_date" : { "en": "Modified" },
			"table_col_description" : { "en": "Description" },
			"btn_all_download" : { "en": "Click to download all files linked to this model type" },
			"btn_one_download" : { "en": "Click to download {0}" }
		}
	}
});