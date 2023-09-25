//more optimise code


const XLSX = require('xlsx');
const fs = require('fs');
const Item = require('../models/Item');
const ItemVariation = require('../models/ItemVariation');

const unzipper = require('unzipper');
const Image = require('../models/image');



// const validateColumns = (actualColumn, expectedColumn) => {

//   for(const column of expectedColumn){
//     if(!actualColumn.includes(column)){
//       throw new Error(`Column '${column}' is missing.`);
//     }
//   }
// }

const importUser = async (req, res) => {
  try {

    console.time('importUser');

    const workbook = XLSX.readFile(req.file.path);
    const sheetData = {};


    // sheetData[`${workbook.SheetNames[0]}`] = XLSX.utils.sheet_to_json(workbook.Sheets[`${workbook.SheetNames[0]}`]);
    // sheetData[`${workbook.SheetNames[1]}`] = XLSX.utils.sheet_to_json(workbook.Sheets[`${workbook.SheetNames[1]}`]);
    // sheetData[`${workbook.SheetNames[2]}`] = XLSX.utils.sheet_to_json(workbook.Sheets[`${workbook.SheetNames[2]}`]);
    // sheetData[`${workbook.SheetNames[3]}`] = XLSX.utils.sheet_to_json(workbook.Sheets[`${workbook.SheetNames[3]}`]);

    workbook.SheetNames.forEach(async (sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      sheetData[sheetName] = data;
    });

    // const expectedColumns = {
    //   Item: ['Code', 'Name', 'Description', 'ShopeCode', 'Image1', 'Image2', 'Image3', 'Image4', 'Image5'],
    //   Variation: ['Item_Code', 'No', 'Size'],
    //   Diamond: ['Variation_No', 'Size', 'Quality'],
    //   Stone: ['Variation_No', 'Size', 'Quality'],
    // };

    // validateColumns(Object.keys(data[0]), expectedColumns[sheetName]);


    const itemData = sheetData['Item'];
    const variationData = sheetData['Variation'];
    const diamondData = sheetData['Diamond'];
    const stoneData = sheetData['Stone'];

    // Create a map to store variations and their associated data
    const variationsMap = new Map();                

    for (const row3 of diamondData) {
      const variationKey = row3.Variation_No;                    
      if (!variationsMap.has(variationKey)) {
        variationsMap.set(variationKey, {
          diamond: [],
          stone: [],
        });
      }
      variationsMap.get(variationKey).diamond.push({
        size: row3.Size,
        quality: row3.Quality,
      });
    }

    for (const row4 of stoneData) {
      const variationKey = row4.Variation_No;
      if (!variationsMap.has(variationKey)) {
        variationsMap.set(variationKey, {
          diamond: [],
          stone: [],
        });
      }
      variationsMap.get(variationKey).stone.push({
        size: row4.Size,
        quality: row4.Quality,
      });
    }

    const itemInsertions = itemData.map((row1) => { 

      return {
        code: row1.Code,
        name: row1.Name,
        description: row1.Description,
        shopeCode: row1.ShopeCode,
        images: [
          {
            Image1: row1.Image1,
            Image2: row1.Image2,
            Image3: row1.Image3,
            Image4: row1.Image4,
            Image5: row1.Image5,
          },
        ],
      }      
    });

    const insertIteamRecord = await Item.insertMany(itemInsertions);
    const itemsMap = new Map();

    insertIteamRecord.map(item => {
 itemsMap.set(item.code, item._id)
          })
    
          
    const variations = variationData
        .map((variation) => {
          return {
            itemId: itemsMap.get(variation.Item_Code),
            size: variation.Size,
            diamond: variationsMap.get(variation.No)?.diamond || [],
            stone: variationsMap.get(variation.No)?.stone || [],
          }
        });

    ItemVariation.insertMany(variations);

    console.timeEnd('importUser');

    res.send({ status: 200, success: true, msg: 'Excel Imported' });
  } catch (error) {
    res.send({ status: 400, success: false, msg: error.message });
  }
};


const uploadImage = async (req, res) => {
  try {
    const zipFile = req.file;

    if (!zipFile) {
      return res.status(400).send('Please upload a zip file.');
    }

    const tempDir = __dirname + '/temp';
    console.log("__dirname",__dirname);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const zipPath = `${tempDir}/${zipFile.originalname}`;
    console.log("zipPath",zipPath);
    fs.writeFileSync(zipPath, zipFile.buffer);

    const extractedImages = [];
    await fs.createReadStream(zipPath)
      .pipe(unzipper.Parse())
      .on('entry', (entry) => {
    //    console.log("entry.type",entry.type)
        if (entry.type === 'File') {
          const image = new Image({
            name: entry.path,
            data: Buffer.from([]), 
            contentType: 'image/jpeg', 
          });

          entry.on('data', (chunk) => {
            image.data = Buffer.concat([image.data, chunk]);
          });

          entry.on('end', () => {
            extractedImages.push(image);
          });
        } else {
          entry.autodrain();
        }
      })
      .promise();

    for (const image of extractedImages) {
      await image.save();
    }

    fs.unlinkSync(zipPath); // Remove the temporary zip file

    return res.status(200).send('Images uploaded and extracted successfully.');
  } catch (err) {
    console.error('Error uploading and extracting images:', err);
    return res.status(500).send('Error uploading and extracting images.');
  }
}



module.exports = {
  importUser,
  uploadImage
};
