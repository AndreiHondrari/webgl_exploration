import * as THREE from "../../../vendor/three.module.js";
import {AbstractPlayerPlugin} from "../basic_player.mjs";


class GridPlugin extends AbstractPlayerPlugin {
  // constructor() {
  //   super()
  // }

  _enablePlugin() {
    // var lineMaterial = new THREE.LineBasicMaterial( { color: 0xcccccc } );
    // var crosshairMaterial = new THREE.LineBasicMaterial( { color: 0xff0000 } );
    // var edgeMaterial = new THREE.LineBasicMaterial( { color: 0xeeeeee } );
    //
    // // crosshair
    // const crosshairXpoints = [
    //     new THREE.Vector3(-50, 0, 0),
    //     new THREE.Vector3(50, 0, 0),
    // ];
    //
    // const crosshairYpoints = [
    //     new THREE.Vector3(0, -50, 0),
    //     new THREE.Vector3(0, 50, 0),
    // ];
    //
    // const crosshairXGeometry = new THREE.BufferGeometry().setFromPoints(crosshairXpoints);
    // const crosshairYGeometry = new THREE.BufferGeometry().setFromPoints(crosshairYpoints);
    //
    // const crosshairX = new THREE.Line(crosshairXGeometry, crosshairMaterial);
    // const crosshairY = new THREE.Line(crosshairYGeometry, crosshairMaterial);
    //
    // const grid = new THREE.Group();
    // grid.add(crosshairX);
    // grid.add(crosshairY);
    // this.engine.addNode("grid", grid);
  }

  _disablePlugin() {

  }

}


export default GridPlugin;
