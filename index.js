#! /usr/bin/env node

import { program } from 'commander'
import { addWord } from './commands/word_exporter.js'

program
    .command('add <LEXIN_TEXT>')
    .description('Add a new word from Lexin to Notion')
    .action(addWord)

program.parse()

