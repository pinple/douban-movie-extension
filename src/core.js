(function () {

    var port = null;
    var dict = {};
    var repoIssuesAddr = 'https://github.com/Neulana/douban-movie-extension/issues';

    // search with movie name
    function search(movieName, parentTag) {
        if (!port || port.name != 'douban-movie') {
            port = chrome.runtime.connect({
                name: 'douban-movie'
            });
            port.onMessage.addListener(function (msg) {
                var url = msg.url;
                var num = url.search("&key=");
                var searchUrl = 'https://neets.cc/search?page-size=6&type=2&key=' + url.substring(num+5);
                var neetLinks = msg.neetLinks;
                if (!msg.success) {
                    dict[url].found = false;
                    return;
                }
                dict[url].found = true;
                var task;
                while (dict[url].tasks.length > 0) {
                    task = dict[url].tasks.pop();
                    var panel = getPanel(searchUrl, neetLinks);
                    task.parentTag.insertBefore(panel, task.parentTag.childNodes[0]);
                }
            });
        }
        var url = 'https://smartapi.neets.cc/full-texts/grab-datas?pageNo=1&pageSize=10&seriesSize=9&themeSize=3&key=' + movieName;
        if (!dict[url]) {
            dict[url] = {
                tasks: []
            };
        }
        if (dict[url].found) {
            // var panel = getPanel(url);
            // parentTag.appendChild(panel);
        } else if (dict[url].found == undefined) {
            dict[url].tasks.push({
                parentTag: parentTag
            });
            port.postMessage({
                url: url
            });
        }
    }

    function getPanel(rawUrl, neetLinks) {
        var neetsDiv = document.createElement('div');
        var neetsH2 = document.createElement('h2');
        var feedBack = document.createElement('a');
        neetsDiv.setAttribute('class', 'gray_ad');
        neetsH2.innerText = '豆瓣电影传送门  · · · · · ·'
        feedBack.setAttribute('href', repoIssuesAddr);
        feedBack.setAttribute('target', '_blank');
        feedBack.setAttribute('class', 'report-error');
        feedBack.innerText = '反馈';
        neetsDiv.appendChild(neetsH2);
        neetsDiv.appendChild(feedBack);
        var neetsUl = document.createElement('ul');
        neetsUl.setAttribute('class', 'bs');
        for (var i = 0; i < neetLinks.length; i++) {
            var neetsLi = document.createElement('li');
            var neetsMovie = document.createElement('a');
            var neetsSpan = document.createElement('span');
            var auxiliaryInfo = neetLinks[i][1];
            neetsMovie.setAttribute('href', neetLinks[i][2]);
            neetsMovie.setAttribute('target', '_blank');
            neetsMovie.setAttribute('class', 'playBtn');
            neetsMovie.innerHTML = neetLinks[i][0];
            neetsSpan.setAttribute('class', 'buylink-price');
            auxiliaryInfo = auxiliaryInfo.replace(' ', '');
            if (auxiliaryInfo) {
                neetsSpan.innerHTML = auxiliaryInfo;
            } else {
                neetsSpan.innerHTML = '免费';
            }
            neetsLi.appendChild(neetsMovie);
            neetsLi.appendChild(neetsSpan);
            neetsUl.appendChild(neetsLi);
        }
        var neetsLiMore = document.createElement('li');
        var neetsMovieMore = document.createElement('a');
        neetsMovieMore.setAttribute('href', rawUrl);
        neetsMovieMore.setAttribute('target', '_blank');
        neetsMovieMore.setAttribute('class', 'playBtn');
        neetsMovieMore.innerHTML = '发现更多>>>';
        neetsLiMore.appendChild(neetsMovieMore);
        neetsUl.appendChild(neetsLiMore);
        neetsDiv.appendChild(neetsUl);
        return neetsDiv;
    }

    function runDouban() {
        var h1 = document.getElementsByTagName('h1')[0];
        var movieName = h1.firstElementChild.innerText.split(' ')[0];
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

    function insertCss() {
        // insert css
        var style = document.createElement('style');
        // webkit hack
        style.appendChild(document.createTextNode(''));
        // insert to head
        document.head.appendChild(style);

        // rules
        var rules = {
            '.buylink-price': {
                left: '130px',
                position: 'absolute',
                color: '#999'
            },
            '.gray_ad .report-error': {
                color: '#999',
                display: 'none',
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent'
            },
            '.gray_ad .report-error:hover': {
                display: 'inline'
            }
        };
        for (var ele in rules) {
            var rulesStr = ele + '{';
            for (var attr in rules[ele]) {
                rulesStr += attr + ': ' + rules[ele][attr] + ';';
            }
            rulesStr += '} ';
            style.sheet.insertRule(rulesStr, 0);
        }
    }

    insertCss();
    var host = window.location.hostname;
    if (host === 'movie.douban.com') {
        runDouban();
    }
})();