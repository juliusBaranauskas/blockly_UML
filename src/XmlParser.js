const DEFAULT_VISIBILITY = "private";



function parseXmlByAttr(element, tagName, attrName, attrValue) {
  if (!tagName || !attrName || !attrValue)
    return undefined;

  let el = Array.from(element.getElementsByTagName(tagName)).filter(el => el.attributes.getNamedItem(attrName).value === attrValue);
  if (!el || el.length === 0)
    return undefined; // assign default name that is available [ClassXX]
  
  return el;
}

function parseXmlClassName(element) {
  let nameEl = parseXmlByAttr(element, "value", "name", "classname_joint");
  if (!nameEl)
    return ""; // assign default name that is available [ClassXX]
  nameEl = nameEl[0];

  let nameTextEl = parseXmlByAttr(nameEl, "field", "name", "TEXT");
  if (!nameTextEl)
    return "";

  nameTextEl = nameTextEl[0];
  return nameTextEl.textContent;
}

function parseParameter(element) {
  let parameterTypeEl = parseXmlByAttr(element, "field", "name", "parameter_type");
  if (!parameterTypeEl)
    return undefined; // assign default name that is available [ClassXX]
  parameterTypeEl = parameterTypeEl[0];
  let parameterType = parameterTypeEl.textContent;

  // Get parameter name
  let parameterName = "";
  let nameEl = parseXmlByAttr(element, "value", "name", "parameter_name");
  if (!nameEl)
    return undefined
  nameEl = nameEl[0];
  
  let nameTextEl = parseXmlByAttr(nameEl, "field", "name", "TEXT");
  if (!nameTextEl)
    return undefined;
  nameTextEl = nameTextEl[0];
  parameterName = nameTextEl.textContent;

  return {
    name: parameterName,
    type: parameterType
  }
}

function parseMethod(method) {
  let methodRetTypeEl = parseXmlByAttr(method, "field", "name", "field_type");
  if (!methodRetTypeEl)
    return undefined; // assign default name that is available [ClassXX]
  methodRetTypeEl = methodRetTypeEl[0];
  let methodRetType = methodRetTypeEl.textContent;

  // Get method name
  let nameEl = parseXmlByAttr(method, "value", "name", "method_name");
  if (!nameEl)
    return undefined; // assign default name that is available [ClassXX]
  nameEl = nameEl[0];

  let nameTextEl = parseXmlByAttr(nameEl, "field", "name", "TEXT");
  if (!nameTextEl)
    return undefined;

  nameTextEl = nameTextEl[0];
  let methodName = nameTextEl.textContent;

  // Get method visibility
  let methodVisibility = DEFAULT_VISIBILITY;
  let visibilityEl = parseXmlByAttr(method, "value", "name", "method_visibility");
  if (visibilityEl) {
    visibilityEl = visibilityEl[0];
    
    let visibilityTypeEl = parseXmlByAttr(visibilityEl, "field", "name", "element_visibility");
    if (visibilityTypeEl) {
      visibilityTypeEl = visibilityTypeEl[0];
      methodVisibility = visibilityTypeEl.textContent;
    }
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
    parameters: parameters
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
  let nameEl = parseXmlByAttr(field, "value", "name", "field_name");
  if (!nameEl)
    return undefined;
  nameEl = nameEl[0];
    
  let nameTextEl = parseXmlByAttr(nameEl, "field", "name", "TEXT");
  if (!nameTextEl)
    return undefined;
  nameTextEl = nameTextEl[0];

  let fieldName = nameTextEl.textContent;


  // Get field visibility
  let fieldVisibility = DEFAULT_VISIBILITY;
  let visibilityEl = parseXmlByAttr(field, "value", "name", "field_visibility");
  if (visibilityEl) {
    visibilityEl = visibilityEl[0];
    
    let visibilityTypeEl = parseXmlByAttr(visibilityEl, "field", "name", "element_visibility");
    if (visibilityTypeEl) {
      visibilityTypeEl = visibilityTypeEl[0];
      fieldVisibility = visibilityTypeEl.textContent;
    }
  }

  return {
    name: fieldName,
    returnType: fieldType,
    visibility: fieldVisibility
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
    if (parsedField);
      resultFields.push(parsedField);
  });
  
  return resultFields;
}

export const parseXMLClasses = (xmlClasses) => {
  let classes = [];
  xmlClasses.forEach(element => {
    let name = parseXmlClassName(element);
    let methods = parseXmlMethods(element);
    let fields = parseXmlFields(element);

    let classItem = {
      name: name,
      methods: methods,
      fields: fields
    }
    classes.push(classItem);
    console.log(classItem.name);
  });

  return classes;
}