var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();
        this.interface = myinterface;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);

        this.fps = 60;
        this.setUpdatePeriod(1000 / this.fps);
        this.table = new CGFOBJModel(this,"../models/woodtable.obj",false)


        this.switchScene("board.xml")

        //this.tvshader = new CGFshader(this.gl, "shaders/tv.vert", "shaders/tv.frag");
       // this.tvshader.setUniformsValues({ uSampler : 1, time: 0 })
    }

    switchScene(filename) {
        // create and load graph, and associate it to scene. 
        // Check console for loading errors
        new MySceneGraphParser(filename, this);
        this.scenefile = filename;
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
        this.televisionCamera = new CGFcamera(1, 0.1, 500, vec3.fromValues(0, 0, 0), vec3.fromValues(-15, 2, 0));
    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.

        for (let i = 0; i < 8; i++)
            this.lights[i].disable();
            
        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.
            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];

                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);
                this.lights[i].setConstantAttenuation(light[6][0]);
                this.lights[i].setLinearAttenuation(light[6][1]);
                this.lights[i].setQuadraticAttenuation(light[6][2]);

                if (light[1] == "spot") {
                    this.lights[i].setSpotCutOff(light[7]);
                    this.lights[i].setSpotExponent(light[8]);
                    this.lights[i].setSpotDirection(light[9][0], light[9][1], light[9][2]);
                }

                this.lights[i].setVisible(false);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }
        }

        this.numLights = i;
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }

        
    setCamera(cameraName, freeLook) {
        this.selectedCamera = cameraName;
        if (freeLook)
            this.interface.setActiveCamera(this.graph.views[cameraName]);
    }

    updateCameras() {
        this.setCamera(this.selectedCamera, true);
    }

    animateCameraOrbit(angle, axis, time) {
        let numMoves = time * this.fps;
        let anglePerMove = angle / numMoves;
        let interval = time / numMoves;
        for (let i = 0; i < numMoves; i++) {
            setTimeout(() => this.camera.orbit(axis, anglePerMove), i * interval * 1000);
        }
    }

    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded(graph) {
        this.graph = graph;
        this.axis = new CGFaxis(this, 5);

        // -- Sets up background colors and lights -- //
        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);
        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);
        this.initLights();

        // -- Sets up interface -- //
        // Clears interface
        this.interface.clear();
        // adds the lights to the interface drop down
        this.interface.addLights(this.lights, this.numLights);

        // Gets the current and the camera list from the graph
        var cameraKeys = [];
        for (var key in this.graph.views) {
            if (this.graph.defaultView == this.graph.views[key])
                this.selectedCamera = key;
            cameraKeys.push(key);
        }
        this.televisionCamera = 'television';

        // Initializes camera list with the keys (IDs) of the cameras
        this.updateCameras()
        this.interface.initCamerasUI(cameraKeys);

        switch(this.scenefile) {
            case 'board.xml': new RoomInteraction(this.graph, this).setup(); break;// normal
            case 'board3.xml': new PoolInteraction(this.graph, this).setup(); break; // pool
        }

        // -- Sets up game -- //
        if (this.game == null) {
            this.game = new BoardGame(this, graph); 
        }
        else {
            this.game.toNewGraph(graph);
        }
    }

    logPicking() {
        if (this.pickMode == false) {
            if (this.pickResults != null && this.pickResults.length > 0) {
                for (let i = 0; i < this.pickResults.length; i++) {
                    let object = this.pickResults[i][0];
                    if (object != null)
                        object.onPick()		
                }
                this.pickResults.splice(0, this.pickResults.length);
            }
        }
    }

    updatelightpos(t) {
        let dt = (t - this.inittime) / 1000;
        let angle = dt * 2 * Math.PI / 70;
        this.lights[0].setPosition(-Math.sin(angle)*300,30,-Math.cos(angle)*300,0);
        this.lights[0].update();
    }


    update(t) {
        //this.shader.setUniformsValues({ time: t })

        // In case it's not loaded
        if (this.graph == null)
            return;

        this.graph.update(t)
        this.game.update(t);

        if(this.ontest){
            this.updatelightpos(t)
        }

        if (this.gui.isKeyPressed("KeyB") && !this.onBoard) {
            this.switchScene('board.xml')
            this.onBoard = true;
            this.ontest = false;
            this.onpool = false;
        }
        if (this.gui.isKeyPressed("KeyT") && !this.ontest) {
            this.switchScene('board4.xml')            
            this.ontest = true;
            this.onBoard = false;
            this.onpool = false;
            this.inittime = t;
        }
        if (this.gui.isKeyPressed("KeyP") && !this.onpool) {
            this.switchScene('board3.xml')
            this.onpool = true;
            this.onBoard = false;
            this.ontest = false;
        }

    }


    
    display() {
        // In case it's not loaded
        if (this.graph == null)
            return;

        this.logPicking();

        let rtt = new CGFtextureRTT(this, this.gl.canvas.width, this.gl.canvas.height);
        rtt.attachToFrameBuffer();
        this.render(this.graph.views[this.televisionCamera]);
        rtt.detachFromFrameBuffer();
        this.graph.components['tvscreen'].texture = new ComponentTexture(rtt, 1, 1);
        this.render(this.graph.views[this.selectedCamera]);

      //  this.setActiveShader(this.tvshader);
      //  this.setActiveShader(this.defaultShader)

    }
    /**
     * Displays the scene.
     */
    render(camera) {
        // ---- BEGIN Background, camera and axis setup
        this.camera = camera;

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.setDefaultAppearance()
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        // Draw axis
        this.axis.display();
        // ---- END Background, camera and axis setup

        for (let i = 0; i < this.lights.length; i++) {
           // this.lights[i].setVisible(this.lights[i].enabled);
            this.lights[i].update();
        }

        this.graph.display();


        //this.scale(10,10,10);
        //this.table.display();
    }
}