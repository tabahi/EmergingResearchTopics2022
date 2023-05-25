

class SankeyLayout extends go.LayeredDigraphLayout {
    constructor() {
      super();
      this.alignOption = go.LayeredDigraphLayout.AlignAll;
    }
    // determine the desired height of each node/vertex,
    // based on the thicknesses of the connected links;
    // actually modify the height of each node's SHAPE
    makeNetwork(coll) {
      var net = super.makeNetwork(coll);
      this.diagram.nodes.each(node => {
        // figure out how tall the node's bar should be
        var height = this.getAutoHeightForNode(node);
        var shape = node.findObject("SHAPE");
        if (shape) shape.height = height;
        var text = node.findObject("TEXT");
        var ltext = node.findObject("LTEXT");
        var font = "bold " + Math.max(12, Math.round(height / 8)) + "pt Segoe UI, sans-serif"
        if (text) text.font = font;
        if (ltext) ltext.font = font;
        // and update the vertex's dimensions accordingly
        var v = net.findVertex(node);
        if (v !== null) {
          node.ensureBounds();
          var r = node.actualBounds;
          v.width = r.width;
          v.height = r.height;
          v.focusY = v.height/2;
        }
      });
      return net;
    }

    getAutoHeightForNode(node) {
      var heightIn = 0;
      var it = node.findLinksInto()
      while (it.next()) {
        var link = it.value;
        heightIn += link.computeThickness();
      }
      var heightOut = 0;
      var it = node.findLinksOutOf()
      while (it.next()) {
        var link = it.value;
        heightOut += link.computeThickness();
      }
      var h = Math.max(heightIn, heightOut);
      if (h < 10) h = 10;
      return h;
    }

    // treat dummy vertexes as having the thickness of the link that they are in
    nodeMinColumnSpace(v, topleft) {
      if (v.node === null) {
        if (v.edgesCount >= 1) {
          var max = 1;
          var it = v.edges;
          while (it.next()) {
            var edge = it.value;
            if (edge.link != null) {
              var t = edge.link.computeThickness();
              if (t > max) max = t;
              break;
            }
          }
          return Math.max(2, Math.ceil(max / this.columnSpacing));
        }
        return 2;
      }
      return super.nodeMinColumnSpace(v, topleft);
    }

    // treat dummy vertexes as being thicker, so that the Bezier curves are gentler
    nodeMinLayerSpace(v, topleft) {
      if (v.node === null) return 100;
      return super.nodeMinLayerSpace(v, topleft);
    }

    assignLayers() {
      super.assignLayers();
      var maxlayer = this.maxLayer;
      // now make sure every vertex with no outputs is maxlayer
      for (var it = this.network.vertexes.iterator; it.next();) {
        var v = it.value;
        var node = v.node;
        if (v.destinationVertexes.count == 0) {
          v.layer = 0;
        }
        if (v.sourceVertexes.count == 0) {
          v.layer = maxlayer;
        }
      }
      // from now on, the LayeredDigraphLayout will think that the Node is bigger than it really is
      // (other than the ones that are the widest or tallest in their respective layer).
    }

