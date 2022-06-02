import "./styles/App.css";
import "./blockly/custom_Blocks";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BlocklyWorkspace } from "react-blockly";
import Blockly from "blockly";
import "./blockly/InitialPlayground.js";
import { initialXml } from "./blockly/InitialPlayground.js";
import { parseXMLClasses } from "./XmlParser";
import { toolboxCategories } from "./blockly/toolbox";
// import { findDOMNode } from "react-dom";
import { generateUMLForClass, getConnectionUMLString } from "./UML_DSL_Generator";

// import PF from "pathfinding";
import { checkDuplicateConnections, filterDuplConnections, validateClass, Validator } from "./Validator";
import Modal from "react-modal";
import WarningItem from "./WarningItem";
import { initialXmlCustom } from "./blockly/customInitial";

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '50%',
    minWidth: '20%'
  },
}

const encoder = require("./helpers/encoder.js");
const defl = require("./helpers/deflate.js");

const dynamicDropdownOptions_ = [];
const addDynamicDropdownOptions = (options) => {
  dynamicDropdownOptions_.splice(0, dynamicDropdownOptions_.length);
  dynamicDropdownOptions_.push(['<not selected>', 'OPTION-1']);
  options.forEach(option => dynamicDropdownOptions_.push(option));
};

Blockly.Blocks['connection'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("connected to")
        .appendField(new Blockly.FieldDropdown(this.dynamicOptions), "connected_to");
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
  },
  
  dynamicOptions: function() {
    if (!dynamicDropdownOptions_.length) {
      return [['<no classes found>', 'OPTION0']];
    }
    return dynamicDropdownOptions_;
  },
};


