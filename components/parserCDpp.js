'use strict';

import Core from '../tools/core.js';
import Evented from "../components/evented.js";
import ChunkReader from "../components/chunkReader.js";
import Configuration from '../components/configuration/configuration.js';
import Info from "../components/specification/info.js";
import { ModelTypeCA, PortType } from '../components/specification/nodeType.js';
import { ModelNodeCA } from '../components/specification/node.js';
import { MessageType } from '../components/specification/message_type.js';
import Structure from "../components/specification/structure.js";
import SimulationCA from "../simulation/simulationCA.js";
import Frame from "../simulation/frame.js";

import { StateMessage, OutputMessage, StateMessageCA } from "./specification/message.js"

export default class ParserCDpp extends Evented { 
	
	constructor() {
		super();
		
		this.initialValue = null;
		this.initialRowValues = null;
	}
	
	MakeComponent(structure, name, type) {
		var msg_type_id = structure.message_types.length;
		var model_type_id = structure.model_types.length;
		
		var msg_type = new MessageType(msg_type_id, `s_${name}`, ["out"], "No description available.");
		var port = new PortType("out", "output", null);
		var model_type = new ModelTypeCA(model_type_id, name, type, msg_type, [port], null, null, null, null)
		var model = new ModelNodeCA(name, model_type, null);
		
		structure.message_types.push(msg_type);
		structure.model_types.push(model_type);
		
		structure.AddModel(model);
				
		return model;
	}
	
	async ParseStructure(ma) {	
		var s = new Structure(new Info("top", "CDpp", "Cell-DEVS"));	
		
		var id = 0;
		var content = await ChunkReader.ReadAsText(ma); 
		var lines = content.split("\n");
		var curr = null;

		for (var i = 0; i < lines.length; i++) {
			var l = lines[i].trim();
			
			if (l.startsWith("[")) {		
				var name = l.substring(1, l.length - 1);
				
				if (name.toLowerCase() == "top") this.MakeComponent(s, name, "coupled");
				
				curr = s.model_types.find(m => m.name == name);
			}
			
			else if (curr == null || l.startsWith('%') || !l.includes(":")) continue;
			
			else {
				var kv = l.split(':').map(l => l.trim());
				
				kv[0] = kv[0].toLowerCase();
				
				if (kv[0] == "components") {				
					var model = this.MakeComponent(s, kv[1].split(' ')[0].trim(), "atomic");
					
					curr.AddModel(model); 
				}
				
				else if (kv[0] == "dim") {
					curr.dim = kv[1].substring(1, kv[1].length - 1).split(",").map(c => +c.trim());
				
					if (curr.dim.length == 2) curr.dim.push(1);
				}
				
				else if (kv[0] == "height") {
					if (!curr.dim) curr.dim = [0, +kv[1], 1];
					
					else curr.dim[1] = +kv[1];
				}
				
				else if (kv[0] == "width") {
					if (!curr.dim) curr.dim = [+kv[1], 0, 1];
					
					else curr.dim[0] = +kv[1];
				}
				
				else if (kv[0] == "neighborports") {
					var ports = kv[1].split(" ").map(c => c.trim());
				
					ports.forEach(p => {
						curr.AddPort(new PortType(`out_${p}`, "output", null));
						curr.template.push(`out_${p}`);
					});
				}
				
				else if (kv[0] == "initialvalue") this.initialValue = kv[1];

				else if (kv[0] == "initialrowvalue") {
					if (this.initialRowValues == null) this.initialRowValues = [];
					
					var lr = kv[1].replaceAll(" ","").split('')
					
					this.initialRowValues.push({
						row: +lr[0],
						values: lr.slice(1, lr.length).map(v => v)
					});
				}

			}
		}
		
		return s;
	}
	
	async ParseStyle(simulation, fStyle) {
		var config = Configuration.FromSimulation(simulation);
		var style = await ChunkReader.ReadAsJson(fStyle);
		
		config.grid.styles = style;
		
		return config;
	}
	
	async ParseVisualization(simulation, fViz) {
		var visualization = await ChunkReader.ReadAsJson(fViz);
		
		return Configuration.FromJson(visualization);
	}
	
	async ParsePalette(simulation, pal) {
		var config = Configuration.FromSimulation(simulation);
		var content = await ChunkReader.ReadAsText(pal);		
		var lines = content.trim().split("\n").map(l => l.trim());
		var style = { buckets: [] };
		
		// VALIDSAVEDFILE
		// 169,169,169
		// ...
		// 4.0,4.9
		if (lines[0] == "VALIDSAVEDFILE") {
			var j = 0;
			
			for (var i = 1; i < lines.length; i++) {
				var split = lines[i].split(',').map(l => +l.trim());
				
				if (split.length == 3) {
					style.buckets.push({ start:null, end:null, color:split });
				}

				else {
					style.buckets[j].start = split[0];
					style.buckets[j++].end = split[1];
				}
			}
		}
		
        // [-0.1;0.9] 255 255 51
        // [-1.1;-0.9] 153 255 255
        // ...
		else {
			for (var i = 0; i < lines.length; i++) {
				split = lines[i].replace('[','')
								.replace(']','')
								.replace(';',' ')
								.replaceAll(',','')
								.split(' ').map(s => +s);

				style.buckets.push({ start:split[0], end:split[1], color:[split[2], split[3], split[4]] });
			}
		}
		
		config.grid.styles = [style];
		
		return config;
	}
	
