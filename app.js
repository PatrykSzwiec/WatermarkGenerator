const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');


// FUNCTION WHICH AFFECT ON IMAGE
const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
   // Check if the source file exists
  const image = await Jimp.read(inputFile);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

  const textData = {
    text,
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
  };
  image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
    await image.quality(100).writeAsync(outputFile);
};

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
  const image = await Jimp.read(inputFile);
  const watermark = await Jimp.read(watermarkFile);
  const x = image.getWidth() / 2 - watermark.getWidth() / 2;
  const y = image.getHeight() / 2 - watermark.getHeight() / 2;

  image.composite(watermark, x, y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 0.5,
  });
  await image.quality(100).writeAsync(outputFile);
};

const addInvertToImage = async function(inputFile, outputFile){
  const image = await Jimp.read(inputFile);
  image.invert();
  await image.quality(100).writeAsync(outputFile);
}

const addGreyScaleToImage = async function(inputFile, outputFile){
  const image = await Jimp.read(inputFile);
  image.greyscale();
  await image.quality(100).writeAsync(outputFile);
}

const addContrastToImage = async function(inputFile, outputFile, value){
  const image = await Jimp.read(inputFile);
  image.contrast(value);
  await image.quality(100).writeAsync(outputFile);
}

const addBrighnessToImage = async function(inputFile, outputFile, value){
  const image = await Jimp.read(inputFile);
  image.brightness(value);
  await image.quality(100).writeAsync(outputFile);
}

// VALIDATE FILES
const validateSourceFileName = (filename) => {
  if (fs.existsSync('./img/' + filename)) {
    return true;
  }
  process.stdout.write('\nSource file does not exist. Please enter a valid filename.\n');
  return false;
};

const validateWatermarkFileName = (filename) => {
  if (fs.existsSync('./img/' + filename)) {
    return true;
  }
  process.stdout.write('\nWatermark file does not exist. Please enter a valid filename.\n');
  return false;
};

// PREPARE OutPutFileName
const prepareOutputFilename = (filename) => {
  const [ name, ext ] = filename.split('.');
  return `${name}-with-watermark.${ext}`;
};

/* ---- APPLICATION ---- */
const startApp = async () => {
  console.log('\n');
  // Ask if user is ready
  const answer = await inquirer.prompt([{
      name: 'start',
      message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
      type: 'confirm'
    }]);

  // if answer is no, just quit the app
  if(!answer.start) process.exit();

  // ask about input file and watermark type
  const options = await inquirer.prompt([{
    name: 'inputImage',
    type: 'input',
    message: 'What file do you want to mark?',
    default: 'test.jpg',
    validate: validateSourceFileName,
  },
  {
    name: 'watermarkType',
    type: 'list',
    choices: ['Text watermark', 'Image watermark'],
  }]);

  if(options.watermarkType === 'Text watermark') {
    const text = await inquirer.prompt([{
      name: 'value',
      type: 'input',
      message: 'Type your watermark text:',
    }]);
    options.watermarkText = text.value;
    addTextWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), options.watermarkText);
    process.stdout.write('Text Watermark added');
  }
  else {
    const image = await inquirer.prompt([{
      name: 'filename',
      type: 'input',
      message: 'Type your watermark name:',
      default: 'logo.png',
      validate: validateWatermarkFileName,
    }]);
    options.watermarkImage = image.filename;
    addImageWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), './img/' + options.watermarkImage);
    process.stdout.write('Image Watermark added');
  }

  //Other editing
  console.log('\n');
  const editAnswer = await inquirer.prompt([{
    name: 'start',
    message: 'Do you want to make more edit to photo?',
    type: 'confirm',
  }]);

  if (!editAnswer.start) {
    startApp();
  } else {
    const editOptions = await inquirer.prompt([{
      name: 'editType',
      type: 'list',
      choices: ['Make Image Brighter', 'Increase Contrast', 'Make image B&W', 'Invert image'],
    }]);


    if(editOptions.editType === 'Make Image Brighter'){
      const editValue = await inquirer.prompt([{
        name: 'value',
        type: 'input',
        message: 'Type your between -1 to +1 (ex. 0.25) :',
      }]);

      const brighnessValue = parseFloat(editValue.value);

      // Validate if the user entered a valid number between -1 and +1
      if (isNaN(brighnessValue) || brighnessValue < -1 || brighnessValue > 1) {
        console.log('Invalid brighness value. Please enter a number between -1 to +1.');
        return;
      }

      await addBrighnessToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), brighnessValue);
      process.stdout.write('Contrast added to image');
    }
    else if (editOptions.editType === 'Increase Contrast'){
      const editValue = await inquirer.prompt([{
        name: 'value',
        type: 'input',
        message: 'Type your between -1 to +1 (ex. 0.25) :',
      }]);

      const contrastValue = parseFloat(editValue.value);

      // Validate if the user entered a valid number between -1 and +1
      if (isNaN(contrastValue) || contrastValue < -1 || contrastValue > 1) {
        console.log('Invalid contrast value. Please enter a number between -1 to +1.');
        return;
      }

      await addContrastToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), contrastValue);
      process.stdout.write('Contrast added to image');
    }
    else if (editOptions.editType === 'Make image B&W'){
      await addGreyScaleToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage));
      process.stdout.write('Greyscale added to image');
    }
    else if (editOptions.editType === 'Invert image'){
      await addInvertToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage));
      process.stdout.write('Invert added to image');
    }
  }
}

startApp();
/*
image.brightness( val );          // adjust the brighness by a value -1 to +1
image.contrast( val );            // adjust the contrast by a value -1 to +1
image.greyscale();                // remove colour from the image
image.invert();                   // invert the image colours


*/