export default function App() {
  const [xml, setXml] = useState("");
  const [plantUMLText, setPlantUMLText] = useState("");
  const [imgSrc, setImgSrc] = useState("");

  const [blocklyClasses, setBlocklyClasses] = useState([]);
  const [previousImgString, setPreviousImgString] = useState("");

  // const [connectionStarted, setConnectionStarted] = useState(false);
  // const [connectionInfo, setConnectionInfo] = useState(undefined);
  // const [connectedClasses, setConnectedClasses] = useState([]);

  const [warningWndOpen, setWarningWndOpen] = useState(false);
  const [warnings, setWarnings] = useState([]);

  // [ [classId, classId], [connInfo, connInfo] ]
  // const connectionsList = useRef([]); // : [ [len = 2], [len = 2] ]

  const lastFuncId = React.useRef(undefined);
  const lastGenerateFuncId = React.useRef(undefined);
  const lastXML = useRef("");

  // const lineElement = React.useRef(undefined);

  useEffect(() => {
    // ["className", "classId"]
    const allClasses = blocklyClasses.map(el => [ el.name, el.id] );
    // const options = allClasses.length === 0 ? [ ["empty", "empty"] ] : allClasses;
    addDynamicDropdownOptions(allClasses);
  }, [blocklyClasses]);

  const showPlantUMLImg = useCallback((text) => {
    const currentEncodedImg = encoder.encode64(defl.deflate(text, 9));
    if (previousImgString === currentEncodedImg)
      return;

    setPreviousImgString(currentEncodedImg);
    clearTimeout(lastFuncId.current);

    lastFuncId.current = setTimeout(() => {
      setImgSrc("http://www.plantuml.com/plantuml/img/" + currentEncodedImg);
    }, 1000);
  }, [previousImgString]);

  const generateUml = useCallback(() => {

    const jsClasses = parseXMLClasses(xml);
    console.log("jsClasses:");
    console.log(jsClasses);

    let umlString = "";
    jsClasses.forEach(classDescr => {
      umlString = umlString.concat(generateUMLForClass(classDescr));
      umlString += "\n\n";
    });

    // Map<id, classDef>
    const classDefs = new Map();
    jsClasses.forEach(cl => classDefs.set(cl.id, {
      id: cl.id,
      methods: cl.methods,
      name: cl.name,
      type: cl.classType,
      fields: cl.fields
      })
    );
    console.log(`Mapped classes:`);
    console.log(classDefs);
    
    // List<Connection> 
    /* Connection {
        classBegin{
          id,
          cardinality
        },
        classEnd{
          id,
          cardinality
        },
        Type
    }*/
    let connections = [];
    connections.push(...jsClasses.flatMap(cl => {
      return cl.connect_hub?.connections.map(conn => {
        const connDef = { id: cl.id, cardinality: conn.cardinality };
        const classBegin = conn.isStart ? connDef : { id: conn.connection_to };
        const classEnd = conn.isStart ? { id: conn.connection_to } : connDef;

        return {
          classBegin,
          classEnd,
          type: conn.type,
          addedFromBegin: conn.isStart
        }
      })
      }
    ));

    console.log(`Mapped conns:`);
    console.log(connections);

    // filter out connections that dont have a valid end or beginning
    connections = connections.filter(conn => classDefs.has(conn.classBegin.id) && classDefs.has(conn.classEnd.id));
    console.log("filtered conns");
    console.log(connections);

    // check duplicates
    const duplicateWarnings = checkDuplicateConnections(connections);
    console.log("duplicates:");
    console.log(duplicateWarnings);

    // check duplicate conns between classes
    const filteredConns = filterDuplConnections(connections);
    console.log(filteredConns);

    umlString += getConnectionUMLString(filteredConns, classDefs);

    const warns = [];
    const validator = new Validator(jsClasses, filteredConns);

    validator.addParents();
    validator.addInheritted();
    const classesWithParents = validator.getClasses();

    classesWithParents.forEach(cl => {
      const duplFieldsWarns = validator.checkDuplicateFields(cl);
      duplFieldsWarns.forEach(warn => warns.push({ type: "error", text: warn }));
      
      const duplMethodsWarns = validator.checkDuplicateMethods(cl);
      duplMethodsWarns.forEach(warn => warns.push({ type: "error", text: warn }));
    });

    console.log("Clases with parants");
    console.log(classesWithParents);

    classDefs.forEach(cl => {
      const res = validateClass(cl)
      console.log(res);
      res.duplicateFields.forEach(f => {
        warns.push({ type: "error", text: `There are multiple fields named <${f}> in a class <${cl.name}>` });
      });
      res.duplicateMethods.forEach(m => {
        warns.push({ type: "error", text: `There are multiple identical methods named <${m}> in a class <${cl.name}>` });
      });
    });

    const connectionWarnings = validator.validateConnectionTypes();
    connectionWarnings.forEach(warn => warns.push({ type: "warning", text: warn }));

    const interfaceWarnings = validator.validateInterfaces();
    interfaceWarnings.forEach(warn => warns.push({ type: "error", text: warn }));

    const diamondWarnings = validator.checkDiamond();
    diamondWarnings.forEach(warn => warns.push({ type: "warning", text: warn }));

    setWarnings(warns);
    setBlocklyClasses(jsClasses);
    setPlantUMLText(umlString);
    showPlantUMLImg(umlString);
  }, [xml, showPlantUMLImg]);


  const workspaceDidChange = useCallback((workspace) => {
    // const code = Blockly.JavaScript.workspaceToCode(workspace);
    // setJavascriptCode(code);

    clearTimeout(lastGenerateFuncId.current);

    lastGenerateFuncId.current = setTimeout(() => {
      if (xml !== lastXML.current) {
        lastXML.current = xml;
        generateUml();
      }
    }, 1000);
  }, [generateUml, xml]);

  const [umlOpened, setUmlOpened] = useState(false);

  const toggleNav = useCallback(() => {
    if (umlOpened) {
      document.getElementById("mySidepanel").style.width = "0";
    } else {
      document.getElementById("mySidepanel").style.width = "500px";
    }

    setUmlOpened(!umlOpened);
  }, [umlOpened]);

  return (
    <>
    <div id="mySidepanel" class="sidepanel">
      <a href="javascript:void(0)" class="closebtn" onClick={toggleNav}>&times;</a>
      <h2>Warnings</h2>
      {
        warnings.length > 0
          ? warnings.map((w, idx) => <WarningItem text={w.text} type={w.type} key={idx} />)
          : <WarningItem text={"0 warnings found :)"} />
      }
    </div>

    <button class="openbtn" onClick={toggleNav}>&#9776; {`${warnings.length === 0 ? "": `(${warnings.length}) `}Warnings`}</button>
      <BlocklyWorkspace
        toolboxConfiguration={toolboxCategories}
        initialXml={initialXmlCustom}
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
      <img alt={""} src={imgSrc} />

      <textarea
        id="code"
        style={{ minHeight: "200px", width: "400px" }}
        value={plantUMLText}
        readOnly
      />

      <Modal
        isOpen={warningWndOpen}
        onRequestClose={() => setWarningWndOpen(false)}
        style={customStyles}
        contentLabel="Warning list modal"
        shouldCloseOnEsc={true}
        shouldCloseOnOverlayClick={true}
      >
        <h2>Warnings</h2>
        {warnings.length > 0
          ? warnings.map((w, idx) => <WarningItem text={w.text} type={w.type} key={idx} />)
          : <WarningItem text={"0 warnings found :)"} />
        }
        <button className="modalCloseBtn" onClick={() => setWarningWndOpen(false)}>close</button>
      </Modal>
    </>
  );
}


