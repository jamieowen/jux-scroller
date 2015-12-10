
var PIXI 		= require( 'pixi.js' );
var Scroller 	= require( '../Scroller' );

window.onload = function(){

	var renderer = PIXI.autoDetectRenderer( 800, 600 );
	document.body.appendChild( renderer.view );

	var itemHeight = 40;
	// build elements.
	var graphics = new PIXI.Graphics().beginFill(0xFFDE00,0.4).drawRect(0,0,400,itemHeight).endFill();
	var texture = graphics.generateTexture( renderer );

	var stage = new PIXI.Container();
	var container = new PIXI.Container();
	var item;
	var numItems = 100;

	for( var i = 0; i<numItems; i++ ){
		item = new PIXI.Sprite( texture );
		container.addChild( item );
		item.position.y = ( i * itemHeight ) + ( i * 1 );
	}
	stage.addChild( container );

	var pointerDown = function(ev){
		var pos = ev.data.getLocalPosition(this);
		scroller.pointerDown( 0,pos.y );
	};

	var pointerUp = function(ev){
		var pos = ev.data.getLocalPosition(this);
		scroller.pointerUp( 0,pos.y );
	};

	var pointerMove = function(ev){
		var pos = ev.data.getLocalPosition(this);
		scroller.pointerMove( 0,pos.y );
	};

	stage.on( 'mousemove', pointerMove );
	stage.on( 'touchmove', pointerMove );
	stage.on( 'mouseup', pointerUp );
	stage.on( 'touchend', pointerUp );
	stage.on( 'mousedown', pointerDown );
	stage.on( 'touchstart', pointerDown );

	stage.interactive = true;

	// build scroller
	var scroller = new Scroller( [false,true,false] );
	scroller.axes[1].overshoot = 0.55;
	scroller.setMin( 0,0 );
	scroller.setMax( 0,( numItems * itemHeight ) + ( numItems-1 ));
	scroller.setViewSize( 0,600 );

	var useSnap = false;

	if( useSnap ){
		// snap to each item.
		scroller.axes[1].constraints['snap'] = function( axis, pos ){
			//return NaN;

			if( Math.abs( axis.speed ) < 3 ){
				// checking direction will cause the
				// snap in the direction of movement
				if( axis.speed > 0 ){
					return Math.ceil( pos / ( itemHeight+1 ) ) * ( itemHeight+1 );
				}else{
					return Math.floor( pos / ( itemHeight+1 ) ) * ( itemHeight+1 );
				}

			}else{
				return NaN;
			}
		};
	}

	var update = function(){
		scroller.update();
		container.position.y = -scroller.axes[1].position;
		renderer.render( stage );
		requestAnimationFrame( update );
	};

	update();



};