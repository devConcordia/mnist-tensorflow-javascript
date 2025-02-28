
import IDXFile from "./IDXFile.mjs";
import FileLoader from "./FileLoader.mjs";


///
const mnist_train_index = "/train-labels.idx1-ubyte";
const mnist_train_image = "/train-images.idx3-ubyte";
const mnist_test_index = "/t10k-labels.idx1-ubyte";
const mnist_test_image = "/t10k-images.idx3-ubyte";

/**	
 *	
 */
export default class MNISTData {
	
	constructor() {
		
		///
		this.trainIndex = 0;
		this.testIndex = 0;
		
	}
	
	
	load( path, callback ) {
		
		let self = this;
		
		FileLoader.List([
			path + mnist_train_image,
			path + mnist_test_image,
			path + mnist_train_index,
			path + mnist_test_index
		], 'arraybuffer', function( files ) {
			
			///
			self.trainImages = new IDXFile( files[ path + mnist_train_image ] );
			self.testImages  = new IDXFile( files[ path + mnist_test_image ] );
			self.trainLabels = new IDXFile( files[ path + mnist_train_index ] );
			self.testLabels  = new IDXFile( files[ path + mnist_test_index ] );
			
			///
			callback();
			
		});
		
	}
	
	nextTrainBatch( batchSize = 1 ) {
		
		let self = this;

		let length = this.trainLabels.sizes[0];
		
		return this.nextBatch( batchSize, [this.trainImages, this.trainLabels], function() {

			self.trainIndex = (self.trainIndex + 1) % length;
			
			return self.trainIndex;

		});
		
	}

	nextTestBatch( batchSize = 1 ) {
		
		let self = this;
		
		let length = this.testLabels.sizes[0];
		
		return this.nextBatch(batchSize, [this.testImages, this.testLabels], function() {
			
			self.testIndex = (self.testIndex + 1) % length;
			
			return self.testIndex;
			
		});
		
	}


	nextBatch( batchSize, data, f_index ) {
		
		const batchImagesArray = new Uint8Array( batchSize * 28 * 28 );
		const batchLabelsArray = new Uint8Array( batchSize * 10 );
		
		for( let i = 0; i < batchSize; i++ ) {
		
			const idx = f_index();

			const image = data[0].getValue( idx );
			
			let n = i * 28 * 28;
			
			for( let j = 0; j < image.length; j++ )
				batchImagesArray[ n + j ] = image[j];
			
			const label = data[1].getValue( idx );
			
			batchLabelsArray[ i * 10 + label ] = 1;
			
		}
		
		return [ 
			tf.tensor( batchImagesArray, [ batchSize, 28, 28, 1 ]),
			tf.tensor( batchLabelsArray, [ batchSize, 10 ])
		];
		
	}

}
