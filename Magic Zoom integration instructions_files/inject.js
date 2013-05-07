(function () {

    // tell toolbar that inject was successful
    dntPageEvents("hello");

    // return if already injected
    if (window.dntToolbarClicked) return;

    function sendPageEvent(action, params, callback) {
        var documentElement = document.documentElement;
        var element = document.createElement("DNTPDataElement");
        element.setAttribute("action", action);
        if (params) {
            element.setAttribute("param", "[\"" + params + "\"]");
        }
        element.style.display = 'none';
        documentElement.appendChild(element);

        var fn = function () {
            if (callback)
                callback(element.innerHTML);
            element.parentNode.removeChild(element);
        };

        if (!document.addEventListener) { // IE8
            documentElement.DNTPPageEventResponse = 0;
            var listener = function(event){
                if (event.propertyName === 'DNTPPageEventResponse') {
                    documentElement.detachEvent('onpropertychange', listener);
                    setTimeout(fn, 0);
                }
            };
            documentElement.attachEvent('onpropertychange', listener);
            var triggerEvent = function (retry) {
                var triggerElement = document.getElementById('DNTPPageEvent');
                if (!triggerElement) {
                    if (retry < 40)
                        setTimeout(function(){triggerEvent(retry+1)}, 50);
                    return;
                }
                triggerElement.setAttribute('element', element);
                triggerElement.click();
            };
            triggerEvent(0);
        } else {
            if (document.all) { // IE9
                element.onclick = fn;
                var evt = document.createEvent("CustomEvent");
                evt.initCustomEvent("DNTPPageEvent", true, true, null);
            } else { // all other browsers
                element.addEventListener('click', fn, true);
                var evt = document.createEvent("Events");
                evt.initEvent("DNTPPageEvent", true, false);
            }
            setTimeout(function () {
                element.dispatchEvent(evt);
            }, 50);
        }
    }

    function iconChange(e) {
        e = e || event;
        var target = e.target || e.srcElement;
        var data = target.innerHTML;

        var timer = setInterval(function () {
            try {
                if (typeof dntPageEvents == "function") {
                    clearInterval(timer);
                    dntPageEvents(data);
                }
            }catch (e) { }
        }, 50);
    }

    var listener = document.createElement('div');
    listener.setAttribute('id', 'zaIconChangeListener');
    listener.setAttribute('dntpIgnore', 'true');
    listener.style.display = 'none';
    document.documentElement.appendChild(listener);

    if (listener.addEventListener)
        listener.addEventListener('click', iconChange, true);
    else if (listener.attachEvent)
        listener.attachEvent('onclick', iconChange);

    window.dntToolbarClicked = function (pos) {
        sendPageEvent('toolbarClicked', pos);
        sendPageEvent('refreshIcon');
    };

    window.dntUpdateIcon = function () {
        sendPageEvent('refreshIcon');
    };

    sendPageEvent('refreshIcon');

})();
