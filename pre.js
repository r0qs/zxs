var Module = {
	'preRun': function () {
		console.log("Running preloader...")
		FS.mkdir("/data");
		FS.mount(IDBFS, {}, "/data");
		// sync from IDBFS to MEMFS
		FS.syncfs(true, function (err) {
			if (err) {
				console.error(err);
			}
		});
		FS.chdir("/data");
	},
};