// <button onClick={() => setWarningWndOpen(true)} className={warnings.length === 0 ? "validateBtn" : "validateBtnWarn"}>{`${warnings.length === 0 ? "": `(${warnings.length}) `}Validate`}</button>
// <button onClick={generateUml}>Generate</button>

// <pre id="generated-xml">{xml}</pre>


// <path xmlns="http://www.w3.org/2000/svg" stroke="black" transform="translate(1000,300)" d=" M 0 0 L 255 108 L 375 -95" fill="none"></path>

// const dynamicOptions = useCallback(() => {
//   // ["className", "classId"]
//   const allClasses = blocklyClasses.map(el => [ el.name, el.id] );
//   console.log("classes for dropdwon:");
//   console.log(allClasses);
//   const options = allClasses.length === 0 ? [ ["empty", "empty"] ] : allClasses;
//   // addDynamicDropdownOptions(options);
//   // addDynamicDropdownOption();
//   return options;
// }, [blocklyClasses]);

// useEffect(() => {
//   if (connectionStarted)
//     document.onmousemove = handleMouseMove;
// }, [handleMouseMove, connectionStarted]);


// const createConnectors = React.useCallback((connInfo) => {
//   connInfo.forEach(conn => {
//     // calculate how much translate(x, y) is needed (investigate if it's possible to clip it to connector)

//     // get html element that this current one needs to go after
    
//     // create next html sibling or whatever and keep the element ref

//     // <path class="connector_arrow" fill="#00ff00" transform="translate(120,-1)" stroke="green" d="M 0 0 h 8.5 v 30 h -8.5 z"></path>

//     // add onclick handler to register the related class id and connector id?

//     // TODO: unregister onclick handlers of the connectors that dont exist anymore
//   });
// }, []);

// const escFunction = useCallback((event) => {
//   if (event.keyCode === 27 && connectionStarted) {
//     //Do whatever when esc is pressed
//     setConnectionStarted(false);
//     setConnectionInfo(undefined);
//   }
// }, [connectionStarted]);

// const handleMouseMove = useCallback((event) => {
//   if (!lineElement.current)
//     return;

//   event = event || window.event;

//   let canvasEl =  document.getElementsByClassName("blocklyBlockCanvas");
//   if (canvasEl || canvasEl.length === 0)

//   canvasEl = canvasEl[0];
//   let canvasXY = canvasEl.attributes.getNamedItem("transform").value;

