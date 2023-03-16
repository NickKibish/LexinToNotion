const ICON_SEPARATOR = "Ikon for å spille av talesyntese"
const DEFINITION_SEPARATOR = "Bokmålforklaring"
const FORM_SEPARATOR = "Bokmålbøyning"
const EXAMPLE_SEPARATOR = "Bokmåleksempel"
const COMPOSITION_SEPARATOR = "Bokmålsammensetning"
const EXPRESSIONS_SEPARATOR = "Bokmåluttrykk"
const WORD_IDENTIFIER = "Bokmåloppslagsord"

function findWord(multilineText) {
    var lines = multilineText.split("\n");
    // find first line that ends with "Ikon for å spille av talesyntese"
    while (lines.length > 0 && lines[0] != WORD_IDENTIFIER) {
        lines.shift()
    }

    if (lines.length == 0) {
        return undefined
    }

    if (lines[0] == WORD_IDENTIFIER) {
        lines.shift()
    }

    var word = lines.shift()

    // remove icon separator
    if (word.endsWith(ICON_SEPARATOR)) {
        word = word.slice(0, -ICON_SEPARATOR.length).trim()
    }
    // Transcription
    const transcription = lines.shift().trim()
    let languagePart = lines.shift().trim()
    if (languagePart.endsWith(ICON_SEPARATOR)) {
        languagePart = languagePart.slice(0, -ICON_SEPARATOR.length).trim()
    }
    lines.shift()
    // Translation
    // split first lines by coma
    const translationString = lines.shift().split(";")
    const translation = translationString.map( (item) => item.split(",") )
    
    return {
        map(callback) {
            callback(this)
            return this
        },
        "word": word,
        "transcription": transcription,
        "translation": translation,
        "languagePart": languagePart
    }
}

function findForms(obj, multilineText) {
    var lines = multilineText.split("\n")
    while (lines.length > 0 && !lines[0].endsWith(FORM_SEPARATOR)) {
        lines.shift()
    }
    if (lines.length == 0) {
        return obj 
    }
    lines.shift()
    
    var formLine = lines.shift()
    if (formLine.endsWith(ICON_SEPARATOR)) {
        formLine = formLine.slice(0, -ICON_SEPARATOR.length).trim()
    }
    
    // Find all matches in formLine using regex "[-\p{L}]+(?:\s*\([^)]*\))*"
    const regex = /[-\p{L}]+(?:\s*\([^)]*\))*/gu
    const forms = []
    let match
    while ((match = regex.exec(formLine)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (match.index === regex.lastIndex) {
            regex.lastIndex++
        }
        // The result can be accessed through the `m`-variable.
        match.forEach((match) => {
            if (match.length > 0) {
                forms.push(match)
            }
        })
    }
    
    // if first element is "et", "en" or "ei" concat with next element and add space between
    if (forms[0] == "et" || forms[0] == "en" || forms[0] == "ei" || forms[0] == "å") {
        forms[1] = forms[0] + " " + forms[1]
        forms.shift()
    }
    
    for (let i = 1; i < forms.length; i++) {
        if (forms[i] == "har") {
            forms[i] = "har " + forms[i+1]
            // Delet next element
            forms.splice(i+1, 1)
            break 
        }
    }
    
    obj.forms = forms
    return obj
}

function findDefinition(obj, multilineText) {
    var lines = multilineText.split("\n")
    while (lines.length > 0 && !lines[0].endsWith(DEFINITION_SEPARATOR)) {
        lines.shift()
    }
    if (lines.length == 0) {
        return obj 
    }
    lines.shift()
    
    var bokmol_def = lines.shift()
    if (bokmol_def.endsWith(ICON_SEPARATOR)) {
        bokmol_def = bokmol_def.slice(0, -ICON_SEPARATOR.length).trim()
    }
    var engelsk_def = ""
    if (lines[0].trim() == "Engelsk") {
        lines.shift()
        engelsk_def = lines.shift().trim()
    }
    
    var def = {
        "no": bokmol_def,
    }
    
    if (engelsk_def.length > 0) {
        def["en"] = engelsk_def
    }
    
    obj.definition = def
    
    return obj
}

function findSection(separator, multilineText) {
    var lines = multilineText.split("\n")
    while (!(lines[0].toLowerCase().includes(separator.toLowerCase()))) {
        lines.shift()
        if (lines.length == 0) {
            return []
        }
    }
    
    const b_sep = "Bokmål"
    const e_sep = "Engelsk"
    
    lines[0] = b_sep
    const examlpes = []
    while (lines.length > 3 && lines.shift() == b_sep) {
        
        var b = lines.shift()
        if (b.endsWith(ICON_SEPARATOR)) {
            b = b.slice(0, -ICON_SEPARATOR.length).trim()
        }
        lines.shift()
        const e = lines.shift()
        
        examlpes.push({
            "en": e,
            "no": b
        })
    }
    
    return examlpes
}

function findExamples(obj, multilineText) {
    let examples = findSection(EXAMPLE_SEPARATOR, multilineText)
    
    obj.examples = examples
    return obj
}

function findComposition(obj, multilineText) {
    let composition = findSection(COMPOSITION_SEPARATOR, multilineText)
    
    obj.composition = composition
    return obj
}

function findExpressions(obj, multilineText) {
    let expressions = findSection(EXPRESSIONS_SEPARATOR, multilineText)
    
    obj.expressions = expressions
    return obj
}

export function parse(text) {
    var word = findWord(text)
    if (word == undefined) {
        return undefined
    }
    return word 
        .map ( (word) => findForms(word, text) )
        .map ( (word) => findDefinition(word, text) )
        .map ( (word) => findExamples(word, text) )
        .map ( (word) => findComposition(word, text) )
        .map ( (word) => findExpressions(word, text) )
}