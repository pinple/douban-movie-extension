(function () {

    var port = null;
    var dict = {};
    var repoAddr = 'https://github.com/Neulana/douban-movie-extension';

    // search with movie name
    function search(movieName, parentTag) {
        if (!port || port.name != 'douban-movie') {
            port = chrome.runtime.connect({
                name: 'douban-movie'
            });
            port.onMessage.addListener(function (msg) {
                var url = msg.url;
                if (!msg.success) {
                    dict[url].found = false;
                    return;
                }
                dict[url].found = true;
                var task;
                while (dict[url].tasks.length > 0) {
                    task = dict[url].tasks.pop();
                    var panel = getLinkStyle(neetLinks);
                    task.parentTag.insertBefore(panel, task.parentTag.childNodes[0]);
                }
            });
        }
        var url = 'https://neets.cc/search?page-size=6&type=2&key=' + movieName;
        if (!dict[url]) {
            dict[url] = {
                tasks: []
            };
        }
        if (dict[url].found) {
            // var panel = getLinkStyle(url);
            // parentTag.appendChild(panel);
        } else if (dict[url].found == undefined) {
            dict[url].tasks.push({
                parentTag: parentTag
            })
            port.postMessage({
                url: url
            });
        }
    }

    function getLinkStyle(neetLinks) {
        var neetsDiv = document.createElement('div');
        var neetsH2 = document.createElement('h2');
        var starMe = document.createElement('a');
        neetsDiv.setAttribute('class', 'gray_ad');
        neetsH2.innerText = '豆瓣电影传送门&nbsp;·&nbsp;·&nbsp;·&nbsp;·&nbsp;·&nbsp;·'
        starMe.setAttribute('href', repoAddr);
        starMe.setAttribute('target', '_blank');
        starMe.setAttribute('class', 'report-error');
        starMe.innerText = 'StarMe!';
        neetsDiv.appendChild(neetsH2);
        neetsDiv.appendChild(starMe);
        var neetsUl = document.createElement('ul');
        neetsUl.setAttribute('class', 'bs');
        for (var i = 0; i < neetLinks.length; i++) {
            var neetsLi = document.createElement('li');
            var neetsMovie = document.createElement('a');
            neetsMovie.setAttribute('href', neetLinks[i][1]);
            neetsMovie.setAttribute('target', '_blank');
            neetsMovie.setAttribute('class', 'playBtn');
            neetsMovie.innerHTML = neetLinks[i][0];
            neetsLi.appendChild(neetsMovie);
            neetsUl.appendChild(neetsLi);
        }
        neetsDiv.appendChild(neetsUl);
        return neetsDiv;
    }

    function runDouban() {
        var h1 = document.getElementsByTagName('h1')[0];
        var movieName = h1.firstElementChild.innerText;
        var aside = document.getElementsByClassName('aside');
        if (aside) {
            search(movieName, aside[0]);
        }

        // douban book
        if (window.location.hostname === 'book.douban.com') {
            var menu = document.getElementsByClassName('nav-items');
            if (menu && menu[0]) {
                // show link only when mouse hover
                menu[0].addEventListener("mouseover", function () {
                    var link = document.getElementById('neets-menu');
                    if (link) {
                        link.style['display'] = 'inline-block';
                    }
                }, false);
                menu[0].addEventListener("mouseout", function () {
                    var link = document.getElementById('neets-menu');
                    if (link) {
                        link.style['display'] = 'none';
                    }
                }, false);
            }
        }
    }

    var host = window.location.hostname;
    if (host === 'movie.douban.com') {
        runDouban();
    }
})();