//   console.log();
//   let translateString = canvasXY.slice(10)
//   translateString = translateString.slice(0, translateString.indexOf(')'));

//   console.log(translateString);
//   let [canvasX, canvasY] = translateString.split(',');
//   canvasX = Number(canvasX);
//   canvasY = Number(canvasY);
//   console.log("canvasX");
//   console.log(canvasX);
//   console.log(canvasY);

//   const candidateEls = Array.from(document.getElementsByTagName("g")).filter(el => !!el.attributes.getNamedItem("data-id"));
//   let connectorEl = candidateEls.filter(el => el.attributes.getNamedItem("data-id").value === connectionInfo.connectorId);
//   let hubEl = candidateEls.filter(el => el.attributes.getNamedItem("data-id").value === connectionInfo.hubId);

//   if (!connectorEl || !hubEl || connectorEl.length === 0 || hubEl.length === 0)
//     return;

//   connectorEl = connectorEl[0];
//   hubEl = hubEl[0];

//   console.log("BOUNDING BOX OF CONNECTOR:");
//   console.log(connectorEl.getBoundingClientRect());

//   let connXY = connectorEl.attributes.getNamedItem("transform").value;
//   let hubXY = hubEl.attributes.getNamedItem("transform").value;

//   let [cx, cy] = connXY.slice(10, -1).split(',');
//   let [hx, hy] = hubXY.slice(10, -1).split(',');

//   console.log(cx);
//   console.log(cy);
//   console.log(hx);
//   console.log(hy);

//   const offsetConnectorX = 252;
//   const offsetConnectorY = 31;

//   let x1 = document.createAttribute("x1"); x1.value = Number(cx) + Number(hx) + canvasX + offsetConnectorX;
//   let y1 = document.createAttribute("y1"); y1.value = Number(cy) + Number(hy) + canvasY + offsetConnectorY;
//   let x2 = document.createAttribute("x2"); x2.value = event.pageX - 5; // offset from mouse so there is lower chance of clicking on the line
//   let y2 = document.createAttribute("y2"); y2.value = event.pageY - 3;
//   lineElement.current.setAttributeNode(x1);
//   lineElement.current.setAttributeNode(y1);
//   lineElement.current.setAttributeNode(x2);
//   lineElement.current.setAttributeNode(y2);
//   console.log("LINE ELEMENT COORDS");
//   console.log(lineElement);
// }, [lineElement, connectionInfo]);

// React.useEffect(() => { // might be a useCallback thats called on workspaceDidChange
//   if (!xml)
//     return;

//   // find all relevant hubs
//   let hubs = blocklyClasses.map(cl => cl.connect_hub).filter(cl => cl !== undefined);

//   // flatten connector list
//   let connectors = hubs.flatMap(x => x.connections);
  
//   // find relevant connector html elements
//   let connector_elements = Array.from(document.getElementsByTagName("g")).filter(el => !!el.attributes.getNamedItem("data-id"));
  
//   connector_elements = connector_elements.filter(el => connectors.find(conn => conn.connectorId === el.attributes.getNamedItem("data-id").value) !== undefined);

//   const beginTime = (new Date()).getTime();
//   connector_elements.forEach(connector_el => {
//     const currentConnId = connector_el.attributes.getNamedItem("data-id").value;
//     if (true /*!document.getElementById(currentConnId)*/) {
//       // <g style="display: block;" transform="translate(200,16)"><path d="M 0 0 h 40 l 15 12.5 l -15 12.5 h -40 Z" fill="#495284" transform="translate(0,2.5)"></path></g>

//       // let attrClass = document.createAttribute("class");
//       // attrClass.value = "connector_arrow";

//       // remove previously added element for this connector
//       const prevElement = document.getElementById(currentConnId);
//       if (!!prevElement)
//         prevElement.remove();

//       // find relevant connector info
//       let conn_info = connectors.find(conn => conn.connectorId === currentConnId);
      
