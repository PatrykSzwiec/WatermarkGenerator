const Jimp = require('jimp');
const fs = require('fs');
const inquirer = require('inquirer');

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

// PREPARE Output File Names
const prepareOutputFilename = (filename) => {
  const [ name, ext ] = filename.split('.');
  return `${name}-with-watermark.${ext}`;
};

const prepareEditedOutputFilename = (filename) => {
  const [name, ext] = filename.split('.');
  return `${name}-with-watermark-edited.${ext}`;
};

// Validate Number Input 

const validateNumberInput = async (message, min, max) => {
  const editValue = await inquirer.prompt([{
    name: 'value',
    type: 'input',
    message,
  }]);

  const parsedValue = parseFloat(editValue.value);

  // Validate if the user entered a valid number between min and max
  if (isNaN(parsedValue) || parsedValue < min || parsedValue > max) {
    console.log(`Invalid value. Please enter a number between ${min} and ${max}.`);
    return null;
  }

  return parsedValue;
};

module.exports = {
  addTextWatermarkToImage,
  addImageWatermarkToImage,
  validateSourceFileName,
  validateWatermarkFileName,
  validateNumberInput,
  prepareOutputFilename,
  prepareEditedOutputFilename,
  addBrighnessToImage,
  addContrastToImage,
  addGreyScaleToImage,
  addInvertToImage,
};