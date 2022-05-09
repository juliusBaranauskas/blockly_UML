const DEFAULT_VISIBILITY = "private";



function parseXmlByAttr(element, tagName, attrName, attrValue) {
  if (!tagName || !attrName || !attrValue)
    return undefined;

  let el = Array.from(element.getElementsByTagName(tagName)).filter(el => el.attributes.getNamedItem(attrName).value === attrValue);
  if (!el || el.length === 0)
    return undefined;

  return el;
}

function parseXmlClassType(element) {
  let typeEl = parseXmlByAttr(element, "field", "name", "class_type");
  if (!typeEl)
    return "";
  typeEl = typeEl[0];

  return typeEl.textContent;
}

function parseXmlClassName(element) {
  let nameEl = parseXmlByAttr(element, "field", "name", "class_name_input");
  if (!nameEl)
    return ""; // assign default name that is available [ClassXX]
  nameEl = nameEl[0];

  return nameEl.textContent;
}

function parseParameter(element) {
  let parameterTypeEl = parseXmlByAttr(element, "field", "name", "parameter_type");
  if (!parameterTypeEl)
    return undefined; // assign default name that is available [ClassXX]
  parameterTypeEl = parameterTypeEl[0];
  let parameterType = parameterTypeEl.textContent;

  // Get parameter name
  let parameterName = "";
  let nameEl = parseXmlByAttr(element, "field", "name", "parameter_name_input");
  if (!nameEl)
    return undefined
  nameEl = nameEl[0];
  parameterName = nameEl.textContent;

  // let nameTextEl = parseXmlByAttr(nameEl, "field", "name", "TEXT");
  // if (!nameTextEl)
  //   return undefined;
  // nameTextEl = nameTextEl[0];
  // parameterName = nameTextEl.textContent;

  return {
    name: parameterName,
    type: parameterType
  }
}

function getVisibilityFromElement(element) {
  let visibilityTypeEl = parseXmlByAttr(element, "field", "name", "element_visibility");
  if (visibilityTypeEl) {
    visibilityTypeEl = visibilityTypeEl[0];
    return visibilityTypeEl.textContent;
  }
  return undefined;
}

function parseMethod(method) {
  let methodRetTypeEl = parseXmlByAttr(method, "field", "name", "field_type");
  if (!methodRetTypeEl)
    return undefined; // assign default name that is available [ClassXX]
  methodRetTypeEl = methodRetTypeEl[0];
  let methodRetType = methodRetTypeEl.textContent;

  if (methodRetType === "custom_type") {
    // find if a custom type name is attached
    let typeEl = parseXmlByAttr(method, "value", "name", "method_type");
    if (typeEl) {
      typeEl = typeEl[0];
      let typeTextEl = parseXmlByAttr(typeEl, "field", "name", "TEXT");
      if (typeTextEl)
        methodRetType = typeTextEl[0].textContent;
    }
  }

  // Get method name
  let nameEl = parseXmlByAttr(method, "field", "name", "method_name_input");
  if (!nameEl)
    return undefined;
  nameEl = nameEl[0];

  let methodName = nameEl.textContent;

  // Get method visibility
  const methodVisibility = getVisibilityFromElement(method) ?? DEFAULT_VISIBILITY;

  // Get method staticness
  let methodIsStatic = false;
  let staticnessEl = parseXmlByAttr(method, "field", "name", "is_static_checkbox");
  if (staticnessEl) {
    staticnessEl = staticnessEl[0];
    methodIsStatic = staticnessEl.textContent === "TRUE";
  }

  // Get method parameters
  let parameters = [];
  let parametersEl = parseXmlByAttr(method, "statement", "name", "parameters");
  if (parametersEl) {
    parametersEl = parametersEl[0];

    let parameterElements = parseXmlByAttr(parametersEl, "block", "type", "function_parameter");
    parameterElements?.forEach(parameter => {
      const parsedParam = parseParameter(parameter);
      if (parsedParam)
        parameters.push(parsedParam);
    });
  }

  return {
    name: methodName,
    returnType: methodRetType,
    visibility: methodVisibility,
    parameters: parameters,
    isStatic: methodIsStatic
  }
}

function parseXmlMethods(element) {
  let methodsBlockEl = parseXmlByAttr(element, "statement", "name", "methods");
  if (!methodsBlockEl)
    return []; // assign default name that is available [ClassXX]
  methodsBlockEl = methodsBlockEl[0];
  
  let methods = parseXmlByAttr(methodsBlockEl, "block", "type", "class_method");
  if (!methods || methods.length === 0)
    return []; // assign default name that is available [ClassXX]
  
  let resultMethods = [];
  methods.forEach(method => {
    const parsedMethod = parseMethod(method);
    if (parsedMethod)
      resultMethods.push(parsedMethod);
  });
  
  return resultMethods;
}

