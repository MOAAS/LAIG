/**
* MyInterface class, creating a GUI interface.
*/
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui
        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)

        this.initKeys();

        return true;
    }

    clear() {
        this.gui.destroy();
        this.gui = new dat.GUI();
        this.lightfolder = this.gui.addFolder('Lights');
        this.gui.add(this.scene, 'selectedScene', this.scene.sceneNames).name("Selected scene").onChange(this.scene.onSwitchScene.bind(this.scene));
    }

    addLights(lights, numLights) {
        // adds numLights lights to the folder previously created
        // Light #i : (X, Y, Z)
        for (var i = 0; i < numLights; i++) {
            var lightpos = "(" + lights[i].position[0] + "," + lights[i].position[1] + "," + lights[i].position[2] + ")";
            this.lightfolder.add(lights[i], 'enabled').name("Light #" + i + ": " + lightpos);
        }
    }
    initCamerasUI(views) {
        this.gui.add(this.scene, 'selectedCamera', views).name('Active camera').onChange(this.scene.updateCameras.bind(this.scene));
        this.gui.add(this.scene, 'televisionCamera', views).name('Television camera').onChange(this.scene.updateCameras.bind(this.scene));
    }
    
    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}