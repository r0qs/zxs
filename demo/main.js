var BeeZIMSearcher = function() {
	this.fulltextIndex = "./X/fulltext/xapian";
	this.titleIndex = "./X/title/xapian"; // TODO: Can not load both indexes at the same time due to variables are overwritten in the global namespace.
	this.dataDir = "./X";
	this.files = [];
	this.initRan = false;
	this.xapian = new XapianAPI();
	this.maxResults = 20;
	this.titleResults = 3;

	this.init(this.fulltextIndex);
}

BeeZIMSearcher.prototype.init = function(index) {
	var self = this;
	addOnPostRun(function(){
		self.xapian.initXapianIndexReadOnly(self.fulltextIndex);
		self.initRan = true;
	});
	var xhr = new XMLHttpRequest();
	xhr.open("GET","files.json");
	xhr.onload = function() {
		self.files = JSON.parse(xhr.response);
	};
	xhr.send();
}

BeeZIMSearcher.prototype.parseFiles = function(filesResponse) {
	var self = this;
	self.files.push({title:"prestley", url:"A/Elvis_presley"})
	self.files.push({title:"pelvis", url:"A/Elvis_presley"})
}

BeeZIMSearcher.prototype.search = function(query) {
	if (!this.initRan) {
		return "You need to run 'init()' before searching!";
	}
	
	let results = [];
	let queryLower = query.toLowerCase();

	this.xapian.queryXapianIndex(query,0,this.maxResults-this.titleResults).forEach((r) => {
		results.push(r);
	});
	let wantedTitleMatch = this.maxResults-results.length;
	for (const [key, value] of Object.entries(this.files)){
		if (wantedTitleMatch <= 0)
			break;
		let curr = this.files[i];
		// console.log(key);
		// console.log(value);
		if(value.Metadata.Title.indexOf(queryLower) > -1) {
			results.unshift({
				query: query,
				title: value.Metadata.Title,
				data: key//value.Path
			});
			wantedTitleMatch--;
		}
	}

	
	for(var i = 0; i < this.files.length; i++){
		
	}
	
	return results;
}