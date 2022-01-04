import "./App.css";
import "./customBlocks/custom_Blocks";
import React, { useState } from "react";
import { BlocklyWorkspace } from "react-blockly";
import Blockly from "blockly";
import "./InitialPlayground.js";
import { initialXml } from "./InitialPlayground.js";
import { parseXMLClasses } from "./XmlParser";

const encoder = require("./encoder.js");
const defl = require("./deflate.js");

export default function App() {
  const [xml, setXml] = useState("");
  const [javascriptCode, setJavascriptCode] = useState("");
  const [imgSrc, setImgSrc] = useState("");

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
          {
            kind: "block",
            type: "logic_boolean",
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
          {
            kind: "block",
            type: "connection_hub",
          },
          {
            kind: "block",
            type: "connection",
          },
        ],
      },
    ],
  };

  function workspaceDidChange(workspace) {
    // console.log(workspace);
    // const code = Blockly.JavaScript.workspaceToCode(workspace);
    // setJavascriptCode(code);

    generateUml();
  }

  function getVisibilityModifier(visibilityString) {
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

  function generateUMLForClass(classDescr) {
    let umlString = "class ";
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
    umlString = umlString.concat('\n}');
    return umlString;
  }

  function generateUml() {
    const jsClasses = parseXMLClasses(xml);
    console.log(jsClasses);
    let umlString = "";
    jsClasses.forEach(classDescr => {
      umlString = umlString.concat(generateUMLForClass(classDescr));
      umlString += "\n\n";
    });

    umlString += "Classname --> Classname2\n";
    setJavascriptCode(umlString);
    compress(umlString);
  }

  function compress(text) {
    setImgSrc("http://www.plantuml.com/plantuml/img/" + encoder.encode64(defl.deflate(text, 9)));
  }
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
        Generate
      </button>
      <img alt={""} src={imgSrc} />
  </>
  );
}
