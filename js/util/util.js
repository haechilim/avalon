class Util {
    constructor() {}

    static resize() {
        const DEFAULT_WIDTH = 1919;
        const DEFAULT_HEIGHT = 1057;
        
        let ratioX = window.innerWidth / DEFAULT_WIDTH;
        let ratioY = window.innerHeight / DEFAULT_HEIGHT;
        let offsetX = (DEFAULT_WIDTH - window.innerWidth) / 2;
        let offsetY = (DEFAULT_HEIGHT - window.innerHeight) / 2;
        
        document.body.style.transform = "scale(" + Math.min(ratioX, ratioY) + ")";
        document.getElementById("container").style.transform = "translate(0px, " + (ratioY > 1 ? -offsetY : 0) + "px)";
        window.scrollTo(0, offsetY);
    }
}

export default Util;