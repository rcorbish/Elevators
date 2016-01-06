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

		while( tgt && (stopNum < this.stops.length) ) {
			var nextStop = this.stops[stopNum] ;
			if( Math.sign( nextStop - flr ) !== dir ) {
				dir = -dir ;
				rc += (2 * ACCELERATION_TIME) ;
				console.log( "RVSD @", flr ) ; 
			}

			while( flr !== nextStop ) {
				rc += TIME_FLOOR_TO_FLOOR ;
				flr += dir ;
				console.log( "MOVED to", flr ) ; 
			}

			if( tgt === flr ) {
				console.log( "Switching targets" ) ;
				if( tgt===via ) {
					tgt = target ;
				} else {
					tgt = null ;
				}
			}

			rc += ACCELERATION_TIME + TIME_STOPPED ;			
			console.log( "STOP @", flr ) ; 
			
			stopNum++ ;
		}
		while( tgt ) {
			if( Math.sign( tgt - flr ) !== dir ) {
				dir = -dir ;
				rc += (2 * ACCELERATION_TIME) ;
				console.log( "RVSD @", flr ) ; 
			}
			console.log( "LAST MOVES", (  dir * ( tgt - flr ) ) ) ;
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
		
		while( tgt && (stopNum < this.stops.length) ) {
			var nextStop = this.stops[stopNum] ;
			if( Math.sign( nextStop - flr ) !== dir ) {
				dir = -dir ;
				console.log( "RVSD @", flr ) ; 
			}

			while( flr !== nextStop ) {
				if( tgt === flr ) {
					console.log( "Splice in before floor", nextStop ) ;
					if( tgt == via ) {
						viaIndex = stopNum ;
						tgt = target ;
					} else {
						targetIndex = stopNum ;
						tgt = null ;
					}
				}
				flr += dir ;
				console.log( "MOVED to", flr ) ; 
			}

			if( tgt === flr ) {
				console.log( "Switching targets" ) ;
				if( tgt===via ) {
					tgt = target ;
				} else {
					tgt = null ;
				}
			}
			if( !tgt ) break ;
			stopNum++ ;
		}
		while( tgt ) {
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
		if( targetIndex !== null ) {
			this.stops.splice( targetIndex, 0, target ) ;
		}
	} ;

	this.move = function() {
		this.floor += this.direction ;
		for( var i=0 ; i<this.stops.length ; i++ ) {
			if( this.floor === this.stops[i] ) {
				this.stops.splice( i,1 ) ;
				break ;
			}
		}
		if( this.stops.length === 0 ) {
			this.direction = 0 ;
		}
	} ;
	
	
	this.toString = function() {
		return "Elevator " + this.id + " @" + this.floor + " " + this.stops.join( "->" ) ; 
	}
}


var elevators = [] ;
for( var i=1 ; i<9 ; i++ ) {
	elevators.push( new Elevator( "A"+i ) ) ;
}

elevators[0].floor = 10 ;
elevators[0].addRequest( 3, 7 ) ;
console.log( elevators[0].toString() ) ;
elevators[0].addRequest( 3, 7 ) ;
console.log( elevators[0].toString() ) ;
elevators[0].addRequest( 4, 7 ) ;
console.log( elevators[0].toString() ) ;
console.log( elevators[0].timeToArrive( 9,4 ) ) ;
return ;

for( var i=0 ; i<100 ; i++ ) {
	for( var e=0 ; e<elevators.length ; e++ ) {
		elevators[e].move() ;
	}
	var canBeSatisfied = false ;
	var from = Math.floor( 10 * Math.random() ) ;
	var to   = Math.floor( 10 * Math.random() ) ;
	if( from !== to ) {
		var minTimeToArrive = 999999 ;
		var bestElevator = null ;
		for( var j=0 ; j<elevators.length ; j++ ) {
			var tta = elevators[j].timeToArrive( to, from ) ;
			if( tta < minTimeToArrive ) {
				minTimeToArrive = tta ;
				bestElevator = elevators[j] ;
			}
		}
		bestElevator.addRequest( from, to ) ;
	}
}
for( var e=0 ; e<elevators.length ; e++ ) {
	console.log( elevators[e].id, elevators[e].floor, elevators[e].direction, elevators[e].requests ) ;   
}



