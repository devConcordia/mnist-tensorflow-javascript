/**	IDXFile
 *
 *	@version 1.1 
 *	
 *	@ref http://www.fon.hum.uva.nl/praat/manual/IDX_file_format.html
 *	
 *	The magic number is four bytes long. The first 2 bytes are always 0.
 *
 *	The third byte codes the type of the data:
 *
 *	0x08: unsigned byte
 *	0x09: signed byte
 *	0x0B: short (2 bytes)
 *	0x0C: int (4 bytes)
 *	0x0D: float (4 bytes)
 *	0x0E: double (8 bytes)
 *	
 *	The fouth byte codes the number of dimensions of the vector/matrix: 1 for vectors, 2 for matrices....
 * 
 * 	The sizes in each dimension are 4-byte integers (big endian, like in most non-Intel processors).
 * 
 * 	The data is stored like in a C array, i.e. the index in the last dimension changes the fastest.
 *	
 */
export default class IDXFile extends Uint8Array {
	
	constructor( buffer ) {
		
		buffer = new Uint8Array( buffer );
		
		var type = buffer[2];
		var dimension = buffer[3];
		
		var sizes = new Array();
		
		var offset = 4;
		
		for( var i = 0; i < dimension; i++ ) {
			
			var n1 = buffer[ offset   ],
				n2 = buffer[ offset+1 ],
				n3 = buffer[ offset+2 ],
				n4 = buffer[ offset+3 ];
			
			sizes.push( n4 | n3 << 8 | n2 << 16 | n1 << 24 );
			
			offset += 4;
			
		}
		
		super( buffer.slice( offset, buffer.length ) );
		
		this.type = type;
		this.sizes = sizes;
		
	}
	
	/** getOffset
	 *	
	 *	@param {Number} d1, d2, d3, ... 
	 *	@return {Number}
	 */
	getOffset() {
		
		var sizes = this.sizes;
		
		var offset = 0; // this.offset;
		
		for( var i = 0; i < arguments.length; i++ ) {
			
			var length = 1;
			
			for( var j = i + 1; j < sizes.length; j++ ) length *= sizes[ j ];
			
			offset += arguments[ i ] * length;
			
		}
		
		return offset;
		
	}
	
	/** getValue
	 *	
	 *	@param {Number} d1, d2, d3, ... 
	 *	@return {Number|Uint8Array}
	 */
	getValue() {
		
		var offset = this.getOffset( ...arguments );
		
		if( arguments.length == this.sizes.length ) return this[ offset ];
		
		
		var length = 1;
		
		for( var i = arguments.length; i < this.sizes.length; i++ )
			length *= this.sizes[ i ];
		
		var output = new Uint8Array( length );
		
		for( var i = 0; i < length; i++ ) output[i] = this[ offset + i ];
		
		return output;
	
	}
	
}
