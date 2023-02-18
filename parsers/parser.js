'use strict';

import Core from '../tools/core.js';
import Evented from '../base/evented.js';

export default class Parser extends Evented { 

	get files() { return this._files; }
	
	/**                              
	 * Sets the files to be parsed
	 */	
	set files(value) { this._files = value; }
	
	get type() { throw new Error("simulation type not provided by parser."); }
	
	constructor(files) {
		super();
		
		this.files = files;
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
	async parse_visualization() {
		throw new Error("parse_visualization must be implemented by parser.");
	}
	
	/**                              
	 * Parses the messages file (name changes according to parser)
	 * @return {Frame[]} an array of Frame objects
	 */		
	async parse_messages() {
		throw new Error("parse_messages must be implemented by parser.");
	}
	
	static organize_files(files) {
		return {
			cadmium_state: files.find(f => f.name.toLowerCase().endsWith('_output_state.txt')),
			cadmium_output: files.find(f => f.name.toLowerCase().endsWith('_output_messages.txt')),
			cd_ma: files.find(f => f.name.toLowerCase().endsWith('.ma')),
			cd_log: files.find(f => f.name.toLowerCase().includes('.log')),
			cd_pal: files.find(f => f.name.toLowerCase().endsWith('.pal')),
			cd_val: files.find(f => f.name.toLowerCase().endsWith('.val')),
			cd_map: files.find(f => f.name.toLowerCase().endsWith('.map')),
			structure: files.find(f => f.name == 'structure.json'),
			messages: files.find(f => f.name == 'messages.log'),
			diagram: files.find(f => f.name == 'diagram.svg'),
			visualization: files.find(f => f.name == 'visualization.json'),
			style: files.find(f => f.name == 'style.json'),
			geojson: files.filter(f => f.name.endsWith('.geojson'))
		}
	}
};
