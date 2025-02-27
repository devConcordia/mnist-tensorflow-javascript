
import MNISTData from "../source/MNISTData.mjs";


const IMAGE_SIZE = 28 * 28;

function createButton( text, onClick ) {
	
	let btn = document.createElement("button");
		btn.innerHTML = text;
		btn.onclick = onClick;
	
	document.body.appendChild( btn );
	
	return btn;
	
}

function createImageData( input ) {
	
	let output = new ImageData( 28, 28 );
	let data = output.data;
	
	for( let i = 0; i < data.length; i+=4 ) {
		
		let j = i/4;
	//	let v = Math.floor(input[j] * 256);
		let v = input[j];
		
		data[ i   ] = v;
		data[ i+1 ] = v;
		data[ i+2 ] = v;
		data[ i+3 ] = 255;
		
	}
	
	
	return output;
	
}

function plotImageData( imagedata, title = "", e = document.body ) {
	
	let canvas = document.createElement("canvas");
	let context = canvas.getContext("2d");
	
	canvas.title = title;
	canvas.width = imagedata.width;
	canvas.height = imagedata.height;
	
	context.putImageData( imagedata, 0, 0 );
	
	e.appendChild( canvas );
	
}



function createModel() {

	const model = tf.sequential();

	model.add(tf.layers.dense({
		inputShape: [28*28],
		units: 256,
		useBias: true,
		kernelInitializer: 'randomNormal',
		biasInitializer: 'randomNormal',
		activation: 'relu'
	}));
	
	model.add(tf.layers.dense({
		units: 32,
		useBias: true,
		kernelInitializer: 'randomNormal',
		biasInitializer: 'randomNormal',
		activation: 'relu'
	}));

	model.add(tf.layers.dense({
		units: 10,
		useBias: true,
		kernelInitializer: 'randomNormal',
		biasInitializer: 'randomNormal',
		activation: 'softmax'
	}));

	model.compile({
		optimizer: tf.train.adam(),
	//	optimizer: tf.train.sgd(0.01),
		loss: 'categoricalCrossentropy',
		metrics: ['accuracy']
	});
	
	return model;
	
}


async function train( model, data ) {
	
	let printlog = document.createElement("p");
	
	document.body.appendChild( printlog );
	
	const TRAIN_SIZE = 10000;
	const TEST_SIZE = 1000;
	
	///
	let [ trainXs, trainYs ] = data.nextTrainBatch( TRAIN_SIZE );

	let [ testXs, testYs ] =  data.nextTestBatch( TEST_SIZE );
	
	
	//console.log( await testYs.data() )
	
	
	trainXs = trainXs.reshape([ TRAIN_SIZE, IMAGE_SIZE ]);
	testXs = testXs.reshape([ TEST_SIZE, IMAGE_SIZE ]);
	
	return model.fit(trainXs, trainYs, {
		batchSize: 32,
		validationData: [testXs, testYs],
		epochs: 10,
		callbacks: {
			
			onEpochEnd: function(i, object) {
				
				printlog.innerHTML = "["+ i +"] "+ JSON.stringify( object );
				
			},
			
			onTrainEnd: function() {
				
				console.log( printlog.innerHTML );
				printlog.remove();
				
			}
			
		}
	});

}

async function test( model, data, size = 10 ) {
	
	let div = document.createElement("div");
	
	let [ xs, labels ] = data.nextTestBatch( size );
	
	for( let i = 0; i < size; i++ ) {
		
		let input = xs.slice( [i, 0], [1, xs.shape[1]] ); //.reshape([1, IMAGE_SIZE]);
		
		let y = (await labels.slice( [i, 0], [1, labels.shape[1]] ).reshape([10]).data()).indexOf(1);
		
		let response = await model.predict( input );
		
		let value = await response.data();
		let ivalue = value.indexOf( Math.max( ...value ) );
		
	//	plotImageData( createImageData( await input.data() ), y +" == "+ ivalue, div );
		plotImageData( createImageData( input.dataSync() ), y +" == "+ ivalue, div );
		
	}
	
	return div;
	
}

async function main( model, data ) {
	
	await train( model, data );
	
	
	let btnSave = createButton( "Save Model", async function(e) {
	
		const saveResults = await model.save('downloads://mnist');
		
	});
	
	let btnTest = createButton( "Test", async function(e) {
		
		divtest.remove();
		divtest = await test( model, data, 20 );
		
		if( divtest != document.body )
			document.body.appendChild( divtest );
	
	});
	
	let btnRetrain = createButton( "Train Again", async function(e) {
		
		btnSave.remove();
		btnTest.remove();
		btnRetrain.remove();
		
		divtest.remove();
		
		main( model, data );
		
	});
	
	let divtest = await test( model, data, 20 );
	
	if( divtest != document.body )
		document.body.appendChild( divtest );
	
}




window.addEventListener('load', function() {
	
	const model = createModel();
	
	model.summary();
	
	const data = new MNISTData();
	
	data.load('../data', async function() {
		
		await main( model, data );
		
	});

}, false);


