export function getSelectorForElement(el: Element): string {
    const selector = extractAllSelectorsToParent(el, [])

    return getUniqueSelectors(selector)
}


interface ELEMENT_SELECTORS {
    tagName: string,
    class: string,
    id: string,
    dataCy: string,
    dataTest: string,
    dataTestId: string,
}

function extractAllSelectorsToParent(el: Element, selectors: ELEMENT_SELECTORS[]) {
    if(el.tagName === 'BODY') return selectors
    const data: ELEMENT_SELECTORS = {
        tagName: el.tagName,
        class: el.className,
        id: el.id,
        dataCy: el.hasAttribute('data-cy') ? el.getAttribute('data-cy'): '',
        dataTest: el.hasAttribute('data-test') ? el.getAttribute('data-test'): '',
        dataTestId: el.hasAttribute('data-testid') ? el.getAttribute('data-testid'): '',
    }

    return extractAllSelectorsToParent(el.parentElement, [...selectors, data])
}

// Automatically follows best practice from cypress
// https://docs.cypress.io/guides/references/best-practices#How-It-Works
function getUniqueSelectors(selectors: ELEMENT_SELECTORS[]): string {
    let xpath = ''
    for(const selector of selectors) {
        xpath += ' '
        if(selector.dataCy && selector.dataCy.length) {
            xpath += `[data-cy=${selector.dataCy}]`
            break;
        }

        if(selector.dataTest && selector.dataTest.length) {
            xpath += `[data-test=${selector.dataTest}]`
            break;
        }

        if(selector.dataTestId && selector.dataTestId.length) {
            xpath += `[data-testid=${selector.dataTestId}]`
            break;
        }
        if(selector.id && selector.id.length) {
            xpath += `#${selector.id}`
            break;
        }
        let tagName = String(selector.tagName).toLocaleLowerCase()
        if(selector.class && selector.class.length) {
            xpath += `${tagName}.${selector.class.split(" ").join('.')}`
            continue;
        }

        xpath += tagName
    }
    return xpath; 
}