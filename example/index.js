
var Scroller = require( '../Scroller' );

window.onload = function(){

	var scroller = new Scroller();

	var getXY = function( event ){

		var x,y;

		if( event.touches ){
			x = event.touches[0].clientX;
			y = event.touches[0].clientY;
		}else{
			x = event.clientX;
			y = event.clientY;
		}

		return { x: x, y: y };
	};

	window.addEventListener( 'mousedown', function( ev ){
		var pos = getXY(ev);
		console.log( pos );
		scroller.pointerDown( pos.x, pos.y );
	});

	window.addEventListener( 'mouseup', function( ev ){
		var pos = getXY(ev);
		console.log( pos );
		scroller.pointerUp( pos.x, pos.y );
	});

	window.addEventListener( 'mousemove', function( ev ){
		var pos = getXY(ev);
		scroller.pointerMove( pos.x, pos.y );
	});

	// something to scroll
	var createElement = function( x, y, w, h ){
		var div = document.createElement( 'div' );
		div.style.position = 'absolute';
		div.style.width = w;
		div.style.height = h;

		div.style.left = x;
		div.style.top = y;

		div.style.backgroundColor = '#000000';
		return div;
	};


	var container = createElement( '0px','0px','400px','400px' );
	//container.style.overflow = 'hidden';
	container.style.backgroundColor = null;
	document.body.appendChild( container );
	var ele;
	var max = 0;
	for( var i = 0; i<30; i++ ){
		ele = createElement( '0px', ( (i * 300) + ( i * 1 ) ) + 'px', '400px', '300px' );
		container.appendChild( ele );
		max += 300;
	}

	scroller.axes[1].constraints[ 'snap' ] = function( axis, pos ){

		return Math.round( pos / 301 ) * 301;
		/**if( pos > 100 && pos < 200 ){
			return 150;
		}else{
			return NaN;
		}**/
	};

	scroller.setViewSize( 0, 400, 0 );
	scroller.setMax( 0, max, 0 );

	var update = function( time ){
		var changed = scroller.update();
		//console.log( changed, scroller.position );
		var pos = scroller.axes[1].position;
		container.style.top = ( -pos ) + 'px';
		//console.log( 'POS', pos );
		requestAnimationFrame( update );
	};

	update();






};
