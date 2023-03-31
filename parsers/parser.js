'use strict';

import Core from '../tools/core.js';
import Evented from '../base/evented.js';
import Reader from "../components/chunk-reader.js";
import ConfigurationDiagram from '../data_structures/visualization/configuration-diagram.js';
import ConfigurationGrid from '../data_structures/visualization/configuration-grid.js';
import ConfigurationGis from '../data_structures/visualization/configuration-gis.js';
import Frame from '../data_structures/simulation/frame.js';

export default class Parser extends Evented { 

	get files() { return this._files; }
	
	/**                              
	 * Sets the files to be parsed
	 */	
	set files(value) { this._files = value; }
	
	get type() { throw new Error("simulation type not provided by parser."); }
	
	constructor(files) {
		super();
		
		this.files = {};
	}
	
	/**                              
	 * Parses the scenario.json file
	 * @return {Scenario} the simulation scenario
	 */		
	async parse_scenario() {
		throw new Error("parse_scenario must be implemented by parser.");
	}
		
	/**                              
	 * Parses the metadata.json file
	 * @return {ModelCoupled} the coupled model metadata
	 */		
	async parse_metadata() {
		throw new Error("parse_metadata must be implemented by parser.");
	}
	
	/**                              
	 * Parses the diagram.svg file
	 * @return {string} a string containing the diagram content
	 */		
	async parse_diagram(fDiag) {
		throw new Error("parse_diagram must be implemented by parser.");
	}
	
	/**                              
	 * Parses the visualization.json file
	 * @return {Configuration} a visualization configuration file
	 */		
	static async parse_visualization(files) {		
		var file = files.find(f => f.name.toLowerCase() == 'visualization.json');
	
		if (!file) return null;
	
		var j_viz = await Reader.read_as_json(file);
		
		if (j_viz.type == "diagram") var viz = new ConfigurationDiagram(j_viz);
		
		else if (j_viz.type == "grid") var viz = new ConfigurationGrid(j_viz);
		
		else if (j_viz.type == "gis") var viz = new ConfigurationGis(j_viz);
		
		else throw new Error("Unable to detect visualization type.");
		
		return viz;
	}
	
	/**                              
	 * Parses the messages file (name changes according to parser)
	 * @return {Frame[]} an array of Frame objects
	 */		
	async parse_messages() {
		throw new Error("parse_messages must be implemented by parser.");
	}
	
	parse_line() {
		throw new Error("parse_line must be implemented by parser using CSV log files.");
	}
	
	async parse_csv(simulation, get_time, parse_line) {
		var f = null;
		
		return Reader.read_by_chunk(this.files.log, "\n", (parsed, chunk, progress) => {
			if (parsed == null) parsed = [];
			
			// If line has only one item, then it's a timestep. Otherwise, it's a simulation message, 
			// the format then depends on the whether it's a DEVS, Cell-DEVS or Irregular model
			var lines = chunk.split("\n");
			var start = f == null ? 1 : 0;
			
			for (var i = start; i < lines.length; i++) {
				var d = lines[i].split(";");
				
				if (f?.time == d[0]) parse_line(f, simulation, d);
				
				else {
					f = new Frame(get_time(d));
					parsed.push(f);
				}			
			}
			
			this.emit("progress", { progress: progress });
			
			return parsed;
		}, true);
	}
};
