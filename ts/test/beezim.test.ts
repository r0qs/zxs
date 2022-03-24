import { suite, test } from "@testdeck/mocha";
import { equal } from "assert";
import { loadXapian } from "../xapian/xapian.loader";
import { XapianAPI } from "../xapian/xapianapi";

declare var FS, MEMFS, NODEFS;

// const XAPIANFSTYPE: string = 'MEM';
const XAPIANFSTYPE: string = "NODE";

// TODO: create db, mock terms and data
const expectedEntries = [
  { docid: 52, data: "A/Michael_Jackson" },
  { docid: 94, data: "A/The_Beatles" },
  { docid: 71, data: "A/Elvis_Presley" },
  { docid: 39, data: "A/Midfielder" },
  { docid: 36, data: "A/Bob_Dylan" },
  { docid: 87, data: "A/Video_game" },
  { docid: 63, data: "A/Bat" },
  { docid: 45, data: "A/Elizabeth_II" },
  { docid: 9, data: "A/Anfield" },
  { docid: 48, data: "A/Mollusca" },
  { docid: 64, data: "A/Human" },
  { docid: 55, data: "A/Myocardial_infarction" },
  { docid: 84, data: "A/Argentina" },
  { docid: 22, data: "A/Billboard_(magazine)" },
  { docid: 69, data: "A/Kit_(association_football)" },
  { docid: 68, data: "A/Giraffe" },
  { docid: 14, data: "A/Thoroughbred" },
  { docid: 4, data: "A/Beetle" },
  { docid: 34, data: "A/Precipitation" },
  { docid: 28, data: "A/Emu" },
];

@suite
export class BeezimTest {
  static before(done) {
    loadXapian().subscribe(() => {
      if (XAPIANFSTYPE === "NODE") {
        FS.mkdir("/data");
        FS.mount(NODEFS, { root: "./demo/X/fulltext" }, "/data");
        FS.chdir("/data");
      } else {
        FS.mkdir("/data");
        FS.mount(MEMFS, {}, "/data");
        FS.chdir("/data");
      }
      done();
    });
  }

  @test() searchText() {
    const xapian = new XapianAPI();
    xapian.initXapianIndexReadOnly("xapian");

    const maxresults = 20;
    const results = xapian.queryXapianIndex("beat", 0, maxresults);
    equal(maxresults, results.length);

    results.forEach((doc, i) => {
      const id = doc["docid"];
      const docdata = xapian.getDocumentData(id);
      equal(id, expectedEntries[i].docid);
      equal(docdata, expectedEntries[i].data);
    });
  }
}
