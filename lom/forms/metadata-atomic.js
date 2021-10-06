'use strict';

import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Templated from '../../components/templated.js';
import eModelType from '../entities/e_model_type.js';
import TagsInput from '../../ui/tags-input.js';
import Tooltip from '../../ui/tooltip.js';

import Select from '../../ui/select.js';

export default Core.Templatable("Basic.LoM.Forms.MetadataAtomic", class MetadataAtomic extends Templated { 

	get value() { return this._value;}

	set value(value) {
		this.Clear();
		
		if (!value) return this.NoData();
		
		value.model_type.ports.forEach(p => {
			var msg = value.message_types[p.message_type];
			
			this.AddPort(p, msg);
		});
	}

	constructor(node) {
		super(node);
		
		this.tooltip = new Tooltip();
		
		this.tooltip.nodes.content = Dom.Create("div", { }, this.tooltip.Elem("content"));
	}

	AddPort(p, msg) {
		var container = p.type == "input" ? "i_ports" : "o_ports";
		
		var name = Dom.Create("label", { className:"port-name", innerHTML:p.name }, this.Elem(container));
		
		name.addEventListener("mousemove", ev => this.ShowTooltip(ev, p, msg));
		name.addEventListener("mouseout", ev => this.tooltip.Hide());
	}
	
	NoData() {
		this.Elem("i_ports").innerHTML = "<i>No data available.</i>"
		this.Elem("o_ports").innerHTML = "<i>No data available.</i>"
	}
	
	ShowTooltip(ev, p, msg) {
		this.tooltip.nodes.content.innerHTML = `Port <b>${p.name}</b> outputs messages of type <b>${msg.name}</b> with fields <b>${msg.template.join(", ")}</b>.<br><br>${msg.description}`;
		this.tooltip.Show(ev.x + 20, ev.y - 30);
	}
	
	Clear() {
		Dom.Empty(this.Elem("i_ports"));
		Dom.Empty(this.Elem("o_ports"));
	}

	Template() {
		return `<div handle='content' class='metadata metadata-atomic'>
					<label>nls(label_i_ports)</label>
					<div handle='i_ports' class='form'></div>
					<label>nls(label_o_ports)</label>
					<div handle='o_ports' class='form'></div>
			    </div>`;
	}
	
	static Nls() {
		return {
			"label_i_ports" : { "en": "Input ports" },
			"label_o_ports" : { "en": "Output ports" }
		}
	}
});