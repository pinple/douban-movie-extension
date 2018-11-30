var cached = {};

chrome.runtime.onConnect.addListener(function (port) {
    if (port.name == "douban-movie") {
        port.onMessage.addListener(function (msg) {
            if (cached[msg.url]) {
                port.postMessage(cached[msg.url]);
                return;
            }
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                console.log(xhr);
                if (xhr.status == 200) {
                    var dom = document.createElement('html');
                    dom.innerHTML = xhr.responseText;
                    var resoures = dom.getElementsByClassName('themes_list_cen_li2');
                    if (resoures) {
                        msg.neetLinks = [];
                        for (var i = 0; i < resoures.length; i++) {
                            var movieTitle = resoures[i].getElementsByClassName('tit')[0].nodeValue;
                            var movieUrl = resoures[i].getElementsByClassName('themes_a')[0].nodeValue;
                            console.log('movieTitle: ' + movieTitle);
                            console.log('movieUrl: ' + movieUrl);
                            msg.neetLinks.push([movieTitle, movieUrl]);
                        }
                        msg.success = true;
                        port.postMessage(msg);
                        cached[msg.url] = msg;
                    } else {
                        msg.success = false;
                        port.postMessage(msg);
                        cached[msg.url] = msg;
                    }
                }
            };
            xhr.open('GET', msg.url, true);
            xhr.setRequestHeader('Content-type', 'text/html');
            xhr.send();
        });
    }
});