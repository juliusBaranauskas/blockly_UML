/* Connection {
    classBegin{
        id,
        cardinality
    },
    classEnd{
        id,
        cardinality
    },
    addedFromBegin
    Type
}*/

const connectionsEqual = (c1, c2) => {
  return c1.classBegin.id === c2.classBegin.id
   && c1.classEnd.id === c2.classEnd.id
   && c1.addedFromBegin === c2.addedFromBegin;
}

export const checkDuplicateConnections = (connections) => {
  const warnings = [];
  for (let i = 0; i < connections.length-1; i++) {
    for (let j = i+1; j < connections.length; j++) {
      if (connectionsEqual(connections[i], connections[j])) {
        warnings.push({ first: connections[i].classBegin.id, second: connections[i].classEnd.id });
      }
    }
  }
  return warnings;
}

export const filterDuplConnections = (connections) => {
  const conns = new Map();
  const confirmedConns = new Map();
  for (const conn of connections) {
    const key = `${conn.classBegin.id};${conn.classEnd.id};${conn.type}`;
    if (!conns.has(key)) {
      conns.set(key, conn);
    } else {
      // begin and end already the same. Check whether addedFromBegin differs to find a tuple
      if (!connectionsEqual(conns.get(key), conn)) {
        confirmedConns.set(key, conn);
      }
    }
  }
  return [...confirmedConns.values()];
}

/*
  FIELD {
    name:
    returnType:
    visibility:
    isStatic: 
  }

  METHOD {
    name:
    returnType:
    visibility:
    parameters:
    isStatic: 
  }
*/

export const validateClass = (cl) => {
  const warnings = {
    duplicateFields: new Set(),
    duplicateMethods: new Set(),

  };

  // check if there are no duplicate fields
  const fields = new Set();
  cl.fields.forEach(field => {
    if (fields.has(field.name)) {
      warnings.duplicateFields.add(field.name);
    } else {
      fields.add(field.name);
    }
  });

  // check if there are no duplicate method definitions
  const methods = new Set();
  cl.methods.forEach(method => {
    const paramsString = !!method.parameters && method.parameters.length > 0 ? method.parameters?.reduce((accum, param) => `${accum}.${param.type}`, "") : "";
    const methodKey = `${method.name}.${paramsString}`;
    if (methods.has(methodKey)) {
      warnings.duplicateMethods.add(method.name);
    } else {
      methods.add(methodKey);
    }
  });

  return warnings;
}


export class Validator {
  
  constructor(classes, conns) {
    this._classes = classes;
    this._connections = conns;
  }

  static isInheritanceRelationship(connectionType) {
    switch (connectionType) {
      case "GENERALIZATION":
      case "REALIZATION":
        return true;
      default:
        return false;
    }
  }

  getClasses() {
    return this._classes;
  }

  addParents() {
    this._classes = this._classes.map(cl => {
      const parentsIds = this._connections.filter(conn => conn.classBegin.id === cl.id && Validator.isInheritanceRelationship(conn.type)).map(conn => conn.classEnd.id);
      const parentClasses = this._classes.filter(cls => parentsIds?.includes(cls.id)).map(cl => cl.id);
      return {
        ...cl,
        parentClasses
      }
    });
  }

  /**
   * 
   * @param {ClassDef} cl Class to retrieve inherited fields for
   * @param {Array<Connection>} conns List of class connections
   * @param {Set<string>} classesVisited Previously visited classes to break the cycle if there's a cyclic dep
   * @returns fields inherited by class
   */
  getInheritedFields(cl, classesVisited) {
    
    if (classesVisited.has(cl.id)) {
      // break the cycle - cycle of dependencies detected
      return undefined;
    }

    classesVisited.add(cl.id);
    if (cl.inheritedFields !== undefined) {
      return cl.inheritedFields;
    }

    const parents = cl.parentClasses.map(prnt => this._classes.find(cls => cls.id === prnt));
    cl.inheritedFields = parents?.flatMap(parent => {
      const inhFields = this.getInheritedFields(parent, classesVisited);
      return [...(inhFields || []), ...(parent.fields || [])];
    }) ?? [];
    return cl.inheritedFields;
  }

  getInheritedMethods(cl, classesVisited) {
    if (classesVisited.has(cl.id)) {
      // break the cycle - cycle of dependencies detected
      return undefined;
    }

    classesVisited.add(cl.id);
    if (cl.inheritedMethods !== undefined) {
      return cl.inheritedMethods;
    }

    const parents = cl.parentClasses.map(prnt => this._classes.find(cls => cls.id === prnt));
    cl.inheritedMethods = parents?.flatMap(parent => {
      const inhMethods = this.getInheritedMethods(parent, classesVisited);
      return [...(inhMethods || []), ...(parent.methods || [])];
    }) ?? [];
    return cl.inheritedMethods;
  }

