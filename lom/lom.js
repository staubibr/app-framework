'use strict';

import Core from '../tools/core.js';
import Net from '../tools/net.js';
import Evented from '../components/evented.js';
import Contributor from './entities/e_contributor.js'
import Experiment from './entities/e_experiment.js'
import File from './entities/e_file.js'
import FileType from './entities/e_file_type.js'
import ModelType from './entities/e_model_type.js'
import NNFileVAll from './entities/e_nn_file_v_all.js'
import NNModelTypeVTag from './entities/e_nn_model_type_v_tag.js'
import Tag from './entities/e_tag.js'

const BASE = `http://localhost:8080/api`;
const CONTRIBUTORS = `${BASE}/contributors`;
const EXPERIMENTS = `${BASE}/experiments`;
const FILE_TYPES = `${BASE}/fileTypes`;
const FILES = `${BASE}/files`;
const MODEL_TYPES = `${BASE}/modeltypes`;
const NN_FILES_V_ALL = `${BASE}/nn_files_v_all`;
const NN_MODEL_TYPES_V_TAGS = `${BASE}/nn_model_types_v_tags`;
const TAGS = `${BASE}/tags`;
const DOWNLOAD = `${BASE}/files/download`;

class LoM extends Evented {
	
	get data() { return this._data; }
	get apis() { return this._apis; }
	get contributors() { return this.data.contributors; }
	get experiments() { return this.data.experiments; }
	get file_types() { return this.data.file_types; }
	get files() { return this.data.files; }
	get model_types() { return this.data.model_types; }
	get nn_files_v_all() { return this.data.nn_files_v_all; }
	get nn_model_types_v_tags() { return this.data.nn_model_types_v_tags; }
	get tags() { return this.data.tags; }
	
	set data(value) { this._data = value; }
	set apis(value) { this._apis = value; }
	set contributors(value) { this.data.contributors = value; }
	set experiments(value) { this.data.experiments = value; }
	set file_types(value) { this.data.file_types = value; }
	set files(value) { this.data.files = value; }
	set model_types(value) { this.data.model_types = value; }
	set nn_files_v_all(value) { this.data.nn_files_v_all = value; }
	set nn_model_types_v_tags(value) { this.data.nn_model_types_v_tags = value; }
	set tags(value) { this.data.tags = value; }
	
	constructor() {
		super();
		
		this.apis = {
			contributors: this.tableApi(CONTRIBUTORS, Contributor),
			experiments: this.tableApi(EXPERIMENTS, Experiment),
			file_types: this.tableApi(FILE_TYPES, FileType),
			files: this.tableApi(FILES, File),
			model_types: this.tableApi(MODEL_TYPES, ModelType),
			nn_files_v_all: this.tableApi(NN_FILES_V_ALL, NNFileVAll),
			nn_model_types_v_tags: this.tableApi(NN_MODEL_TYPES_V_TAGS, NNModelTypeVTag),
			tags: this.tableApi(TAGS, Tag),
			download: this.downloadApi(DOWNLOAD)
		}
		
		this.data = {
			contributors: null,
			experiments: null,
			file_types: null,
			files: null,
			model_types: null,
			nn_files_v_all: null,
			nn_model_types_v_tags: null,
			tags: null
		}
	}
	
	tableApi(api, entity) {
		return {
			"get": async (id, complex) => {
				var url = Net.Url(`${api}/${id}`, { complex:!!complex });
				
				return Net.JSON(url, { method:"get" }).then(c => new entity(c, complex));
			},
			
			"getAll": async (complex) => {
				var url = Net.Url(`${api}`, { complex:!!complex });
				
				return Net.JSON(url, { method:"get" }).then(j => j.map(c => new entity(c, complex)));
			},
			
			"post": async (entities) => {
				var body = JSON.stringify(entities.map(c => c.json));
				var headers = { 'Content-Type': 'application/json' };
				
				return Net.JSON(`${api}`, { method:"post", body:body, headers:headers });
			},
			
			"put": async (entities) => {
				var body = JSON.stringify(entities.map(c => c.json));
				var headers = { 'Content-Type': 'application/json' };
				
				return Net.JSON(`${api}`, { method:"put", body:body, headers:headers });
			},
			
			"delete": async (ids) => {
				var body = JSON.stringify(ids);
				var headers = { 'Content-Type': 'application/json' };
				
				return Net.JSON(`${api}`, { method:"delete", body:body, headers:headers });
			}
		}
	}
	
	downloadApi(api) {
		return {
			"get": async (id, hierarchy, name) => {
				var url = Net.Url(`${api}/${id}`, { hierarchy:!!hierarchy, name:name });
				
				return Net.File(url, { method:"get" });
			},
				
			"getAll": async (ids, hierarchy) => {
				var url = Net.Url(`${api}`, { ids:ids, hierarchy:!!hierarchy });
				
				return Net.File(url, { method:"get" });
			}
		}
	}
}

var lom = new LoM();

var handlers = {
	set(obj, prop, value) {
		var out = Reflect.set(...arguments);
		
		lom.Emit("change", { property:prop, value:value });
		lom.Emit(`change:${prop}`, { value:value });
	
		return out;
	}
}

export default LoM = new Proxy(lom, handlers);