'use strict';

import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Templated from '../../components/templated.js';
import eContributor from '../entities/e_contributor.js';

export default Core.Templatable("Widget.Forms.Contributor", class Contributor extends Templated { 

	get entity() {		
		var date = new Date(this.Elem("u_creation_date").value);
		
		return new eContributor({
			id: this.id,
			first_name: this.Elem("u_first_name").value,
			middle_name: this.Elem("u_middle_name").value,
			last_name: this.Elem("u_last_name").value,
			email: this.Elem("u_email").value,
			affiliation: this.Elem("u_affiliation").value,
			creation_date: date.getTime()
		});
	}

	get id() {
		return parseInt(this.Elem("u_id").innerHTML) || null;
	}
	
	constructor(node) {
		super(node);
	}
	
	Clear() {
		this.Elem("u_id").innerHTML = null;
		this.Elem("u_first_name").value = null;
		this.Elem("u_middle_name").value = null;
		this.Elem("u_last_name").value = null;
		this.Elem("u_email").value = null;
		this.Elem("u_affiliation").value = null;
		this.Elem("u_creation_date").value = null;
	}
	
	Show(data) {
		this.Elem("u_id").innerHTML = data.id;
		this.Elem("u_first_name").value = data.first_name;
		this.Elem("u_middle_name").value = data.middle_name;
		this.Elem("u_last_name").value = data.last_name;
		this.Elem("u_email").value = data.email;
		this.Elem("u_affiliation").value = data.affiliation;
		this.Elem("u_creation_date").value = data.creation_date.toISOString().split("T")[0];
	}
	
	Template() {
		return `<form class='form-contributor'>
					<div class=''>
						<label handle='id'>nls(label_id)</label>
						<label handle='u_id'></label>
					</div>
					<div class=''>
						<label handle='first_name'>nls(label_first_name)</label>
						<input handle='u_first_name' />
					</div>
					<div class=''>
						<label handle='middle_name'>nls(label_middle_name)</label>
						<input handle='u_middle_name' />
					</div>
					<div class=''>
						<label handle='last_name'>nls(label_last_name)</label>
						<input handle='u_last_name' />
					</div>
					<div class=''>
						<label handle='email'>nls(label_email)</label>
						<input handle='u_email' />
					</div>
					<div class=''>
						<label handle='affiliation'>nls(label_affiliation)</label>
						<input handle='u_affiliation' />
					</div>
					<div class=''>
						<label handle='creation_date'>nls(label_creation_date)</label>
						<input handle='u_creation_date' type="date" />
					</div>
		       </form>`;
	}
	
	static Nls() {
		return {
			"label_id": { "en": "id" },
			"label_first_name": { "en": "first name" },
			"label_middle_name": { "en": "middle name" },
			"label_last_name": { "en": "last name" },
			"label_email": { "en": "email" },
			"label_affiliation": { "en": "affiliation" },
			"label_creation_date": { "en": "creation_date" }
		}
	}
});