//       let xTr = 255;
//       let yTr = 16;
//       let attrTransform = document.createAttribute("transform");
//       attrTransform.value = `translate(${xTr},${yTr})`;
      
//       // fill="#00ff00"
//       let attrFill = document.createAttribute("fill");
//       attrFill.value = "#495284";

//       // TODO: replace with class selector in css
//       let attrStyle = document.createAttribute("style");
//       attrStyle.value = "display: block;";

//       // stroke="green"
//       // let attrStroke = document.createAttribute("stroke");
//       // attrStroke.value = "green";
      
//       let attrD = document.createAttribute("d");
//       attrD.value = "M 0 0 h 40 l 15 12.5 l -15 12.5 h -40 Z";
      
//       let attrId = document.createAttribute("id");
//       attrId.value = currentConnId; // "1234560";
      
//       const svgns = "http://www.w3.org/2000/svg";
//       const elementG = document.createElementNS(svgns, "g");
//       const elementPath = document.createElementNS(svgns, "path");
      
//       // elementG.setAttributeNode(attrClass);
//       elementG.setAttributeNode(attrStyle);
//       elementG.setAttributeNode(attrTransform);
//       elementG.setAttributeNode(attrId);
      
//       let attrTransformPath = document.createAttribute("transform");
//       attrTransformPath.value = `translate(${0},${2.5})`;

//       elementPath.setAttributeNode(attrTransformPath);
//       elementPath.setAttributeNode(attrFill);
//       elementPath.setAttributeNode(attrD);
//       //elemen.setAttributeNode(attrStroke);

//       elementG.appendChild(elementPath);
//       // connector_el.appendChild(elementG);

//       // elementG.onclick = () => {
//       connector_el.onclick = () => {
//         const coninfo = {
//           connectorId: currentConnId,
//           hubId: conn_info.hubId,
//           classId: conn_info.connectedClass,
//           connType: conn_info.type,
//           cardinality: conn_info.cardinality
//         }
//         console.log(`connector clicked:`);
//         console.log(coninfo);
//         connectorClicked(coninfo);
//       };
//     }
//   });
//   // console.log(`TIME TOOK TO CREATE CONNECTORS: ${(new Date()).getTime() - beginTime}`);

// }, [xml, blocklyClasses, connectorClicked]);

// React.useMemo(() => {
//   if (classId) {
//     // console.log("onclick REGISTERED");
//     let htmlElement = Array.from(document.getElementsByClassName("blocklyDraggable")).filter(el => el.attributes.getNamedItem("data-id").value === classId);
//     if (htmlElement && htmlElement.length === 1) {
//       htmlElement = htmlElement[0];
//       // console.log(htmlElement);
//       htmlElement.onclick = () => {
//         console.log("CLIKCED CLASs");
//       };
//     }
//   }
//   return () => {
//     // unregister onclick handler
//     // htmlElement.onclick = null;
//   }
// }, []);

// useEffect(() => {
//   document.addEventListener("keydown", escFunction);

//   return () => {
//     document.removeEventListener("keydown", escFunction);
//   };
// }, [escFunction]);

// const drawLine = useCallback(() => {
//   const lineEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
    
//   const attrId = document.createAttribute("id");
//   attrId.value = "line-path";

//   const attrStroke = document.createAttribute("stroke");
//   attrStroke.value = "black";

//   const attrFill = document.createAttribute("fill");
//   attrFill.value = "none";

//   const attrTransform = document.createAttribute("transform");
//   attrTransform.value = "translate(100,100)";

//   const attrD = document.createAttribute("d");
//   attrD.value = " m 0 0 l 255 108 l 375 -95";

//   lineEl.setAttributeNode(attrId);
//   lineEl.setAttributeNode(attrStroke);
//   lineEl.setAttributeNode(attrFill);
//   lineEl.setAttributeNode(attrTransform);
//   lineEl.setAttributeNode(attrD);

//   let canvasEl = document.getElementsByClassName("blocklyWorkspace")[0];
//   canvasEl.appendChild(lineEl);

