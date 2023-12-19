import React, {useState, useLayoutEffect, useRef, useEffect} from 'react'
import ReactDOM from 'react-dom';
import {createRoot} from 'react-dom/client';
import waveTexture from '../img/wave.png';
import townTexture from '../img/town.png';
import wastelandTexture from '../img/wasteland.png';
import GeoMap from "./geoMap";
import Polymap from "./polymap";

import SettingsPanel from "./settingsPanel";

let movingVertex = {"x": -1, "y": -1};
let provDic = {};
let vertexProvDic = {};
let vertexDic = {};


const waveImage = new Image();
waveImage.src = waveTexture;
const townImage = new Image();
townImage.src = townTexture;
const wastelandImage = new Image();
wastelandImage.src = wastelandTexture;

function provinceExists(provId){
  return provDic[provId] != undefined;
}

function getProvCoords(provPool){
  var nu = "";
  for(var x of provPool.list){
    nu +=  `${x.x},${x.y},`;
  }
  nu = nu.substring(0,nu.length-1)
  return nu;
}

function hasMultipleVertexes(pool){
  if (pool.list.length > 1){ return true }
  return false;
}


function getProvById(id){
  return provDic[id];
}

function provPoolIncludesVertex(pool, vertex){
    return pool.list.some((item, i) => {
      return item == vertex;
  });
}


function getProvCenter(id){

  const prov = getProvById(id);
  const cen = [0,0];
  for(var x of prov.pools[0].list){
    cen[0] += x.x;
    cen[1] += x.y;
  }
  return [(cen[0]/prov.pools[0].list.length),(cen[1]/prov.pools[0].list.length)];
}


const splitSelector = [];


const saveJSON = function(name, ver, prov, country){
  const tempProv = prov.map(item => ({
    ...item,
    pools: item.pools.map(pool => ({
      ...pool,
      list: pool.list.map(listItem => listItem.id)
    }))
  }));

  const json = `{
    "countryList": ${JSON.stringify(country)},
    "vertexList": ${JSON.stringify(ver)},
    "provList": ${JSON.stringify(tempProv)}
    }`
  ;



  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
}


let patterns = {"wave": null, "town": null, "wasteland": null}
const territoryMap = [0,1, 6];



