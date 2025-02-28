
import MNISTData from "../source/MNISTData.mjs";


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

function plotImageData( imagedata, e = document.body ) {
	
	let canvas = document.createElement("canvas");
	let context = canvas.getContext("2d");
	
	canvas.width = imagedata.width;
	canvas.height = imagedata.height;
	
	context.putImageData( imagedata, 0, 0 );
	
	e.appendChild( canvas );
	
}


let needRest = false;

function createModel() {

	const model = tf.sequential();

	model.add(tf.layers.flatten({ inputShape: [28, 28, 1] })); // Flatten para 1D
	model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
	model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
	model.add(tf.layers.dense({ units: 10, activation: 'softmax' })); // 10 classes (0-9)
	
	needRest = false;
	
	///
	model.compile({
	//	optimizer: tf.train.adam(),
	//	loss: 'categoricalCrossentropy',
		optimizer: tf.train.sgd(0.003),
		loss: 'meanSquaredError',
		metrics: ['accuracy']
	});
	
	return model;
	
}


async function train( model, data ) {
	
	/// 
	/// the adam optimizer keep a cache of the last training
	/// so we need to reset 
	/// 
/*	if( needRest ) {
		
		model.compile({
		//	optimizer: tf.train.adam(0.001),
			optimizer: tf.train.adam(0.001),
			loss: 'categoricalCrossentropy',
			metrics: ['accuracy']
		});
		
	} else {
		
		needRest = true;
		
	}
/**/

	///
	const TRAIN_SIZE = data.trainImages.sizes[0];
	const TEST_SIZE = 100;   // data.testImages.sizes[0];
	
	///
	let [ trainXs, trainYs ] = data.nextTrainBatch( TRAIN_SIZE );
	let [ testXs, testYs ] =  data.nextTestBatch( TEST_SIZE );
	
	await model.fit(trainXs, trainYs, {
		epochs: 10,
		batchSize: 32,
		validationData: [testXs, testYs],
		callbacks: tfvis.show.fitCallbacks(
            { name: 'Training Performance' },
            ['loss', 'acc'],
            { height: 200, callbacks: ['onEpochEnd'] }
        )
	});
	
	
	const evaluation = model.evaluate(testXs, testYs);
	const testLoss = evaluation[0].dataSync()[0];
	const testAcc = evaluation[1].dataSync()[0];

	return "Test loss: "+ testLoss +", Test accuracy: "+ testAcc;
			
}

async function test( model, data, size = 10 ) {
	
	let div = document.createElement("div");
		div.className = 'container';
		
	let [ xs, labels ] = data.nextTestBatch( size );
	
	for( let i = 0; i < size; i++ ) {
		
		///
		let input = xs.slice( [i, 0], [1, xs.shape[1]] ).reshape([1, 28, 28, 1]);
		
		let y = (await labels.slice( [i, 0], [1, labels.shape[1]] ).reshape([10]).data()).indexOf(1);
		
		let response = await model.predict( input );
		
		let value = await response.data();
		let ivalue = value.indexOf( Math.max( ...value ) );
		
		
		///
		let box = document.createElement("div");
			box.className = 'box-result';
		
		let pre = document.createElement("pre");
			pre.innerHTML = "Expected: "+ y +"\nAnswered: "+ ivalue;
		
		let imagedata = createImageData( input.dataSync() );
		
		///
		plotImageData( imagedata, box );
		box.appendChild( pre );
		
		div.appendChild( box );
		
	}
	
	return div;
	
}




window.addEventListener('load', function() {
	
	let pMsg = document.body.querySelector("#p-message");
	let btnTrain = document.body.querySelector("#btn-train");
	let btnTest = document.body.querySelector("#btn-test");
	let btnSave = document.body.querySelector("#btn-save");
	let btnView = document.body.querySelector("#btn-view");
	
	btnTrain.disabled = true;
	btnTest.disabled = true;
	btnSave.disabled = true;
	btnView.style.display = 'none';
	
	///
	const model = createModel();
	const data = new MNISTData();
	
	data.load('../data', async function() {
		
		let divtest;
		
		pMsg.innerHTML = "Page is ready";
		
		///
		btnTrain.disabled = false;
		btnTest.disabled = false;
		btnSave.disabled = false;
		
		///
		btnTrain.onclick = async function(e) {
			
			
			btnView.style.display = 'inline-block';
			
			if( divtest ) divtest.remove();
			
			///
			btnTrain.disabled = true;
			btnTest.disabled = true;
			btnSave.disabled = true;
			
			pMsg.innerHTML = "Training ...";
			
			pMsg.innerHTML = await train( model, data );
			
			///
			btnTrain.disabled = false;
			btnTest.disabled = false;
			btnSave.disabled = false;
			
		};
		
		btnTest.onclick = async function(e) {
			
			if( divtest ) divtest.remove();
			
			divtest = await test( model, data, 10 );
			
			document.body.appendChild( divtest );
		
		};
		
		btnSave.onclick = async function(e) {
		
			await model.save('downloads://mnist');
			
		};
		
		btnView.onclick = async function(e) {
		
			tfvis.visor().toggle();
			
		};
		
	});

}, false);


