'use strict';

import Core from '../tools/core.js';
import Evented from "../base/evented.js";
import Reader from "../components/chunk-reader.js";
import Configuration from '../data_structures/configuration/configuration.js';
import Structure from "../data_structures/metadata/structure.js";
import MessageState from "../data_structures/simulation/message_state.js"
import MessageOutput from "../data_structures/simulation/message_output.js"
import MessageStateCA from "../data_structures/simulation/message_state_ca.js"
import Frame from "../data_structures/simulation/frame.js";

/**
 * A parser component to process the common results format
 */
export default class Parser extends Evented { 
	/**                              
	 * Parses the style.json file
	 * @param {File} fStyle - the style.json file
	 * @return {object} the json content
	 */		
	async parse_style(fStyle) {
		return await Reader.read_as_json(fStyle);		
	}
	
	/**                              
	 * Parses the visualization.json file
	 * @param {File} fViz - the visualization.json file
	 * @return {object} the json content
	 */		
	async parse_visualization(fViz) {
		return await Reader.read_as_json(fViz);
	}
	
	/**                              
	 * Parses the structure.json file
	 * @param {File} fStruct - the structure.json file
	 * @return {Structure} the structure object built from the file
	 */		
	async parse_structure(fStruct) {
		var json = await Reader.read_as_json(fStruct);
		
		return Structure.from_json(json);
	}
	
	/**                              
	 * Parses the diagram.svg file
	 * @param {File} fDiag - the diagram.svg file
	 * @return {string} a string containing the diagram content
	 */		
	async parse_diagram(fDiag) {
		return await Reader.read_as_text(fDiag);
	}
	
	/**                              
	 * Parses the messages.log file
	 * @param {Structure} structure - the structure object for a simulation
	 * @param {File} file - the messages.log file
	 * @return {Frame[]} an array of frames built from the messages.log
	 */		
	async parse_messages(structure, file) {
		this.frame = null;
		
		var parseFn = structure.info.type == "Cell-DEVS" ? this.parse_line_ca : this.parse_line;
		
		return Reader.read_by_chunk(file, "\n", (parsed, chunk, progress) => {
			if (parsed == null) parsed = [];
			
			// If line has only one item, then it's a timestep. Otherwise, it's a simulation message, 
			// the format then depends on the whether it's a DEVS, Cell-DEVS or Irregular model
			var lines = chunk.split("\n");
		
			for (var i = 0; i < lines.length; i++) {
				var data = lines[i].trim().split(";");
			
				if (data.length == 1) {
					this.frame = new Frame(data[0]);
					
					parsed.push(this.frame);
				}
				
				else {					
					data = data.map(d => d.split(","));
				
					parseFn(this.frame, structure, data[0], data[1]);
				}
			}
			
			this.emit("progress", { progress: progress });
			
			return parsed;
		});
	}
	
	/**                              
	 * Parses a line from the messages.log. Adds it to the frame provided.
	 * @param {Frame} frame - a time frame for the simulation
	 * @param {Structure} structure - the structure object for a simulation
	 * @param {string} emitter - the emitter of the message
	 * @param {string} values - the value contained in the message
	 */	
	parse_line(frame, structure, emitter, values) {
		var model = structure.models[emitter[0]];
		var port = emitter.length == 2 ? model.ports[emitter[1]]: null ; 

		if (port) {
			var values = port.apply_template(values);
		
			frame.add_output_message(new MessageOutput(model, port, values));
		}
		
		else frame.add_state_message(new MessageState(model, model.apply_template(values)));	
	}
	
	/**                              
	 * Parses a CA simulation line from the messages.log. Adds it to the frame provided. 
	 * @param {Frame} frame - a time frame for the simulation
	 * @param {Structure} structure - the structure object for a simulation
	 * @param {number[]} coord - the coordinate of the emitter
	 * @param {number[]} values - the values contained in the message
	 */	
	parse_line_ca(frame, structure, coord, values) {		
		var values = structure.model_types[1].apply_template(values);

		frame.add_state_message(new MessageStateCA(coord, values));
	}
}