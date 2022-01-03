const initialXmlFun = function(){/*
    <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="connection_hub" id="NjbC%d3L3qs}}M74NEGT" x="110" y="90">
            <value name="connected_class">
                <block type="class" id="lC/@HaEJi{jOR.qFSbBC">
                    <value name="classname_joint">
                        <block type="text" id="3ltW;nqUFssDga.Im#`K">
                            <field name="TEXT">Classname</field>
                        </block>
                    </value>
                    <statement name="methods">
                        <block type="class_method" id="p#`*t$Sa4+JTZ}@.*.]2">
                            <field name="field_type">String</field>
                            <value name="method_name">
                                <block type="text" id="^e-P$I-.7If@y-Od~/Q8">
                                    <field name="TEXT">getName</field>
                                </block>
                            </value>
                            <value name="method_visibility">
                                <block type="visibility" id="KinchVO_Ugm1)P1_U3?x">
                                    <field name="element_visibility">public</field>
                                </block>
                            </value>
                        </block>
                    </statement>
                    <statement name="fields">
                        <block type="class_field" id="b$_1*UPqlxARO:T7%{UE">
                            <field name="field_type">String</field>
                        </block>
                    </statement>
                </block>
            </value>
            <statement name="connections">
                <block type="connection" id="s_Elt5%R)YoB=fI+=wFU">
                    <field name="relationship_type">ASSOCIATION</field>
                    <field name="cardinality_dropdown">ZERO_OR_ONE</field>
                </block>
            </statement>
        </block>
    </xml>
    */}
    
    export const initialXml = initialXmlFun.toString().slice(19,-4).replaceAll('\n', '');