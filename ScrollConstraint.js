
var ScrollConstraint = function( constrain, ){

	this.viewSize = 0;
	this.itemSize = 0;

};

ScrollConstraint.prototype = {

	size: function( viewSize, itemSize ){
		this.viewSize = viewSize;
		this.itemSize = itemSize;
	},

	// Return true or false if this contraint should be activated.
	constrain: function( value ){

	},

	start: function( value, speed ){

	},

	update: function(){

	},

	kill: function(){

	}


};

