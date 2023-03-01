// To describe which component must be highlight in which step 
import { ImageLoad } from './ImageLoad.js';

class Scenario {

    currentStep;
    imageLoad

    constructor(scene){
        this.currentStep = 0;
        this.imageLoad = new ImageLoad(scene);

        document.getElementById("nextStep").addEventListener("click", this.getStep.bind(this));
    }

    // Step 0: show scenario without highlight
    getStep(){
        this.currentStep += 1;
        switch(this.currentStep){
            // Initial state, scanning a marker doesn't change anything
            // Never goes through this case
            case 0:
                break;
            // Step 1: check power ports
            case 1:
                break;
            // Step 2: check power cables
            case 2:
                break;
            // Step 3: check ethernet ports
            case 3:
                break;
            // Step 4: check ethernet cables
            case 4:
                break;
            default:
                console.log("The scenario is finished");
        }
    }
}

export { Scenario };
