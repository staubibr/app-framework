'use strict';

import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Tooltip from '../../ui/tooltip.js';
import Automator from '../../components/automator.js';
import Diagram from '../diagram/diagram.js';

export default Core.templatable("Api.Widget.Diagram.Auto", class AutoDiagram extends Automator { 

	constructor(node, simulation, options) {
		if (!options) throw new Error("No options provided for the Diagram widget");
		
		super(new Diagram(node), simulation);
		
		this.options = options;
		
		this.widget.set_diagram(this.simulation);
		
		this.widget.draw(this.simulation.current_frame.output_messages);
		
		this.selected = [];

		this.attach_handlers(options);
		
		this.update_selected();

		this.tooltip = new Tooltip();
		
		this.simulation.on("new-diagram", this.on_simulation_new_diagram.bind(this));
	}
	
	attach_handlers(options) {
		var h = [];

		if (options.hoverEnabled != false) h.push(this.widget.on("mousemove", this.on_mousemove.bind(this)));
		if (options.hoverEnabled != false) h.push(this.widget.on("mouseout", this.on_mouseout.bind(this)));
		if (options.clickEnabled != false) h.push(this.widget.on("click", this.on_click.bind(this)));
		
		h.push(this.simulation.on("move", this.on_simulation_change.bind(this)));
		h.push(this.simulation.on("jump", this.on_simulation_change.bind(this)));
		h.push(this.simulation.on("selected", this.on_simulation_change.bind(this)));
		
		options.on("change", this.on_settings_change.bind(this));
		
		this.handle(h);
	}
	
	update_selected() {
		this.selected = this.simulation.selected;
	}
	
	resize() {
		var size = this.options.diagram_size(this.simulation);
		
		this.widget.container.style.width = size.width + "px";
		this.widget.container.style.height = size.height + "px";	
	}
	
	redraw() {
		this.widget.resize();
	}
	
	on_simulation_new_diagram(ev) {
		this.widget.set_diagram(this.simulation);
		
		this.widget.draw(this.simulation.current_frame.output_messages);
	}
	
	on_settings_change(ev) {
		if (["height", "width", "aspect"].indexOf(ev.property) == -1) return;

		this.resize();
		this.redraw();
	}
		
	on_simulation_change(ev) {		
		var messages = this.simulation.current_frame.output_messages;
		
		this.widget.draw(messages);
	}
	
	on_mousemove(ev) {
		var messages = this.simulation.current_frame.output_messages;
		
		Dom.empty(this.tooltip.elems.content);
		
		var tY = messages.filter(t => t.model.id == ev.model.id);
		
		if (tY.length == 0) return;
		
		tY.forEach(t => {
			var value = JSON.stringify(t.value);
			var subs = [t.model.id, value, t.port.name];
			var html = this.nls("Diagram_Tooltip_Y", subs);
			
			Dom.create("div", { className:"tooltip-label", innerHTML:html }, this.tooltip.elems.content);
		});
		
		this.tooltip.show(ev.x + 20, ev.y);
	}
	
	on_click(ev) {
		var idx = this.selected.indexOf(ev.model);

		// TODO : Selection should be handled by diagram, not auto class
		if (idx == -1) {
			this.selected.push(ev.model);
			
			ev.svg.classList.add("selected");
		}
		else {
			this.selected.splice(idx, 1);
			
			ev.svg.classList.remove("selected");
		}
	}

	on_mouseout(ev) {
		this.tooltip.hide();
	}
	
	localize(nls) {
		super.localize(nls);
		
		nls.add("Diagram_Tooltip_Y", "en", "<b>{0}</b> emitted <b>{1}</b> through port <b>{2}</b>");
	}
});