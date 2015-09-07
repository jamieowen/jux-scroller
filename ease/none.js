
var None = function(){

	this.pos = 0;
	this.to = 0;
};


module.exports = None;


None.prototype = {

	start: function( speed, pos, to, wasScrolling ){

		this.speed = speed;
		this.pos = this.to = to;
		this.done = true;
	},

	update: function(){

		return this.pos;

	},

	cancel: function(){

	}

};