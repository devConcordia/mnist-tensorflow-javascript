
/** 
 *	
 */
export default class Blackboard {
	
	constructor( inputHandler ) {
		
		if( !(inputHandler instanceof Function) ) 
			throw new Error("@param `inputHandler` is not a function");
		
		///
		const WIDTH = 300;
		const HEIGHT = 300;
		
		/// delay to trigger inputHandler. in milleseconds
		const DELAY = 500;
		
		///
		let canvas = document.createElement('canvas');
		let context = canvas.getContext('2d');
		
		canvas.width = WIDTH;
		canvas.height = HEIGHT;
		
		/// setup to draw with strokes
		context.lineWidth = 20;
		context.lineJoin = "round";
		context.strokeStyle = '#fff';
		
		/// clear
		context.fillStyle = '#000';
		context.fillRect( 0, 0, WIDTH, HEIGHT );
		
		///
		let MOUSE_GRAB = false;
		let lastx = 0,
			lasty = 0;
		
		///
		let timeout = null;
		
		canvas.addEventListener('mousedown', function(e) {
			
			lastx = e.clientX - canvas.offsetLeft;
			lasty = e.clientY - canvas.offsetTop;
			
			MOUSE_GRAB = true;
			
		}, false);
		
		canvas.addEventListener('mousemove', function(e) {
			
			if( MOUSE_GRAB ) {
				
				let x = e.clientX - canvas.offsetLeft,
					y = e.clientY - canvas.offsetTop;
				
				context.beginPath();
				context.moveTo( lastx, lasty );
				context.lineTo( x, y );
				context.closePath();
				context.stroke();
				
				lastx = x;
				lasty = y;
				
			}
			
		}, false);
		
		canvas.addEventListener('mouseup', function() {
			
			MOUSE_GRAB = false;
			
		//	inputHandler();
		
			/// clear
		//	context.fillStyle = '#000';
		//	context.fillRect( 0, 0, WIDTH, HEIGHT );
			
			
			clearTimeout( timeout );
			timeout = setTimeout(function() {
				
				inputHandler();
				
				/// clear
				context.fillStyle = '#000';
				context.fillRect( 0, 0, WIDTH, HEIGHT );
			
			}, DELAY );
			
			
		}, false);
		
		///
		///
		///
		
		this.canvas = canvas;
		this.context = context;
		
	}
	
	
	/** 
	 *	Create a new canvas with 28x28 and draw current data of main canvas;
	 *	
	 *	@return {CanvasRenderingContext2D}
	 */
	getSmallContext2D() {
		
		let canvas = document.createElement('canvas');
		let context = canvas.getContext('2d');
		
		canvas.width = 28;
		canvas.height = 28;
		
		context.drawImage( this.canvas, 0, 0, 28, 28 );
		
		return context;
		
	}
	
}
