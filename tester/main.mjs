
import Blackboard from "../source/Blackboard.mjs";

window.addEventListener('load', async function() {
	
	
	let dInput = document.body.querySelector("#d-input");
	let dOutput = document.body.querySelector("#d-output");
	
	///
	let model = await tf.loadLayersModel('../model/mnist.json');
	
	/** 
	 *	
	 *	@param {ImageData} imagedata
	 *	@return {Number}	0 < x < 9
	 */
	function predict( imagedata ) {
		
		let data = imagedata.data;
		let input = new Uint8Array( 28 * 28 );
		
		/// copy pixels
		for( let i = 0; i < input.length; i++ )
			input[i] = data[ i * 4 ];
		
		/// response is a array[10] 
		let response = model.predict( tf.tensor2d( input, [ 1, 28 * 28 ]) ).dataSync();
		
		///
		let closeValue = Math.max( ...response );
		
		/// return 
		return response.indexOf( closeValue );
	
	}
	
	function onInputHandler() {
		
		let smallCtx = blackboard.getSmallContext2D();
		
		let result = predict( smallCtx.getImageData( 0, 0, 28, 28 ) );
		
		///
		///
		///
		
		let div = document.createElement('div');
			div.className = "box-result";
			
		let pre = document.createElement('pre');
			pre.innerHTML = "Results: "+ result;
			
		///
		div.appendChild( smallCtx.canvas );
		div.appendChild( pre );
		
		dOutput.insertBefore( div, dOutput.firstChild );
		
	}
	
	///
	let blackboard = new Blackboard( onInputHandler );
	
	///
	dInput.appendChild( blackboard.canvas );
	
}, false);
	
