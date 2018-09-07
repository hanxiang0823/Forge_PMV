class aa extends Autodesk.Viewing.Extension {
  constructor( viewer, options ) {
    super( viewer, options );

    this.subtoolbar = null;
  }

  createUI() {
     // button to switch colour mode between Thermal Comfort Level & Temperature
     const button = new Autodesk.Viewing.UI.Button( 'myAwesomeToolbarButton' );
     
     button.addClass( 'myAwesomeToolbarButton' );
     button.icon.classList.add( 'glyphicon' );
     button.setIcon( 'glyphicon-fire' );            //glyph icon do not show for unknown reason
     button.setToolTip( 'Thermal Comfort Level' );

     

     button.onClick = function( event )
     {
       if ( colourmode == 0 )
       {
          colourmode = 1 ;
          button.setToolTip( 'Temperature' );
          alert( 'Colour mode switched to Thermal Comfort Level!' );
          viewer.setSelectionColor(new THREE.Color(0x00000000), Autodesk.Viewing.SelectionMode.MIXED); 
          viewer.setSelectionColor(new THREE.Color(0x32CD32), Autodesk.Viewing.SelectionMode.MIXED); //lime
        }
       else if ( colourmode == 1 )
       {
          colourmode = 0 ;
          button.setToolTip( 'Thermal Comfort Level' );
          alert( 'Colour mode switched to Temperature!' );
          viewer.setSelectionColor(new THREE.Color(0x3297FD), Autodesk.Viewing.SelectionMode.MIXED); //chrome blue
        }

        _heat.clear();
        animate();                                     
     }; 


     /*
     // Button 2
     var button2 = new Autodesk.Viewing.UI.Button('my-view-back-button');
     button2.onClick = function(e)
     {
         viewer.setViewCube('back');
     };
     button2.addClass('my-view-back-button');
     button2.icon.classList.add( 'glyphicon' );
     button2.setIcon( 'glyphicon-backward' );            //glyph icon do not show for unknown reason   
     button2.setToolTip('View Back');
     */

     // SubToolbar
     this.subToolbar = new Autodesk.Viewing.UI.ControlGroup( 'MyAwesomeAppToolbar' );
     this.subToolbar.addControl( button );
     //this.subToolbar.addControl( button2 );

     const toolbar = this.viewer.getToolbar();
     toolbar.addControl( this.subToolbar );
  }

  onToolbarCreatedBinded( event ) {
    this.viewer.removeEventListener( Autodesk.Viewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded );
    this.onToolbarCreatedBinded = null;
      //�ƥ���� 
    this.createUI();
  }

  load() {
     if( this.viewer.getToolbar() ) {
       // Toolbar is already available, create the UI
       this.createUI();
     } else {
       // Toolbar hasn't been created yet, wait until we get notification of its creation
       this.onToolbarCreatedBinded = this.onToolbarCreated.bind( this );
       this.viewer.addEventListener( Autodesk.Viewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded );
     }
    return true;
  }

  unload() {
    // this.viewer.toolbar.removeControl( this.subToolbar );
    return true;
  }
}

 Autodesk.Viewing.theExtensionManager.registerExtension( 'Autodesk.ADN.Extensions.MyTool', aa );