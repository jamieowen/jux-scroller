
var Pull = require( './ease/pull' );

var ScrollerAxis = function(){

    this.position = 0;
	this.positionTo = NaN; // if an ease is applied this is where we are heading.

    this.min = 0;
    this.max = 0;
    this.viewSize = 0;

	this.maxSpeed = 50;
    this.speed = 0;
    this.friction = 0.9655;

    this.scrolling = false;
    this.scrollShouldEnd = false;
    this.scrollStart = 0;

    this.overshoot = 0.25;

    this.moveAmount = 0;
    this.moveLast = 0;

	this.activeConstraint = null;
	this.constraints = {
		'min': function (axis, pos) {
			return pos < axis.min ? axis.min : NaN;
		},
		'max': function (axis, pos) {
			var max = axis.max > axis.viewSize ? axis.max - axis.viewSize : axis.min;
			return pos > max ? max : NaN;
		},
		'snap': function (axis, pos) {
			return NaN;
		}
	};

	this.activeEase = null;
	var pull = new Pull();
	this.eases = {
		'min': pull,
		'max': pull,
		'snap': pull
	}

};

module.exports = ScrollerAxis;

ScrollerAxis.prototype = {

	size: function( viewSize ){
		this.viewSize = viewSize;
	},

    start: function(){

        if( !this.scrolling ){
			this.reset();
			this.resetActives();
            this.scrolling = true;
			this.scrollStart = this.position;
        }
    },

    stop: function(){

        if( this.scrolling ){
			this.scrolling = false;
            this.scrollShouldEnd = true;
        }
    },

    move: function( offset ){

        if( this.scrolling ){
            this.moveAmount += offset;
            this.moveLast = offset;
        }
    },

	reset: function( speed ){
		// reset internals
		this.speed = speed || 0;
		this.scrollShouldEnd = false;
		this.scrolling = false;
		this.moveAmount = 0;
		this.moveLast = 0;
	},

	resetActives: function(){

		if( this.activeEase ){
			this.activeEase.cancel();
		}

		this.activeEase = null;
		this.activeConstraint = null;
		this.positionTo = NaN;
	},

	// wheelDelta?

	update: function(){

		var pos = this.position;
		var wasScrolling = this.scrollShouldEnd;

		if( this.scrolling || this.scrollShouldEnd ){

			pos = this.scrollStart + this.moveAmount;

			var overshot = this.constraints['min'](this,pos);
			var applyOvershoot = false;
			var moveAdjust;

			if( !isNaN(overshot) ){
				applyOvershoot = true;
				moveAdjust = this.moveAmount - ( overshot - this.scrollStart );
			}else{
				overshot = this.constraints['max'](this,pos);
				if( !isNaN(overshot) ){
					applyOvershoot = true;
					moveAdjust = this.moveAmount - ( overshot - this.scrollStart );
				}
			}

			if( applyOvershoot ){
				var max = this.overshoot * this.viewSize;
				pos = overshot + ( moveAdjust / this.viewSize ) * max;
			}

			if( this.scrollShouldEnd ){
				this.reset( this.moveLast ); // reset and set speed to last move amount
			}
		}

		if( !this.scrolling ){
			var to;
			if( !this.activeConstraint ){

				// constraints.
				var key,constrain;
				for( key in this.constraints ){
					constrain = this.constraints[ key ];
					to = constrain( this, pos );

					if( !isNaN(to) ){
						this.positionTo = to;
						this.activeConstraint = key;
						break;
					}
				}
			}

			if( !this.activeEase && this.activeConstraint ){
				var ease = this.eases[ this.activeConstraint ];
				ease.start( this.speed, pos, to, false, wasScrolling );
				this.activeEase = ease;
				this.speed = 0;
			}
		}

		if( this.activeEase ){
			pos = this.activeEase.update();
			if( this.activeEase.done ){
				this.resetActives();
				this.speed = 0;
			}
		}else
		if( !wasScrolling ){
			this.speed *= this.friction;
			if( Math.abs(this.speed) < 0.001 ){
				this.speed = 0;
			}
			pos += this.speed;
		}

		var changed = false;
		if( pos !== this.position ){
			this.position = pos;
			changed = true;
		}

		return changed;
	}

};