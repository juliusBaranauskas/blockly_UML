import Blockly from 'blockly';

// var HtmlGenerator = new Blockly.Generator('HTML');

Blockly.JavaScript.ORDER_ATOMIC = 0;
Blockly.JavaScript.ORDER_NONE = 0;

Blockly.JavaScript.init = function(workspace) {};
Blockly.JavaScript.finish = function(code) {return code;};

Blockly.JavaScript.scrub_ = function(block, code) {
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = Blockly.JavaScript.blockToCode(nextBlock);
  return code + nextCode;
};


Blockly.Blocks['class'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Type")
        .appendField(new Blockly.FieldDropdown([["Class","CLASS_TYPE"], ["Abstract class","ABSTRACT_TYPE"], ["Interface","INTERFACE_TYPE"]]), "class_type");
    this.appendDummyInput()
        .appendField("Name")
        .appendField(new Blockly.FieldTextInput("MyClass"), "class_name_input");
    this.appendStatementInput("fields")
        .setCheck("class_field")
        .appendField("Fields");
    this.appendStatementInput("methods")
        .setCheck("class_method")
        .appendField("Methods");
    this.setInputsInline(false);
    this.setOutput(true, "class");
    this.setColour(75);
 this.setTooltip("Create a definition of a class/interface");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['class'] = function(block) {
  // var value_classname_joint = Blockly.JavaScript.valueToCode(block, 'classname_joint', Blockly.JavaScript.ORDER_ATOMIC);
  // var statements_methods = Blockly.JavaScript.statementToCode(block, 'methods');
  // var statements_fields = Blockly.JavaScript.statementToCode(block, 'fields');
  // TODO: Assemble JavaScript into code variable.
  var code = 'A class';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['class_field'] = {
    init: function() {
      this.appendDummyInput("field_name")
        .appendField("Field name")
        .appendField(new Blockly.FieldTextInput("fieldName"), "field_name_input");
      this.appendValueInput("field_type")
          .setCheck("String")
          .appendField("Type")
          .appendField(new Blockly.FieldDropdown([["custom","custom_type"], ["boolean","bool"], ["string","String"], ["float","float"], ["char","char"], ["int","int"], ["double","double"]]), "field_type")
          .appendField("| or custom ->");
      this.appendDummyInput("element_visibility")
          .appendField("Visibility")
          .appendField(new Blockly.FieldDropdown([["public","public"], ["protected","protected"], ["private","private"], ["package","package"]]), "element_visibility");
      this.appendDummyInput("is_static")
          .appendField("Is static checkbox")
          .appendField(new Blockly.FieldCheckbox("FALSE"), "is_static_checkbox");
      this.setInputsInline(false);
      this.setPreviousStatement(true, "class_field");
      this.setNextStatement(true, "class_field");
      this.setColour(150);
   this.setTooltip("Add a field for the class");
   this.setHelpUrl("");
    }
};

Blockly.JavaScript['class_field'] = function(block) {
    // var value_field_name = Blockly.JavaScript.valueToCode(block, 'field_name', Blockly.JavaScript.ORDER_ATOMIC);
    // var dropdown_field_type = block.getFieldValue('field_type');
    // var value_field_type = Blockly.JavaScript.valueToCode(block, 'field_type', Blockly.JavaScript.ORDER_ATOMIC);
    // var value_field_visibility = Blockly.JavaScript.valueToCode(block, 'field_visibility', Blockly.JavaScript.ORDER_ATOMIC);
    // var value_is_static = Blockly.JavaScript.valueToCode(block, 'is_static', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    var code = 'A field';
    return code;
};

Blockly.Blocks['class_method'] = {
    init: function() {
      this.appendDummyInput("method_name")
        .appendField("Method name")
        .appendField(new Blockly.FieldTextInput("methodName"), "method_name_input");
      this.appendValueInput("method_type")
          .setCheck("String")
          .appendField("Returns")
          .appendField(new Blockly.FieldDropdown([["custom","custom_type"], ["void","void"], ["boolean","bool"], ["string","String"], ["float","float"], ["char","char"], ["int","int"], ["double","double"]]), "field_type")
          .appendField("| or custom ->");
      this.appendStatementInput("parameters")
          .setCheck("function_parameter")
          .appendField("Parameters");
      this.appendDummyInput("element_visibility")
          .appendField("Visibility")
          .appendField(new Blockly.FieldDropdown([["public","public"], ["protected","protected"], ["private","private"], ["package","package"]]), "element_visibility");
      this.appendDummyInput("is_static")
          .appendField("Is static checkbox")
          .appendField(new Blockly.FieldCheckbox("FALSE"), "is_static_checkbox");
      this.setPreviousStatement(true, "class_method");
      this.setNextStatement(true, "class_method");
      this.setColour(10);
   this.setTooltip("Create a method definition");
   this.setHelpUrl("");
    }
  };

Blockly.JavaScript['class_method'] = function(block) {
    // var value_method_name = Blockly.JavaScript.valueToCode(block, 'method_name', Blockly.JavaScript.ORDER_ATOMIC);
    // var dropdown_field_type = block.getFieldValue('field_type');
    // var value_method_type = Blockly.JavaScript.valueToCode(block, 'method_type', Blockly.JavaScript.ORDER_ATOMIC);
    // var statements_parameters = Blockly.JavaScript.statementToCode(block, 'parameters');
    // var value_method_visibility = Blockly.JavaScript.valueToCode(block, 'method_visibility', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    var code = 'A method';
    return code;
};

Blockly.Blocks['visibility'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Element visibility")
          .appendField(new Blockly.FieldDropdown([["public","public"], ["protected","protected"], ["private","private"], ["package","package"]]), "element_visibility");
      this.setOutput(true, "visibility");
      this.setColour(230);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };

Blockly.JavaScript['visibility'] = function(block) {
    // var dropdown_element_visibility = block.getFieldValue('element_visibility');
    // TODO: Assemble JavaScript into code variable.
    console.log(Blockly.JavaScript.statementToCode(block, 'content'));
    var code = "A visibility";
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['function_parameter'] = {
  init: function() {
    this.appendDummyInput("parameter_name")
        .appendField("Parameter name")
        .appendField(new Blockly.FieldTextInput("parameterName"), "parameter_name_input");
    this.appendValueInput("parameter_type")
        .setCheck("String")
        .appendField("Type")
        .appendField(new Blockly.FieldDropdown([["custom","custom_type"], ["boolean","bool"], ["string","String"], ["float","float"], ["char","char"], ["int","int"], ["double","double"]]), "parameter_type")
        .appendField("| or custom ->");
    this.setPreviousStatement(true, "function_parameter");
    this.setNextStatement(true, "function_parameter");
    this.setColour(180);
 this.setTooltip("Add a function parameter");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['function_parameter'] = function(block) {
  // var value_parameter_name = Blockly.JavaScript.valueToCode(block, 'parameter_name', Blockly.JavaScript.ORDER_ATOMIC);
  // var dropdown_parameter_type = block.getFieldValue('parameter_type');
  // var value_parameter_type = Blockly.JavaScript.valueToCode(block, 'parameter_type', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'A function parameter';
  return code;
};

Blockly.Blocks['connection_hub'] = {
  init: function() {
    this.appendValueInput("connected_class")
        .appendField("HUB")
        .setCheck("class");
    this.appendStatementInput("connections")
        .setCheck("connection");
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['connection'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Connected using")
        .appendField(new Blockly.FieldDropdown([[{"src":"./relationships/association.png","width":50,"height":20,"alt":"*"},"ASSOCIATION"], [{"src":"./relationships/bidir_association.png","width":50,"height":15,"alt":"*"},"BIDIR_ASSOCIATION"], [{"src":"./relationships/aggregation.png","width":50,"height":20,"alt":"*"},"AGGREGATION"], [{"src":"./relationships/composition.png","width":50,"height":15,"alt":"*"},"COMPOSITION"], [{"src":"./relationships/generalization.png","width":50,"height":15,"alt":"*"},"GENERALIZATION"], [{"src":"./relationships/realization.png","width":50,"height":15,"alt":"*"},"REALIZATION"], [{"src":"./relationships/dependency.png","width":50,"height":15,"alt":"*"},"DEPENDENCY"]]), "relationship_type");
    this.appendDummyInput()
        .appendField("cardinality")
        .appendField(new Blockly.FieldDropdown([["0..1","ZERO_OR_ONE"], ["1","ONE"], ["*","ANY"], ["1..*","ONE_OR_MORE"]]), "cardinality_dropdown");
    this.appendDummyInput("is start")
        .appendField("Is start?")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "is_start_checkbox");
    this.setPreviousStatement(true, "connection");
    this.setNextStatement(true, "connection");
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};