
var test = require( 'tape' );
var ScrollerAxis = require( '../ScrollerAxis' );

test( 'ScrollerAxis Test', function( t ){

	var axis = new ScrollerAxis();

	t.deepEquals( [ axis.position, axis.min, axis.max ] , [ 0, 0, 0 ], 'Init start values.' );

	axis.min = 0; axis.max = 1000; axis.viewSize = 100;

	// simulate a move
	axis.start(); // a drag starts
	axis.move( 10 ); // pointer moves 10 pixels down
	axis.update();
	t.equals( axis.position, 10, 'Move shift.' );
	axis.move( 20 ); // pointer moves an additional 20 down
	axis.update();
	t.equals( axis.position, 30, 'Move shift.' );
	axis.move( -15 ); // pointer moves back 15
	axis.update();
	t.equals( axis.position, 15, 'Move shift.' );
	axis.stop(); // pointer stops
	axis.update();
	t.equals( axis.position, 15, 'Stop' );
	t.equals( axis.speed, -15, 'Speed' ); // speed is equal to last move amount

	// need to test constraints and setting values directly.

	t.end();
});