export function getSelectorForElement(el: Element): {default: string, all: string[]} {
    const selector = extractAllSelectorsToParent(el, [])

    return {
        default: getUniqueSelectors(selector),
        all: selector,
    }
}


interface ELEMENT_SELECTORS {
    tagName: string,
    class: string,
    id: string,
    dataCy: string,
    dataTest: string,
    dataTestId: string,
    index: number,
}

function extractAllSelectorsToParent(el: Element, selectors: ELEMENT_SELECTORS[]) {
    if(el === null || el.tagName === 'BODY') return selectors
    const currentSelectorIndex = Array.from(el?.parentNode?.children || []).indexOf(el) + 1
    const data: ELEMENT_SELECTORS = {
        index: currentSelectorIndex,
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
    let xpath = []
    for(const selector of selectors) {
        if(selector.dataCy && selector.dataCy.length) {
            xpath.push(`[data-cy=${selector.dataCy}]`)
            break;
        }

        if(selector.dataTest && selector.dataTest.length) {
            xpath.push(`[data-test=${selector.dataTest}]`)
            break;
        }

        if(selector.dataTestId && selector.dataTestId.length) {
            xpath.push(`[data-testid=${selector.dataTestId}]`)
            break;
        }
        if(selector.id && selector.id.length) {
            xpath.push(`#${selector.id}`)
            break;
        }
        let tagName = String(selector.tagName).toLocaleLowerCase()
        if(selector.class && selector.class.length) {
            xpath.push(`${tagName}:nth-child(${selector.index})`)
            continue;
        }

        xpath.push(tagName)
    }
    return xpath.reverse().join(' '); 
}