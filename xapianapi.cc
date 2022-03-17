/* 
  Copyright (C) 2016-2018 Runbox Solutions AS (runbox.com).
  Copyright (C) 2022 ZXS Authors

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

  This file is based on Runbox 7 (Runbox Solutions AS) and was modified
  to search on Xapian indexes provided by ZIM files.
*/

#include <xapian.h>

#include <emscripten.h>
#include <cstdlib>
#include <climits>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <netinet/in.h>

using namespace std;

class DatabaseContainer
{
public:
  Xapian::Database db;
  Xapian::WritableDatabase dbw;
  Xapian::Database dbsinglefile;
  vector<Xapian::WritableDatabase> addedWritableDatabases;

  Xapian::RangeProcessor *rangeProcessor;

  DatabaseContainer()
  {
    rangeProcessor = NULL;
  }

  void openDatabaseAsWritable(const char *path)
  {
    dbw = Xapian::WritableDatabase(path, Xapian::DB_CREATE_OR_OPEN);
    db = dbw;
  }

  void openDatabaseAsReadOnly(const char *path)
  {
    db = Xapian::Database(path);
  }

  /**
   * Needs a writable database open before adding this.
   */
  void addSingleFileDatabase(const char *path)
  {
    dbsinglefile = Xapian::Database(fileno(fopen(path, "r")), Xapian::DB_OPEN);
    db.add_database(dbsinglefile);
  }

  /**
   * set value range for the query
   */
  void setStringValueRange(int valueRangeSlotNumber, const char *prefix)
  {
    rangeProcessor = new Xapian::RangeProcessor(valueRangeSlotNumber, prefix);
  }

  void clearValueRange()
  {
    if (rangeProcessor != NULL)
    {
      delete rangeProcessor;
      rangeProcessor = NULL;
    }
  }

  Xapian::WritableDatabase getWritableDatabaseForIdTerm(char *unique_term)
  {
    Xapian::WritableDatabase writabledatabase = dbw;
    Xapian::PostingIterator p = dbw.postlist_begin(unique_term);

    if (p != dbw.postlist_end(unique_term))
    {
      writabledatabase = dbw;
    }
    else
    {
      for (int i = 0; i < addedWritableDatabases.size(); i++)
      {
        Xapian::WritableDatabase partitionWritableDatabase = addedWritableDatabases[i];

        Xapian::PostingIterator p = partitionWritableDatabase.postlist_begin(unique_term);
        if (p != partitionWritableDatabase.postlist_end(unique_term))
        {
          writabledatabase = partitionWritableDatabase;
          break;
        }
      }
    }
    return writabledatabase;
  }

  Xapian::Document getDocumentByUniqueTerm(char *unique_term, Xapian::WritableDatabase *writabledatabasePtr)
  {
    Xapian::Document doc;
    Xapian::PostingIterator p = dbw.postlist_begin(unique_term);

    if (p != dbw.postlist_end(unique_term))
    {
      doc = dbw.get_document(*p);
      *writabledatabasePtr = dbw;
    }
    else
    {
      for (int i = 0; i < addedWritableDatabases.size(); i++)
      {
        Xapian::WritableDatabase partitionWritableDatabase = addedWritableDatabases[i];

        Xapian::PostingIterator p = partitionWritableDatabase.postlist_begin(unique_term);
        if (p != partitionWritableDatabase.postlist_end(unique_term))
        {

          doc = partitionWritableDatabase.get_document(*p);
          *writabledatabasePtr = partitionWritableDatabase;
          break;
        }
      }
    }
    return doc;
  }
};

DatabaseContainer *dbc;

