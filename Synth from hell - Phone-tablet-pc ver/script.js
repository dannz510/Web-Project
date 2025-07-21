;(function( win, doc, $ ){

	'use strict';

	var __KEYSPRESSED = [], 
		__PLAYINGNOTES = [], 
		__STOPPEDNOTES = [],
		__INSTRUMENT = 1, 
		__VOLUME = 0.1, 
		__VIBRATO = false, 
		__OCTAVE = 3,
		audio_context, 
		oscillator;

	function Piano(octave, target) {
    this.octave = octave;
    this.notes = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
    this.susNotes = ['c', 'd', 'f', 'g', 'a'];
    this.mapNotes = ['c', 'd', 'e', 'f', 'g', 'a', 'b','c#', 'd#', 'f#', 'g#', 'a#', 'c', 'd', 'e', 'c#', 'd#', 'f#', 'g#'];
    this.keymap = ['a','s','d','f','g','h','j','w','e','r','t','y','k','l','ç','u','i','o','p','1','2','3','4','5','6'];
    this.whiteKeymap = ['a','s','d','f','g','h','j','k','l','ç','7','8','9','z','x','c','v','b','n'];
    this.target = target;
    this.init();
}

	Piano.prototype = {
		init: function() {
			this.$target = $( this.target );
			this.createKeys();
			this.bindEvents();
			this.changeOctave();
		},
		createKeys: function() {
			var key,whiteW=60, blackW = ( whiteW / 2 ), o = this.octave, wWidth=0, bWidth=blackW + (blackW/2);
			for( var k=0; k<o; k+=1 ) {

				for( var i=0, l=this.notes.length; i<l; i+=1 ) {
					key = this.createKey();
					key.find( '.f-notes' ).html( this.notes[ i ].toUpperCase() );
					key.addClass( 'white-key-group' );
					key.addClass( 'key' );
					key.addClass( 'tom-' + this.notes[ i ] );
					key.attr('data-note', this.notes[ i ].toUpperCase() + ( k + 3 ) );
					key.css('left', wWidth + 'px' );
					this.$target.append( key );
					wWidth += whiteW;

					if( i !== 2 && i !== 6 ) {
						key = this.createKey();
						key.find( '.f-notes' ).html( this.notes[ i ].toUpperCase() + '#' );
						key.addClass( 'black-key-group' );
						key.addClass( 'key' );
						key.addClass( 'tom-s' + this.notes[ i ] );
						key.attr('data-note', this.notes[ i ].toUpperCase()  + '#' + ( k + 3 ) );
						key.css('left', bWidth + 'px' );
						this.$target.append( key );
					}
					bWidth += whiteW;
				}
			}
		},
		changeOctave: function( octave ) {
			var self = this;

			self.$target.find( '.f-keymap' ).html( '' );
			var i=0, j=0, oc = octave || __OCTAVE; 
			this.mapNotes.forEach( function( e ) { 
				if( i===12 ) {
					oc++ ; i=0; 
				} 
				self.$target.find( 'div[data-note='+ e.toUpperCase() + oc + ']').find('.f-keymap').html( self.keymap[ j ].toUpperCase() ); 
				i++; 
				j++; 
			});
		},
		createKey: function() {
			return 	$('<div><div class="tec y90-left size-lr"></div><div class="tec y90-right size-lr"></div><div class="tec x90-top keyTop size-t"></div><div class="tec x90-front"><span class="f-keymap"></span><span class="f-notes"></span></div> </div> ');
		},
		bindEvents: function() {
    var $keys = $( '.key' );
    $keys.on( 'mouseenter touchstart', function( e ) {
        e.preventDefault();
        var $el = $( e.currentTarget ), freqs, freq;
        if( $el.hasClass('white-key-group') ) {
            $el.addClass( 'pressed' );
        } else {
            $el.addClass( 'pressed-black ' );
        }
        $el.addClass( 'active' );
        freq = mplay.getFrequency( $el.attr( 'data-note' ) );
        freqs = mplay.getInstrument( freq, __INSTRUMENT, __VIBRATO );
        mplay.play( freqs );
    });
    $keys.on( 'mouseout touchend', function( e ) {
        e.preventDefault();
        var $el = $( e.currentTarget );
        if( $el.hasClass('white-key-group') ) {
            $el.removeClass( 'pressed' );
        } else {
            $el.removeClass( 'pressed-black ' );
        }
        $el.removeClass( 'active' );
        mplay.stop();
    });
}
	};

	$( doc ).ready(function() {
		var $oct1 = $( '#oct1' ),$oct2 = $( '#oct2' );
		var _changeOctave = function( oct ) {
			if( oct ) {				
				$oct1.addClass( 'b-active' );
				$oct2.removeClass( 'b-active' );
			} else {				
				$oct1.removeClass( 'b-active' );
				$oct2.addClass( 'b-active' );
			}
		};
		
		try {
			var Tmp = win.AudioContext || win.webkitAudioContext;
			audio_context = new Tmp();
		} catch (e) {
			alert('No web audio oscillator support in this browser');
		}

		$( doc ).keydown(function( e ) {
			e.preventDefault();
			
			if( __KEYSPRESSED.indexOf( e.which ) === -1 ) {
				__KEYSPRESSED.push( e.which );
			}
			if( e.which === 49 ) {
				__OCTAVE = 3;
				piano.changeOctave();
				_changeOctave( true );
				
			}
			if( e.which === 50 ) {
				__OCTAVE = 4;
				piano.changeOctave();
				_changeOctave( false );
			}
		});
		$( doc ).keyup(function( e ) {
			e.preventDefault();
			var io = __KEYSPRESSED.indexOf( e.which );
			if( io !== -1 ) {
				__KEYSPRESSED.splice( io, 1 );
				__STOPPEDNOTES.push( e.which );
			}
		});
		$( '#vibrato').on( 'change', function( e ) {
			__VIBRATO = $( e.currentTarget ).is(':checked') ? true : false;
		});
		$( '#animate').on( 'change', function( e ) {
			if( $( e.currentTarget ).is(':checked') ) {
				win.piano.$target.removeClass( 'animate' );
			} else {
				win.piano.$target.removeClass( 'animate' );
			}
		});
		$( '#instrument').on( 'change', function( e ) {
			__INSTRUMENT = +e.currentTarget.selectedIndex + 1;
		});
		$( '#volume').on( 'change', function( e ) {
			__VOLUME = +e.currentTarget.value;
		});

		$( '#notes' ).on( 'change', function( e ) {
			if( $( e.currentTarget ).is(':checked') ) {
				win.piano.$target.find( '.f-notes' ).addClass( 'info-active' );
			} else {
				win.piano.$target.find( '.f-notes' ).removeClass( 'info-active' );
			}
		});
		$( '#keymap' ).on( 'change', function( e ) {
			if( $( e.currentTarget ).is(':checked') ) {
				win.piano.$target.find( '.f-keymap' ).addClass( 'info-active' );
			} else {
				win.piano.$target.find( '.f-keymap' ).removeClass( 'info-active' );
			}
		});
		$( '.box' ).on( 'click', function( e ) {
			if( $( e.currentTarget ).attr( 'id' ) === 'oct1' ) {
				__OCTAVE = 3;
				piano.changeOctave();
				_changeOctave( true );
			} else {
				__OCTAVE = 4;
				piano.changeOctave();
				_changeOctave( false );
			}
		});

		win.piano = new Piano(3, '#piano');
		setInterval( mplay.render, 0 );
	});


	var mplay = {};
	var fq = [];
	mplay.play = function ( freqs, key ) {
		var oscs = [], o, i, g;
		freqs.forEach( function( freq ) {
			g = createGain();
			g.gain.value = __VOLUME;
			o = audio_context.createOscillator();
			o.frequency.value = freq;
			o.connect( g );
			g.connect( audio_context.destination );
			_play( 0 );
			oscs.push( o );
		});
		fq[ key ] = oscs;

		function createGain() {
			var out;
			if( audio_context.createGain ) {
				out = audio_context.createGain();
			} else if ( audio_context.createGainNode ) {
				out = audio_context.createGainNode();
			}
			return out;
		}
		function _play( arg ) {
			if( o.noteOn ) {
				o.noteOn( arg );
			} else if ( o.start ) {
				o.start( arg );
			}
		}
	};

	mplay.stop = function ( key ) {
		fq[ key ].forEach( function( o ) {
			_stop( 0, o );
		});
		function _stop( arg, o ) {
			if( o.noteOff ) {
				o.noteOff( arg );
			} else if ( o.stop ) {
				o.stop( arg );
			}
		}

	};

	mplay.getKeyMap = function( map ) {
		switch( map ) {
			case 65:
				return 'C' + __OCTAVE;
			case 83:
				return 'D' + __OCTAVE;
			case 68:
				return 'E' + __OCTAVE;
			case 70:
				return 'F' + __OCTAVE;
			case 71:
				return 'G' + __OCTAVE;
			case 72:
				return 'A' + __OCTAVE;
			case 74:
				return 'B' + __OCTAVE;
			case 87:
				return 'C#' + __OCTAVE;
			case 69:
				return 'D#' + __OCTAVE;
			case 82:
				return 'F#' + __OCTAVE;
			case 84:
				return 'G#' + __OCTAVE;
			case 89:
				return 'A#' + __OCTAVE;
			case 75:
				return 'C' + ( __OCTAVE + 1 );
			case 76:
				return 'D' + ( __OCTAVE + 1 );
			case 186:
				return 'E' + ( __OCTAVE + 1 );
			case 220:
				return 'F' + ( __OCTAVE + 1 );
			case 85:
				return 'C#' + ( __OCTAVE + 1 );
			case 73:
				return 'D#' + ( __OCTAVE + 1 );
			case 79:
				return 'F#' + ( __OCTAVE + 1 );
			case 80:
				return 'G#' + ( __OCTAVE + 1 );
			case 65:
				return 'A#' + ( __OCTAVE + 1 );
			default:
				return false;
		}
	};

	mplay.render = function() {
		var freq, keyMap, $el;
		__KEYSPRESSED.forEach( function( key ) {
			if( __PLAYINGNOTES.indexOf( key ) === -1 ) {
				keyMap = mplay.getKeyMap( key );
				if( keyMap ) {
					freq = mplay.getFrequency( keyMap );
					mplay.play( mplay.getInstrument( freq, __INSTRUMENT, __VIBRATO ), key );
					__PLAYINGNOTES.push( key );
					$el = $('div[data-note=' + keyMap + ']');

					if( $el.hasClass('white-key-group') ) {
						$el.addClass( 'pressed' );
					} else {
						$el.addClass( 'pressed-black ' );
					}
					$el.addClass( 'active' );
				}
			}
		});
		__STOPPEDNOTES.forEach( function( key ) {
			keyMap = mplay.getKeyMap( key );
			if( keyMap ) {
				mplay.stop( key );
				__STOPPEDNOTES.splice( __STOPPEDNOTES.indexOf( key ), 1 );
				__PLAYINGNOTES.splice( __PLAYINGNOTES.indexOf( key ), 1 );
				$el = $('div[data-note=' + keyMap + ']');
				if( $el.hasClass('white-key-group') ) {
					$el.removeClass( 'pressed' );
				} else {
					$el.removeClass( 'pressed-black ' );
				}
				$el.removeClass( 'active' );
			}
		});
	};

	// From Retrojs
	// https://github.com/eshiota/retro-audio-js
	mplay.getFrequency= function (note) {
		var notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"], octave, keyNumber;

		if (note.length === 3) {
			octave = note.charAt(2);
		} else {
			octave = note.charAt(1);
		}
		octave = +octave + 1;

		keyNumber = notes.indexOf(note.slice(0, -1));

		if (keyNumber < 3) {
			keyNumber = keyNumber + 12 + ((octave - 1) * 12) + 1;
		} else {
			keyNumber = keyNumber + ((octave - 1) * 12) + 1;
		}

		// Return frequency of note
		return Math.floor(440 * Math.pow(2, (keyNumber - 49) / 12));
	};
	mplay.getInstrument = function( freq, instrument, vibrato ) {
		var freqs = [];

		switch( instrument ) {
			case 1:
				freqs.push( freq );
				freqs.push( freq * 2 );
				freqs.push( freq * 4 );
				freqs.push( freq * 8.5);
				freqs.push( freq * 19 );
				freqs.push( freq / 2 );
				break;
			case 2:
				freqs.push( freq );
				freqs.push( freq * (freq / ( freq -1 ) ) );
				freqs.push( freq * (freq / ( freq -5 ) ) );
				freqs.push( freq * (freq * ( freq -22 ) ) );
				freqs.push( freq * 4 );				
				freqs.push( freq / 2 );
				freqs.push( freq / 3 );
				break;
			case 3:
				freqs.push( freq );
				freqs.push( freq * (freq * ( freq -122 ) ) );
				freqs.push( freq * (freq * ( freq -22 ) ) );
				freqs.push( freq * (freq * ( freq -2 ) ) );
				freqs.push( freq * 23 );
				freqs.push( freq * 1.221 );
				freqs.push( freq / 2 );
				freqs.push( freq / 2.2 );
				freqs.push( freq / 3 );
				break;
			case 4:
				freqs.push( freq * 2 );
				freqs.push( freq / 2 );
				break;

		}
		if( vibrato ) {
			freqs.push( freq * (freq / ( freq -5 ) ) );
		}
		return freqs;
	};
}( window, document, $ )); 