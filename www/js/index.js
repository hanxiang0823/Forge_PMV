
var viewer;


/////////////////////////////////////////////////////////////////////////////////
//
//設定Extension
//
/////////////////////////////////////////////////////////////////////////////////
const config = {
      extensions: [
          'Autodesk.ADN.Extension.Monitor.Selection',
          //'HeatMapFloorFlat',
          'Autodesk.ADN.Extensions.MyTool',
          'Autodesk.ADN.Extensions.MyPanelTool'
          //'Autodesk.focuscolor.contextmenu'          
        ]
  };
  


var s = null;

var element = null;

var data_sensor = null;

var it = null;

var id = null;

var colourmode = 0 ;   

/////////////////////////////////////////////////////////////////////////////////
//
//取得元件ID
//
/////////////////////////////////////////////////////////////////////////////////
//res function for draw the google chat and determine show heatmap or not
function res(r) {
    element = r;
    s = r.name;
	s = s.split('[')
			s = s[1].split(']')
			if (s[0] == "202080")
			{
				draw();
            }
    if (r.properties[0].displayValue.split(' ')[1] == "樓板")
    {
        try{
            document.getElementById('texture').remove()
            viewer.impl.removeOverlay('pivot', _plane);
            cancelAnimationFrame(_requesId);
    }catch(err){};//preprocessing for if exist a texture already

        it = viewer.model.getData().instanceTree;
        it.enumNodeFragments(r.dbId, function(fragementid) {
            id = fragementid;
    
            }, false);
        _bounds = getBounds(id);       
        _heat = genHeatMap();
        _texture = genTexture();
        _material = genMaterial();
        
        _plane = clonePlane();
        //setMaterial(id, _material);
        animate();
        console.log("Heat Map Floor loaded.");
    }
    return s, element
	
}

function fall(m, n) {
    console.log(m, n)
}

function getid(i) {
    viewer.getProperties(i, res, fall)
}

/////////////////////////////////////////////////////////////////////////////////
//
//Google圖表
//
/////////////////////////////////////////////////////////////////////////////////
function firstChat(){
    var ori_data = google.visualization.arrayToDataTable([
        ['time', 'humidity'],
      ['', 0]
      ]);
    
    var ori_options = {
        title: 'Sensor-Humidity',
        curveType: 'function',
        legend: { position: 'bottom' }
      };
    
    var ori_chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
    
    ori_chart.draw(ori_data, ori_options);
}



google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(firstChat)
var time_control = null;
function drawChart() {
	data_sensor = getDatabase();
	var data = google.visualization.arrayToDataTable([
          ['time', 'humidity'],
        ['', data_sensor[0].v],
        ['', data_sensor[1].v],
        ['', data_sensor[2].v],
        ['', data_sensor[3].v],
        ['', data_sensor[4].v],
        ['', data_sensor[5].v],
        ['', data_sensor[6].v],
        ['', data_sensor[7].v],
        ['', data_sensor[8].v],
        ['', data_sensor[9].v]
        ]);

        var options = {
          title: 'Sensor-Humidity',
          curveType: 'function',
          legend: { position: 'bottom' }
        };

        var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

        chart.draw(data, options);
	
}

function draw() {
    
		time_control = setInterval(function () { google.charts.setOnLoadCallback(drawChart) }, 500);
	
	
    
    
}


/////////////////////////////////////////////////////////////////////////////////
//
//Viewer設定
//
/////////////////////////////////////////////////////////////////////////////////
var options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken
}

var documentId = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE4LTA1LTE4LTE0LTA1LTE2LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL2NpdmlsYnVpbGRpbmcyMDE3LTZGLnJ2dA';

Autodesk.Viewing.Initializer(options, function onInitialized() {
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    
});

function onDocumentLoadSuccess(doc) {

    // A document contains references to 3D and 2D viewables.
    var viewable = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {
        'type': 'geometry',
        'role': '3d'
    }, true);
    if (viewable.length === 0) {
        console.error('Document contains no viewables.');
        return;
    }

    // Choose any of the available viewable
    var initialViewable = viewable[0]; // You can check for other available views in your model,
    var svfUrl = doc.getViewablePath(initialViewable);
    var modelOptions = {
        sharedPropertyDbPath: doc.getPropertyDbPath()
    };

    var viewerDiv = document.getElementById('viewerDiv');

    ///////////////USE ONLY ONE OPTION AT A TIME/////////////////////////

    /////////////////////// Headless Viewer /////////////////////////////
    // viewer = new Autodesk.Viewing.Viewer3D(viewerDiv);
    //////////////////////////////////////////////////////////////////////

    //////////////////Viewer with Autodesk Toolbar///////////////////////
    viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv, config);
    //////////////////////////////////////////////////////////////////////

    viewer.start(svfUrl, modelOptions, onLoadModelSuccess, onLoadModelError);
}


