export class Table{
  constructor(){
    this.tableName, 
    this.attribute, 
    this.attributeType, 
    this.attributeLength, 
    this.insertValue = null,
    this.queryValue = null,
    this.updateValue = null
    this.data 
  }

  // create table
  createTable(data){
    // data = { tableName:	"Demo", 
    //          attribute:		[attribute1, attribute2], 
    //          attributeType:	[type of attribute1, type of attribute2], 
    //          attributeLength:	[length of attribute1, length of attribute2] }

    // console.log("Create table with data(Table): "+data)
    this.tableName = data.tableName
    this.attribute = data.attribute
    this.attributeType = data.attributeType
    this.areEqualLength = data.attributeLength
    
    var sql = "CREATE TABLE IF NOT EXISTS " + data.tableName + "("
    
    // check whether equal length
    const areEqualLength = data.attribute.length === data.attributeType.length && data.attributeType.length === data.attributeLength.length;
    if (areEqualLength){
      for (let i=0; i < data.attribute.length; i++){
        if (i !== data.attribute.length-1){
          sql = sql + data.attribute[i] + " " + data.attributeType[i] + "(" + data.attributeLength[i] + "),"
        }else{
          sql = sql + data.attribute[i] + " " + data.attributeType[i] + "(" + data.attributeLength[i] + ")"
        }
      }
    }
    
    sql = sql + ");"

    console.log("createdTable(Table): "+sql);
    // return sql syntax to  create table
    return sql
  }

  // drop table
  dropTable(){
    var sql = "DROP TABLE "+ this.tableName
    // console.log("dropTable(Table): " + sql)
    return sql
  }

  // insert row
  create(data){
    // data = ["attribute1 value", "attribute2 value"]
    // console.log(this.attribute)

    var sql = "INSERT INTO "+ this.tableName + " ("
    // attribute name
    for (let i=0; i < this.attribute.length; i++){
      if (i !== this.attribute.length-1){
        sql = sql + String(this.attribute[i]) + ","
      }else{
        sql = sql +  String(this.attribute[i]) + ")"
      }
    }
    sql = sql + " VALUES ("
    // input value
    for (let i=0; i < data.length; i++){
      if (i !== data.length-1){
        sql = sql + "\"" + data[i] + "\"" +  ","
      }else{
        sql = sql + "\"" + data[i] + "\"" +  ");"
      }
    }
    console.log("createRow(Table): "+sql)
    return sql
  }
  
  // query tabel
  queryAll(){
    var sql = "SELECT * FROM "+ this.tableName
    console.log("queryTable(Table): " + sql)
    return sql
  }

  // update
  // delete
}

