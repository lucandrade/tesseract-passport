# Tesseract OCR Passport

Class that analyze the passport url image and return the info.

## Installation

Execute `npm install`
> Perhaps you need to follow those [Steps](https://github.com/Automattic/node-canvas/wiki/Installation---OSX) to complete installation

## Running

Execute `npm start {url}` to analyze a url

Sample output:
```
{ surname: 'MUSTERHANN',
  given: 'ERIKA',
  nationality: 'DEUTSCH',
  birthDate: 1964-08-12T03:00:00.000Z,
  genre: 'female',
  birthPlace: 'BERLIN',
  issueDate: 2007-11-01T02:00:00.000Z,
  expirationDate: 2017-10-31T02:00:00.000Z,
  authority: 'STADT KULN',
  type: 'p',
  countryCode: 'D',
  number: 'CU’I X0006H' }
```
