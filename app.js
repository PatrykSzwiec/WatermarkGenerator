const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');



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

const prepareOutputFilename = (filename) => {
  const [ name, ext ] = filename.split('.');
  return `${name}-with-watermark.${ext}`;
};

const startApp = async () => {

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

  // Check if the input file exists (after the user provides the filename)
  if (!fs.existsSync('./img/' + options.inputImage)) {
    process.stdout.write('\nSomething went wrong... Try again.\n');
    return;
  }

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

}

startApp();