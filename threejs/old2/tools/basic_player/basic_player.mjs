
const DEFAULT_ADVANCE_RATE = 0.25;


class AbstractPlayerPlugin {
  constructor(name, engine) {
    if (this.constructor === AbstractPlayerPlugin)
      throw new TypeError(
        "Abstract class `AbstractPlayerPlugin` can't be instantiated directly"
      );

    if (this._enablePlugin === undefined)
      throw new TypeError(
        "_enablePlugin must be implemented"
      )

    if (this._disablePlugin === undefined)
      throw new TypeError(
        "_disablePlugin must be implemented"
      )

    this._name = name;
    this._engine = engine;
  }

  get name() {
    return this._name;
  }

  get engine() {
    return this._engine;
  }

  get stateProperyName() {
    return `${this._name}_enabled`;
  }

  enablePlugin() {
    this._enablePlugin();
    this._engine.state[this.stateProperyName] = true;
  }

  disablePlugin() {
    this._disablePlugin();
    this._engine.state[this.stateProperyName] = false;
  }

  initState() {
    if (this._engine.state[this.stateProperyName] !== undefined)
      throw new Error(
        `${this.stateProperyName} already defined by another plugin!`
      );

    this._engine.state[this.stateProperyName] = false;
  }
}


class BasicPlayer {
  constructor({
    engine,
    plugins=new Array(),
    installPlugins=true
  }) {
    this._engine = engine;
    this._plugins = plugins;
    this._installedPlugins = {};
    this.advanceRate = DEFAULT_ADVANCE_RATE;

    this._engine.state["up"] = false;
    this._engine.state["down"] = false;
    this._engine.state["right"] = false;
    this._engine.state["left"] = false;
    this._engine.state["forward"] = false;
    this._engine.state["backward"] = false;

    this._engine.state["rotateLeft"] = false;
    this._engine.state["rotateRight"] = false;
    this._engine.state["rotateUp"] = false;
    this._engine.state["rotateDown"] = false;

    this._keyToggleBind('w', engine.state, 'forward');
    this._keyToggleBind('s', engine.state, 'backward');
    this._keyToggleBind('a', engine.state, 'left');
    this._keyToggleBind('d', engine.state, 'right');

    this._keyToggleBind('space', engine.state, 'up');
    this._keyToggleBind('c', engine.state, 'down');

    this._keyToggleBind('right', engine.state, 'rotateRight');
    this._keyToggleBind('left', engine.state, 'rotateLeft');

    this._keyToggleBind('up', engine.state, 'rotateUp');
    this._keyToggleBind('down', engine.state, 'rotateDown');

    if (installPlugins) this._installPlugins();
  }

  get installedPlugins() {
    return this._installedPlugins;
  }

  _keyToggleBind(keyCombo, stateObject, statePropertyName, callback) {
      keyboardJS.bind(keyCombo,
          function() {
              if (typeof(callback) !== "undefined")
                  callback();
              stateObject[statePropertyName] = true;
          },
          function() {
              if (typeof(callback) !== "undefined")
                  callback();
              stateObject[statePropertyName] = false;
          }
      );
  }

  _installPlugins() {
    console.log("INSTALL PLUGINS");
    for (let plugin of this._plugins) this.installPlugin(plugin[0], plugin[1]);
  }

  installPlugin(pluginName, pluginClass) {
      this._installedPlugins[pluginName] = new pluginClass(pluginName, this._engine);
  }

  alterNodes() {
      if (this._engine.state.forward) {
        this._engine.selectedCamera.position.z -= this.advanceRate;
      }

      if (this._engine.state["backward"]) {
          this._engine.selectedCamera.position.z += this.advanceRate;
      }

      if (this._engine.state["right"]) {
        this._engine.selectedCamera.position.x += this.advanceRate;
      }

      if (this._engine.state["left"]) {
        this._engine.selectedCamera.position.x -= this.advanceRate;
      }

      if (this._engine.state["up"]) {
        this._engine.selectedCamera.position.y += this.advanceRate;
      }

      if (this._engine.state["down"]) {
        this._engine.selectedCamera.position.y -= this.advanceRate;
      }
  }

  updateStats() {

  }

  populateInterface(wrapperElement) {
    const stats = document.createElement("div");
    const legend = document.createElement("div");

    stats.classList.add("stats");
    legend.classList.add("legend");

    stats.innerHTML = `
      <h2>Stats</h2>
      <p>Camera: <span id="camera-coordinates"></span></p>
      <p>Light: <span id="light-coordinates"></span></p>
      <p>Cube rotation: <span id="cube-rotation"></span></p>
    `;

    legend.innerHTML = `
      <h2>Legend</h2>
      <p>W: forward</p>
      <p>S: backward</p>
      <p>A: left</p>
      <p>D: right</p>

      <p>Space: up</p>
      <p>C: down</p>
    `;

    wrapperElement.appendChild(stats);
    wrapperElement.appendChild(legend);
  }

}


export default BasicPlayer;
export {
  AbstractPlayerPlugin,
}