extern "C"
{
  void EMSCRIPTEN_KEEPALIVE initXapianIndex(const char *path)
  {
    dbc = new DatabaseContainer();
    dbc->openDatabaseAsWritable(path);

    cout << "Xapian writable database opened" << endl;
  }

  void EMSCRIPTEN_KEEPALIVE initXapianIndexReadOnly(const char *path)
  {
    dbc = new DatabaseContainer();
    dbc->openDatabaseAsReadOnly(path);

    cout << "Xapian readonly database opened" << endl;
  }

  /**
   * This will add a single file xapian database to an existing database
   * Must init xapian index with method above before calling this
   */
  void EMSCRIPTEN_KEEPALIVE addSingleFileXapianIndex(const char *path)
  {
    dbc->addSingleFileDatabase(path);
    cout << "Xapian single file database added" << endl;
  }

  int EMSCRIPTEN_KEEPALIVE getDocCount()
  {
    return dbc->db.get_doccount();
  }

  int EMSCRIPTEN_KEEPALIVE getLastDocid()
  {
    return dbc->db.get_lastdocid();
  }

  void EMSCRIPTEN_KEEPALIVE deleteDocumentByUniqueTerm(char *unique_term)
  {
    Xapian::WritableDatabase dbw = dbc->getWritableDatabaseForIdTerm(unique_term);
    dbw.delete_document(unique_term);
  }

  void EMSCRIPTEN_KEEPALIVE closeDatabase()
  {
    dbc->db.close();
    for (Xapian::WritableDatabase dbw : dbc->addedWritableDatabases)
    {
      dbw.close();
    }
    delete dbc;
    cout << "Database closed" << endl;
  }

  void EMSCRIPTEN_KEEPALIVE reloadDatabase()
  {
    dbc->db.reopen();
    cout << "Database reopened" << endl;
  }

  void EMSCRIPTEN_KEEPALIVE commitXapianUpdates()
  {
    dbc->dbw.commit();
    for (Xapian::WritableDatabase dbw : dbc->addedWritableDatabases)
    {
      dbw.commit();
    }
  }

  void EMSCRIPTEN_KEEPALIVE compactDatabase()
  {
    dbc->db.compact("xapianglasscompact", Xapian::DBCOMPACT_SINGLE_FILE);
  }

  void EMSCRIPTEN_KEEPALIVE compactToWritableDatabase(char *path)
  {
    dbc->db.compact(path);
  }

  void EMSCRIPTEN_KEEPALIVE getDocumentData(int id, char *returned_idterm)
  {
    // cout << "get doc data: " <<   db.get_document(id).get_data()  <<endl;
    strcpy(returned_idterm, dbc->db.get_document(id).get_data().c_str());
  }

  void EMSCRIPTEN_KEEPALIVE getStringValue(int docid, int slot, char *returnstring)
  {
    strcpy(returnstring, dbc->db.get_document(docid).get_value(slot).c_str());
  }

  void EMSCRIPTEN_KEEPALIVE setStringValue(int docid, int slot, char *valuestring)
  {
    Xapian::Document doc = dbc->db.get_document(docid);
    doc.add_value(slot, valuestring);
    dbc->dbw.replace_document(docid, doc);
  }

  double EMSCRIPTEN_KEEPALIVE getNumericValue(int docid, int slot)
  {
    return Xapian::sortable_unserialise(dbc->db.get_document(docid).get_value(slot));
  }

  void EMSCRIPTEN_KEEPALIVE addTermToDocument(char *unique_id_term, char *term)
  {
    Xapian::WritableDatabase writabledatabase;
    Xapian::Document doc = dbc->getDocumentByUniqueTerm(unique_id_term, &writabledatabase);
    doc.add_term(term);
    writabledatabase.replace_document(unique_id_term, doc);
  }

  void EMSCRIPTEN_KEEPALIVE removeTermFromDocument(char *unique_id_term, char *term)
  {
    Xapian::WritableDatabase writabledatabase;
    Xapian::Document doc = dbc->getDocumentByUniqueTerm(unique_id_term, &writabledatabase);
    doc.remove_term(term);
    writabledatabase.replace_document(unique_id_term, doc);
  }

  void EMSCRIPTEN_KEEPALIVE addTextToDocument(char *unique_id_term, bool without_positions, char *text)
  {
    Xapian::WritableDatabase writabledatabase;
    Xapian::Document doc = dbc->getDocumentByUniqueTerm(unique_id_term, &writabledatabase);

    // Set up a TermGenerator that we'll use in indexing.
    Xapian::TermGenerator termgenerator;

    termgenerator.set_max_word_length(32);
    termgenerator.set_document(doc);
    if (without_positions)
    {
      termgenerator.index_text_without_positions(text);
    }
    else
    {
      termgenerator.index_text(text);
    }
    writabledatabase.replace_document(unique_id_term, doc);
  }

  /**
   * set value range for the query
   */
  void EMSCRIPTEN_KEEPALIVE setStringValueRange(int valueRangeSlotNumber, char *prefix)
  {
    dbc->setStringValueRange(valueRangeSlotNumber, prefix);
  }

  void EMSCRIPTEN_KEEPALIVE clearValueRange()
  {
    dbc->clearValueRange();
  }

  int EMSCRIPTEN_KEEPALIVE getDocIdFromUniqueIdTerm(char *unique_id_term)
  {
    Xapian::PostingIterator p = dbc->db.postlist_begin(unique_id_term);

    if (p != dbc->db.postlist_end(unique_id_term))
    {
      return *p;
    }
    else
    {
      return 0;
    }
  }

  int EMSCRIPTEN_KEEPALIVE documentTermList(int docid)
  {
    Xapian::Document doc = dbc->db.get_document(docid);
    int numterms = 0;

    Xapian::TermIterator termitbeg = doc.termlist_begin();
    Xapian::TermIterator termitend = doc.termlist_end();

    EM_ASM(Module['documenttermlistresult'] = []);

    for (Xapian::TermIterator tm = termitbeg; tm != termitend; ++tm)
    {
      EM_ASM_({
        Module['documenttermlistresult'].push(UTF8ToString($0));
      },
              (*tm).c_str());
      numterms++;
    }

    return numterms;
  }

  /**
   * return terms starting with X of given document id
   */
  int EMSCRIPTEN_KEEPALIVE documentXTermList(int docid)
  {
    Xapian::Document doc = dbc->db.get_document(docid);
    int numterms = 0;

    Xapian::TermIterator termitbeg = doc.termlist_begin();
    Xapian::TermIterator termitend = doc.termlist_end();

    EM_ASM(Module['documenttermlistresult'] = []);

    for (Xapian::TermIterator tm = termitbeg; tm != termitend; ++tm)
    {
      if ((*tm).at(0) == 'X')
      {
        EM_ASM_({
          Module['documenttermlistresult'].push(UTF8ToString($0));
        },
                (*tm).c_str());
        numterms++;
      }
    }

    return numterms;
  }

  /**
   * Copy termlist of given termprefix into
   */
  int EMSCRIPTEN_KEEPALIVE termlist(char *termprefix)
  {
    std::string prefix(termprefix);
    Xapian::TermIterator termitbeg = dbc->db.allterms_begin(prefix);
    Xapian::TermIterator termitend = dbc->db.allterms_end(prefix);

    int numterms = 0;

    for (Xapian::TermIterator tm = termitbeg; tm != termitend; ++tm)
    {
      std::string term = (*tm).substr(prefix.length());
      EM_ASM_({termlistresult.push(UTF8ToString($0))}, term.c_str());
      numterms++;
    }

    return numterms;
  }

  int EMSCRIPTEN_KEEPALIVE queryIndex(char *searchtext, int results[], int offset, int maxresults)
  {
    if (dbc == 0)
    {
      return 0;
    }

    Xapian::QueryParser queryparser;
    queryparser.set_database(dbc->db);

    try
    {
      Xapian::Query query = queryparser.parse_query(searchtext, Xapian::QueryParser::FLAG_DEFAULT | Xapian::QueryParser::FLAG_PARTIAL);

      Xapian::Enquire enquire(dbc->db);
      enquire.set_query(query);

      Xapian::MSet mset = enquire.get_mset(offset, maxresults);

      int n = 0;
      for (Xapian::MSetIterator m = mset.begin(); m != mset.end(); ++m)
      {
        results[n++] = m.get_document().get_docid();
      }
      return n;
    }
    catch (const Xapian::QueryParserError e)
    {
      cout << "Invalid query: " << searchtext << endl;
      return 0;
    }
  }
}
