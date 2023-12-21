import React from "react";
import VertexMap from "./elements/vertexMap";

//import {image} from "./stupid.js"

const App = () =>{
    const [selectionMode, selectionModeChange] = React.useState(0);
    const [zoomState, changeZoomState] = React.useState(1);
    const [centerXCoord, centerCoordXChange] = React.useState(0);
    const [centerYCoord, centerCoordYChange] = React.useState(0);
    const [eventPosX, eventPosXChange] = React.useState(0);
    const [eventPosY, eventPosYChange] = React.useState(0);
    const [tabMode, setTabMode] = React.useState(-1);

    React.useEffect(() => {
      const x = Math.min(
          Math.max(eventPosX-((1920/zoomState)/2),0),
          1920-((1920/zoomState))
      )
      const y =
       Math.min(
         Math.max(eventPosY-((1080/zoomState)/2),0),
         1080-((1080/zoomState))
      )

      ;
      centerCoordXChange(x);
      centerCoordYChange(y);

    }, [zoomState]);

    const test = function(event){
      eventPosXChange(event.pageX);
      eventPosYChange(event.pageY);
      if (event.deltaY > 0){
        //changeZoomState(1);

      } else {
        //changeZoomState(2);
      }

    }

    const setTabModeHandle = function(arg){
      setTabMode(arg);
    }


    //<GrapMap selModeChange={selectionModeChange} selMod={selectionMode} zoomState={zoomState} centerXCoord={centerXCoord} centerYCoord={centerYCoord}/>
    //<UnitMenu mode={selectionMode} zoomState={zoomState} centerXCoord={centerXCoord} centerYCoord={centerYCoord}/>
    return <div onWheel={test}>
    <VertexMap zoomState={zoomState} centerXCoord={centerXCoord} centerYCoord={centerYCoord} tabMode={tabMode} setTabMode={setTabModeHandle}/>
    </div>;

}

export default App;
