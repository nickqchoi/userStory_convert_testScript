## Background 

This project was developed to assist project managers in the banking industry to automatically generate test scripts for QA using inputted user stories. 

## Features

- Upload user stories in DOCX format
- Process user stories using the Claude 3.5 Sonnet API
- Generate HTML-formatted test scripts
- View generated test scripts directly in the browser
- Example user stories and test scripts included for reference

## Prerequisites
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- A Claude API key from Anthropic

## Installation
To install the User Story to Test Script Converter, follow these steps:

- Clone the repository:
```
git clone https://github.com/nickqchoi/userStory_convert_testScript
```

- Navigate to the project directory in your IDE of choice:
```
cd userStory_convert_testScript
```

- Install the dependencies:
```
npm install
```

- Create a .env file in the root directory and add your Claude API key:
```
CLAUDE_API_KEY=your_api_key_here
```


## Usage
To run the User Story to Test Script Converter, follow these steps:

Start the server:
```
npm start
```

- Open your web browser and navigate to http://localhost:3000 

- Use the web interface to upload a user story file (DOCX format).

- Wait for the processing to complete. The application will use the Claude API to generate a test script based on your user story.

- Once processing is complete, you will be automatically redirected to a page displaying the generated test script in an HTML table format.

- You can now use this test script for your QA processes or export it for further use.

## Contact
email nicchoi500@gmail.com
