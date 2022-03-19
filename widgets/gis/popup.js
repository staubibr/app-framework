'use strict';

import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Templated from '../../components/templated.js';

export default Core.Templatable("Widgets.GIS.Popup", class Popup extends Templated { 
	
	get size() { return this.features.length; } 
	
	constructor(node, options) {
		super(node);
		
		this.get_content = options.get_content;
		this.get_title = options.get_title;
		
		this.fill(options.features || [])
		
		this.Elem("prev").addEventListener("click", this.prev_page.bind(this));
		this.Elem("next").addEventListener("click", this.next_page.bind(this));
	}
	
	fill(features) {		
		this.features = features;
		this.i = 0;
		
		if (this.size > 0) this.set_page(this.i);
		
		Dom.ToggleCss(this.Elem('button-container'), 'hidden', this.size == 1);
	}
	
	set_page(i) {
		this.Elem('page').innerHTML = `${i + 1} of ${this.size}`;
		
		Dom.Empty(this.Elem('props'));
		
		var content = this.get_content(this.features[i]);
		
		if (content instanceof HTMLElement) Dom.Place(content, this.Elem('props'));
		
		else this.Elem('props').innerHTML = content;
		
		if (!this.get_title) return;
		
		this.Elem('title').innerHTML = this.get_title(this.features[i]);
	}
	
	next_page() {
		this.i = (this. i + 1) % this.size;
		this.set_page(this.i);
	}
	
	prev_page() {
		this.i = (this.i + this.size - 1) % this.size;
		this.set_page(this.i);
	}
	
	Template() {
		return "<div handle='root' class='popup-content'>" + 
				  "<div handle='title' class='title'></div>" +
				  "<div handle='props'></div>" +
				  "<div handle='button-container' class='button-container'>" + 
					 "<button handle='prev' class='button previous'><</button>" +
					 "<button handle='next' class='button next'>></button>" +
					 "<span handle='page'></span>" + 
				  "</div>" +
			   "</div>";
	}
});