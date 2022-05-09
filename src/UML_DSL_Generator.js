
const getVisibilityModifier = (visibilityString) => {
  switch (visibilityString) {
    case "public":
      return '+';
    case "protected":
      return '#';
    case "package":
      return '~'
    case "private":
    default:
      return '-';
  }
}

const connTypeToPlantUML = (connType) => {
  // ["ASSOCIATION"],"BIDIR_ASSOCIATION"],"AGGREGATION"],"COMPOSITION"],"GENERALIZATION"],"REALIZATION"],"DEPENDENCY"]]
  switch (connType) {
    case "ASSOCIATION":
      return "-->";
    case "BIDIR_ASSOCIATION":
      return "--";
    case "AGGREGATION":
      return "--o";
    case "COMPOSITION":
      return "--*";
    case "GENERALIZATION":
      return "--|>";
    case "REALIZATION":
      return "..|>";
    case "DEPENDENCY":
      return "..>";
    default:
      return "";
  }
}

export const generateUMLForClass = (classDescr) => {
  let umlString = ""
  switch (classDescr.classType) {
    case "ABSTRACT_TYPE":
      umlString = "abstract class "
      break;
    case "INTERFACE_TYPE":
      umlString = "interface ";
      break;
    default:
      umlString = "class "
      break;
  }
  let indent = "  ";
  umlString = umlString.concat(`${classDescr.name} {\n`);
  // concat element and methods
  classDescr.methods?.forEach(method => {
    let params = "";
    method.parameters.forEach(param => {
      params = params.concat(`${param.type} ${param.name},`)
    });
    if (params.length !== 0) {
      params = params.substring(0, params.length-1);
    }

    const visibility = getVisibilityModifier(method.visibility);
    umlString = umlString.concat(`${indent}${visibility}${method.returnType} ${method.name}(${params})\n`);
  });

  classDescr.fields?.forEach(field => {
    const visibility = getVisibilityModifier(field.visibility);
    umlString = umlString.concat(`${indent}${visibility}${field.returnType} ${field.name}\n`);
  });
  umlString = umlString.concat('}');
  return umlString;
}

export const getConnectionUMLString = (connections, classDefs) => {
  let UMLstr = "";
  connections.forEach(conn => {
    UMLstr += `${classDefs.get(conn.classBegin.id).name} ${connTypeToPlantUML(conn.type)} ${classDefs.get(conn.classEnd.id).name}\n`;
  });

  return UMLstr;
}