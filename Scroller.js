
var Signal = require( 'signals' );
var ScrollerAxis = require( './ScrollerAxis' );


var defaultOpts = {
	axes: [ false, true, false ],
	pointerBounds: null // supply a rect object { left: 0, top: 0, right: 500, bottom: 500 }
};

/**
 *
 * Scroller Class for jux.

 * @param opts
 * @constructor
 *
 */
var Scroller = function( opts ){

	opts = opts || {};
	opts.axes = opts.axes || defaultOpts.axes;

	this.pointerBounds = opts.pointerBounds;

	this.scrolling = false;
	this.down = false;
	this.enabled = true;

	this.onScroll = new Signal();
	this.onOvershootMin = new Signal();
	this.onOvershootMax = new Signal();

	this.deferredInteractions = [];

	this.axes = [];
	this.position = [ 0,0,0 ];
	this.previous = [ 0,0,0 ];

	for( var i = 0; i<3; i++ ){
		if( opts.axes[i] ){
			this.axes[i] = new ScrollerAxis();
		}else{
			this.axes[i] = false;
		}
	}

};


module.exports = Scroller;
Scroller.prototype = {};


Scroller.prototype._inBounds = function( position ){

	var b = this.pointerBounds;

	if( b ){
		var x = position[0];
		var y = position[1];
		if( x >= b.left && x<=b.right && y>=b.top && y<=b.bottom ){
			return true;
		}else{
			return false;
		}
	}else{
		return true;
	}
};


Scroller.prototype.pointerDown = function( x,y,z ){

	if( this.down || !this.enabled ){
		return;
	}

	this._setPosition( x,y,z );

	for( var i = 0; i<this.axes.length; i++ ){
		if( this.axes[i] )
			this.axes[i].start();
	}

	this.down = true;

};

Scroller.prototype.pointerUp = function( x,y,z ){

	if( !this.down ){
		return;
	}

	for( var i = 0; i<this.axes.length; i++ ){
		if( this.axes[i] )
			this.axes[i].stop();
	}

	this.down = false;

};


Scroller.prototype.pointerMove = function( x,y,z ) {

	if( !this.down || !this.enabled ){
		return;
	}

	this._setPosition( x,y,z );

	for( var i = 0; i<this.axes.length; i++ ){
		if( this.axes[i] )
			this.axes[i].move( this.position[i] - this.previous[i] );
	}

};

Scroller.prototype._setPosition = function( x, y, z ){

	this.previous[0] = this.position[0];
	this.previous[1] = this.position[1];
	this.previous[2] = this.position[2];

	this.position[0] = x;
	this.position[1] = y;
	this.position[2] = z || 0;
};


Scroller.prototype.update = function( dt ){

	var changed = false;
	var axis;
	var i;

	// handle deferred interactions.
	if( this.deferredInteractions.length ){

		var shouldEnd = true; // check all axis are going to stop interaction.
		var moveAmount = 0;
		var speed = 0;

		for( i = 0; i<this.axes.length; i++ ){
			axis = this.axes[i];
			if( axis ){
				shouldEnd = shouldEnd && axis.scrollShouldEnd;
				moveAmount = Math.max( Math.abs( axis.moveAmount ), moveAmount );
				speed = Math.max( Math.abs( axis.speed ), speed );
			}
		}

		// trigger interactions. ( this could possibly do this after update? )
		if( shouldEnd ){

			if( moveAmount < 2 && speed < 1 ) {
				for (i = 0; i < this.deferredInteractions.length; i++) {
					this.deferredInteractions[i]();
				}
			}
			this.deferredInteractions.splice(0);
		}
	}

	// handle update
	for( i = 0; i<this.axes.length; i++ ){
		axis = this.axes[i];
		if( axis ){

			changed = changed || axis.update(dt);

			if( changed && axis.overshotMin ){
				this.onOvershootMin.dispatch( i, axis.overshotNorm );
			}else
			if( changed && axis.overshotMax ){
				this.onOvershootMax.dispatch( i, axis.overshotNorm );
			}
		}
	}

	if( changed ) {
		this.scrolling = true;
		this.onScroll.dispatch();
	}else{
		this.scrolling = false;
	}

	return changed;

};


/**
 * Determines whether to trigger a click/tap event instead of scroll event.
 * Useful for when the scrolling items are interactive and you need to determine
 * handling the click based on the scroll speed.
 *
 * @param handler
 */
Scroller.prototype.handleInteraction = function( cb ){
	this.deferredInteractions.push( cb );
};



Scroller.prototype.setViewSize = function( x, y, z ){

	for( var i = 0; i<this.axes.length; i++ ){
		if( this.axes[i] && !isNaN(arguments[i]) ){
			this.axes[i].viewSize = arguments[i];

		}
	}

	return this;
};

Scroller.prototype.setMin = function( x, y, z ){

	for( var i = 0; i<this.axes.length; i++ ){
		if( this.axes[i] && !isNaN(arguments[i]) ){
			this.axes[i].min = arguments[i];

		}
	}

	return this;
};


Scroller.prototype.setMax = function( x, y, z ){

	for( var i = 0; i<this.axes.length; i++ ){
		if( this.axes[i] && !isNaN(arguments[i]) ){
			this.axes[i].max = arguments[i];
		}
	}

	return this;
};

Scroller.prototype.setOvershoot = function( value ){

	for( var i = 0; i<this.axes.length; i++ ){
		if( this.axes[i] ){
			this.axes[i].overshoot = value;
		}
	}

	return this;
};


Scroller.prototype.getPosition = function( axis ){
	if( this.axes[axis] ){
		return this.axes[axis].position;
	}else{
		return NaN;
	}
};



Scroller.prototype.dispose = function(){

	//this.pointerEvents.off( 'pointer-up', this._onPointer );
	//this.pointerEvents.off( 'pointer-down', this._onPointer );
	//this.pointerEvents.off( 'pointer-move', this._onPointer );
};





