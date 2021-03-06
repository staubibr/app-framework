'use strict';

import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Templated from '../../components/templated.js';

export default Core.Templatable("Widgets.Diagram", class Diagram extends Templated { 

	get canvas() { return this.Elem("canvas"); }

	get svg() { return this.simulation.diagram; }

	constructor(node) {
		super(node);
	}

	SetDiagram(simulation) {
		this.simulation = simulation;
		
		this._svg = { dests: {}, origins: {} };
		
		this.LoadOriginSVGNodes();
		this.LoadDestinationSVGs();
		
		Dom.Empty(this.Elem('diagram'));
		
		this.Elem('diagram').appendChild(this.svg);
		
		var style = "marker.highlighted path {fill: #1e94c3 !important;stroke: #1e94c3 !important;}marker.highlighted.origin path {fill: #b36402 !important;stroke: #b36402 !important;}text.highlighted {fill: #1e94c3 !important;}text.highlighted.origin {fill: #b36402 !important;}path.highlighted {stroke: #1e94c3 !important;}path.highlighted.origin {stroke: #b36402 !important;}.highlighted:not(text):not(path) {stroke: #1e94c3 !important;fill: #d6f2fd !important;}.highlighted.origin:not(text):not(path) {stroke: #b36402 !important;fill: #f9e5c1 !important;}";
		
		Dom.Create("style", { innerHTML:style }, this.Node("diagram").Elem("svg"));
				
		this.svg.setAttribute("preserveAspectRatio", "none");
		
		this.SetPointerEvents();
	}
	
	SetPointerEvents() {		
		this.svg.querySelectorAll("*").forEach(n => {			
			n.style.cursor = "none";
			n.style.pointerEvents = "none";
		});
		
		this.svg.querySelectorAll("[devs-model-id]").forEach(n => {
			n.style.cursor = "pointer";
			n.style.pointerEvents = "all"
			
			n.addEventListener("mousemove", this.onSvgMouseMove_Handler.bind(this, n));
			n.addEventListener("click", this.onSvgClick_Handler.bind(this, n));
			n.addEventListener("mouseout", this.onSvgMouseOut_Handler.bind(this, n));
		});
	}
	
	GetLinkSVGNodes(l) {
		var selector = `[devs-link-mA=${l.model_a.id}][devs-link-pA=${l.port_a.name}]`;
		
		return Array.from(this.svg.querySelectorAll(selector));
	}
	
	GetPortSVGNodes(m, p) {
		var selector = `[devs-model-id=${m.id}],[devs-port-model=${m.id}][devs-port-name=${p.name}]`;
		
		return Array.from(this.svg.querySelectorAll(selector));
	}
	
	LoadOriginSVGNodes() {
		this.simulation.models.forEach(m => {
			m.ports.forEach(p => {
				if (!this._svg.origins[m.id]) this._svg.origins[m.id] = {};

				var nodes = this.GetPortSVGNodes(m, p);
				
				m.get_port_links(p).forEach(l => nodes = nodes.concat(this.GetLinkSVGNodes(l)));
				
				this._svg.origins[m.id][p.name] = nodes;
			});
		});
	}
	
	LoadDestinationSVGs() {
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
					svg = svg.concat(this.GetLinkSVGNodes(l));
					svg = svg.concat(this.GetPortSVGNodes(l.model_b, l.port_b));
				});
				
				this._svg.dests[m.id][p.name] = Array.from(svg);
			});
		});
	}
	
	GetDestination(model, port) {
		return this._svg.dests[model.id][port.name];
	}
	
	GetOrigin(model, port) {
		return this._svg.origins[model.id][port.name];
	}
	
	onSvgMouseMove_Handler(node, ev) {
		var id = node.getAttribute("devs-model-id");
		var model = this.simulation.get_model(id);
		
		if (!model) return;
		
		this.Emit("MouseMove", { x:ev.pageX, y:ev.pageY, model:model, svg:ev.target });
	}
	
	onSvgMouseOut_Handler(node, ev) {
		var id = node.getAttribute("devs-model-id");
		
		this.Emit("MouseOut", { x:ev.pageX, y:ev.pageY, model:this.simulation.get_model(id), svg:ev.target });
	}
	
	onSvgClick_Handler(node, ev) {	
		var id = node.getAttribute("devs-model-id");
		
		this.Emit("Click", { x:ev.pageX, y:ev.pageY, model:this.simulation.get_model(id), svg:ev.target });
	}

	Resize() {		
		this.size = Dom.Geometry(this.Elem("diagram"));
		
		var pH = 30;
		var pV = 30;

		this.Elem("canvas").setAttribute('width', this.size.w);	
		this.Elem("canvas").setAttribute('height', this.size.h);
	}
		
	DrawToCanvas(node) {
		var serializer = new XMLSerializer();
		var source = serializer.serializeToString(node);
		var cv = this.Elem("canvas");
		
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
	
	Draw(messages) {		
		this.Reset();
		
		messages.forEach((m) => this.DrawYMessage(m));
		
		this.DrawToCanvas(this.svg);
	}
	
	DrawYMessage(message) {
		var p = message.port;
		var m = message.model;

		this.AddCss(this.GetOrigin(m, p), ["highlighted", "origin"]);
		
		this.AddCss(this.GetDestination(m, p), ["highlighted"]);		
	}

	AddCss(nodes, css) {		
		nodes.forEach(node => {
			css.forEach(c => node.classList.add(c));
		});
	}
	
	RemoveCss(nodes, css) {
		nodes.forEach(node => {
			css.forEach(c => node.classList.remove(c));
		});
	}
	
	Reset() {		
		for (var m in this._svg.dests) {
			for (var p in this._svg.dests[m]) {
				this.RemoveCss(this._svg.dests[m][p], ["highlighted", "origin"]);
			}
		}
		
		for (var m in this._svg.origins) {
			for (var p in this._svg.origins[m]) {
				this.RemoveCss(this._svg.origins[m][p], ["highlighted", "origin"]);
			}
		}
	}
		
	Template() {
		return "<div>" +
				   "<div handle='diagram' class='diagram-container'></div>" +
				   "<canvas handle='canvas' class='diagram-canvas hidden'></canvas>" +
			   "</div>";
	}
});