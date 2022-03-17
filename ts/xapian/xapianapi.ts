/* Copyright (C) 2022  Beezim

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>

This file is based on Runbox 7 (Runbox Solutions AS).
*/

declare var Module;

const emAllocateString = function (str) {
  if (!str) {
    str = "";
  }

  const $str = Module._malloc(str.length * 4 + 1);
  Module.stringToUTF8(str, $str, str.length * 4 + 1);
  return $str;
};

export class XapianAPI {
  public initXapianIndex: (path: string) => void = Module.cwrap(
    "initXapianIndex",
    null,
    ["string"]
  );
  public initXapianIndexReadOnly: (path: string) => void = Module.cwrap(
    "initXapianIndexReadOnly",
    null,
    ["string"]
  );
  public addSingleFileXapianIndex: (path: string) => void = Module.cwrap(
    "addSingleFileXapianIndex",
    null,
    ["string"]
  );
  public compactDatabase: () => void = Module.cwrap(
    "compactDatabase",
    null,
    []
  );
  public compactToWritableDatabase: (path: string) => void = Module.cwrap(
    "compactToWritableDatabase",
    null,
    ["string"]
  );
  public addToXapianIndex: (id: string, val: string) => void = Module.cwrap(
    "addToXapianIndex",
    null,
    ["string", "string"]
  );
  public commitXapianUpdates: () => void = Module.cwrap(
    "commitXapianUpdates",
    null,
    []
  );
  public getXapianDocCount: () => number = Module.cwrap(
    "getDocCount",
    "number",
    []
  );
  public getLastDocid: () => number = Module.cwrap(
    "getLastDocid",
    "number",
    []
  );
  public reloadXapianDatabase: () => void = Module.cwrap(
    "reloadDatabase",
    null,
    []
  );
  public closeXapianDatabase: () => void = Module.cwrap(
    "closeDatabase",
    null,
    []
  );
  public setStringValueRange: (valuenumber: number, prefix: string) => void =
    Module.cwrap("setStringValueRange", null, ["number", "string"]);
  public clearValueRange: () => void = Module.cwrap(
    "clearValueRange",
    null,
    []
  );
  public getNumericValue: (docid: number, slot: number) => number =
    Module.cwrap("getNumericValue", "number", ["number", "number"]);
  public termlist: (prefix: string) => number = Module.cwrap(
    "termlist",
    "number",
    ["string"]
  );
  public documentTermList: (docid: number) => number = Module.cwrap(
    "documentTermList",
    "number",
    ["number"]
  );
  public documentXTermList: (docid: number) => number = Module.cwrap(
    "documentXTermList",
    "number",
    ["number"]
  );
  public deleteDocumentByUniqueTerm: (id: string) => void = Module.cwrap(
    "deleteDocumentByUniqueTerm",
    null,
    ["string"]
  );
  public deleteDocumentFromAddedWritablesByUniqueTerm: (id: string) => number =
    Module.cwrap("deleteDocumentFromAddedWritablesByUniqueTerm", "number", [
      "string",
    ]);
  public setStringValue: (docid: number, slot: number, val: string) => void =
    Module.cwrap("setStringValue", null, ["number", "number", "string"]);
  public addTermToDocument: (idterm: string, termname: string) => void =
    Module.cwrap("addTermToDocument", null, ["string", "string"]);
  public removeTermFromDocument: (idterm: string, termname: string) => void =
    Module.cwrap("removeTermFromDocument", null, ["string", "string"]);
  public addTextToDocument: (
    idterm: string,
    withoutpositions: boolean,
    text: string
  ) => void = Module.cwrap("addTextToDocument", null, [
    "string",
    "boolean",
    "string",
  ]);
  public getDocIdFromUniqueIdTerm: (idterm: string) => number = Module.cwrap(
    "getDocIdFromUniqueIdTerm",
    "number",
    ["string"]
  );

  public getStringValue(docid, slot): string {
    const $ret = Module._malloc(1024);
    Module._getStringValue(docid, slot, $ret);
    const ret = Module.UTF8ToString($ret);
    Module._free($ret);
    return ret;
  }

  public queryXapianIndex(querystring, offset, maxresults): Array<string> {
    const $searchResults = Module._malloc(4 * maxresults);
    Module.HEAP8.set(new Uint8Array(maxresults * 4), $searchResults);

    const $queryString = emAllocateString(querystring);
    const $resultIdTerm = Module._malloc(128);

    const hits = Module._queryIndex(
      $queryString,
      $searchResults,
      offset,
      maxresults
    );
    // console.log(hits);
    const results = new Array();
    for (let n = 0; n < hits; n++) {
      const docid = Module.getValue($searchResults + n * 4, "i32");
      Module._getDocumentData(docid, $resultIdTerm);
      results.push({
        docid: docid,
        data: Module.UTF8ToString($resultIdTerm),
      });
    }
    Module._free($searchResults);
    Module._free($queryString);
    Module._free($resultIdTerm);
    return results;
  }

  public getDocumentData(docid) {
    const $docdata = Module._malloc(1024);
    Module._getDocumentData(docid, $docdata);
    const ret = Module.UTF8ToString($docdata);
    Module._free($docdata);
    return ret;
  }
}
