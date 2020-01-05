class GameTimer extends Component {
    constructor(scene, graph, transformation) {
        // Gets a clone of the digit components defined in the XML
        // This is done so they can be reused for other timers 
        let timerdigit1 = graph.components['timerdigit1'].clone();
        let timerdigit2 = graph.components['timerdigit2'].clone();
        let timerdigit3 = graph.components['timerdigit3'].clone();
        let timerdigit4 = graph.components['timerdigit4'].clone();
        let timercolon = graph.components['timercolon'].clone();

        // These components don't need to be cloned because they won't be changed
        let timerscreenbg = graph.components['timerscreenbg'];
        let timerbody = graph.components['timerbody'];

        // Combines the items above into a single component that makes the timer's screen
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

        // Resets the timer to 0 minutes and 0 seconds, and pauses it
        this.reset(0, 0);
        this.pause();
    }

    toNewGraph(graph) {
        // Maintains timer state but gets new materials/textures/models from a new graph
        this.graph = graph;

        // Remakes a timer with the new graph
        let timer = new GameTimer(this.scene, this.graph, new Translation(0, 0, 0));

        // Replaces needed components 
        // Those did not keep any of the timer's state
        this.children = timer.children;
        this.timerdigit1 = timer.timerdigit1
        this.timerdigit2 = timer.timerdigit2
        this.timerdigit3 = timer.timerdigit3
        this.timerdigit4 = timer.timerdigit4
        this.timercolon = timer.timercolon;

        // Adds timer to graph
        this.graph.addComponent(this);
        // updates the textures of the screen so they are actually changed to the new ones
        this.updateDigitTextures();        
    }

    setDigitTexture(component, digitValue) {
        // Sets the texture for the component based on the digit (0 - 9) received
        // Assumes the graph contains a texture for each digit
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
        // Nothing to do if timer is paused
        if (this.paused)
            return;

        if (this.lastT == null) {
            this.lastT = t; 
            return;
        }

        // Updates ms until second is advances
        // t - this.lastT is the time difference in ms
        this.msToSecondSkip -= t - this.lastT;

        // Skips a second if it's time to
        while (this.msToSecondSkip < 0) {
            this.advanceSecond();
            this.msToSecondSkip += 1000
        }

        // Keeps last t
        this.lastT = t;

        
        // updates the textures of the screen so the timer reflects the new time
        this.updateDigitTextures();        
    }    

    updateDigitTextures() {
        // Sets the digit texture for the 4 timer digits
        // based on the minutes and seconds left
        this.setDigitTexture(this.timerdigit1, Math.floor(this.minutesLeft / 10));
        this.setDigitTexture(this.timerdigit2, this.minutesLeft % 10);
        this.setDigitTexture(this.timerdigit3, Math.floor(this.secondsLeft / 10));
        this.setDigitTexture(this.timerdigit4, this.secondsLeft % 10);
    }

    advanceSecond() {
        // If timer is up, no need to advance a second
        if (this.isOver()) {
            this.pause();
            return;
        }

        // Reduces one second to the timer clock
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
        // Changes the timer's digits to the specified minutes and seconds
        // Also updates the textures right away
        this.msToSecondSkip = 1000;
        this.minutesLeft = minutes;
        this.secondsLeft = seconds;
        this.updateDigitTextures();        
    }

    isOver() {
        // Time is up if all digits are 0
        return this.minutesLeft == 0 && this.secondsLeft == 0;
    }
}

class GameCounter extends GameTimer {
    constructor(scene, graph, transformation) {
        super(scene, graph, transformation)
        // A game counter is just a timer used differently
        // The colon can be hidden so the texture is removed
        this.timercolon.setTexture(graph.textures['black']);
    }


    addP1win() {
        // Adding a win to P1 is simply adding a minute to the timer
        super.reset(this.minutesLeft + 1, this.secondsLeft);

        // This below just makes a blinking animation, would not be needed
        super.setDigitTexture(this.timerdigit1, null);     
        super.setDigitTexture(this.timerdigit2, null);     
        setTimeout(() => super.updateDigitTextures(), 700);
        setTimeout(() => super.setDigitTexture(this.timerdigit1, null), 1400);     
        setTimeout(() => super.setDigitTexture(this.timerdigit2, null), 1400);     
        setTimeout(() => super.updateDigitTextures(), 2100);
    }

    addP2win() {
        // Adding a win to P2 is simply adding a second to the timer
        super.reset(this.minutesLeft, this.secondsLeft + 1);

        // This below just makes a blinking animation, would not be needed
        super.setDigitTexture(this.timerdigit3, null);     
        super.setDigitTexture(this.timerdigit4, null);     
        setTimeout(() => super.updateDigitTextures(), 700);
        setTimeout(() => super.setDigitTexture(this.timerdigit3, null), 1400);     
        setTimeout(() => super.setDigitTexture(this.timerdigit4, null), 1400);     
        setTimeout(() => super.updateDigitTextures(), 2100);
    }


}