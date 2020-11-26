import { SQLite } from 'expo';

const DB_NAME = 'onrun.db';
let db = null;

const Achievement_SCHEMA = 'achievements';

const AchievementSchema = {
  name: Achievement_SCHEMA,
  primary_keys: ['EntryId'],
  properties: {
    status: 'integer',
    stateProvId: 'integer?',
    oveRank: 'integer',
    ageRank: 'integer',
    result: 'time',
    courseDistance: 'real',
    eventDate: 'datetime',
    category: 'string?',
    city: 'string?',
    genRank: 'integer',
    genRankTotal: 'integer',
    country: 'string?',
    age: 'integer?',
    ageRankTotal: 'integer?',
    eventName: 'string',
    state: 'string?',
    EntryId: 'integer',
    gender: 'char',
    oveRankTotal: 'integer',
  }
}
// TODO: Should be moved to an individual lib
function convertToSqliteType(type){
  types = {
    'string': 'TEXT',
    'integer': 'INTEGER',
    'double': 'REAL',
    'char': 'CHARACTER',
    'datetime': 'TEXT',
    'time': 'TEXT',
  }
  return types[type.toLowerCase()];
}

function generateCreateStatement(schema,ifNotExist=true){
  // TODO: Should check the schema
  const ifNotExistString = ifNotExist ? 'IF NOT EXISTS' : "";
  const tableName = schema.name;
  const columns = [];
  for(col in schema.properties){
    let name = col;
    let property = AchievementSchema.properties[name];
    let notNull = property.search(/[?]$/) === -1;
    let type =  convertToSqliteType(notNull ? property :  property.slice(0, -1));
    let notNullString = notNull ? "NOT NULL" : "";
    columns.push([name,type,notNullString].join(' '));
  }
  // TODO: Should use a string formating
  return 'CREATE TABLE {0} {1} ({2},PRIMARY KEY ({3}));'.format(
    ifNotExistString,
    tableName,
    columns.join(' , '),
    schema.primary_keys.join(',')
  )
}

export function openDatabase(){
  return new Promise((resolve,reject) => {
    if(db === null){
      db = SQLite.openDatabase(DB_NAME);
    }
    resolve();
  });
}

export function createTables(){
  const tables = [Achievement_SCHEMA];
  return new Promise((resolve,reject)=>{
    if(db===null)reject();
    db.transaction(tx => {
      for(table in tables){
        tx.executeSql(generateCreateStatement(table));
      }
    },null,resolve,reject);
  });
}

export function init(){
  return Promise.all([openDatabase(),createToDoTable()]);
}


// TODO: Should change
export function createToDoTable(){
  return new Promise((resolve,reject)=>{
    if(db===null)reject();
    console.log('table is going to be created');
    db.transaction(tx => {
      tx.executeSql(
        'create table if not exists items (id integer primary key not null, done int, value text);'
      );
    },null,resolve,reject);
  });
}

export function readToDo(){
  db.transaction(tx => {
    tx.executeSql('select * from items', [], (_, { rows }) =>
      console.log(JSON.stringify(rows))
    );
  });
}
