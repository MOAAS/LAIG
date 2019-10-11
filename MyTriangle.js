/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param A - left vertex
 * @param B - right vertex
 * @param C - Middle vertex
 */
class MyTriangle extends CGFobject {
	constructor(scene, A, B, C) {
		super(scene);
		this.x1 = A[0];
		this.x2 = B[0];
		this.x3 = C[0];

		this.y1 = A[1];
		this.y2 = B[1];
		this.y3 = C[1];

		this.z1 = A[2];
		this.z2 = B[2];
		this.z3 = C[2];

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [
			this.x1, this.y1, this.z1,	//0
			this.x2, this.y2, this.z2,	//1
			this.x3, this.y3, this.z3	//2
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
		];

		// U = B - A, V = C - A
		let U = [this.x2 - this.x1, this.y2 - this.y1, this.z2 - this.z1]
		let V = [this.x3 - this.x1, this.y3 - this.y1, this.z3 - this.z1]

		// Cross product U x V
		let normal = [
			U[1] * V[2] - U[2] * V[1],
			U[2] * V[0] - U[0] * V[2],
			U[0] * V[1] - U[1] * V[0],			
		]

		//Facing Z positive
		this.normals = [
			normal[0], normal[1], normal[2],
			normal[0], normal[1], normal[2],
			normal[0], normal[1], normal[2]
		];
		
		/*
		Texture coords (s,t)
		+----------> s
        |
        |
		|
		v
        t
        */

		var a = Math.sqrt(Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2) + Math.pow(this.z2 - this.z1, 2))
		var b = Math.sqrt(Math.pow(this.x2 - this.x3, 2) + Math.pow(this.y2 - this.y3, 2) + Math.pow(this.z2 - this.z3, 2))
		var c = Math.sqrt(Math.pow(this.x1 - this.x3, 2) + Math.pow(this.y1 - this.y3, 2) + Math.pow(this.z1 - this.z3, 2))

		var cos = ((a * a) - (b * b) + (c * c)) / (2 * a * c);
		var sin = Math.sqrt(1 - cos * cos);

		this.texCoords = [
			0, 0,
			a, 0,
			c * cos, c * sin
		]
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}
}