  getAncestors(cl, classesVisited) {
    if (classesVisited.has(cl.id)) {
      // break the cycle - cycle of dependencies detected
      return undefined;
    }

    classesVisited.add(cl.id);
    if (cl.ancestors !== undefined) {
      return cl.ancestors;
    }

    const parents = cl.parentClasses.map(prnt => this._classes.find(cls => cls.id === prnt));
    cl.ancestors = parents?.flatMap(parent => {
      const ancestors = this.getAncestors(parent, classesVisited);
      return [...(ancestors || []), parent];
    }) ?? [];
    return cl.ancestors;
  }

  addInheritted() {

    this._classes.forEach(cl => {
      cl["inheritedFields"] = this.getInheritedFields(cl, new Set());
      cl["inheritedMethods"] = this.getInheritedMethods(cl, new Set());
      cl.ancestors = this.getAncestors(cl, new Set());
    });
    console.log("ADDED INHERITS:");
    console.log(this._classes);
    /* {
      type: connType,
      cardinality: connCardinality,
      connectedClass: connectedClassId,
      connectorId: id,
      hubId: hubId,
      connection_to: connected_to,
    }; */
  }

  checkDuplicateFields(cl) {
    const warnings = [];
    const fields = new Set();

    cl.fields.forEach(field => fields.add(field.name));

    cl.inheritedFields?.forEach(field => {
      if (fields.has(field.name)) {
        warnings.push(`Class cannot inherit fields with non-unique names. At class <${cl.name}> and field <${field.name}>`);
        return;
      }

      fields.add(field.name);
    })

    return warnings;
  }

  checkDuplicateMethods(cl) {
    const warnings = [];
    const methods = new Set();

    cl.methods.forEach(method => {
      const paramsString = !!method.parameters && method.parameters.length > 0 ? method.parameters?.reduce((accum, param) => `${accum}.${param.type}`, "") : "";
      const methodKey = `${method.name}.${paramsString}`;
      methods.add(methodKey);
    });

    cl.inheritedMethods?.forEach(method => {
      const paramsString = !!method.parameters && method.parameters.length > 0 ? method.parameters?.reduce((accum, param) => `${accum}.${param.type}`, "") : "";
      const methodKey = `${method.name}.${paramsString}`;
      if (methods.has(methodKey)) {
        warnings.push(`Class cannot inherit methods with non-unique name and parameter list combination. At class <${cl.name}> and method <${method.name}> with parameters <${paramsString}>`);
        return;
      }

      methods.add(methodKey);
    })
    
    return warnings;
  }

  validateConnectionTypes() {
    const warnings = [];
    this._connections.forEach(conn => {
      switch (conn.type) {
        case "REALIZATION":
          const cls = this._classes.find(c => c.id === conn.classEnd.id);
          if (cls.classType !== "INTERFACE_TYPE" && cls.classType !== "ABSTRACT_TYPE") {
            const beginClass = this._classes.find(c => c.id === conn.classBegin.id);
            warnings.push(`Realization relationship cannot end with non-abstract model element type. Either change the type of <${cls.name}> or change the relationship type between it and <${beginClass.name}>`);
          }
          break;
        case "GENERALIZATION":
          const endClass = this._classes.find(c => c.id === conn.classEnd.id);
          const beginClass = this._classes.find(c => c.id === conn.classBegin.id);
          if (endClass.classType !==  beginClass.classType) {
            warnings.push(`Generalization relationship cannot have different model element types. Either change the type of <${endClass.name}> or <${beginClass.name}> or change the relationship type between them`);
          }
          break;
        case "COMPOSITION":
          break;
        case "AGGREGATION":
          break;
        default:
          break;
      }
    });
    return warnings;
  }

  validateInterfaces() {
    const warnings = [];
    this._classes.forEach(cl => {
      if (cl.classType === "INTERFACE_TYPE" && cl.fields.length !== 0) {
        warnings.push(`Interfaces cannot have fields. Either change the type of <${cl.name}> to class or abstract class or remove all of it's fields`);
      }
    });
    return warnings;
  }

  checkDiamond() {
    const warnings = [];
    this._classes.forEach(cl => {
      const res = groupBy(cl.ancestors, "id");
      console.log("Checking DMD");
      console.log(res);
      for (const prop in res) {
        if (res[prop].length > 1) {
          warnings.push(`Class <${cl.name}> inherits from the same base class <${this._classes.find(cl => cl.id === prop).name}> more than once. Remove the diamond inheritance or continue at your own risk.`);
        }
      }
    });
    return warnings;
  }
}

const groupBy = function(data, key) { // `data` is an array of objects, `key` is the key (or property accessor) to group by
  // reduce runs this anonymous function on each element of `data` (the `item` parameter,
  // returning the `storage` parameter at the end
  return data.reduce(function(storage, item) {
    // get the first instance of the key by which we're grouping
    var group = item[key];
    
    // set `storage` for this instance of group to the outer scope (if not empty) or initialize it
    storage[group] = storage[group] || [];
    
    // add this item to its group within `storage`
    storage[group].push(item);
    
    // return the updated storage to the reduce function, which will then loop through the next 
    return storage; 
  }, {}); // {} is the initial value of the storage
};