const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mammoth = require('mammoth');
const csv = require('csv-parse/sync');

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

async function readDocxFile(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
}

function readCsvFile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records = csv.parse(fileContent, { columns: true, skip_empty_lines: true });
    return records.map(record => Object.values(record).join(' | ')).join('\n');
}

async function loadExampleFiles() {
    const userStory1 = await readDocxFile(path.join(__dirname, '..', 'examples', 'userStory1.docx'));
    const testScript1 = readCsvFile(path.join(__dirname, '..', 'examples', 'testScript1.csv'));
    const userStory3 = await readDocxFile(path.join(__dirname, '..', 'examples', 'userStory3.docx'));
    const testScript3 = readCsvFile(path.join(__dirname, '..', 'examples', 'testScript3.csv'));

    return { userStory1, testScript1, userStory3, testScript3 };
}

async function processUserStory(filePath) {
    const fileContent = await readDocxFile(filePath);

    if (!CLAUDE_API_KEY) {
        throw new Error('CLAUDE_API_KEY is not set in the environment variables');
    }

    const { userStory1, testScript1, userStory3, testScript3 } = await loadExampleFiles();

    const promptInstructions = `I want you to help me turn user stories into test scripts. Using the documents I have attached, I want you to 
    carefully inspect userStory1 and see how I have written testScript1 from it. Then, carefully inspect userStory3 and see how I have written 
    testScript3. In the same style that I have written, I want you to create a test Script for the provided user story. You should take 
    inspiration from my writing of the test scripts, but also use the best practices used for software development when writing user stories.
     Test Scripts must be thorough and test every single scenario or possible outcome based on the user Story. You can infer information if it 
     is not given, but user stories should be the main base for the test scripts which you write. Make sure to follow these principles: For each user 
     story, identify the main functionality and the expected behavior. It is necessary for test execution to outline all steps from beginning to end, as shown in the examples I will provide you.
     Make sure to completely outline ALL steps taken to get to that point. Meaning, write out the entire sequence for every test execution so that a tester can only look at one and still be able to complete the instructions intuitively.
 Define test cases that cover the positive scenarios (e.g., valid inputs).
 Define test cases that cover negative scenarios (e.g., invalid inputs, edge cases). Ensure the test scripts cover functional, edge, 
 and negative test cases. Ensure that the expected results are completely detailed and align with the success criteria in the user story. 
 If negative scenarios occur, be sure to state that the user is unable to procceed with the application . Positive scenarios should result in saying success.
 Do not include an introduction or anything else besides the table in your response, just the full complete table. ONLY provide the table and nothing else. 

Create the table as an HTML document with the following requirements:
1. Use a <table> element with proper <thead> and <tbody> sections.
2. Include columns for: No, Test Condition, Test Execution, Expected Result, Test Result (Pass/Fail), Defect # (if any), and Remarks.
3. Use <th> elements for the header row and <td> elements for data cells.
4. Apply inline CSS to the table for proper formatting, including:
   - Border collapse for a single-line border
   - Borders for the table, th, and td elements
   - Padding for cells
   - A different background color for the header row
   - Appropriate width for the table (e.g., 100%)

Here's an example of the HTML structure and CSS you should use:

<style>
    table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 20px;
    }
    th, td {
        border: 1px solid black;
        padding: 8px;
        text-align: left;
    }
    th {
        background-color: #f2f2f2;
    }
</style>
<table>
    <thead>
        <tr>
            <th>No</th>
            <th>Test Condition</th>
            <th>Test Execution</th>
            <th>Expected Result</th>
            <th>Test Result (Pass/Fail)</th>
            <th>Defect # (if any)</th>
            <th>Remarks</th>
        </tr>
    </thead>
    <tbody>
        <!-- Table rows go here -->
    </tbody>
</table>

The test script you give me should be completely filled with test cases testing every single scenario so that we can use these test scripts to test our software before deployment. Thoroughness is absolutely vital. Ensure that the HTML output includes the CSS and proper table structure as shown above.`;

    try {
        const response = await axios.post(
            CLAUDE_API_URL,
            {
                model: 'claude-3-5-sonnet-20240620',
                system: 'You are an AI assistant trained to convert user stories into test scripts based on provided examples and instructions.',
                messages: [
                    {
                        role: 'user',
                        content: `Here are the example user stories and test scripts:

User Story 1:
${userStory1}

Test Script 1:
${testScript1}

User Story 3:
${userStory3}

Test Script 3:
${testScript3}

Now, please follow these instructions:

${promptInstructions}

Here's the new user story to convert into a test script:

${fileContent}`
                    }
                ],
                max_tokens: 4000
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': CLAUDE_API_KEY,
                    'anthropic-version': '2023-06-01'
                }
            }
        );

        return response.data.content[0].text;
    } catch (error) {
        console.error('Error calling Claude API:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        throw error;
    }
}

module.exports = { processUserStory, readDocxFile, readCsvFile };