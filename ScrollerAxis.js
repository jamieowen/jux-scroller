
var Pull = require( './ease/pull' );


/**
 * ScrollerAxis
 *
 * @constructor
 */
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

	/**
    this.overshoot = 0.25;
    this.overshootMethod = defaultOvershootMethod;
    this.overshotMin = false;
    this.overshotMax = false;
    this.overshotNorm = 0;**/

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
			//var snap = pos % axis.cellSize;
			return NaN;//pos > ( this.axis.max - this.axis.viewSize );
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

	size: function( viewSize, cellSize ){
		this.viewSize = viewSize;
		this.cellSize = cellSize;
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

    wheelDelta: function( delta ){
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
    },

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
						//console.log( 'ACTIVE CONSTRAINT', pos );
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
			if( Math.abs(this.speed) < 0.01 ){
				this.speed = 0;
			}
			pos += this.speed;
		}

		var changed = false;
		if( pos !== this.position ){
			this.position = pos;
			changed = true;
			//console.log( 'changed' );
		}

		return changed;
	}
	/**
    update: function(dt){

		// NEed to check this part?
        if( Math.abs( this.moveAmount ) <= 0 ) {
            // prevent scroll when no movement.
			this.scrollShouldEnd = false;
			return false;
        }

        if( this.scrolling || this.scrollShouldEnd ){
            var pos = this.scrollStart + this.moveAmount;
        }else{
            pos = this.position;
        }
        
        var contentSize = Math.max( ( this.max - this.min ) - this.viewSize, 0 ); // make sure content size isn't negative

        var overshoot = this.viewSize * this.overshoot;
        this.overshotMin = pos > this.min;
        this.overshotMax = pos < -contentSize;

        if( this.overshotMin ){
            this.overshotNorm = Math.abs( this.min - pos ) / overshoot; // 0 - 1.0, 2.5, etc
        }else
        if( this.overshotMax ){
            this.overshotNorm = Math.abs( -contentSize - pos ) / overshoot;
        }

        this.speed *= this.friction;

        if( Math.abs(this.speed) > this.maxSpeed ){
            this.speed = this.maxSpeed * ( this.speed / Math.abs(this.speed) );
        }

        if( this.scrolling || this.scrollShouldEnd ){

            var overshotDrag = this.overshotNorm / ( 1 / this.overshoot );
            //console.log( this.position, this.scrollStart, this.moveLast, overshotMin, overshotMax, this.scrollShouldEnd );
            if( this.overshotMin ){
                this.position = this.min + ( overshoot * overshotDrag );
            }else
            if( this.overshotMax ){
                this.position = -contentSize - ( overshoot * overshotDrag );
            }else{
                this.position = pos;
            }
            this.snapEase = null;
            this.speed = 0;

            if( this.scrollShouldEnd ){

                this.scrolling = false;
                this.scrollShouldEnd = false;
                // add the 'throw' speed increase.

                if( !this.overshotMin && !this.overshotMax ) {
                    this.speed += this.moveLast; // TODO : This should compare with previous frame
                }
            }

        }else{

            this.position += this.speed;

            // check if we have slowed enough to stop updating and come to a halt.
            var canRest = Math.abs(this.speed) < 0.25;

            if( ( this.overshotMin || this.overshotMax ) && !this.snapEase ) {

                if( this.overshotMin ){
					this.snapEase = this.overshootMethod( this.position, this.min, this.speed );
				}else
				if( this.overshotMax ){
					this.snapEase = this.overshootMethod( this.position, -contentSize, this.speed );
				}

            }else
            if( this.snapEase ){

                if( this.overshotNorm ){
                    this.snapEase.factor = this.overshotNorm;
                }else{
                    this.snapEase.factor = 1;
                }

                this.position = this.snapEase.update();

                if( this.snapEase.done() ){

                    this.speed = this.snapEase.speed;
                    this.snapEase = null;
                }

            }else
            if( canRest ){
                this.speed = 0;
                return false;
            }
        }

        return true;
    }**/

};