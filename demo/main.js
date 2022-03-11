window.onload = function () {
	setTimeout(function () {
		var xapian = new XapianAPI();
		console.log(xapian)
		var data = FS.readdir("./X");
		console.log(data)
		xapian.initXapianIndexReadOnly("./X/fulltext/xapian");
		// xapian.initXapianIndexReadOnly("./X/title/xapian");
		let c = xapian.getXapianDocCount();
		console.log(c, data)

		const maxresults = 20;
		const results = xapian.sortedXapianQuery(
			"ra",
			0,
			0,
			0,
			maxresults,
			-1
		);
		console.log(maxresults, results.length);
		results.forEach((r) => {
			let docid = r[0];
			const docdata = xapian.getDocumentData(r[0]);
			console.log("DocID:", docid);
			console.log("DOCDATA:", docdata);

			console.log(
				xapian.getStringValue(r[0], 0),
				xapian.getStringValue(r[0], 1),
				xapian.getStringValue(r[0], 2),
				docdata
			);
			const dparts = docdata.split("\t");
			const id = parseInt(dparts[0].substring(1), 10);
			const subject = dparts[2];
		});
	},
		1000
	)
}

