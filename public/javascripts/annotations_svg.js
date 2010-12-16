var shapeAnnotation = {
    trackMove: function(e) {
        if(shapeAnnotation.lastCoords == null ||
            Math.max(Math.abs(e.pageX - shapeAnnotation.lastCoords.x),
            Math.abs(e.pageY - shapeAnnotation.lastCoords.y)) > 5) {
            var now = new Date().getTime();
            if(now - shapeAnnotation.lastTime > 50) {    
                shapeAnnotation.addPoint(e.pageX, e.pageY);
                shapeAnnotation.lastCoords = {x: e.pageX, y:e.pageY};
                shapeAnnotation.lastTime = now;
            }
        }
    },

    addPoint: function(x, y) {
        var path = $("shape_current").firstChild,
            points = path.getAttribute("d");
        if(points == "") {
            points = "M" + x + "," + y;
        } else {    
            points += " L" + x + "," + y; 
        }

        path.setAttribute("d", points);
        shapeAnnotation.points++;
    },
    
    create: function(e) {
        var newGroup = document.createElementNS("http://www.w3.org/2000/svg", "g"),
            newPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

        newGroup.setAttribute("id", "shape_current");
        newPath.setAttribute("d", "");
        newGroup.appendChild(newPath);
        $("shapes").appendChild(newGroup);

        shapeAnnotation.addPoint(e.pageX, e.pageY);
    },

    finalize: function(e) {
        // Moves the old shape
        var oldGroup = $("shape_current"),
            oldPath = oldGroup.firstChild,
            points = [];

        points = oldPath.getAttribute("d").split(" ");
        // Chops the path in 10-node long paths. This is because the
        // mouseover event is fired when the mouse is over the area
        // outlined by the path, not the stroke itself.
        if(points.length > 10) {
            var currentPath,
                point;
            for(var i=0; i<points.length; i++) {
                // Get the coordinates from the "d" attribute
                point =  {
                    x: points[i].split(",")[0].substring(1),
                    y: points[i].split(",")[1]
                };
                if(currentPath == null || currentPath.getAttribute("d").split(" ").length > 10) {
                    if(currentPath != null) {
                        // The last point is duplicated
                        currentPath.setAttribute("d", currentPath.getAttribute("d")+ " L"+point.x+","+point.y);
                    }

                    currentPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    //currentPath.setAttribute("style", "stroke: #FF0000; fill: none;");
                    currentPath.setAttribute("d", "M" + point.x + "," + point.y);
                    oldGroup.appendChild(currentPath);
                } else {
                    currentPath.setAttribute("d", currentPath.getAttribute("d")+ " L"+point.x+","+point.y);
                }
            }
            oldGroup.removeChild(oldPath);

        }

        oldGroup.setAttribute("id", "new_shape_" + shapeAnnotation.counter);
        shapeAnnotation.counter++;        
    },

    counter: 0,
    lastCoords: null, 
    lastTime: new Date().getTime(),
    points: 0
    
};


var areaAnnotation = {
    create: function(e) {
        var selectBox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        
        this.startCoords = {"x": e.pageX, "y": e.pageY};
        selectBox.setAttribute("id", "select_box");
        selectBox.setAttribute("class", "area_annotation");
        selectBox.setAttribute("x", e.pageX);
        selectBox.setAttribute("y", e.pageY);
        selectBox.setAttribute("width", "0");
        selectBox.setAttribute("height", "0");

        $("shapes").appendChild(selectBox);
    },

    finalize: function(e) {
        var selectBox = $("select_box");

        selectBox.setAttribute("id", "new_area_" + areaAnnotation.counter);
        areaAnnotation.counter++;
    },

    trackMove: function(e) {
        var selectBox = $("select_box");

        selectBox.setAttribute("x", Math.min(e.pageX, areaAnnotation.startCoords.x));
        selectBox.setAttribute("y", Math.min(e.pageY, areaAnnotation.startCoords.y));
        selectBox.setAttribute("width", Math.abs(e.pageX - areaAnnotation.startCoords.x));
        selectBox.setAttribute("height", Math.abs(e.pageY - areaAnnotation.startCoords.y));
    },

    startCoords: {"x": 0, "y": 0},
    counter: 0

};

var annotation_text_displayer = {

};

