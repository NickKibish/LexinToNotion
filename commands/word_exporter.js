import { parse } from "./parser.js";
import * as notion from "./notion_body.js"
import * as notionElements from "./notion_elements.js"

import { Client } from "@notionhq/client"
import dotenv from "dotenv"

dotenv.config()

const notionClient = new Client({ auth: process.env.NOTION_KEY })
const databaseId = process.env.NOTION_DATABASE_ID

// Capitalize first letter of word.word
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

async function addItem(obj) {
    try {
        const response = await notionClient.pages.create(obj)
        console.log(response)
        console.log("Success! Entry added.")
    } catch (error) {
        console.error(error.body)
    }
}  

export function addWord(multilineText) {
    let word = parse(multilineText)
    
    const object = notion.newObject(word.word.capitalize(), databaseId)
    .map( (object) => notion.setTranslations(object, word.translation) )
    .map( (object) => notion.setForms(object, word.forms) )
    .map( (object) => notion.setOrdklassen(object, word.languagePart) )
    .map( (object) => notion.setTranskription(object, word.transcription) )
    .map( (object) => notion.setDefinitionEN(object, word.definition.en !== undefined ? word.definition.en : "") )
    .map( (object) => notion.setDefinitionNO(object, word.definition.no) )
    // Body
    .map( (object) => notion.setBodyTitle(object, word.word) )
    .map( (object) => notion.setBodyTranscription(object, word.transcription) )
    .map( (object) => notionElements.addDivider(object) )
    .map( (object) => notionElements.addHeader1(object, "English 🇺🇸") )
    .map( (object) => notion.addBodyTranslation(object, word.translation) )
    .map( (object) => notionElements.addDivider(object) )
    .map( (object) => notionElements.addHeader1(object, "Bøyning 🤲") )
    .map( (object) => notion.addBodyForms(object, word.forms) )
    .map( (object) => notionElements.addDivider(object) )
    .map( (object) => notionElements.addHeader1(object, "Forklåring 📖") )
    .map( (object) => notion.addBodyDefinition(object, word.definition) )
    .map( (object) => notionElements.addEnNoTable(object, word.examples, "Eksempel 📝") )
    // Sammensetning
    .map( (object) => notionElements.addEnNoTable(object, word.composition, "Sammensetning 🎊") )
    // Uttrykk
    .map( (object) => notionElements.addEnNoTable(object, word.expressions, "Uttrykk 📚") )
    
    addItem(object)
}