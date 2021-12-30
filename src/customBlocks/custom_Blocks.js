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
    this.appendValueInput("classname_joint")
        .setCheck("String")
        .appendField("Class name");
    this.appendStatementInput("methods")
        .setCheck("class_method")
        .appendField("Methods");
    this.appendStatementInput("fields")
        .setCheck("class_field")
        .appendField("Fields");
    this.setInputsInline(false);
    this.setOutput(true, "class");
    this.setColour(230);
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
      this.appendValueInput("field_name")
          .setCheck("String")
          .appendField("Field name");
      this.appendValueInput("field_type")
          .setCheck("String")
          .appendField("Field type")
          .appendField(new Blockly.FieldDropdown([["custom","custom_type"], ["boolean","bool"], ["string","String"], ["float","float"], ["char","char"], ["int","int"], ["double","double"]]), "field_type")
          .appendField("(append block if custom)");
      this.appendValueInput("field_visibility")
          .setCheck("visibility")
          .appendField("Visibility");
      this.appendValueInput("is_static")
          .setCheck("Boolean")
          .appendField("Is static (default false)");
      this.setInputsInline(false);
      this.setPreviousStatement(true, "class_field");
      this.setNextStatement(true, "class_field");
      this.setColour(90);
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
      this.appendValueInput("method_name")
          .setCheck("String")
          .appendField("Method name");
      this.appendValueInput("method_type")
          .setCheck("String")
          .appendField("Return type")
          .appendField(new Blockly.FieldDropdown([["custom","custom_type"], ["void","void"], ["boolean","bool"], ["string","String"], ["float","float"], ["char","char"], ["int","int"], ["double","double"]]), "field_type")
          .appendField("(append block if custom)");
          this.appendStatementInput("parameters")
          .setCheck("function_parameter")
          .appendField("Parameters");
      this.appendValueInput("method_visibility")
          .setCheck("visibility")
          .appendField("Visibility");
      this.appendValueInput("is_static")
          .setCheck("Boolean")
          .appendField("Is static (default false)");
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
          .appendField(new Blockly.FieldDropdown([["public","visibility_public"], ["protected","visibility_protected"], ["private","visibility_private"], ["package","visibility_package"]]), "element_visibility");
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
    this.appendValueInput("parameter_name")
        .setCheck("String")
        .appendField("Parameter name");
    this.appendValueInput("parameter_type")
        .setCheck("String")
        .appendField("Parameter type")
        .appendField(new Blockly.FieldDropdown([["custom","custom_type"], ["boolean","bool"], ["string","String"], ["float","float"], ["char","char"], ["int","int"], ["double","double"]]), "parameter_type")
        .appendField("(append block if custom)");
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
