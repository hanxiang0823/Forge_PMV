MyAwesomePanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
MyAwesomePanel.prototype.constructor = MyAwesomePanel;
MyAwesomeExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
MyAwesomeExtension.prototype.constructor = MyAwesomeExtension;
class MyToolbarExt extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);

        this.subtoolbar = null;
    }
    createUI() {
        var viewer = this.viewer;
        var panel = this.panel;

        // button to show the docking panel
        const toolbarButtonShowDockingPanel = new Autodesk.Viewing.UI.Button('showMyAwesomePanel');
        toolbarButtonShowDockingPanel.onClick = function (e) {
            // if null, create it
            
            if (panel == null) {
                panel = new MyAwesomePanel(viewer, viewer.container,
                    'awesomeExtensionPanel', 'Sensor_Data');
                
            }
            // show/hide docking panel
            panel.setVisible(!panel.isVisible());
        };

        toolbarButtonShowDockingPanel.addClass('myAwesomeToolbarButton');
        toolbarButtonShowDockingPanel.icon.classList.add('glyphicon');
        toolbarButtonShowDockingPanel.setIcon('glyphicon-book');
        toolbarButtonShowDockingPanel.setToolTip('Show_Sensor_Panel');

        // SubToolbar
        this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('MyAwesomeAppToolbar');
        this.subToolbar.addControl(toolbarButtonShowDockingPanel);

        viewer.toolbar.addControl(this.subToolbar);
    }

    onToolbarCreatedBinded(event) {
        this.viewer.removeEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
        this.onToolbarCreatedBinded = null;
        //事件取消 
        this.createUI();
    }

    load() {
        if (this.viewer.getToolbar()) {
            // Toolbar is already available, create the UI
            this.createUI();
        } else {
            // Toolbar hasn't been created yet, wait until we get notification of its creation
            this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
            this.viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
        }
        return true;
    }

    unload() {
        // this.viewer.toolbar.removeControl( this.subToolbar );
        return true;
    }
        
}
MyAwesomeExtension.prototype.load = function () {
    if (this.viewer.toolbar) {
        // Toolbar is already available, create the UI
        this.createUI();
    } else {
        // Toolbar hasn't been created yet, wait until we get notification of its creation
        this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
        this.viewer.addEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
    }
    return true;
};

MyAwesomeExtension.prototype.onToolbarCreated = function () {
    this.viewer.removeEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
    this.onToolbarCreatedBinded = null;
    this.createUI();
};

MyAwesomeExtension.prototype.unload = function () {
    this.viewer.toolbar.removeControl(this.subToolbar);
    return true;
};

function MyAwesomeExtension(viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options);
    this.panel = null;
}
function MyAwesomePanel(viewer, container, id, title, content, x, y) {
    this.viewer = viewer;
    Autodesk.Viewing.UI.DockingPanel.call(this, container, id, title, options);

    // the style of the docking panel
    // use this built-in style to support Themes on Viewer 4+
    this.container.classList.add('docking-panel-container-solid-color-b');
    this.container.style.top = "10px";
    this.container.style.left = "10px";
    this.container.style.width = "auto";
    this.container.style.height = "auto";
    this.container.style.resize = "auto";

    // this is where we should place the content of our panel
    var div = document.createElement('div');
    div.style.margin = '20px';
    div.style.color = 'black';
    this.content = div;


    this.container.appendChild(this.content);
    
    var op = { left: false, heightAdjustment: 45, marginTop: 0 };
    this.scrollcontainer = this.createScrollContainer(op);
    
    
    var html = [
        '<body>',

            

            '<div id="curve_chart" style="width: 500px; height: 400px"></div>',

        '</body>'
        /*'<div class="uicomponent-panel-controls-container">',
        '<div class="panel panel-default">',
        '<table class="table table-hover table-responsive" id = "clashresultstable">',
        '<thead>',
        '<span style="color:black;">',
        '<th>Name</th><th>Status</th><th>Found</th><th>Approved By</th><th>Description</th>',
        '</span>',
        '</thead>',
        '<tbody>',
        '<span style="color:black;">',
        '<tr><td><span style="color:black;">test</span></td><td>test</td><td>test</td><td>test</td><td>test</td></tr>',
        '<tr><td>test</td><td>test</td><td>test</td><td>test</td><td>test</td></tr>',
        '<tr><td>test</td><td>test</td><td>test</td><td>test</td><td>test</td></tr>',
        '<tr><td>test</td><td>test</td><td>test</td><td>test</td><td>test</td></tr>',
        '<tr><td>test</td><td>test</td><td>test</td><td>test</td><td>test</td></tr>',
        '<tr><td>test</td><td>test</td><td>test</td><td>test</td><td>test</td></tr>',
        '<tr><td>test</td><td>test</td><td>test</td><td>test</td><td>test</td></tr>',
        '</span>',
        '</tbody>',
        '</table>',
        '</div>',
        '</div>'*/
    ].join('\n');


    $(this.scrollContainer).append(html);
    /*var div = document.createElement('div');
    div.style.margin = '20px';

    div.innerText = "My content here";
    this.container.appendChild(div);*/
    
}
Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.ADN.Extensions.MyPanelTool', MyToolbarExt );