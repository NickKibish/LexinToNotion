import {createBulletListItem, createPlainText, createColumn, createTable, createTableRow } from "./notion_elements.js"
// OBJECT
export function newObject(title, databaseId) {
    return {
      map(callback) {
        callback(this)
        return this
      },
      
      parent: { database_id: databaseId },
      properties: {
        title: {
          title:[
            {
              "text": {
                "content": title
              }
            }
          ]
        }
      },
      children: []
    }
  }
  

// PROPERTIES
export function setTranslations(object, translations) {
    const english_string = translations.map( (item) => item.join(", ") ).join("; ")
    object.properties["🇺🇸 Engelsk"] = {
      "rich_text": [
        {
          "text": {
            "content": english_string
          }
        }
      ]
    }
    return object
  }
  
  export function setForms(object, forms) {
    object.properties["🤲 Bøyning"] = {
      "rich_text": [
        {
          "text": {
            "content": forms.join("; ")
          }
        }
      ]
    }
    return object
  }
  
  export function setOrdklassen(object, ordklassen) {
    object.properties["Ordklassen"] = {
      "select": {
        "name": ordklassen
      }
    }
    return object
  }
  
  export function setTranskription(object, transkription) {
    object.properties["Transkripsjon"] = {
      "rich_text": [
        {
          "text": {
            "content": transkription
          },
          "annotations": {
            "code": true
          }
        }
      ]
    }
    return object
  }
  
  export function setDefinitionEN(object, definition) {
    object.properties["📖 Forklåring (🇺🇸)"] = {
      "rich_text": [
        {
          "text": {
            "content": definition
          }
        }
      ]
    }
    return object
  }
  
  export function setDefinitionNO(object, definition) {
    object.properties["📖 Forklåring (🇳🇴)"] = {
      "rich_text": [
        {
          "text": {
            "content": definition
          }
        }
      ]
    }
    return object
  }
  
  // BODY
  export function setBodyTitle(object, title) {
    object.children.push({
      object: "block",
      type: "heading_2",
      "heading_2": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": title
            }
          }
        ]
      }
    })
    return object
  }
  
  export function setBodyTranscription(object, transcription) {
    object.children.push({
      "object": "block",
      "type": "paragraph",
      "paragraph": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": transcription,
              "link": null
            },
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": true,
              "color": "default"
            }
          }
        ]
      }
    })
    return object
  }
  
  export function addBodyTranslation(object, translations) {
    function toBulletList(items) {
      return items.map( (item) => createBulletListItem(item) )
    }
    
    if (translations.length > 1) {
      object.children.push({
        "object": "block",
        "type": "column_list",
        "column_list": {
          "children": translations.map( (item) => createColumn(toBulletList(item)) )
        }
      })
    } else {
      toBulletList(translations[0]).forEach(element => {
        object.children.push(element)
      });
    }
    
    return object
  }
  
  export function addBodyForms(object, forms) {
    const textObjects = forms.map( (item) => [createPlainText(item)] )
    const row = createTableRow(textObjects)
    object.children.push(createTable([row], forms.length))
    return object
  }
  
  export function addBodyDefinition(object, definition) {
    var tableTitles = []
    var definitions = []
    if (definition.no) {
      tableTitles.push([createPlainText("🇳🇴 Norsk")])
      definitions.push([createPlainText(definition.no)])
    }
    if (definition.en) {
      tableTitles.push([createPlainText("🇺🇸 Engelsk")])
      definitions.push([createPlainText(definition.en)])
    }
  
    const titleRow = createTableRow(tableTitles)
    const definitionRow = createTableRow(definitions)
  
    object.children.push(
      createTable([titleRow, definitionRow], tableTitles.length)
    )
    return object
  }
  
  export function addBodyExample(object, example) {
    if (example === undefined) { return object }
  
    object = object
      .map( (object) => addDivider(object) )
      .map( (object) => addHeader1(object, "Eksempel 📝") )
  
    const tableTitles = createTableRow( ["🇳🇴 Norsk", "🇺🇸 Engelsk"].map( (item) => [createPlainText(item)] ) )
    
    const exampleRows = example.map( (item) => {
      return createTableRow(
        [
          [createPlainText(item.no)],
          [createPlainText(item.en)]
        ]
      )
    })
  
    object.children.push(
      createTable([tableTitles, ...exampleRows], 2)
    )
  
    return object
  }
  