var BeeZIMSearcher = function() {
	this.fulltextIndex = "./X/fulltext/xapian";
	this.titleIndex = "./X/title/xapian"; // TODO: Can not load both indexes at the same time due to variables are overwritten in the global namespace.
	this.dataDir = "./X";
	this.files = [];
	this.initRan = false;
	this.xapian = new XapianAPI();
	this.maxResults = 20;

	this.init(this.fulltextIndex);
}

BeeZIMSearcher.prototype.init = function(index) {
	var self = this;
	console.log("Init");
	addOnPostRun(function(){
		self.xapian.initXapianIndexReadOnly(self.fulltextIndex);
		console.log(self.xapian);
		self.initRan = true;
	});
	var xhr = new XMLHttpRequest();
	xhr.open("GET","files.html"); // TODO: Should be special file in json format
	xhr.onload = function() {
		self.parseFiles(xhr.response);
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
	let filesMatch = 0;
	let queryLower = query.toLowerCase();
	for(var i = 0; i < this.files.length; i++){
		if (filesMatch >= 3)
			break;
		let curr = this.files[i];
		if(curr.title.indexOf(queryLower) > -1) {
			results.push({
				query: query,
				title: curr.title,
				data: curr.url
			});
		}
	}
	this.xapian.queryXapianIndex(query,0,this.maxResults).forEach((r) => {
		results.push(r);
	});
	return results;
}