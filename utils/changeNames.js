const fs = require("fs");
const path = require("path");

const directoryPath = "ipfs/metadata";
const numberOfFilesToProcess = 2000;

function modifyFile(filePath) {
    try {
        // Read the JSON file
        const data = fs.readFileSync(filePath, "utf8");
        const jsonData = JSON.parse(data);

        // Modify the name property
        if (jsonData.hasOwnProperty("name")) {
            jsonData.name = "Whitelist"; // Modify the 'name' property value here
        }

        // Save the updated JSON back to the file
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf8");
        console.log(`Modified and saved ${filePath}`);
    } catch (err) {
        console.error(`Error processing file ${filePath}: ${err.message}`);
    }
}

for (let i = 1000; i < numberOfFilesToProcess; i++) {
    const filePath = path.join(directoryPath, `${i}`);
    modifyFile(filePath);
}

console.log("Processing completed.");
