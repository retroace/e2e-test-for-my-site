function parseJson(data: string) {
    try {
        return JSON.parse(data)
    } catch (error) {
        return null
    }
}

function flattenObject(ob) {
    var toReturn = {};

    for (var i in ob) {
        if (!ob.hasOwnProperty(i)) continue;

        if ((typeof ob[i]) == 'object' && ob[i] !== null) {
            var flatObject = flattenObject(ob[i]);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;

                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
}

export function analyzeXhrEvent(resBody: string) {
    const data = parseJson(resBody)
    if(!data) return null
    console.log(`converting`, data)
    const simpleForm = reduceToSimpleForm(data)
    const assertions = xhrAssertions(simpleForm)

    console.log(`assertions`,assertions)
}

function xhrAssertions(data: any) {
    if(data === null || data === undefined) return data
    if(typeof data === 'string') return findElementWithText(data)

    if(typeof data === 'object') {
        Object.keys(data).forEach(item => {
            data[item] = xhrAssertions(data[item])
        })
        return data
    }

    return data
}


function reduceToSimpleForm(data: any) {
    if(data === null || data === undefined) return data
    
    if(typeof data === 'string') return data

    if(Array.isArray(data)) {
        if(data.length < 2) return data
        if(
            typeof data[0] === 'object' && !Array.isArray(data[0]) &&
            typeof data[1] === 'object' && !Array.isArray(data[1])
        ) {
            const keys1 = Object.keys(data[0]) 
            const keys2 = Object.keys(data[1])
            if(keys1.length === keys2.length) {
                if(keys1.filter(key => keys2.includes(key)).length === keys1.length) {
                    return [ reduceToSimpleForm(data[0]) ];
                }
                Object.keys(data).forEach(item => {
                    data[item] = reduceToSimpleForm(data[item])
                })
                return data
            }
        }
        return data
    }

    if(typeof data === 'object') {
        Object.keys(data).forEach(item => {
            data[item] = reduceToSimpleForm(data[item])
        })
        return data
    }

    return data;
}


function findElementWithText(searchText: string) {
    console.log(`findElementWithText`, searchText)
    let xpath = `//*[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "${searchText.trim().toLowerCase()}")]`;
    const searchedEls = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
    let els = []
    let node;
    while (node = searchedEls.iterateNext()) {
        els.push(node);
    }
    return els.length ? els : null
}