function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function onLoadModelSuccess(model) {
    console.log('onLoadModelSuccess()!');
    console.log('Validate model loaded: ' + (viewer.model === model));
    console.log(model);
}

function onLoadModelError(viewerErrorCode) {
    console.error('onLoadModelError() - errorCode:' + viewerErrorCode);
}


/////////////////////////////////////////////////////////////////////////////////
//
// Load Viewer Background Color Extension
//
/////////////////////////////////////////////////////////////////////////////////

function changeBackground (){
       viewer.setBackgroundColor(0, 59, 111, 255,255, 255);
}

/////////////////////////////////////////////////////////////////////////////////
//
// Unload Viewer Background Color Extension
//
/////////////////////////////////////////////////////////////////////////////////

function resetBackground (){
       viewer.setBackgroundColor(169,169,169, 255,255, 255);
}





/////////////////////////////////////////////////////////////////////////////////
//
// The block for heatmap
//
/////////////////////////////////////////////////////////////////////////////////


// simpleheat private variables
var _heat, _data = [];

// Configurable heatmap variables:
// MAX-the maximum amplitude of data input
// VAL-the value of a data input, in this case, it's constant
// RESOLUTION-the size of the circles, high res -> smaller circles
// FALLOFF-the rate a datapoint disappears
// Z_POS-vertical displacement of plane
var MAX = 3500, VAL = 2500, RESOLUTION = 5, FALLOFF = 100, Z_POS = 0.5;

// THREE.js private variables
var _material, _texture, _bounds, _plane, _requesId;

////////////////////////////////////////////////////////////////////////////

function animate() {

    //_requesId = requestAnimationFrame(animate);   //self looping
    if ( colourmode == 0 )              //Temperature Mode
    {
        for (z = 1; z <= 25; z++)                       //fixed at 25 to stop it from randomly generating
        {
            _heat.add(receivedData());
        }
    }
    else if ( colourmode == 1 )         //Thermal Comfort Mode
    {
        for (z = 1; z <= 9; z++)                       //run for 9 times
        {
            //console.log("test"+z);
            _heat.add(receivedData());
        }
    }    

    _heat._data = decay(_heat._data);
    _heat.draw();
    document.getElementById('texture').style.display = 'none'

    _texture.needsUpdate = true;
    // setting var 3 to true enables invalidation even without changing scene
    viewer.impl.invalidate(true, false, true);
}

////////////////////////////////////////////////////////////////////////////

/* Geometry/Fragment/Location functions */

// Gets bounds of a fragment
function getBounds(fragId) {


    var bBox = new THREE.Box3();
    
    viewer.model.getFragmentList().getWorldBounds(fragId, bBox);
    
    var width = Math.abs(bBox.max.x - bBox.min.x);
    var height = Math.abs(bBox.max.y - bBox.min.y);
    var depth = Math.abs(bBox.max.z - bBox.min.z);

    // min is used to shift for the shader, the others are roof dimensions

    return {width: width, height: height, depth: depth, max: bBox.max, min: bBox.min};
}

///////////////////////////////////////////////////////////////////////

/* Heatmap functions */

// Starts a heatmap
function genHeatMap() {

    var canvas = document.createElement("canvas");
    canvas.id = "texture";
    canvas.width = _bounds.width * RESOLUTION;
    canvas.height = _bounds.height * RESOLUTION;
    document.body.appendChild(canvas);

    /*
    if ( colourmode == 0 )  { MAX = 3500; }
    else if ( colourmode == 1 )  { MAX = 3; }
    */
    
    return simpleheat("texture").max(MAX);
}

