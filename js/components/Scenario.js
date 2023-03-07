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
        document.getElementById("reset").addEventListener("click", this.reset.bind(this));
        this.doc.appendChild(document.createTextNode("Starting scenario 1"));
    }

    // Go back to step 0
    reset(){
        this.currentStep = -1;
        this.getStep();
    }

    // To describe which component must be highlight in which step 
    getStep(){
        this.currentStep += 1;
        switch(this.currentStep){
            // Go in this step if reset button is clicked
            // Step 0: show scenario without highlight
            // If any highlight, put everything in white
            case 0:
                this.imageLoad.replaceMesh("./images/physicalComponents/PC.svg", "PC");
                this.imageLoad.replaceMesh("./images/physicalComponents/cable2.svg", "PC");
                this.imageLoad.replaceMesh("./images/physicalComponents/powerPort.svg", "PC");
                this.imageLoad.replaceMesh("./images/physicalComponents/powerPort.svg", "wall", 1);
                this.doc.removeChild(this.doc.lastChild);
                this.doc.appendChild(document.createTextNode("Starting scenario 1"));
                break;
            // Step 1: check PC turn on
            case 1:
                this.imageLoad.replaceMesh("./images/physicalComponents/PC_currentStep.svg", "PC");
                this.doc.removeChild(this.doc.lastChild);
                this.doc.appendChild(document.createTextNode("Check that the PC is turned on"));
                break;
            // Step 2: check power cable connected to power ports
            case 2:
                this.imageLoad.replaceMesh("./images/physicalComponents/PC.svg", "PC");
                this.imageLoad.replaceMesh("./images/physicalComponents/cable2_currentStep.svg", "PC");
                this.imageLoad.replaceMesh("./images/physicalComponents/powerPort_currentStep.svg", "PC");
                this.imageLoad.replaceMesh("./images/physicalComponents/powerPort_currentStep.svg", "wall", 1);
                this.doc.removeChild(this.doc.lastChild);
                this.doc.appendChild(document.createTextNode("Check that the power cable is connected on the PC and the wall"));
                break;
            // Step 3: check power ports working
            case 3:
                this.imageLoad.replaceMesh("./images/physicalComponents/cable2.svg", "PC");
                this.doc.removeChild(this.doc.lastChild);
                this.doc.appendChild(document.createTextNode("Check that power ports on the PC and the wall are working"));
                break;
            // Step 4: check power cable working
            case 4:
                this.imageLoad.replaceMesh("./images/physicalComponents/powerPort.svg", "PC");
                this.imageLoad.replaceMesh("./images/physicalComponents/powerPort.svg", "wall", 1);
                this.imageLoad.replaceMesh("./images/physicalComponents/cable2_currentStep.svg", "PC");
                this.doc.removeChild(this.doc.lastChild);
                this.doc.appendChild(document.createTextNode("Check that the power cable between the PC and the wall is working"));
                break;
            default:
                this.imageLoad.replaceMesh("./images/physicalComponents/cable2.svg", "PC");
                this.doc.removeChild(this.doc.lastChild);
                this.doc.appendChild(document.createTextNode("The scenario is finished"));
                console.log("The scenario is finished");
        }
    }

    // Show the component scanned in green or red depending on the current step
    showImageMarked(component, device, portNbr){
        let path ="./images/physicalComponents/";
        switch(this.currentStep){
            // Do nothing 
            case 0:
                break;
            case 1:
                if(component == "PC" && device == "PC"){
                    path += component + "_rightMarker.svg";
                }else{
                    path += component + "_wrongMarker.svg";
                }
                this.imageLoad.replaceMesh(path, device, portNbr);
                break;
            case 2:
                if((component == "cable2" && device == "PC") 
                || (component == "powerPort" && device == "PC")
                || (component == "powerPort" && device == "wall" && portNbr == 1)){
                    path += component + "_rightMarker.svg";
                }else{
                    path += component + "_wrongMarker.svg";
                }
                this.imageLoad.replaceMesh(path, device, portNbr);
                break;
            case 3:
                if((component == "powerPort" && device == "PC")
                || (component == "powerPort" && device == "wall" && portNbr == 1)){
                    path += component + "_rightMarker.svg";
                }else{
                    path += component + "_wrongMarker.svg";
                }
                this.imageLoad.replaceMesh(path, device, portNbr);
                break;
            case 4:
                if(component == "cable2" && device == "PC"){
                    path += component + "_rightMarker.svg";
                }else{
                    path += component + "_wrongMarker.svg";
                }
                this.imageLoad.replaceMesh(path, device, portNbr);
                break;
            default:
            // Do nothing
        }
    }

    removeImageUuid(uuid, trackedImages){
        let toRemove = trackedImages.find(element => {
            return element.identifier === uuid
        });
        this.removeImageMarked(toRemove.steps, toRemove.component, toRemove.device, toRemove.portNbr); 
    }

    // Replace colored component with neutral or highlight
    removeImageMarked(steps, component, device, portNbr){
        let path;
        if(steps[this.currentStep]){
            path ="./images/physicalComponents/" + component + "_currentStep.svg";
        }else{
            path ="./images/physicalComponents/" + component + ".svg";
        }       
        this.imageLoad.replaceMesh(path, device, portNbr);
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
