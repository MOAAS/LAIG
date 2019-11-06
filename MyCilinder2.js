class MyCilinder2 extends CGFobject {
    constructor(scene, base, top, height, slices, stacks){
        super(scene);
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;
        this.weight = 2/3; //nao faco ideia pq mas fui pondo valores ate dar um circulo
        this.makeSurface();
    }
    makeSurface(){
        this.texCoords = [];
        var controlcoords1=[	// U = 0
            [ // V = 0..1;
                [ 0, this.base, 0, 1 ],
                [ this.base, this.base, 0, this.weight ],
                [ this.base, 0, 0, 1 ]
               
           ],
           // U = 1
           [ // V = 0..1
                [ 0, this.top, this.height, 1 ],
                [ this.top, this.top, this.height, this.weight],
                [ this.top, 0, this.height, 1 ]							 
           ]
        ];
        var controlcoords2=[	// U = 0
            [ // V = 0..1;
                [ -this.base, 0, 0, 1 ],
                [ -this.base, this.base, 0, this.weight ],
                [ 0, this.base, 0, 1 ],
               
           ],
           // U = 1
           [ // V = 0..1
            [ -this.top, 0, this.height, 1 ],
            [ -this.top, this.top, this.height, this.weight],
            [ 0, this.top, this.height, 1 ]							 
           ]
        ];
        var controlcoords3=[	// U = 0
            [ // V = 0..1;
                [ 0, -this.base, 0, 1 ],
                [ -this.base, -this.base, 0, this.weight ],
                [ -this.base, 0, 0, 1 ]
               
           ],
           // U = 1
           [ // V = 0..1
                [ 0, -this.top, this.height, 1 ],
                [ -this.top, -this.top, this.height, this.weight],
                [ -this.top, 0, this.height, 1 ]							 
           ]
        ];
        var controlcoords4=[	// U = 0
            [ // V = 0..1;
                [ this.base, 0, 0, 1 ],
                [ this.base, -this.base, 0, this.weight ],
                [ 0, -this.base, 0, 1 ]
               
           ],
           // U = 1
           [ // V = 0..1
                [ this.top, 0, this.height, 1 ]	,
                [ this.top, -this.top, this.height, this.weight],
                [ 0, -this.top, this.height, 1 ]						 
           ]
        ];
        this.cilQuad1 = new MyPatch(this.scene,2,3,this.slices/4,this.stacks,controlcoords1);
        this.cilQuad2 = new MyPatch(this.scene,2,3,this.slices/4,this.stacks,controlcoords2);
        this.cilQuad3 = new MyPatch(this.scene,2,3,this.slices/4,this.stacks,controlcoords3);
        this.cilQuad4 = new MyPatch(this.scene,2,3,this.slices/4,this.stacks,controlcoords4);
    }
    display(){
        this.cilQuad1.display();
        this.cilQuad2.display();
        this.cilQuad3.display();
        this.cilQuad4.display();
    }
}