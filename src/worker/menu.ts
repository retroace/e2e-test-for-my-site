// USe this to create context menu
// chrome.contextMenus.create({
//     id: 'assertions-test-my-site',
//     type: 'normal',
//     visible: true,
//     title: "Assetions",
//     contexts: ["all"],
// });

// chrome.contextMenus.create({
//     contexts: ['all'],
//     id: 'assertions-test-my-site-exists', "title": "Exists", "parentId": 'assertions-test-my-site'
// }, function () {
//     if (chrome.extension.lastError) {
//         console.log("Got expected error: " + chrome.extension.lastError.message);
//     }
//     console.log(`exists`)
// });

// chrome.contextMenus.create({
//     contexts: ['all'],
//     id: 'assertions-test-my-site-have-attr', "title": "Have Attribute", "parentId": 'assertions-test-my-site'
// }, function () {
//     if (chrome.extension.lastError) {
//         console.log("Got expected error: " + chrome.extension.lastError.message);
//     }
//     console.log(`Have Attribute`)
// });

// chrome.contextMenus.create({
//     contexts: ['all'],
//     id: 'assertions-test-my-site-have-text', "title": "Have Text", "parentId": 'assertions-test-my-site'
// }, function () {
//     if (chrome.extension.lastError) {
//         console.log("Got expected error: " + chrome.extension.lastError.message);
//     }
//     console.log(`Have Text`)
// });
// u