    commitLayout() {
      super.commitLayout();
      for (var it = this.network.edges.iterator; it.next();) {
        var link = it.value.link;
        if (link && link.curve === go.Link.Bezier) {
          // depend on Link.adjusting === go.Link.End to fix up the end points of the links
          // without losing the intermediate points of the route as determined by LayeredDigraphLayout
          link.invalidateRoute();
        }
      }
    }
  }
  // end of SankeyLayout

    function init() {

      // Since 2.2 you can also author concise templates with method chaining instead of GraphObject.make
      // For details, see https://gojs.net/latest/intro/buildingObjects.html
      const $ = go.GraphObject.make;  // for conciseness in defining templates

      myDiagram =
        $(go.Diagram, "myDiagramDiv", // the ID of the DIV HTML element
          {
            initialAutoScale: go.Diagram.UniformToFill,
            "animationManager.isEnabled": false,
            layout: $(SankeyLayout,
              {
                setsPortSpots: false,  // to allow the "Side" spots on the nodes to take effect
                direction: 0,  // rightwards
                layeringOption: go.LayeredDigraphLayout.LayerOptimalLinkLength,
                packOption: go.LayeredDigraphLayout.PackStraighten || go.LayeredDigraphLayout.PackMedian,
                layerSpacing: 100,  // lots of space between layers, for nicer thick links
                columnSpacing: 1
              })
          });

      var colors = ["#AC193D/#BF1E4B", "#2672EC/#2E8DEF", "#8C0095/#A700AE", "#5133AB/#643EBF", "#008299/#00A0B1", "#D24726/#DC572E", "#008A00/#00A600", "#094AB2/#0A5BC4"];

      // this function provides a common style for the TextBlocks
      function textStyle() {
        return { font: "bold 12pt Segoe UI, sans-serif", stroke: "black", margin: 5 };
      }

      // define the Node template
      myDiagram.nodeTemplate =
        $(go.Node, go.Panel.Horizontal,
          {
            locationObjectName: "SHAPE",
            locationSpot: go.Spot.Left,
            portSpreading: go.Node.SpreadingPacked  // rather than the default go.Node.SpreadingEvenly
          },
          $(go.TextBlock, textStyle(),
            { name: "LTEXT" },
            new go.Binding("text", "ltext")),
          $(go.Shape,
            {
              name: "SHAPE",
              fill: "#2E8DEF",  // default fill color
              strokeWidth: 0,
              portId: "",
              fromSpot: go.Spot.RightSide,
              toSpot: go.Spot.LeftSide,
              height: 10,
              width: 20
            },
            new go.Binding("fill", "color")),
          $(go.TextBlock, textStyle(),
            { name: "TEXT" },
            new go.Binding("text"))
        );

      function getAutoLinkColor(data) {
        var nodedata = myDiagram.model.findNodeDataForKey(data.from);
        var hex = nodedata.color;
        if (hex.charAt(0) == '#') {
          var rgb = parseInt(hex.slice(1, 7), 16);
          var r = rgb >> 16;
          var g = rgb >> 8 & 0xFF;
          var b = rgb & 0xFF;
          var alpha = 0.4;
          if (data.width <= 2) alpha = 1;
          var rgba = "rgba(" + r + "," + g + "," + b + ", " + alpha + ")";
          return rgba;
        }
        return "rgba(173, 173, 173, 0.25)";
      }

      // define the Link template
      var linkSelectionAdornmentTemplate =
        $(go.Adornment, "Link",
          $(go.Shape,
            { isPanelMain: true, fill: null, stroke: "rgba(0, 0, 255, 0.3)", strokeWidth: 0 })  // use selection object's strokeWidth
        );

      myDiagram.linkTemplate =
        $(go.Link, go.Link.Bezier,
          {
            selectionAdornmentTemplate: linkSelectionAdornmentTemplate,
            layerName: "Background",
            fromEndSegmentLength: 150, toEndSegmentLength: 150,
            adjusting: go.Link.End
          },
          $(go.Shape, { strokeWidth: 4, stroke: "rgba(173, 173, 173, 0.25)" },
            new go.Binding("stroke", "", getAutoLinkColor),
            new go.Binding("strokeWidth", "width"))
        );

      // read in the JSON-format data from the "mySavedModel" element
      //load();
      if(confirm("Loading will take a while. Confirm to load?"))
        load_json_file();
    }


    function load_json_file()
    {
      document.getElementById("msg").innerText = "Loading data...";
      fetch('./links.json')
      .then((response) => response.json())
      .then((json) => {
        myDiagram.model = go.Model.fromJson(json);
        document.getElementById("msg").innerText = "Done";
      });
    }

    function load_from_textbox() {
      myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
    }
    window.addEventListener('DOMContentLoaded', init);


    