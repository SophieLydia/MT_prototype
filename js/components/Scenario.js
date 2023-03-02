// To describe which component must be highlight in which step 
import { ImageLoad } from './ImageLoad.js';

class Scenario {

    currentStep;
    imageLoad;
    scene;
    doc;

    constructor(scene){
        this.scene = scene;
        this.currentStep = 0;

        // Also load initial state
        this.imageLoad = new ImageLoad(scene);

        this.doc = document.getElementById("infoStep");

        document.getElementById("nextStep").addEventListener("click", this.getStep.bind(this));
        this.doc.appendChild(document.createTextNode("Starting scenario 1"));
    }

    getStep(){
        this.currentStep += 1;
        switch(this.currentStep){
            // Initial state, scanning a marker doesn't change anything
            // Never goes through this case
            // Step 0: show scenario without highlight
            case 0:
                break;
            // Step 1: check PC turn on
            case 1:
                this.doc.removeChild(this.doc.lastChild);
                this.doc.appendChild(document.createTextNode("Check that the PC is turned on"));
                this.imageLoad.replaceMesh("./images/physicalComponents/PC_currentStep.svg", "PC");
                break;
            // Step 2: check power cables connected
            case 2:
                this.doc.removeChild(this.doc.lastChild);
                this.doc.appendChild(document.createTextNode("Check that the power cable is connected on the PC and the wall"));
                this.imageLoad.replaceMesh("./images/physicalComponents/PC.svg", "PC");
                this.imageLoad.replaceMesh("./images/physicalComponents/cable2_currentStep.svg", "PC");
                this.imageLoad.replaceMesh("./images/physicalComponents/powerPort_currentStep.svg", "PC");
                this.imageLoad.replaceMesh("./images/physicalComponents/powerPort_currentStep.svg", "wall", 1);
                break;
            // Step 3: check power ports working
            case 3:
                this.doc.removeChild(this.doc.lastChild);
                this.doc.appendChild(document.createTextNode("Check that power ports on the PC and the wall are working"));
                this.imageLoad.replaceMesh("./images/physicalComponents/cable2.svg", "PC");
                break;
            // Step 4: check power cable working
            case 4:
                this.doc.removeChild(this.doc.lastChild);
                this.doc.appendChild(document.createTextNode("Check that the power cable between the PC and the wall is working"));
                this.imageLoad.replaceMesh("./images/physicalComponents/powerPort.svg", "PC");
                this.imageLoad.replaceMesh("./images/physicalComponents/powerPort.svg", "wall", 1);
                this.imageLoad.replaceMesh("./images/physicalComponents/cable2_currentStep.svg", "PC");
                break;
            default:
                this.doc.removeChild(this.doc.lastChild);
                this.doc.appendChild(document.createTextNode("The scenario is finished"));
                this.imageLoad.replaceMesh("./images/physicalComponents/cable2.svg", "PC");
                console.log("The scenario is finished");
        }
    }

    /*  Turn the PC on:
        Power cable connected?
        Power ports working?
        Power cable working?
    */

    /*  Turn the router on:
        Power cable connected?
        Power ports working?
        Power cable working?
    */

    /*  Get internet connection for PC from router:
        Ethernet cable connected?
        LAN ports working?
        Ethernet cable working?
    */
}

export { Scenario };
