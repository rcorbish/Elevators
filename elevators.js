/**
 * http://usejsdoc.org/
 */

var algos = require( "algos" ) ;

var TIME_FLOOR_TO_FLOOR = 5 ;
var TIME_STOPPED = 20 ;
var ACCELERATION_TIME = 1 ;


function Elevator( id_in ) {
	this.id = id_in ;	
	this.stops = [] ;

	this.floor = 0 ;
	this.direction = 0 ;	// stopped

	this.isAvailableForRequest = function( target ) {
		return true ;   
	} ;


	this.timeToArrive = function( target, via ) {
		var rc = 0 ;

		var dir = this.direction ;
		if( dir===0 ) {
			rc = ACCELERATION_TIME ;
			dir = Math.sign( via - this.floor ) ;
		}
		var flr = this.floor ;
		var prevFloor = flr ;

		var tgt = via ;
		var stopNum = 0 ;

		while( tgt!==null && (stopNum < this.stops.length) ) {
			var nextStop = this.stops[stopNum] ;
			if( Math.sign( nextStop - flr ) !== dir ) {
				dir = Math.sign( nextStop - flr ) ;
				rc += (2 * ACCELERATION_TIME) ;
//				console.log( "RVSD @", flr ) ; 
			}

			while( flr !== nextStop ) {
				rc += TIME_FLOOR_TO_FLOOR ;
				flr += dir ;
//				console.log( "MOVED to", flr ) ; 
			}

			if( tgt === flr ) {
//				console.log( "Switching targets" ) ;
				if( tgt===via ) {
					tgt = target ;
				} else {
					tgt = null ;
				}
			}

			rc += ACCELERATION_TIME + TIME_STOPPED ;			
//			console.log( "STOP @", flr ) ; 

			stopNum++ ;
		}
		while( tgt!==null ) {
			if( Math.sign( tgt - flr ) !== dir ) {
				dir = Math.sign( tgt - flr ) ;
				rc += (2 * ACCELERATION_TIME) ;
//				console.log( "RVSD @", flr ) ; 
			}
//			console.log( "LAST MOVES", (  dir * ( tgt - flr ) ) ) ;
			rc += dir * ( tgt - flr ) * TIME_FLOOR_TO_FLOOR ;
			flr = tgt ;
			if( tgt===via ) {
				tgt = target ;
			} else {
				tgt = null ;
			}
		}

		return rc ;
	} ;


	this.addRequest = function( target, via ) {

		var dir = this.direction ;
		if( dir===0 ) {
			dir = Math.sign( via - this.floor ) ;
		}
		var flr = this.floor ;
		var prevFloor = flr ;

		var tgt = via ;
		var stopNum = 0 ;

		var viaIndex = null ;
		var targetIndex = null ;

		while( tgt!==null && (stopNum < this.stops.length) ) {
			var nextStop = this.stops[stopNum] ;
			if( Math.sign( nextStop - flr ) !== dir ) {
				dir = Math.sign( nextStop - flr ) ;
//				console.log( "RVSD @", flr ) ; 
			}

			while( flr !== nextStop ) {
				if( tgt === flr ) {
//					console.log( "Splice in before floor", nextStop ) ;
					if( tgt === via ) {
						viaIndex = stopNum ;
						tgt = target ;
					} else {
						targetIndex = stopNum ;
						tgt = null ;
					}
				}
				flr += dir ;
//				console.log( "MOVED to", flr ) ; 
			}

			if( tgt === flr ) {
//				console.log( "Switching targets" ) ;
				if( tgt===via ) {
					tgt = target ;
				} else {
					tgt = null ;
				}
			}
			if( tgt===null ) { break ; }
			stopNum++ ;
		}
		while( tgt!==null ) {
			if( tgt===via ) {
				tgt = target ;
				viaIndex = this.stops.length ;
			} else {
				tgt = null ;
				targetIndex = this.stops.length ;
			}
		}
		if( viaIndex !== null ) {
			this.stops.splice( viaIndex, 0, via ) ;
			targetIndex++ ;  // +1 - we just spliced in a value before
		}
		if( targetIndex !== null && this.stops[targetIndex]!==target ) {
			this.stops.splice( targetIndex, 0, target ) ;
		}
	} ;

	
	this.move = function() {

		if( this.stops.length === 0 ) {
			this.direction = 0 ;
			return ;
		}

		this.direction = Math.sign( this.stops[0] - this.floor ) ; 

		this.floor += this.direction ;
		if( this.floor === this.stops[0] ) {				
			this.stops.splice( 0,1 ) ;
		}
		
		if( this.stops.length === 0 ) {
			this.direction = 0 ;
		}		
	} ;

	this.upArrow = String.fromCharCode(0x2bc5) ;
	this.dnArrow = String.fromCharCode(0x2bc6) ;
	this.noArrow = " " ;

	this.toString = function() {
		var arrow = (this.direction>0 ? this.upArrow : (this.direction===0 ? this.noArrow : this.dnArrow) ) ;
		return "Elevator " + this.id + " @" + this.floor + " " + arrow + " " + this.stops.join( " - " ) ; 
	} ;
}


var elevators = [] ;
for( var i=1 ; i<9 ; i++ ) {
	elevators.push( new Elevator( "A"+i ) ) ;
}

//elevators[0].floor = 10 ;
//elevators[0].addRequest( 3, 7 ) ;
//console.log( elevators[0].toString() ) ;
//elevators[0].addRequest( 3, 7 ) ;
//console.log( elevators[0].toString() ) ;
//elevators[0].addRequest( 4, 7 ) ;
//console.log( elevators[0].toString() ) ;
//console.log( elevators[0].timeToArrive( 9,4 ) ) ;


for( var i=0 ; i<100 ; i++ ) {
	for( var e=0 ; e<elevators.length ; e++ ) {
		elevators[e].move() ;
	}
	for( var j=0 ; j<2 ; j++ ) {
		var from = Math.floor( 10 * Math.random() ) ;
		var to   = Math.floor( 10 * Math.random() ) ;
		if( from !== to && i<99 ) {
			console.log( "New request", from, "-", to ) ;

			var minTimeToArrive = 999999 ;
			var bestElevator = null ;
			for( var k=0 ; k<elevators.length ; k++ ) {
				var tta = elevators[k].timeToArrive( to, from ) ;
//				console.log( tta, elevators[k].toString() ) ;   
				if( tta < minTimeToArrive ) {
					minTimeToArrive = tta ;
					bestElevator = elevators[k] ;
				}
			}
			if( bestElevator ) {
//				console.log( "BEST", bestElevator.toString() ) ;
				bestElevator.addRequest( to, from ) ;
			} else {
				console.log( "Cannot service request" ) ;
			}
		}
	}
	for( var e=0 ; e<elevators.length ; e++ ) {
		console.log( elevators[e].toString() ) ;   
	}
	console.log( "------------------" ) ;
}