function parseField(field) {
  let fieldTypeEl = parseXmlByAttr(field, "field", "name", "field_type");
  if (!fieldTypeEl)
    return undefined; // assign default name that is available [ClassXX]
  fieldTypeEl = fieldTypeEl[0];
  let fieldType = fieldTypeEl.textContent;

  // Get field name
  let nameEl = parseXmlByAttr(field, "field", "name", "field_name_input");
  if (!nameEl)
    return undefined;
  nameEl = nameEl[0];

  let fieldName = nameEl.textContent;

  // Get field visibility
  const fieldVisibility = getVisibilityFromElement(field) ?? DEFAULT_VISIBILITY;

  // Get field staticness
  let fieldIsStatic = false;
  let staticnessEl = parseXmlByAttr(field, "field", "name", "is_static_checkbox");
  if (staticnessEl) {
    staticnessEl = staticnessEl[0];
    fieldIsStatic = staticnessEl.textContent === "TRUE";
  }

  return {
    name: fieldName,
    returnType: fieldType,
    visibility: fieldVisibility,
    isStatic: fieldIsStatic
  }
}

function parseXmlFields(element) {
  let fieldsBlockEl = parseXmlByAttr(element, "statement", "name", "fields");
  if (!fieldsBlockEl)
    return [];
  fieldsBlockEl = fieldsBlockEl[0];

  let fields = parseXmlByAttr(fieldsBlockEl, "block", "type", "class_field");
  if (!fields)
    return [];
  
  let resultFields = [];
  fields.forEach(field => {
    const parsedField = parseField(field);
    if (parsedField)
      resultFields.push(parsedField);
  });
  
  return resultFields;
}


function parseXmlConnections(element, connectedClassId, hubId) {
  
  let connectionsEl = parseXmlByAttr(element, "statement", "name", "connections");
  if (!connectionsEl)
    return [];
  connectionsEl = connectionsEl[0];

  const allConns = parseXmlByAttr(connectionsEl, "block", "type", "connection");
  if (!allConns)
    return [];

  let connections = [];
  allConns.forEach(conn => {
    const connType = parseXmlByAttr(conn, "field", "name", "relationship_type")[0].textContent;
    const connCardinality = parseXmlByAttr(conn, "field", "name", "cardinality_dropdown")[0].textContent;
    const id = conn.attributes.getNamedItem("id").value;
    let isConnStart = true;
    let startEl = parseXmlByAttr(conn, "field", "name", "is_start_checkbox");
    if (startEl) {
      startEl = startEl[0];
      isConnStart = startEl.textContent === "TRUE";
    }
    
    let connected_to = parseXmlByAttr(conn, "field", "name", "connected_to");
    if (!!connected_to) {
      connected_to = connected_to[0].textContent
    }

    if (connected_to === connectedClassId)
      alert("Cannot connect to itself");
    
    connections.push({
      type: connType,
      cardinality: connCardinality,
      connectedClass: connectedClassId,
      connectorId: id,
      hubId: hubId,
      connection_to: connected_to,
      isStart: isConnStart
    });
  });

  return connections;
}

export const parseXMLClasses = (xml) => {

  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(xml, "text/xml");

  let classes = [];
  let hubMap = [];

  // find all conn_hubs
  const allHubs = parseXmlByAttr(xmlDoc, "block", "type", "connection_hub");

  // if a hub has a class, parse and add to [hub_id, class_id] map and classes list
  // else ignore hub (connectors should not be shown on it) and parse next
  if (allHubs) {
    console.log(`hubs count: ${allHubs.length}`);
    allHubs.forEach(hub => {
      const hubId = hub.attributes.getNamedItem("id").value;
      let hub_class = parseXmlByAttr(hub, "block", "type", "class");
      if (!hub_class)
        return;
      hub_class = hub_class[0];

      const classId = hub_class.attributes.getNamedItem("id").value;
      const classType = parseXmlClassType(hub_class);
      const name = parseXmlClassName(hub_class);
      const methods = parseXmlMethods(hub_class);
      const fields = parseXmlFields(hub_class);

      const classItem = {
        id: classId,
        name: name,
        methods: methods,
        fields: fields,
        classType: classType,
      }
      // console.log(classItem.name);

      const connections = parseXmlConnections(hub, classId, hubId);
      const connect_hub = {
        hubId: hubId,
        classId: classId,
        connections: connections
      }
      classItem["connect_hub"] = connect_hub;

      hubMap[hubId] = classId;
      classes.push(classItem);
    });
  }

  // find all classes
  let allClasses = Array.from(xmlDoc.getElementsByTagName("block")).filter(el => el.attributes.getNamedItem("type").value === "class");
  // let allClasses = parseXmlByAttr(xmlDoc, "block", "type", "class");

  const registeredClasses = classes.map(cl => cl.id);
  // filter out the ones already in map
  allClasses = allClasses.filter(curr => undefined === registeredClasses
                                                        .find(cl => cl === curr.attributes.getNamedItem("id").value));

  // if any classes are left, parse them and add to class list
  allClasses.forEach(element => {
    const name = parseXmlClassName(element);
    const methods = parseXmlMethods(element);
    const fields = parseXmlFields(element);
    const classId = element.attributes.getNamedItem("id").value;

    let classItem = {
      id: classId,
      name: name,
      methods: methods,
      fields: fields,
      connect_hub: undefined
    }
    classes.push(classItem);
  });

  return classes;
}
