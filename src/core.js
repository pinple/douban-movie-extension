(function () {
    var gb = {
        LINK_TYPE: {
            SUBJECT: 0
        }
    }

    var port = null;
    var dict = {};

    // search with movie name
    function search(movieName, linkType, parentTag) {
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
                    var panel = getLinkStyle(task.linkType, url);
                    task.parentTag.appendChild(panel);
                    task.parentTag.setAttribute('has-neets', '1');
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
            var panel = getLinkStyle(linkType, url);
            parentTag.appendChild(panel);
            parentTag.setAttribute('has-neets', '1');
        } else if (dict[url].found == undefined) {
            dict[url].tasks.push({
                linkType: linkType,
                parentTag: parentTag
            })
            port.postMessage({
                url: url
            });
        }
    }

    function getLinkStyle(linkType, readfreeUrl) {
        var className = null;
        var text = null;
        if (linkType === gb.LINK_TYPE.SUBJECT) {
            className = 'rf-book-page-main-link';
            text = 'Neets!';
        }
        if (className !== null) {
            var ahref = document.createElement('a');
            ahref.setAttribute('href', readfreeUrl);
            ahref.setAttribute('target', '_blank');
            ahref.setAttribute('class', className);
            ahref.innerHTML = text;
            return ahref;
        }
        return null;
    }


    function insertCss() {
        // insert css
        var style = document.createElement('style');
        // webkit hack
        style.appendChild(document.createTextNode(''));
        // insert to head
        document.head.appendChild(style);

        // rules
        var primaryColor = '#37a';
        var secondaryColor = '#614e3c';
        var rules = {
            '.rf-book-page-main-link': {
                position: 'fixed',
                top: '160px',
                left: '-10px',
                padding: '10px 20px 10px 30px',
                display: 'block',
                background: secondaryColor,
                color: 'white !important'
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

    function runDouban() {
        var pathRe = location.pathname.match(/\/(\w+)\/(\d+)\//);

        // loadDoubanReadfree();

        // book page
        if (pathRe) {
            var urlClass = pathRe[1];
            var doubanId = pathRe[2];
            if (urlClass === 'subject') {
                search(doubanId, gb.LINK_TYPE.SUBJECT, document.body);
            }
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

        // search neets when load more
        reloadIndex(['a_nointerest_subject', 'load-more', 'book_x'], function () {
            setTimeout(function () {
                loadDoubanReadfree();
            }, 2000);
        });

        function loadDoubanReadfree() {
            var links = document.getElementsByTagName('a');
            for (var i in links) {
                (function (e) {
                    // ignore those with loaded neets
                    if (typeof links[e] === 'object' &&
                        links[e].parentNode.getAttribute(
                            'has-neets') === '1') {
                        return;
                    }

                    var re = links[e].href === undefined ? null :
                        links[e].href.match(/\/subject\/(\d+)(\/$|\/\?)/);

                    // ignore those with both title and images
                    if (links[e].className === 'cover') {
                        // cover image in people page, don't ignore
                        search(re[1], gb.LINK_TYPE.IMAGE, links[e].parentNode);
                        return;
                    }
                })(i);
            }
        }
    }

    // index page of read
    function reloadIndex(classNameList, callback) {
        for (var cid = 0, clen = classNameList.length; cid < clen; ++cid) {
            var bookX = document.getElementsByClassName(classNameList[cid]);
            if (bookX.length > 0 && callback) {
                for (var i = 0; i < bookX.length; ++i) {
                    bookX[i].addEventListener('click', function () {
                        callback();
                    });
                }
            }
        }
    }

    insertCss();
    var host = window.location.hostname;
    if (host === 'movie.douban.com') {
        runDouban();
    }
})();