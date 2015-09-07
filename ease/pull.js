
var Pull = function(){

	this.pos = 0;
	this.to = 0;
};


module.exports = Pull;


Pull.prototype = {

	start: function( speed, pos, to, wasScrolling ){

		this.speed = speed;
		this.pos = pos;
		this.to = to;
		this.done = false;

		var diff = this.to - this.pos;
		var toDirection = Math.abs( diff ) / diff;
		var currentDirection = Math.abs( this.speed ) / this.speed;


		if( toDirection !== currentDirection ){
			this.correctSpeed = true;
		}else{
			this.correctSpeed = false;
		}
	},

	update: function(){

		if( this.correctSpeed ){
			this.speed *= 0.6;

			if( Math.abs( this.speed ) < 2 ){
				this.correctSpeed = false;
			}

			this.pos += this.speed;

		}else{

			var diff = this.to - this.pos;

			if( Math.abs( diff ) < 0.5 ){
				this.pos = this.to;
				this.done = true;
			}else{
				this.pos += diff * 0.1;
			}

		}

		return this.pos;

	},

	cancel: function(){

	}

};