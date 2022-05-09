const initialXmlFun = function(){/*
    <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="connection_hub" id="NjbC%d3L3qs}}M74NEGT" x="110" y="90">
            <value name="connected_class">
                <block type="class" id="lC/@HaEJi{jOR.qFSbBC">
                    <field name="class_name_input">Classname</field>
                    <statement name="methods">
                        <block type="class_method" id="p#`*t$Sa4+JTZ}@.*.]2">
                            <field name="method_name_input">methodName</field>
                            <field name="field_type">String</field>
                            <field name="element_visibility">public</field>
                            <field name="is_static_checkbox">FALSE</field>
                            <field name="is_start_checkbox">FALSE</field>
                        </block>
                    </statement>
                    <statement name="fields">
                        <block type="class_field" id="b$_1*UPqlxARO:T7%{UE">
                            <field name="field_name_input">fieldName</field>
                            <field name="field_type">String</field>
                            <field name="element_visibility">public</field>
                            <field name="is_static_checkbox">FALSE</field>
                            is_statiz_checkbox
                        </block>
                    </statement>
                </block>
            </value>
            <statement name="connections">
                <block type="connection" id="s_Elt5%R)YoB=fI+=wFU">
                    <field name="relationship_type">ASSOCIATION</field>
                    <field name="cardinality_dropdown">ZERO_OR_ONE</field>
                    <field name="is_start_checkbox">TRUE</field>
                </block>
            </statement>
        </block>
    </xml>
    */}
    
export const initialXml = initialXmlFun.toString().slice(19,-4).replaceAll('\n', '');