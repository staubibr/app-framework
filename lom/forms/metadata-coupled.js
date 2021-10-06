'use strict';

import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Templated from '../../components/templated.js';
import eModelType from '../entities/e_model_type.js';
import TagsInput from '../../ui/tags-input.js';

import Select from '../../ui/select.js';

export default Core.Templatable("Basic.LoM.Forms.MetadataCoupled", class AtomicMetadata extends Templated { 

	get value() { return this._value;}

	set value(value) {	
		this.Clear();
		
		if (!value) return this.NoData();
		
		this.NotImplemented();
	}

	Template() {
		return `<div handle='content' class='metadata metadata-coupled'>
					<label>nls(label_components)</label>
					<div handle='components' class='form'><i>Not implemented</i></div>
					<label>nls(label_couplings)</label>
					<div handle='couplings' class='form'><i>Not implemented</i></div>
					<label>nls(label_i_ports)</label>
					<div handle='i_ports' class='form'><i>Not implemented</i></div>
					<label>nls(label_o_ports)</label>
					<div handle='o_ports' class='form'><i>Not implemented</i></div>
			    </div>`;
	}
	
	NoData() {
		this.Elem("components").innerHTML = "<i>No data available.</i>"
		this.Elem("couplings").innerHTML = "<i>No data available.</i>"
		this.Elem("i_ports").innerHTML = "<i>No data available.</i>"
		this.Elem("o_ports").innerHTML = "<i>No data available.</i>"
	}
	
	NotImplemented() {
		this.Elem("components").innerHTML = "<i>Not implemented.</i>"
		this.Elem("couplings").innerHTML = "<i>Not implemented.</i>"
		this.Elem("i_ports").innerHTML = "<i>Not implemented.</i>"
		this.Elem("o_ports").innerHTML = "<i>Not implemented.</i>"
	}
	
	Clear() {
		Dom.Empty(this.Elem("components"));
		Dom.Empty(this.Elem("couplings"));
		Dom.Empty(this.Elem("i_ports"));
		Dom.Empty(this.Elem("o_ports"));
	}
	
	static Nls() {
		return {
			"label_i_ports" : { "en": "Input ports" },
			"label_o_ports" : { "en": "Output ports" },
			"label_components" : { "en": "Components" },
			"label_couplings" : { "en": "Couplings" }
		}
	}
});