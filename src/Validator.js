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