//   var matrix = [
//     [0, 0, 0, 1, 0],
//     [1, 0, 0, 0, 1],
//     [0, 0, 1, 0, 0],
//   ];
//   var grid = new PF.Grid(matrix);

//   var finder = new PF.AStarFinder();
//   var path = finder.findPath(1, 2, 4, 2, grid);
//   console.log(path);

//   var newPath = PF.Util.compressPath(path);
//   console.log(newPath);
// }, []);

// const connectorClicked = useCallback((connInfo) => {

//   if (!connectionStarted) {
//     // check if connector not already connected
//     const existingConnectionIdx = connectionsList.current.findIndex(conn => conn[1][0].connectorId === connInfo.connectorId || conn[1][1].connectorId === connInfo.connectorId);
//     if (existingConnectionIdx !== -1) {

//       const existingConnection = connectionsList.current[existingConnectionIdx];
//       // setup as if connection was started from the other side of existing connection
//       if (existingConnection[1][0].connectorId === connInfo.connectorId) {
//         setConnectionInfo(existingConnection[1][1]);
//       } else {
//         setConnectionInfo(existingConnection[1][0]);
//       }
//       setConnectionStarted(true);

//       // remove existing connection from the list
//       connectionsList.current.splice(existingConnectionIdx);
      
//       const classesIdx = connectedClasses.findIndex(cl => cl[0] === connInfo.classId || cl[1] === connInfo.classId);
      
//       // remove existing connection between classes
//       const connClasses = connectedClasses;
//       connClasses.splice(classesIdx);
//       setConnectedClasses(connClasses);
//     }

//     setConnectionInfo(connInfo);
//     setConnectionStarted(true);
//     console.log("CONNECTION STARTED");
//     console.log(connInfo.classId);
//     const lineEl = document.createElementNS("http://www.w3.org/2000/svg", "line");
    
//     const attrId = document.createAttribute("id");
//     attrId.value = "current-conn-line";

//     const attrStroke = document.createAttribute("stroke");
//     attrStroke.value = "black";
//     lineEl.setAttributeNode(attrId);
//     lineEl.setAttributeNode(attrStroke);

//     let canvasEl = document.getElementsByClassName("blocklyWorkspace");
//     if (canvasEl && canvasEl.length !== 0) {
//       canvasEl = canvasEl[0];
//       //canvasEl.appendChild(lineEl);
//     }

//     lineElement.current = lineEl;
//   } else {
//     // finish connection
    
//     // something wrong if info does not exist, reset connection
//     if (!connectionInfo) {
//       setConnectionStarted(false);
//       setConnectionInfo(undefined);
//       return;
//     }
    
//     // check if connector not already connected
//     if (connectionsList.current.find(conn => conn[1][0].connectorId === connInfo.connectorId
//                                           || conn[1][1].connectorId === connInfo.connectorId) !== undefined) {
//       // dont do anything. User might find a valid connector to click
//       return;
//     }

//     // check if class is not already connected
//     if (connectedClasses.find(cl => cl[0] === connInfo.classId || cl[1] === connInfo.classId) !== undefined) {
//       setConnectionStarted(false);
//       setConnectionInfo(undefined);
//       return;
//     }

//     // check if not the same class
//     if (connectionInfo.classId === connInfo.classId) {
//       // setConnectionStarted(false);
//       // setConnectionInfo(undefined);
//       return;
//     }

//     // add to connections
//     const connClasses = connectedClasses;
//     connClasses.push([connectionInfo.classId, connInfo.classId]);
//     setConnectedClasses(connClasses);

//     connectionsList.current.push( [ [connectionInfo.classId, connInfo.classId],
//                                     [connectionInfo, connInfo]
//                                   ]
//     );
//     setConnectionInfo(undefined)
//     setConnectionStarted(false);

//     console.log("CONNECTION CREATED");
//   }
// }, [connectionStarted, connectedClasses, connectionInfo]);
