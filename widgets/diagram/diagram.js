'use strict';

import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Widget from '../../base/widget.js';

export default Core.templatable("Api.Widget.Diagram", class Diagram extends Widget { 

	get canvas() { return this.elems.canvas; }

	get svg() { return this.simulation.diagram; }

	constructor(container) {
		super(container);
	}

	set_diagram(simulation) {
		this.simulation = simulation;
		
		this._svg = { dests: {}, origins: {} };
		
		this.load_origin_svg_nodes();
		this.load_destination_svgs();
		
		Dom.empty(this.elems.diagram);
		
		this.elems.diagram.appendChild(this.svg);
		
		var style = "marker.highlighted path {fill: #1e94c3 !important;stroke: #1e94c3 !important;}marker.highlighted.origin path {fill: #b36402 !important;stroke: #b36402 !important;}text.highlighted {fill: #1e94c3 !important;}text.highlighted.origin {fill: #b36402 !important;}path.highlighted {stroke: #1e94c3 !important;}path.highlighted.origin {stroke: #b36402 !important;}.highlighted:not(text):not(path) {stroke: #1e94c3 !important;fill: #d6f2fd !important;}.highlighted.origin:not(text):not(path) {stroke: #b36402 !important;fill: #f9e5c1 !important;}";
		
		Dom.create("style", { innerHTML:style }, this.elems.diagram.querySelector("svg"));
				
		this.svg.setAttribute("preserveAspectRatio", "none");
		
		this.set_pointer_events();
	}
	
	set_pointer_events() {		
		this.svg.querySelectorAll("*").forEach(n => {			
			n.style.cursor = "none";
			n.style.pointerEvents = "none";
		});
		
		this.svg.querySelectorAll("[devs-model-id]").forEach(n => {
			n.style.cursor = "pointer";
			n.style.pointerEvents = "all"
			
			n.addEventListener("mousemove", this.on_svg_mousemove.bind(this, n));
			n.addEventListener("click", this.on_svg_click.bind(this, n));
			n.addEventListener("mouseout", this.on_svg_mouseout.bind(this, n));
		});
	}
	
	get_link_svg_nodes(l) {
		var selector = `[devs-link-mA=${l.model_a.id}][devs-link-pA=${l.port_a.name}]`;
		
		return Array.from(this.svg.querySelectorAll(selector));
	}
	
	get_port_svg_nodes(m, p) {
		var selector = `[devs-model-id=${m.id}],[devs-port-model=${m.id}][devs-port-name=${p.name}]`;
		
		return Array.from(this.svg.querySelectorAll(selector));
	}
	
	load_origin_svg_nodes() {
		this.simulation.models.forEach(m => {
			m.ports.forEach(p => {
				if (!this._svg.origins[m.id]) this._svg.origins[m.id] = {};

				var nodes = this.get_port_svg_nodes(m, p);
				
				m.get_port_links(p).forEach(l => nodes = nodes.concat(this.get_link_svg_nodes(l)));
				
				this._svg.origins[m.id][p.name] = nodes;
			});
		});
	}
	
	load_destination_svgs() {
		this.simulation.models.forEach(m => {
			m.ports.forEach(p => {
				if (!this._svg.dests[m.id]) this._svg.dests[m.id] = {};
				
				var links = m.get_port_links(p);
				
				for (var i = 0; i < m.get_port_links(p).length; i++) {
					var mB = links[i].model_b;
					var pB = links[i].port_b;
					
					if (mB.type == "atomic") continue;
					
					links = links.concat(mB.get_port_links(pB));
				}
				
				var svg = [];
				
				links.forEach(l => {
					svg = svg.concat(this.get_link_svg_nodes(l));
					svg = svg.concat(this.get_port_svg_nodes(l.model_b, l.port_b));
				});
				
				this._svg.dests[m.id][p.name] = Array.from(svg);
			});
		});
	}
	
	get_destination(model, port) {
		return this._svg.dests[model.id][port.name];
	}
	
	get_origin(model, port) {
		return this._svg.origins[model.id][port.name];
	}
	
	on_svg_mousemove(node, ev) {
		var id = node.getAttribute("devs-model-id");
		var model = this.simulation.get_model(id);
		
		if (!model) return;
		
		this.emit("mousemove", { x:ev.pageX, y:ev.pageY, model:model, svg:ev.target });
	}
	
	on_svg_mouseout(node, ev) {
		var id = node.getAttribute("devs-model-id");
		
		this.emit("mouseout", { x:ev.pageX, y:ev.pageY, model:this.simulation.get_model(id), svg:ev.target });
	}
	
	on_svg_click(node, ev) {	
		var id = node.getAttribute("devs-model-id");
		
		this.emit("click", { x:ev.pageX, y:ev.pageY, model:this.simulation.get_model(id), svg:ev.target });
	}

	resize() {		
		this.size = Dom.geometry(this.elems.diagram);
		
		var pH = 30;
		var pV = 30;

		this.elems.canvas.setAttribute('width', this.size.w);	
		this.elems.canvas.setAttribute('height', this.size.h);
	}
		
	draw_to_canvas(node) {
		var serializer = new XMLSerializer();
		var source = serializer.serializeToString(node);
		var cv = this.elems.canvas;
		
		// create a file blob of our SVG.
		var blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
		var url = window.URL.createObjectURL(blob);
		
		var ctx = cv.getContext('2d');
		var img = new Image();

		img.onload = function() {
			ctx.fillStyle = "#f9f9f9";
			ctx.fillRect(0, 0, cv.getAttribute("width"), cv.getAttribute("height"));
			ctx.drawImage(img, 0, 0, cv.getAttribute("width"), cv.getAttribute("height"));
			
			window.URL.revokeObjectURL(url);
		}
		
		img.src = url;
	}
	
	draw(messages) {		
		this.reset();
		
		messages.forEach((m) => this.draw_y_message(m));
		
		this.draw_to_canvas(this.svg);
	}
	
	draw_y_message(message) {
		var p = message.port;
		var m = message.model;

		this.add_css(this.get_origin(m, p), ["highlighted", "origin"]);
		
		this.add_css(this.get_destination(m, p), ["highlighted"]);		
	}

	add_css(nodes, css) {		
		nodes.forEach(node => {
			css.forEach(c => node.classList.add(c));
		});
	}
	
	remove_css(nodes, css) {
		nodes.forEach(node => {
			css.forEach(c => node.classList.remove(c));
		});
	}
	
	reset() {		
		for (var m in this._svg.dests) {
			for (var p in this._svg.dests[m]) {
				this.remove_css(this._svg.dests[m][p], ["highlighted", "origin"]);
			}
		}
		
		for (var m in this._svg.origins) {
			for (var p in this._svg.origins[m]) {
				this.remove_css(this._svg.origins[m][p], ["highlighted", "origin"]);
			}
		}
	}
		
	html() {
		return "<div>" +
				   "<div handle='diagram' class='diagram-widget'></div>" +
				   "<canvas handle='canvas' class='diagram-canvas hidden'></canvas>" +
			   "</div>";
	}
});