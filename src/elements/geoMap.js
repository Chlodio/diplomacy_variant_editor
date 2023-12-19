import React, {useState, useRef, useEffect } from 'react'
import wastelandTexture from '../img/wasteland.png';



let mapLoad = 0;
let playerSelection = null;
const dashes = [
  {"color": "white", "dash": [10]},
  {"color": "white", "dash": []},
  {"color": "black", "dash": []},
]

const GeoMap = (props) =>{

  const mapImage = new Image();

  mapImage.onload = function(){
    if (mapLoad == 0){
      setCount(mapImage)
      mapLoad++;
    }
  }
  mapImage.src = props.rawMap;

  const [count, setCount] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0,0,1920, 1080);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.save();

  //  ctx.translate(960-centerCoord[0], 540-centerCoord[1]);
     //ctx.scale(zoomState, zoomState);

    if (count != null){



      ctx.drawImage(count,
        props.centerXCoord,
        props.centerYCoord,
        1920/props.zoomState,
        1080/props.zoomState,
        0,0,
        1920, 1080);
    }



    ctx.restore();
  })
/*
1920*(1-(zoomState-1)),
1080*(1-(zoomState-1)),
*/
  return <canvas ref={canvasRef} width="1920" height="1080"/>
}

export default GeoMap;
