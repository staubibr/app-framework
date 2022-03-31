'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Net from '../tools/net.js';

import Widget from '../base/widget.js';

import AppConfig from "../components/config.js";

export default Core.templatable("Api.Widget.ServerLoader", class ServerLoader extends Widget {

    constructor(id) {
        super(id);
		
		var path = AppConfig.URLs.logs;
		
		// TODO: Go to config
		this.models = [{
				"name": "Alternate Bit Protocol",
				"type" : "DEVS",
				"url": path + "/ABP/"
			}, {
				"name": "Crime and Drugs",
				"type" : "Cell-DEVS",
				"url": path + "/Crime and Drugs/Final/"
			}, {
				"name": "Classroom CO2",
				"type" : "Cell-DEVS",
				"url": path + "/CO2/"
			}, {
				"name": "COVID",
				"type" : "Cell-DEVS",
				"url": path + "/COVID/"
			}, {
				"name": "Employee Behaviour",
				"type" : "Cell-DEVS",
				"url": path + "/Employee Behaviour/2/"
			}, {
				"name": "Agricultural Farm",
				"type" : "DEVS",
				"url": path + "/Farm/"
			}, {
				"name": "Fire Spread",
				"type" : "Cell-DEVS",
				"url": path + "/Fire/"
			}, {
				"name": "Fire And Rain",
				"type" : "Cell-DEVS",
				"url": path + "/Fire and Rain/"
			}, {
				"name": "Food Chain",
				"type" : "Cell-DEVS",
				"url": path + "/Food Chain/"
			}, {
				"name": "Logistic Urban Growth Model #1",
				"type" : "Cell-DEVS",
				"url": path + "/LUG/1/"
			}, {
				"name": "Logistic Urban Growth Model #2",
				"type" : "Cell-DEVS",
				"url": path + "/LUG/2/"
			}, {
				"name": "Logistic Urban Growth Model #3",
				"type" : "Cell-DEVS",
				"url": path + "/LUG/3/"
			}, {
				"name": "Lynx & Hare",
				"type" : "Cell-DEVS",
				"url": path + "/Lynx Hare/"
			}, {
				"name": "Sheeps on a Ranch",
				"type" : "Cell-DEVS",
				"url": path + "/Ranch/hot/"
			}, {
				"name": "Sandpile",
				"type" : "Cell-DEVS",
				"url": path + "/Sandpile/"
			}, {
				"name": "Settlement Growth",
				"type" : "Cell-DEVS",
				"url": path + "/Settlement Growth/"
			}, {
				"name": "Smog",
				"type" : "Cell-DEVS",
				"url": path + "/Smog/"
			}, {
				"name": "Tumor Growth",
				"type" : "Cell-DEVS",
				"url": path + "/Tumor/"
			}, {
				"name": "UAV Search",
				"type" : "Cell-DEVS",
				"url": path + "/UAV/"
			}, {
				"name": "Worm",
				"type" : "Cell-DEVS",
				"url": path + "/Worm/"
			}, {
				"name": "Worm Spread",
				"type" : "Cell-DEVS",
				"url": path + "/Worm Spreading/"
			}
		]
		
		this.models.forEach(m => this.add_model(m));
    }

	add_model(model) {
		var li = Dom.create("li", { className:'model' }, this.elems.list);
		
		li.innerHTML = model.name;
		
		li.addEventListener("click", this.on_li_model_click.bind(this, model));
	}
	
    on_li_model_click(model, ev){
		// TODO: Review event names
		this.emit("model-selected", { model : model });
		
        this.get_server_results(model);
    }

    get_server_results(model){
		Dom.remove_css(this.elems.wait, "hidden");

		var p1 = Net.file(`${model.url}structure.json`, 'structure.json');
		var p2 = Net.file(`${model.url}messages.log`, 'messages.log');
		var p3 = Net.file(`${model.url}style.json`, 'style.json', true);
		var p4 = Net.file(`${model.url}diagram.svg`, 'diagram.svg', true);
		var p5 = Net.file(`${model.url}visualization.json`, 'visualization.json', true);
		
		var success = files => {			
			Dom.add_css(this.elems.wait, "hidden");	

			files = {
				structure: files.find(f => f && f.name == 'structure.json'),
				messages: files.find(f => f && f.name == 'messages.log'),
				diagram: files.find(f => f && f.name == 'diagram.svg'),
				visualization: files.find(f => f && f.name == 'visualization.json'),
				style: files.find(f => f && f.name == 'style.json')
			}
			
			this.emit("files-ready", { files : files });
		};

		Promise.all([p1, p2, p3, p4, p5]).then(success, this.on_error.bind(this));
    }

	on_error(error) {
		Dom.add_css(this.elems.wait, "hidden");
		
		this.error(error);
	}

    html() {
		return "<div class='server-loader-widget'>" + 
				  "<div handle='wait' class='wait hidden'>" + 
					 "<img src='./assets/loading.svg'>" + 
				  "</div>" + 
				  "<ul handle='list'></ul>" + 
			   "</div>";
    }
	
	localize(nls) {
		super.localize(nls);
	}
});
