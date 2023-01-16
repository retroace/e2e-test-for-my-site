import { Children } from "react"
import { BROWSER_INPUT_EVENTS } from "../../index.d"
import { CondensedCyFormat, GeneratorFormat } from "./condensor"

const getXHRRequest = (item) => {
    const url = item.value[0]?.url
    const alias = item.value[0]?.finishedTime

    return `cy.intercept("${item.selector}", "${url}").as('alias${alias}')`
}

interface CodeAst {
    code: string,
    children?: Array<CodeAst>,
    scopeVar?: string
}

function generateParsedResponseCode(parsedResponse: null | { [key: string]: any }, keySuffix: string): CodeAst {
    if (parsedResponse === null) return { code: '' }

    if (typeof parsedResponse === 'object' && !Array.isArray(parsedResponse)) {
        return {
            code: `expect(${keySuffix}).to.be.an('object')`,
            children: Object.keys(parsedResponse).map(key => generateParsedResponseCode(parsedResponse[key], `${keySuffix}.${key}`))
        }
    }

    if (Array.isArray(parsedResponse)) {
        return { code: `expect(${keySuffix}).to.be.an('array')` }
    }

    return { code: `expect(${keySuffix}).to.be.an('${typeof parsedResponse}')` }
}


const getXHRResponse = (item: CondensedCyFormat) => {
    const url = item.value[0]?.url
    const alias = item.value[0]?.finishedTime

    return `cy.wait('@alias${alias}').should((first) => {
        ${assertOnResponse(item, 'first')}
    })`
}

const getXhrVarName = (url: string) => {
    var re = new RegExp('-|_', 'g');
    let seg = url.split("?")[0].toLowerCase().replace(re, '').split('/')
    seg = seg.length ? seg : ['index']

    return seg.slice(seg.length - 2).join('')
}

const assertOnResponse = (item: CondensedCyFormat, scopeName: string, reqAlias?: string, resAlias?: string): CodeAst[] => {
    let parsedResponse = item.value[0].resBody
    let request = reqAlias ? reqAlias : 'request'
    let response = resAlias ? resAlias : 'response'
    try {
        parsedResponse = JSON.parse(parsedResponse)
    } catch (error) {
        parsedResponse = null
    }

    return [
        { code: `const {request: ${request}, response: ${response}} = ${scopeName}` },
        { code: `expect(${response}.statusCode).to.eq(200)` },
        { code: `expect(${response}).to.have.property('headers')` },
        generateParsedResponseCode(parsedResponse, `${response}.body`),
    ]
}

const getMultipleXhrResponse = (item: GeneratorFormat): string => {
    const aliasKeys = item.merged.map(i => i.timestamp)
    const aliasVarName = item.merged.map(i => getXhrVarName(i.value[0].url))
    const codeAsts = aliasVarName.map((key, index) => assertOnResponse(item.merged[index], String(key), `${key}Req`, `${key}Res`)).flatMap(i => i)


    const getCodeFromAst = (ast: CodeAst): string => {
        let code = ast.code
        code += ast.children ? ast.children.map(i => getCodeFromAst(i)).join('\n') : ''
        return code
    }

    return `cy.wait(['${aliasKeys.map(i => `@alias${i}`).join("','")}']).should(multipleXhr => {
        const [${aliasVarName.join(",")}] = multipleXhr
        ${codeAsts.map(i => getCodeFromAst(i)).join('\n')}
    })`
}


export const cypressCodeGenerator = (item: GeneratorFormat): { code: string, timestamp: number } => {
    let eventType = item.type
    if (item.generatorType === 'merged') return { code: getMultipleXhrResponse(item), timestamp: item.value[0].timestamp }
    let timestamp = item.timestamp
    if (eventType === 'urlchange') return { code: `cy.visit("${item.value}")`, timestamp }

    if (eventType === 'xhrrequest') return { code: getXHRRequest(item), timestamp }

    if (eventType === 'xhrresponse') return { code: getXHRResponse(item as CondensedCyFormat), timestamp }

    let selector = `cy.get("${item.selector.trim()}").`

    if (eventType === 'keyup') {
        let code = selector + item.value.reduce((carry, item) => {
            if (item.startsWith('{') && item[item.length - 1] === '}') {
                carry.push(item)
                return carry;
            }
            if (carry.length) {
                carry[carry.length - 1] += item
            } else {
                carry[0] = item
            }
            return carry
        }, []).map(i => `type("${i}")`).join('.')
        return { code, timestamp }
    }

    eventType = eventType === 'blur' && item.tagName === 'A' ? BROWSER_INPUT_EVENTS.CLICK : eventType

    if (eventType === 'change') {
        return { code: selector + item.value.map(i => `click()`).join('.'), timestamp }
    }

    if (eventType === 'blur') {
        return { code: selector + item.value.map(i => `should('have.text', '${i || ''}')`).join('.'), timestamp }
    }

    if (eventType === 'click') {
        return { code: selector + item.value.map(i => `click()`).join('.'), timestamp }
    }

    return { code: ``, timestamp }
}
