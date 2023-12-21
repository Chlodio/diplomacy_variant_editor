import React, {useState, useRef, useEffect} from 'react'
import ReactDOM from 'react-dom';

const Tab = ({tabMode,setTabMode}) => {
  const setAddSel = function(){setTabMode(5)}
  const setTerSel = function(){setTabMode(0)}
  const setPolSel = function(){setTabMode(1)}
  const setTerConSel = function(){setTabMode(3)}
  const setMoveSel = function(){setTabMode(2)}
  const setLoadSel = function(){setTabMode(-1)}
  const setCoordSel = function(){setTabMode(6)}

  const handle = function(){
    return <div id="tabBar">

      <button id="loadExternal" disabled={tabMode==-1} onClick={setLoadSel} title="Load and save"></button>
      <button id="addVertex" disabled={tabMode==5} onClick={setAddSel} title="Add vertexes"></button>
      <button id="moveVertex" disabled={tabMode==2} onClick={setMoveSel} title="Move vertexes"></button>
        <button id="connectVertex" disabled={tabMode==3} onClick={setTerConSel} title="Create provinces"></button>

      <button id="territoryEdit" disabled={tabMode==0} onClick={setTerSel} title="Edit province"></button>
      <button id="coordEdit" disabled={tabMode==6} onClick={setCoordSel} title="Edit positions"></button>


      <button id="politicalEdit" disabled={tabMode==1} onClick={setPolSel} title="Edit countries and territory ownerships"></button>
    </div>
  }

  const barSel = handle();

  return (
    <div>{barSel}</div>
  );
};

export default Tab;
