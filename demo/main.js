var BeeZIMSearcher = function() {
	this.fulltextIndex = "./X/fulltext/xapian";
	this.titleIndex = "./X/title/xapian"; // TODO: Can not load both indexes at the same time due to variables are overwritten in the global namespace.
	this.dataDir = "./X";
	this.articles = [];
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
		self.parseFiles(xhr.response);
	};
	xhr.send();
}

BeeZIMSearcher.prototype.parseFiles = function(filesResponse) {
	let files = JSON.parse(filesResponse);
	for (const [key, value] of Object.entries(files)){
		if (key.startsWith("A/")){
			this.articles.push(value);
		}
	}
}

BeeZIMSearcher.prototype.GetRandomArticle = function() {
	if (!this.initRan) {
		return "You need to run 'init()' before searching!";
	}
	return this.articles[this.articles.length * Math.random() << 0];
}

BeeZIMSearcher.prototype.Search = function(query) {
	if (!this.initRan) {
		return "You need to run 'init()' before searching!";
	}
	
	let results = [];
	let queryLower = query.toLowerCase();

	this.xapian.queryXapianIndex(query,0,this.maxResults-this.titleResults).forEach((r) => {
		results.push({
			docid: r.docid,
			data: r.data,
			wordcount: parseInt(this.xapian.getStringValue(r.docid,1)),
			title: this.xapian.getStringValue(r.docid,0)
		});
	});
	let wantedTitleMatch = this.maxResults-results.length;
	let titleResults = [];
	for (let i = 0; i < this.articles.length; i++) {
		if (wantedTitleMatch <= 0)
			break;
		let value = this.articles[i];
		if(value.Metadata.Title.toLowerCase().indexOf(queryLower) > -1) {
			titleResults.push({
				query: query,
				title: value.Metadata.Title,
				data: value.Path
			});
			wantedTitleMatch--;
		}
	}
	titleResults.sort(function(a,b) {
		return a.title.length - b.title.length;
	});

	// Top 3 results are from titleResults
	if (titleResults.length > this.titleResults){
		return titleResults.slice(0,this.titleResults).concat(results,titleResults.slice(this.titleResults))
	}

	return titleResults.concat(results);
}