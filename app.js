const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const { addTextWatermarkToImage, addImageWatermarkToImage, validateNumberInput,
  validateSourceFileName, validateWatermarkFileName, prepareOutputFilename, prepareEditedOutputFilename, 
  addBrighnessToImage, addContrastToImage, addGreyScaleToImage, addInvertToImage } = require('./functions');


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

  // Prepare edited output file path
  let editedOutputFilePath = './img/' + prepareEditedOutputFilename(options.inputImage);

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
      const brightnessValue = await validateNumberInput('Type a value between -1 to +1 (ex. 0.25):', -1, 1);

      await addBrighnessToImage('./img/' + prepareOutputFilename(options.inputImage), './img/' + prepareEditedOutputFilename(options.inputImage), brightnessValue);
      process.stdout.write('Contrast added to image');
    }
    else if (editOptions.editType === 'Increase Contrast'){
      const contrastValue = await validateNumberInput('Type a value between -1 to +1 (ex. 0.25):', -1, 1);

      await addContrastToImage('./img/' + prepareOutputFilename(options.inputImage), './img/' + prepareEditedOutputFilename(options.inputImage), contrastValue);;
      process.stdout.write('Contrast added to image');
    }
    else if (editOptions.editType === 'Make image B&W'){
      await addGreyScaleToImage('./img/' + prepareOutputFilename(options.inputImage), './img/' + prepareEditedOutputFilename(options.inputImage));
      process.stdout.write('Greyscale added to image');
    }
    else if (editOptions.editType === 'Invert image'){
      await addInvertToImage('./img/' + prepareOutputFilename(options.inputImage), './img/' + prepareEditedOutputFilename(options.inputImage));
      process.stdout.write('Invert added to image');
    }
  }
}

startApp();