// TODO: Replace with actually received data
// returns an array of data received by sensors
function receivedData()
{
    if ( colourmode == 0 )              //Temperature Mode
    {
        return [Math.random() * $("#texture").width(),
                Math.random() * $("#texture").height(),
                Math.random() * VAL];
    }
    else if ( colourmode == 1 )         //Thermal Comfort Mode
    { 
        //function scale(x) { return (((x/6+0.5)*0.6+0.4)-0.4)/0.6*2800+400; }       //scale: 400-3200
        function scale(x) { return 3000+400*(x-3)+200; }                            //scale: 800-3200
        //function scale(x) { return ((x/6+0.5)*0.6+0.4)*colourscheme_factor; }       //scale: 0.4-1.0
        //function scale(x) { return (x/6+0.5)*colourscheme_factor; }               //scale: 0.0-1.0
        if ( z == 1 )       { console.log("Point "+z+" = 3  "+scale(3    )); return[ 0.25 * $("#texture").width(), 0.25 * $("#texture").height(), scale(3    ) ];}
        else if ( z == 2 )  { console.log("Point "+z+" = 2  "+scale(2    )); return[ 0.25 * $("#texture").width(), 0.50 * $("#texture").height(), scale(2    ) ];}
        else if ( z == 3 )  { console.log("Point "+z+" = 1  "+scale(1    )); return[ 0.25 * $("#texture").width(), 0.75 * $("#texture").height(), scale(1    ) ];}
        else if ( z == 4 )  { console.log("Point "+z+" = 0.5    "+scale(0.5  )); return[ 0.50 * $("#texture").width(), 0.25 * $("#texture").height(), scale(0.5  ) ];}
        else if ( z == 5 )  { console.log("Point "+z+" = 0  "+scale(0    )); return[ 0.50 * $("#texture").width(), 0.50 * $("#texture").height(), scale(0    ) ];}
        else if ( z == 6 )  { console.log("Point "+z+" = -0.5   "+scale(-0.5 )); return[ 0.50 * $("#texture").width(), 0.75 * $("#texture").height(), scale(-0.5 ) ];}
        else if ( z == 7 )  { console.log("Point "+z+" = -1 "+scale(-1   )); return[ 0.75 * $("#texture").width(), 0.25 * $("#texture").height(), scale(-1   ) ];}
        else if ( z == 8 )  { console.log("Point "+z+" = -2 "+scale(-2   )); return[ 0.75 * $("#texture").width(), 0.50 * $("#texture").height(), scale(-2   ) ];}
        else if ( z == 9 )  { console.log("Point "+z+" = -3 "+scale(-3   )); return[ 0.75 * $("#texture").width(), 0.75 * $("#texture").height(), scale(-3   ) ];}
    }
    /*
    console.log( "PMV = " + Calculate_PMV(23+4*Math.random(),50+50*Math.random()) );
    return [Math.random() * $("#texture").width(),
            Math.random() * $("#texture").height(),
            (Calculate_PMV(23+4*Math.random(),50+50*Math.random())+0.7886)/1.7502 * VAL ];
            //range of calculated PMV = (-0.789 ~ 0.962) given range of air temperatre, ta = (23.0 ~ 27.0)°C & range of relative Humidity. rH = (50 ~ 100)%
            //return the calculated PMV to a float value between 0 to 1 and multiply it with VAL to adjust the colour range
    */
    /*
    return [Math.random() * $("#texture").width(),
            Math.random() * $("#texture").height(),
            scale(Calculate_PMV(ta,rH)];
            //final code after connect to the database
    */
}

// decrements the amplitude of a signal by FALLOFF for decay over time
function decay(data) {

    // removes elements whose amplitude is < 1
    return data.filter(function(d) {
        d[2] -= FALLOFF;
        return d[2] > 1;
    });
}

///////////////////////////////////////////////////////////////////////

/* Texture and material functions */

// Creates a texture
function genTexture() {
    
    var canvas = document.getElementById("texture");
    var texture = new THREE.Texture(canvas);
    return texture;
}

// generates a material
function genMaterial() {

    var material;

        // shader uniforms
        // corner is the vertex UV mapped to (0, 0)
        // width and height are fragment size
        // tex is texture
        var uniforms = {
            corner: {
                type: 'v2',
                value: new THREE.Vector2(_bounds.min.x, _bounds.min.y)
            },
            width: {
                type: 'f',
                value: _bounds.width
            },
            height: {
                type: 'f',
                value: _bounds.height
            },
            tex: {
                type: 't',
                value: _texture
            }
        };
        
        material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: $("#vertexshader").text(),
            fragmentShader: $("#fragmentshader").text(),
            side: THREE.DoubleSide
        });

        material.transparent = true;

        // register the material under the name "heatmap"
        viewer.impl.matman().addMaterial("heatmap", material, true);
        
        return material;
}

///////////////////////////////////////////////////////////////////////

/* Rendering the heatmap in the Viewer */

// copies a fragment and moves it elsewhere
function clonePlane() {

    // To use native three.js plane, use the following mesh constructor
    geom = new THREE.PlaneGeometry(_bounds.width, _bounds.height);
    plane = new THREE.Mesh(geom, _material);
    plane.position.set(_bounds.min.x+(_bounds.max.x-_bounds.min.x)/2, _bounds.min.y+(_bounds.max.y-_bounds.min.y)/2, _bounds.min.z + Z_POS);

    viewer.impl.addOverlay("pivot", plane);
    
    return plane;
}

function setMaterial(fragId, material) {
        
    viewer.model.getFragmentList().setMaterial(fragId, material);
    viewer.impl.invalidate(true);
}
