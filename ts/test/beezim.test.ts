import { suite, test } from "@testdeck/mocha";

import { existsSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import { loadXapian } from "../xapian/xapian.loader";
import { XapianAPI } from "../xapian/xapianapi";

// const XAPIANFSTYPE: string = "MEM";
const XAPIANFSTYPE: string = "NODE";

declare var FS, MEMFS, NODEFS;

// TODO: add search tests

@suite
export class BeezimTest {
  static before(done) {
    loadXapian().subscribe(() => {
      console.log("HERE")
      // if (XAPIANFSTYPE === "NODE") {
      //   // if (existsSync("nodexapiantest")) {
      //   //   execSync("rm -Rf nodexapiantest");
      //   // }
      //   // mkdirSync("nodexapiantest");
      //   FS.mkdir("/work");
      //   // TODO: mount WORKERFS
      //   FS.mount(NODEFS, { root: "./dist" }, "/work");
      //   FS.chdir("/work");
      // } else {
      //   FS.mkdir("/work");
      //   FS.mount(MEMFS, {}, "/work");
      //   FS.chdir("/work");
      // }

      console.log("END")
      done();
    });
  }

  static after() {
    // if (XAPIANFSTYPE === "NODE") {
    //   execSync("rm -Rf nodexapiantest");
    // }
  }

  @test() searchText() {
    // const xapian = new XapianAPI();
    var data = FS.readdir(".");
    console.log(data)    
    
    // xapian.initXapianIndexReadOnly("xapianasm.data");
    // const maxresults = 20;
    // const results = xapian.sortedXapianQuery(
    //   "is zuid",
    //   0,
    //   0,
    //   0,
    //   maxresults,
    //   -1
    // );
    // console.log(maxresults, results.length);
    // results.forEach((r) => {
    //   let docid = r[0];
    //   const docdata = xapian.getDocumentData(r[0]);
    //   console.log("DocID:", docid);
    //   console.log("DOCDATA:", docdata);

    //   console.log(
    //     xapian.getStringValue(r[0], 0),
    //     xapian.getStringValue(r[0], 1),
    //     xapian.getStringValue(r[0], 2),
    //     docdata
    //   );
    //   const dparts = docdata.split("\t");
    //   const id = parseInt(dparts[0].substring(1), 10);
    //   const subject = dparts[2];
    // });
  }
}
