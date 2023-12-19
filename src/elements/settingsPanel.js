import React, {useState, useRef, useEffect} from 'react'
import {provinceExists, getProvById} from "./vertexMap";
import Tab from "./tab";


//const provTypeNames = {'0': '', '1': "sea", '2': 'coast', '3': 'land'}
const SettingsPanel = (props) => {
  const [provType, provTypeChange] = useState(0);
  const [newCountry, setNewCountry] = useState({tag: '', name: 'N/A', color: '#000000'});
  const [hasCountryChanged, setHasCountryChanged] = useState(false);
  const [selectedCountryIndex, setSelectedCountryIndex] = useState(0);

  const [canModifyCountry, setCanModifyCountry] = useState(false);

  const handleSelectedProvID = (event) => {
    if (provinceExists(event.target.value)){
      props.setSelectedCountry(props.selectedProvID, event);
    } else {
      alert(`Prov id #${event.target.value} does not exit`)
    }
  };


  const handleChangeSelectProvIdByInput = (event) => {
    if (provinceExists(event.target.value)){
      props.setSelectedProvID(event.target.value)
    } else {
      alert(`Prov id #${event.target.value} does not exit`)
    }
  };

  const setCenterCoord = (event) => {
    props.setTabMode(6)
  };



  const poolNumberChangeHandle = (event) => {
    props.setSelectedPoolInd(event.target.value)
  }


  const handleProvNameChange = (event) => {
    props.changeProvName(event.target.value);
  }


  const armyButtonHandle = function() { props.setCanHaveArmy(!props.canHaveArmy) }
  const fleetButtonHandle = function() { props.setCanHaveFleet(!props.canHaveFleet) }
  const supplyCenterButtonHandle = function() { props.setSupplyCenter(!props.isSupplyCenter) }


  const selProv = getProvById(props.selectedProvID);


  const handleTerritory = function(){
    if (selProv != undefined){
      return (
      <div>
        <div>
          <label>Name</label>
          <input type="text" value={props.provName} onChange={handleProvNameChange}></input>
        </div>
        <div>
        <button
          id="armyButton"
          type="checkbox"
          className={props.canHaveArmy ? "activeButton" : ""}
          onClick={armyButtonHandle}
          title="Can have an army?"
        ></button>
        <button
          id="fleetButton"
          type="checkbox"
          className={props.canHaveFleet ? "activeButton" : ""}
          onClick={fleetButtonHandle}
          title="Can have a fleet?"
        ></button>
        <button
          id="supplyCenterButton"
          type="checkbox"
          className={props.isSupplyCenter ? "activeButton" : ""}
          onClick={supplyCenterButtonHandle}
          title="Is a supply center?"
        ></button></div>
        <div>
          <label>Pool selector</label>
          <input type="range" min="0" max={selProv.pools.length-1} onChange={poolNumberChangeHandle}></input>
        </div>
        <button
          id="provCenterCoord"
          type="checkbox"
          onClick={setCenterCoord}
          title="Set coordinate?"
        ></button>

      </div>)
    }
    return "";
  }

  useEffect(() => {
  }, [props.countryList]);

  const handleRawMapSelect = (event) => {
    const selectedFile = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
      const imageDataURL = event.target.result;
      const imgElement = document.createElement('img');
      imgElement.src = imageDataURL;
      props.setRawMap(imgElement.src)
    };

    reader.readAsDataURL(selectedFile);
  };


  const handleVertexMapSelect = (event) => {
    const selectedFile = event.target.files[0];
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
      const jsonData = JSON.parse(reader.result);
      props.changeRaw(jsonData.vertexList,jsonData.provList, jsonData.countryList);
    };
    reader.readAsText(file);
  }

  const handleExternalPanel = function(){
    return <div>
    <h3>Load</h3>
    <label htmlFor="rawLoad">Raw map</label>
    <input id="rawLoad" type="file" onChange={handleRawMapSelect}/>
    <label htmlFor="vertexLoad">Vertex map</label>
    <input id="vertexLoad" type="file" onChange={handleVertexMapSelect}/>
    <h3>SAVE</h3>

    <button onClick={props.saveChanges}>JSON</button>
    <button onClick={props.saveAsSVG}>SVG</button>
    </div>
  }

  const handleTerritoryConnectPanel = function(){
    return <div>
    <div>
      <label>ID</label>
      <input id="provId" type="text" value={props.selectedProvID} onChange={handleChangeSelectProvIdByInput} />
    </div>
    <div>
      <button id="props.addProvince" onClick={props.addProvince}>+</button>
      <button id="removeProvince" onClick={props.deleteProvince} disabled={props.selectedProvID === 0}>-</button>
      <button id="clearVertex" onClick={props.clearVertex}>CLR</button>
    </div></div>
  }

  const handleTerritoryPanel = function(){
    return <div>
    <div>
      <label>ID</label>
      <input id="provId" type="text" value={props.selectedProvID} onChange={handleChangeSelectProvIdByInput} />
    </div>
      {handleTerritory()}
    </div>
  }

  const selectCountry = function(index){
    const sCountry = props.countryList[index];

  //  setNewCountry(sCountry)
    setNewCountry({ ...newCountry, name: sCountry.name, tag: sCountry.tag, color: sCountry.color });
    props.setSelectedCountry(sCountry)
    setCanModifyCountry(true)
    setSelectedCountryIndex(index);
  }

  const findCountryByTag = function(tag){
    return props.countryList.find((item, i) => {
      return item.tag==tag;
    });

  }

  const selectTerOwner = (event) => {
    console.log(findCountryByTag(event.target.value))
//    selectCountry()
  }

  const handleCountryDisplay = function() {

    return (
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>TAG</th>
            <th>Color</th>
          </tr>
        </thead>
        <tbody>

          {props.countryList.map((country, index) => (
            <tr key={index}>
              <td><button onClick={() => selectCountry(index)}>×</button></td>
              <td><b>{country.tag}</b></td>
              <td style={{ backgroundColor: country.color }}>{country.color}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }



  const handleCountryNameChange = (event) => {
    setNewCountry({...newCountry, name: event.target.value});
  };

  const handleTagChange = (event) => {
    setNewCountry({...newCountry, tag: event.target.value});
  };

  const handleCountryColorChange = (event) => {
    setNewCountry({...newCountry, color: event.target.value});
  };



  useEffect(() => {
    if (hasCountryChanged) {
      props.addSelectedCountry();
      setHasCountryChanged(false)
    }

  }, [props.selectedCountry]);

  const handleAddCountry = () => {
    setHasCountryChanged(true)
    props.setSelectedCountry(newCountry);
  };

  const modifyCountry = () => {
    const newList = [...props.countryList];
    newList[props.selectedCountryIndex] = newCountry
    console.log(props.selectedCountry,props.selectedCountryIndex)
    props.setCountryList(newList)
  };


  const handleCountryPanel = function(){
    return (
      <div>
        <div>
          <label>Tag</label>
          <input type="text" maxLength="3" value={newCountry.tag} onChange={handleTagChange} />
          <label>Name</label>
          <input type="text" value={newCountry.name} onChange={handleCountryNameChange} />
          <label>Color</label>
          <input type="color" value={newCountry.color} onChange={handleCountryColorChange} />
        </div>
        <button onClick={handleAddCountry}>ADD</button>
        <button onClick={modifyCountry} disabled={!canModifyCountry}>MOD</button>


        {handleCountryDisplay()}
      </div>
    );
  }



  const handleType = function(){
    switch (props.tabMode) {
      case 0:
        return handleTerritoryPanel();
      case 1:
        return handleCountryPanel();
      case -1:
        return handleExternalPanel();
      case 3:
        return handleTerritoryConnectPanel();
      default:
        return "";
    }

  }

  const content = handleType();

  return (
    <div id="settingPanel">
      <Tab tabMode={props.tabMode} setTabMode={props.setTabMode}/>
      {content}
    </div>
  );
};

export default SettingsPanel;
