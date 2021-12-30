import "./App.css";
import "./customBlocks/custom_Blocks";
import React, { useState } from "react";
import { BlocklyWorkspace } from "react-blockly";
import Blockly from "blockly";
import "./InitialPlayground.js";
import { initialXml } from "./InitialPlayground.js";
import { parseXMLClasses } from "./XmlParser";

export default function App() {
  const [xml, setXml] = useState("");
  const [javascriptCode, setJavascriptCode] = useState("");

  React.useEffect(() => {
    // translate xml to plantUML syntax
  }, [xml]);

  const toolboxCategories = {
    kind: "categoryToolbox",
    contents: [
      {
        kind: "category",
        name: "Standard",
        colour: "#5C81A6",
        contents: [
          {
            kind: "block",
            type: "text",
          },
        ]
      },
      {
        kind: "category",
        name: "Custom",
        colour: "#5CA699",
        contents: [
          {
            kind: "block",
            type: "class",
          },
          {
            kind: "block",
            type: "class_field",
          },
          {
            kind: "block",
            type: "class_method",
          },
          {
            kind: "block",
            type: "visibility",
          },
          {
            kind: "block",
            type: "function_parameter",
          },
        ],
      },
    ],
  };

  function workspaceDidChange(workspace) {
    console.log(workspace);
    // const code = Blockly.JavaScript.workspaceToCode(workspace);
    // setJavascriptCode(code);

    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xml,"text/xml");

    const classes = Array.from(xmlDoc.getElementsByTagName("block")).filter(el => el.attributes.getNamedItem("type").value === "class");
    const jsClasses = parseXMLClasses(classes);
    console.log(jsClasses);
  }

  function generateUml() {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xml,"text/xml");

    const classes = Array.from(xmlDoc.getElementsByTagName("block")).filter(el => el.attributes.getNamedItem("type").value === "class");
    const jsClasses = parseXMLClasses(classes);

    const demoClass = jsClasses[0];
    let umlString = "class ";
    let indent = "  ";
    umlString = umlString.concat(`${demoClass.name} {\n`);
    // concat element and methods
    demoClass.methods?.forEach(method => {
      let params = "";
      method.parameters.forEach(param => {
        params = params.concat(`${param.type} ${param.name},`)
      });
      if (params.length !== 0) {
        params = params.substring(0, params.length-1);
      }
      umlString = umlString.concat(`${indent}${method.returnType} ${method.name}(${params})\n`);
    });

    demoClass.fields?.forEach(field => {
      umlString = umlString.concat(`${indent}${field.returnType} ${field.name}\n`);
    });
    umlString = umlString.concat('\n}');
    setJavascriptCode(umlString);
  }

/*
  class ArrayList {
  Object[] elementData
  size()
}
*/

  return (
    <>
      <BlocklyWorkspace
        toolboxConfiguration={toolboxCategories}
        initialXml={initialXml}
        className="fill-height"
        workspaceConfiguration={{
          grid: {
            spacing: 20,
            length: 3,
            colour: "#ccc",
            snap: true,
          },
        }}
        onWorkspaceChange={workspaceDidChange}
        onXmlChange={setXml}
      />
      <pre id="generated-xml">{xml}</pre>
      <textarea
        id="code"
        style={{ height: "200px", width: "400px" }}
        value={javascriptCode}
        readOnly
      ></textarea>
      <button onClick={generateUml}>
        Mygtukas
      </button>
  </>
  );
}
