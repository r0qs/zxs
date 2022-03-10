import * as process from "process";
import { AsyncSubject } from "rxjs";

declare var FS;
declare var global;

let xapianLoadedSubject: AsyncSubject<boolean>;

export function loadXapian(path?: string): AsyncSubject<boolean> {
  if (!xapianLoadedSubject) {
    xapianLoadedSubject = new AsyncSubject();

    if (!path) {
      path = `${process.cwd()}/dist/xapianasm.js`;
    }
    const xapian = require(path);

    global.termlistresult = [];
    global.Module = xapian;
    global.FS = xapian.FS;
    global.NODEFS = FS.filesystems.NODEFS;
    global.WORKERFS = FS.filesystems.WORKERFS;
    global.MEMFS = FS.filesystems.MEMFS;
    console.log("Xapian loaded");

    global.Module.onRuntimeInitialized = function () {
      console.log("Xapian runtime initialized");
      xapianLoadedSubject.next(true);
      xapianLoadedSubject.complete();
    };
  }
  return xapianLoadedSubject;
}
