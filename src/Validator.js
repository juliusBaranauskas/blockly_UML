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

// returns true if all methods in given class are unique
export const checkUniqueMethods = (aClass) => {

  return true;
}

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
      console.log("parentsIds");
      console.log(parentsIds);
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

  addInheritted() {

    this._classes.forEach(cl => {
      cl["inheritedFields"] = this.getInheritedFields(cl, new Set());
      cl["inheritedMethods"] = this.getInheritedMethods(cl, new Set());
    });

    /* {
      type: connType,
      cardinality: connCardinality,
      connectedClass: connectedClassId,
      connectorId: id,
      hubId: hubId,
      connection_to: connected_to,
    }; */

    // <path xmlns="http://www.w3.org/2000/svg" stroke="black" transform="translate(1000,300)" d=" M 0 0 L 255 108 L 375 -95" fill="none"></path>
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
}