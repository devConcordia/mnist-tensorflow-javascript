
/** 
 *	
 */
function http_get_request( url, type, onLoad ) {
	
	var request = new XMLHttpRequest();

		request.open( 'GET', url, true );
		request.responseType = type;

		request.addEventListener( 'load', function( event ) {

			onLoad( event.target.response, event );

		}, false );
		
		request.send( null );

}

/** 
 *	
 */
function http_post_request( url, data, onLoad ) {
	
	var request = new XMLHttpRequest();

		request.open( 'POST', url, true );

		request.addEventListener( 'load', function( event ) {

			if( onLoad ) onLoad( event.target.response, event );

		}, false );
		
		request.send( data );

}

/** FileLoader
 *	
 */
export default class FileLoader {
	
	/** FileLoader.Load
	 *	
	 *	@param {Sting} url
	 *	@param {String} type 	arraybuffer | blob | document | json | text
	 *	@param {Function} onError
	 */
	static Load( url, type, onLoad ) {
		
		http_get_request( url, type, onLoad );
		
	}
	
	/** FileLoader.list
	 *	
	 *	@param {Array} array
	 *	@param {Function} callback
	 */
	static List( array, type, callback ) {
		
		var output = new Object();
		var index = 0;
		
		function nextFile() {
			
			var path = array[ index++ ];
			
			if( path ) {
				
				FileLoader.Load( path, type, function onLoad( response ) {
			
					output[ path ] = response;
					
					nextFile();
				
				});
			
			} else {
				
				callback( output );
				
			}
			
		}
		
		nextFile();
		
	}
	
	static Post( url, data, callback ) {
		
		if( !(data instanceof FormData) ) {
			
			var formdata = new FormData();
			
			for( var key in data )
				formdata.append( key, data[key] );
			
			data = formdata;
			
		}
		
		http_post_request( url, data, callback );
		
	}
	
}
