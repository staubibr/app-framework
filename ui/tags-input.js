'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Templated from '../components/templated.js';
import eTag from '../lom/entities/e_tag.js';

export default Core.Templatable("Basic.LoM.Forms.TagsInput", class TagsInput extends Templated {
	
	get value() { 
		return this._value; 
	
		// return this.Elem("root").value.split(";").map(t => t.trim());
	}
	
	set value(value) {
		this._value = value;
	
		if (!value) this.Elem("root").value = null;
	
		else this.Elem("root").value = value.map(t => t.value).join("; ");
	}
	
	constructor(container, options) {
		super(container, options);
		
		/*
		this.Elem("root").addEventListener("change", ev => {
			var tValues = ev.target.value.split(";").map(t => t.trim());
			
			var tags = tValues.map(t => {
				var exists = this.value.find(v => v.value == t);
				
				return exists ? exists : new eTag({ id:null, value:t });
			});
		});
		*/
	}
	
	Template() {
		return '<input class="tags-input" handle="root" />';
	}
});