const VertexMap = (props) =>{
  const mapRef = useRef(null);
  const [vertNumber, changeVertexCount] = useState(0);
  const [rawMap, setRawMap] = useState("");
  const [provCount, changeProvCount] = useState(0);
  const [selectedProvID, setSelectedProvID] = useState(0);
  const [selectedPoolInd, setSelectedPoolInd] = useState(0);
  const [canHaveArmy, setCanHaveArmy] = useState(false);
  const [canHaveFleet, setCanHaveFleet] = useState(false);
  const [isSupplyCenter, setSupplyCenter] = useState(false);
  const [countryList, setCountryList] = useState([{"tag": "NEU", "name": "neutral", "color": "#808080"}]);
  const canvasRef = useRef(null);
  const mapRootRef = useRef(null);
  const [changesCount, setChangesCount] = useState(0);
  const [selectedProvName, setSelectedProvName] = useState("");
  const [vertexArray, setVertexArray] = useState([]);
  const [provArray, changeProvArray] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState({"tag": "", "name": "", "color": ""});


  const getMapMode = function(){
    if (territoryMap.includes(props.tabMode)){
      return 1;
    } else {
      return 0;
    }
  }

  const getUseMapMode = function(){
    if (territoryMap.includes(props.tabMode)){
      return "#Polymap"
    } else {
      return "#vertexMap";
    }
  }


  const getSelectedPool = function(){
    return provDic[selectedProvID].pools[selectedPoolInd];
  }

  const saveChanges = function(event){
      saveJSON("raw.json", vertexArray, provArray, countryList);
      event.preventDefault();
  }


  const updatevertexProvDic = function(){
    const array = {};
    vertexArray.forEach((item, i) => {
      array[item.id] = [];
    });
    provArray.forEach((prov, i) => {
      prov.pools.forEach((pool, i) => {
        pool.list.forEach((vertex, i) => {
          array[vertex.id].push(pool);
        });
      });
    });
    vertexProvDic = array;
  }





  const resetSel = function(){
    movingVertex = {"x": -1, "y": -1};
    setSelectedPoolInd(0)
    setSelectProv(0);
    setSelectedProvName("")
  }


  useEffect(() => {
    mapRootRef.current = createRoot(mapRef.current);
  }, []);


  useEffect(() => {
    provArray.forEach((item, i) => {
      provDic[item.id] = item;
    });

  }, [vertexArray, provArray]);


  useEffect(() => {
  waveImage.onload = function() {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      patterns.wave = ctx.createPattern(waveImage, "repeat");
    };
    townImage.onload = function() {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        patterns.town = ctx.createPattern(townImage, "repeat");
      };
    wastelandImage.onload = function() {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        patterns.wasteland = ctx.createPattern(wastelandImage, "repeat");
      };

  }, [])


  const drawTerritoriesBasic = function(ctx){
    provArray.forEach((item, i) => {
      item.pools.forEach((pool, poolIndex) => {
        ctx.beginPath();
        if (hasMultipleVertexes(pool)) {
          ctx.moveTo(pool.list[0].x, pool.list[0].y);
          pool.list.forEach((item2, i) => { ctx.lineTo(item2.x, item2.y) });
          ctx.closePath();
          ctx.fillStyle = (selectedProvID == item.id && selectedPoolInd == poolIndex) ? "#FFFF0020" : "#FFFFFF40";
          ctx.fill();
          ctx.stroke();
            if (item.isSupplyCenter == true){
              ctx.fillStyle = patterns.town;
            } else if (item.canHaveFleet == true && item.canHaveArmy == false){
              ctx.fillStyle = patterns.wave;
            } else if (item.canHaveArmy == false && item.canHaveFleet == false){
              ctx.fillStyle = patterns.wasteland;
            } else {
              ctx.fillStyle = "#40404040";
            }
            ctx.fill();
          ctx.beginPath();
          ctx.fillRect(item.center[0]-5, item.center[1], 10, 10)
          ctx.stroke();

        }
      });

      });
    }

    const drawTerritoriesOwnership = function(ctx){
      provArray.forEach((item, i) => {
        item.pools.forEach((pool, poolIndex) => {
          ctx.beginPath();
          if (hasMultipleVertexes(pool)) {
            ctx.moveTo(pool.list[0].x, pool.list[0].y);
            pool.list.forEach((item2, i) => { ctx.lineTo(item2.x, item2.y) });
            ctx.closePath();
            ctx.fillStyle = (selectedProvID == item.id && selectedPoolInd == poolIndex) ? "#FFFF0020" : "#FFFFFF40";
            ctx.fill();
            ctx.stroke();
              if (item.canHaveArmy == false && item.canHaveFleet == true){
                ctx.fillStyle = patterns.wave;
              } else {
                ctx.fillStyle = (item.owner==null?"lightgrey":item.owner.color);
              }
              ctx.fill();
            ctx.beginPath();
            ctx.fillRect(item.center[0]-5, item.center[1], 10, 10)
            ctx.stroke();
          }
        });
        });

        if (selectedProvID != 0){
          const pool = provDic[selectedProvID].pools[selectedPoolInd];
          ctx.beginPath();
          ctx.moveTo(pool.list[0].x, pool.list[0].y);
          pool.list.forEach((item2, i) => { ctx.lineTo(item2.x, item2.y) });
          ctx.closePath();
          ctx.fillStyle = "#ffffff80";
          ctx.fill();
          ctx.stroke();
        }
      }

    const drawTerritoryNames = function(ctx){
      ctx.fillStyle = "black"
      ctx.textAlign = "center";
      provArray.forEach((item, i) => {
        ctx.fillText(item.name, item.center[0], item.center[1]+20);
      })
    }


  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.save();

    ctx.clearRect(0,0,1920, 1080);


    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";


    switch (getMapMode()) {
      case 0:
      const areas = vertexArray.map((item, i) => {
        ctx.beginPath();
        ctx.arc(item.x, item.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        return React.createElement('area', {
          key: `area-${i}`,
          shape: 'circle',
          coords: `${item.x},${item.y},5`,
          onClick: function(event){
            switch (props.tabMode) {
              case 2:
                movingVertex = item;
                setChangesCount(changesCount+1);
                break;
              case 4:
                if (splitSelector.length == 0){
                  splitSelector.push(item);
                } else {
                  const pro = getProvById(selectedProvID);
                  const li = pro.pools[selectedPoolInd].list
                  const aIndex = li.indexOf(splitSelector[0]);
                  const bIndex = li.indexOf(item);
                  const indexArray = aIndex<bIndex?[aIndex,bIndex]:[bIndex,aIndex];
                  const newPool = {"list": li.slice(indexArray[0],indexArray[1]+1)}
                  pro.pools.push(newPool);
                  li.splice(indexArray[0]+1, indexArray[1]-indexArray[0]-1);
                  splitSelector.length = 0;
                }
                setChangesCount(changesCount+1);

            }
          },
          onMouseUp: function(event){
            switch (props.tabMode) {
              case 3:
                if (selectedProvID != 0){
                  const list = provDic[selectedProvID].pools[selectedPoolInd].list;
                  if (!list.includes(item)){
                    list.push(item);
                  }
                  vertexProvDic[item.id].push(getSelectedPool());
                  if (list.length == 2){

                    const propPool = vertexProvDic[item.id].find((pool, i) => {
                      return (pool != getSelectedPool())
                      && provPoolIncludesVertex(pool,list[0]) && provPoolIncludesVertex(pool,list[1])
                    });
                    if (propPool != undefined){
                      const aIndex = propPool.list.indexOf(list[0]);
                      const bIndex = propPool.list.indexOf(list[1]);
                      const oArray = aIndex<bIndex?[aIndex, bIndex]:[bIndex,aIndex];
                      list.splice(-2, 2);
                      const nArray = propPool.list.slice(aIndex,bIndex+1);
                      provDic[selectedProvID].pools[selectedPoolInd].list = list.concat(nArray);
                  //    updatevertexProvDic();
                    }

                  }
                  setChangesCount(changesCount+1);
                }
                break;
              case 7:
              setVertexArray(
                prevState => prevState.filter(
                  vertex => vertex.id !== item.id
                )
              );
            //    vertexList.splice(vertexList.indexOf(item),1);
              //  updatevertexProvDic();
                setChangesCount(changesCount+1);
                break;
            }
          }
        });
      });


  //    const allMaps = areas.concat(updateAreaXVar);
      mapRootRef.current.render(areas);

      ctx.strokeStyle = "black";

      if (props.tabMode == 2 && movingVertex.x != -1){
        console.error()
        ctx.fillStyle = "red";
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(movingVertex.x, movingVertex.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
        drawTerritoriesBasic(ctx);break;
      case 1:
        drawTerritoriesOwnership(ctx);break;

    }
    drawTerritoryNames(ctx);



    if (selectedProvID != 0){
      if (props.tabMode == 3){
        ctx.strokeStyle = "black";
        ctx.textAlign = "center";
        provDic[selectedProvID].pools[0].list.forEach((item, i) => {
          ctx.beginPath();
          ctx.arc(item.x, item.y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "green";
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "white";
          ctx.font = "8px";
          ctx.fillText(`${i}`, item.x, item.y+5)
        });
      }
      ctx.fillStyle = "orange";
      ctx.strokeStyle = "black";
      splitSelector.forEach((item, i) => {
        ctx.beginPath();
        ctx.arc(item.x, item.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      });
    }


    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.restore();


  })


  const touch = function(event){
    switch (props.tabMode) {
      case 5:
        const ver = {"id": vertNumber, "x": event.nativeEvent.layerX, "y": event.nativeEvent.layerY}
        vertexArray.push(ver);
        vertexProvDic[ver.id] = []
        changeVertexCount(vertNumber + 1);
        break;
    }
  }

  const mouseMove = function(event){
    if (movingVertex != -1){
    switch (props.tabMode) {
      case 2:
        movingVertex.x = event.nativeEvent.layerX;
        movingVertex.y = event.nativeEvent.layerY;      }
    }
  }

  const mouseUp = function(event){
    if (movingVertex != -1){
    switch (props.tabMode) {
      case 2:
        movingVertex = {"x": -1, "y": -1};
        setChangesCount(changesCount+1);
      }
    }
  }

  const addProvince = function(){
    const pro = {"id": provCount+1, "name": "",
    "owner": null,
    "pools": [{"list": [], "fleetLoc": [0,0], "armyLoc": [0,0] }],
    "canHaveArmy": false,
    "canHaveFleet": false,
    "isSupplyCenter": false,
    "center": [0,0],
  };
  //  provList.push(pro)

    changeProvArray([...provArray, pro]);

    provDic[provCount+1] = pro;
    setCanHaveArmy(false);
    setSelectProv(provCount+1)
    changeProvCount(provCount + 1);
  }

  const deleteProvince = function(){
    const ind = provArray.findIndex((item, i) => {
      return item.id == selectedProvID;
    });
    delete provDic[selectedProvID+1];

    //TODO
    setVertexArray(
      prevState => prevState.filter(
        vertex => vertex.id !== ind
      )
    );
    setSelectProv(0)
  }

  const setSelectProv = function(id, event){
    switch (props.tabMode) {
      case 6:
          getProvById(selectedProvID).center = [event.nativeEvent.layerX,event.nativeEvent.layerY]
          setChangesCount(changesCount+1);
          break;
      default:
        setSelectedProvID(id)
        if (id != 0){
          const prov = getProvById(id);
          setSelectedProvName(prov.name);
          setCanHaveArmy(prov.canHaveArmy);
          setCanHaveFleet(prov.canHaveFleet);
          setSupplyCenter(prov.isSupplyCenter);
        } else {
          setCanHaveArmy(false);
        }
    }
  }

  const handleCanHaveArmy = function(value){
    getProvById(selectedProvID).canHaveArmy = value
    setCanHaveArmy(value);
  }

  const handleCanHaveFleet = function(value){
    getProvById(selectedProvID).canHaveFleet = value
    setCanHaveFleet(value);
  }

  const handleIsSupplyCenter = function(value){
    getProvById(selectedProvID).isSupplyCenter = value
    setSupplyCenter(value);
  }

  const handleClearVertex = function(value){
    getProvById(selectedProvID).pools[selectedPoolInd].list = [];
    setChangesCount(changesCount+1);
  }

  const handleProvChangeName = function(value){
    if (selectedProvID != 0){
      getProvById(selectedProvID).name = value;
      setSelectedProvName(value)
    }
  }

  const setProvOwnerHandle = function(prov, owner){
    if (prov.id != 0){
      getProvById(prov.id).owner = owner;
      setSelectedProvID(prov.id);
    }
  }

  const addSelectedCountry = function(){
    setCountryList([...countryList, selectedCountry])
  }

  const changeRaw = function(vertexArray, provArray, countryList){
    setVertexArray(vertexArray);
    setCountryList(countryList)
    if (provArray.length > 0){
      changeProvCount(provArray[provArray.length-1].id+1)
    } else {
      changeProvCount(0)
    }

    for(var x of vertexArray){
      vertexDic[x.id] = x;

    }

  //  updatevertexProvDic();

    const tempProv = provArray.map(item => ({
      ...item,
      pools: item.pools.map(pool => ({
        ...pool,
        list: pool.list.map(id => vertexDic[id])
      }))
    }));
    changeProvArray(tempProv);


    changeVertexCount(vertexArray[vertexArray.length-1].id+1);
    vertexArray.forEach((item, i) => {
      vertexProvDic[item.id] = [];
    });
  }


  const saveAsSVGHandle = function(){
    const provCoord = provArray.map((ter, i1) => {
      const polygonArray = [];
        ter.pools[0].list.forEach((vertex, i2) => {
        polygonArray.push(`${vertex.x},${vertex.y}`);
      });
      return `<polygon points="${polygonArray}" style="fill:${(ter.canHaveArmy==false&&ter.canHaveFleet==true)?'teal':(ter.canHaveArmy==false&&ter.canHaveFleet==false)?"brown":'green'};stroke:black;stroke-width:1"/>`
    });
    /*
    const text = provArray.map((ter, i1) => {
      return `
      <rect x="${ter.center[0]-5}" y="${ter.center[1]}" width="10" height="10"/><text x="${ter.center[0]}" y="${ter.center[1]+20}" class="heavy">${ter.name}</text>`*/
      const text = provArray.map((ter, i1) => {
        const custex = `<text x="${ter.center[0]}" y="${ter.center[1]+20}" class="heavy">${ter.name}</text>`
        if (ter.isSupplyCenter){
          return `<g transform="translate(-279.5 -317)" xmlns:xlink="http://www.w3.org/1999/xlink"><use x="${ter.center[0]-15}" y="${ter.center[1]-10}" xlink:href="#castle"/></g> ${custex}`;
        } else if (ter.canHaveArmy == true){
          return `<rect x="${ter.center[0]-5}" y="${ter.center[1]}" width="10" height="10"/> ${custex}`;
        } else {
          return `<text x="${ter.center[0]}" y="${ter.center[1]}" class="heavy">${ter.name}</text>`;
        }
    })

    const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg"><style> .heavy {
      font: bold 10px sans-serif;
      fill: white;
      text-anchor: middle;
    }</style><g transform="translate(-1000 -1000)">
  <path id="castle" d="m290 318v1.69l-1.62-0.125 0.0162-1.35-1.59-0.111-0.0289 1.51-1.52-6e-3 -0.0258-1.42-1.34 6e-3 -0.0912 1.44-1.62-6e-3 -0.0246-1.37-1.4-0.105-0.0782 3.92 1.46 1.62-0.0214 5.58 4.39 7.04 1.54 0.0449v0.0273h0.94l0.325 8e-3c-1e-4 -5e-3 1.2e-4 -5e-3 0-8e-3h3.18l1.99 6e-3v-6e-3h1.26c0.351-1.74 0.909-2.52 1.9-2.52 1.02 0 1.44 1.15 1.99 2.52h3.97l0.325 8e-3c-1.2e-4 -5e-3 0-5e-3 0-8e-3h3.18l2 6e-3 4.65-12.9 1.15-1.38 0.157-4-1.39-0.0876v1.69l-1.62-0.125 0.0149-1.35-1.59-0.112-0.0278 1.51-1.52-6e-3 -0.0258-1.42-1.34 6e-3 -0.0911 1.44-1.62-7e-3 -0.0258-1.37-1.4-0.104-0.0772 3.92 1.46 1.62-0.0107 1.64-0.0246 1.28h-0.43v-1.35l-1.16 0.0209-0.0462 1.33-0.736 0.0118-0.0278-1.21-1.24-0.0294 0.015 1.25h-0.435l-0.0107-3.17 1.15-1.38 0.157-4-1.39-0.0876v1.69l-1.62-0.125 0.015-1.35-1.59-0.111-0.03 1.51-1.52-6e-3 -0.0268-1.42-1.34 6e-3 -0.0911 1.44-1.62-6e-3 -0.0236-1.37-1.4-0.105-0.0783 3.92 1.46 1.62-0.0106 2.97-0.396-0.0305v-1.39l-1.16 0.0523-0.045 1.31-0.737 0.0219-0.0278-1.2-1.24 0.0107 0.015 1.2h-0.53l-0.0258-1.42h-0.015l0.49-1.76 1.14-1.38 0.157-4z" scale="0.5" fill="#808080" fill-rule="evenodd" stop-color="#000000" stroke="#fff" stroke-linecap="round" stroke-linejoin="bevel" stroke-width="1.61" style="paint-order:markers stroke fill"/></g>${provCoord}${text}</svg>`;

    const blob = new Blob([svg], { type: 'application/svg' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = "map.svg";
    document.body.appendChild(link);
    link.click();
  }

  const ctrKeyEvents = function(event) {
    if (event.ctrlKey) {
      switch (event.keyCode) {
        case 49:
          if (props.tabMode != 1){
            resetSel();props.setTabMode(5); //add vertex
          }
          break;
        case 50:
          if (props.tabMode != 2){
            resetSel();props.setTabMode(2); //move vertex
          }
          break;
        case 51:
          if (props.tabMode != 7){
            resetSel();props.setTabMode(7); //delete vertex
          }
          break;
        case 52:
          if (props.tabMode != 3){
            resetSel();props.setTabMode(3); //link provinces
          }
          break;
        case 53:
            if (props.tabMode != 4){
              resetSel();props.setTabMode(4); //split
            }
            break;
          }
      }
  }


  const setSelectedCountryHandle = function(arg){
    setSelectedCountry(arg);
  }

  const setTabModeHandle = function(arg){
    props.setTabMode(arg)
    props.setTabMode(10);
  }

  const setMovingVertex = function(x, y){
    movingVertex.x = x;
    movingVertex.y = y;
    setChangesCount(changesCount+1);
  }

  const polymapProps = {
    provs: provArray,
    hasMultipleVertexes: hasMultipleVertexes,
    getProvCoords: getProvCoords,
    selectedCountry: selectedCountry,
    tabMode: props.tabMode,
    setSelectProv: setSelectProv,
    movingVertex: movingVertex,
    tabMode: props.tabMode,
    setMovingVertex: setMovingVertex,
    setOwner: setProvOwnerHandle,

  };

  const provinceProps = {
    addProvince: addProvince,
    deleteProvince: deleteProvince,
    selectedProvID: selectedProvID,
    setSelectedProvID: setSelectProv,
    setSelectedPoolInd: setSelectedPoolInd,
    canHaveArmy: canHaveArmy,
    setCanHaveArmy: handleCanHaveArmy,
    provName: selectedProvName,
    changeProvName: handleProvChangeName,
    changeRaw: changeRaw,
    saveChanges: saveChanges,
    canHaveFleet: canHaveFleet,
    setCanHaveFleet: handleCanHaveFleet,
    isSupplyCenter: isSupplyCenter,
    setSupplyCenter: handleIsSupplyCenter,
    clearVertex: handleClearVertex,
  };

  const otherProps = {
    tabMode: props.tabMode,
    setTabMode: setTabModeHandle,
    countryList: countryList,
    selectedCountry: selectedCountry,
    setSelectedCountry: setSelectedCountryHandle,
    addSelectedCountry: addSelectedCountry,
    setCountryList: setCountryList,
    saveAsSVG: saveAsSVGHandle,
    setTabMode: props.setTabMode,
    setRawMap: setRawMap,
  };

  document.addEventListener('keydown', ctrKeyEvents)
//vertexMap
  return (
  <div><div id="mapPack">
    <GeoMap rawMap={rawMap} zoomState={props.zoomState} centerXCoord={props.centerXCoord} centerYCoord={props.centerYCoord}/>
    <canvas ref={canvasRef} width="1920" height="1080" />
    <img
      width="1920"
      height="1080"
      useMap={getUseMapMode()}
      onClick={touch}
      onMouseMove={mouseMove}
      onMouseUp={mouseUp}
    />
    <map id="vertexMap" ref={mapRef}></map>
  </div>
  <SettingsPanel {...provinceProps} {...otherProps}/>
  <Polymap {...polymapProps} />
  </div>


);

}
export default VertexMap;

export { provinceExists, getProvById };
