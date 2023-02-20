export function addEmptyParagraph(object) {
    object.children.push({
      "object": "block",
      "type": "paragraph",
      "paragraph": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": ""
            }
          }
        ]
      }
    })
    return object
  }
  
  export function addDivider(object) {
    object.children.push({
      "object": "block",
      "type": "divider",
      "divider": {}
    })
    return object
  }
  
  export function addHeader1(object, title) {
    object.children.push({
      "object": "block",
      "type": "heading_1",
      "heading_1": createReachText(title)
    })
    return object
  }
  
  export function createReachText(content) {
    return {
      "rich_text": [
        {
          "type": "text",
          "text": {
            "content": content
          }
        }
      ]
    }
  }
  
  export function createTextParagraph(text) {
    return {
      "object": "block",
      "type": "paragraph",
      "paragraph": createReachText(text)
    }
  }
  
  export function createColumn(objects) {
    return {
      "object": "block",
      "type": "column",
      "column": {
        "children": objects
      }
    }
  }
  
  export function createBulletListItem(text) {
    return {
      object: "block",
      "type": "bulleted_list_item",
      "bulleted_list_item": createReachText(text)
    }
  }
  
  export function createPlainText(text) {
    return {
      "type": "text",
      "text": {
        "content": text
      },
      plain_text: text
    }
  }
  
  export function createTable(rows, table_width) {
    return {
      "object": "block",
      "type": "table",
      "table": {
        "table_width": table_width,
        "has_column_header": false,
        "has_row_header": false,
        "children": rows
      },
    }
  }
  
  export function createTableRow(objects) {
    return {
      "type": "table_row",
      "table_row": {
        "cells": objects
      }
    }
  }
  
  export function addEnNoTable(object, dictionary, title) {
    if (dictionary === undefined) { return object }
    if (dictionary.length == 0) { return object }
  
    object = object
      .map( (object) => addDivider(object) )
      .map( (object) => addHeader1(object, title) )
  
    const tableTitles = createTableRow( ["🇳🇴 Norsk", "🇺🇸 Engelsk"].map( (item) => [createPlainText(item)] ) )
    
    const exampleRows = dictionary.map( (item) => {
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