var Handler = {
    mode: "view",
    color: "#333",
    thickness: "2",
    init: function() {
        document.observe("mousedown", function(e) {
            // Disable the drag'n'drop feature for images in
            // firefox. As the annotated image *is* the background,
            // this was quite annoying
            if(e.preventDefault)
                e.preventDefault();
            if(Handler.mode == "shape") {
                shapeAnnotation.create(e);
            } else if(Handler.mode == "area") {
                areaAnnotation.create(e);
            }
            document.observe("mousemove", Handler.trackMove);
        });

        document.observe("mouseup", function(e) {
            document.stopObserving("mousemove", Handler.trackMove);
            if(Handler.mode == "shape") {
                shapeAnnotation.finalize(e);
            } else if(Handler.mode == "area") {
                areaAnnotation.finalize(e);
            }
        }, false);

        ["shape", "area", "save", "delete", "view"].each(function(item) {
                Event.observe($("button_" + item), "click", function(e) {
                    if(item == "save") {
                        Handler.setMode("view");
                        Handler.displaySavePopUp();
                    } else {
                        Handler.setMode(item);
                    }
                });
        });
        
        document.observe("mousemove", Handler.mouseMove);
        
        annotation_text_displayer = new AnnotationTextDisplayer($('annotations'));
            
    },

   displaySavePopUp: function() {
	var pop = $("modal")
	pop.style.display='block';
		  },
    setMode: function(mode) {
        if(mode == "shape") {
            this.mode = "shape";
            document.documentElement.style.cursor = "crosshair";
            $("button_save").style.display = "inline";

        } else if(mode == "area") {
            this.mode = "area";
            document.documentElement.style.cursor = "crosshair";
            $("button_save").style.display = "inline";

        } else if(mode == "delete") {
            this.mode = "delete";
            document.documentElement.style.cursor = "crosshair";
            $("button_save").style.display = "none";

        } else if(mode == "view") {
            this.mode = "view";
            document.documentElement.style.cursor = "auto";
            $("button_save").style.display = "none";
        }
    },

    // Is called when the mouse moves *while drawing*
    trackMove: function(e) {
        if(Handler.mode == "shape") {
            shapeAnnotation.trackMove(e);
        } else if(Handler.mode == "area") {
            areaAnnotation.trackMove(e);
        }
    },
    
    // Is called when the mouse moves
    mouseMove: function(e) {
        if(Handler.mode == "view") {
            // For all annotations drawn by the user
            var svg_annotations = $("shapes").getElementsByTagName("rect");
            
            var annotationVector = $A();                   
                    
            for (var i = 0; i < svg_annotations.length; i++) {
                var rect_annot = svg_annotations.item(i); 
                // Mouse Capture (mouse events do not accept multiple events for superimposed shapes) 
                if (e.pageX > rect_annot.getAttribute('x') &&
                    (e.pageX < (parseInt(rect_annot.getAttribute('x')) + parseInt(rect_annot.getAttribute('width')))) &&
                    e.pageY > rect_annot.getAttribute('y') &&
                    (e.pageY < (parseInt(rect_annot.getAttribute('y')) + parseInt(rect_annot.getAttribute('height'))))

                    ) {
                    // Store the annotation
                    annotationVector.push(new AnnotationText(1,1,"This is my line test: "
                    + "i'm so proud that it works! ! ! Let's go in tonus tonight!"
                    + "Marcus Pigrou is my idol..! AbracadabraPicetPicEtColegram")); // TODO only this line to change; link to the annotation text!
                }
            }
            // Is the mouse over a shape. If not, hide the displayer.
            if (annotationVector.length == 0) {
                annotation_text_displayer.hideShowing();
            }else{
                annotation_text_displayer.displayCollection(
                     annotationVector,
                     e.pageX, 
                     e.pageY
                );
            }
        }
    },
    
    save: function(e) {
        // Get the shapes properties
        var color,
            toSave = {
                "annotation_text": 'Annotation text',
                "shapes": [],
                "areas": []
            };

        // Get the shapes and the areas drawn
        $A($("shapes").childNodes).each(function(item) {
            if(item.localName == null) return;
            if(item.getAttribute("id").split("_")[0] == "new") {
                if(item.localName == "g") {
                    toSave.shapes.push(Handler.processShape(item));
                } else if(item.localName == "rect") {
                    toSave.areas.push(Handler.processArea(item));
                }
            }
        });

        // Actually saves the shapes
        new Ajax.Request(Handler.queryURI, {
            method: 'post',
            onSuccess: function(transport) {
                var response = transport.responseText;
                // TODO Delete the sent shapes, and draw the new ones 
            },
            onFailure: function() {
                // TODO Inform the user that something happened.
            }
        });
    },
	
	deleteAnnotation: function(annotation) {
		// TODO make an AJAX call to remove the annotation from DB
		// TODO then remove it from the page.
	},
    
    processShape: function(node) {
        var shape = {
                color: Handler.color,
                thickness: Handler.thickness,
                points: []
            },
            point;

        $A(node.childNodes).each(function(path) {
            path = path.getAttribute("d");
                // The path syntax is "Mx,y Lx,y Lx,y"
                path.split(' ').each(function(point) {
                    // Remove the first letter (it's not part of the
                    // coordinates)
                    point = point.substr(1);
                    
                    shape.points.push({
                        x: point.split(',')[0],
                        y: point.split(',')[1]
                    });

                });
        });

        return shape;
    },

    processArea: function(node) {
         return {
            color: Handler.color,
            thickness: Handler.thickness,
            points: {
                "top": parseInt(node.getAttribute("y")),
                "left": parseInt(node.getAttribute("x")),
                "bottom": (parseInt(node.getAttribute("height")) + parseInt(node.getAttribute("y"))),
                "right": (parseInt(node.getAttribute("width")) + parseInt(node.getAttribute("x")))
            }
        };
    }
    

};

document.observe("DOMContentLoaded", Handler.init);
