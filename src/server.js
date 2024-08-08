const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processUserStory, readDocxFile } = require('./claudeApi');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/upload', upload.single('userStory'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const filePath = req.file.path;
        console.log('Processing file:', filePath);
        
        const testScriptContent = await processUserStory(filePath);
        
        // Generate a unique filename for the HTML
        const fileName = `test_script_${Date.now()}.html`;
        const htmlPath = path.join(__dirname, '..', 'public', fileName);
        
        // Create a full HTML document
        const fullHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Script</title>
</head>
<body>
    ${testScriptContent}
</body>
</html>
        `;
        
        // Write the HTML content to a file
        fs.writeFileSync(htmlPath, fullHtmlContent);
        console.log('Test script generated:', htmlPath);
        
        // Redirect to the generated HTML file
        res.redirect(`/${fileName}`);
    } catch (error) {
        console.error('Error processing user story:', error);
        res.status(500).send(`An error occurred while processing the user story: ${error.message}`);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

