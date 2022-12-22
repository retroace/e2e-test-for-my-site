import { BROWSER_INPUT_EVENTS, MESSAGE_MODAL, XHR_MESSAGE_MODAL } from "../index.d";

(() => {
    var XHR = XMLHttpRequest.prototype;

    var open = XHR.open;
    var send = XHR.send;
    var setRequestHeader = XHR.setRequestHeader;
    
    XHR.open = function (method, url) {
        this._method = method;
        this._url = url;
        this._requestHeaders = {};
        this._startTime = +(new Date())
        
        return open.apply(this, arguments);
    };
    
    XHR.setRequestHeader = function (header, value) {
        this._requestHeaders[header] = value;
        return setRequestHeader.apply(this, arguments);
    };
    
    XMLHttpRequest.prototype.send = function (postData: any) {
        this.addEventListener('load', function (e) {
            const data: MESSAGE_MODAL = {
                action: BROWSER_INPUT_EVENTS.XHR,
                type: 'xhr',
                url: location.href,
                value: '',
                info: {
                    url: this._url,
                    method: this._method,
                    reqHeader: this._requestHeaders,
                    reqBody: postData,
                    resBody: String(e.target.responseText).substring(0, 500000),
                } as XHR_MESSAGE_MODAL,
                timestamp: this._startTime,
            }

            window.dispatchEvent(new CustomEvent('testmysitexhr', { detail: data }))
        })
        return send.apply(this, arguments);
    }
    
})()
