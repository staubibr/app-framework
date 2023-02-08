'use strict';

import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Style from '../../tools/style.js'
import Widget from '../../base/widget.js';
import VariableSelect from './variable-select.js';
import Content from './popup-content.js';

import Map from '../../components/ol/map.js'
import Legend from "../../components/ol/legend.js";

export default Core.templatable("Api.Widget.GIS", class GIS extends Widget { 

	get canvas() { 
		return this.elems.map.querySelector(".ol-layer").firstChild; 
	}
	
	get current() {
		return this.elems.variable_select.selected;
	}
	
	constructor(node) {
		super(node);
	}
	
	load(config, data, simulation) {
		// TODO: This shouldn't be here but, just trying to get it done for now. I'll come back later.
		this.simulation = simulation;
		this.config = config;
		this.data = data;

		var d = Core.defer();
	
		var basemap1 = Map.basemap_osm(this.config.basemap == "openstreetmap");
		var basemap2 = Map.basemap_satellite(this.config.basemap == "satellite");
	
		this.map = new Map(this.elems.map, [basemap1, basemap2]);
		
		if (config.view) this.map.set_view(config.view.center, config.view.zoom);

		else this.map.set_view([-75.7, 45.3], 10);
		
		// Add layers to the map according to the loaded geojson data
		data.forEach((data, i) => {
			var style = config.styles.find(s => s.id == config.layers[i].style);
		
			this.load_layer(data, config.layers[i], style);
		});

		this.map.on("click", this.on_map_click.bind(this));
		this.map.on("render-complete", this.on_map_render_complete.bind(this, d));
		
		this.popup_content = new Content(this.map.popup.content, { 
			get_title: null,
			get_content: this.get_content.bind(this)
		});
		
		return d.promise;
	}
		
	load_layer(data, layerConfig, styleConfig) {
		data.name = layerConfig.id;
		
		var layer = this.map.add_geojson_layer(layerConfig.id, data);
		
		layer.set('visible', false);
		
		var style = Style.from_json(layerConfig.type, styleConfig);
		
		layer.setStyle(style.symbol());
	}
	
	on_map_render_complete(d, ev) {		
		// Show geo layers and draw simulation state
		for (var id in this.map.layers) {
			this.map.layers[id].set('visible', true);
		}
		
		// Prepare simulation styles, set first one as currently selected, 
		// update the variable selector to reflect the current property being coloured
		this.prepare_simulation_visualization();
		
		// Add variable-select widget
		this.elems.variable_select.add_selectors(this.config.layers, this.config.variables);
		this.elems.variable_select.on("change", this.on_variable_select_change.bind(this));
		
		this.map.add_control(this.elems.variable_select.control);
		
		this.draw(this.simulation.state.data);
		
		this.add_legend();
		this.add_layer_switcher();
		
		d.Resolve(this.map);
	}
	
	draw(data) {
		if (!this.map) return;
		
		for (var id in this.current) {
			var features = this.map.layer_features(id);
			var variable = this.current[id];
			
			features.forEach(f => {
				var id = f.getProperties()[variable.layer.join];
				var d = data[id];
				
				if (d != null) f.setStyle(variable.style.symbol(data[id]));
			});
		}
		
	}
	
	add_legend(){	
		if (this.legend) this.map.remove_control(this.legend.control);

		this.legend = new Legend(this.current);
		
		for (var id in this.current) this.legend.add_legend(this.current[id]);
		
		this.map.add_control(this.legend.control);
	}

	add_layer_switcher() {
		var ls = new ol.control.LayerSwitcher({ groupSelectStyle: "group" });
		
		this.map.add_control(ls);
	}
	
	prepare_simulation_visualization() {
		var stats = Style.statistics(this.simulation);
		
		this.config.variables.forEach(s => {
			s.layer = this.config.layers.find(l => l.id == s.layer);
			s.style = Style.from_json(s.layer.type, s);

			s.style.bucketize(stats);
		});
	}

	on_variable_select_change(ev){		
		this.draw(this.simulation.state.data);

		this.add_legend();
	}
	
	on_map_click(ev) {
		this.reset_selected();
		
		this.map.show_popup(null);
		
		this.selected = this.get_selected(ev.features);
		
		if (!this.selected) return;
		
		this.highlight_selected();
		
		if (this.selected.length == 0) return;
		
		this.popup_content.fill(this.selected);
				
		this.map.popup.setPosition(ev.coordinates);
	}
	
	get_selected(features) {
		var selected = features.filter(f => {
			return !!this.current[f.layer];			
		});
		
		return selected.length > 0 ? selected : null;
	}
	
	get_content(s) {
		var variable = this.current[s.layer];
		
		if (!variable) return;
		
		// state messages
		var props = s.feature.getProperties();
		var id = props[variable.layer.join];
		var model = this.simulation.get_model(id);
		var data = this.simulation.state.get_value(model);
		
		var line = `<div class='title'>${variable.layer.label}</div>`;
		
		line += `<ul class='properties'><li>Attributes</li>`;
		
		variable.layer.fields.forEach(f => line += `<li>${f}: ${props[f]}</li>`);
		
		line += `</ul>`;
		line += `<ul class='state-message'><li>State</li>`;
		
		for (var p in data) line += `<li>${p}: ${data[p]}</li>`
		
		line += `</ul>`;
		
		// output messages
		var tY = this.simulation.current_frame.output_messages.filter(t => t.model.id == id);
		
		tY.forEach(t => {
			line += `<ul class='output-message'><li>Output</li>`;
			
			for (var p in t.value) line += `<li>${p}: ${t.value[p]}</li>`
			
			line += `</ul>`;
		});
		
		return line;
	}
	
	reset_selected() {
		if (!this.selected) return;
		
		this.selected.forEach(s => {
			var variable = this.current[s.layer];
			
			if (!variable) return;
			
			var id = s.feature.getProperties()[variable.layer.join];
			var model = this.simulation.get_model(id);
			var data = this.simulation.state.get_value(model);
			var style = variable.style.symbol(data);
			
			s.feature.setStyle(style);
		});
	}
	
	highlight_selected() {		
		if (!this.selected) return;
		
		this.selected.forEach(s => {
			// TODO: There's an issue here, highlight style has to be geometry type specific.
			var json = this.config.styles.find(s => s.id == "highlight");
			var type = s.feature.getGeometry().getType().toLowerCase();
			var style = Style.get_style(type, json);
		
			s.feature.setStyle(style);
		});
	}
	
	html() {
		return "<div class='map-container'>" + 
				   "<div handle='map' class='map'></div>" +
				   "<div handle='variable_select' widget='Widgets.GIS.VariableSelect'></div>" +
			   "</div>";
	}
	
});