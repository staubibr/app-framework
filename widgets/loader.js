'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Widget from '../base/widget.js';
import BoxInputFiles from '../ui/box-input-files.js';
import Parser from '../parsers/parser.js';
import ParserCDpp from '../parsers/parserCDpp.js';
import ParserCadmium from '../parsers/parserCadmium.js';
// import ParserOGSE from '../parsers/parserOGSE.js';
import Simulation from '../data_structures/simulation/simulation.js';

export default Core.templatable("Api.Widget.Loader", class Loader extends Widget { 
		
	constructor(node) {		
		super(node);
		
		this.elems.parse.addEventListener("click", this.on_parse_button_click.bind(this));
		this.elems.clear.addEventListener("click", this.on_clear_button_click.bind(this));
		this.elems.dropzone.on("change", this.on_dropzone_change.bind(this));
	}
	
	update_button() {
		this.elems.parse.disabled = this.elems.dropzone.files.length == 0;
	}

	restore_ui() {
		Dom.add_css(this.elems.wait, "hidden");
		
		this.elems.parse.style.backgroundImage = null;	
	}
	
	async load(files) {
		try {
			files = Parser.organize_files(files);
			
			if (ParserCadmium.detect(files)) var parser = new ParserCadmium(files);
			
			else if (ParserCDpp.detect(files)) var parser = new ParserCDpp(files);
			
			else var parser = new ParserOGSE(files);
			
			await this.parse(parser, files);
		}
		catch (error) {
			this.on_widget_error(error);
		}
	}
	
	async parse(parser, files) {
		parser.on("progress", this.on_parser_progress.bind(this));
		
		var metadata = await parser.parse_metadata();
		var configuration = await parser.parse_visualization(metadata);
		var simulation = new Simulation(metadata, configuration.cache);
		var messages = await parser.parse_messages(simulation);
		
		if (configuration.type == "grid") configuration.initialize(simulation);
		
		simulation.initialize(messages);
		
		this.restore_ui();

		this.emit("ready", { files: files, simulation: simulation, configuration: configuration });			
	}
	
	on_parser_progress(ev) {		
		var c1 = "#198CFF";
		var c2 = "#0051A3";
		
		var bg = `linear-gradient(to right, ${c1} 0%, ${c1} ${ev.progress}%, ${c2} ${ev.progress}%, ${c2} 100%)`;
		
		this.elems.parse.style.backgroundImage = bg;		
	}
	
	on_dropzone_change(ev) {		
		this.update_button();
	}
		
	on_parse_button_click(ev) {
		Dom.remove_css(this.elems.wait, "hidden");
		
		this.load(this.elems.dropzone.files);
	}
	
	on_clear_button_click(ev) {
		this.elems.dropzone.clear();
		
		this.update_button();
	}
	
	on_widget_error(error) {
		this.restore_ui();
		
		this.error(error);
	}

	html() {
		return "<div class='loader-widget'>" +
				  "<div handle='wait' class='wait hidden'><img src='./assets/loading.svg'></div>" + 
			      "<div handle='dropzone' widget='Api.Widget.BoxInputFiles'></div>" +
				  "<div class='box-input-files'>" +
					 "<button handle='clear' class='clear'>nls(Loader_Clear)</button>" +
					 "<button handle='parse' class='parse' disabled>nls(Loader_Parse)</button>" +
			      "</div>" +
			   "</div>";
	}
	
	localize(nls) {
		super.localize(nls);
		
		nls.add("Loader_Clear", "en", "Clear");
		nls.add("Loader_Parse", "en", "Load simulation");
		nls.add("Dialog_Linker", "en", "This visualization uses an SVG diagram. Do you want to review the associations between the diagram and the structure file?");
	}
});
