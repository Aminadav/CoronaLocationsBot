function getMe() {
    var response = UrlFetchApp.fetch(url + getBotToken() + '/getMe');
    Logger.log(response.getContentText());
}

function getUpdates() {
    var response = UrlFetchApp.fetch(url + getBotToken() + '/getUpdates');
    Logger.log(response.getContentText());
}

function setWebhook() {
    var response = UrlFetchApp.fetch(url + getBotToken() + '/setWebhook?url=' + getWebAppUrl());
    Logger.log(response.getContentText());
}

// receive id and text and send it to the user
function sendMessage(id, text) {
    var response = UrlFetchApp.fetch(url + getBotToken() + '/sendMessage?chat_id=' + id + '&text=' + text);
    Logger.log(response.getContentText());
}

// handle incoming messages from the user
function doGet(e) {
    return HtmlService.createHtmlOutput('Hello ' + JSON.stringify(e));
}

// response to incoming messages
function doPost(e) {

    // parse the message content as JSON
    var contents = JSON.parse(e.postData.contents);
    var user_id = contents.message.from.id;
    var text = contents.message.text;
    switch(text) {
        case '/help':
            sendMessage(user_id, 'getInstructions()');
    }
    // try to parse file
    var file_id = contents.message.document;
    // if no file exist - say hi
    if(!file_id) {
        sendMessage(user_id, getInstructions());
        return;
    }

    // get file id
    file_id = contents.message.document.file_id;
    // get file path on telegram server
    var file_path = getFilePath(file_id);
    var user_locations_file = getJsonFileFromTelegramServer(file_path);
    sendMessage(user_id, 'מעבד נתונים, אנא המתינו...');

    searchMatchLocations(user_id, user_locations_file);

    sendMessage(user_id, 'עדכון מפה אחרון: ' + getLastUpdate());

}

function getFilePath(file_id) {
    var response = UrlFetchApp.fetch(url + getBotToken() + '/getFile?file_id=' + file_id);
    var file_path = JSON.parse(response.getContentText()).result.file_path;
    Logger.log(file_path);
    return file_path;
}

function getJsonFileFromTelegramServer(file_path) {
    var json_file = UrlFetchApp.fetch(files_url + getBotToken() + '/' + file_path);
    json_file = JSON.parse(json_file);
    return json_file;
}