class MyCilinder2 extends CGFobject {
    constructor(scene, base, top, height, slices, stacks){
        super(scene);
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;
        //this.weight = 2/3; //nao faco ideia pq mas fui pondo valores ate dar um circulo
        this.makeSurface();
    }
    makeSurface(){
        this.texCoords = [];
       var controlcoords1=[	// U = 0
        [ // V = 0..1;
            [ -this.base, 0, 0, 1 ], //1
            [ -this.base, this.base*4/3, 0, 1 ], //2
            [ this.base, this.base*4/3, 0, 1 ],
            [ this.base, 0, 0, 1 ] //3
           
       ],
       // U = 1
       [ // V = 0..1
        [ -this.top, 0, this.height, 1 ], //1
        [ -this.top, this.top*4/3, this.height, 1 ], //2
        [ this.top, this.top*4/3, this.height, 1 ], //2
        [ this.top, 0, this.height, 1 ] //3						 
       ]
    ];
    
    var controlcoords2=[	// U = 0
        [ // V = 0..1;
            [ this.base, 0, 0, 1 ], //1
            [ this.base, -this.base*4/3, 0, 1 ],//2
            [ -this.base, -this.base*4/3, 0, 1 ], //3
            [ -this.base, 0, 0, 1 ] //4
           
       ],
       // U = 1
       [ // V = 0..1
        [ this.top, 0, this.height, 1 ], //1
        [ this.top, -this.top*4/3, this.height, 1 ], //2
        [ -this.top, -this.top*4/3, this.height, 1 ], //3
        [ -this.top, 0, this.height, 1 ] //4
       ]
    ];
    
    this.cilQuad1 = new MyPatch(this.scene,2,4,this.slices/2,this.stacks,controlcoords1);
    this.cilQuad2 = new MyPatch(this.scene,2,4,this.slices/2,this.stacks,controlcoords2);
    }
    display(){
        this.cilQuad1.display();
        this.cilQuad2.display();
    }
}