class GameTimer extends Component {
    constructor(scene, graph, transformation) {
        let timerdigit1 = graph.components['timerdigit1'].clone();
        let timerdigit2 = graph.components['timerdigit2'].clone();
        let timerdigit3 = graph.components['timerdigit3'].clone();
        let timerdigit4 = graph.components['timerdigit4'].clone();
        let timercolon = graph.components['timercolon'].clone();
        let timerscreenbg = graph.components['timerscreenbg'];

        let timerbody = graph.components['timerbody'];

        let timerscreen = new Component(
            scene, 
            [timerdigit1, timerdigit2, timerdigit3, timerdigit4, timercolon, timerscreenbg],
            new Translation(0.71, 0.5, 0).getMatrix()
        )

        super(scene, [timerscreen, timerbody], transformation.getMatrix());

        this.scene = scene;
        this.graph = graph;
        this.timerdigit1 = timerdigit1
        this.timerdigit2 = timerdigit2
        this.timerdigit3 = timerdigit3
        this.timerdigit4 = timerdigit4
        this.timercolon = timercolon;

        this.reset(0, 0);
        this.pause();
    }

    toNewGraph(graph) {
        this.graph = graph;
        let timer = new GameTimer(this.scene, this.graph, new Translation(0, 0, 0));
        this.children = timer.children;
        this.timerdigit1 = timer.timerdigit1
        this.timerdigit2 = timer.timerdigit2
        this.timerdigit3 = timer.timerdigit3
        this.timerdigit4 = timer.timerdigit4
        this.timercolon = timer.timercolon;

        this.graph.addComponent(this);
        this.updateDigitTextures();        
    }

    setDigitTexture(component, digitValue) {
        switch (digitValue) {
            case 1: component.setTexture(this.graph.textures['timer1']); break;
            case 2: component.setTexture(this.graph.textures['timer2']); break;
            case 3: component.setTexture(this.graph.textures['timer3']); break;
            case 4: component.setTexture(this.graph.textures['timer4']); break;
            case 5: component.setTexture(this.graph.textures['timer5']); break;
            case 6: component.setTexture(this.graph.textures['timer6']); break;
            case 7: component.setTexture(this.graph.textures['timer7']); break;
            case 8: component.setTexture(this.graph.textures['timer8']); break;
            case 9: component.setTexture(this.graph.textures['timer9']); break;
            case 0: component.setTexture(this.graph.textures['timer0']); break;
            default: component.setTexture(this.graph.textures['timernone']); break;
        }
    }
    
    update(t) {
        if (this.paused)
            return;
        if (this.lastT == null) {
            this.lastT = t; 
            return;
        }
        this.msToSecondSkip -= t - this.lastT;
        while (this.msToSecondSkip < 0) {
            this.advanceSecond();
            this.msToSecondSkip += 1000
        }
        this.lastT = t;

        this.updateDigitTextures();        
    }    

    updateDigitTextures() {
        this.setDigitTexture(this.timerdigit1, Math.floor(this.minutesLeft / 10));
        this.setDigitTexture(this.timerdigit2, this.minutesLeft % 10);
        this.setDigitTexture(this.timerdigit3, Math.floor(this.secondsLeft / 10));
        this.setDigitTexture(this.timerdigit4, this.secondsLeft % 10);
    }

    advanceSecond() {
        if (this.isOver()) {
            this.pause();
            return;
        }
        if (this.secondsLeft == 0) {
            this.secondsLeft = 59
            this.minutesLeft--;
        }
        else this.secondsLeft--;
    }

    resume() {
        this.lastT = new Date().getTime()
        this.paused = false;
    }

    pause() {
        this.paused = true;
    }

    reset(minutes, seconds) {
        this.msToSecondSkip = 1000;
        this.minutesLeft = minutes;
        this.secondsLeft = seconds;
        this.updateDigitTextures();        
    }

    isOver() {
        return this.minutesLeft == 0 && this.secondsLeft == 0;
    }
}

class GameCounter extends GameTimer {
    constructor(scene, graph, transformation) {
        super(scene, graph, transformation)
        this.timercolon.setTexture(graph.textures['black']);
    }

    addP1win() {
        super.reset(this.minutesLeft + 1, this.secondsLeft);

        super.setDigitTexture(this.timerdigit1, null);     
        super.setDigitTexture(this.timerdigit2, null);     
        setTimeout(() => super.updateDigitTextures(), 700);
        setTimeout(() => super.setDigitTexture(this.timerdigit1, null), 1400);     
        setTimeout(() => super.setDigitTexture(this.timerdigit2, null), 1400);     
        setTimeout(() => super.updateDigitTextures(), 2100);
    }

    addP2win() {
        super.reset(this.minutesLeft, this.secondsLeft + 1);

        super.setDigitTexture(this.timerdigit3, null);     
        super.setDigitTexture(this.timerdigit4, null);     
        setTimeout(() => super.updateDigitTextures(), 700);
        setTimeout(() => super.setDigitTexture(this.timerdigit3, null), 1400);     
        setTimeout(() => super.setDigitTexture(this.timerdigit4, null), 1400);     
        setTimeout(() => super.updateDigitTextures(), 2100);
    }


}