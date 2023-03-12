const BORDER_WIDTH = 10;

class OverlayElement extends HTMLElement{
    
    constructor() {
        super();
        this.stop = this.stopMovement.bind(this);

        this.addEventListener("mousemove", (event) => {
            if ( event.ctrlKey && event.shiftKey ) {
                if ( event.offsetX < 0 &&
                     event.offsetY < 0 ||
                     event.offsetX > this.clientWidth &&
                     event.offsetY > this.clientHeight ) {
                    this.style.cursor = "nwse-resize";
                } else if ( event.offsetX > this.clientWidth &&
                            event.offsetY < 0 ||
                            event.offsetX < 0 &&
                            event.offsetY > this.clientHeight ) {
                    this.style.cursor = "nesw-resize";
                } else if ( event.offsetX < 0 ||
                            event.offsetX > this.clientWidth ) {
                    this.style.cursor = "ew-resize";
                } else if ( event.offsetY < 0 ||
                            event.offsetY > this.clientHeight ) {
                    this.style.cursor = "ns-resize";
                } else {
                    this.style.cursor = "move";
                }
            } else {
                this.style.cursor = "default"
            }
        });
        
        this.addEventListener("mousedown", (event) => {
            event.preventDefault();
            if ( event.ctrlKey && event.shiftKey ) {
                if ( event.offsetX < 0 &&
                     event.offsetY < 0 ) {
                    document.addEventListener("mousemove", this.resizeXLeft);
                    document.addEventListener("mousemove", this.resizeYTop);
                } else if ( event.offsetX > this.clientWidth &&
                            event.offsetY < 0 ) {
                    document.addEventListener("mousemove", this.resizeXRight);
                    document.addEventListener("mousemove", this.resizeYTop);
                } else if ( event.offsetX > this.clientWidth &&
                            event.offsetY > this.clientHeight ) {
                    document.addEventListener("mousemove", this.resizeXRight);
                    document.addEventListener("mousemove", this.resizeYBottom);
                } else if ( event.offsetX < 0 &&
                            event.offsetY > this.clientHeight ) {
                    document.addEventListener("mousemove", this.resizeXLeft);
                    document.addEventListener("mousemove", this.resizeYBottom);
                } else if ( event.offsetX < 0 ) {
                    document.addEventListener("mousemove", this.resizeXLeft);
                } else if ( event.offsetX > this.clientWidth ) {
                    document.addEventListener("mousemove", this.resizeXRight);
                } else if ( event.offsetY < 0 ) {
                    document.addEventListener("mousemove", this.resizeYTop);
                } else if ( event.offsetY > this.clientHeight ) {
                    document.addEventListener("mousemove", this.resizeYBottom);
                } else {
                    document.addEventListener("mousemove", this.moveEvent);
                }
                document.addEventListener("mouseup", this.stop);
            }
        });
    }

    resizeXLeft(event) {
        const element = document.querySelector("overlay-chat");
        const parent = element.parentElement;
        const boundingRect = element.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        element.style.width = Math.round(boundingRect.width - (2*BORDER_WIDTH) - event.movementX) + "px";
        let newLeft = Math.round(boundingRect.x - parentRect.x + event.movementX);

        const minLeft = -BORDER_WIDTH;
        const maxLeft = parent.clientWidth - element.clientWidth;
        
        newLeft = newLeft < minLeft ? minLeft : newLeft;
        newLeft = newLeft > maxLeft ? maxLeft : newLeft;

        element.style.left = newLeft + "px";
    }
    resizeXRight(event) {
        const element = document.querySelector("overlay-chat");
        const boundingRect = element.getBoundingClientRect();
        element.style.width = Math.round(boundingRect.width - (2*BORDER_WIDTH) + event.movementX) + "px";
    }
    resizeYTop(event) {
        const element = document.querySelector("overlay-chat");
        const parent = element.parentElement;
        const boundingRect = element.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        element.style.height = Math.round(boundingRect.height - (2*BORDER_WIDTH) - event.movementY) + "px";
        let newTop = Math.round(boundingRect.y - parentRect.y + event.movementY);

        const minTop = -BORDER_WIDTH;
        const maxTop = parent.clientHeight - element.clientHeight;
        
        newTop = newTop < minTop ? minTop : newTop;
        newTop = newTop > maxTop ? maxTop : newTop;

        element.style.top = newTop + "px";
    }
    resizeYBottom(event) {
        const element = document.querySelector("overlay-chat");
        const boundingRect = element.getBoundingClientRect();
        element.style.height = Math.round(boundingRect.height - (2*BORDER_WIDTH) + event.movementY) + "px";
    }
    moveEvent(event) {
        const element = document.querySelector("overlay-chat");
        const parent = element.parentElement;
        const boundingRect = element.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        let newLeft = Math.round(boundingRect.x - parentRect.x + event.movementX);
        let newTop = Math.round(boundingRect.y - parentRect.y + event.movementY);

        const minLeft = -BORDER_WIDTH, minTop = -BORDER_WIDTH;
        const maxLeft = parent.clientWidth - element.clientWidth;
        const maxTop = parent.clientHeight - element.clientHeight;
        
        newLeft = newLeft < minLeft ? minLeft : newLeft;
        newTop = newTop < minTop ? minTop : newTop;
        newLeft = newLeft > maxLeft ? maxLeft : newLeft;
        newTop = newTop > maxTop ? maxTop : newTop;

        element.style.left = newLeft + "px";
        element.style.top = newTop + "px";
    }
    stopMovement(event) {
        document.removeEventListener("mousemove", this.resizeXLeft);
        document.removeEventListener("mousemove", this.resizeXRight);
        document.removeEventListener("mousemove", this.resizeYTop);
        document.removeEventListener("mousemove", this.resizeYBottom);
        document.removeEventListener("mousemove", this.moveEvent);
        document.removeEventListener("mouseup", this.stop);
    }
}
