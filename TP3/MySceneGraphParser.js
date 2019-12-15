var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var ANIMATIONS_INDEX = 7;
var PRIMITIVES_INDEX = 8;
var COMPONENTS_INDEX = 9;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraphParser {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        this.scene = scene;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded(new MySceneGraph(this.components, this.idRoot, this.views, this.defaultView, this.ambient, this.background, this.lights, this.materials, this.textures, this.animations));
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "lxs")
            return "root tag <lxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("globals")) == -1)
            return "tag <globals> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <globals> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <animations>
        if ((index = nodeNames.indexOf("animations")) == -1)
            return "tag <animations> missing";
        else {
            if (index != ANIMATIONS_INDEX)
                this.onXMLMinorError("tag <animations> out of order");

            //Parse transformations block
            if ((error = this.parseAnimations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }

        if (this.components[this.idRoot] == null)
            return "Didn't find any component for Root ID = " + this.idRoot;
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {
        var children = viewsNode.children;

        this.views = [];
        var numViews = 0;

        var defaultId = this.reader.getString(viewsNode, 'default');
        if (defaultId == null)
             return "no default ID defined for views";


        for (var i = 0; i < children.length; i++) {

            //Check type of light
            if (children[i].nodeName != "perspective" && children[i].nodeName != "ortho") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            var viewId,viewNear,viewFar,viewAngle,viewLeft,viewRight,viewTop,viewBottom;
            // Get id of the current view
            viewId = this.reader.getString(children[i], 'id');
            if (viewId == null)
                 return "no ID defined for view";
            // Checks for repeated IDs.
            if (this.views[viewId] != null)
                return "ID must be unique for each view (conflict: ID = " + viewId + ")";

            // Check if its default view
            viewNear = this.reader.getFloat(children[i], 'near');
            if (viewNear == null || isNaN(viewNear))
                return "no near defined for view with ID " + viewId;

            // Get the far value
            viewFar= this.reader.getFloat(children[i], 'far');
            if (viewFar == null || isNaN(viewFar))
                return "no far defined for view with ID " + viewId;

            
            if(children[i].nodeName == "perspective"){
                // Get the angle value for PERSPECTIVE view
                viewAngle= this.reader.getFloat(children[i], 'angle');
                if (viewAngle == null || isNaN(viewAngle))
                    return "no angle defined for view with ID " + viewId;
            } else {
                // Get the left right top and bottom value for ORTHO view
                viewLeft= this.reader.getFloat(children[i], 'left');
                if (viewLeft == null || isNaN(viewLeft))
                    return "no left defined for view with ID " + viewId;
                viewRight= this.reader.getFloat(children[i], 'right');
                if (viewRight == null || isNaN(viewRight))
                    return "no right defined for view with ID " + viewId;
                viewTop= this.reader.getFloat(children[i], 'top');
                if (viewTop == null || isNaN(viewTop))
                    return "no top defined for view with ID " + viewId;
                viewBottom= this.reader.getFloat(children[i], 'bottom');
                if (viewBottom == null || isNaN(viewBottom))
                    return "no bottom defined for view with ID " + viewId;
            }
        

            // Get up, to, from nodes, if they exist
            // If they dont exist, they'll be set to null/undefined
            var grandChildren = children[i].children;
            var nodeNames = []
            for (var j = 0; j < grandChildren.length; j++)
                nodeNames.push(grandChildren[j].nodeName)

            var fromNode = grandChildren[nodeNames.indexOf("from")];
            var toNode = grandChildren[nodeNames.indexOf("to")];
            var upNode = grandChildren[nodeNames.indexOf("up")];

            if (fromNode == null)
                return "FROM element is undefined for view with ID " + viewId;

            if (toNode == null)
                return "TO element is undefined for view with ID " + viewId;

            // Parses the from / to nodes for any view
            var attributeFrom = this.parseCoordinates3D(fromNode,"view FROM position for ID "+ viewId)
            var attributeTo = this.parseCoordinates3D(toNode,"view TO position for ID "+ viewId)
            if (!Array.isArray(attributeFrom))
                return attributeFrom;
            if (!Array.isArray(attributeTo))
                return attributeTo;

            // Adds the camera to the array, depending if ortho or perspective
            if(children[i].nodeName == "perspective"){
                this.views[viewId] = new CGFcamera(viewAngle * DEGREE_TO_RAD, viewNear, viewFar, attributeFrom, attributeTo);
            }
            else {
                // Parses the up node for ortho view, default is [0,1,0]
                var attributeUp = this.parseCoordinates3D(upNode);
                if (!Array.isArray(attributeUp))
                    attributeUp = [0,1,0];
                this.views[viewId] = new CGFcameraOrtho(viewLeft, viewRight, viewBottom, viewTop, viewNear, viewFar, attributeFrom, attributeTo, attributeUp);
            }
            numViews++;
        }
        if(numViews == 0)
            return "at least one view must be defined";
        
        this.defaultView = this.views[defaultId];
        if (this.defaultView == null)
            return "default view not defined, ID = " + defaultId;
            
        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseAmbient(ambientsNode) {

        var children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular", "attenuation"]);
                attributeTypes.push(...["position", "color", "color", "color", "vec3"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = this.reader.getBoolean(children[i], 'enabled');
            if (enableLight == null || !(enableLight == true || enableLight == false))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);
                var attribute;
                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        attribute = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else if (attributeTypes[j] == "vec3")
                        attribute = this.parseAttenuation(grandChildren[attributeIndex], "light attenuation for ID" + lightId);
                    else attribute = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);
 
                    if (!Array.isArray(attribute))
                        return attribute;

                    global.push(attribute);
                }
                else return "light " + attributeNames[j] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        this.textures = []; 
        //For each texture in textures block, check ID and file URL

        var children = texturesNode.children;
        var numTextures=0;
        for (var i = 0; i < children.length; i++) {
            // Ignores any tag that's not <texture>
            if (children[i].nodeName != "texture") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            //Get Texture ID
            var textureId = this.reader.getString(children[i], 'id');
            if (textureId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.textures[textureId] != null)
                return "ID must be unique for each texture (conflict: ID = " + textureId + ")";

            //Get Texture File
            var textureFile = this.reader.getString(children[i], 'file');
            if (textureFile == null)
                return "no File defined for texture with ID " + textureId;

            //Check if texture is png/jpg
            if(!(textureFile.endsWith(".png") || textureFile.endsWith(".jpg")))
                return "File " + textureFile + " is not a compatible image";
           
            
            //Check img Width/Height
            /*
            var texWidth,texHeight;
            var img = new Image();
            img.onload = function() {
                  textWidth = img.width;
                  texHeight = img.height;
                }
            img.src = textureFile;*/


            // verificar se ficheiro existe
            var texture = new CGFtexture(this.scene,textureFile);
            
            this.textures[textureId] = texture;
            numTextures++;
        }
        if (numTextures == 0)
            return "at least one texture must be defined";
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = [];

        var grandChildren = [];
        var nodeNames = [];

        var numMaterials = 0;

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {
            var attributeNames = [];

            // Ignores any tag that's not <material>
            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            } else {
                attributeNames.push(...["emission", "ambient", "diffuse", "specular"]);
            }

            // Get id of the current material.
            var materialId = this.reader.getString(children[i], 'id');
            if (materialId == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialId] != null)
                return "ID must be unique for each light (conflict: ID = " + materialId + ")";

            // Parses shininess value
            var materialShine = this.reader.getFloat(children[i], 'shininess');
            if (materialShine == null || isNaN(materialShine))
                return "no Shininess defined for material";

            grandChildren = children[i].children;

            // Specifications for the current material        
            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            // Creates array with attributes: [emission, ambient, diffuse, specular]
            var attributes=[];
            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);
                if (attributeIndex != -1) {
                    var attribute = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " property of the material with ID " + materialId);
                    if (!Array.isArray(attribute))
                        return attribute;
                    attributes.push(attribute);
                }
                else return "material " + attributeNames[j] + " undefined for ID  " + materialId;
            }

            // Adds to material array
            this.materials[materialId] = new Material(this.scene, attributes[0], attributes[1], attributes[2], attributes[3], materialShine)
            this.materials[materialId].setTextureWrap('REPEAT', 'REPEAT');            
            numMaterials++;    
        }

        if (numMaterials== 0)
            return "at least one material must be defined";
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = [];

        var grandChildren = [];

        var numTransformations = 0;
        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = children[i].children;

            // Specifications for the current transformation.      
            var transfMatrix = mat4.create();

            for (var j = 0; j < grandChildren.length; j++) {
                // parses primitive transformation to transfMatrix
                var error = this.parsePrimitiveTransformation(grandChildren[j], transfMatrix, "with ID " + transformationID)
                if (error != null)
                    return error;
            }
            this.transformations[transformationID] = transfMatrix;
            numTransformations++;
        }

        if (numTransformations == 0)
            return "at least one transformation must be defined";
        this.log("Parsed transformations");
        return null;
    }

        /**
     * Parses the <transformations> block.
     * @param {animations block element} animationsNode
     */
    parseAnimations(animationsNode) {
        var children = animationsNode.children;

        this.animations = [];

        var grandChildren = [];

        // Any number of animations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "animation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var animationID = this.reader.getString(children[i], 'id');
            if (animationID == null)
                return "no ID defined for animation";

            // Checks for repeated IDs.
            if (this.animations[animationID] != null)
                return "ID must be unique for each animation (conflict: ID = " + animationID + ")";

            // Checks if loop enabled
            let maxLoops = this.reader.getInteger(children[i], 'maxLoops');
            if (maxLoops == null) {
                maxLoops = 1;
                this.onXMLMinorError("Didn't find maxLoops for animation " + animationID + ", defaulting to 1");
            }
            if (maxLoops < 0)
                return "negative maxLoops for animation " + animationID;
            
            grandChildren = children[i].children;
            
            let keyframes = [];

            for (var j = 0; j < grandChildren.length; j++) {
                // parses primitive transformation to transfMatrix
                if (grandChildren[j].nodeName != 'keyframe') {
                    this.onXMLMinorError("Expected <keyframe>, got <" + grandChildren[j].nodeName + ">, ignoring");
                    continue;
                }
                var error = this.parseKeyframe(grandChildren[j], keyframes, "with ID " + animationID)
                if (error != null)
                    return error;
            }
            this.animations[animationID] = new MyAnimation(keyframes, maxLoops);
        }

        this.log("Parsed animations");
        return null;
    }

    /** TODO
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = [];

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus' && grandChildren[0].nodeName != 'cylinder2' &&
                    grandChildren[0].nodeName != 'plane' && grandChildren[0].nodeName != 'patch' &&
                    grandChildren[0].nodeName != 'prism')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, cylinder2, plane, patch, prism, sphere or torus) (ID = " + primitiveId + ")";
            }

            // Specifications for the current primitive.
            var primitiveNode = grandChildren[0];
            var primitiveType = primitiveNode.nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {
                // Gets rectangle bottom left and top right vertices
                var x1 = this.parsePrimitiveCoordinate(primitiveNode, 'x1');
                var x2 = this.parsePrimitiveCoordinate(primitiveNode, 'x2');
                var y1 = this.parsePrimitiveCoordinate(primitiveNode, 'y1');
                var y2 = this.parsePrimitiveCoordinate(primitiveNode, 'y2');

                if (isNaN(x1))
                    return x1

                if (isNaN(x2))
                    return x2

                if (isNaN(y1))
                    return y1

                if (isNaN(y2))
                    return y2

                // Enforcing (x1, y1) to be bottom left
                if (x1 >= x2 || y1 >= y2)
                    return "unable to parse primitive with ID = " + primitiveId + ": x2/y2 must be greater than x1/y1"

                this.primitives[primitiveId] = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);
            }
            else if (primitiveType == 'triangle') {
                // Gets the coordinates of the three vertices
                var x1 = this.parsePrimitiveCoordinate(primitiveNode, 'x1');
                var x2 = this.parsePrimitiveCoordinate(primitiveNode, 'x2');
                var x3 = this.parsePrimitiveCoordinate(primitiveNode, 'x3');
                var y1 = this.parsePrimitiveCoordinate(primitiveNode, 'y1');
                var y2 = this.parsePrimitiveCoordinate(primitiveNode, 'y2');
                var y3 = this.parsePrimitiveCoordinate(primitiveNode, 'y3');
                var z1 = this.parsePrimitiveCoordinate(primitiveNode, 'z1');
                var z2 = this.parsePrimitiveCoordinate(primitiveNode, 'z2');
                var z3 = this.parsePrimitiveCoordinate(primitiveNode, 'z3');

                if (isNaN(x1))
                    return x1
                if (isNaN(x2))
                    return x2
                if (isNaN(x3))
                    return x3
                if (isNaN(y1))
                    return y1
                if (isNaN(y2))
                    return y2
                if (isNaN(y3))
                    return y3
                if (isNaN(z1))
                    return z1
                if (isNaN(z2))
                    return z2
                if (isNaN(z3))
                    return z3

                this.primitives[primitiveId] = new MyTriangle(this.scene, [x1,y1,z1], [x2,y2,z2], [x3,y3,z3]);
            }
            else if (primitiveType == 'cylinder' || primitiveType == 'cylinder2') {
                // Gets the cylinder base radius (must be >= 0)
                var base = this.reader.getFloat(primitiveNode, 'base');
                if (base == null || isNaN(base) || base < 0)
                    return "unable to parse base of the cylinder primitive with ID = " + primitiveId;

                // Gets the cylinder top radius (must be >= 0)
                var top = this.reader.getFloat(primitiveNode, 'top');
                if (top == null || isNaN(top) || top < 0)
                    return "unable to parse top of the cylinder primitive with ID = " + primitiveId;
    
                // Gets the cylinder height (must be >= 0)
                var height = this.reader.getFloat(primitiveNode, 'height');
                if (height == null || isNaN(height) || height < 0)
                    return "unable to parse height of the cylinder primitive with ID = " + primitiveId;

                // Gets the cylinder slice number (must be >= 0)
                var slices = this.reader.getInteger(primitiveNode, 'slices');
                if (slices == null || isNaN(slices) || slices < 0)
                    return "unable to parse slices of the cylinder primitive with ID = " + primitiveId;

                // Gets the cylinder stack number (must be >= 0)
                var stacks = this.reader.getInteger(primitiveNode, 'stacks');
                if (stacks == null || isNaN(stacks) || stacks < 0)
                    return "unable to parse stacks of the cylinder primitive with ID = " + primitiveId;
    
                if (primitiveType == 'cylinder')
                    this.primitives[primitiveId] = new MyCilinder(this.scene, base, top, height, slices, stacks);
                else this.primitives[primitiveId] = new MyCilinder2(this.scene, base, top, height, slices, stacks);
            } else if (primitiveType == 'sphere') {
                // Gets the sphere radius (must be >= 0)
                var radius = this.reader.getFloat(primitiveNode, 'radius');
                if (radius == null || isNaN(radius) || radius < 0)
                    return "unable to parse radius of the sphere primitive with ID = " + primitiveId;

                // Gets the sphere slice number (must be >= 0)
                var slices = this.reader.getInteger(primitiveNode, 'slices');
                if (slices == null || isNaN(slices) || slices < 0)
                    return "unable to parse slices of the sphere primitive with ID = " + primitiveId;

                // Gets the sphere stack number (must be >= 0)
                var stacks = this.reader.getInteger(primitiveNode, 'stacks');
                if (stacks == null || isNaN(stacks) || stacks < 0)
                    return "unable to parse stacks of the sphere primitive with ID = " + primitiveId;

                this.primitives[primitiveId] = new MySphere(this.scene, stacks, slices, radius);
            }
            else if (primitiveType == 'torus') {

                // Gets the torus inner radius (must be >= 0)
                var inner = this.reader.getFloat(primitiveNode, 'inner');
                if (inner == null || isNaN(inner) || inner < 0)
                    return "unable to parse inner of the torus primitive with ID = " + primitiveId;

                // Gets the torus outer radius (must be >= 0)
                var outer = this.reader.getFloat(primitiveNode, 'outer');
                if (outer == null || isNaN(outer) || outer < 0)
                    return "unable to parse outer of the torus primitive with ID = " + primitiveId;

                // Gets the torus slice number (must be >= 0)
                var slices = this.reader.getInteger(primitiveNode, 'slices');
                if (slices == null || isNaN(slices) || slices < 0)
                    return "unable to parse slices of the torus primitive with ID = " + primitiveId;

                // Gets the torus stack number (must be >= 0)
                var loops = this.reader.getInteger(primitiveNode, 'loops');
                if (loops == null || isNaN(loops) || loops < 0)
                    return "unable to parse loops of the torus primitive with ID = " + primitiveId;
                
                this.primitives[primitiveId] = new MyTorus(this.scene, slices, loops, inner, outer);
            }
            else if (primitiveType == 'patch') {//npointsU=“ii” npointsV=“ii” npartsU=“ii” npartsV=“ii”
                var patchNodeChildren = primitiveNode.children;

                var npointsU = this.reader.getInteger(primitiveNode, 'npointsU');
                if (npointsU == null || isNaN(npointsU) || npointsU < 0)
                    return "unable to parse npointsU of the patch primitive with ID = " + primitiveId;

                var npointsV = this.reader.getInteger(primitiveNode, 'npointsV');
                if (npointsV == null || isNaN(npointsV) || npointsV < 0)
                    return "unable to parse npointsV of the patch primitive with ID = " + primitiveId;

                var npartsU = this.reader.getInteger(primitiveNode, 'npartsU');
                if (npartsU == null || isNaN(npartsU) || npartsU < 0)
                    return "unable to parse npartsU of the patch primitive with ID = " + primitiveId;

                var npartsV = this.reader.getInteger(primitiveNode, 'npartsV');
                if (npartsV == null || isNaN(npartsV) || npartsV < 0)
                        return "unable to parse npartsV of the patch primitive with ID = " + primitiveId;
                var j=0;
                var points = [];
                for (var u = 0; u < npointsU; u++){
                    var pointsU = [];
                    for(var v = 0 ; v < npointsV;v++, j++){
                        if (patchNodeChildren[j].nodeName != "controlpoint") {
                            this.onXMLMinorError("unknown tag <" + patchNodeChildren[j].nodeName + ">");
                            continue;
                        }
                        
                        var xx = this.reader.getFloat(patchNodeChildren[j], 'xx');
                        if (xx == null || isNaN(xx))
                            return "unable to parse xx of the patch primitive with ID = " + primitiveId +" ; controlpoint num: " + (j+1);
                        var yy = this.reader.getFloat(patchNodeChildren[j], 'yy');
                        if (yy == null || isNaN(yy))
                            return "unable to parse yy of the patch primitive with ID = " + primitiveId +" ; controlpoint num: " + (j+1);
                        var zz = this.reader.getFloat(patchNodeChildren[j], 'zz');
                        if (zz == null || isNaN(zz))
                            return "unable to parse zz of the patch primitive with ID = " + primitiveId +" ; controlpoint num: " + (j+1);
                    
                        pointsU.push([xx,yy,zz,1]);
                    }
                    points.push(pointsU);
                }
                this.primitives[primitiveId] = new MyPatch(this.scene,npointsU,npointsV,npartsU,npartsV,points);                
            }
            else if (primitiveType == 'plane') {
                var npartsU = this.reader.getInteger(primitiveNode, 'npartsU');
                if (npartsU == null || isNaN(npartsU) || npartsU < 0)
                    return "unable to parse npartsU of the plane primitive with ID = " + primitiveId;

                var npartsV = this.reader.getInteger(primitiveNode, 'npartsV');
                if (npartsV == null || isNaN(npartsV) || npartsV < 0)
                        return "unable to parse npartsV of the plane primitive with ID = " + primitiveId;

                this.primitives[primitiveId] = new MyPlane(this.scene,npartsU,npartsV);                
            }

            else if (primitiveType == 'prism') {
                var parts = this.reader.getInteger(primitiveNode, 'parts');
                if (parts == null || isNaN(parts) || parts < 0)
                    return "unable to parse parts of the plane primitive with ID = " + primitiveId;

                this.primitives[primitiveId] = new MyPrism(this.scene, parts);                
            }

        }

        this.log("Parsed primitives");
        return null;
    }

    /**
     * Parses a coordinate with a given name
     * @param {Node to be parsed} node 
     * @param {Name of the attribute} name 
     * @param {Primitive id} id 
     */
    parsePrimitiveCoordinate(node, name, id) {
        var coord = this.reader.getFloat(node, name);
        if (!(coord != null && !isNaN(coord)))
            return "unable to parse " + name + " of the primitive coordinates for ID = " + id;
        return coord;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        var children = componentsNode.children;

        this.components = [];

        var grandChildren = [];
        var nodeNames = [];

        var numComponents = 0;

        var componentIDs = []
        // Any number of components.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            var materialIndex = nodeNames.indexOf("material");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");
            var animationsIndex = nodeNames.indexOf("animationref");

            // Verify if blocks exist
            if (transformationIndex == -1)
                return "No transformation block for component with ID = " + componentID;
            if (materialIndex == -1)
                return "No material block for component with ID = " + componentID;
            if (textureIndex == -1)
                return "No texture block for component with ID = " + componentID;
            if (childrenIndex == -1)
                return "No children block for component with ID = " + componentID;

            // Transformations
            var transformation = this.parseComponentTransformation(grandChildren[transformationIndex]);
            if (transformation == null)
                return "Couldn't parse transformations for component with ID = " + componentID;
                
            // Materials
            var material = this.parseComponentMaterial(grandChildren[materialIndex]);
            if (material == null)
                return "Couldn't parse material for component with ID = " + componentID;
                
            // Texture
            var compTexture = this.parseComponentTexture(grandChildren[textureIndex]);
            if (compTexture == null)
                return "Couldn't parse texture for component with ID = " + componentID;

            // Children
            var compChildren = this.parseComponentChildren(grandChildren[childrenIndex]);
            if (compChildren == null)
                return "Couldn't parse children for component with ID = " + componentID;

                // Animations
            let compAnimation = null;
            if (animationsIndex != -1) {
                compAnimation = this.parseComponentAnimation(grandChildren[animationsIndex]);
                if (compAnimation == null)
                    return "Couldn't parse animations for component with ID = " + componentID;
            }
                
            this.components[componentID] = new Component(this.scene, compChildren, transformation, compAnimation, material, compTexture);
            componentIDs.push(componentID)
            numComponents++;
        }

        // Then goes to get the components by their IDs
        for (var i = 0; i < componentIDs.length; i++) {
            var component = this.components[componentIDs[i]];
            for (var j = 0; j < component.children.length; j++) {
                // childID will either be a primitive or the component ID
                var childID = component.children[j]
                if (childID instanceof CGFobject)
                    continue;
                // Gets the component
                var referencedComponent = this.components[childID];
                if (referencedComponent == null)
                    return "Couldn't parse children for component with ID = " + componentIDs[i] + ", child ID not found: " + childID;
                // Replaces the ID by the actual component
                component.children[j] = referencedComponent;
            }
        }

        if (numComponents == 0)
            return "No components defined"
    }

    /**
     * Parse a transformation node for a component
     * @param {transformation node} node 
     * @param {component id} id 
     */
    parseComponentTransformation(node) {
        var transformation = mat4.create();

        var children = node.children;

        // Any number of transformations
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName == 'transformationref') {
                // Finds transformation with given ID
                var transfID = this.reader.getString(children[i], 'id');
                var transfRef = this.transformations[transfID];
                if (transfRef == null) {
                    this.onXMLError("couldn't find transformation with ID " + transfID + " for component");
                    return null;
                }

                // Multiplies to current matrix
                mat4.multiply(transformation, transformation, transfRef);
            }
            else {
                // parses translation / rotation / scaling and returns if error shows up
                var error = this.parsePrimitiveTransformation(children[i], transformation, "for component");
                if (error != null) {
                    this.onXMLError(error);
                    return null;
                }                
            }
        }
        return transformation;
    }

    
    /**
     * Parse a material node for a component
     * @param {material node} node 
     * @param {component id} id 
     */
    parseComponentMaterial(node) {
        // Gets the ID attribute from the material, returning an error if it does not exist
        var ID = this.reader.getString(node, 'id');
        if (ID == null) {
            this.onXMLError("No ID found for component material");
            return null;
        }

        // -1 material will be considered as inherited
        if (ID == "inherit")
            return -1;

        // Searches for material with given ID
        // In this case, null means it's not present
        var material = this.materials[ID];
        if (material == null) {
            this.onXMLError("Couldn't find material with ID " + ID + " for component");
            return null;
        }

        return material;
    }

    /**
     * Parse a texture node for a component
     * @param {texture node} node 
     * @param {component id} id 
     */
    parseComponentTexture(node) {
        // Gets XML attributes and looks up texture
        var ID = this.reader.getString(node, 'id');
        var length_s = this.reader.getFloat(node, 'length_s', false); // not required
        var length_t = this.reader.getFloat(node, 'length_t', false); // not required
        var texture = this.textures[ID];

        // Verifies if attributes exist, defaulting / returning if not
        if (ID == null) {
            this.onXMLError("No ID found for component texture");
            return null;
        }

        // Passes no texture for inherit
        if (ID == 'inherit') {
            if (length_s != null)
                this.onXMLMinorError("Component texture set as inherit, length_s will be ignored");
            if (length_t != null)
                this.onXMLMinorError("Component texture set as inherit, length_t will be ignored");
            return new InheritedTexture();
        }
    
        // Makes no texture for none
        if (ID == 'none') {
            if (length_s != null)
                this.onXMLMinorError("Component texture set as none, length_s will be ignored");
            if (length_t != null)
                this.onXMLMinorError("Component texture set as none, length_t will be ignored");
            return new ComponentTexture(null, 1, 1);   
        }
    
        
        if (length_s == null || isNaN(length_s)) {
            this.onXMLMinorError("Couldn't parse length_s for component texture, defaulting to 1 (texture ID = " + ID + ")");
            length_s = 1;
        }
        
        if (length_t == null || isNaN(length_t)) {
            this.onXMLMinorError("Couldn't parse length_t for component texture, defaulting to 1 (texture ID = " + ID + ")");
            length_t = 1;
        }

        if (texture == null) {
            this.onXMLError("Couldn't find texture with ID " + ID + " for component");
            return null;
        }

        // If ID was found, returns proper texture
        return new ComponentTexture(texture, length_s, length_t);        
    }

    /**
     * Parse a children node for a component
     * @param {children node} node 
     * @param {component id} id 
     */
    parseComponentChildren(node) {
        var children = node.children;
        
        var componentChildren = [];
        for (var i = 0; i < children.length; i++) {
            // Gets the ID attribute from the child, returning an error if it does not exist
            var ID = this.reader.getString(children[i], 'id');
            if (ID == null) {
                this.onXMLError("No ID found for component child");
                return null;
            }
            switch (children[i].nodeName) {
                case 'componentref':
                    // Adds ID so component can be grabbed in the end
                    componentChildren.push(ID);
                    break;
                case 'primitiveref':
                    // Searches for primitive with given ID, with null meaning it's not present
                    var primitive = this.primitives[ID];
                    if (primitive == null) {
                        this.onXMLError("Couldn't find primitive child with ID " + ID);
                        return null;
                    }
                    componentChildren.push(primitive);
                    break;
                default:
                    // Not a valid tag
                    this.onXMLMinorError("Expected <componentref> or <primitiveref> tag, found <" + children[i].nodeName + ">, ignoring");
                    break;
            }
        }

        // Minimum of 1 children
        if (componentChildren.length == 0) {
            this.onXMLError("No children found for component");
            return null;
        }
        return componentChildren;
    }

    parseComponentAnimation(node) {
        let ID = this.reader.getString(node, 'id');
        if (ID == null) {
            this.onXMLError("No ID found for component animation");
            return null;
        }

        // Searches for material with given ID
        // In this case, null means it's not present
        let animation = this.animations[ID];
        if (animation == null) {
            this.onXMLError("Couldn't find animation with ID " + ID + " for component");
            return null;
        }

        return animation;
    }

    /**
     * Parses a translation, scaling or rotation
     * @param {Primitive transformation node} node 
     * @param {Current transformation matrix (to be multiplied to)} currMatrix 
     * @param {Message to show along the error info, if there's one} errorMSG 
     */
    parsePrimitiveTransformation(node, currMatrix, errorMSG) {
        switch (node.nodeName) {
            // Translation: gets x y z and returns if error occurs
            case 'translate':
                var coordinates = this.parseCoordinates3D(node, "translate transformation " + errorMSG);
                if (!Array.isArray(coordinates))
                    return coordinates;

                mat4.translate(currMatrix, currMatrix, coordinates);
                break;
            // Scaling: gets x y z scale and returns if error occurs
            case 'scale':                      
                var vector = this.parseCoordinates3D(node, "scale transformation " + errorMSG);
                if (!Array.isArray(vector))
                    return vector;

                mat4.scale(currMatrix, currMatrix, vector);
                break;
            // Rotation: gets axis and angle, returns if error occurs
            case 'rotate':
                // getting angle
                var angle = this.reader.getFloat(node, "angle");
                if (angle == null || isNaN(angle))
                    return "unable to parse angle of rotate transformation " + errorMSG;

                // getting axis and applying transformation to matrix
                var axis = this.reader.getString(node, "axis");

                if (axis == 'x')
                    mat4.rotate(currMatrix, currMatrix, angle * DEGREE_TO_RAD, [1, 0, 0]);
                else if (axis == 'y')
                    mat4.rotate(currMatrix, currMatrix, angle * DEGREE_TO_RAD, [0, 1, 0]);
                else if (axis == 'z')
                    mat4.rotate(currMatrix, currMatrix, angle * DEGREE_TO_RAD, [0, 0, 1]);
                else return "unable to parse axis for rotate transformation " + errorMSG;

                break;
            default: 
                this.onXMLMinorError("Unknown transformation type: " + node.nodeName + ", ignoring");
                break;
        }
        return null;
    }

    /**
     * Parses a keyframe
     * @param {Primitive transformation node} node 
     * @param {Current keyframe array (to be added to)} currArray 
     * @param {Message to show along the error info, if there's one} errorMSG 
     */
    parseKeyframe(node, currArray, errorMSG) {
        let instant = this.reader.getFloat(node, "instant");
        if (instant == null || isNaN(instant))
            return "unable to parse keyframe instant for animation " + errorMSG;
        let children = node.children;
        let T, R, S;
        for (let i = 0; i < children.length; i++) {
            switch (children[i].nodeName) {
                case 'translate':
                    var coordinates = this.parseCoordinates3D(children[i], "translate component of animation " + errorMSG);
                    if (!Array.isArray(coordinates))
                        return coordinates;
                    
                    T = new AnimTransformation(coordinates[0], coordinates[1], coordinates[2]);                    
                    break;
                case 'rotate':
                    var coordinates = this.parseKeyframeRotation(children[i], "rotate component of animation " + errorMSG);
                    if (!Array.isArray(coordinates))
                        return coordinates;
                    
                    R = new AnimTransformation(coordinates[0] * DEGREE_TO_RAD, coordinates[1] * DEGREE_TO_RAD, coordinates[2] * DEGREE_TO_RAD);                    
                    break;
                case 'scale':
                    var coordinates = this.parseCoordinates3D(children[i], "scale component of animation " + errorMSG);
                    if (!Array.isArray(coordinates))
                        return coordinates;
                    
                    S = new AnimTransformation(coordinates[0], coordinates[1], coordinates[2]);                    
                    break;
            }
    

        }

        if (T == null)
            return "missing translate component for animation " + errorMSG;

        if (R == null)
            return "missing rotate component for animation " + errorMSG;

        if (S == null)
            return "missing scale component for animation " + errorMSG;

        if (children.length != 3)
            return "unexpected keyframe components for animation " + errorMSG;

        currArray.push(new KeyFrame(instant, T, R, S));

        return null;
    }


    /**
     * Parse the constant, linear, quadratic attenuation from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseAttenuation(node, messageError) {
        var attenuation = [];

        // constant
        var constant = this.reader.getFloat(node, 'constant');
        if (!(constant != null && !isNaN(constant)))
            return "unable to parse constant attenuation of the " + messageError;

        // linear
        var linear = this.reader.getFloat(node, 'linear');
        if (!(linear != null && !isNaN(linear)))
            return "unable to parse linear attenuation of the " + messageError;

        // quadratic
        var quadratic = this.reader.getFloat(node, 'quadratic');
        if (!(quadratic != null && !isNaN(quadratic)))
            return "unable to parse quadratic attenuation of the " + messageError;

        attenuation.push(...[constant, linear, quadratic]);

        return attenuation;
    }

        /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    parseKeyframeRotation(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'angle_x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-angle of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'angle_y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-angle of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'angle_z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-angle of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }


    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }
}