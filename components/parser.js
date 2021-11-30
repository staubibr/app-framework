'use strict';

import Core from '../tools/core.js';
import Evented from "../components/evented.js";
import ChunkReader from "../components/chunkReader.js";
import Configuration from '../data_structures/configuration/configuration.js';
import Structure from "../data_structures/metadata/structure.js";
import MessageState from "../data_structures/simulation/message_state.js"
import MessageOutput from "../data_structures/simulation/message_output.js"
import MessageStateCA from "../data_structures/simulation/message_state_ca.js"
import Frame from "../data_structures/simulation/frame.js";

export default class Parser extends Evented { 
		
	async ParseStyle(fStyle) {
		var style = await ChunkReader.ReadAsJson(fStyle);		
				
		return style;
	}
	
	async ParseVisualization(type, fViz) {
		var visualization = await ChunkReader.ReadAsJson(fViz);
		
		if (visualization) return Configuration.FromJson(visualization);
		
		else return Configuration.FromType(type);
	}
	
	async ParseStructure(fStruct) {
		var json = await ChunkReader.ReadAsJson(fStruct);
		
		return Structure.from_json(json);
	}
	
	async ParseDiagram(fDiag) {
		return await ChunkReader.ReadAsText(fDiag);
	}
	
	async ParseMessages(structure, file) {
		this.frame = null;
		
		var parseFn = structure.info.type == "Cell-DEVS" ? this.ParseLineCA : this.ParseLine;
		
		return ChunkReader.ReadByChunk(file, "\n", (parsed, chunk, progress) => {
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
			
			this.Emit("Progress", { progress: progress });
			
			return parsed;
		});
	}
	
	ParseLine(frame, structure, emitter, values) {
		var model = structure.models[emitter[0]];
		var port = emitter.length == 2 ? model.ports[emitter[1]]: null ; 

		if (port) {
			var values = port.apply_template(values);
		
			frame.add_output_message(new MessageOutput(model, port, values));
		}
		
		else frame.add_state_message(new MessageState(model, model.apply_template(values)));	
	}
	
	ParseLineCA(frame, structure, coord, values) {		
		var values = structure.model_types[1].apply_template(values);

		frame.add_state_message(new MessageStateCA(coord, values));
	}
}