
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

var create = function(){
    var axis = new ScrollerAxis();
    return axis;
};

create.ScrollerAxis = ScrollerAxis;


module.exports = ScrollerAxis; // leave as new() for now.


ScrollerAxis.prototype = {

	size: function( viewSize ){
		this.viewSize = viewSize;
	},

    start: function(){

        if( !this.scrolling ){
            this.scrollStart = this.position;
            this.moveAmount = 0;
            this.moveLast = 0;
            this.scrolling = true;
			this.scrollShouldEnd = false;
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

    /**wheelDelta: function( delta ){
        if( !this.scrolling ){
            var contentSize = ( this.max - this.min ) - this.viewSize;
            var overshotMin = this.position > this.min;
            var overshotMax = this.position < -contentSize;

            if( !overshotMin && !overshotMax ){

                this.snapEase = null; // prevent
                delta = -delta;
                this.speed += delta * 0.03;
            }

        }
    },**/

	update: function(){

		var pos = this.position;
		var wasScrolling = this.scrollShouldEnd;

		if( this.scrolling || this.scrollShouldEnd ){

			if( this.activeEase ){
				this.activeEase.cancel();
				this.activeEase = null;
				this.activeConstraint = null;
				this.positionTo = NaN;

			}
			this.speed = 0;

			pos = this.scrollStart + this.moveAmount;

			// adjust moveAmount = moveAmount - ( constraint - start )
			// pos = constraint + ( adjustMoveAmount / viewSize ) * overShootMax;

			var overshot = this.constraints['min'](this,pos);
			var applyOvershoot = false;
			var moveAdjust;

			if( !isNaN(overshot) ){
				applyOvershoot = true;
				moveAdjust = this.moveAmount - ( overshot - this.scrollStart );
				console.log( 'adjust min', moveAdjust );
			}else{
				overshot = this.constraints['max'](this,pos);
				if( !isNaN(overshot) ){
					applyOvershoot = true;
					moveAdjust = this.moveAmount - ( overshot - this.scrollStart );
					console.log( 'adjust max', moveAdjust );
				}
			}

			if( applyOvershoot ){
				var max = this.overshoot * this.viewSize;
				pos = overshot + ( moveAdjust / this.viewSize ) * max;
				//console.log( 'apply overshoot', this.overshoot, this.viewSize, max, pos );
			}


			if( this.scrollShouldEnd ){
				this.scrollShouldEnd = false;
				this.scrolling = false;
				this.speed += this.moveLast;
				this.moveAmount = 0;
				this.moveLast = 0;
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
				this.activeEase = null;
				this.activeConstraint = null;
				this.speed = 0;
				this.positionTo = NaN;
			}
		}else{
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