	ReadInitialRowValues(sim, time) {
		if (this.initialRowValues == null) return;
		
		var frame = sim.Frame(time) || sim.AddFrame(new Frame(time));
		
		this.initialRowValues.forEach(irv => {
			irv.values.forEach((v, y) => {
				var coord = [irv.row, +y, 0]
				var value = sim.models[1].template.map(t => v);
				
				frame.AddStateMessage(new StateMessageCA(coord, value));
			});
		});
	}
	
	ReadInitialValue(sim, time) {
		if (this.initialValue == null) return;
		
		var frame = sim.Frame(time) || sim.AddFrame(new Frame(time));

        for (var x = 0; x < sim.maxX; x++) {
            for (var y = 0; y < sim.maxY; y++) {
                for (var z = 0; z < sim.maxZ; z++) {
					var coord = [x, y, z];
					var value = sim.models[1].template.map(t => this.initialValue);
					
					frame.AddStateMessage(new StateMessageCA(coord, value));
				}
			}
		}		
	}
	
	async ReadVal(sim, val, time) {
		if (!val) return;
		
		var frame = sim.Frame(time) || sim.AddFrame(new Frame(time));
		var content = await ChunkReader.ReadAsText(val);		
		var lines = content.trim().split("\n").map(l => l.trim());
		
        // (0,0,0)=100 2 1
        // (0,0,1)=0.567 0 1
        // ...
		for (var i = 0; i < lines.length; i++) {
			var split = lines[i].split('=').map(l => l.trim()); 
			
			if (split.length != 2) continue;
			
			var coord = split[0].substring(1, split[0].length - 1).split(",").map(s => s.trim());
			var value = split[1].split(" ").map(v => v.trim());
			
			if (coord.length  == 2) coord.push("0");
			
			frame.AddStateMessage(new StateMessageCA(coord, value));
		}
	}
		
	async ParseSimulation(structure, log, val) {
		var lopez_test = await log.slice(0, 5).text();
		var is_lopez = lopez_test == "0 / L";
		var t0 = is_lopez ? "00:00:00:000:0" : "00:00:00:000";
		
		var sim = new SimulationCA(structure, []);
		
		if (!is_lopez) this.ReadInitialValue(sim, t0);
		if (!is_lopez) this.ReadInitialRowValues(sim, t0);
		
		this.ReadVal(sim, val, t0);
		
		await ChunkReader.ReadByChunk(log, "\n", (parsed, chunk, progress) => {			
			var lines = chunk.split("\n");
			
			for (var i = 0; i < lines.length; i++) {
				var line = lines[i];
				
				// Mensaje Y / 00:00:00:100 / flu(18,12)(645) / out /      2.00000 para flu(02)
				// Mensaje Y / 00:00:20:000 / sender(02) / dataout /     11.00000 para top(01)
				if (line.startsWith("Mensaje Y")) this.ParseCdppLine(sim, line);
				
				else if (line.startsWith("0 / L / Y")) this.ParseLopezLine(sim, line);
			}
			
			this.Emit("Progress", { progress: progress });
			
			return sim;
		});
		
		sim.frames.forEach(f => {
			f.state_messages.forEach(m => {
				m.value = sim.models[1].Template(m.value);
			});
		});
		
		return sim;
	}
	
	ParseCdppLine(sim, line) {
		var split = line.split('/').map(l => l.trim());
		var model = split[2].replaceAll('(', ' ').replaceAll(')', '').split(' ')
		var coord = model.length == 3 ? model[1].split(',') : null;
		
		var time = split[1]
		var port = split[3]
		var value = split[4].split(' ')[0]
		
		var frame = sim.Frame(time) || sim.AddFrame(new Frame(time));

		if (coord) {
			if (coord.length == 2) coord.push("0");
						
			frame.AddStateMessage(new StateMessageCA(coord, [value]));
		}
	}
	
	ParseLopezLine(sim, line) {
		var split = line.split('/').map(l => l.trim());
		var model = split[4].replaceAll('(', ' ').replaceAll(')', '').split(' ')
		var c = model.length == 3 ? model[1].split(',') : null;
		
		var time = split[3]
		var port = split[5]
		var value = split[6]
		
		var frame = sim.Frame(time) || sim.AddFrame(new Frame(time));

		if (c) {
			if (c.length == 2) c.push("0");
			
			var m = frame.state_messages.find(m => m.x == c[0] && m.y == c[1] && m.z == c[2])

			if (!m) {
				var values = sim.models[1].template.map(t => "");
				
				m = frame.AddStateMessage(new StateMessageCA(c, values));
			}
			
			var idx = sim.models[1].ports.findIndex(p => p.name == port);
			
			m.value[idx] = value;
		}
	}
}