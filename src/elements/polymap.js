import React from 'react';

const Polymap = (props) => {
  const onClickHandle = function(event, prov){
    switch (props.tabMode) {
      case 1:
      props.setOwner(prov, props.selectedCountry)
      default:
        props.setSelectProv(prov.id, event);break;
    }
  }

  const onMouseUpHandle = function(prov){
    if (props.movingVertex != null) {
      switch (props.editingMode) {
        case 2:
          props.setMovingVertex(-1, -1)
          break;
      }
    }
  }

  const onMouseMoveHandle = function(event){
    if (props.movingVertex != null) {
      switch (props.editingMode) {
        case 2:
          props.setMovingVertex(event.nativeEvent.layerX, event.nativeEvent.layerY)
          break;
      }
    }
  }

  const polymaparea = props.provs.map((item, i) => {
    return item.pools.map((pool, j) => {
      if (props.hasMultipleVertexes(pool)) {
        return <area key={`${i}-${j}`} shape="poly" coords={props.getProvCoords(pool)}
        onClick={(event) => onClickHandle(event,item)}
        onMouseUp={() => onMouseUpHandle(item)}
        onMouseMove={(event) => onMouseMoveHandle(event)}


        />;
      }
      return null;
    });
  });

  return <map id="Polymap">{polymaparea}</map>;
};

export default Polymap;
